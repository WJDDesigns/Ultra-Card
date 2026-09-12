# 3D Printer (Free)

Generic 3D printer card for any Home Assistant printer integration — OctoPrint, Moonraker/Klipper, PrusaLink, or fully manual entity mapping. For Bambu Lab printers with AMS and farm view, use the **Bambu Lab** Pro module instead.

## Layouts

| Layout | What you get |
|--------|----------------|
| **Hero** | Procedural printer illustration with temp hotspots, controls, job info |
| **Standard** | Status header, temps, controls, fans, progress, job, optional camera |
| **Compact** | Single row: name, status, progress, nozzle/bed |
| **Camera** | Camera-first with status overlay and controls |

## Entity mapping

Bind entities for status, progress, nozzle/bed/chamber temps (+ targets), remaining/end time, layers, file name, camera/thumbnail, pause/resume/stop, light, up to three fans, and extra stats.

### Auto-fill

Choose a source (**OctoPrint**, **Moonraker**, or **PrusaLink**), pick a discovered device, then **Auto-fill entities**. Mappings are heuristic (entity_id / unique_id patterns) and remain editable afterward.

## Illustration

- **Enclosed** / **Bedslinger** — procedural SVG (no brand marks)
- **None** — data only
- **Custom image** — upload your own photo

## Controls

Actions call the right service by domain: `button.press`, `switch`/`light` toggle, `script.turn_on`, `fan.set_percentage`.

## Files

| Path | Role |
|------|------|
| `src/modules/printer-3d-module.ts` | Module class |
| `src/services/uc-printer-autofill.ts` | OctoPrint / Moonraker / PrusaLink auto-fill |
| `src/modules/printer-shared/` | Shared snapshot + widgets |
