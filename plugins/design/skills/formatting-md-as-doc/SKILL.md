---
name: formatting-md-as-doc
description: 읽기용 문서(document)를 마크다운(.md)으로 쓰거나 고칠 때 사용한다. 문서의 메타 정보, 머리말, 목차, 제목, 목록, 표, 이미지, 수식, 각주 형식을 정한다. 슬라이드 원고에는 쓰지 않는다.
---

# 실행 환경

- 문서는 VS Code 확장 Markdown Preview Enhanced(MPE)로 미리 보고 PDF로 내보낸다.
- 글꼴, 색, 모양은 MPE의 전역 스타일 파일 `style.less`가 정한다. 경로는 `~/.local/state/crossnote/style.less` 또는 `~/.crossnote/style.less`다. MPE가 쓰는 `crossnote` 폴더가 있는 쪽을 쓴다.
- 전역 `style.less`가 없거나 MPE가 만든 기본 주석만 있으면 `${CLAUDE_SKILL_DIR}/references/style.less`를 그 경로로 복사한다. 다른 내용이 있으면 덮어쓰지 않는다. 이 파일은 미리 읽지 않는다.
- 사용자 설정에 아래 두 값을 넣는다. `style.less`는 이 두 테마를 바탕으로 한다.

```json
{
  "markdown-preview-enhanced.previewTheme": "github-light.css",
  "markdown-preview-enhanced.codeBlockTheme": "github.css"
}
```

# 작업 자료

아래 파일의 원문이 context에 없으면 먼저 읽는다. 요약만 있으면 없는 것으로 본다.

- `${CLAUDE_SKILL_DIR}/references/md-doc-format-guide.md`

# 절차

1. 문서를 쓰기 전에 작업 자료의 형식을 확인한다.
2. 작업 자료의 형식에 맞춰 문서를 쓴다.
3. 다 쓴 뒤 목차, 표 번호, 그림 번호, 각주 번호가 본문과 맞는지 확인한다.
4. 미리보기나 PDF가 필요하면 「실행 환경」에 따라 전역 `style.less`와 VS Code 설정을 확인한다.
