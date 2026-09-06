# Ultra Dashboard

Ultra Dashboard is a complete Home Assistant dashboard generated from your areas
and floors, built entirely out of Ultra Cards. It ships inside Ultra Card and is
free.

Pick it from **Settings → Dashboards → Add dashboard → Community dashboards**
(Home Assistant 2026.5 or newer). The next screen is the style picker and the
options below; every one has a sensible default, so **Next** straight away
works too. Then give the dashboard a name and it is built.

## What you get

- **Home page**: a clock and weather header, a tile for every room grouped by
  floor, then People, Alerts, Batteries and Updates. Room tiles open that room's
  page.
- **A page per area** (or per floor): the room tile with temperature, humidity,
  lights and quick actions, then a block for each thing the room has, built
  from the module that suits it:
  - **Lights**: Bright / Dim / Off scene buttons, a brightness slider per
    dimmable light, a toggle grid for on/off ones. Members of a light group
    hide behind the group and a WLED strip shows one light, not one per segment.
  - **Climate**: the Home Assistant thermostat card, a 24h temperature and
    humidity chart, humidifier controls.
  - **Media**: a full player card for a lone speaker, compact rows otherwise.
  - **Appliances**: washer, dryer, dishwasher, fridge and range cards when a
    device by that name is in the room.
  - **Security**: doors, windows, motion and presence as status rows.
  - **Switches** and **Scenes** as tap grids; **Covers**, **Fans**, **Locks**,
    **Cameras** with their own modules.
  - **Environment**: CO₂, air quality, light level, power and the like as level
    bars, other readings as an info grid.
  - **More**: everything left over, folded into an accordion. Unavailable
    controls land here too, so a room never shows a dead button.
- **Each room gets its own accent colour** (except in the Bold style, which
  uses your theme accent everywhere), so pages do not read as one page repeated.
- **Everything is an Ultra Card.** Section titles are Home Assistant heading
  cards; every other card is a `custom:ultra-card` you can open in the visual
  editor after taking control.

Only free modules are used. Config and diagnostic entities, hidden entities and
phone (`mobile_app`) sensors never appear on a room page, and an area that has
nothing to control and fewer than four readings does not get a page of its own
unless you list it under **Only these areas**.

## Options

Open the dashboard's pencil menu → **Edit dashboard** to change these. They are
stored under `strategy:` in the dashboard config.

```yaml
strategy:
  type: custom:ultra-dashboard
  style: material # glass | bold | monochrome | material
  group_by: area # area (a page per area) | floor (a page per floor)
  areas: [] # only these area ids; empty means every area with devices
  exclude_areas: [] # areas to leave out
  home_view: true
  show_people: true
  show_alerts: true
  show_batteries: true
  show_updates: true
  weather_entity: weather.home # default: your first weather entity
```

| Style      | Look                                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| Glass      | Translucent panels with a fine border; made for wallpapers.                            |
| Bold       | Large radius, deep shadow and your theme accent on every room.                         |
| Monochrome | Outlined controls and a desaturated card: one ink, no colour.                          |
| Material   | Material Design 3: tonal elevated cards, 12dp corners, pill controls. The default.     |

Each style is an Ultra Card theme; generated cards carry `uc_theme: <style>` so
the whole dashboard can be re-themed from the Hub's Themes tab. Dashboards saved
with the retired `classic` or `soft` styles resolve to `material`.

Areas with no entities get no page. Config and diagnostic entities (signal
strength, restart buttons) never appear on a room page.

## Taking control

A strategy dashboard regenerates itself when areas or devices change. When you
want to customise it, use **Edit dashboard → ⋮ → Take control**. Home Assistant
writes the generated config to the dashboard, the strategy is removed, and every
card is an ordinary Ultra Card: open one and you are in the Ultra Card editor
with its rows, columns and modules.

Tip: pick your style and options _before_ taking control; afterwards the
dashboard no longer follows the strategy settings.

## Just one room

The area page is also available as a **view strategy** you can put in any
dashboard:

```yaml
views:
  - title: Kitchen
    path: kitchen
    strategy:
      type: custom:ultra-dashboard-area
      area: kitchen
      style: glass
```

## Notes for developers

- Entry-side shim: `src/strategy/ultra-dashboard-strategy.ts` defines
  `ll-strategy-dashboard-ultra-dashboard` and `ll-strategy-view-ultra-dashboard-area`
  and pushes the `window.customStrategies` entry. Generation and the config
  editor live in the lazy `uc-strategy.*` chunk (`uc-dashboard-generator.ts`,
  `ultra-dashboard-strategy-editor.ts`).
- The registry entry carries `images: { light, dark }` (inline SVG data URIs
  from `uc-dashboard-preview-images.ts`, 160x160 like the built-in previews).
  Home Assistant's New Dashboard dialog only shows images for its built-in
  strategies today; the field matches the built-in shape and is proposed
  upstream, so the tile gets its picture once that lands.
- Cards are built from each module's `createDefault()` so a generated module is
  byte-for-byte what the editor would add, with the strategy's overrides on top.
- Registries come from `hass.areas` / `hass.floors` / `hass.devices` /
  `hass.entities` when present, else the `config/*_registry/list` websocket
  commands.
- Navigation from Home tiles uses `hass.panelUrl`, which is the dashboard being
  generated.
