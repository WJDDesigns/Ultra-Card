# Bundle strategy: multi-file ESM build

## Current behavior (since 3.10)

- **Production artifacts:** `dist/ultra-card.js` (fixed name, the Lovelace resource),
  `dist/ultra-card-panel.js` (Hub panel, served by Ultra Card Connect), and
  content-hashed chunks `dist/uc-<name>.<hash8>.js`.
- **Output format:** native ES modules (`experiments.outputModule`, `output.module`,
  `chunkFormat: 'module'`, `chunkLoading: 'import'`). Chunks are loaded with a
  relative `import("./uc-….js")` resolved by the browser against the importing
  module's URL. `src/public-path.ts` additionally pins webpack's public path from
  `import.meta.url` (first import of every entry) for the worker and asset paths.
- **What is a chunk today (Phase 1):** the editor (`uc-editor.*`), one chunk per
  non-English locale (`uc-locale-*`), the Dynamic Weather worker and its three.js
  vendor, Hub panel tabs, and shared chunks between the editor and the Hub.
  All 91 modules remain eager inside `ultra-card.js` (per-import
  `webpackMode: "eager"` hints in `src/modules/module-loaders.ts`). Phase 2
  replaces those hints with grouped `webpackChunkName`s.
- **CI / release:** `scripts/check-bundle.js` runs in `release:check`, `ci.yml`,
  and `build.yml`. It fails on unhashed chunks, on the editor or locales being
  folded back into the entry, on `file:///` leaks, on entry references to
  chunks that were not emitted, and on the entry exceeding the core budget.

## How HACS actually distributes a plugin (verified against HACS 2.0.5)

Traced in `custom_components/hacs/repositories/{base,plugin}.py` and confirmed
against a live HACS install of 3.9.0, which received **only** `ultra-card.js`
even though `uc-283.js` / `uc-437.js` were release assets.

1. `plugin.py` `update_filenames()`: with `content_in_root: false`, HACS looks
   for `filename` among the **latest release's assets**. Found → `remote =
"release"` and `content.single = True`. With `content_in_root: true` the
   release lookup is skipped and `remote = ""` (repo root).
2. `base.py` `download_content(version)`: in release mode the file list is
   `release_contents(version)` = **every asset of the installed tag**. Then:

   ```python
   for content in contents:
       if self.repository_manifest.content_in_root and self.repository_manifest.filename:
           if content.name != self.repository_manifest.filename:
               continue
   ```

   So `content_in_root: true` + `filename` = **only `ultra-card.js` is kept**.
   This is the real reason 3.6.0 (and the never-loading Dynamic Weather worker
   since then) had no chunks on disk. `hacs.json` must keep
   `content_in_root: false`; `scripts/check-bundle.js` enforces it.

3. `dowload_repository_content()`: with `single`, every asset is written flat
   into `www/community/Ultra-Card/<asset name>`, and `async_save_file` writes a
   `.gz` twin for each `.js`. Therefore **every release asset lands in every
   user's www folder**: ship only `ultra-card.js`, `ultra-card-panel.js`,
   `uc-*.js` and their `LICENSE.txt` files (the release zip was dropped).
4. In `single` mode HACS does **not** back up / wipe the folder before an
   update, so old hashed chunks accumulate until uninstall. Harmless (never
   referenced), but expect the folder to grow over releases.
5. Default-branch installs (`remote = ""`) copy root `.js` files from the git
   tree; root `uc-*.js` are gitignored, so `hide_default_branch: true` keeps
   releases the only channel. `zip_release` is integrations-only.

HACS serves `www/community/` at `/hacsfiles/` with `Cache-Control: max-age=2678400`
(31 days) when Lovelace is in storage mode. The `?hacstag=` query on the main
resource is the cache-buster for `ultra-card.js`; chunks have no hacstag, so
**the content hash in the chunk filename is mandatory**.

Ultra Card Connect serves the panel from `/ultra_card_pro_cloud_panel/` with
`cache_headers=True` and registers it via `module_url`, so the same rules apply:
`scripts/sync-panel-to-integration.js` copies every `uc-*.js` into Connect's
`www/` and prunes stale ones.

## Why 3.6.0 broke (corrected post-mortem)

3.6.0 emitted async chunks from a CommonJS-style build. In that output webpack has
no `import.meta.url`; `publicPath: 'auto'` fell back to scanning `<script>` tags
and resolved chunks against an unrelated resource (`/hacsfiles/lovelace-auto-entities/`).
The same defect rewrote the Dynamic Weather worker URL to a build-machine `file://`
path, which is why the worker never ran in production and always fell back to the
main thread.

On top of that, `content_in_root: true` made HACS discard every asset except
`ultra-card.js` (see above), so even a correctly resolved chunk URL would have
404'd. Both defects are fixed: ESM output for URL resolution, and
`content_in_root: false` for distribution. The earlier folk conclusion "HACS only
distributes one file" was a symptom of the manifest, not a HACS limitation.

## Local verification

`npm run build` then load `dist/` behind a `/hacsfiles/Ultra-Card/` path using a
dynamic `import('…/ultra-card.js?hacstag=x')` from a page that also has an
unrelated `/hacsfiles/<other>/` script tag. Confirm in DevTools Network that
`uc-editor.*` (open the editor) and `uc-locale-<lang>.*` (set a non-English
`hass.locale.language`) load from `/hacsfiles/Ultra-Card/`.

Before a release: install the pre-release through HACS on a test instance, verify
the chunks exist in `www/community/Ultra-Card/`, and check the Companion app.

## Emergency single-file build

`SINGLE_FILE=1 npm run build` restores the eager, self-contained bundle (still
ESM). `scripts/check-bundle.js` skips the chunk-shape checks when the same
variable is set. Use only for a hotfix while a distribution problem is diagnosed.

## Runtime flags

- `window.__ultraCardLazyEditor = false` / `localStorage['ultra-card-lazy-editor']='false'`:
  fetch the editor chunk at card bootstrap instead of on first edit.
- Background module preload (`uc-module-preload-scheduler`) defaults to `minimal`;
  with modules still eager it only affects instantiation order.

## Phase 2 (not yet done)

- Replace `webpackMode: "eager"` hints in `module-loaders.ts` with grouped chunk
  names; split three.js (`living_canvas`, `dynamic_weather`), leaflet (`map`),
  graphs, vacuum, calendar, camera, media_player, and the household Pro set.
- Move module editor tabs and the CodeMirror template editor out of module
  runtime files so they join the editor chunk.
- Ratchet the `check-bundle.js` core budget down as each split lands.
- Add a version-skew handler: a failed chunk `import()` after a HACS update shows
  one "Ultra Card was updated, reload" toast.
