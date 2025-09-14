[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)

# Ultra Card

Ultra Card is a modular card builder for Home Assistant Dashboard UI.

Ultra Card mission is to provide an easy-to-use visual editor to build custom Home Assistant dashboard cards.

## Features

- 🛠 **Visual editor** for all modules and options (no need to edit yaml)
- 🎨 **Drag-and-drop interface** for building layouts
- 🎯 **4-tab module settings** - General, Actions, Logic, and Design
- 🧩 **12 module types** for any dashboard need
- 🔧 **Conditional logic** - show/hide elements based on states, time, templates
- 🎭 **Animation system** - icons, bars, and hover effects
- 🌈 **Professional design controls** - typography, colors, spacing, borders
- 🌓 **Light and dark theme** support
- 🌎 **Internationalization** - 14 languages supported
- 📱 **Mobile optimized** - responsive layouts for all devices

The goal of Ultra Card is to make dashboard creation accessible to everyone through visual tools instead of YAML configuration.

## Installation

### HACS

Ultra Card is available in HACS (Home Assistant Community Store).

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=WJDDesigns&repository=Ultra-Card&category=plugin)

_or_

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Go to "Frontend"
4. Click the menu (three dots) and select "Custom repositories"
5. Add `https://github.com/WJDDesigns/Ultra-Card` as a "Lovelace" repository
6. Install "Ultra Card"
7. Restart Home Assistant

### Manual

1. Download `ultra-card.js` file from the [latest release](https://github.com/WJDDesigns/Ultra-Card/releases).
2. Put `ultra-card.js` file into your `config/www` folder.
3. Add reference to `ultra-card.js` in Dashboard. There's two ways to do that:
   - **Using UI:** _Settings_ → _Dashboards_ → _More Options icon_ → _Resources_ → _Add Resource_ → Set _Url_ as `/local/ultra-card.js` → Set _Resource type_ as `JavaScript Module`.
     **Note:** If you do not see the Resources menu, you will need to enable _Advanced Mode_ in your _User Profile_
   - **Using YAML:** Add following code to `lovelace` section.
     ```yaml
     resources:
       - url: /local/ultra-card.js
         type: module
     ```

## Usage

All Ultra Card layouts can be configured using Dashboard UI editor.

1. In Dashboard UI, click 3 dots in top right corner.
2. Click _Edit Dashboard_.
3. Click Plus button to add a new card.
4. Find _Custom: Ultra Card_ in the list.
5. Use the _Layout Builder_ tab to drag and drop modules.

## Modules

Different modules are available for different content types:

- 📝 [Text module](docs/modules/text.md)
- 🖼️ [Image module](docs/modules/image.md)
- 🎯 [Icon module](docs/modules/icon.md)
- 📊 [Bar module](docs/modules/bar.md)
- ℹ️ [Info module](docs/modules/info.md)
- 🔘 [Button module](docs/modules/button.md)
- ➖ [Separator module](docs/modules/separator.md)
- 📖 [Markdown module](docs/modules/markdown.md)
- 📹 [Camera module](docs/modules/camera.md)
- 📈 [Graphs module](docs/modules/graphs.md)
- ↔️ [Horizontal layout](docs/modules/horizontal.md)
- ↕️ [Vertical layout](docs/modules/vertical.md)

## Module Settings

Each module has 4 tabs for configuration:

- **General** - Module content and basic settings
- **Actions** - Tap, hold, and double-tap behaviors
- **Logic** - Conditional display rules
- **Design** - Typography, colors, spacing, animations

## Translations

Ultra Card supports multiple languages:

🇺🇸 English • 🇩🇪 German • 🇫🇷 French • 🇪🇸 Spanish • 🇮🇹 Italian • 🇳🇱 Dutch • 🇳🇴 Norwegian • 🇩🇰 Danish • 🇨🇿 Czech • 🇵🇱 Polish • 🇸🇪 Swedish

### Help Translate

We welcome translation contributions! See our [Translation Guide](CONTRIBUTING_TRANSLATIONS.md) for details on how to:

- Update existing translations
- Add new languages
- Test your translations

**Quick start**: Edit translation files directly on GitHub in [`src/translations/`](https://github.com/WJDDesigns/Ultra-Card/tree/main/src/translations) and create a pull request.

## Community & Support

- **Discord**: [Join our Discord](https://discord.com/invite/5SkUf6Ch) for help and discussion
- **GitHub**: [Report issues](https://github.com/WJDDesigns/Ultra-Card/issues) or contribute code
- **Support**: [Leave a tip](https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=4JVCZ46FZPUTG&clickref=1101lAycwnhU&gad_source=7&pid=328130457&dclid=CjgKEAjwh_i_BhCRhu7RxN_14hYSJACbYkcgx98-Vsb49UI4imjGhPA2lwk73DpbbgCri-G8TCTB9PD_BwE&ssrt=1744735247042) if you find Ultra Card useful

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

MIT License - see LICENSE file for details.

## Credits

Created by **WJD Designs**

### Special Thanks

Special thanks to our amazing Discord community for helping shape Ultra Card and making it what it is today:

BlowfishDiesel, Knucklehead Smiff, Martin / Korsiolsa, MoonRaven, mooseBringer, The_Cre8r, and many others.

---

**Built for Home Assistant with ❤️**
