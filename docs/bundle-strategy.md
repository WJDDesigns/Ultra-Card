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
- **What is a chunk today (Phase 2):**
  - **Eager, inside `ultra-card.js`:** the 10 everyday modules (text, icon,
    image, info, bar, button, separator, horizontal, vertical, pagebreak), the
    registry/manifest, English strings, the card runtime and shared services.
    A typical card renders with no loading skeleton.
  - **`uc-m-<type>.*`:** every other module (72 chunks). The 9 tiny input
    modules share `uc-m-inputs`; the 5 appliances share `uc-m-appliance`.
    Loaded by `ModuleRegistry.ensureModuleLoaded()` the first time a card or
    the editor needs the type; skeleton → `uc-module-load-state-changed` →
    re-render + module CSS refresh.
  - **`uc-vendor-*`:** three (526 KB), codemirror (422 KB), tiptap (356 KB),
    leaflet (165 KB), swiper (144 KB), pako (46 KB). Named via
    `optimization.splitChunks.cacheGroups` so a missing file in a user's
    `www/community/Ultra-Card/` is recognisable.
  - **`uc-svc-*`:** dynamic weather, living canvas and navigation services,
    reached through `src/services/uc-heavy-services.ts` (`createLazyService`)
    only when a card contains the matching module.
  - **`uc-default-image.*`:** the 180 KB base64 default image, fetched only when
    an image module is on "default" (`src/utils/default-image.ts`, rendered via
    lit `until`).
  - The editor (`uc-editor.*`, ~1.7 MB), one chunk per non-English locale,
    the Dynamic Weather worker, and Hub panel tabs, as in Phase 1.
- **Rules that keep the entry small** (each one is something that regressed
  during Phase 2 and was caught by webpack stats):
  - Settings-only custom elements (`ultra-template-editor`, `ultra-wysiwyg-editor`,
    cheatsheet) are imported once in `ultra-card-editor.ts`, never in module
    files. Modules only render the tags; they upgrade when the editor defines them.
  - `src/modules/index.ts` re-exports no implementation and no editor-side
    service (`src/index.ts` does `export * from './modules'`).
  - The host card never imports a module file. Cross-cutting hooks go through
    the registry (`UltraModule.closePortalsForModule`).
  - Shared constants that runtime code needs (`SENSITIVE_PLACEHOLDER`) live in
    leaf files, not next to pako-using code.
- **CI / release:** `scripts/check-bundle.js` runs in `release:check`, `ci.yml`,
  and `build.yml`. It fails on unhashed chunks, on the editor / locales /
  module / vendor / service chunks being folded back into the entry, on
  `file:///` leaks, on entry-reachable chunks that were not emitted (resolved
  from webpack's runtime id→hash map), on `hacs.json` regressing
  `content_in_root`, and on the entry exceeding 2.25 MiB (warn at 1.9 MiB).

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
- Background module preload (`uc-module-preload-scheduler`) defaults to `minimal`
  (no preload); `batched` / `full` fetch module chunks in the background.

## Results

|                           | 3.9.0    | Phase 1 | Phase 2 |
| ------------------------- | -------- | ------- | ------- |
| `ultra-card.js` raw       | 12.54 MB | 7.65 MB | 1.64 MB |
| `ultra-card.js` gzip      | 3.05 MB  | 1.85 MB | 0.36 MB |
| `ultra-card-panel.js` raw | 4.16 MB  | 0.28 MB | 0.28 MB |

## Later

- Module settings tabs (`src/tabs/global-design-tab.ts` etc., ~190 KB
  pre-minify) are still reachable from `base-module.ts` and therefore in the
  entry. Moving them behind a lazy boundary needs `renderDesignTab` & co. to
  tolerate an async tab implementation.
- Version-skew handler: a failed chunk `import()` right after a HACS update
  (old entry cached, new hashes on disk) should surface one "Ultra Card was
  updated, reload" toast instead of a skeleton.
- Consider prefetching `uc-m-*` chunks for the types present in the config on
  idle, so a first cold view of a busy card fetches in parallel rather than as
  each module renders.
