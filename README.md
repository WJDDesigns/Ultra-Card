[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)

# Ultra Card

## The Visual Dashboard Builder for Home Assistant

**Build Home Assistant dashboards without writing YAML.** Ultra Card is a modular card builder with a drag-and-drop layout engine, a large module library, and a full visual editor. You design in the UI; the card handles the rest.


https://github.com/user-attachments/assets/e9f28eee-e587-4bc0-ad0b-cea53a3fa5a6



**[ultracard.io](https://ultracard.io)** · **[Modules](https://ultracard.io/modules/)** · **[Template Mode](https://ultracard.io/template-mode/)** · **[Preset Gallery](https://ultracard.io/presets/)** · **[Discord](https://discord.gg/6xVgHxzzBV)**

---

## Why Ultra Card?

**Visual editor** - Every setting lives in the UI. No YAML required.

**94 modules** - Layouts, gauges, graphs, controls, media, and more. Drag-and-drop columns with nesting so you can build the layout you want.

**Template Mode** - Jinja2 templates that change how a module looks as your entities change. Free for everyone.

**Preset Gallery** - Browse community layouts, install with one click, and share your own.

**Pro cloud & backups** - Cloud sync, automatic daily backups (30-day retention), and manual snapshots so your work stays safe across devices.

---

## See it on ultracard.io

The site runs the real card, not mockups. Use it when you want to explore before installing, or when you need a deeper reference than this README.

- **[Modules](https://ultracard.io/modules/)** - Live previews of every free and PRO module (66 free, 28 PRO)
- **[Template Mode](https://ultracard.io/template-mode/)** - Interactive playground, property reference, and field notes
- **[Preset Gallery](https://ultracard.io/presets/)** - Community layouts you can browse and install
- **[FAQs](https://ultracard.io/faqs/)** - Common questions and troubleshooting

Written how-to pages also live in the [GitHub wiki](https://github.com/WJDDesigns/Ultra-Card/wiki) and inside Home Assistant via Ultra Card Hub → Docs.

---

<img width="1862" height="1009" alt="uc-screener" src="https://github.com/user-attachments/assets/a99a768e-3db2-4366-8193-712c30d31ec1" />

## Quick Start

### Install

**HACS (recommended)**

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=WJDDesigns&repository=Ultra-Card&category=plugin)

Or add `https://github.com/WJDDesigns/Ultra-Card` as a custom Lovelace repository in HACS, install Ultra Card, then restart Home Assistant.

**Manual**

1. From the [latest release](https://github.com/WJDDesigns/Ultra-Card/releases), download **all** release assets for that version, not only `ultra-card.js`. The card is split into multiple JavaScript files (for example `ultra-card.js`, `ultra-card-panel.js`, and any `uc-*.js` chunks). They must stay **in the same folder** so the browser can load them.
2. Copy that entire folder’s contents into `config/www` (for example `config/www/ultra-card/`), keeping the same filenames next to each other.
3. Add **one** Lovelace resource: _Settings_ → _Dashboards_ → _Resources_ → Add Resource → URL pointing at the **main** bundle only, for example `/local/ultra-card/ultra-card.js` (or `/local/ultra-card.js` if you put files directly under `www`), type **JavaScript Module**.

If you use the Ultra Card dashboard panel or Hub features, ensure `ultra-card-panel.js` is in that same directory as well (HACS installs everything automatically).

### Ultra Card Connect (recommended for Hub & Pro)

Install the separate **[Ultra Card Connect](https://github.com/WJDDesigns/ultra-card-connect)** Home Assistant integration (HACS → Integrations) when you want:

- The **Ultra Card Hub** sidebar (presets, account, docs)
- Shared Pro sign-in that persists across devices (credentials stay in HA)
- Favorite color sync, Smart Cards via Connect, media uploads through the integration

The card works without Connect for building dashboards. Connect is required for Hub sidebar auth and Pro unlock via HA.

(The integration’s HA domain is still `ultra_card_pro_cloud`, so existing entity IDs stay the same.)

### Create your first card

1. Edit a dashboard → **Add card** → **Custom: Ultra Card**.
2. Use the **Layout Builder** tab to add and arrange modules.
3. Use the **4-tab editor** (General, Actions, Logic, Design) on each module to configure content, taps, visibility, and styling.

**Visible to users** — On the Logic tab (modules, rows, columns), Card Settings, and each icon in an Icon module, you can show or hide content for specific Home Assistant users—the same idea as Lovelace’s card **Visibility → User** tab, but inside Ultra Card. Lovelace’s card-level User condition still works on the wrapper if you prefer that for hiding the whole card.

### Optional: Pro

Visit **[ultracard.io](https://ultracard.io)** for PRO modules, cloud sync, and backups. Sign in through Ultra Card Connect (Hub → Account) after installing the integration.

---

## Modules

Ultra Card ships with **94 modules** across content, data, controls, layout, media, and PRO. That includes gauges, graphs, climate and vacuum controls, appliance cards, UniFi network monitoring, Living Canvas backgrounds, and plenty more.

**[Browse every module with live previews →](https://ultracard.io/modules/)**

You can also embed unlimited native Home Assistant cards and third-party cards (Bubble Card, Mushroom, ApexCharts, and others) inside Ultra Card’s layout system. That is free for everyone.

---

## Template Mode

Template Mode lets a short Jinja2 template decide how a module looks whenever your entities change: icons, colors, labels, visibility of rows, and more. It ships with Ultra Card at no charge.

Try the live playground and property reference on **[ultracard.io/template-mode](https://ultracard.io/template-mode/)**. The same cheatsheet is a click away inside every module editor.

---

## Free vs Pro

| Feature | Free | Pro |
|--------|------|-----|
| Core modules & visual editor | Yes | Yes |
| Preset Gallery | Yes | Yes |
| Conditional logic & Template Mode | Yes | Yes |
| Native HA cards | Unlimited | Unlimited |
| 3rd party cards | Unlimited | Unlimited |
| Cloud configuration sync | - | Yes |
| Automatic daily backups (30-day) | - | Yes |
| Manual snapshots (up to 30) | - | Yes |
| 28 PRO modules | - | Yes |
| Priority support | - | Yes |

**[Get Pro at ultracard.io](https://ultracard.io)**

---

## Preset Gallery

Browse and install community presets from inside the editor (**Presets** tab → **Browse Marketplace**), or on the web at **[ultracard.io/presets](https://ultracard.io/presets/)**. One-click install, categories, previews, and favorites. You can submit your own layouts for others to use.

---

## Translations

Supported languages: Catalan, Czech, Danish, German, English, British English, Spanish, French, Italian, Dutch, Norwegian, Norwegian Bokmål, Norwegian Nynorsk, Polish, Swedish.

To contribute translations, see [CONTRIBUTING_TRANSLATIONS.md](CONTRIBUTING_TRANSLATIONS.md). You can edit files in `src/translations/` on GitHub and open a pull request.

---

## Community & Support

- **[ultracard.io](https://ultracard.io)** - Website, modules, Template Mode, presets, Pro, and account
- **[Discord](https://discord.gg/6xVgHxzzBV)** - Help, sharing, discussion
- **[GitHub Issues](https://github.com/WJDDesigns/Ultra-Card/issues)** - Bugs and feature requests
- **[FAQs](https://ultracard.io/faqs/)** - Common questions

Pro subscribers get priority support. You can also [support development](https://www.paypal.com/ncp/payment/NLHALFSPA7PUS) with a one-time tip.

---

## Contributing

Contributions are welcome: translations, presets, code, and documentation. See [CONTRIBUTING_TRANSLATIONS.md](CONTRIBUTING_TRANSLATIONS.md) for translations and [DEVELOPMENT.md](DEVELOPMENT.md) for local development (including **`npm run release:check`**, the same pipeline CI and tagged releases use). Please open pull requests with clear descriptions.

---

## Technical Details

- **Requirements:** Home Assistant 2024.1.0+, modern browser (ES2015+). HACS recommended.
- **Stack:** TypeScript, smart caching, responsive layout.
- **Privacy:** No tracking; free tier is local-only; Pro sync uses encrypted connections. Open source on GitHub.

---

## License

MIT - see [license](license) file.

---

**Created by [WJD Designs](https://wjddesigns.com).** Thanks to the Discord community and everyone who contributes presets, translations, and feedback.

_Built for Home Assistant_
