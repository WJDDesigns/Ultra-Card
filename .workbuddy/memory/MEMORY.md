# Ultra Card 项目长期笔记

## 翻译体系

- 翻译文件在 `src/translations/`，`en.json` 为基准；`<lang>.meta.json` 是 AI 翻译的 sidecar（`aiTranslatedKeys`），目前没有任何脚本读取它，只是给 `translate-locale.js` 增量填充用。
- `prepare-build.js`（prebuild）会自动把 en.json 的键回填到各语言文件，缺键不会导致构建失败。
- `localize.ts` 的 `resolveLoaderKey` 会剥掉区域后缀，所以只需提供基础语言文件（`zh.json` 即可覆盖 HA 上报的 `zh-Hans`）。
- 相关脚本：`validate-translations.js`（键集合比对，**extra 键不判失败**）、`translation-coverage.js`（生成 `scripts/translation-coverage-report.json`，该文件在 .gitignore 中）、`prune-stale-translations.js`。
- `scripts/translate-locale.js` 依赖 `OPENAI_API_KEY`，本项目环境没有该密钥，无法用它做机翻。

## 已知现状

- 除 `zh` 外，所有既有语言文件都有 35 个 stale extra 键（如 `editor.builder.*`、`editor.layout.yaml_*`），跑 `validate:translations` 会打印但退出码为 0。
- 仓库没有 `translation-coverage-baseline.json`，`--check` 会打印警告后跳过。
- 仓库规模较大，`npx tsc --noEmit` 需要数分钟；`src/types.ts` 超过 30 万字节。

## Git

- 远端是个人 fork：`https://git.ibean.eu.org/hellogit/https://github.com/IBeanCN/Ultra-Card.git`（origin），分支 `main`，上游是 WJDDesigns/Ultra-Card。
