#!/usr/bin/env node
// 문서 검토 도구의 스크립트. Node 표준 라이브러리만 사용한다.
//   init <대상 문서> [--force]  검토 폴더를 만들고 review.html을 복사한다.
//   validate [comments.jsonl]   comments.jsonl을 검사한다. 인자가 없으면 hook 입력(stdin)을 읽는다.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = path.join(PLUGIN_ROOT, 'assets', 'review.html');
const SCHEMA = path.join(PLUGIN_ROOT, 'shared', 'comments.schema.json');
const COMMENTS_FILE = 'comments.jsonl';
const EXIT_UNAPPLIED = 3;

function reviewDirOf(target) {
  const ext = path.extname(target);
  const name = path.basename(target, ext);
  return path.join(path.dirname(target), `.${name}.review`);
}

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/)
    .map((text, i) => ({ line: i + 1, text }))
    .filter((x) => x.text.trim());
}

/* ---------- init ---------- */

function init(args) {
  const force = args.includes('--force');
  const targetArg = args.find((a) => !a.startsWith('--'));
  if (!targetArg) fail('사용법: review.mjs init <대상 문서> [--force]');
  const target = path.resolve(targetArg);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) fail(`대상 문서 없음: ${target}`);

  const dir = reviewDirOf(target);
  const comments = path.join(dir, COMMENTS_FILE);

  // 결정을 저장했지만 반영하지 않은 의견이 있으면 덮어쓰지 않는다.
  if (fs.existsSync(comments) && !force) {
    let unapplied = 0;
    for (const { text } of readJsonl(comments).slice(1)) {
      try {
        const c = JSON.parse(text);
        if (c.decision === 'apply' && c.status === 'pending') unapplied++;
      } catch { /* 형식 오류 줄은 세지 않는다 */ }
    }
    if (unapplied > 0) {
      console.log(`unapplied: ${unapplied}`);
      console.log(`comments: ${comments}`);
      console.error(`반영하지 않은 결정 ${unapplied}건이 있다. 덮어쓰려면 --force로 다시 실행한다.`);
      process.exit(EXIT_UNAPPLIED);
    }
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(TEMPLATE, path.join(dir, 'review.html'));
  console.log(`dir: ${dir}`);
  console.log(`comments: ${comments}`);
  console.log(`target: ${path.relative(dir, target).split(path.sep).join('/')}`);
  console.log(`page: ${pathToFileURL(path.join(dir, 'review.html')).href}`);
}

/* ---------- validate ---------- */

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);

// 스키마에 쓴 키워드만 해석한다.
function checkSchema(value, schema, where, errors) {
  if (schema.type) {
    const t = typeOf(value);
    const types = [].concat(schema.type); // 타입 하나 또는 타입 목록
    const ok = types.includes(t) || (types.includes('number') && t === 'integer');
    if (!ok) { errors.push(`${where}: ${types.join(' 또는 ')} 필요`); return; }
  }
  if (schema.const !== undefined && value !== schema.const) errors.push(`${where}: ${JSON.stringify(schema.const)} 필요`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${where}: 허용되지 않는 값 ${JSON.stringify(value)}`);
  if (schema.minimum !== undefined && typeof value === 'number' && value < schema.minimum) errors.push(`${where}: ${schema.minimum} 이상 필요`);
  if (schema.minLength !== undefined && typeof value === 'string' && value.length < schema.minLength) errors.push(`${where}: 빈 값`);
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${where}: 항목 ${schema.minItems}개 이상 필요`);
    if (schema.items) value.forEach((v, i) => checkSchema(v, schema.items, `${where}[${i}]`, errors));
  }
  if (typeOf(value) === 'object') {
    for (const key of schema.required || []) if (!(key in value)) errors.push(`${where}: 필수 필드 없음 ${key}`);
    const props = schema.properties || {};
    for (const [key, v] of Object.entries(value)) {
      if (props[key]) checkSchema(v, props[key], `${where}.${key}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${where}: 정의되지 않은 필드 ${key}`);
    }
  }
  for (const sub of schema.allOf || []) {
    if (sub.if) {
      const probe = [];
      checkSchema(value, sub.if, where, probe);
      if (probe.length === 0 && sub.then) checkSchema(value, sub.then, where, errors);
    } else {
      checkSchema(value, sub, where, errors);
    }
  }
}

function validateFile(file) {
  const errors = [];
  const schema = JSON.parse(fs.readFileSync(SCHEMA, 'utf8'));
  const rows = readJsonl(file);
  const parsed = [];
  for (const row of rows) {
    try { parsed.push({ line: row.line, obj: JSON.parse(row.text) }); }
    catch { errors.push(`${row.line}행: JSON 형식 오류`); }
  }
  if (errors.length) return errors;
  if (!parsed.length) return ['1행: 개요 없음'];

  // 개요
  const [head, ...items] = parsed;
  const ov = head.obj;
  let targetLines = null;
  if (typeOf(ov) !== 'object' || 'id' in ov) {
    errors.push('1행: 개요({"target", "content"}) 없음');
  } else {
    for (const key of Object.keys(ov)) if (key !== 'target' && key !== 'content') errors.push(`1행: 정의되지 않은 필드 ${key}`);
    for (const key of ['target', 'content']) if (typeof ov[key] !== 'string') errors.push(`1행: 문자열 필드 없음 ${key}`);
    if (typeof ov.target === 'string') {
      const target = path.resolve(path.dirname(file), ov.target);
      if (fs.existsSync(target)) targetLines = fs.readFileSync(target, 'utf8').split(/\r?\n/);
      else errors.push(`1행: target 파일 없음 ${ov.target}`);
    }
  }

  // 의견
  const ids = new Set();
  for (const { line, obj } of items) checkSchema(obj, schema, `${line}행`, errors);
  for (const { line, obj } of items) {
    if (!Number.isInteger(obj.id)) continue;
    if (ids.has(obj.id)) errors.push(`${line}행: id 중복 ${obj.id}`);
    ids.add(obj.id);
  }

  // 줄 번호 일치는 결정이 기록되기 전(검토 직후)에만 검사한다. 반영이 시작되면 원고의 줄이 바뀌기 때문이다.
  // location이 자유 텍스트(텍스트 파일이 아닌 원고)이면 검사하지 않는다.
  const fresh = items.every(({ obj }) => obj.status === 'pending' && !('decision' in obj));
  if (targetLines && fresh) {
    for (const { line, obj } of items) {
      if (!Number.isInteger(obj.location) || obj.location < 1) continue;
      const actual = targetLines[obj.location - 1];
      if (actual === undefined) { errors.push(`${line}행: location ${obj.location}이 원고 범위 밖`); continue; }
      if (obj.result === 'edit' && Array.isArray(obj.minus) && typeof obj.minus[0] === 'string') {
        if (actual.trimEnd() !== obj.minus[0].trimEnd()) errors.push(`${line}행: 원고 ${obj.location}행과 minus 첫 줄 불일치`);
      }
      if (obj.result === 'note' && typeof obj.quote === 'string') {
        const first = obj.quote.split(/\r?\n/)[0].trim();
        if (first && !actual.includes(first)) errors.push(`${line}행: 원고 ${obj.location}행에 quote 없음`);
      }
    }
  }
  return errors;
}

function isCommentsPath(p) {
  return /[\\/]\.[^\\/]+\.review[\\/]comments\.jsonl$/.test(p);
}

// Bash, PowerShell 명령 문자열이나 도구 결과에서 comments.jsonl 경로를 찾는다.
function findCommentsPaths(text, cwd) {
  const found = new Set();
  for (let p of text.match(/[^\s"'`;|&<>()=,]*comments\.jsonl/g) || []) {
    p = p.replace(/\\\\/g, '\\');
    if (process.platform === 'win32' && /^\/[a-zA-Z]\//.test(p)) p = `${p[1]}:${p.slice(2)}`; // Git Bash 경로(/d/...)
    const abs = path.resolve(cwd || process.cwd(), p);
    if (isCommentsPath(abs) && fs.existsSync(abs)) found.add(abs);
  }
  return [...found];
}

// hook 입력에서 검사할 comments.jsonl 목록을 만든다.
function hookTargets(input) {
  const ti = input?.tool_input || {};
  if (typeof ti.file_path === 'string') return isCommentsPath(ti.file_path) ? [ti.file_path] : [];
  if (typeof ti.command === 'string') {
    const text = ti.command + '\n' + JSON.stringify(input?.tool_response ?? '');
    return findCommentsPaths(text, input?.cwd);
  }
  return [];
}

async function validate(args) {
  const hook = !args[0];
  let files = [args[0]];
  if (hook) {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    try { files = hookTargets(JSON.parse(input)); } catch { return; }
    if (!files.length) return; // 검토 폴더의 comments.jsonl이 아니면 바로 끝낸다.
  }
  let failed = false;
  for (const file of files) {
    if (!fs.existsSync(file)) fail(`파일 없음: ${file}`);
    const errors = validateFile(file);
    if (errors.length) {
      failed = true;
      console.error(`${file} 형식 오류 ${errors.length}건`);
      for (const e of errors) console.error(`- ${e}`);
    }
  }
  if (failed) process.exit(hook ? 2 : 1);
  if (!hook) console.log('ok');
}

/* ---------- main ---------- */

function fail(message) {
  console.error(message);
  process.exit(1);
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'init') init(rest);
else if (cmd === 'validate') await validate(rest);
else fail('사용법: review.mjs <init|validate> ...');
