---
name: formatting-md-as-slides
description: 슬라이드(slides) 원고를 Marp용 마크다운(.md)으로 쓰거나 고칠 때 사용한다. 슬라이드 구성, 배치 클래스, 그리드와 카드, 표, 이미지, 수식, 알림, 각주 형식을 정한다. 읽기용 문서에는 쓰지 않는다.
---

# 실행 환경

- 슬라이드는 VS Code 확장 Marp for VS Code로 미리 보고 PDF로 내보낸다.
- 배치 클래스, 그리드, 카드, 알림, 각주 상자는 테마 CSS의 기능이다. 테마가 연결되지 않으면 이 기능들이 동작하지 않는다.
- 테마 CSS는 작업 영역 안에 있어야 한다. 절대 경로와 작업 영역 밖의 경로는 Marp 확장이 읽지 않는다.
- 작업 영역에 테마 CSS가 없으면 `${CLAUDE_SKILL_DIR}/references/style.css`를 작업 영역의 `.vscode/style.css`로 복사한다. 이 파일은 미리 읽지 않는다.
- 작업 영역 설정(`.vscode/settings.json`)에 아래 두 값을 넣는다.
  - `markdown.marp.themes`: 테마 파일의 경로. 작업 영역 폴더 기준의 상대 경로로 쓴다.
  - `markdown.marp.html`: `all`. 그리드의 `style` 속성에 필요하다.

```json
{
  "markdown.marp.themes": ["./.vscode/style.css"],
  "markdown.marp.html": "all"
}
```

- 머리 설정의 `theme: apple`은 테마 CSS의 `@theme apple` 이름과 같다. 다른 테마를 쓰면 그 이름으로 바꾼다.
- 화면은 980×551px(16:9)이고, 안쪽 여백은 상하좌우 80px이다. 본문 영역은 820×391px이다.

# 작업 자료

아래 파일의 원문이 context에 없으면 먼저 읽는다. 요약만 있으면 없는 것으로 본다.

- `${CLAUDE_SKILL_DIR}/references/md-slides-format-guide.md`

# 절차

1. 「실행 환경」에 따라 작업 영역의 테마 CSS와 VS Code 설정을 확인한다. 없으면 넣고, 이미 있으면 덮어쓰지 않는다.
2. 원고를 쓰기 전에 작업 자료의 형식을 확인한다.
3. 작업 자료의 형식에 맞춰 원고를 쓴다.
4. 다 쓴 뒤 목차 링크, 표 번호, 그림 번호, 각주 번호가 본문과 맞는지 확인한다.
5. 작업 자료의 「14. 렌더링 확인」에 따라 슬라이드가 넘치지 않는지 확인한다.
