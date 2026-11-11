#!/usr/bin/env node
// 마크다운 문서를 Markdown Preview Enhanced(MPE)와 같은 crossnote 엔진으로 PDF로 내보낸다.
// 사용법: node render.mjs --modules <crossnote 설치 폴더> [--chrome <Chrome 경로>] <md 파일>...
// - PDF는 md 파일과 같은 폴더에 같은 이름으로 저장하며, 이미 있으면 덮어쓴다.
// - 전역 설정(~/.local/state/crossnote 또는 ~/.crossnote)의 style.less 등을 MPE와 똑같이 적용한다.
// - --check 를 주면 렌더링하지 않고 MPE 번들 crossnote 버전과 설치된 버전만 비교한다.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

function parseArgs(argv) {
  const opts = { modules: process.env.CLAUDE_PLUGIN_DATA, chrome: undefined, check: false, files: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--modules') opts.modules = argv[++i];
    else if (a === '--chrome') opts.chrome = argv[++i];
    else if (a === '--check') opts.check = true;
    else opts.files.push(a);
  }
  return opts;
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  return 0;
}

// VS Code에 설치된 MPE 가운데 가장 높은 버전이 번들한 crossnote 버전.
// 로컬 VS Code, Insiders, 원격(SSH, WSL) 서버의 확장 폴더를 모두 찾는다.
function mpeCrossnoteVersion() {
  const home = os.homedir();
  const extDirs = ['.vscode', '.vscode-insiders', '.vscode-server', '.vscode-server-insiders']
    .map((d) => path.join(home, d, 'extensions'))
    .filter((d) => fs.existsSync(d));
  const found = [];
  for (const extDir of extDirs) {
    for (const d of fs.readdirSync(extDir)) {
      if (d.startsWith('shd101wyy.markdown-preview-enhanced-')) found.push(path.join(extDir, d));
    }
  }
  if (found.length === 0) return null;
  const ver = (dir) => path.basename(dir).replace('shd101wyy.markdown-preview-enhanced-', '').split('-')[0];
  found.sort((x, y) => compareVersions(ver(x), ver(y)));
  const pkg = JSON.parse(fs.readFileSync(path.join(found.at(-1), 'package.json'), 'utf8'));
  const v = (pkg.dependencies && pkg.dependencies.crossnote) || null;
  return v ? v.replace(/^[^\d]*/, '') : null;
}

function installedCrossnoteVersion(modulesDir) {
  const p = path.join(modulesDir, 'node_modules', 'crossnote', 'package.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).version : null;
}

function globalConfigDir() {
  const candidates = [path.join(os.homedir(), '.local', 'state', 'crossnote'), path.join(os.homedir(), '.crossnote')];
  return candidates.find((d) => fs.existsSync(d)) || candidates[0];
}

function findChrome(explicit) {
  const pf = process.env.PROGRAMFILES || 'C:\\Program Files';
  const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
  const local = process.env.LOCALAPPDATA || '';
  const candidates = [
    explicit,
    process.env.CHROME_PATH,
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    // Windows
    path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    local && path.join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
    '/snap/bin/chromium',
  ].filter(Boolean);
  return candidates.find((c) => fs.existsSync(c)) || null;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.modules) {
    console.error('render: crossnote 설치 폴더를 --modules 로 지정한다.');
    process.exit(2);
  }
  const want = mpeCrossnoteVersion();
  const have = installedCrossnoteVersion(opts.modules);
  if (opts.check) {
    console.log(JSON.stringify({ mpe: want, installed: have, match: !!want && want === have }));
    return;
  }
  if (!have) {
    console.error(`render: ${opts.modules} 에 crossnote가 없다. npm install --prefix "${opts.modules}" crossnote@${want || 'latest'}`);
    process.exit(2);
  }
  if (want && want !== have) {
    console.error(`render: MPE의 crossnote(${want})와 설치된 crossnote(${have})의 버전이 다르다. npm install --prefix "${opts.modules}" crossnote@${want}`);
    process.exit(2);
  }
  if (opts.files.length === 0) {
    console.error('render: PDF로 내보낼 md 파일을 지정한다.');
    process.exit(2);
  }
  const chromePath = findChrome(opts.chrome);
  if (!chromePath) {
    console.error('render: Chrome 또는 Edge를 찾지 못했다. --chrome 으로 경로를 지정한다.');
    process.exit(2);
  }

  const require = createRequire(path.join(opts.modules, 'package.json'));
  const { Notebook, loadConfigsInDirectory, wrapNodeFSAsApi } = require('crossnote');
  const globalCfg = await loadConfigsInDirectory(globalConfigDir(), wrapNodeFSAsApi(), false);

  for (const f of opts.files) {
    const file = path.resolve(f);
    const notebook = await Notebook.init({
      notebookPath: path.dirname(file),
      config: {
        ...globalCfg,
        previewTheme: 'github-light.css',
        codeBlockTheme: 'github.css',
        breakOnSingleNewLine: false,
        mathInlineDelimiters: [['$', '$']],
        mathBlockDelimiters: [['$$', '$$']],
        chromePath,
      },
    });
    const engine = notebook.getNoteMarkdownEngine(file);
    const out = await engine.chromeExport({ fileType: 'pdf', runAllCodeChunks: true, openFileAfterGeneration: false });
    console.log(out);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
