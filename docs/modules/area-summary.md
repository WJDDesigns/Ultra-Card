# Area / Room Summary

Free module type: `area_summary`.

## What it does

Renders a **room tile** for one Home Assistant **area**. It loads the area, device, and entity registries over the WebSocket API, finds entities linked to that area (including entities placed on devices in the area), then shows:

- Room title (area name or override) and optional climate / humidity summary
- **Quick actions**: circular shortcuts for discovered entities (lights, climate, motion, doors/windows, media, people, covers, fans, locks, switches), with optional **entity names** beside each shortcut
- **Style presets**: Iconic soft, Graph glow, Compact controls, Photo overlay
- **Lights pill** (Compact controls): toggles all lights in the area on or off with `light.turn_on` / `light.turn_off` targeting the area
- **Climate pill** (Compact controls): opens more-info for the first climate entity in the area

## Setup in Home Assistant

1. In HA, assign devices and/or entities to the correct **Area** (Settings → Areas & zones).
2. In Ultra Card, add the **Area / Room Summary** module.
3. Pick the **Area** in the General tab. The tile fills in automatically.

## Options

| Option | Description |
|--------|-------------|
| **Area** | Required. Drives discovery. |
| **Title override** | Optional; defaults to the area name. |
| **Temperature entity override** | Optional. Forces the temperature summary source instead of auto-discovery. |
| **Humidity entity override** | Optional. Forces the humidity summary source instead of auto-discovery. |
| **Room icon** | Large MDI icon on the tile. |
| **Accent color** | Highlights and active quick actions (Ultra Card color picker). |
| **Style preset** | Visual layout (see above). |
| **Max quick actions** | 1–12 circular shortcuts. |
| **Tile border radius** | Adjusts room tile corner roundness (0–48px). |
| **Show entity names** | When on, shows each shortcut’s friendly name next to its icon. |
| **Photo background** | For *Photo overlay*: none, **upload**, **entity image** (e.g. `entity_picture`), or **image URL**. |
| **Background overlay %** | Darkens the photo for readability. |
| **Discovery toggles** | Enable/disable categories included in quick actions. |
| **Pinned entities** | Entity picker + chips; pinned ids appear first in the quick row when present in the area. |
| **Hidden entities** | Entity picker + chips; hidden ids are excluded from the tile. |

## Actions

- **Tap** (whole tile): defaults to **more-info** on a primary entity (climate → temperature sensor → first light → first quick entity). Override in the Actions tab.
- **Quick action** taps: **toggle** for `light`, `switch`, and `fan`; **more-info** for other domains.

## Troubleshooting

- **“Could not load area”** or registry errors: confirm HA is reachable and your account can use the config entity registry WebSocket commands. Use **Retry** after fixing connectivity.
- **Empty quick row**: widen discovery toggles, remove hidden entities, or increase **Max quick actions**.
- **Wrong entities**: use **Hidden entities** to exclude strays; use **Pinned entities** to prioritize important ones.
