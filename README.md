# ai-toolkit-archive

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

1. 저장소를 프로젝트 밖의 고정된 위치에 클론한다.
2. 클론 경로를 사용자 범위의 마켓플레이스로 추가한다.

   ```bash
   claude plugin marketplace add <클론 경로>
   ```

3. 플러그인을 사용자 범위에 설치한다. Claude Code가 `~/.claude/settings.json`의 `enabledPlugins`에 자동으로 기록하므로, 모든 프로젝트에서 플러그인이 켜진다.

   ```bash
   claude plugin install writing@ai-toolkit-archive
   claude plugin install design@ai-toolkit-archive
   ```

4. 플러그인이 필요 없는 프로젝트에서는 그 프로젝트에서 플러그인을 끈다. `--scope local`은 나에게만(`.claude/settings.local.json`), `--scope project`는 함께 쓰는 사람에게도(`.claude/settings.json`) 적용된다.

   ```bash
   claude plugin disable design@ai-toolkit-archive --scope local
   ```

- skill은 `/writing:writing-in-korean`처럼 플러그인 이름을 붙여 부른다.
- Claude Code는 클론 폴더에서 플러그인을 바로 읽는다. 파일을 고치면 다음 세션이나 `/reload-plugins` 때 반영된다.
