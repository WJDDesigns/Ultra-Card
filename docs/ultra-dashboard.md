# Ultra Dashboard

Ultra Dashboard is a complete Home Assistant dashboard generated from your areas
and floors, built entirely out of Ultra Cards. It ships inside Ultra Card and is
free.

Pick it from **Settings → Dashboards → Add dashboard → Community dashboards**
(Home Assistant 2026.5 or newer). No YAML, no configuration required; every
option below has a sensible default.

## What you get

- **Home page**: a clock and weather header, a tile for every room grouped by
  floor, then People, Alerts, Batteries and Updates. Room tiles open that room's
  page.
- **A page per area** (or per floor): the room tile with temperature, humidity,
  lights and quick actions, followed by Lights, Climate, Media, Covers, Fans,
  Locks, Cameras, Security, Switches and More, each only when the room has
  something for it.
- **Everything is an Ultra Card.** Section titles are Home Assistant heading
  cards; every other card is a `custom:ultra-card` you can open in the visual
  editor after taking control.

Only free modules are used (`area_summary`, `auto_entity_list`, `media_player`,
`cover`, `fan`, `lock`, `camera`, `people`, `weather`, `clock`, `alert_center`,
`battery_monitor`, `update_monitor`, `horizontal`).

## Options

Open the dashboard's pencil menu → **Edit dashboard** to change these. They are
stored under `strategy:` in the dashboard config.

```yaml
strategy:
  type: custom:ultra-dashboard
  style: soft # classic | soft | glass | bold
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

| Style   | Look                                                              |
| ------- | ----------------------------------------------------------------- |
| Classic | The standard card look of your theme.                             |
| Soft    | Rounded corners, no borders, a light shadow. The default.         |
| Glass   | Translucent panels with a fine border; made for wallpapers.       |
| Bold    | Large radius, deep shadow and your theme accent on every room.    |

Areas with no entities get no page. Config and diagnostic entities (signal
strength, restart buttons) never appear on a room page.

## Taking control

A strategy dashboard regenerates itself when areas or devices change. When you
want to customise it, use **Edit dashboard → ⋮ → Take control**. Home Assistant
writes the generated config to the dashboard, the strategy is removed, and every
card is an ordinary Ultra Card: open one and you are in the Ultra Card editor
with its rows, columns and modules.

Tip: pick your style and options *before* taking control; afterwards the
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
- Cards are built from each module's `createDefault()` so a generated module is
  byte-for-byte what the editor would add, with the strategy's overrides on top.
- Registries come from `hass.areas` / `hass.floors` / `hass.devices` /
  `hass.entities` when present, else the `config/*_registry/list` websocket
  commands.
- Navigation from Home tiles uses `hass.panelUrl`, which is the dashboard being
  generated.
