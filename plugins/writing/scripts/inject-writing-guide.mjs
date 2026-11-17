#!/usr/bin/env node
// SessionStart hook 스크립트. 한국어 작문 가이드 원문과 적용 절차를 context에 주입한다.
// startup, resume, clear, compact 모두에서 실행되므로 compact 뒤에도 가이드 원문이 유지된다.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GUIDE = path.join(PLUGIN_ROOT, 'shared', 'korean-writing-guide.md');

const header = `[writing 플러그인] 한국어 문장 작성 규칙

대화 답변, 문서, 슬라이드, 커밋 메시지, PR, work item 등 한국어 문장을 쓰거나 고칠 때는 항상 아래 「한국어 작문 가이드」를 따른다. 인사 한 줄 같은 짧은 답변도 예외가 아니다.

1. 가이드의 「1. 기본 원칙」에 따라 글의 종류와 요소에 맞는 문체, 마침표, 용어 표기, 문장 부호를 정한다. 문체와 마침표는 1.1절의 두 표를 따른다.
2. 가이드의 「2. 문장 작성 원칙과 예시」를 지키며 문장을 쓴다.
3. 다 쓴 뒤 가이드의 원칙에 비추어 다시 확인하고 고친다.

가이드 원문(${GUIDE})은 다음과 같다.

`;

let guide;
try {
  guide = fs.readFileSync(GUIDE, 'utf8');
} catch (err) {
  console.error(`korean-writing-guide.md를 읽지 못했다: ${err.message}`);
  process.exit(1);
}

process.stdout.write(header + guide);
