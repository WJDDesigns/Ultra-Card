# M4 — `innerHTML` / `unsafeHTML` inventory

**Purpose:** Classify DOM injection sites for XSS review (Phase 9 / audit **M4**).  
**Scope:** `src/**/*.ts` (excluding `node_modules`). Last sweep aligned with code at inventory creation.

## Legend

| Trust        | Meaning |
| ------------ | ------- |
| **Constant** | Static markup or i18n defaults only. |
| **Sanitized** | Passed through `sanitizePresetHtml`, `sanitizeMarkdownHtml`, `sanitizeRichTextHtml`, or DOMPurify-backed helper. |
| **Escaped** | Dynamic strings passed through `escapeHtml` before string templates / `innerHTML`. |
| **HA / user** | Home Assistant state, entity IDs, templates, imported configs, or remote API HTML. |
| **Third-party** | Nested HA custom cards or DOM we do not control. |

## `unsafeHTML(` (Lit)

| Location | Data source | Trust | Notes |
| -------- | ----------- | ----- | ----- |
| `editor/uc-presets-selector-tab.ts` | Preset / WordPress descriptions | **Sanitized** | `sanitizePresetHtml` before `unsafeHTML`. |
| `panels/tabs/hub-presets-tab.ts` | Preset description | **Sanitized** | `_getSanitizedPresetDescription`. |
| `modules/text-module.ts` | Rich text content | **Sanitized** | `sanitizeRichTextHtml`. |
| `editor/tabs/layout-tab.ts` | `_createColumnIconHTML(proportions)` | **Constant** | Layout proportions → generated SVG/markup; no external HTML. |
| `modules/popup-module.ts` | `localize(...)` defaults + keys | **Constant** | English defaults are trusted; translators should not ship script tags in JSON. |

## `.innerHTML` / property `.innerHTML`

| File | Approx. use | Data source | Trust | Notes |
| ---- | ----------- | ----------- | ----- | ----- |
| `services/external-card-container-service.ts` | Error placeholder | `cardType` | **Escaped** | `escapeHtml(displayName)`. |
| `services/uc-entity-picker-enhancer.ts` | Variable chips + “unknown” row | Variable names / entities | **Escaped** | `escapeHtml` on attributes and replacement text. |
| `components/uc-simple-entity-mapper.ts` | Preset entity mapping dialog | Entity IDs, titles, context | **Escaped** | `escapeHtml` on all interpolated strings. |
| `modules/graphs-module.ts` | Chart tooltip | Series / time / value strings | **Escaped** | `escapeHtml` on tooltip lines. |
| `modules/markdown-module.ts` | `.innerHTML=${renderedContent}` | Markdown pipeline | **Sanitized** | Success + **error** paths use `sanitizeMarkdownHtml` before assignment. |
| `services/directories-pro-presets-api.ts` | `_stripHtml` / `_decodeHtmlEntities` | Remote / stored HTML | **Parse-only** | Used to derive `textContent`; not inserted into live UI. |
| `services/uc-confirm-service.ts` | Modal overlay | Mostly static | **Constant** | Confirm copy. |
| `services/uc-action-confirmation-service.ts` | Overlay | Mostly static | **Constant** | |
| `modules/camera-module.ts` | Fullscreen UI, icons | Static + HA elements | **Mixed** | Load-fail panel: `escapeHtml` on labels; retry uses `addEventListener` (no inline handlers / no `window.retryCamera_*`). |
| `modules/native-card-module.ts` | Card container | `cardType` / config | **Third-party** | Embeds other cards; treat as HA-trusted boundary. |
| `modules/external-card-module.ts` | Same pattern | **Third-party** | |
| `modules/image-module.ts` | Container markup on `<img>` `@error` | `localize()` + numeric/CSS layout fields | **Constant / i18n** | No raw state HTML in template; localized strings only. |
| `modules/dropdown-module.ts` | Drag ghost label | `textContent` → span | **Escaped** | `escapeHtml(optionLabel)` before ghost `innerHTML`. |
| `modules/dropdown-module.ts` | Portal clone sync | `dropdownElement.innerHTML` | **HA** | Copies HA picker subtree; see inline trust-boundary comment in module. |
| `modules/popup-module.ts` | Portal clear | `''` | **Constant** | |
| `services/uc-video-bg-service.ts` | Clear layer | `''` | **Constant** | |
| `modules/map-module.ts` | Clear placeholder | `''` | **Constant** | |

## `insertAdjacentHTML`

| File | Trust | Notes |
| ---- | ----- | ----- |
| `modules/camera-module.ts` | **Constant** | Modal shell; verify `modalHTML` construction if extended. |

## Gaps / follow-ups

1. **Remaining `innerHTML` rows** — `image-module` / `dropdown-module` classified above; revisit if HA picker markup or image URLs gain untrusted sources.
2. **Lit `unsafeStatic` / `raw`:** not listed; grep again if introduced.

## Related utilities

- `src/utils/html-sanitizer.ts` — `sanitizePresetHtml`, `sanitizeMarkdownHtml`, `sanitizeRichTextHtml`, `escapeHtml`.
