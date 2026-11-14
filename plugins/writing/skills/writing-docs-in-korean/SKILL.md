---
name: writing-docs-in-korean
description: 보고서, 노트, 명세, 제안서 같은 읽기용 한국어 문서를 쓰거나 고칠 때 사용한다. 문서의 구성을 정하고 문장, 마크다운 형식, 그림 작업을 한 절차로 진행한다.
---

# 작업 자료

아래 파일의 원문이 context에 없으면 먼저 읽는다. 요약만 있으면 없는 것으로 본다.

- `${CLAUDE_PLUGIN_ROOT}/shared/korean-structure-guide.md`: 문단, 목록, 표, 그림의 구성과 요소별 문체

# 절차

1. 문서의 목적과 독자를 확인하고, 장과 절의 개요를 정한다.
2. 절마다 내용을 문단, 목록, 표, 그림 중 무엇으로 쓸지 `korean-structure-guide.md`에 따라 정한다.
3. `writing:writing-in-korean` skill을 호출하여 문장을 쓴다.
4. 마크다운 문서이면 `design:formatting-md-as-doc` skill로 메타 정보, 목차, 표, 그림 형식을 맞춘다.
5. 그림이 필요하면 `design:drawing-figures` skill로 그린다.
6. 다 쓴 뒤 `writing:writing-in-korean` skill의 4단계에 따라 문장과 구성을 다시 확인하고 고친다. 이 확인은 4, 5단계의 형식, 그림 확인과 별도로 수행한다.
