# Unifying module styles with the theme engine

Status: proposal (audit complete, nothing implemented yet)
Scope: how bar styles, button surfaces, slider tracks and every other "internal
style" keep working while becoming layers of the theme engine, without
changing what any existing dashboard renders.

## 1. Where we are

The audit (September 2026) found three separate things that all get called
"style" in Ultra Card:

| Kind | What it decides | Examples | Count |
| --- | --- | --- | --- |
| **Surface** | how a filled shape is painted: flat, glossy, glass, neumorphic… | `button.style`, `bar.bar_style`, `slider_control.slider_style`, `spinbox.button_style`, `popup.trigger_button_style` | 5 modules, **3 near-identical vocabularies** |
| **Layout / variant** | what the module *is* shaped like | `grid.grid_style` (style_1…20), `navigation.nav_style`, `tabs.style`, `gauge.gauge_style`, `animated_clock.clock_style`, `toggle.visual_style`, `battery_monitor.style` | ~35 modules, ~40 vocabularies |
| **Palette / material** | colours, radius, blur, page background | theme tokens, Design tab, HA theme | one system (the theme engine) |

Only the first kind has duplicated implementations:

- `src/utils/uc-surface-styles.ts` is the shared map for button-like controls
  (button, popup trigger, spinbox).
- `src/modules/bar-module.ts` (~1611) and `src/modules/slider-control-module.ts`
  (~2520) each carry their own `switch` re-implementing glossy / embossed /
  inset / glass / metallic / neumorphic / neon for a *track + fill + overlay*
  geometry, plus `dashed`, `dots`, `minimal` that buttons never had.
- The names drift: buttons say `gradient-overlay` and `neon-glow`, the theme
  engine's `surface` token says `glass | neumorphic | glossy | outline |
  minimal | flat`.

The theme engine today can only *choose from each module's vocabulary*
(`theme.modules.bar.bar_style = 'glass'`), so a theme author has to know every
module. Fourteen modules honour that (`UC_THEME_MODULE_STYLE_KEYS`); a new
module gets nothing unless someone adds it to the allow-list. Modules store the
sentinel `'theme'` to defer, and legacy configs store literal values.

Backward compatibility today is by resolution, not migration: `'theme'` or
`undefined` resolves to the theme's value, else the module's historic default.
There is no config rewrite for styles, and there should not be one.

## 2. Target model: recipes × roles

Keep every existing dropdown. Behind them, replace the three surface
vocabularies with **one shared vocabulary of surface recipes** rendered for a
**role**, and let a theme set a recipe per role once.

```
theme.tokens.surface  ──derives──►  theme.tokens.recipes { control, track, fill, pane }
                                              │
module field ('theme' | recipe | legacy name) ─┴──► resolveSurface(role, value, theme)
                                              │
                                    uc-surface-recipes.ts: recipe × role → CSS
```

### 2.1 Recipes (one vocabulary)

`flat · glossy · embossed · inset · gradient · neon · outline · glass ·
metallic · neumorphic · dashed · dots · minimal`

Canonical names are the bar's, because the bar has the superset. Old names
stay accepted forever through an alias map (`gradient-overlay → gradient`,
`neon-glow → neon`); user YAML is never rewritten.

### 2.2 Roles (the geometry)

The reason bar and slider kept their own code is real: "glossy" on a 6 px
track is not the same CSS as "glossy" on a 44 px button. Roles capture that.

| Role | Used by | Output |
| --- | --- | --- |
| `control` | button, popup trigger, spinbox buttons, thermostat +/−, chips that act | background, border, shadow, backdrop, text colour |
| `track` | bar track, slider track, progress rails, toggle rails | background, border, inner shadow |
| `fill` | bar fill, slider fill, gauge arcs where applicable | background, overlay gradient, shadow |
| `pane` | grid tiles, entity rows, tab buttons, feed cards, area tiles | background, border, shadow (today's `--uc-pane-*`) |

`uc-surface-recipes.ts` holds one table `RECIPES[recipe][role]`. Phase A ports
the existing bar/slider/button CSS into it verbatim so the output is
byte-identical for every current (module, style) pair. A recipe a role does
not support (e.g. `dots` on `control`) falls back to `flat` for that role,
which is what those modules do today for unknown values.

Recipes also compute their text colour with `uc-theme-color.ts` instead of the
hard-coded `#333` metallic / `bg` outline in the current helper, which fixes
the last known contrast gap in module surfaces.

### 2.3 Theme sets recipes per role, once

```ts
tokens: {
  surface: 'glass',
  recipes: { control: 'glass', track: 'inset', fill: 'glossy', pane: 'glass' } // optional
}
```

When `recipes` is absent it is derived from `surface` (`glass → all glass`,
`neumorphic → control/pane neumorphic, track inset, fill flat`, and so on,
mirroring how `paneVars` already derives pane defaults). A theme author who
wants "buttons are glass but bars are flat" sets two words instead of walking
five module vocabularies. `theme.modules.*` keeps working and still wins over
`recipes` for the modules that have it, so no shipped theme changes meaning.

### 2.4 Module resolution (unchanged semantics, one code path)

```
explicit recipe on the module   → that recipe
'theme'                          → theme.modules[type][key] ?? theme.tokens.recipes[role] ?? derived-from-surface
undefined (legacy config)        → module's historic default (bar: flat, button: flat, …)
```

The third row is what keeps old installs pixel-identical: under HA Native
(`resolveTheme` → null) nothing is themed and every module keeps its default.
Editors keep prepending the `'theme'` option for new modules, and the option
label becomes "Theme default (Glass)" with the resolved recipe in parentheses
so users can see what deferring means.

### 2.5 Theme CSS gets stable hooks

Modules that render a surface emit `data-uc-surface="glass" data-uc-role="control"`
on the element. Themes that need more than the recipe table (Liquid Glass's
refraction filter, Gummy's gloss) target those attributes from `theme.css`
instead of guessing module class names. This is what lets "themes control
100 % of the look" without the engine growing a knob for every effect.

### 2.6 Layout / variant enums stay put

`grid_style`, `nav_style`, `tabs.style`, `gauge_style`, `clock_style`,
`toggle.visual_style` and friends are not surfaces; a theme should not turn a
speedometer gauge into a digital one. They keep `theme.modules` as the only
theme bridge. What changes: their *inner panes and controls* adopt the `pane`
and `control` roles, so a glass theme makes glass tab buttons and glass grid
tiles regardless of which layout is chosen. Visual-only entries stay in
`UC_THEME_MODULE_FIELDS`; `button_input` and `light.button_style` get added
(they are allow-listed but not editable today).

### 2.7 Per-module theme override: no

"Apply a theme per bar" would mean a second resolution axis and a second
picker in every module. The existing shape already covers the need: the card
picks a theme, a module can pin a recipe. If a user wants one bar to look
different, they pick `glossy` on that bar. Recommended answer: keep themes
card-scoped, recipes module-scoped.

## 3. Phases

Each phase ships on its own and leaves every dashboard rendering the same.

### Phase A: foundation (no visible change)

- `src/utils/uc-surface-recipes.ts`: recipe list, alias map, `RECIPES[recipe][role]`
  ported verbatim from `uc-surface-styles.ts`, `bar-module.ts` and
  `slider-control-module.ts`; `resolveSurface(role, value, theme)`.
- Golden tests: render every (module, legacy style value, use_gradient on/off)
  pair through the current code and freeze the CSS strings under
  `src/utils/__tests__/surface-goldens/`. These are the contract for B and D.
- `uc-theme-types.ts`: `tokens.recipes?`, `UcSurfaceRecipe`, `UcSurfaceRole`;
  validator and trust scanner accept the new token; WordPress sanitizer mirrors.

### Phase B: the five surface modules switch over

- button, popup, spinbox call the helper for `control`; bar and slider for
  `track` + `fill`. The bar/slider `switch` blocks are deleted.
- Data attributes emitted. Goldens must pass unchanged; the only accepted
  diff is the metallic/outline text-colour contrast fix, recorded in the
  golden update.
- `uc-surface-styles.ts` becomes a thin re-export and is removed at E.

### Phase C: themes speak recipes

- `paneVars`-style derivation from `surface` to `recipes`; `getHostVars`
  exposes `--uc-recipe-control/track/fill/pane` for CSS-only consumers.
- Built-ins gain explicit `recipes` where the derived default is wrong
  (Metallic: `control metallic, track inset, fill glossy`; Neumorphic:
  `track inset`).
- Hub theme editor and website builder: Simple mode gets one "Surfaces" row
  (Controls / Tracks / Fills / Panes) that replaces the per-module dropdowns;
  Advanced keeps the per-module overrides. Preview runtime
  (`uc-theme-runtime.php`) renders the same recipe table so the site preview
  matches HA.

### Phase D: panes everywhere

- Grid tiles, auto-entity rows, tabs buttons, activity-feed cards, area
  tiles, UniFi rack chrome adopt `pane` / `control` roles for their inner
  surfaces while keeping their layout enums. This finishes the "all layers"
  goal from the pane sweep: today they read `--uc-pane-*` for colour, after D
  they also take the recipe's gloss/shadow/border treatment.
- Each module is a small PR with its own golden.

### Phase E: cleanup

- Remove `uc-surface-styles.ts`; drop the never-editable legacy `dashed` /
  `dots` from `button.style` types (values still resolve via alias for old
  configs); trim `UC_THEME_MODULE_FIELDS` to layout vocabularies plus the
  per-module surface overrides.
- Docs: one page listing recipes, roles, the derivation table, and the data
  attributes for theme CSS authors; builder hint text points to it.

## 4. Backward compatibility guarantees

1. **No config rewrite.** Style fields are never migrated; legacy literal
   values keep their meaning through the alias map. `_config_version` stays
   at 3.
2. **HA Native is a no-op.** A card without `uc_theme` and no global default
   renders through the same recipe table with the module's historic default,
   and the Phase A goldens prove it stays byte-identical.
3. **`theme.modules` outranks `tokens.recipes`.** Every shipped and community
   theme keeps its per-module choices; `recipes` only fills gaps.
4. **Old themes without `recipes`** derive from `surface`, which is exactly
   what the per-module fallbacks do today, so a catalog theme from before
   Phase C renders the same after it.
5. **Old cards on a new theme** work because resolution is on read; nothing
   is stored in the card.
6. **Old plugin / new card and vice versa**: `recipes` is an optional token;
   the PHP sanitizer passes unknown tokens through already, and the TS
   validator drops unknown keys, so version skew degrades to "derived from
   surface", never to a broken theme.

## 5. Risks and how they are contained

| Risk | Containment |
| --- | --- |
| A recipe port subtly changes a bar's look | Phase A goldens across every (style, gradient) pair; B cannot merge with a diff outside the declared contrast fix |
| Two ways to say the same thing (`modules.bar.bar_style` vs `recipes.track`) confuse authors | Simple mode only shows `recipes`; Advanced shows module overrides labelled "override"; docs state the precedence in one line |
| Theme CSS depending on `data-uc-*` attributes breaks when a module refactors | Attributes are part of the theme contract, covered by a test that asserts each surface module emits them |
| Bundle growth from one large table | Recipe table is plain data, ~3 KB; the deleted bar/slider switches are larger |
| Website preview drifts from HA | Runtime shares the same recipe JSON; a test diff-checks `uc-theme-runtime.php`'s table against the TS export at build |

## 6. Decisions needed

1. Canonical recipe names: bar's vocabulary (`gradient`, `neon`) as proposed,
   or keep the button's (`gradient-overlay`, `neon-glow`) and alias the bar.
   Either is fine technically; the plan assumes the shorter bar names.
2. Whether Phase D includes navigation. Its `uc_*` presets are whole layouts
   with their own glass/neumorphic variants; adopting roles there is a bigger
   refactor and can be a separate track.
3. The dropdown label "Theme default (Glass)": shows the resolved recipe for
   the theme the editor currently sees. Confirm that is wanted over the
   plain "Module default".

## 7. Effort

Phase A ≈ 2 days (mostly goldens), B ≈ 2 days, C ≈ 3 days (engine, two
editors, runtime), D ≈ 1 day per module family, E ≈ 1 day. A through C can
ship together as one release with no user-visible change except the new
Surfaces row in the theme editors.
