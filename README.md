[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)
![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)

# Ultra Card 2.0

## The Visual Dashboard Builder That Changes Everything

**Build professional Home Assistant dashboards without writing a single line of YAML.** Ultra Card 2.0 is a revolutionary modular card builder that transforms dashboard creation from tedious YAML editing into an intuitive visual design experience.

Complete creative freedom meets drag-and-drop simplicity. Whether you're a beginner or a Home Assistant power user, Ultra Card empowers you to create stunning, feature-rich dashboards in minutes, not hours.

![preview-uc](https://github.com/user-attachments/assets/869c8d8d-e51f-4c30-b626-b820e4dd5fae)

**[Visit UltraCard.io](https://ultracard.io)** | **[Join Discord](https://discord.gg/6xVgHxzzBV)** | **[View Documentation](https://github.com/WJDDesigns/Ultra-Card)**

---

## Why Ultra Card?

### What Sets Us Apart

**🎨 Visual-First Philosophy**  
Other cards require YAML knowledge and constant file editing. Ultra Card is built from the ground up for visual creators. Every feature, every setting, every design choice is accessible through an intuitive UI. Zero YAML required.

**🧩 Complete Modular Freedom**  
Ultra Card isn't just another card. It's a complete layout engine that can build ANY dashboard design imaginable. With 19+ module types, drag-and-drop layouts, and unlimited nesting, your creativity is the only limit.

**⚡ Professional-Grade Engineering**  
Built with TypeScript from the ground up. Enterprise-ready, battle-tested, and optimized for performance. Smart caching, responsive design, and seamless Home Assistant integration make Ultra Card reliable for both hobby users and professional installations.

**🛒 Community-Powered Marketplace**  
Access hundreds of pre-built card designs through our integrated Preset Marketplace. One-click installation, category filtering, and preview before you install. Share your creations with the community and discover new design ideas daily.

**🔌 Ecosystem Unifier (Pro)**  
Break down the barriers between card ecosystems. Ultra Card Pro lets you embed ANY custom Home Assistant card (Bubble Card, Mushroom Cards, ApexCharts, and hundreds more) directly within Ultra Card's powerful layout system.

**☁️ Enterprise-Grade Protection (Pro)**  
Cloud sync, automatic daily backups with 30-day retention, and smart restore functionality protect your dashboard investment. Never lose hours of design work again.

---

## Features at a Glance

### Build Visually

- **🎨 Drag-and-Drop Builder** - Effortlessly arrange layouts with instant visual feedback
- **🛠️ Visual Editor** - Configure everything through an intuitive UI, no YAML required
- **🎯 4-Tab Module Settings** - General, Actions, Logic, and Design for complete control
- **📱 Mobile Optimized** - Touch gestures and responsive layouts for all devices

### Endless Possibilities

- **📦 19+ Module Types** - Content display, interactive controls, layout systems, and Pro animated modules
- **🔧 Conditional Logic** - Show/hide elements based on states, time, or Jinja2 templates
- **🔗 Template Support** - Full Jinja2 template evaluation with CodeMirror editor
- **🔌 Card Integration** - Native HA cards (unlimited) + 3rd party cards (5 free, unlimited Pro)
- **🎭 Rich Animation System** - Animated icons, bars, hover effects, and smooth transitions

### Professional Design

- **🌈 Complete Design Controls** - Typography, colors, spacing, borders, shadows, and filters
- **🎨 Gradient Support** - Full gradient modes with multiple style options
- **✨ Animation Effects** - Intro/outro animations, hover states, and Pro animated modules
- **🎬 Video Backgrounds (Pro)** - Stunning video backgrounds with glass blur effects
- **🌓 Light & Dark Theme Support** - Seamless integration with Home Assistant themes

### Cloud Power (Pro)

- **☁️ Cloud Configuration Sync** - Edit anywhere, access everywhere across all devices
- **📸 Automatic Daily Backups** - 30-day retention protects your dashboard investment
- **💾 Manual Snapshots** - Up to 30 named backups for critical configurations
- **🔄 Smart Restore** - Intelligent backup matching by name or position
- **🔌 Native & 3rd Party Cards** - Native HA cards unlimited for all; unlimited custom cards with Pro

### Community-Driven

- **🛒 Preset Marketplace** - One-click community presets with instant installation
- **🌎 14 Languages** - Full internationalization support
- **💬 Active Discord Community** - Help, discussion, and sharing creations
- **⭐ Favorites System** - Star and organize your most-used presets

---

## Quick Start

### 1. Install Ultra Card

#### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=WJDDesigns&repository=Ultra-Card&category=plugin)

**Or manually:**

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Go to "Frontend"
4. Click the menu (three dots) and select "Custom repositories"
5. Add `https://github.com/WJDDesigns/Ultra-Card` as a "Lovelace" repository
6. Install "Ultra Card"
7. Restart Home Assistant

#### Manual Installation

1. Download `ultra-card.js` from the [latest release](https://github.com/WJDDesigns/Ultra-Card/releases)
2. Put `ultra-card.js` file into your `config/www` folder
3. Add reference in Dashboard:
   - **UI Method:** _Settings_ → _Dashboards_ → _More Options_ → _Resources_ → _Add Resource_ → Set URL as `/local/ultra-card.js` → Set type as `JavaScript Module`
   - **YAML Method:** Add to `lovelace` section:
     ```yaml
     resources:
       - url: /local/ultra-card.js
         type: module
     ```

### 2. Create Your First Card

1. In Dashboard UI, click **3 dots** in top right corner
2. Click **Edit Dashboard**
3. Click **Plus button** to add a new card
4. Find **Custom: Ultra Card** in the list
5. Use the **Layout Builder** tab to drag and drop modules

### 3. Customize with the 4-Tab Editor

Each module has four tabs for complete control:

- **General** - Module content and basic settings
- **Actions** - Tap, hold, and double-tap behaviors
- **Logic** - Conditional display rules
- **Design** - Typography, colors, spacing, borders, shadows, animations

### 4. Optional: Upgrade to Pro

Visit **[UltraCard.io](https://ultracard.io)** to unlock cloud sync, automated backups, exclusive animated modules, and unlimited 3rd party card integration.

---

## 19+ Modules for Every Use Case

<img width="812" height="814" alt="modules" src="https://github.com/user-attachments/assets/b8208e40-e0c4-43c6-afa3-eba61aa22485" />

### Content Display Modules

**Free Modules:**

- 📝 **[Text Module](docs/modules/text.md)** - Custom text with rich formatting and template support
- 🎯 **[Icon Module](docs/modules/icon.md)** - Entity-linked icons with states, templates, and animations
- ℹ️ **[Info Module](docs/modules/info.md)** - Entity information display with organized rows
- 🖼️ **[Image Module](docs/modules/image.md)** - Images with conditional logic and unlimited height
- 📖 **[Markdown Module](docs/modules/markdown.md)** - Rich text with CodeMirror editor
- 📊 **[Bar Module](docs/modules/bar.md)** - Progress bars with multiple styles, gradients, and animations
- 📈 **[Graphs Module](docs/modules/graphs.md)** - Historical data visualization with forecasts
- 📹 **[Camera Module](docs/modules/camera.md)** - Live camera feeds with fullscreen, zoom, and audio controls

### Interactive Control Modules

**Free Modules:**

- 🔘 **[Button Module](docs/modules/button.md)** - Interactive buttons with custom actions
- 🎚️ **Slider Module** - Smooth numeric input controls with animations
- 🔢 **Spinbox Module** - Increment/decrement controls for precise adjustments
- 📋 **Dropdown Module** - Interactive selectors with entity source support
- 💡 **Light Module** - Specialized light controls with color picking and auto-detection
- 📊 **Gauge Module** - Circular gauge displays for sensor values

### Layout & Organization Modules

**Free Modules:**

- ↔️ **[Horizontal Layout](docs/modules/horizontal.md)** - Arrange modules horizontally
- ↕️ **[Vertical Layout](docs/modules/vertical.md)** - Stack modules vertically
- 📑 **Tabs Module** - Tabbed container with horizontal or vertical orientation for organizing modules into switchable sections
- ➖ **[Separator Module](docs/modules/separator.md)** - Visual dividers with multiple styles

### Pro Animated Modules 🌟

Unlock exclusive animated modules with **[Ultra Card Pro](https://ultracard.io)**:

- 🕐 **Animated Clock** - Beautiful flip clock with smooth animations and customizable styles
- 🌤️ **Animated Weather** - Current weather with animated weather icons
- 📅 **Animated Forecast** - Multi-day forecast with animated icons and detailed information
- 🎬 **Video Background** - Stunning video backgrounds with glass blur effects

### Card Integration 🔌

**Use native HA cards and embed custom cards** within Ultra Card's layout system:

**Native Home Assistant Cards (Unlimited - All Users):**
- Entities, Glance, Button, Picture, Markdown, Conditional, and all other native HA cards
- No limits, always free

**Community & 3rd Party Cards:**

- **Bubble Card** - Modern bubble-style cards
- **Mushroom Cards** - Minimalist card collection
- **ApexCharts Card** - Advanced charting
- **Mini Graph Card** - Compact graphs
- **Button Card** - Highly customizable buttons
- **And hundreds more!**

**All Users:** Unlimited native Home Assistant cards  
**Free Tier:** Up to 5 community/3rd-party cards per dashboard  
**Pro Tier:** Unlimited community/3rd-party card integration

---

## 🚀 Ultra Card Pro Cloud - Enterprise Dashboard Management

**Take your dashboards to the next level with cloud sync, automated backups, and exclusive features.**

Ultra Card Pro transforms how you manage your Home Assistant dashboards. Never lose your work, sync seamlessly across devices, and unlock exclusive professional modules that make your dashboards truly stand out.

### Why Go Pro?

☁️ **Cloud Configuration Sync**  
Edit on your phone, tablet, or desktop. Changes sync instantly across all your Home Assistant instances. One configuration, accessible everywhere.

📸 **Automatic Daily Backups**  
Every dashboard is backed up automatically with 30-day retention. Sleep soundly knowing your hours of design work are protected.

💾 **Manual Snapshots**  
Create up to 30 named snapshots per card. Perfect for seasonal layouts, testing configurations, or keeping multiple dashboard versions.

🎬 **Exclusive Pro Modules**

- **Video Background Module** - Stunning video backgrounds with glass blur effects
- **Animated Clock** - Beautiful flip clock with smooth animations
- **Animated Weather** - Current weather with animated icons
- **Animated Forecast** - Multi-day weather forecast with animations

🔌 **Native & 3rd Party Card Integration**  
- **Native HA Cards (Unlimited)**: Use all native Home Assistant cards (entities, glance, button, etc.) without limits
- **3rd Party Cards (Pro)**: Embed unlimited Bubble Cards, Mushroom Cards, ApexCharts, and any custom card with Ultra Card Pro

⚡ **Priority Support**  
Get faster responses from the Ultra Card development team when you need help.

🔄 **Smart Restore**  
Intelligent backup restore that matches cards by custom name or position. No manual reconfiguration needed.

### How to Get Started

**Step 1: Subscribe to Ultra Card Pro**  
Visit **[UltraCard.io](https://ultracard.io)** and subscribe for just **$4.99/month**. Get instant access to all Pro features and support ongoing development.

**Step 2: Install the Integration**  
Install the **[Ultra Card Pro Cloud](https://my.home-assistant.io/redirect/hacs_repository/?owner=WJDDesigns&repository=ultra-card-pro-cloud&category=integration)** integration via HACS with one click.

**Step 3: Connect Your Account**  
Enter your UltraCard.io credentials once. All devices connected to your Home Assistant instance automatically get Pro features. No per-device login required.

**Step 4: Start Creating**  
Enjoy cloud-powered features, exclusive modules, and peace of mind knowing your dashboards are protected.

### Free vs Pro

| Feature                    |  Free   |     Pro     |
| -------------------------- | :-----: | :---------: |
| Core Modules (15+)         |   ✅    |     ✅      |
| Visual Editor & Builder    |   ✅    |     ✅      |
| Preset Marketplace         |   ✅    |     ✅      |
| Conditional Logic          |   ✅    |     ✅      |
| Cloud Configuration Sync   |   ❌    |     ✅      |
| Automatic Daily Backups    |   ❌    |     ✅      |
| Manual Snapshots           |   ❌    | ✅ Up to 30 |
| Video Background Module    |   ❌    |     ✅      |
| Animated Clock Module      |   ❌    |     ✅      |
| Animated Weather Module    |   ❌    |     ✅      |
| Animated Forecast Module   |   ❌    |     ✅      |
| Native HA Cards            |   ✅ Unlimited   |  ✅ Unlimited   |
| 3rd Party Card Integration | 5 cards |  Unlimited  |
| Priority Support           |   ❌    |     ✅      |

**Start your Pro journey at [UltraCard.io](https://ultracard.io) and unlock the full potential of your Home Assistant dashboards.**

---

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

---

## Module Settings System

Each module includes a powerful 4-tab settings system for complete customization:

<img width="698" height="754" alt="tabs-view" src="https://github.com/user-attachments/assets/b65cc607-e914-4d0a-88fa-2d07dfbafba3" />

### General Tab

Configure module content, entity selection, and basic settings. Each module type has specialized options tailored to its function.

### Actions Tab

Set up tap, hold, and double-tap behaviors:

- More Info - Open entity details
- Toggle - Switch entity state
- Navigate - Go to another dashboard
- URL - Open external links
- Perform Action - Call Home Assistant services
- Assist - Trigger voice assistant

### Logic Tab

Control module visibility with conditional logic:

- **Entity State Conditions** - Show/hide based on entity states
- **Time-Based Conditions** - Display modules at specific times
- **Template Conditions** - Use Jinja2 templates for complex logic
- **Multiple Conditions** - Combine conditions with AND/OR logic

### Design Tab

Professional styling controls:

- **Typography** - Font size, weight, alignment, line height
- **Colors** - Background, text, border colors with transparency
- **Spacing** - Margins, padding, and gap controls
- **Borders** - Style, width, radius, and individual side control
- **Shadows** - Box shadows with customizable blur and spread
- **Animations** - Intro/outro animations, hover effects, and transitions
- **Filters** - Blur, brightness, contrast, and more

---

## Card Integration

Ultra Card integrates seamlessly with both native Home Assistant cards and custom 3rd party cards.

### Native HA Cards (Unlimited - All Users)

All users can add unlimited native Home Assistant cards (entities, glance, button, picture, markdown, conditional, etc.) to their Ultra Card layouts. These cards use their native editors and work exactly as they do in standard Home Assistant dashboards.

### 3rd Party Card Integration (5 Free, Unlimited Pro)

Ultra Card breaks down the barriers between card ecosystems by allowing you to embed **any** custom Home Assistant card directly within your layouts.

### How It Works

1. **Add a Module** - Click "Add Module" on any column
2. **Navigate to 3rd Party Tab** - Find installed custom cards
3. **Click to Add** - Select any card to add it instantly
4. **Configure** - Use the card's native visual editor within Ultra Card

### Benefits

- **Unified Layout System** - Combine your favorite cards with Ultra Card's powerful layout engine
- **Native Configuration** - Each card keeps its own visual editor
- **Apply Logic & Design** - Use Ultra Card's Logic and Design tabs to control visibility and styling
- **Smart Caching** - No flashing or reloading with intelligent element caching
- **Live Preview** - See exactly how cards look before adding them

### Supported Cards

Ultra Card works with **all** custom Lovelace cards, including:

- Bubble Card
- Mushroom Cards
- ApexCharts Card
- Mini Graph Card
- Button Card
- Swipe Card
- Slider Entity Row
- And hundreds more!

**Upgrade to Pro for unlimited 3rd party card integration at [UltraCard.io](https://ultracard.io).**

---

## Translations

Ultra Card supports 15 languages with full internationalization:

🇺🇸 English • 🇬🇧 British English • 🇩🇪 German • 🇫🇷 French • 🇪🇸 Spanish • 🇮🇹 Italian • 🇳🇱 Dutch • 🇳🇴 Norwegian • 🇩🇰 Danish • 🇨🇿 Czech • 🇵🇱 Polish • 🇸🇪 Swedish • 🇵🇹 Portuguese • 🇷🇺 Russian • 🇪🇺 Catalan

### Help Translate

We welcome translation contributions! See our [Translation Guide](CONTRIBUTING_TRANSLATIONS.md) for details on how to:

- Update existing translations
- Add new languages
- Test your translations

**Quick start**: Edit translation files directly on GitHub in [`src/translations/`](https://github.com/WJDDesigns/Ultra-Card/tree/main/src/translations) and create a pull request.

---

## Community & Support

### Official Channels

**🌐 [UltraCard.io](https://ultracard.io)** - Official website, Pro subscriptions, and account management

**💬 [Discord Community](https://discord.gg/6xVgHxzzBV)** - Get help, share creations, and connect with other users

**🐛 [GitHub Issues](https://github.com/WJDDesigns/Ultra-Card/issues)** - Report bugs and request features

**🛒 [Preset Marketplace](https://ultracard.io)** - Browse and share card presets

### Get Pro Support

Pro subscribers receive priority support through the UltraCard.io portal and Discord. Questions are answered faster, and you get direct access to the development team.

**[Upgrade to Pro at UltraCard.io](https://ultracard.io)**

### Support Development

If you find Ultra Card useful, consider:

- **[Upgrading to Pro](https://ultracard.io)** - Get exclusive features while supporting development
- **[Leaving a tip](https://www.paypal.com/ncp/payment/NLHALFSPA7PUS)** - One-time contributions are always appreciated
- **Sharing Ultra Card** - Tell others about your favorite dashboard builder
- **Contributing** - Submit translations, presets, or code improvements

---

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or translating to new languages, your help makes Ultra Card better for everyone.

### Ways to Contribute

- **Translations** - See [Translation Guide](CONTRIBUTING_TRANSLATIONS.md)
- **Presets** - Share your card designs in the Marketplace
- **Code** - Submit pull requests for bug fixes or features
- **Documentation** - Improve guides and examples
- **Testing** - Report bugs and test beta releases

Please follow our coding standards and create pull requests with clear descriptions of your changes.

---

## Technical Details

### Requirements

- **Home Assistant** 2024.1.0 or newer
- **HACS** (recommended for easy installation)
- **Modern Browser** with ES2015+ support

### Performance

- Built with TypeScript for reliability and type safety
- Optimized rendering with smart caching
- Minimal bundle size with tree-shaking
- Responsive design scales from mobile to 4K displays

### Privacy & Security

- **No tracking** - Ultra Card doesn't collect analytics or personal data
- **Local-first** - Free features work entirely locally
- **Secure sync** - Pro Cloud uses encrypted connections
- **Open source** - Full code transparency on GitHub

---

## License

MIT License - see [LICENSE](license) file for details.

---

## Credits

**Created by [WJD Designs](https://wjddesigns.com)**

### Special Thanks

Ultra Card wouldn't be what it is today without our amazing Discord community. Special recognition to:

**BlowfishDiesel** • **Knucklehead Smiff** • **Martin / Korsiolsa** • **MoonRaven** • **mooseBringer** • **The_Cre8r** • **K1ngF1sher**

Your feedback, testing, preset contributions, and enthusiasm drive this project forward. Thank you! 🙏

---

## Built by Dashboard Creators, for Dashboard Creators

Ultra Card 2.0 represents the culmination of years of Home Assistant dashboard experience and months of intensive development. We've taken everything we learned building dashboards and created the tool we always wished existed.

**Version 2.0.0** - The visual dashboard builder that changes everything.

**[Get Started Free](https://my.home-assistant.io/redirect/hacs_repository/?owner=WJDDesigns&repository=Ultra-Card&category=plugin)** • **[Upgrade to Pro](https://ultracard.io)** • **[Join Our Community](https://discord.gg/6xVgHxzzBV)**

---

_Built for Home Assistant with ❤️_
