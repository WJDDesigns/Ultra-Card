# Navigation JavaScript templates (`[[[ ... ]]]`)

Ultra Card’s **Navigation** module can resolve certain string fields using either **Jinja2** (Home Assistant templates, `{{ }}`) or a separate **JavaScript** escape hatch written as `[[[ ... ]]]`.

## What `[[[ ... ]]]` does

The inner JavaScript runs in a restricted wrapper with parameters such as `hass`, `states`, `route`, `nav`, `config`, and `user`. It is implemented with `new Function` in the browser (same broad trust model as running dashboard JavaScript you paste yourself).

Use it only when you need logic that is awkward in Jinja2. Prefer **`{{ }}` templates** for entity state, `states()`, and most conditional UI.

## When JavaScript is **disabled** (blocked)

For configs marked as **untrusted**, `[[[ ... ]]]` is **not executed**; the expression is treated as empty / non-JS text and a console warning may appear.

That applies when any of the following is true:

- **`disable_navigation_js_templates: true`** on the card root (YAML) — blocks JS for every origin; see [Enterprise](#enterprise--hardening-disable-all-navigation-js-on-a-card) below.
- **`_contentOrigin`** is **`imported`** — layout/card/row/module brought in via clipboard, shortcode import, or the import dialog paths that merge external JSON into your card.
- **`_contentOrigin`** is **`preset_community`** — presets tagged as community in the marketplace flow.

## When JavaScript is **allowed**

- **`local`** (default when you build the card yourself in the editor).
- **`preset_standard`** — first-party / standard presets (e.g. `wp-*` id or `standard` tag in the preset flow).
- **`undefined`** — treated like first-party for backward compatibility on old configs that predate `_contentOrigin`.

## How `_contentOrigin` is set (editor)

The layout editor sets `_contentOrigin` when you:

- Import a **full card** or **full layout** from clipboard → **`imported`**.
- Add an **imported row** (with or without entity mapping) → **`imported`**.
- Paste a **row from clipboard** next to an existing row → **`imported`**.
- Use the **import** event for **layout** or **module** from shared export data → **`imported`**.
- Apply a **preset** → **`preset_community`**, **`preset_standard`**, or inherited from the current card, depending on preset metadata.

First-party YAML you type by hand in raw mode is still your responsibility; the editor does not mark it `imported` unless it came through an import path above.

Implementation detail: the boolean gate lives in [`src/services/uc-navigation-js-gating.ts`](../src/services/uc-navigation-js-gating.ts) (re-exported from `uc-navigation-service` for convenience).

## Enterprise / hardening: disable all navigation JS on a card

Set **`disable_navigation_js_templates: true`** on the **Ultra Card** root config (Lovelace YAML). Navigation still resolves `{{ }}` Jinja; only `[[[ ... ]]]` JavaScript is skipped (returns empty / non-JS behavior with a possible console warning).

This applies regardless of `_contentOrigin` — use it for high-assurance dashboards where even first-party configs must not run `new Function` in the nav layer.

Implementation: [`src/services/uc-navigation-js-gating.ts`](../src/services/uc-navigation-js-gating.ts).
