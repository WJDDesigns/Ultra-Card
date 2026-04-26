# Alert Center

The **Alert Center** module shows active Home Assistant alerts in one compact card.
It is designed to surface urgent conditions (smoke/gas/leak/problem), warning conditions
(open doors/windows, unlocked locks), and other active alert states in priority order.

## What it does

- Automatically monitors selected Home Assistant domains for active alerts.
- Lets you manually include entities that should always be checked.
- Lets you hide noisy entities you do not want shown.
- Sorts alerts by severity so critical issues appear first.
- Supports quick `more-info` tap on each alert row.

## Options

| Option | Type | Default | Notes |
|---|---|---:|---|
| `title` | string | `Alert Center` | Card heading text |
| `show_title` | boolean | `true` | Show or hide header |
| `max_alerts` | number | `6` | Max visible active alerts (1–30) |
| `show_state` | boolean | `true` | Show entity state under name |
| `show_all_clear` | boolean | `true` | Show all-clear fallback when no active alerts |
| `include_alert_domain` | boolean | `true` | Monitor `alert.*` entities |
| `include_binary_sensors` | boolean | `true` | Monitor alert-relevant `binary_sensor.*` entities |
| `include_lock_alerts` | boolean | `true` | Monitor lock alert states |
| `include_alarm_panel_alerts` | boolean | `true` | Monitor alarm panel states |
| `include_entities` | string[] | `[]` | Manual entity allowlist |
| `hidden_entities` | string[] | `[]` | Entity blocklist |
| `accent_color` | string | (theme) | Accent color for header/highlights |
| `tile_border_radius` | number | `20` | Tile corner radius in px |

## Notes

- Auto-detection only surfaces entities in an **active alert state**.
- Manually included entities are still state-checked (inactive entities are not shown).
- Hidden entities always take precedence over auto or manual inclusion.
