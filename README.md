# ai-toolkit-archive

| 항목 | 내용 |
| :---: | :--- |
| **작성일** | 2026-10-31 |
| **실행 환경** | Claude Code |

> Claude Code에서 쓰는 skill과 작업 자료를 플러그인 마켓플레이스로 관리하는 저장소다.

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
    ├── writing/                    # 한국어 작문
    │   ├── .claude-plugin/plugin.json
    │   └── skills/
    │       └── writing-in-korean/
    │           ├── SKILL.md
    │           └── references/korean-writing-guide.md
    └── design/                     # 마크다운 노트 형식, 도식 생성, 문서 변환
        ├── .claude-plugin/plugin.json
        └── skills/
            ├── formatting-md-notes/
            │   ├── SKILL.md
            │   └── references/md-note-format.md
            └── drawing-figures/
                ├── SKILL.md
                └── references/figure-style.md
```

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
