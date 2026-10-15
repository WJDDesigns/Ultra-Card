# Ultra Card

Modular Lovelace card builder for Home Assistant, distributed through HACS.
TypeScript + Lit, bundled with webpack into `ultra-card.js` plus lazy `uc-*.js` chunks.
Repo: https://github.com/WJDDesigns/Ultra-Card (default branch `main`).

## Setup

- Node `>=24.15.0` (see `.nvmrc`; CI uses Node 24). jsdom 30 in the test suite needs it.
- `npm ci` (lockfile is committed, `save-exact=true`).

## Everyday commands

| Command | What it does |
| --- | --- |
| `npm run build` | `prebuild` (syncs translations) → production webpack → copies `ultra-card.js`, `ultra-card-panel.js` and chunks to the repo root |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint on `src/**/*.ts` |
| `npm run test:run` | Vitest once (`npm test` watches) |
| `npm run validate:translations` / `translations:coverage:check` | Locale file checks |
| `npm run audit:module-tabs` | Static check that module editors use the shared components |
| `npm run release:check` | Everything CI runs: typecheck, lint, tests, module-tab audit, translations, build, bundle check. Run before any PR you call ready. |
| `npm run build:demo` | Rebuilds `dist-demo/ultra-card-demo.js` for the website demo |

Set `SKIP_HA_DEPLOY=1` when building anywhere that is not Wayne's Mac; otherwise webpack tries to copy into `/Volumes/config/...` (it skips silently if the path is missing, but be explicit).

## Code conventions

- Prettier (`.prettierrc`) + ESLint; match surrounding code.
- All user-visible strings go through `localize('key', lang, 'English fallback')`, with the whole sentence inside the call. Add new keys to `src/translations/en.json`; other locales are filled by `npm run translations:fill` (needs `OPENAI_API_KEY`) or by translators.
- Module editors (`src/modules/**`) must follow the canonical General tab pattern: @docs/agent-rules/module-general-tab.md
- Scaffold new modules from `src/modules/_module-template.ts`.

## Build artifacts in git

- `ultra-card.js`, `ultra-card-panel.js`, `dist/version.js`, `dist/version.d.ts` and `dist-demo/` are committed. `uc-*.js` chunks and the rest of `dist/` are gitignored.
- HACS installs from GitHub release assets (`hacs.json`: `content_in_root: false`). A release with no assets makes HACS fall back to the repo root, where chunks are missing, so never publish a release by hand.

## Releasing the card

1. Bump the version in `src/version.ts` (package.json is synced by the script).
2. Write the changelog entries to `.release-changelog-<ver>.txt` (gitignored).
3. `npm run build:release -- --changelog-file .release-changelog-<ver>.txt --yes` (stable) or `build:prerelease` (beta). The script runs `release:check`, updates `RELEASE_NOTES.md`, commits with `git add -A`, tags `v<ver>`, pushes `main` and the tag, then waits on the GitHub `Release` workflow via `gh`.
4. `.github/workflows/release.yml` builds on the tag, attaches all assets to a draft release, then publishes. `announce-release.yml` posts to Discord.

Releases push straight to `main` and create a public tag: only do this when Wayne asks for a release.

## WordPress plugin (ultracard.io)

- Canonical source: `ultra-card-integration/`. Root `includes/`, `templates/` and `ultra-card-integration.php` are mirrors that the packaging script overwrites (and `*.php` at the root is gitignored).
- After any plugin edit: `npm run plugin:zip` (bumps patch version, mirrors, rebuilds and verifies `ultra-card-integration.zip`). Commit the zip with the change; never rename it or hand-edit versions. Details: @docs/agent-rules/wordpress-plugin-packaging.md
- Wayne uploads the zip to WordPress himself.
- ultracard.io also runs a server-side mu-plugin (not in this repo) that caches the presets feed and rate-limits JWT sign-ins. Read before touching REST routes, presets, auth or polling: @docs/agent-rules/ultracard-server-mu-plugin.md

## Ultra Card Connect (sidebar Hub panel)

The Hub panel is served by the separate Connect integration repo (https://github.com/WJDDesigns/ultra-card-connect). `npm run sync:panel` copies the built panel into `../Ultra Card Pro Cloud/custom_components/ultra_card_pro_cloud/www` (or `INTEGRATION_WWW_PATH`) and writes `panel-assets.json`. Updating only the card does not update the Hub.

## Website

`website/` holds ultracard.io embed pages. On push to `main`, `website-embeds.yml` refreshes `website/pages.json` and pings ultracard.io (uses the `UC_HARNESS_SECRET` repo secret). Local preview: `python3 -m http.server 8765` then open `http://localhost:8765/website/_local-preview.html?p=modules-page-embed.html`.

## Local-only (Wayne's Mac)

- `npm run watch:ha` / `build:deploy` / `deploy`: rsync builds into the Home Assistant config share mounted at `/Volumes/config` (override with `HA_DEPLOY_PATH`, `HA_PANEL_DEPLOY_PATH`). Not available in cloud sessions; verify there with tests, the demo page and the Playwright harnesses instead.
