---
name: exporting-md-to-pdf
description: 마크다운 문서(.md)를 PDF로 내보내거나 다시 렌더링할 때 사용한다. Markdown Preview Enhanced(MPE)와 같은 crossnote 엔진과 전역 style.less로 렌더링하여, md 옆에 같은 이름의 PDF로 저장한다. MPE 미리보기 환경(전역 style.less, VS Code 설정)도 이 skill이 정한다.
---

# 실행 환경

- 문서는 VS Code 확장 Markdown Preview Enhanced(MPE)로 미리 보고, MPE가 사용하는 crossnote 엔진으로 PDF를 만든다.
- 글꼴, 색, 모양은 전역 스타일 파일 `style.less`가 정한다. 경로는 `~/.local/state/crossnote/style.less` 또는 `~/.crossnote/style.less`다. `crossnote` 폴더가 있는 쪽을 사용한다.
- `${CLAUDE_SKILL_DIR}/references/style.less`(레퍼런스)가 원본이다. 전역 `style.less`가 없거나 레퍼런스와 내용이 다르면, 기존 전역 파일을 `style.less.bak`으로 백업하고 레퍼런스를 전역 경로로 복사한다. 레퍼런스는 미리 읽지 않는다.
- PDF 렌더링(`scripts/render.mjs`)은 전역 `style.less`를 읽는다. 따라서 렌더링 전에 레퍼런스가 전역에 설치되어 있어야 한다.
- VS Code 사용자 설정에 아래 두 값을 넣는다. `style.less`는 이 두 테마를 바탕으로 한다. `scripts/render.mjs`도 같은 값을 사용한다.

```json
{
  "markdown-preview-enhanced.previewTheme": "github-light.css",
  "markdown-preview-enhanced.codeBlockTheme": "github.css"
}
```

- 스크립트는 Node로 작성되어 Windows, Linux, macOS에서 같은 명령으로 실행한다.
- crossnote는 `${CLAUDE_PLUGIN_DATA}`에 설치한다. 버전은 VS Code에 설치된 MPE가 번들한 crossnote와 같아야 한다. MPE의 crossnote는 확장 안에 번들되어 있어 직접 불러 쓸 수 없다.
- PDF 검증용 페이지 추출에는 `pdfjs-dist`와 `@napi-rs/canvas`를 사용하며, 역시 `${CLAUDE_PLUGIN_DATA}`에 설치한다. `@napi-rs/canvas`는 `pdfjs-dist`의 선택적 의존성으로 함께 설치된다.
- PDF 인쇄에는 Chrome이나 Edge를 사용한다.

# 입력

- PDF로 내보낼 md 파일 경로. 여러 개를 한 번에 지정할 수 있다.

# 절차

1. 「실행 환경」에 따라 레퍼런스를 전역 `style.less`로 설치하고, VS Code 설정을 확인한다.
2. crossnote의 버전을 확인한다.

   ```bash
   node "${CLAUDE_SKILL_DIR}/scripts/render.mjs" --modules "${CLAUDE_PLUGIN_DATA}" --check
   ```

   - 출력의 `match`가 `false`이면 `mpe`에 나온 버전을 설치한다: `npm install --prefix "${CLAUDE_PLUGIN_DATA}" crossnote@<mpe 버전>`
   - 4단계에 쓰는 `pdfjs-dist`가 없으면 함께 설치한다: `npm install --prefix "${CLAUDE_PLUGIN_DATA}" pdfjs-dist@6.5.438`
   - `mpe`가 `null`이면 MPE가 설치되어 있지 않다. 사용자에게 알리고, 설치된 crossnote로 진행할지 묻는다.
3. PDF로 내보낸다. PDF는 md 옆에 같은 이름으로 저장되며, 이미 있으면 덮어쓴다.

   ```bash
   node "${CLAUDE_SKILL_DIR}/scripts/render.mjs" --modules "${CLAUDE_PLUGIN_DATA}" <md 파일>...
   ```

   - Chrome을 찾지 못하면 `--chrome <경로>`를 지정한다.
4. 출력된 PDF를 검증한다. 아래 명령으로 페이지 수를 확인하고, 첫 페이지와 표, 그림이 있는 페이지를 PNG로 저장하여 읽는다. 출력 폴더는 세션의 임시 폴더를 사용한다.

   ```bash
   node "${CLAUDE_SKILL_DIR}/scripts/pdf-pages.mjs" --modules "${CLAUDE_PLUGIN_DATA}" <pdf 파일> <출력 폴더> 1,<표 페이지>,<그림 페이지>
   ```

5. 문제를 발견하면 원인(md 형식, 그림 경로, 설정)을 고치고 3단계부터 다시 한다.

# 검증 항목

- `style.less`의 글꼴과 색이 적용되었다.
- 표가 깨지지 않았다. `<div align="center">` 안에서 표 위아래의 빈 줄이 빠지면 표가 렌더링되지 않는다.
- 그림이 모두 나온다. 상대 경로의 SVG가 빠지지 않았다.
- 목차와 각주가 출력되었다.
