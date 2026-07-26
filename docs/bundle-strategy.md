# Bundle size and CI policy

## Current behavior

- **Production artifact:** `dist/ultra-card.js` (webpack production build) plus colocated `uc-*.js` async chunks.
- **CI / release:** After `npm run release:check`, workflows run a **bundle size check** that measures `dist/ultra-card.js` and verifies `uc-*.js` chunks exist. Size above **8 MiB** emits a warning (does not fail by default).
- **Rationale:** Oversize is a **signal** (mobile download, parse cost). Fail-on-budget is a deliberate product decision once remediation paths are stable.

## Chunk strategy

- **Core entry** (`ultra-card.js`) loads the card shell, shared utilities, and the module **manifest** only.
- **Editor** loads via `getConfigElement()` → `loadUltraCardEditor()` → `uc-editor.js` (not on view-only dashboards).
- **Modules** load via `module-loaders.ts` → `uc-mod-*.js` when `ModuleRegistry.ensureModuleLoaded` runs for a layout type.
- **`publicPath: 'auto'`** resolves chunk URLs from the script that loaded the entry (HACS `/local/community/Ultra-Card/`, manual paths, panel sync). Do **not** hardcode `/local/community/...`.
- **Background preload** defaults to `minimal` (`uc-module-preload-scheduler`). Override with `window.__ultraCardModulePreload = 'batched'|'full'` or `localStorage['ultra-card-module-preload']`.

## Packaging

- `postbuild` copies `ultra-card.js`, `ultra-card-panel.js`, and all `uc-*.js` (+ licenses) to the repo root.
- Release workflow attaches all `uc-*.js` assets (missing chunks caused the beta13 blank-module regression).
- `deploy.js` / webpack auto-deploy / `sync:panel` must keep copying every `uc-*.js` beside the entry that loads them.

## Rollback flags

| Flag | Effect |
|------|--------|
| `window.__ultraCardLazyEditor = false` | Eager-import editor at card bootstrap (`src/index.ts`) |
| `localStorage['ultra-card-module-preload'] = 'full'` | Restore legacy burst preload of all modules |

## Changing the policy

1. Edit `.github/workflows/ci.yml` — the `Bundle size check` step.
2. To **fail** on oversize, replace `echo "::warning::..."` with `exit 1`.
3. Keep this document in sync with the threshold and fail/warn choice.
