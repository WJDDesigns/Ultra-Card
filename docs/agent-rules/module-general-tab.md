---
description: Canonical pattern for Ultra Card module renderGeneralTab editor UI
globs: src/modules/**/*.ts
alwaysApply: false
---

# Module General Tab — Canonical Pattern

## Prime directive: cross-module visual consistency

Every module's editor MUST look and feel identical to every other module's editor.
A user navigating from module A to module B should see the **same** section card
shape, the **same** field title/description typography, the **same** segmented
button style, the **same** chip-list behavior, the **same** color picker, the
**same** file upload. No bespoke widgets. No per-module CSS drift.

**The shared Lit components in [src/components/](src/components/) are the source of truth.**
NEVER hand-roll a custom `<button class="…-btn">`, `<div class="…-option">`,
`<input type="file">`, `<select>`, or any equivalent — always go through:

- `BaseUltraModule.renderSegmentedField(...)` → `<ultra-segmented>` (mutually exclusive choices)
- `BaseUltraModule.renderChipListField(...)` → `<ultra-chip-list>` (string/entity arrays)
- `BaseUltraModule.renderFileField(...)` → `<ultra-file-picker>` (file upload)
- `BaseUltraModule.renderIconField(...)` → `<ultra-icon-field>` (icon picker)
- `BaseUltraModule.renderColorField(...)` → `<ultra-color-picker>` (themed colors)
- `BaseUltraModule.renderSliderField(...)` (numeric sliders with reset)
- `BaseUltraModule.renderGapWithUnitField(...)` (numeric + unit selector)
- `BaseUltraModule.renderFieldSection(...)` / `renderSettingsSection(...)` (everything else)

If you find yourself reaching for a new bespoke pattern, the answer is **add a
property to the existing shared component** (e.g. `columns`, `variant`, `mode`)
— never duplicate the look in a new module.

The static canonical test in
[src/modules/\_\_tests\_\_/module-canonical-general-tab.test.ts](src/modules/__tests__/module-canonical-general-tab.test.ts)
enforces this with a forbidden-pattern regex set; if you introduce a new
bespoke widget, add its class name there too so future modules can't reintroduce it.

---

All module `renderGeneralTab` methods must follow this pattern. Use `src/modules/_module-template.ts` as the starting scaffold for new modules.

## Required Structure

```typescript
renderGeneralTab(module, hass, config, updateModule): TemplateResult {
  const m = module as MyModule;
  const lang = hass?.locale?.language || 'en';

  return html`
    ${this.injectUcFormStyles()}
    <div class="module-general-settings">
      ${this.renderSettingsSection(
        localize('editor.my.section_title', lang, 'Section Title'),
        localize('editor.my.section_desc', lang, 'Description text'),
        [
          {
            title: localize('editor.my.field', lang, 'Field Label'),
            description: localize('editor.my.field_desc', lang, 'Field description'),
            hass,
            data: { entity: m.entity || '' },
            schema: [{ name: 'entity', selector: { entity: {} } }],
            onChange: (e: CustomEvent) => {
              updateModule({ entity: e.detail.value.entity });
              this.triggerPreviewUpdate();
            },
          },
        ]
      )}
    </div>
  `;
}
```

## Key Rules

**Always use these helpers — never raw HTML equivalents:**

| Need | Use | Never use |
|------|-----|-----------|
| Section with fields | `this.renderSettingsSection(title, desc, fields[])` | `<div class="settings-section">` |
| Single field | `this.renderFieldSection(title, desc, hass, data, schema, onChange)` | `<div class="field-container"><ha-form>` |
| Boolean toggle | `this.booleanField('key')` in schema | `<ha-switch>` |
| Text input | `this.textField('key')` in schema | manual `<input>` |
| Select/dropdown | `this.selectField('key', options)` in schema | custom `<select>` |
| Entity picker | `this.entityField('key')` or `this.renderEntityPickerWithVariables(...)` | `ha-entity-picker` |
| Number input | `this.numberField('key', min, max, step)` in schema | `<input type="number">` |
| Range slider | `this.renderSliderField(title, desc, value, default, min, max, step, onChange, unit)` | manual `<input type="range">` |
| File / image upload | `this.renderFileField(title, desc, hass, value, onChange, accept?, labels?)` | `<input type="file">` |
| Chip list (strings or entities) | `this.renderChipListField(title, desc, hass, values, onChange, { mode, placeholder, variant?, entityDomains? })` | hand-rolled `.domain-chip` rows |
| Segmented source / mode | `this.renderSegmentedField(title, desc, value, segments, onChange)` | raw `<select>` or pill `<button>` rows for mutually exclusive options |
| Icon picker | `this.renderIconField(title, desc, hass, value, onChange)` | `<ha-icon-picker>` |
| Themed color | `this.renderColorField(title, desc, hass, value, defaultValue, onChange)` | raw `<ultra-color-picker>` without shared spacing (prefer helper for consistency) |
| Inject styles | `this.injectUcFormStyles()` | `FormUtils.injectCleanFormStyles()` or wrapping `${this.injectUcFormStyles()}` inside `<style>...</style>` (invalid nested `<style>`) |
| Preview refresh | `this.triggerPreviewUpdate()` | custom event dispatching |

## getStyles()

Include `BaseUltraModule.getSliderStyles()` whenever using `renderSliderField`:

```typescript
getStyles(): string {
  return `
    ${BaseUltraModule.getSliderStyles()}
    /* module-specific preview styles */
  `;
}
```

## Section Wrapper (Custom Content)

When a section needs non-form content (custom grids, color pickers, etc.), use inline styles matching `renderSettingsSection`:

```typescript
html`
  <div class="settings-section"
    style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;">
    <div class="section-title"
      style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;">
      ${title}
    </div>
    <!-- custom content -->
  </div>
`
```

## Entity Pickers with Variable Support

Use `renderEntityPickerWithVariables` when the field should accept HA custom variables (`$var_name`):

```typescript
${this.renderEntityPickerWithVariables(
  hass, config, 'entity', module.entity || '',
  (value: string) => { updateModule({ entity: value }); this.triggerPreviewUpdate(); },
  ['sensor', 'binary_sensor'], // optional domain filter
  localize('editor.my.entity', lang, 'Entity')
)}
```

## Segmented Layout Heuristic

`renderSegmentedField(title, desc, value, segments, onChange, columns?)` auto-picks a grid
layout when no `columns` is provided:

- 4 options → 2×2 grid (avoids "3 + 1 leftover" wrap)
- 6 options → 3 columns
- 8 options → 4 columns
- 9 options → 3×3 grid
- Otherwise → flex-wrap row

Override with the `columns` argument when you need an explicit shape (e.g. forced 2-up).

The component also renders a 12px gap between its title and the first row of buttons,
so the title never visually hugs the controls. If a label is set, the description is
tucked under it with a tighter -8px adjustment so it reads as a sub-line.

## Known Follow-Up: Global Design Tab `<select>` migration

`src/editor/global-design-tab.ts` (used by every module's Design tab) currently has
17 raw `<select>` elements for font weight, text transform, font style, alignment,
etc. They render with the browser-native dropdown styling instead of HA's. Migrating
them is mechanical (the pattern is `UcFormUtils.renderForm + selectField`) but
represents ~17 individual edits. The font picker also uses `<optgroup>` which HA's
selector doesn't currently support — that one needs a separate solution.

The file input and `<ha-switch>` in this file have already been migrated. This
carve-out is documented here so a future contributor can pick it up.

## Common Pitfalls (Catalog of Past Bugs)

These have all been observed and fixed across modules. Search the static canonical test
([src/modules/__tests__/module-canonical-general-tab.test.ts](src/modules/__tests__/module-canonical-general-tab.test.ts))
for the matching forbidden regex.

1. **Bespoke segmented widgets.** Custom `<div class="layout-style-option">`, `<button class="option-btn">`, `<button class="control-btn">`, `<div class="position-option">` and similar are forbidden. Use `renderSegmentedField`.
2. **`ha-form` field-name leaks.** When a `ha-form` schema uses an internal field name like `_add_data_item`, set `label: 'Friendly Name'` and pass `showLabels: true` (5th arg of `renderUcForm`) — otherwise the raw underscored name appears as the visible label.
3. **Styles defined in `getStyles()` are NOT loaded in the editor by default.** `getStyles()` only runs in `renderPreview`. If your editor uses classes (e.g. `.data-item-header`), inject them explicitly: `<style>${this.getStyles()}</style>` at the top of `renderGeneralTab` (after `injectUcFormStyles()`).
4. **`ha-expansion-panel` collapsed-content padding.** Setting `--expansion-panel-content-padding: 12px` leaks vertical padding under collapsed panels (height: 0 doesn't include padding). Use `--expansion-panel-content-padding: 0 12px` and apply vertical padding via `::part(content)` instead.
5. **`ha-select` reserved error-text space.** `ha-form` with a `select` selector reserves vertical space below for floating helper/error text. If that creates ugly gaps inside a custom container, scope CSS like `.my-container ha-form ha-select { margin-bottom: 0 !important; }` to your container only.
6. **Hardcoded English in `localize()` adjacency.** Don't write `${localize(...)} extra English text` — put the full string inside `localize()` so translations can cover it.
7. **Nested `<style>`.** Never wrap `${this.injectUcFormStyles()}` inside another `<style>` tag; `injectCleanFormStyles()` already returns its own `<style>`.
