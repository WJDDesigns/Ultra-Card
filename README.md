[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)

# Ultra Card

## The Visual Dashboard Builder for Home Assistant

**Build professional Home Assistant dashboards without writing YAML.** Ultra Card is a modular card builder that turns dashboard creation into an intuitive visual design experience. Drag-and-drop layouts, a rich set of modules, and a powerful editor put full creative control in your hands—whether you're new to Home Assistant or a power user.

[![preview-uc](https://github.com/user-attachments/assets/869c8d8d-e51f-4c30-b626-b820e4dd5fae)](https://github.com/WJDDesigns/Ultra-Card)

**[UltraCard.io](https://ultracard.io)** · **[Discord](https://discord.gg/6xVgHxzzBV)** · **[Documentation](https://github.com/WJDDesigns/Ultra-Card)**

---

## Why Ultra Card?

**Visual-first** — Every feature and setting is available through the UI. No YAML required.

**Modular layout engine** — Dozens of module types, drag-and-drop columns, and unlimited nesting so you can build any dashboard layout you imagine.

**Built for performance** — TypeScript, smart caching, and responsive design so cards run smoothly from phones to large displays.

**Preset Marketplace** — Install community presets with one click, preview before installing, and share your own designs.

**Pro: ecosystem unifier** — Embed any custom Home Assistant card (Bubble Card, Mushroom, ApexCharts, and more) inside Ultra Card’s layout system. Third-party cards are unlimited for all users.

**Pro: cloud & backups** — Cloud sync, automatic daily backups (30-day retention), and manual snapshots so your work is safe and available everywhere.

---

## Features at a Glance

- **Drag-and-drop builder** — Arrange layouts with instant feedback
- **4-tab module editor** — General, Actions, Logic, and Design per module
- **19+ module types** — Text, Icon, Info, Image, Markdown, Bar, Graphs, Camera, Button, Slider, Spinbox, Dropdown, Light, Gauge, layouts, Tabs, Separator, plus Pro animated modules
- **Conditional logic** — Show or hide by entity state, time, or Jinja2 templates
- **Full Jinja2 support** — Templates with CodeMirror editor
- **Native & 3rd party cards** — Unlimited native and third-party cards for everyone
- **Design controls** — Typography, colors, spacing, borders, shadows, gradients, animations
- **Preset Marketplace** — Browse, install, and share community presets
- **15 languages** — Full internationalization

---

## Quick Start

### Install

**HACS (recommended)**

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=WJDDesigns&repository=Ultra-Card&category=plugin)

Or add `https://github.com/WJDDesigns/Ultra-Card` as a custom Lovelace repository in HACS, install Ultra Card, then restart Home Assistant.

**Manual**

1. From the [latest release](https://github.com/WJDDesigns/Ultra-Card/releases), download **all** release assets for that version—not only `ultra-card.js`. The card is split into multiple JavaScript files (for example `ultra-card.js`, `ultra-card-panel.js`, and any `uc-*.js` chunks). They must stay **in the same folder** so the browser can load them.
2. Copy that entire folder’s contents into `config/www` (for example `config/www/ultra-card/`), keeping the same filenames next to each other.
3. Add **one** Lovelace resource: _Settings_ → _Dashboards_ → _Resources_ → Add Resource → URL pointing at the **main** bundle only, for example `/local/ultra-card/ultra-card.js` (or `/local/ultra-card.js` if you put files directly under `www`), type **JavaScript Module**.

If you use the Ultra Card dashboard panel or Hub features, ensure `ultra-card-panel.js` is in that same directory as well (HACS installs everything automatically).

### Create your first card

1. Edit a dashboard → **Add card** → **Custom: Ultra Card**.
2. Use the **Layout Builder** tab to add and arrange modules.
3. Use the **4-tab editor** (General, Actions, Logic, Design) on each module to configure content, taps, visibility, and styling.

### Optional: Pro

Visit **[UltraCard.io](https://ultracard.io)** for cloud sync, automated backups, exclusive animated modules (Clock, Weather, Forecast, Video Background), and third-party card integration.

---

## Modules

| Category | Modules |
|----------|--------|
| **Content** | Text, Icon, Info, Image, Markdown, Bar, Graphs, Camera |
| **Areas** | Area / Room Summary |
| **Controls** | Button, Slider, Spinbox, Dropdown, Light, Gauge |
| **Layout** | Horizontal, Vertical, Tabs, Separator |
| **Pro** | Animated Clock, Animated Weather, Animated Forecast, Video Background |

Module docs: [Text](docs/modules/text.md), [Icon](docs/modules/icon.md), [Info](docs/modules/info.md), [Image](docs/modules/image.md), [Markdown](docs/modules/markdown.md), [Bar](docs/modules/bar.md), [Graphs](docs/modules/graphs.md), [Camera](docs/modules/camera.md), [Area / Room Summary](docs/modules/area-summary.md), [Button](docs/modules/button.md), [Horizontal](docs/modules/horizontal.md), [Vertical](docs/modules/vertical.md), [Separator](docs/modules/separator.md).

**Card integration** — Use unlimited native Home Assistant cards inside Ultra Card. Add Bubble Card, Mushroom Cards, ApexCharts, and other custom cards—unlimited for all users.

---

## Free vs Pro

| Feature | Free | Pro |
|--------|------|-----|
| Core modules & visual editor | Yes | Yes |
| Preset Marketplace | Yes | Yes |
| Conditional logic & templates | Yes | Yes |
| Native HA cards | Unlimited | Unlimited |
| 3rd party cards | Unlimited | Unlimited |
| Cloud configuration sync | — | Yes |
| Automatic daily backups (30-day) | — | Yes |
| Manual snapshots (up to 30) | — | Yes |
| Video Background, Animated Clock/Weather/Forecast | — | Yes |
| Priority support | — | Yes |

**[Get Pro at UltraCard.io](https://ultracard.io)**

---

## Preset Marketplace

Browse and install community presets from inside the editor: **Presets** tab → **Browse Marketplace**. One-click install, categories, previews, and favorites. You can submit your own presets for others to use.

---

## Translations

Supported languages: Catalan, English, British English, German, French, Spanish, Italian, Dutch, Norwegian, Danish, Czech, Polish, Swedish, Portuguese, Russian.

To contribute translations, see [CONTRIBUTING_TRANSLATIONS.md](CONTRIBUTING_TRANSLATIONS.md). You can edit files in `src/translations/` on GitHub and open a pull request.

---

## Community & Support

- **[UltraCard.io](https://ultracard.io)** — Website, Pro subscriptions, account
- **[Discord](https://discord.gg/6xVgHxzzBV)** — Help, sharing, discussion
- **[GitHub Issues](https://github.com/WJDDesigns/Ultra-Card/issues)** — Bugs and feature requests

Pro subscribers get priority support. You can also [support development](https://www.paypal.com/ncp/payment/NLHALFSPA7PUS) with a one-time tip.

---

## Contributing

Contributions are welcome: translations, presets, code, and documentation. See [CONTRIBUTING_TRANSLATIONS.md](CONTRIBUTING_TRANSLATIONS.md) for translations and [DEVELOPMENT.md](DEVELOPMENT.md) for local development. Please open pull requests with clear descriptions.

---

## Technical Details

- **Requirements:** Home Assistant 2024.1.0+, modern browser (ES2015+). HACS recommended.
- **Stack:** TypeScript, smart caching, responsive layout.
- **Privacy:** No tracking; free tier is local-only; Pro sync uses encrypted connections. Open source on GitHub.

---

## License

MIT — see [license](license) file.

---

**Created by [WJD Designs](https://wjddesigns.com).** Thanks to the Discord community and everyone who contributes presets, translations, and feedback.

_Built for Home Assistant_
