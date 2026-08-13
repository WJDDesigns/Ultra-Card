# UniFi Network (Pro)

Live monitoring for Ubiquiti UniFi gear — virtual rack, port panel, topology map, clients, and WAN health — powered entirely by the [official Home Assistant UniFi integration](https://www.home-assistant.io/integrations/unifi/). UniFi Protect hardware (cameras, doorbells, NVRs) is discovered too when the [UniFi Protect integration](https://www.home-assistant.io/integrations/unifiprotect/) is configured.

## Requirements

- Ultra Card **Pro**
- Home Assistant UniFi Network integration configured
- Optional: UniFi Protect integration for cameras / doorbells / NVRs
- For port lights / traffic: enable **Bandwidth usage sensors for network clients** under UniFi → Configure → More options, then enable the disabled port sensors (the card’s setup wizard can one-click enable them for admins)
- For device temperatures: enable the disabled temperature entities (also covered by the wizard) — see below

## Views

| View | What you get |
|------|----------------|
| **Rack** | Virtual rack with real Ubiquiti product photos, lit port openings and activity LEDs, PoE bars. Gateways, switches, rack PDUs and NVRs mount in the rack; APs get their own shelf with utilization rings. Smart plugs and cameras never appear here. Reorder via the editor's **Rack order** list. |
| **Ports** | One device blown up — per-port RX/TX bars, link speed, PoE watts, PoE toggle & power cycle |
| **Devices** | Tile grid with product photos, utilization rings, CPU/memory/temp/uptime, optional CPU sparklines. Protect cameras show a **live snapshot** with a motion glow and doorbell ring badge instead of a product photo. |
| **Topology** | Tree or radial map from `Uplink MAC`, animated traffic flow. Every live edge flows — speed tracks the measured rate, and links that are up but unmeasured drift slowly instead of looking dead; only an explicitly disconnected device loses its flow. Edge colour and thickness follow the negotiated link speed (blue-grey when no port reports one). Dashes mean the **parent** is inferred, not that the link is idle. Node labels show downstream device count and clients. |
| **Clients** | Sortable client table with RX/TX and block controls. Clients are **opt-in** — pick them in the editor; none show by default. |
| **WAN** | Gateway status + per-target latency (Google / Cloudflare / Microsoft) with sparklines |

## Device photos

The card loads Ubiquiti's public device catalog (`static.ui.com/fingerprint/ui/public.json`, cached locally for 7 days) to look up each model and render real product photos, resized through Ubiquiti's own image CDN. That also makes classification authoritative — a `U7PIW` renders as the AP puck it is, a `UP1` SmartPower plug is a plug, not rack gear. Newer gear that Home Assistant reports as a family-plus-sysid code (e.g. `USWED72` for the Switch Pro HD 24 PoE) is resolved through the catalog's sysid index.

## Port lights

Every switch and gateway lights its ports the same way:

- **The opening itself** is filled with our Etherlighting equivalent, coloured by link speed using the official console scheme — 10G cyan, 2.5G blue, 1G green, 100M yellow — brightest at the top edge and falling off into the recess, with a faint halo spilling out. A port that's down shows an empty dark jack. The fill deliberately **covers** whatever the factory photo shows in that hole: Ubiquiti photographs Etherlighting hardware (the Switch Pro HD 24, for one) with its inserts lit blue, which would otherwise read as "every port is active".
- **Two activity LEDs sit directly above each opening** — green for receive, amber for transmit — each blinking at a rate that tracks its own throughput, so a busy port flickers and an idle-but-linked port sits dim.
- **PoE-powered ports** get a steady amber bar beneath the opening.

Home Assistant doesn't expose the controller's Etherlighting configuration, so this emulates the "port speed" theme rather than mirroring a custom one.

### Port maps

Painting light into a jack requires knowing where that jack is in the photo. `src/modules/unifi/port-maps.ts` holds measured openings (fractions of the image) for the common gateways and switches, with indices checked against each photo's silkscreen so port 7 on screen is port 7 in Home Assistant: UDM-Pro, UDM-SE, USW-16-PoE, USW-24-PoE, USW-Pro-24-PoE, USW-Pro-HD-24-PoE, USW-Pro-Max-48-PoE, USW-Enterprise-8-PoE, USW-Enterprise-24-PoE, USW-Lite-16-PoE and USW-Aggregation.

Anything else — an unmapped model, or a photo that isn't a straight-on front panel — renders the same lit openings and LEDs as a **port row directly beneath the photo** instead of guessing coordinates and landing the lights on the wrong port. Offline (or with **Real device photos** off) the card falls back to procedural SVG faceplates.

To add a model, measure the openings from its `nopadding` catalog photo (the image CDN sends `Access-Control-Allow-Origin: *`, so a canvas can be scanned for the dark jack mouths), then confirm the numbering against the silkscreen before adding the entry. `src/modules/unifi/__tests__/port-maps.test.ts` guards the data against duplicate indices, out-of-bounds cells and overlaps.

## Temperatures

The UniFi integration ships two different temperature families, which is why access points often look like they report nothing:

| Sensor | Unique id | Default |
|--------|-----------|---------|
| **Device temperature** (whole unit, from `general_temperature`) | `device_temperature-<mac>` | Enabled, but only exists on gear that reports it — mostly gateways and switches |
| **CPU / Local / PHY probes** | `temperature-cpu-<mac>` etc. | **Disabled by default** — this is all most APs expose |

So on a U6/U7 access point there is no temperature until those probe entities are enabled. The setup wizard's **Enable sensors** button now includes them, and the wizard shows a `Temperature` badge for the current state.

The card reads every probe. The headline number is the whole-device reading when present, otherwise `Local` (the board temperature, which is what the UniFi console shows for APs), then `CPU`, then `PHY`; the tile labels which probe it used (`Temp · Local`) and lists the rest in the advanced line and a tooltip.

## Setup wizard

On first add (and whenever capabilities are incomplete) the card shows:

1. Missing UniFi integration → docs link
2. Disabled port/diagnostic entities, including temperature probes and uplink MAC → **Enable sensors** (admin only; uses `config/entity_registry/update`)
3. No `port_rx-*` entities at all → guidance to flip the integration’s bandwidth option

Dismiss anytime; reopen from the General tab.

## Auto-discovery

Devices are found via HA’s device registry (`manufacturer: Ubiquiti Networks` / `unifi` identifiers). Guards keep the list honest: a device must carry at least one entity from the `unifi` (Network) or `unifiprotect` (Protect) platforms, and Ubiquiti-OUI devices without a model (tracked clients like plugs and cameras) are treated as clients, not infrastructure. Protect also registers the console it runs on (UDM / UDM-SE) — those shells are dropped: Protect-only gateways and any Protect device whose MAC the Network integration already owns never duplicate hardware. Cameras are classified from the Ubiquiti catalog, model names (G3–G6 / UVC / AI-series / doorbells), or the presence of a `camera` entity; their motion and doorbell sensors drive the live tile badges. Port identity comes from entity registry `unique_id` prefixes (`port_rx-`, `port_tx-`, `port_link_speed-`, `poe_power-`, `poe-`, `port-`, `power_cycle-`, `outlet-`). Topology edges use the `Uplink MAC` sensor matched against each device’s MAC connection.

Topology edges use the `Uplink MAC` sensor, which HA disables by default — the setup wizard's one-click enable includes it. Until it's enabled (and always, for Protect cameras, which never report an uplink) the card infers the parent and draws a dashed edge:

- PoE-powered edge gear (APs, cameras) attaches to the switch actually delivering the most PoE, so wall cameras land on the switch feeding them rather than the gateway
- NVRs attach to a switch when one exists
- Everything else falls back to the gateway

When a guess is wrong — several PoE switches, cameras split across them — pin the parent explicitly in the editor's **Topology links** section (Topology view). A pin wins over both the sensor and the inference.

### Edge traffic

An inferred parent says nothing about traffic, so dashed edges animate exactly like solid ones. The rate on an edge comes from the child's own port sensors when it has any. Protect cameras have no ports, and most APs don't either — for those the card looks for the parent switch port whose controller label names the device (a port renamed `Back Left Cam` feeds the camera called `Back Left`) and uses that port's RX+TX and negotiated speed. Factory labels (`Port 7`, `SFP+ 25`) and ambiguous matches are ignored: the integration exposes no MAC for what's plugged into a port, so a guessed number is never invented. When nothing measures the link it is drawn blue-grey with a slow drift and hovers as *rate unknown*.

Hide individual devices from the General tab. Reorder the rack with the drag-and-drop **Rack order** list in the editor (the live rack view is display-only; clicking a unit opens more-info).

## Configuration highlights

- **View mode** — rack / ports / devices / topology / clients / wan; the editor only shows the options relevant to the selected view
- **Rack order** — drag-and-drop (or arrow buttons) in the editor
- **Rack style** — dark / light / glass / blueprint / blank (no background chrome; devices float on the dashboard)
- **Blank background** — available in every view: strips card/container backgrounds so components float on the dashboard
- **Real device photos** — on by default; falls back to drawn faceplates offline
- **Live camera previews** — on by default in the Devices view; shows Protect camera snapshots with motion/ring badges (turn off for product photos)
- **Animation** — full / subtle / off (also respects `prefers-reduced-motion`)
- **Topology layout** — tree / radial
- **Topology links** — pin a device's uplink when no sensor reports one (Protect cameras) or the inference picks the wrong switch
- **Clients** — explicit allow-list (`client_ids`); the Clients view shows nothing until you add clients
- Show title, advanced stats, sparklines, port tooltips
- Accent color override

## Files

- [`src/services/uc-unifi-service.ts`](../../src/services/uc-unifi-service.ts) — discovery, port mapping, capabilities, enable helpers
- [`src/services/uc-unifi-device-db.ts`](../../src/services/uc-unifi-device-db.ts) — Ubiquiti catalog: model lookup, product photos, device types
- [`src/modules/unifi-module.ts`](../../src/modules/unifi-module.ts) — module shell + editor
- [`src/modules/unifi/`](../../src/modules/unifi/) — faceplates, views, styles, wizard
