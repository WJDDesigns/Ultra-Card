# Website module demo bundle

`src/website-demo/` builds `dist-demo/ultra-card-demo.js`, the bundle that powers the
live module previews on <https://ultracard.io/modules>. It compiles the **real module
implementations** (each module's `createDefault()` + `renderPreview()`) together with:

- `demo-hass.ts` — a simulated Home Assistant (sample entities, interactive
  `callService`, synthesized history/calendar APIs, and a demo
  `sensor.ultra_card_pro_cloud_authentication_status` so PRO modules render unlocked).
- `ha-shims.ts` — minimal stand-ins for HA frontend elements (`ha-icon` renders the
  MDI webfont via a shared constructable stylesheet; `ha-slider`, `ha-switch`, etc.).
  NOTE: shims must never mutate their light DOM in `attributeChangedCallback` —
  that corrupts lit's part indexing during template cloning.
- `ucm-demo-entry.ts` — defines `<uc-module-demo type="gauge">` and per-type
  `DEMO_TWEAKS` that bind demo entities / child modules so nothing renders empty.

## Build

```bash
npx webpack -c webpack.demo.config.js
```

Output: `dist-demo/ultra-card-demo.js` (not part of the normal HACS build).

## Deployment

The modules page loads the bundle from jsDelivr pinned to a commit:

```
https://cdn.jsdelivr.net/gh/WJDDesigns/Ultra-Card@<commit-sha>/dist-demo/ultra-card-demo.js
```

**After each release that adds/changes modules:** rebuild the bundle, commit
`dist-demo/ultra-card-demo.js`, and update the pinned SHA in the WPBakery Raw HTML
block on the Modules page (page ID 1242) — plus the version badge/counts in that block.
