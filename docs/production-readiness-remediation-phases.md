# Production readiness — phased fix plan

This document turns each finding in [production-readiness-audit.md](./production-readiness-audit.md) into **ordered phases** with goals, tasks, dependencies, verification, and suggested PR boundaries.

**Principle:** Ship **Phase 1–2** before calling the product multi-card production-ready. Phases **3+** harden process, security, and scale.

---

## Gate before Phase 3 (B1/B2 verification)

Do **not** start Phase 3 until the following are satisfied (Phase 3 is unrelated to multi-card lifecycle, but this gate confirms Phases 1–2 are real in your environment).

**Automated (local)**

1. `npm run test:run` — all tests green (includes `logic-service` + `clock-update-service` ref-count tests).
2. Optional: `npm run build` — webpack production build completes (catches bundler-only issues).

**After Phase 3**

- Run **`npm run release:check`** before releases (also what CI, `build.yml`, tag workflow, and `scripts/release.js` use).

**Manual (Home Assistant)**

1. **B1 — Logic / templates:** Dashboard with **two** Ultra Cards that use template-based visibility or logic; remove or navigate away from one card; confirm the other still evaluates templates/logic without requiring a full refresh.
2. **B2 — Animated clocks:** Two cards, each with an **animated_clock**; remove one card from the view; confirm the other’s clock keeps updating. Optionally change update interval on one card and confirm behavior.

---

## Phase map (at a glance)

| Phase | Audit IDs | Theme | Depends on |
|-------|-----------|--------|------------|
| [1](#phase-1--b1-logic-service-multi-card-lifecycle) | B1 | Logic / template subscriptions | — |
| [2](#phase-2--b2-clock-service-multi-card-lifecycle) | B2 | Animated clock timers | — (can parallelize with Phase 1 in separate PRs) |
| [3](#phase-3--h1-h2-h3-release--ci-parity) | H1, H2, H3 | Release and CI gates | **Done** — `release:check` + workflow/script alignment |
| [4](#phase-4--h4-navigation-js-templates-trust-model) | H4 | Navigation `[[[...]]]` trust model | **Done** |
| [5](#phase-5--m5-m6--translations-in-ci--coverage-tooling) | M5, M6 | CI translations + Vitest coverage | **Done** (via `release:check` + coverage provider) |
| [6](#phase-6--m3-module-load-event-churn) | M3 | Module load broadcast churn | **Done** |
| [7](#phase-7--m2-registry-load-error-retry) | M2 | Sticky `loadErrors` / retry | **Done** |
| [8](#phase-8--m1-startup-preload-strategy) | M1 | Startup preload | **Done** |
| [9](#phase-9--m4-innerhtml--dom-injection-audit) | M4 | DOM injection / XSS inventory | **In progress** — inventory + markdown fallback + camera fail UI (`escapeHtml`, no inline handlers) + dropdown ghost `escapeHtml` + portal trust comment |
| [10](#phase-10--h5-typescript--build-strictness-incremental) | H5 | TS strictness / build | **In progress** — [`tsconfig.json`](../tsconfig.json): `noImplicitReturns`, `useUnknownInCatchVariables`, `noImplicitOverride`, **`noImplicitAny: true`**; `strictNullChecks` still pending (~120+ errors); full `strict` TBD |
| [11](#phase-11--l1-l2-l3-polish) | L1, L2, L3 | Polish, budget, Dependabot | **Done** — L3: [`.github/dependabot.yml`](../.github/dependabot.yml); L1: [`uc-pro-banner.ts`](../src/utils/uc-pro-banner.ts) + `UC_ULTRA_CARD_HASS_READY`; L2: [`bundle-strategy.md`](./bundle-strategy.md) |

---

## Phase 1 — B1: Logic service multi-card lifecycle

**Status (code):** Implemented — `logicService.registerConsumer()` / `unregisterConsumer()` ref-count from `ultra-card` lifecycle; `cleanup()` remains a hard reset for tests. See [`src/services/logic-service.test.ts`](../src/services/logic-service.test.ts).

**Goal:** Removing or navigating away from one `ultra-card` must **not** call `logicService.cleanup()` in a way that tears down **global** template subscriptions used by other cards.

**Primary files:** [`src/cards/ultra-card.ts`](../src/cards/ultra-card.ts), [`src/services/logic-service.ts`](../src/services/logic-service.ts), callers of `logicService.setHass` / template subscribe paths.

**Tasks**

1. Choose a strategy (pick one):
   - **Ref-count:** `logicService.acquire()` in `connectedCallback`, `release()` in `disconnectedCallback`; `cleanup()` only when count hits 0.
   - **Per-card TemplateService:** logic holds a `Map<cardInstanceId, TemplateService>` (heavier refactor).
2. Ensure `setHass` / template evaluation still avoids the “resubscribe every hass tick” regression (existing comments in `logic-service.ts`).
3. Add a **manual test checklist** (and ideally an automated test harness later) for two cards + template visibility.

**Verification**

- Dashboard with **two** Ultra Cards using template-based visibility; remove one card from the view; the other’s logic/templates still update without requiring an arbitrary delay or refresh.
- No new WebSocket subscription storms (spot-check HA dev tools / CPU briefly).

**Suggested PR:** `fix(logic): scope template cleanup to card lifecycle` (single focused PR).

**Effort:** L (as audit).

---

## Phase 2 — B2: Clock service multi-card lifecycle

**Status (code):** Implemented — consumer ref-count on `ClockUpdateService`, `addUpdateCallback` with disposers (multi-listener ticks), `unregisterConsumer` when the last card disconnects, and `_unregisterAnimatedClockTimersFromConfig` so this card’s `animated_clock` intervals unregister without affecting siblings. See [`src/services/clock-update-service.test.ts`](../src/services/clock-update-service.test.ts).

**Goal:** Multiple `animated_clock` modules across cards keep correct tick behavior; disconnecting one card does not clear **all** intervals or the only global callback.

**Primary files:** [`src/services/clock-update-service.ts`](../src/services/clock-update-service.ts), [`src/cards/ultra-card.ts`](../src/cards/ultra-card.ts), [`src/modules/animated-clock-module.ts`](../src/modules/animated-clock-module.ts).

**Tasks**

1. Replace single `updateCallback` with either:
   - **Set of listeners** (each card registers/unregisters), or
   - **Ref-count + merged callback** that notifies all subscribers.
2. Change `clearAll()` usage: either remove from per-card disconnect or scope to “unregister this card’s module IDs only”.
3. Ensure `registerClock` remains idempotent per `moduleId`.

**Verification**

- Two cards, each with `animated_clock`; remove one; the other keeps animating/updating.
- Frequency changes (1s vs 60s) still work.

**Suggested PR:** `fix(clock): multi-instance clock update service` (separate from B1 for reviewability).

**Effort:** M.

---

## Phase 3 — H1, H2, H3: Release and CI parity

**Status (code):** Implemented — [`package.json`](../package.json) `release:check` chains `typecheck`, `lint`, `test:run`, `validate:translations`, `prebuild`, `build`. [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`.github/workflows/build.yml`](../.github/workflows/build.yml), and [`.github/workflows/release.yml`](../.github/workflows/release.yml) invoke it; [`scripts/release.js`](../scripts/release.js) runs it before commit (unless `--skip-build`). ESLint: high-volume rules downgraded to **warn** so **`npm run lint -- --quiet`** is the blocking bar (errors only); legacy `editor.graphs.entity` string entries were synced to the nested object via [`scripts/sync-graphs-entity-translations.js`](../scripts/sync-graphs-entity-translations.js). [`tsconfig.json`](../tsconfig.json) excludes scaffold [`src/modules/_module-template.ts`](../src/modules/_module-template.ts); small TS fixes in `layout-tab`, `global-logic-tab`.

**Goal:** A green tag build and local release script mean the same thing as `ci.yml` for core gates.

**Primary files:** [`.github/workflows/release.yml`](../.github/workflows/release.yml), [`.github/workflows/build.yml`](../.github/workflows/build.yml), [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`scripts/release.js`](../scripts/release.js), [`package.json`](../package.json).

**Tasks**

1. **H1:** Remove `continue-on-error: true` from the Lint step in `release.yml` (or gate: stable tags strict, prerelease optional — document choice).
2. **H2:** Either extend `build.yml` with `tsc` + `test:run` or deprecate/archive `build.yml` and rely on `ci.yml` only.
3. **H3:** Add `npm run release:check` (name TBD) in `package.json` chaining: `typecheck`, `lint`, `test:run`, `validate:translations`, `prebuild`, `build`; invoke from `scripts/release.js` before prompting to tag.

**Verification**

- Dry-run: intentionally break lint locally; confirm `release.js` / CI release job fails.
- Document the command in `README.md` or `RELEASE_NOTES.md` contributor section.

**Suggested PRs:** one for workflows, one for `package.json` + `release.js` (or single PR if you prefer).

**Effort:** S–M combined.

---

## Phase 4 — H4: Navigation JS templates trust model

**Status (code):** Done — [`docs/navigation-js-templates.md`](../docs/navigation-js-templates.md); [`uc-navigation-js-gating.ts`](../src/services/uc-navigation-js-gating.ts) + tests; import paths in [`layout-tab.ts`](../src/editor/tabs/layout-tab.ts) set **`_contentOrigin: 'imported'`** for clipboard row paste and `_handleImport` layout/module flows; optional enterprise flag **`disable_navigation_js_templates`** on [`UltraCardConfig`](../src/types.ts).

**Goal:** `[[[...]]]` execution is **understood**, **documented**, and **correctly gated** for every config import path (`_contentOrigin`).

**Primary files:** [`src/services/uc-navigation-service.ts`](../src/services/uc-navigation-service.ts), import paths in editor (e.g. layout/import flows that set `_contentOrigin`).

**Tasks**

1. Audit all code paths that load YAML/JSON/presets and ensure `_contentOrigin` is set consistently.
2. User-facing docs: what `[[[...]]]` can access, when it is disabled, and recommended alternatives (Jinja vs JS).
3. Optional: card-level or global setting “Disable navigation JS templates” for enterprise installs.

**Verification**

- Imported/community configs: templates blocked (existing behavior) — add regression test if feasible.
- First-party configs: behavior unchanged unless opt-in added.

**Effort:** M.

---

## Phase 5 — M5, M6: Translations in CI + coverage tooling

**Status (code):** Done — **`validate:translations`** runs inside **`npm run release:check`** and thus [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) / [build](../.github/workflows/build.yml) / [release](../.github/workflows/release.yml). **`@vitest/coverage-v8`** added; [`vitest.config.ts`](../vitest.config.ts) defines **`coverage`** (v8, text + HTML to `./coverage/`); `npm run test:coverage` produces a report. Thresholds not enforced yet (large codebase).

**Goal:** Translation JSON and coverage tooling cannot silently rot.

**Tasks**

1. **M5:** Add `npm run validate:translations` to `ci.yml` (always or on a schedule — pick one and document).
2. **M6:** Add `@vitest/coverage-v8` (or chosen provider), wire `test:coverage`, optional low thresholds for `src/utils/**` first.

**Verification**

- CI fails on invalid translation keys / broken JSON.
- `npm run test:coverage` produces a report locally.

**Effort:** S.

---

## Phase 6 — M3: Module load event churn

**Status (code):** Done — [`collectModuleTypesFromLayout`](../src/utils/uc-layout-module-types.ts) walks nested modules; [`ultra-card.ts`](../src/cards/ultra-card.ts) `_handleModuleLoadStateChanged` skips `_scheduleUpdate` when the event’s `detail.type` is not used on that card. [`uc-layout-module-types.test.ts`](../src/utils/uc-layout-module-types.test.ts).

**Goal:** `uc-module-load-state-changed` should not force every Ultra Card to re-render when irrelevant.

**Primary files:** [`src/modules/module-registry.ts`](../src/modules/module-registry.ts), [`src/cards/ultra-card.ts`](../src/cards/ultra-card.ts).

**Tasks**

1. Include `type` (or `types[]`) in event detail; listener checks `config` cache `moduleTypes` before `requestUpdate`.
2. Optional: debounce coalesced events in 50–100ms window.

**Verification**

- Many cards on one view; load a rare module type; only affected cards update (measure `requestUpdate` calls in dev if needed).

**Effort:** S–M.

---

## Phase 7 — M2: Registry load error retry

**Status (code):** Done — [`ModuleRegistry.clearModuleLoadError`](../src/modules/module-registry.ts); **Retry load** button in [`uc-module-preview-service.ts`](../src/services/uc-module-preview-service.ts) when `loadError` and `canLoad`; `uc-module-load-state-changed` detail state **`retry`** after clear. [`module-registry-load-error.test.ts`](../src/modules/module-registry-load-error.test.ts).

**Goal:** Transient chunk load failures do not permanently poison a module type until full reload.

**Primary files:** [`src/modules/module-registry.ts`](../src/modules/module-registry.ts), UI that surfaces errors (optional).

**Tasks**

1. Add `clearModuleLoadError(type)` or auto-retry N times with backoff on next `ensureModuleLoaded`.
2. Ensure UI can recover without hard refresh.

**Verification**

- Simulate failed `import()` once; second attempt succeeds.

**Effort:** S.

---

## Phase 8 — M1: Startup preload strategy

**Status (code):** Done — [`scheduleBackgroundModulePreloads`](../src/utils/uc-module-preload-scheduler.ts): default **batched** preload (concurrency 3, `requestIdleCallback` between batches), **`Promise.allSettled`** so one chunk failure does not cancel others, only types with **`canLoadModule`**. Opt-in **`window.__ultraCardModulePreload`** / **`localStorage['ultra-card-module-preload']`**: `batched` \| `full` \| `minimal` (aliases `off`, `none`, `parallel`). Wired from [`src/index.ts`](../src/index.ts). Tests: [`uc-module-preload-scheduler.test.ts`](../src/utils/uc-module-preload-scheduler.test.ts).

**Goal:** Reduce first-load cost / failure blast radius of `Promise.all` preload in [`src/index.ts`](../src/index.ts).

**Tasks**

1. `requestIdleCallback` / staggered batches / cap concurrency.
2. Feature flag or “preload: minimal | full” if you need a safety valve.

**Verification**

- Lighthouse or manual network waterfall on slow 3G profile; fewer parallel requests if batched.

**Effort:** M.

---

## Phase 9 — M4: `innerHTML` / DOM injection audit

**Status (code):** Inventory + hardening — [`m4-innerhtml-inventory.md`](./m4-innerhtml-inventory.md). **`escapeHtml`** in [`html-sanitizer.ts`](../src/utils/html-sanitizer.ts). Fixes: **WordPress / preset descriptions**, **graph tooltips**, **entity-picker**, **entity-mapper dialog**, **external-card error**, **markdown-module** catch-path **`sanitizeMarkdownHtml`**. Unused `unsafeHTML` imports removed from [`icon-module.ts`](../src/modules/icon-module.ts), [`ultra-card-editor.ts`](../src/editor/ultra-card-editor.ts). Remaining spot-audits: see inventory **Gaps**.

**Goal:** Every `innerHTML` / `unsafeHTML` site classified (trusted constant vs HA state vs user/imported string) and fixed where unsafe.

**Tasks**

1. Automated grep inventory → spreadsheet (path, line, data source, mitigation).
2. Fix high-risk rows first (external/community content, entity names in attributes).
3. Prefer Lit `html` or `textContent` / `DocumentFragment` where possible.

**Verification**

- Security review sign-off checklist; optional DOMPurify for HTML snippets that must remain HTML.

**Effort:** L.

---

## Phase 10 — H5: TypeScript / build strictness (incremental)

**Status (code):** Ratchet — [`tsconfig.json`](../tsconfig.json): **`noImplicitReturns`**, **`useUnknownInCatchVariables`**, **`noImplicitOverride`**, **`noImplicitAny`**. Regenerate `override` placements after large merges with `node scripts/apply-no-implicit-override.mjs` (uses TS4114 list).

**`strictNullChecks` (not yet in `tsconfig`):** ~120+ errors remain with `npx tsc --noEmit --strictNullChecks`. Prep already in tree: `UltraModule` / `BaseUltraModule` tab methods allow **`TemplateResult | null`**, layout-tab null coalescing, ultra-card style **`Record` / `fromEntries`** typing, binary clock array types, etc.

Further: clear remaining **`strictNullChecks`** diagnostics, enable the flag, then full **`strict`**.

**Goal:** Reduce classes of bugs without freezing development.

**Tasks**

1. **`noImplicitAny`** — **Done** (enabled in root `tsconfig.json`).
2. Optional: `npm run typecheck` in `prebuild` for maintainers (not necessarily default for all devs).

**Verification**

- CI `tsc` stays green; strictness ratchet documented.

**Effort:** L (ongoing).

---

## Phase 11 — L1, L2, L3: Polish

**Status (code):** **L1 / L2 / L3 Done** — Dependabot: [`.github/dependabot.yml`](../.github/dependabot.yml); banner: [`uc-pro-banner.ts`](../src/utils/uc-pro-banner.ts) + `ultra-card` dispatches `UC_ULTRA_CARD_HASS_READY`; bundle policy: [`bundle-strategy.md`](./bundle-strategy.md).

| ID | Task | Verification |
|----|------|----------------|
| L1 | Replace fixed-delay Pro detection with event when first `hass` is available | **Done** — event + microtask + fallback timeout in [`index.ts`](../src/index.ts) |
| L2 | Bundle budget (warn vs fail) and chunk strategy documented | **Done** — [`bundle-strategy.md`](./bundle-strategy.md) matches [`ci.yml`](../.github/workflows/ci.yml) warning-only 8 MiB step |
| L3 | Add Dependabot v2 for npm | **Done** — `.github/dependabot.yml` |

**Effort:** S each (L2 may be M if policy debate).

---

## Suggested sequencing across sprints

| Sprint | Phases | Outcome |
|--------|--------|---------|
| **Sprint A (must ship)** | 1 + 2 | Multi-card correctness baseline |
| **Sprint B (release trust)** | 3 + 5 | Releases and CI cannot lie; i18n/coverage wired |
| **Sprint C (security clarity)** | 4 + 9 (start inventory) | Trust model documented; highest-risk DOM paths fixed |
| **Sprint D (scale and quality)** | 6 + 7 + 8 + remainder of 9 + 10 + 11 | Performance, resilience, strictness, polish |

---

## Traceability matrix

| Audit ID | Phase |
|----------|-------|
| B1 | [1](#phase-1--b1-logic-service-multi-card-lifecycle) |
| B2 | [2](#phase-2--b2-clock-service-multi-card-lifecycle) |
| H1–H3 | [3](#phase-3--h1-h2-h3-release--ci-parity) |
| H4 | [4](#phase-4--h4-navigation-js-templates-trust-model) |
| H5 | [10](#phase-10--h5-typescript--build-strictness-incremental) |
| M1 | [8](#phase-8--m1-startup-preload-strategy) |
| M2 | [7](#phase-7--m2-registry-load-error-retry) |
| M3 | [6](#phase-6--m3-module-load-event-churn) |
| M4 | [9](#phase-9--m4-innerhtml--dom-injection-audit) |
| M5 | [5](#phase-5--m5-m6--translations-in-ci--coverage-tooling) |
| M6 | [5](#phase-5--m5-m6--translations-in-ci--coverage-tooling) |
| L1–L3 | [11](#phase-11--l1-l2-l3-polish) |

---

*Last updated: 2026-04-27 (H5 `noImplicitAny` enabled; `noImplicitOverride` + script; `strictNullChecks` prep). Update this file when audit IDs change or phases complete.*
