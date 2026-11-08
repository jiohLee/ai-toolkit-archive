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

모델을 호출할 때마다 대화 전체를 다시 읽으므로 호출 수를 줄인다. 한 응답에서 여러 도구를 함께 호출하면 한 번의 호출로 끝난다.

1. 읽기: 대상 문서 옆의 검토 폴더(`.{대상 문서 이름}.review/`)에서 `comments.jsonl`을 읽는다. 찾을 수 없으면 사용자에게 묻고 멈춘다. 대상 문서는 첫 줄 개요의 `target`으로 확인한다. 의견을 판단하는 데 원고의 앞뒤 문맥이 필요하면 같은 응답에서 함께 읽는다.
2. 판단: `decision`이 `apply`이고 `status`가 `pending`인 의견을 반영 대상으로 고르고, 의견과 기타 지시(`instruction`)를 보고 고칠 내용을 정한다. 고치는 방법은 직접 판단한다. 해석이 모호한 기타 지시는 고치기 전에 사용자에게 확인한다.
3. 반영: 아래 두 가지를 스크립트 하나로 한 번에 실행한다.
   - 원고 수정: 바꿀 문자열이 원고에 정확히 한 번 있는지 확인하고 바꾼다. 확인에 실패한 의견은 고치지 않고 실패로 처리한다.
   - `status` 변경: 반영에 성공한 의견만 `comments.jsonl`에서 `status`를 `applied`로 바꾼다. 다른 필드와 다른 줄은 바꾸지 않는다.
4. 검사: `comments.jsonl`을 고치면 hook이 형식을 검사한다. hook이 오류를 돌려주면 `comments.jsonl`을 고쳐 다시 저장하고, 오류가 없어질 때까지 반복한다.
   - Bash나 PowerShell 명령에는 `comments.jsonl`의 경로를 직접 적는다. 경로가 명령에 없으면 hook이 검사하지 않는다.
   - Write나 Edit로 고치면 hook이 항상 검사한다.
5. 사용자에게 아래 내용을 보고한다.
   - 반영, 유지, 미결정, 실패 건수
   - 실패한 의견의 번호와 이유
   - 확인 방법: 검토 페이지의 "다시 읽기", `git diff`
