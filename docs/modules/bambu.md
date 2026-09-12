# Bambu Lab (Pro)

Live monitoring and control for [Bambu Lab](https://bambulab.com) printers — AMS trays, temperatures, fans, camera, print progress, and a multi-printer farm view — powered entirely by the [ha-bambulab](https://github.com/greghesp/ha-bambulab) Home Assistant integration.

## Requirements

- Ultra Card **Pro**
- [greghesp/ha-bambulab](https://github.com/greghesp/ha-bambulab) configured (local or cloud)
- Optional: enable the printer **Camera** switch for live snapshots

## Views

| View | What you get |
|------|----------------|
| **Printer** | Hero illustration (procedural SVG per model family) with AMS on top, nozzle/bed/chamber hotspots, status screen, controls, and job info |
| **Dashboard** | Tile layout: status + progress ring, temps, speed, fans with sliders, AMS strip, print details, optional camera |
| **Camera** | Full-width camera/image snapshot with status overlay and controls |
| **Farm** | Grid of all discovered printers (mini illustration, AMS, progress, ETA, HMS badge). Reorder / hide in the editor |
| **Compact** | Single row: active spool color, name, status, progress, nozzle/bed, ETA |

## Auto-discovery

Printers are found via HA’s device registry (`identifiers` domain `bambu_lab`, models `X1C`, `P1S`, `A1`, `A1MINI`, `H2D`, …). AMS / AMS Lite / AMS 2 Pro / AMS HT and External Spool devices are linked with `via_device_id`.

Entity resolution prefers `translation_key` on the entity registry row, then unique_id / entity_id suffix matching, so renamed devices still map correctly.

Capability flags (chamber temp, aux/chamber fan, dual nozzle, door, camera) come from which entities exist — A1-class printers hide chamber fan/temp automatically.

## Illustrations

Procedural SVG families:

- **Enclosed CoreXY** — X1 / P1 / P2S / X2D
- **Bedslinger** — A1 / A1 Mini / A2L
- **H2** — H2D / H2S / H2C / …

Optional **custom image** upload overrides the body while keeping hotspot overlays. Bambu product photos are not bundled (copyright).

## Controls

Pause / resume / stop (`button`), chamber light (`light`), speed profile (`select`), fan percentage (`fan.set_percentage`), nozzle/bed targets (`number`). Stop asks for confirmation.

## Configuration highlights

- View mode, printer picker (or farm order), style (`theme` / `dark` / `light` / `glass` / `carbon`)
- Animation intensity (`off` / `subtle` / `full`) with `prefers-reduced-motion` respected
- Section toggles: AMS, temps, fans, controls, camera, print details, speed, print job, thumbnail
- AMS layout (`stacked` / `grid` / `strip`) plus drag-to-reorder and hide per AMS / External Spool unit
- Camera mode (`snapshot` with a refresh interval, or `live` via `ha-camera-stream`)

## Files

| Path | Role |
|------|------|
| `src/modules/bambu-module.ts` | Module class (editor + preview) |
| `src/modules/bambu/` | Views, illustrations, controls, styles |
| `src/services/uc-bambu-service.ts` | Discovery + snapshot |
| `src/modules/printer-shared/` | Shared snapshot types + widgets |
