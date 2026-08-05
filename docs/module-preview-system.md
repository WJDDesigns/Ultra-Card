# Module preview system

One set of module code, previewed in four places, updated automatically.

```
                          src/modules/*.ts
                     (the real module implementations)
                                  │
            ┌─────────────────────┴─────────────────────┐
            │                                           │
   there IS a Home Assistant                  there is NO Home Assistant
            │                                           │
   src/components/                              src/website-demo/
   uc-module-preview.ts                    demo-hass + ha-shims + sample configs
            │                                           │
   ┌────────┴────────┐                    ┌─────────────┼──────────────┐
   │                 │                    │             │              │
 Add-Module     any HA surface      ultracard.io   docs/previews   README /
  picker        (docs panel…)        /modules       (CI PNGs)      anywhere
```

## The two halves, and why they must stay apart

**Inside Home Assistant** there is no need for sample data at all. Every module's
`createDefault(id, hass)` is already entity-aware — it inspects the user's `hass`
and binds an entity they actually own. So an honest live preview is just:

```ts
const mod = handler.createDefault(`uc_preview_${type}`, hass);
handler.renderPreview(mod, hass, undefined, 'dashboard');
```

That is all `<uc-module-preview>` does. The user sees the module running against
**their** entities before they add it.

**Outside Home Assistant** there is no `hass` to inspect, so `src/website-demo/`
supplies one: a simulated instance (`demo-hass.ts`), stand-ins for HA's own
elements (`ha-shims.ts`), and a curated sample config per module type
(`DEMO_TWEAKS` in `ucm-demo-entry.ts`).

> **Rule:** demo data never ships inside Home Assistant, and the staged marketing
> effects (drawer sliding, dog-duty yard, cleaning-zone heatmap) are website-only
> illustrations — not module output. Keep them in `src/website-demo/`.

## In-HA preview: `<uc-module-preview>`

```ts
import '../components/uc-module-preview';

html`<uc-module-preview .hass=${this.hass} type="gauge" .scale=${0.85}></uc-module-preview>`
```

It lazy-loads the module, renders it, and degrades to a quiet "Preview
unavailable" chip if anything throws. `pointer-events` is disabled — a preview is
never a control.

**Suggested placement in the Add Module picker.** The grid is deliberately clean,
so do not put a live preview on every tile: it would be heavy and noisy, and it
would bury the module names the picker exists to show. Add a preview affordance
instead (an eye icon on the tile, or hover on desktop) that opens the preview in
the panel you already use for details. The add flow stays one click; previewing
costs one extra click only for people who want it.

## The pipeline

```bash
npx webpack -c webpack.demo.config.js     # build the demo bundle
node scripts/capture-previews.mjs         # capture every module
node scripts/capture-previews.mjs --strict --only=gauge,text
```

Outputs:

| Path | What it is |
| --- | --- |
| `docs/previews/<type>.png` | one screenshot per module |
| `docs/previews/manifest.json` | machine-readable index — **the sharing contract** |
| `docs/MODULES.md` | human-readable gallery, grouped by category |

`.github/workflows/module-previews.yml` runs it:

- **push to main** — rebuild, recapture, commit changed PNGs, gallery and bundle.
- **pull request** — same capture with `--strict`; the run fails if any module
  throws or renders empty. This is a real regression gate: it catches a module
  that breaks at render time, which unit tests do not.

Each module is also classified `ok` / `needs-config` / `empty` / `error`, so a
module that quietly degrades into its "Select an entity" state is visible rather
than silently shipped as a screenshot of nothing.

## The manifest is the integration point

`docs/previews/manifest.json` is what makes this shareable in every direction:

```json
{
  "generatedAt": "2026-08-05T…",
  "ultraCardVersion": "3.7.0-beta3",
  "counts": { "total": 93, "free": 66, "pro": 27 },
  "modules": [
    { "type": "gauge", "title": "Gauge", "description": "…", "category": "content",
      "icon": "mdi:gauge", "pro": false, "tags": ["…"],
      "preview": "previews/gauge.png", "status": "ok" }
  ]
}
```

Anything can consume it without knowing about Ultra Card's internals — the
website, the README, release notes, a docs site, HACS metadata. It is served
free over jsDelivr at:

```
https://cdn.jsdelivr.net/gh/WJDDesigns/Ultra-Card@main/docs/previews/manifest.json
```

## How ultracard.io/modules stays current

The site does not vendor a copy of anything. Its page loader asks GitHub for the
current `main` commit, then loads the demo bundle from that immutable jsDelivr
URL, and rebuilds its catalog, counts and version badge from the bundle's own
module manifest at runtime.

So the release flow is simply: **merge to main.** CI rebuilds the bundle and the
gallery; the website picks up the new commit on the next page load. Adding a
module requires no website edit at all — only a sample config if its defaults
need one (`DEMO_TWEAKS`).

## Adding a module to the previews

1. Write the module as usual under `src/modules/`.
2. Open a PR — CI renders it and fails if it throws or comes out empty.
3. If it renders a "Select an entity" state, add an entry to `DEMO_TWEAKS`
   pointing it at demo entities (add them to `demo-hass.ts` if needed).

That is the whole maintenance burden, and CI tells you when it applies.
