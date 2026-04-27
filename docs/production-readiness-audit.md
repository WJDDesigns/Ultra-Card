# Ultra Card — Production Readiness Audit

**Audit date:** 2026-04-27  
**Scope:** Full repository (code, architecture, tests, CI/release, i18n signals, security/performance themes).  
**Classification:** Blocker / High / Medium / Low, with remediation effort (S = small, M = medium, L = large).

---

## Executive summary

The codebase ships with strong individual features (sanitizer tests, navigation JS-template gating for imported/community content, CI that runs `tsc` + lint + tests + build on main PRs). **B1** and **B2** are addressed: **logic** uses ref-counted `registerConsumer` / `unregisterConsumer`; **animated clocks** use ref-counted `ClockUpdateService` consumers, **multi-listener** tick callbacks, and per-card `unregisterClock` for all nested `animated_clock` modules when a card disconnects.

**Ship-today recommendation:** Multi-card lifecycle blockers **B1/B2** are mitigated; remaining “production ready” gaps are process, security depth, coverage, and strictness (see High/Medium findings).

**Release process (H1–H3):** Tag workflow, `build.yml`, `ci.yml`, and `scripts/release.js` now run `**npm run release:check`** (typecheck, lint, tests, translation validation, prebuild, production build). Lint no longer uses `continue-on-error` on tags.

---

## Verified release / quality gates


| Gate                               | Location                                                                                        | Notes                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI (PR/push main, master, develop) | `[.github/workflows/ci.yml](../.github/workflows/ci.yml)`                                       | `npm ci` → `**npm run release:check**` (typecheck, lint, tests, `validate:translations`, prebuild, build). Bundle size > 8MB is **warning only**.                                                                                                                                                                                                                                                                 |
| Build workflow (`main`)            | `[.github/workflows/build.yml](../.github/workflows/build.yml)`                                 | Same `**release:check`** + bundle size step as CI (parity).                                                                                                                                                                                                                                                                                                                                                       |
| Tag release                        | `[.github/workflows/release.yml](../.github/workflows/release.yml)`                             | `**npm run release:check**` after `npm ci` — same gates as CI (lint is blocking).                                                                                                                                                                                                                                                                                                                                 |
| Local release script               | `[scripts/release.js](../scripts/release.js)`                                                   | Runs `**npm run release:check**` before commit/tag (unless `--skip-build`).                                                                                                                                                                                                                                                                                                                                       |
| TypeScript                         | `[tsconfig.json](../tsconfig.json)`                                                             | `strict: false`, `noImplicitAny: false` — weaker static guarantees than strict TS.                                                                                                                                                                                                                                                                                                                                |
| Webpack                            | `[webpack.config.js](../webpack.config.js)`                                                     | `ts-loader` with `**transpileOnly: true`** — type errors do not fail the bundle; rely on `tsc` in CI.                                                                                                                                                                                                                                                                                                             |
| ESLint scope                       | `[.eslintignore](../.eslintignore)`                                                             | Excludes `src/types/index.ts`, `src/utils/image-upload.ts`, and a few other paths — not the main card file.                                                                                                                                                                                                                                                                                                       |
| Tests                              | `src/**/*.test.ts` (5 files)                                                                    | `[html-sanitizer.test.ts](../src/utils/html-sanitizer.test.ts)`, `[template-migration.test.ts](../src/utils/template-migration.test.ts)`, `[uc-color-utils.test.ts](../src/utils/uc-color-utils.test.ts)`, `[parse-locale-number.test.ts](../src/utils/parse-locale-number.test.ts)`, `[uc-cloud-auth-service.test.ts](../src/services/uc-cloud-auth-service.test.ts)`. **Very small** surface vs. codebase size. |
| `test:coverage`                    | `[package.json](../package.json)`                                                               | `vitest run --coverage` with **no** `@vitest/coverage-v8` (or similar) in `devDependencies` — coverage script is likely incomplete until a provider is added.                                                                                                                                                                                                                                                     |
| Translations                       | `[.github/workflows/validate-translations.yml](../.github/workflows/validate-translations.yml)` | Runs only when `src/translations/`** changes; **not** part of main `ci.yml`.                                                                                                                                                                                                                                                                                                                                      |


**Recommended single “release gate” command (manual or scripted):**

```bash
npm ci
npm run release:check
```

---

## Findings (severity-ranked)

### Blocker


| ID  | Finding                                                                                                                                                                                                                                                                                                                                         | Evidence                                                                                                                                                                                                                                | Impact                             | Fix direction                                                                           | Effort |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------- | ------ |
| B1  | **(Fixed)** Previously, `logicService.cleanup()` on every `ultra-card` disconnect tore down **all** template WebSocket subscriptions. Now each card calls `registerConsumer()` / `unregisterConsumer()`; full teardown runs only when the **last** consumer disconnects. `cleanup()` still forces a reset for tests.                            | `[src/cards/ultra-card.ts](../src/cards/ultra-card.ts)`, `[src/services/logic-service.ts](../src/services/logic-service.ts)`, `[src/services/logic-service.test.ts](../src/services/logic-service.test.ts)`                             | Was: sibling cards broke.          | Ref-counted consumers (backward compatible: one card = same teardown timing as before). | Done   |
| B2  | **(Fixed)** Previously, `clearAll()` on every disconnect cleared all intervals and a single callback. Now: **consumer ref-count**, `**addUpdateCallback`** (multi-listener), `**unregisterConsumer`** when last card leaves, and `**_unregisterAnimatedClockTimersFromConfig**` so this card’s clock intervals stop without affecting siblings. | `[src/services/clock-update-service.ts](../src/services/clock-update-service.ts)`, `[src/services/clock-update-service.test.ts](../src/services/clock-update-service.test.ts)`, `[src/cards/ultra-card.ts](../src/cards/ultra-card.ts)` | Was: sibling clocks / ticks broke. | Same as B1 pattern + per-card clock `unregisterClock` walk.                             | Done   |


### High


| ID  | Finding                                                                                                                  | Evidence                                                                                                                                                                                     | Impact                                               | Fix direction                                                                  | Effort      |
| --- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- |
| H1  | **(Fixed)** Tagged releases previously allowed lint to pass with `continue-on-error: true`.                              | `[.github/workflows/release.yml](../.github/workflows/release.yml)` now runs `**npm run release:check`** (lint is blocking).                                                                 | Was: broken lint could ship on tag.                  | Same pipeline as CI.                                                           | Done        |
| H2  | **(Fixed)** `build.yml` previously only prebuild + build (+ separate lint).                                              | `[.github/workflows/build.yml](../.github/workflows/build.yml)` single `verify` job: `**release:check`** + bundle size.                                                                      | Was: weaker bar than CI.                             | Aligned with `ci.yml`.                                                         | Done        |
| H3  | **(Fixed)** Local release did not mirror CI before tag.                                                                  | `[package.json](../package.json)` `release:check`; `[scripts/release.js](../scripts/release.js)` calls it (unless `--skip-build`).                                                           | Was: human could tag without full gates.             | One script for humans + CI + tags.                                             | Done        |
| H4  | **(Fixed)** Navigation `[[[...]]]` JS gated by `_contentOrigin` + optional `**disable_navigation_js_templates`**.        | [navigation-js-templates.md](./navigation-js-templates.md), `[uc-navigation-js-gating.ts](../src/services/uc-navigation-js-gating.ts)`, `[layout-tab.ts](../src/editor/tabs/layout-tab.ts)`. | Untrusted imports must not execute JS nav templates. | Enterprise YAML flag for strict installs.                                      | Done        |
| H5  | **(Partial)** `noImplicitReturns: true` in `tsconfig`; `**strict` / `noImplicitAny` still off**; webpack transpile-only. | `[tsconfig.json](../tsconfig.json)`, `[webpack.config.js](../webpack.config.js)`                                                                                                             | Weaker static guarantees than full strict mode.      | Ratchet further (`strictNullChecks`, `noImplicitAny`, `tsconfig.strict.json`). | L (ongoing) |


### Medium


| ID  | Finding                                                                                                                                     | Evidence                                                                                                                                                                                                                              | Impact                                                                    | Fix direction                                               | Effort      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------- |
| M1  | **(Fixed)** Background preload is **batched + idle-spaced**, `**allSettled`**, and **loaders-only**; opt-out via `window` / `localStorage`. | `[uc-module-preload-scheduler.ts](../src/utils/uc-module-preload-scheduler.ts)`, `[src/index.ts](../src/index.ts)`.                                                                                                                   | Was: `Promise.all` over all metadata (burst + one reject short-circuits). | Default bounded concurrency; `full` / `minimal` modes.      | Done        |
| M2  | **(Fixed)** Sticky `loadErrors` — `**clearModuleLoadError(type)`** + **Retry load** in module preview when a loader exists.                 | `[module-registry.ts](../src/modules/module-registry.ts)`, `[uc-module-preview-service.ts](../src/services/uc-module-preview-service.ts)`, `[module-registry-load-error.test.ts](../src/modules/module-registry-load-error.test.ts)`. | Was: failed chunk blocked until full reload.                              | User-triggered retry clears error and re-invokes load path. | Done        |
| M3  | **(Fixed)** `uc-module-load-state-changed` — cards filter by **nested** module types in layout.                                             | `[ultra-card.ts](../src/cards/ultra-card.ts)`, `[uc-layout-module-types.ts](../src/utils/uc-layout-module-types.ts)`. Event detail already had `type`.                                                                                | Was: every card scheduled update on any lazy load.                        | `collectModuleTypesFromLayout` + early return.              | Done        |
| M4  | **DOM injection surface** — inventory + fixes incl. **markdown error fallback** (`sanitizeMarkdownHtml`).                                   | [m4-innerhtml-inventory.md](./m4-innerhtml-inventory.md); [Phase 9](./production-readiness-remediation-phases.md#phase-9--m4-innerhtml--dom-injection-audit).                                                                         | Spot-audits remain (image/dropdown/camera).                               | Continue per inventory gaps.                                | L (ongoing) |
| M5  | **(Fixed)** Translation validate runs on every PR via `**release:check`**.                                                                  | `[package.json](../package.json)`, `[.github/workflows/ci.yml](../.github/workflows/ci.yml)`.                                                                                                                                         | Broken i18n vs. `en.json` fails CI.                                       | Optional path-filtered workflow can remain for extras.      | Done        |
| M6  | **(Fixed)** `test:coverage` wired to `**@vitest/coverage-v8`** + `[vitest.config.ts](../vitest.config.ts)` coverage block.                  | `npm run test:coverage`, `./coverage/` (gitignored).                                                                                                                                                                                  | Local/CI can generate HTML coverage.                                      | Add thresholds later when baseline known.                   | Done        |


### Low


| ID  | Finding                                                                  | Evidence                                                                                                     | Impact                                      | Fix direction                                             | Effort |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------- | ------ |
| L1  | **(Fixed)** Pro banner — event when first `hass` + microtask + fallback. | `[uc-pro-banner.ts](../src/utils/uc-pro-banner.ts)`, `[index.ts](../src/index.ts)`, `ultra-card` `updated()` | Was: fixed 3s delay.                        | `UC_ULTRA_CARD_HASS_READY` + `runUltraCardVersionBanner`. | Done   |
| L2  | **(Documented)** Bundle CI remains warning-only at 8 MiB.                | `[ci.yml](../.github/workflows/ci.yml)`, `[bundle-strategy.md](./bundle-strategy.md)`                        | Policy explicit; fail can be enabled later. | See bundle-strategy doc.                                  | Done   |
| L3  | **(Fixed)** Dependabot for npm — weekly PRs.                             | `[.github/dependabot.yml](../.github/dependabot.yml)`                                                        | Was: no automated dep PRs.                  | Tune schedule / limits as needed.                         | Done   |


---

## Positive controls (already in good shape)

- **HTML sanitization** with tests: `[src/utils/html-sanitizer.ts](../src/utils/html-sanitizer.ts)`, `[src/utils/html-sanitizer.test.ts](../src/utils/html-sanitizer.test.ts)`.
- **Navigation JS templates blocked** for `imported` and `preset_community` origins: `[src/services/uc-navigation-service.ts](../src/services/uc-navigation-service.ts)` `shouldAllowJsTemplateExecution`.
- **Main CI pipeline** runs typecheck, lint, tests, and production build: `[.github/workflows/ci.yml](../.github/workflows/ci.yml)`.
- **Config validation / migration** utilities exist: `[src/services/config-validation-service.ts](../src/services/config-validation-service.ts)`, `[src/utils/template-migration.ts](../src/utils/template-migration.ts)` + tests.

---

## Remediation roadmap (prioritized)

**Phased implementation plan (sprints, PR splits, verification):** [production-readiness-remediation-phases.md](./production-readiness-remediation-phases.md)

1. **B1 — Logic service lifecycle** — **Done** (ref-count `registerConsumer` / `unregisterConsumer`).
  - **Verify:** Two Ultra Cards on one view with template logic; remove one card; other remains correct without waiting for arbitrary hass tick.
2. **B2 — Clock service lifecycle** — **Done** (ref-count + multi-callback + nested `unregisterClock` on disconnect).
  - **Verify:** Two cards with `animated_clock`; remove one; other keeps ticking.
3. **H1 / H2 / H3 — Release and CI consistency** — **Done** (`release:check` in `package.json`; `ci.yml`, `build.yml`, `release.yml`, `release.js`; locale `editor.graphs.entity` synced so `validate:translations` passes).
4. **H4 — Navigation `[[[...]]]`** — **Done** (docs, gating, import paths, `disable_navigation_js_templates`).
5. **M5 / M6 — Translations + coverage** — **Done** (`release:check` includes validate; Vitest v8 coverage).
6. **M2 / M3 — Registry retry + load-event churn** — **Done** (`clearModuleLoadError`, retry UI, filtered `uc-module-load-state-changed`).
7. **M1 — Startup module preload** — **Done** (`scheduleBackgroundModulePreloads`, `__ultraCardModulePreload` / `localStorage['ultra-card-module-preload']`).
8. **M4 — innerHTML / DOM injection** — **In progress** ([inventory](./m4-innerhtml-inventory.md); presets, tooltips, markdown catch path, etc.).
9. **H5 — TypeScript ratchet** — **In progress** (`noImplicitReturns`, `useUnknownInCatchVariables`, `noImplicitOverride`, **`noImplicitAny`** in `tsconfig.json`; **`strictNullChecks`** next; full `strict` TBD).
10. **L1 / L2 / L3 — Polish** — **L1/L2/L3 Done** (banner event + `[bundle-strategy.md](./bundle-strategy.md)` + Dependabot).
11. **Tests growth**
  - Expand tests around critical services beyond current small suite.

---

## Production readiness scorecard


| Area                                    | Score (1–5) | Comment                                                                                                                |
| --------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Functional correctness (multi-card)** | 4           | B1 + B2 addressed for logic and animated clocks.                                                                       |
| **Security**                            | 3           | Sanitizer + nav gating; M4 inventory + first `escapeHtml` / preset sanitization (full M4 still ongoing).               |
| **Performance**                         | 4           | M1 batched preload + M3 filtered load events; bundle policy documented (`[bundle-strategy.md](./bundle-strategy.md)`). |
| **Test / CI discipline**                | 4           | `release:check`, translations, Vitest + coverage; Dependabot npm weekly.                                               |
| **Operability / release**               | 4           | H1–H3: single `release:check` gate on CI, build, tags, and `release.js`.                                               |
| **Documentation / threat model**        | 4           | Navigation JS doc + `_contentOrigin` / enterprise flag documented.                                                     |


**Overall:** **B1/B2, H1–H4, M1–M3, M5/M6, L1–L3** addressed; **M4** and **H5** partially advanced; full **strict TS** and broader tests remain.

---

## Appendix: Files reviewed (non-exhaustive)

- `[src/cards/ultra-card.ts](../src/cards/ultra-card.ts)`  
- `[src/services/logic-service.ts](../src/services/logic-service.ts)`  
- `[src/services/clock-update-service.ts](../src/services/clock-update-service.ts)`  
- `[src/index.ts](../src/index.ts)`  
- `[src/modules/module-registry.ts](../src/modules/module-registry.ts)`  
- `[src/modules/module-loaders.ts](../src/modules/module-loaders.ts)`  
- `[src/services/uc-navigation-service.ts](../src/services/uc-navigation-service.ts)`  
- `[package.json](../package.json)`, `[tsconfig.json](../tsconfig.json)`, `[webpack.config.js](../webpack.config.js)`  
- `[.github/workflows/ci.yml](../.github/workflows/ci.yml)`, `[release.yml](../.github/workflows/release.yml)`, `[build.yml](../.github/workflows/build.yml)`

---

*This document is an audit artifact; it does not change runtime behavior. Implement fixes in separate PRs.*