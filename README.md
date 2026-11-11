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

- 다루는 대상이 같은 skill끼리 플러그인 하나로 묶는다.
- skill 하나만 쓰는 자료는 그 skill 폴더의 `references/`에 두고 `${CLAUDE_SKILL_DIR}/references/<파일>`로 가리킨다.
- 플러그인 안의 여러 skill이 함께 쓰는 지침은 그 플러그인의 `shared/`에 두고 `${CLAUDE_PLUGIN_ROOT}/shared/<파일>`로 가리킨다.
- 다른 skill의 자료가 필요하면 파일을 직접 읽지 않고 그 skill을 호출한다.
- skill 이름은 동명사형(동사+ing)으로 짓는다.

```text
ai-toolkit-archive/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    ├── writing/                    # 한국어 작문, 문서 검토
    │   ├── .claude-plugin/plugin.json
    │   ├── agents/reviewer.md      # 문서 검토 subagent
    │   ├── hooks/hooks.json        # comments.jsonl 저장 시 validate 실행
    │   ├── scripts/review.mjs      # init, validate
    │   ├── assets/review.html      # 검토 페이지
    │   ├── shared/
    │   │   ├── korean-writing-guide.md
    │   │   ├── comments.schema.json
    │   │   └── comments-schema.md
    │   └── skills/
    │       ├── writing-in-korean/
    │       │   └── SKILL.md
    │       └── applying-reviewer-comments/
    │           └── SKILL.md
    └── design/                     # 마크다운 문서와 슬라이드 형식, 도식 생성, 문서 변환
        ├── .claude-plugin/plugin.json
        └── skills/
            ├── formatting-md-as-doc/
            │   ├── SKILL.md
            │   └── references/
            │       └── md-doc-format-guide.md
            ├── exporting-md-to-pdf/
            │   ├── SKILL.md
            │   ├── references/
            │   │   └── style.less  # Markdown Preview Enhanced 기본 스타일
            │   └── scripts/
            │       ├── render.mjs        # crossnote로 md를 PDF로 내보냄
            │       └── pdf-pages.mjs     # PDF 페이지를 PNG로 저장하여 검증
            ├── formatting-md-as-slides/
            │   ├── SKILL.md
            │   └── references/
            │       ├── md-slides-format-guide.md
            │       └── style.css   # Marp 기본 테마
            └── drawing-figures/
                ├── SKILL.md
                └── references/figure-style.md
```

### 1.1. skill 목록

<div align="center">

| 플러그인 | skill | 용도 |
| :---: | :--- | :--- |
| `writing` | `writing-in-korean` | 한국어 문장을 쓰거나 고칠 때 문체, 용어, 문장 부호를 정한다. |
| `writing` | `applying-reviewer-comments` | 검토 페이지에서 적용으로 결정한 검토 의견을 대상 문서에 반영한다. |
| `design` | `formatting-md-as-doc` | 읽기용 문서의 마크다운 형식을 정한다. |
| `design` | `exporting-md-to-pdf` | 마크다운 문서를 MPE와 같은 스타일의 PDF로 내보내고, 미리보기 환경을 정한다. |
| `design` | `formatting-md-as-slides` | Marp 슬라이드 원고의 마크다운 형식을 정한다. |
| `design` | `drawing-figures` | 문서에 넣을 도식과 그래프의 스타일을 정한다. |

</div>

*Table 1. 플러그인별 skill*

- 문서 검토는 skill이 아니라 `writing` 플러그인의 `reviewer` subagent가 담당한다. "검토해줘"처럼 요청하거나 `@reviewer`로 호출한다. 기본 검토 기준은 `korean-writing-guide.md`다.
- `reviewer`는 대상 문서 옆에 검토 폴더(`.{문서 이름}.review/`)를 만들고 `comments.jsonl`과 `review.html`을 둔다. `review.html`은 Chrome이나 Edge에서 연다.

- `exporting-md-to-pdf`의 `style.less`와 `formatting-md-as-slides`의 `style.css`는 작업 환경에 스타일이 없을 때 복사해 쓰는 기본 스타일이다.
- 두 스타일의 원본은 note-archive의 `99-settings/`에 있다. 원본은 `markdown-preview-enhanced/style.apple.less`와 `marp/style.apple.css`다. 원본을 고치면 이 저장소에도 복사한다.

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
