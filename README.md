[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)

# Ultra Card

Ultra Card is a professional-grade modular card builder for Home Assistant Dashboard UI. Build stunning, feature-rich dashboard cards without writing a single line of YAML.

The Ultra Card mission is to provide an intuitive visual editor that makes custom Home Assistant dashboard design accessible to everyone—from beginners to power users.

![preview-uc](https://github.com/user-attachments/assets/869c8d8d-e51f-4c30-b626-b820e4dd5fae)

## Features

- 🛠 **Visual Editor** - Configure everything through an intuitive UI (no YAML required)
- 🎨 **Drag-and-Drop Builder** - Effortlessly arrange layouts with visual feedback
- 📦 **19+ Module Types** - Core modules, interactive controls, and Pro animated modules
- 🔌 **3rd Party Card Integration** - Embed any custom Home Assistant card
- 🛒 **Preset Marketplace** - One-click community presets with instant installation
- 🎯 **4-Tab Module Settings** - General, Actions, Logic, and Design for complete control
- 🔧 **Conditional Logic** - Show/hide elements based on states, time, or Jinja2 templates
- 🎭 **Rich Animation System** - Animated icons, bars, hover effects, and Pro animated modules
- 🌈 **Professional Design Controls** - Typography, colors, spacing, borders, shadows, and filters
- 🎨 **Smart Scaling** - Intelligent responsive scaling for edit panels and narrow columns
- 🔗 **Template Support** - Full Jinja2 template evaluation with CodeMirror editor
- ☁️ **Cloud Sync (Pro)** - Sync configurations across all your devices
- 📸 **Auto Snapshots (Pro)** - Daily backups with 30-day retention
- 🌓 **Light and Dark Theme** Support
- 🌎 **Internationalization** - 14 languages supported
- 📱 **Mobile Optimized** - Responsive layouts for all devices

Ultra Card transforms dashboard creation from a tedious YAML editing task into an enjoyable visual design experience.

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

Ultra Card provides 19+ module types organized by category:

<img width="812" height="814" alt="modules" src="https://github.com/user-attachments/assets/b8208e40-e0c4-43c6-afa3-eba61aa22485" />

### Free Modules - Core Content

- 📝 [Text module](docs/modules/text.md) - Display custom text with rich formatting
- 🖼️ [Image module](docs/modules/image.md) - Show images with conditional logic and animations
- 🎯 [Icon module](docs/modules/icon.md) - Entity-linked icons with states and templates
- 📊 [Bar module](docs/modules/bar.md) - Progress bars with multiple styles and gradients
- ℹ️ [Info module](docs/modules/info.md) - Entity information display with rich formatting
- 🔘 [Button module](docs/modules/button.md) - Interactive buttons with custom actions
- ➖ [Separator module](docs/modules/separator.md) - Visual dividers (horizontal/vertical)
- 📖 [Markdown module](docs/modules/markdown.md) - Rich text with markdown support
- 📹 [Camera module](docs/modules/camera.md) - Live camera feeds with fullscreen and zoom
- 📈 [Graphs module](docs/modules/graphs.md) - Historical data visualization with forecasts

### Free Modules - Layout & Interactive

- ↔️ [Horizontal layout](docs/modules/horizontal.md) - Arrange modules horizontally
- ↕️ [Vertical layout](docs/modules/vertical.md) - Stack modules vertically
- 🎚️ **Slider module** - Interactive slider for numeric inputs and adjustments
- 🔢 **Spinbox module** - Numeric input with increment/decrement controls
- 📋 **Dropdown module** - Select from options with entity source support
- 📊 **Gauge module** - Circular gauge displays for sensor values

### Pro Modules 🌟

Unlock exclusive animated modules with [Ultra Card Pro](#ultra-card-pro-):

- 🕐 **Animated Clock** - Beautiful flip clock with smooth animations
- 🌤️ **Animated Weather** - Current weather with animated weather icons
- 📅 **Animated Forecast** - Multi-day forecast with detailed information

### 3rd Party Cards 🔌

Embed **any** installed custom Home Assistant card within Ultra Card's layout system:

- Bubble Card
- Mushroom Cards
- ApexCharts Card
- Mini Graph Card
- And hundreds more!

**Free:** Up to 5 third-party cards | **Pro:** Unlimited

## Module Settings

Each module has 4 tabs for complete customization:

<img width="698" height="754" alt="tabs-view" src="https://github.com/user-attachments/assets/b65cc607-e914-4d0a-88fa-2d07dfbafba3" />

- **General** - Module content and basic settings
- **Actions** - Tap, hold, and double-tap behaviors
- **Logic** - Conditional display rules based on states, time, or templates
- **Design** - Typography, colors, spacing, borders, shadows, animations, and filters

## 3rd Party Card Integration

Ultra Card allows you to embed any custom Home Assistant card directly within your layouts. This powerful feature lets you combine the flexibility of your favorite community cards with Ultra Card's advanced layout system.

### How It Works

1. **Add a Module** - Click "Add Module" on any column
2. **Navigate to 3rd Party Tab** - Find the "3rd Party" tab in the module selector
3. **Click to Add** - Select any installed custom card to add it instantly
4. **Configure** - Use the card's native visual editor within Ultra Card's settings popup

### Supported Cards

Ultra Card works with **all** custom Lovelace cards, including:

- **Bubble Card** - Modern bubble-style cards
- **Mushroom Cards** - Minimalist card collection
- **ApexCharts Card** - Advanced charting
- **Mini Graph Card** - Compact graphs
- **Button Card** - Highly customizable buttons
- **And hundreds more!**

### Free vs Pro

- **Free Tier:** Add up to 5 third-party cards per dashboard
- **Pro Tier:** Unlimited third-party card integration

### Benefits

- Use existing cards you love within Ultra Card's powerful layout system
- Access each card's native visual editor
- Apply Ultra Card's Logic and Design tabs to control visibility and styling
- Combine multiple card types in cohesive, professional layouts

## Preset Marketplace

Accelerate your dashboard design with the built-in Preset Marketplace. Browse, preview, and install community-created card designs with a single click.

### Features

- 🛒 **One-Click Installation** - Install presets instantly without manual JSON copying
- 📂 **Category Filtering** - Browse by Dashboards, Vehicles, Weather, Smart Home, and more
- 👁️ **Preview Before Install** - See screenshots and descriptions before applying
- ⭐ **Favorites System** - Star your most-used presets for quick access
- 🌐 **Community Contributions** - Submit your own presets to share with others
- 🔄 **Auto-Updates** - Marketplace content refreshes automatically

### How to Access

1. Open any Ultra Card in edit mode
2. Navigate to the **Presets** tab in the editor
3. Click **Browse Marketplace**
4. Select a preset and click **Install**

The marketplace makes it easy to discover new design ideas and share your creations with the Ultra Card community.

## Ultra Card Pro 🌟

Unlock the full potential of Ultra Card with **Ultra Card Pro**—a premium tier that adds cloud sync, automated backups, exclusive modules, and unlimited third-party card integration.

### Pro Features

- 🌟 **3 Exclusive Animated Modules** - Animated Clock, Weather, and Forecast
- ☁️ **Cloud Configuration Sync** - Seamlessly sync all your card configs across devices
- 📸 **Auto Dashboard Snapshots** - Daily automatic backups with 30-day retention
- 💾 **Manual Card Backups** - Create named backups (up to 30) for important configurations
- 🔌 **Unlimited 3rd Party Cards** - Embed as many custom cards as you need
- 🎯 **Smart Replace Restore** - Intelligent backup restore that matches cards by name or position
- ⚡ **Priority Support** - Get help faster from the Ultra Card team

### Get Started

Register for Ultra Card Pro at **[ultracard.io](https://ultracard.io)** to unlock all Pro features. Pro subscriptions support ongoing development and help us build even more amazing features for the community.

## Translations

Ultra Card supports multiple languages:

🇺🇸 English • 🇬🇧 British English • 🇩🇪 German • 🇫🇷 French • 🇪🇸 Spanish • 🇮🇹 Italian • 🇳🇱 Dutch • 🇳🇴 Norwegian • 🇩🇰 Danish • 🇨🇿 Czech • 🇵🇱 Polish • 🇸🇪 Swedish • 🇵🇹 Portuguese • 🇷🇺 Russian

### Help Translate

We welcome translation contributions! See our [Translation Guide](CONTRIBUTING_TRANSLATIONS.md) for details on how to:

- Update existing translations
- Add new languages
- Test your translations

**Quick start**: Edit translation files directly on GitHub in [`src/translations/`](https://github.com/WJDDesigns/Ultra-Card/tree/main/src/translations) and create a pull request.

## Community & Support

- **Discord**: [Join our Discord](https://discord.gg/6xVgHxzzBV) for help, discussion, and sharing your creations
- **GitHub**: [Report issues](https://github.com/WJDDesigns/Ultra-Card/issues) or contribute code
- **Support Development**: [Leave a tip](https://www.paypal.com/ncp/payment/NLHALFSPA7PUS) if you find Ultra Card useful

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, improving documentation, or translating to new languages, your help makes Ultra Card better for everyone.

Please see our [contributing guidelines](CONTRIBUTING_TRANSLATIONS.md) for more details.

## License

MIT License - see [LICENSE](license) file for details.

## Credits

Created by **[WJD Designs](https://wjddesigns.com)**

### Special Thanks

Special thanks to our amazing Discord community for helping shape Ultra Card and making it what it is today:

BlowfishDiesel, Knucklehead Smiff, Martin / Korsiolsa, MoonRaven, mooseBringer, The_Cre8r, K1ngF1sher and many others.

Your feedback, testing, preset contributions, and enthusiasm drive this project forward. Thank you! 🙏

---

**Built for Home Assistant with ❤️**

_Current Version: 2.0-beta19_
