# UI harness

`scripts/ui-harness/` checks every module the way a user meets it: on a real Home
Assistant, in light and dark, at desktop and phone widths, with its editor open.
Run it before a beta or stable release, or after any change to shared styles.

```bash
npm run build && HA_DEPLOY_HOSTS=192.168.4.55 node deploy.js   # the build under test must be on the HA
npm run ui:harness -- --headed                                 # watch it, or drop --headed
open .harness-output/ui-harness/<timestamp>/index.html
```

## What it does

For each module type in the registry:

1. Builds a config from the module's own `createDefault(id, hass)`, which binds
   entities you actually own, plus the small fixture set in `page-fixtures.js`
   (layout containers get children; a few modules get an entity picked by domain).
2. Renders it in a real `ultra-card` element drawn over a dashboard you name with
   `--dashboard` (the dashboard itself is never edited).
3. Screenshots it at 460px (desktop column) and 374px (phone) in HA's default
   light and dark themes, and runs the checks below on each.
4. Clicks each control once (desktop, last theme) and records what happened.
5. Opens the card editor, opens the module's settings, and screenshots and checks
   every tab (General, Actions, Logic, Design …) in both themes.

Output goes to `.harness-output/ui-harness/<timestamp>/`: `index.html` (browse by
module, filter to problems), `results.json`, and `shots/`.

## Checks

| Check | Severity | Meaning |
| --- | --- | --- |
| `empty-render` | error | Nothing visible rendered |
| `horizontal-scroll` | error | Content wider than the card |
| `invisible-text` | error | Text contrast under 1.6:1 |
| `raw-value` | error | `undefined`, `NaN` or `[object Object]` on screen |
| `raw-translation-key` | error | A localize key like `editor.foo.bar` on screen |
| `console-error` | error | Console or page error while the module was on screen |
| `overflow` | warn | An element paints outside the card |
| `low-contrast` | warn | Text contrast under 3:1 (2.2:1 for large text) |
| `clipped-text` | warn | Text cut off with no ellipsis |
| `text-overlap` | warn | Two labels drawn over each other |
| `small-target` | warn on phone | Control smaller than 24×24px (20px on desktop, info only) |
| `dead-click` | warn | Looks clickable, but clicking did nothing |
| `template-leak` | warn | Jinja/JS template source visible on a card |
| `broken-image` | warn | An image failed to load |
| `state-message` | info | The module shows an error/unavailable/"select an entity" text |

Contrast is skipped where an image, gradient or backdrop blur sits behind the
text, since computed styles cannot say what is actually painted there.

## Safety

The harness runs against a live instance, so writes are blocked in the page:
cards and editors get a copy of `hass` whose `callService`, mutating `callWS` /
`sendMessagePromise` messages and non-GET `callApi` calls are recorded instead of
sent, and the events a card fires to open more-info, run an action, open a dialog
or navigate are swallowed. The report shows each click as what it *would* have
done (for example `calls light.toggle (light.kitchen)`).

## Options

`--url`, `--dashboard`, `--only=gauge,text`, `--themes=dark`, `--skip-editor`,
`--skip-interactions`, `--skip-mobile`, `--clicks=6`, `--headed`, `--slowmo=150`,
`--out=DIR`. The token comes from `HA_TOKEN` or the file in `HA_TOKEN_FILE`
(default `~/.ha55-token`) and is only ever handed to the browser.

Rebuild just the report from an existing run with
`node scripts/ui-harness/report.mjs <run dir>`.

## Requirements

The build on the HA must include the harness hook in `src/index.ts`: it exposes
the module registry as `window.__UC_HARNESS__`, but only when the page's
`localStorage` has `uc-ui-harness` set, which the harness does for its own
browser profile. Normal users never get it.

## Adding a fixture

If a module renders an empty or "select an entity" state in the report, first ask
whether its `createDefault` should bind something on its own (that fixes it for
users too). Only if not, add an entry to `window.__ucFixtures` in
`page-fixtures.js`.
