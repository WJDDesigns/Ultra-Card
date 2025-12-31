# Slider Control Module

Interactive slider UI for controlling Home Assistant entities with precision and style.

## Overview

The Slider Control module provides a premium, customizable slider interface for controlling various entity types in Home Assistant. It combines a beautiful visual design with advanced features while keeping the configuration simple and intuitive.

## Supported Entity Types

- **Lights** - Control brightness, color temperature, or both
- **Covers** - Control position (blinds, shades, garage doors)
- **Fans** - Control speed percentage
- **Input Numbers** - Control numeric values
- **Climate** - Control temperature settings

## Key Features

### Layout Modes

#### Overlay Mode
Information (icon, name, value) is displayed directly on top of the slider bar. Perfect for a clean, compact look.

- **Positioning**: Left, Center, or Right alignment
- **Bar Fill**: Adjust how much of the module width the bar fills (50-100%)
- **Use Case**: Ideal for compact cards or when you want maximum visual focus on the slider

#### Split Mode
Slider and information are displayed side-by-side or top-and-bottom, with separate sections.

- **Bar Position**: Left, Right, Top, or Bottom
- **Info Alignment**: Left, Center, or Right within its section
- **Split Ratio**: Control the size ratio between slider and info (10-90%)
- **Use Case**: Best when you want more detailed information visible alongside the slider

### Slider Styles

Choose from 11 visual styles to match your design:

- **Flat** - Simple, clean solid colors
- **Glossy** - Shiny, reflective finish
- **Embossed** - Raised 3D effect
- **Inset** - Recessed, pressed-in look
- **Gradient Overlay** - Smooth color transitions
- **Neon Glow** - Vibrant glowing effect
- **Outline** - Border-only style
- **Glass** - Frosted glass effect with blur
- **Metallic** - Brushed metal appearance
- **Neumorphic** - Soft, modern raised/inset effect
- **Minimal** - Ultra-clean minimal design

### Display Elements

**Icon**
- Use entity's default icon or choose custom
- Adjustable size (16-48px)
- Custom color support
- Dynamic icon option (updates based on entity state)

**Name**
- Override entity name or use default
- Adjustable font size (10-24px)
- Bold text option
- Custom color

**Value**
- Show current numeric value
- Custom suffix support (%, °C, °F, etc.)
- Adjustable font size
- Custom color

### Toggle Integration

Add an on/off switch alongside the slider for quick power control:

- **Positioning**: Left, Right, Top, or Bottom
- **Custom Colors**: Different colors for on/off states
- **Size Control**: Adjust toggle size (20-48px)
- Works with lights, fans, switches, and covers

### Advanced Features

**Custom Value Ranges**
- Set custom min/max values
- Define step increments
- Override entity defaults

**Animation**
- Smooth transitions on value changes
- Adjustable animation duration (100-1000ms)
- Can be disabled for instant feedback

**Haptic Feedback**
- Vibration on interaction (mobile devices)
- Separate feedback for slider and toggle

**Entity-Specific Options**
- **Lights**: Choose between brightness, color temperature, or both
- **Covers**: Invert direction option for reversed controls

## Configuration Examples

### Basic Light Slider

```yaml
type: custom:ultra-card
layout:
  rows:
    - columns:
        - modules:
            - type: slider_control
              entity: light.living_room
              orientation: horizontal
              layout_mode: overlay
              slider_style: glossy
              show_toggle: true
```

### Cover Position Control

```yaml
type: custom:ultra-card
layout:
  rows:
    - columns:
        - modules:
            - type: slider_control
              entity: cover.bedroom_blinds
              orientation: horizontal
              layout_mode: split
              split_bar_position: left
              split_ratio: 60
              cover_invert: false
              show_toggle: true
              value_suffix: "%"
```

### Fan Speed Control

```yaml
type: custom:ultra-card
layout:
  rows:
    - columns:
        - modules:
            - type: slider_control
              entity: fan.ceiling_fan
              orientation: horizontal
              slider_style: neon-glow
              slider_fill_color: "#00ff00"
              show_icon: true
              show_name: true
              show_value: true
              value_suffix: "%"
```

### Climate Temperature

```yaml
type: custom:ultra-card
layout:
  rows:
    - columns:
        - modules:
            - type: slider_control
              entity: climate.thermostat
              orientation: horizontal
              min_value: 16
              max_value: 30
              step: 0.5
              slider_style: metallic
              value_suffix: "°C"
              show_toggle: false
```

### Vertical Slider

```yaml
type: custom:ultra-card
layout:
  rows:
    - columns:
        - modules:
            - type: slider_control
              entity: light.desk_lamp
              orientation: vertical
              slider_height: 200
              layout_mode: overlay
              overlay_position: center
              slider_style: gradient-overlay
```

## Configuration Reference

### Entity Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | *required* | Entity to control |
| `name` | string | Entity name | Override display name |
| `attribute` | string | - | Control specific attribute (advanced) |
| `min_value` | number | 0 | Minimum slider value |
| `max_value` | number | 100 | Maximum slider value |
| `step` | number | 1 | Value increment step |

### Layout & Orientation

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `orientation` | string | `horizontal` | Slider direction: `horizontal` or `vertical` |
| `layout_mode` | string | `overlay` | Layout style: `overlay` or `split` |
| `overlay_position` | string | `center` | Info position in overlay: `left`, `center`, `right` |
| `bar_fill_percentage` | number | 100 | Bar width in overlay mode (50-100%) |
| `split_bar_position` | string | `left` | Bar position in split: `left`, `right`, `top`, `bottom` |
| `split_info_position` | string | `center` | Info alignment in split: `left`, `center`, `right` |
| `split_ratio` | number | 50 | Bar vs info size ratio (10-90%) |

### Slider Style

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `slider_style` | string | `flat` | Visual style (11 options) |
| `slider_height` | number | 40 | Height/width in pixels (20-200) |
| `slider_radius` | string | `round` | Border radius: `square`, `round`, `pill` |
| `border_radius` | number | 10 | Custom border radius in pixels |
| `glass_blur_amount` | number | 8 | Blur amount for glass style (0-20px) |

### Colors

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `slider_track_color` | string | Auto | Slider background color |
| `slider_fill_color` | string | Primary | Filled portion color |
| `slider_thumb_color` | string | `#ffffff` | Draggable thumb color |
| `slider_thumb_size` | number | 20 | Thumb size in pixels (10-40) |

### Display Elements

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show_icon` | boolean | `true` | Show icon |
| `icon` | string | Auto | Custom icon (MDI) |
| `icon_size` | number | 24 | Icon size in pixels |
| `icon_color` | string | Auto | Icon color |
| `dynamic_icon` | boolean | `true` | Use entity's default icon |
| `show_name` | boolean | `true` | Show entity name |
| `name_size` | number | 14 | Name font size |
| `name_color` | string | Auto | Name text color |
| `name_bold` | boolean | `true` | Bold name text |
| `show_value` | boolean | `true` | Show numeric value |
| `value_size` | number | 14 | Value font size |
| `value_color` | string | Auto | Value text color |
| `value_suffix` | string | `%` | Text after value |

### Toggle Control

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show_toggle` | boolean | `false` | Show on/off toggle |
| `toggle_position` | string | `right` | Toggle position: `left`, `right`, `top`, `bottom` |
| `toggle_size` | number | 28 | Toggle size in pixels (20-48) |
| `toggle_color_on` | string | Primary | Color when on |
| `toggle_color_off` | string | Auto | Color when off |

### Animation & Interaction

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `animate_on_change` | boolean | `true` | Smooth value transitions |
| `animation_duration` | number | 200 | Animation length in ms (100-1000) |
| `haptic_feedback` | boolean | `true` | Vibration feedback on mobile |

### Entity-Specific Options

#### Lights
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `light_control_mode` | string | `brightness` | Control mode: `brightness`, `color_temp`, `both` |

#### Covers
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cover_invert` | boolean | `false` | Reverse slider direction |

## Tips & Best Practices

### Choosing Layout Mode

**Use Overlay when:**
- Space is limited
- You want a clean, minimal look
- The slider is the primary focus
- You're using it in a grid with many controls

**Use Split when:**
- You have more space available
- You want to display more information
- The entity name/value is important context
- You're creating a detailed control panel

### Slider Styles

- **Flat** and **Minimal**: Best for modern, clean interfaces
- **Glass** and **Neumorphic**: Great for frosted or depth-based themes
- **Neon Glow**: Perfect for dark themes or accent controls
- **Glossy** and **Metallic**: Add premium feel to controls
- **Outline**: Ideal when you want the fill color to be the focus

### Performance Tips

- Disable `animate_on_change` if you experience lag on slower devices
- Use solid colors instead of gradients for better performance
- Reduce `animation_duration` for snappier feel

### Accessibility

- Ensure sufficient color contrast between track and fill
- Use clear icons and appropriate sizes for touch targets
- Add descriptive names for screen readers
- Consider toggle integration for easier on/off control

## Compatibility Matrix

| Entity Type | Brightness | Position | Speed | Temperature | Generic Value |
|------------|-----------|----------|-------|-------------|---------------|
| Light | ✅ | - | - | ✅* | - |
| Cover | - | ✅ | - | - | - |
| Fan | - | - | ✅ | - | - |
| Input Number | - | - | - | - | ✅ |
| Climate | - | - | - | ✅ | - |
| Switch | - | - | - | - | - |

*Color temperature for lights (optional)

## Common Issues

### Slider doesn't update entity
- Verify entity supports the control (not all lights support brightness)
- Check Home Assistant logs for service call errors
- Ensure entity is not unavailable or offline

### Value appears incorrect
- Check `min_value` and `max_value` settings
- For input_number, ensure ranges match entity configuration
- For climate, verify temperature unit matches

### Toggle doesn't appear
- Enable `show_toggle` option
- Verify entity supports turn_on/turn_off services
- Check entity domain is supported (light, fan, switch, cover)

## Future Enhancements

Planned features for future releases:
- Vertical orientation for covers (top-to-bottom)
- Color picker integration for RGB lights
- Multi-slider support (brightness + color temp simultaneously)
- Custom gradient fills
- Additional slider styles
- Touch gesture enhancements
- Voice control integration

