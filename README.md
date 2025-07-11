[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)

# Ultra Card

A powerful modular card builder for Home Assistant that lets you create custom layouts with a professional page-builder interface.

## ✨ Features

### 🏗️ **Modular Layout System**

- **Visual Layout Builder** - Drag-and-drop interface for creating custom card layouts
- **Flexible Row & Column System** - Create complex layouts with multiple columns and responsive design
- **Professional Module Types** - Text, separators, images, info entities, progress bars, icons, and layout containers

### 🔧 **Module Types**

- **Text Module** - Custom text with full typography controls
- **Separator Module** - Visual dividers with multiple styles
- **Image Module** - Display images with responsive sizing
- **Info Module** - Entity information with dynamic templates
- **Bar Module** - Progress bars for sensors
- **Icon Module** - Status icons with click actions
- **Layout Modules** - Horizontal and vertical containers

### 🎯 **Conditional Logic**

- **Entity State Conditions** - Show based on entity values
- **Template Conditions** - Full Jinja2 template support
- **Time Range Conditions** - Display during specific hours
- **Numeric Conditions** - Compare sensor values
- **Device Tracker Conditions** - Show based on presence
- **Multiple Logic Modes** - Always, AND logic, OR logic

## 🚀 Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click the menu (three dots) and select "Custom repositories"
4. Add `https://github.com/WJDDesigns/Ultra-Card` as a "Dashboard" repository
5. Install "Ultra Card"
6. Restart Home Assistant

### Manual Installation

1. Download the latest release from GitHub
2. Copy `ultra-card.js` to your `www/community/ultra-card/` directory
3. Add the resource in your Lovelace configuration:

```yaml
resources:
  - url: /local/community/ultra-card/ultra-card.js
    type: module
```

## 📖 Usage

1. **Add the Card** - In Lovelace, add a new card and select "Ultra Card"
2. **Layout Builder** - Use the visual layout builder to create your design
3. **Add Modules** - Click "+" to add text, images, info, bars, icons, and more
4. **Configure Settings** - Each module has General, Logic, and Design tabs
5. **Set Conditions** - Add conditional logic to show/hide elements dynamically

### Basic Example

```yaml
type: custom:ultra-card
layout:
  rows:
    - id: row1
      columns:
        - id: col1
          modules:
            - type: text
              text: 'Welcome Home'
              font_size: 24
              color: '#2196f3'
            - type: separator
              style: line
            - type: info
              info_entities:
                - entity: sensor.temperature
                  name: 'Temperature'
                  show_icon: true
```

### Advanced Example with Conditions

```yaml
type: custom:ultra-card
layout:
  rows:
    - id: row1
      columns:
        - id: col1
          modules:
            - type: text
              text: 'Good Morning!'
              display_mode: every
              display_conditions:
                - type: time
                  time_from: '06:00'
                  time_to: '12:00'
```

## 🎨 Customization

### Module Settings

Each module has three tabs:

- **General** - Module-specific settings (text, entity, appearance)
- **Logic** - Conditional display rules
- **Design** - Typography, colors, spacing, borders

### Column Layouts

Choose from pre-built column layouts:

- Single column (100%)
- Two columns (50/50, 30/70, 70/30, 40/60, 60/40)
- Three columns (33/33/33, 25/50/25, 20/60/20)
- Four columns (25/25/25/25)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Credits

Created by **WJD Designs**

---

**Built for Home Assistant with ❤️**
