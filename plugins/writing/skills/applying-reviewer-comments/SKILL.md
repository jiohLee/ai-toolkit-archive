---
name: applying-reviewer-comments
description: reviewer가 쓴 검토 의견(.{문서 이름}.review/comments.jsonl) 중 사용자가 적용으로 결정한 의견을 대상 문서에 반영할 때 사용한다. "의견서 반영해줘", "검토 의견 반영해줘" 같은 요청에 적용한다.
argument-hint: "{대상 문서}"
---

# 작업 자료

아래 파일의 원문이 context에 없으면 먼저 읽는다.

- `${CLAUDE_PLUGIN_ROOT}/shared/comments-schema.md`

# 요청 인자

`$ARGUMENTS`

# 절차

1. 대상 문서 옆의 검토 폴더(`.{대상 문서 이름}.review/`)에서 `comments.jsonl`을 읽는다. 찾을 수 없으면 사용자에게 묻고 멈춘다. 대상 문서는 첫 줄 개요의 `target`으로 확인한다.
2. `decision`이 `apply`이고 `status`가 `pending`인 의견을 반영 대상으로 고른다.
3. 의견과 기타 지시(`instruction`)를 보고 대상 문서를 고친다. 고치는 방법은 직접 판단한다. 해석이 모호한 기타 지시는 고치기 전에 사용자에게 확인한다.
4. 반영에 성공한 의견만 `comments.jsonl`에서 `status`를 `applied`로 바꾼다. 다른 필드와 다른 줄은 바꾸지 않는다.
5. 사용자에게 아래 내용을 보고한다.
   - 반영, 유지, 미결정, 실패 건수
   - 실패한 의견의 번호와 이유
   - 확인 방법: 검토 페이지의 "다시 읽기", `git diff`
