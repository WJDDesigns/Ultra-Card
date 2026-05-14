# Design area tabs — audit (Ultra Card editor)

This document records the sanity check for tabs in the editor **design area** (`ultra-layout-tab`): modules (including layout modules), layout-module **children**, **tabs-section** children, **rows**, and **columns**.

## Automated tooling

- **`npm run audit:module-tabs`** — AST scan of `src/modules/*-module.ts` for `renderGeneralTab` / `renderActionsTab` / `renderOtherTab` / `renderDesignTab` / `renderYamlTab` overrides: verifies the 4th parameter (`updateModule`) is invoked or passed to `super`/helpers. Special cases: `return null` only → `na`; `renderGeneralTab` with no callback usage → `informational` (e.g. `pagebreak`).
- Latest JSON summary (example run): `pass: 138`, `informational: 1` (`pagebreak` general tab), `na: 2` (`video_bg` `renderDesignTab` / `renderActionsTab` return null), `warn: 1` (`dropdown-module.ts` ~1555 — parses as 0 params; likely false positive / non-standard declaration).

## Vitest (jsdom)

- `vitest.config.ts` uses `environment: 'jsdom'` and `src/__tests__/setup.ts` stubs common `ha-*` tags with **open** shadow roots containing native controls where needed.
- Integration tests under `src/editor/tabs/__tests__/` mount `LayoutTab`, drive tabs, and assert `config-changed` / `updateModule` behavior. See `EMPTY_GENERAL_TAB` in `all-modules-general-tab.test.ts` for module types whose general tab is HA-form-heavy or non-interactive in stubs (smoke mount only).

---

## 1. Entity contexts and tab ids (`layout-tab.ts`)

| Context | State field | Tabs shown |
|--------|-------------|--------------|
| Module (incl. layout modules: `horizontal`, `vertical`, `stack`, `accordion`, `popup`, `slider`, `tabs`) | `_activeModuleTab` | `general`, `yaml` (external_card only), `actions` (if handler implements), `logic`, `design` — **Other** tab is globally disabled (`hasOtherTab = false`, see ~23512). |
| Row | `_activeRowTab` | `general`, `actions`, `logic`, `design` |
| Column | `_activeColumnTab` | `general`, `actions`, `logic`, `design` |
| Child inside `tabs` module section | `_activeTabsChildTab` | `general`, `yaml` (external_card), `actions`, `logic`, `design` — **Other** stub removed. |

**Config update path:** `_updateModule` / `_updateModuleDesign` / `_updateLayoutChildModule` / `_updateTabsSectionChild` / `_updateRow` / `_updateColumn` → `_updateLayout` → `_updateConfig` → `dispatchEvent('config-changed', { detail: { config } })`.

---

## 2. Design tab implementations

| Surface | Component | Used for |
|---------|-----------|----------|
| Row / column / module (main editor path) | `ultra-global-design-tab` (`src/editor/global-design-tab.ts`) | Accordion sections call `_updateProperty` / `_updateSpacing` → `onUpdate` or `design-changed`. |
| Per-module default from `BaseUltraModule` | `GlobalDesignTab.render` → `uc-responsive-design-tab` (`src/tabs/global-design-tab.ts`) | Many modules’ `renderDesignTab`; **tabs-section child** design path uses the module handler’s `renderDesignTab`, so users see `uc-responsive-design-tab` there. |

### `ultra-global-design-tab` — custom targeting

- Wired **CSS variable prefix**, **Extra CSS classes** (`extra_class`), and **Element ID** (`element_id`) in the Custom Targeting accordion.
- `_resetSection` and `_hasModifiedProperties` include `custom_targeting` for all three fields.

---

## 3. Code hygiene fixes (this pass)

- Removed unused `_activeDesignSubtab` state.
- Removed dead duplicate `_renderLogicTab` (live logic UI uses `GlobalLogicTab` via `_renderModuleLogicTab`).
- Removed erroneous `isBarModule` line from `_renderRowDesignTab` (referenced out-of-scope `module`).
- Removed legacy `_renderTabsSectionChildOtherTab` stub; dropped `hasOtherTab` / `other` tab wiring for **tabs-section child** panel only (global `hasOtherTab = false` for top-level modules unchanged by product decision).

---

## 4. Residual notes

- **Module “Other” tab** remains globally hidden in `_renderModuleSettings` / layout-child settings; `BaseUltraModule.renderOtherTab` still exists for potential future use.
- **E2E in Home Assistant** is not covered here; real `ha-form` / editors may differ from stubs.
