# Bundle size and CI policy

## Current behavior (single-file, since 3.6.1)

- **Production artifact:** `dist/ultra-card.js` — a single self-contained bundle. No async chunks.
- **Known exception:** the dynamic-weather Web Worker emits two `uc-*.js` files
  (workers cannot be inlined by webpack). These were separate files in 3.5.x too;
  when the worker file is unavailable (as on HACS installs),
  `weather-effects-engine.ts` falls back to main-thread rendering.
- **CI / release:** After `npm run release:check`, workflows run a **bundle size check** that fails on any `uc-mod-*`/`uc-editor` chunk or more than the two worker files, and warns above **16 MiB**.

## Why single-file is mandatory (3.6.0 post-mortem)

3.6.0 shipped true webpack async chunks (`uc-mod-*.js`, `uc-editor.js`, numbered
vendor chunks) and broke **every HACS install** — no cards rendered. Two independent
reasons, both structural:

1. **HACS only distributes one file.** `hacs.json` declares `"filename": "ultra-card.js"`,
   and HACS downloads exactly that single asset into
   `www/community/Ultra-Card/`. The `uc-*.js` chunks attached to the GitHub
   release never reach users, so every chunk request 404s.
2. **`publicPath: 'auto'` cannot resolve the chunk base URL.** Home Assistant
   loads Lovelace resources via dynamic `import()`, so there is no `<script>`
   tag and `document.currentScript` is `null` inside the (non-ESM) webpack
   runtime. Webpack's fallback scans the page's script tags and picks an
   unrelated one — in the field this resolved chunk URLs against
   `/hacsfiles/lovelace-auto-entities/`.

Fixes enforcing this:

- `webpack.config.js` sets `module.parser.javascript.dynamicImportMode: 'eager'`,
  so **all** `import()` calls are bundled into the entry (evaluation is still
  deferred until first call — the lazy API surface is unchanged).
- `src/modules/module-loaders.ts` and `src/editor/load-ultra-card-editor.ts`
  use explicit `/* webpackMode: "eager" */` comments.
- CI fails if any `uc-*.js` chunk is emitted.

## Re-enabling code splitting later (requirements)

Do **not** reintroduce async chunks unless ALL of these are solved and verified
on a clean HACS install:

1. Distribution: `hacs.json` `zip_release: true` with a stable zip asset name
   containing the entry plus all chunks (verify HACS extracts them next to
   `ultra-card.js`), or an equivalent mechanism that puts every chunk on disk.
2. Chunk URL resolution: emit real ESM (`output.module` + `experiments.outputModule`)
   so webpack's auto public path can use `import.meta.url`, or set
   `__webpack_public_path__` at runtime from a reliable source. Script-tag
   scanning does not work — HA loads resources via dynamic `import()`.
3. Update the CI bundle check accordingly.

## Preload / rollback flags

- Background module preload defaults to `minimal` (`uc-module-preload-scheduler`);
  with eager bundling it only affects instantiation order, not network loads.
- `window.__ultraCardLazyEditor = false` — eager-import editor at card bootstrap
  (`src/index.ts`); harmless either way in the single-file build.

## Changing the policy

1. Edit `.github/workflows/ci.yml` — the `Bundle size check` step.
2. Keep this document in sync with the threshold and fail/warn choice.
