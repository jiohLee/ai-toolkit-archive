#!/usr/bin/env node
// PDF의 페이지 수를 출력하고, 지정한 페이지를 PNG로 저장한다. Windows, Linux, macOS에서 동작한다.
// 사용법: node pdf-pages.mjs --modules <설치 폴더> <pdf 파일> <출력 폴더> [페이지 번호 목록, 예: 1,4,12]
// - 설치 폴더에는 pdfjs-dist와 @napi-rs/canvas가 있어야 한다.
// - 페이지 번호를 주지 않으면 페이지 수만 출력한다.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

function parseArgs(argv) {
  const opts = { modules: process.env.CLAUDE_PLUGIN_DATA, rest: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--modules') opts.modules = argv[++i];
    else opts.rest.push(argv[i]);
  }
  return opts;
}

async function main() {
  const { modules, rest } = parseArgs(process.argv.slice(2));
  const [pdfPath, outDir, pageList] = rest;
  if (!modules || !pdfPath || !outDir) {
    console.error('사용법: node pdf-pages.mjs --modules <설치 폴더> <pdf 파일> <출력 폴더> [1,4,12]');
    process.exit(2);
  }
  const require = createRequire(path.join(modules, 'package.json'));
  let pdfjsEntry;
  let canvasModule;
  try {
    pdfjsEntry = require.resolve('pdfjs-dist/legacy/build/pdf.mjs');
    canvasModule = require('@napi-rs/canvas');
  } catch {
    console.error(`pdf-pages: ${modules} 에 pdfjs-dist나 @napi-rs/canvas가 없다. npm install --prefix "${modules}" pdfjs-dist@6.5.438`);
    process.exit(2);
  }
  const pdfjs = await import(pathToFileURL(pdfjsEntry).href);
  const pdfjsRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(fs.readFileSync(pdfPath)),
    cMapUrl: path.join(pdfjsRoot, 'cmaps') + path.sep,
    cMapPacked: true,
    standardFontDataUrl: path.join(pdfjsRoot, 'standard_fonts') + path.sep,
  }).promise;
  console.log('pages:', doc.numPages);

  const pages = pageList ? pageList.split(',').map(Number).filter((n) => n >= 1 && n <= doc.numPages) : [];
  fs.mkdirSync(outDir, { recursive: true });
  for (const n of pages) {
    const page = await doc.getPage(n);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasModule.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    const out = path.join(outDir, `p${n}.png`);
    fs.writeFileSync(out, await canvas.encode('png'));
    console.log(out);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
