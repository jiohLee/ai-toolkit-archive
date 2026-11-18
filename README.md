# ai-toolkit-archive

| 항목 | 내용 |
| :---: | :--- |
| **작성일** | 2026-10-31 |
| **실행 환경** | Claude Code |

> Claude Code에서 쓰는 skill과 작업 자료를 플러그인 마켓플레이스로 관리하는 저장소다.

#### 목차

- [1. 구성](#1-구성)
  - [1.1. skill 목록](#11-skill-목록)
- [2. 등록과 활성화](#2-등록과-활성화)
  - [2.1. 마켓플레이스 추가](#21-마켓플레이스-추가)
  - [2.2. 플러그인 설치](#22-플러그인-설치)
  - [2.3. 업데이트](#23-업데이트)

## 1. 구성

- 플러그인 구분: 다루는 대상이 같은 skill끼리 하나의 플러그인으로 구성
- skill 하나만 쓰는 자료: 그 skill 폴더의 `references/`에 저장, `${CLAUDE_SKILL_DIR}/references/<파일>`로 참조
- 플러그인 안의 여러 skill이 함께 쓰는 지침: 그 플러그인의 `shared/`에 저장, `${CLAUDE_PLUGIN_ROOT}/shared/<파일>`로 참조
- 다른 skill의 자료: 파일을 직접 읽지 않고 그 skill을 호출
- skill 이름: 동명사형(동사+ing)

```text
ai-toolkit-archive/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    ├── writing/                    # 한국어 작문, 마크다운 문서 형식, 문서 검토
    │   ├── .claude-plugin/plugin.json
    │   ├── agents/doc-reviewer.md  # 문서 검토 subagent
    │   ├── hooks/hooks.json        # 세션 시작 시 작문 가이드 주입, comments.jsonl 저장 시 validate 실행
    │   ├── scripts/
    │   │   ├── inject-writing-guide.mjs  # SessionStart hook: korean-writing-guide.md 주입
    │   │   └── review.mjs                # init, validate
    │   ├── assets/review.html      # 검토 페이지
    │   ├── shared/
    │   │   ├── korean-writing-guide.md       # 문장 규칙, 글의 종류별 문체와 마침표
    │   │   ├── korean-doc-structure-guide.md # 문서의 문단, 목록, 표, 그림 구성 규칙
    │   │   ├── md-doc-format-guide.md        # 마크다운 문서의 메타 정보, 목차, 제목, 표, 각주 형식
    │   │   ├── comments.schema.json
    │   │   └── comments-guide.md
    │   └── skills/
    │       ├── writing-docs-in-korean/
    │       │   └── SKILL.md
    │       ├── formatting-md-as-doc/
    │       │   └── SKILL.md
    │       └── applying-doc-reviewer-comments/
    │           └── SKILL.md
    └── design/                     # 문서 렌더링 스타일, 도식 디자인
        ├── .claude-plugin/plugin.json
        └── skills/
            ├── exporting-md-to-pdf/
            │   ├── SKILL.md
            │   ├── references/
            │   │   └── style.less  # Markdown Preview Enhanced 기본 스타일
            │   └── scripts/
            │       ├── render.mjs        # crossnote로 md를 PDF로 내보냄
            │       └── pdf-pages.mjs     # PDF 페이지를 PNG로 저장하여 검증
            └── drawing-figures/
                ├── SKILL.md
                └── references/figure-style-guide.md
```

### 1.1. skill 목록

<div align="center">

| 플러그인 | skill | 용도 |
| :---: | :--- | :--- |
| `writing` | `writing-docs-in-korean` | 읽기용 한국어 문서의 구성, 문장, 마크다운 형식, 그림 작업 |
| `writing` | `formatting-md-as-doc` | 읽기용 문서의 마크다운 형식 |
| `writing` | `applying-doc-reviewer-comments` | 적용으로 결정한 검토 의견의 대상 문서 반영 |
| `design` | `exporting-md-to-pdf` | MPE와 같은 스타일의 PDF 내보내기, 미리보기 환경 설정 |
| `design` | `drawing-figures` | 문서에 넣을 도식과 그래프의 스타일 |

</div>

*Table 1. 플러그인별 skill*

- 한국어 문장 규칙: skill이 아니라 `writing` 플러그인의 SessionStart hook이 적용
  - 주입 시점: 세션 시작, 재개, `/clear`, compact
  - 주입 내용: `korean-writing-guide.md` 원문
  - 효과: 대화 답변을 포함한 모든 한국어 문장에 가이드 적용, compact 뒤에도 원문 유지
- 문서 검토: skill이 아니라 `writing` 플러그인의 `doc-reviewer` subagent가 담당
  - 호출 방법: "검토해줘" 같은 요청 또는 `@doc-reviewer`
  - 기본 검토 기준: `korean-writing-guide.md`, `korean-doc-structure-guide.md`, 대상 문서가 마크다운이면 `md-doc-format-guide.md` 추가
  - 산출물: 대상 문서 옆 검토 폴더(`.{문서 이름}.review/`)의 `comments.jsonl`, `review.html`
  - `review.html`은 Chrome이나 Edge에서 열기
- `exporting-md-to-pdf`의 `style.less`: 작업 환경에 스타일이 없을 때 복사해 쓰는 기본 스타일
  - 원본: note-archive의 `99-settings/markdown-preview-enhanced/style.apple.less`
  - 원본을 고치면 이 저장소에도 복사

## 2. 등록과 활성화

### 2.1. 마켓플레이스 추가

원격 저장소에서 마켓플레이스를 추가하려면 아래와 같이 한다.

```bash
claude plugin marketplace add jiohLee/ai-toolkit-archive
```

로컬 저장소에서 추가하려면 아래와 같이 한다.

```bash
git clone git@github.com:jiohLee/ai-toolkit-archive.git <클론 경로>
claude plugin marketplace add <클론 경로>
```

### 2.2. 플러그인 설치

마켓플레이스를 추가한 뒤 플러그인을 설치하려면 아래와 같이 한다.

```bash
claude plugin install writing@ai-toolkit-archive
claude plugin install design@ai-toolkit-archive
```

### 2.3. 업데이트

원격 저장소에서 추가한 마켓플레이스를 업데이트하려면 아래와 같이 한다.

```bash
claude plugin marketplace update ai-toolkit-archive
```

로컬 저장소에서 추가한 마켓플레이스를 업데이트하려면 아래와 같이 한다.

```bash
git -C <클론 경로> pull
```
