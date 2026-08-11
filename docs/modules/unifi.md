# UniFi Network (Pro)

Live monitoring for Ubiquiti UniFi gear — virtual rack, port panel, topology map, clients, and WAN health — powered entirely by the [official Home Assistant UniFi integration](https://www.home-assistant.io/integrations/unifi/).

## Requirements

- Ultra Card **Pro**
- Home Assistant UniFi Network integration configured
- For port lights / traffic: enable **Bandwidth usage sensors for network clients** under UniFi → Configure → More options, then enable the disabled port sensors (the card’s setup wizard can one-click enable them for admins)

## Views

| View | What you get |
|------|----------------|
| **Rack** | Virtual rack with real Ubiquiti product photos, live port LEDs, PoE dots. Only gateways, switches and rack PDUs mount in the rack; APs get their own shelf with utilization rings. Smart plugs never appear here. Reorder via the editor's **Rack order** list. |
| **Ports** | One device blown up — per-port RX/TX bars, link speed, PoE watts, PoE toggle & power cycle |
| **Devices** | Tile grid with product photos, utilization rings, CPU/memory/temp/uptime, optional CPU sparklines |
| **Topology** | Tree or radial map from `Uplink MAC`, animated traffic flow. Devices whose uplink sensor is unavailable get an inferred (dashed) edge to the gateway — nothing floats disconnected. Node labels show downstream device count and clients. |
| **Clients** | Sortable client table with RX/TX and block controls. Clients are **opt-in** — pick them in the editor; none show by default. |
| **WAN** | Gateway status + per-target latency (Google / Cloudflare / Microsoft) with sparklines |

## Device photos

The card loads Ubiquiti's public device catalog (`static.ui.com/fingerprint/ui/public.json`, cached locally for 7 days) to look up each model and render real product photos, resized through Ubiquiti's own image CDN. That also makes classification authoritative — a `U7PIW` renders as the AP puck it is, a `UP1` SmartPower plug is a plug, not rack gear. Newer gear that Home Assistant reports as a family-plus-sysid code (e.g. `USWED72` for the Switch Pro HD 24 PoE) is resolved through the catalog's sysid index.

For models with measured port geometry (`src/modules/unifi/port-maps.ts`), live lights render on the physical ports in the photo: an Etherlighting-style glow emanating from the port opening, colored by link speed using the official console scheme (10G cyan, 2.5G blue, 1G green, 100M yellow), a green LED blinking with receive traffic, an amber LED blinking with transmit traffic, and a steady amber bar under PoE-powered ports. Home Assistant does not expose the controller's Etherlighting config, so this emulates the "port speed" theme. Models without a port map get a small LED strip beneath the photo. Offline (or with **Real device photos** off) the card falls back to procedural SVG faceplates.

## Setup wizard

On first add (and whenever capabilities are incomplete) the card shows:

1. Missing UniFi integration → docs link
2. Disabled port/diagnostic entities → **Enable sensors** (admin only; uses `config/entity_registry/update`)
3. No `port_rx-*` entities at all → guidance to flip the integration’s bandwidth option

Dismiss anytime; reopen from the General tab.

## Auto-discovery

Devices are found via HA’s device registry (`manufacturer: Ubiquiti Networks` / `unifi` identifiers). Two guards keep the list honest: a device must carry at least one entity from the `unifi` platform (so a UDM registered a second time by UniFi Protect doesn’t duplicate), and Ubiquiti-OUI devices without a model (tracked clients like plugs and cameras) are treated as clients, not infrastructure. Port identity comes from entity registry `unique_id` prefixes (`port_rx-`, `port_tx-`, `port_link_speed-`, `poe_power-`, `poe-`, `port-`, `power_cycle-`, `outlet-`). Topology edges use the `Uplink MAC` sensor matched against each device’s MAC connection.

Topology edges use the `Uplink MAC` sensor, which HA disables by default — the setup wizard's one-click enable includes it. Until it's enabled, unresolved devices draw a dashed inferred edge to the gateway.

Hide individual devices from the General tab. Reorder the rack with the drag-and-drop **Rack order** list in the editor (the live rack view is display-only; clicking a unit opens more-info).

## Configuration highlights

- **View mode** — rack / ports / devices / topology / clients / wan; the editor only shows the options relevant to the selected view
- **Rack order** — drag-and-drop (or arrow buttons) in the editor
- **Rack style** — dark / light / glass / blueprint / blank (no background chrome; devices float on the dashboard)
- **Blank background** — available in every view: strips card/container backgrounds so components float on the dashboard
- **Real device photos** — on by default; falls back to drawn faceplates offline
- **Animation** — full / subtle / off (also respects `prefers-reduced-motion`)
- **Topology layout** — tree / radial
- **Clients** — explicit allow-list (`client_ids`); the Clients view shows nothing until you add clients
- Show title, advanced stats, sparklines, port tooltips
- Accent color override

## Files

- [`src/services/uc-unifi-service.ts`](../../src/services/uc-unifi-service.ts) — discovery, port mapping, capabilities, enable helpers
- [`src/services/uc-unifi-device-db.ts`](../../src/services/uc-unifi-device-db.ts) — Ubiquiti catalog: model lookup, product photos, device types
- [`src/modules/unifi-module.ts`](../../src/modules/unifi-module.ts) — module shell + editor
- [`src/modules/unifi/`](../../src/modules/unifi/) — faceplates, views, styles, wizard
