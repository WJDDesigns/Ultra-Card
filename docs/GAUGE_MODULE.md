# Gauge Module Documentation

## Overview

The **Gauge Module** is a powerful and flexible module for displaying sensor values as customizable gauges with various visual styles, color modes, and pointer options. It's perfect for displaying metrics like battery levels, temperature, humidity, speed, pressure, or any numeric sensor value in an intuitive and visually appealing way.

## Features

### 🎨 Multiple Gauge Styles

- **Basic** - Simple and clean gauge display
- **Modern** - Contemporary design with smooth animations
- **Speedometer** - Car-style speedometer gauge (270° arc)
- **Arc** - Semi-circle arc gauge (180°)
- **Radial** - Full circle gauge (360°)
- **Lines** - Gauge made of individual line segments
- **Block** - Discrete block-based gauge segments
- **Minimal** - Clean, minimalist circular design
- **Inset** - Gauge with depth and shadow effects
- **3D** - Gauge with 3D visual effects
- **Digital** - LCD-style digital display

### 🎯 Pointer Styles

- **Needle** - Classic triangular needle pointer
- **Triangle** - Simple triangle pointer
- **Arrow** - Arrow-shaped pointer with direction indicator
- **Line** - Simple line pointer
- **Circle** - Line with circle at the end

### 🌈 Color Modes

#### Solid Color

Single color for the entire gauge.

#### Gradient

Smooth color gradient across the gauge range with customizable stops:

- Define unlimited gradient stops
- Set position (0-100%) for each stop
- Choose any color for each stop
- Perfect for representing ranges (e.g., green → yellow → red)

#### Segments

Discrete color segments with defined ranges:

- Define multiple segments with from/to values
- Each segment has its own color
- Optional labels for each segment
- Ideal for categorized data (e.g., "Low", "Normal", "High")

### 📊 Value Sources

- **Entity State** - Use entity's state value directly
- **Entity Attribute** - Extract value from entity attribute
- **Template** - Calculate value using Jinja2 templates

### 🎭 Display Options

- **Show/Hide Value** - Display the current numeric value
- **Value Position** - Top, Center, Bottom, or None
- **Value Format** - Custom format strings (e.g., "%.1f°C", "%.0f%%")
- **Show/Hide Name** - Display entity name or custom label
- **Name Position** - Top, Center, Bottom, or None
- **Show/Hide Min/Max** - Display range boundaries
- **Tick Marks** - Configurable tick marks with optional labels

### ✨ Animations

- Enable/disable smooth value transitions
- Configurable duration (100-5000ms)
- Multiple easing functions:
  - Linear
  - Ease In
  - Ease Out
  - Ease In-Out
  - Bounce

### 🎬 Integration with Global Tabs

- **Actions Tab** - Configure tap, hold, and double-tap actions
- **Logic Tab** - Control gauge visibility with conditions
- **Design Tab** - Apply global design properties

## Configuration

### Basic Example

```yaml
type: custom:ultra-card
rows:
  - columns:
      - modules:
          - type: gauge
            entity: sensor.battery_level
            gauge_style: modern
            min_value: 0
            max_value: 100
```

### Advanced Example with Gradient

```yaml
type: custom:ultra-card
rows:
  - columns:
      - modules:
          - type: gauge
            entity: sensor.cpu_temperature
            name: CPU Temperature
            gauge_style: speedometer
            gauge_size: 250
            gauge_thickness: 20
            min_value: 0
            max_value: 100

            # Value configuration
            value_type: entity
            show_value: true
            value_position: center
            value_font_size: 28
            value_format: '%.1f°C'

            # Pointer configuration
            pointer_enabled: true
            pointer_style: needle
            pointer_color: '#FFFFFF'
            pointer_length: 85
            pointer_width: 4

            # Gradient color mode
            gauge_color_mode: gradient
            gradient_stops:
              - position: 0
                color: '#4CAF50' # Green (cool)
              - position: 40
                color: '#8BC34A' # Light green
              - position: 60
                color: '#FFC107' # Yellow (warm)
              - position: 80
                color: '#FF9800' # Orange (hot)
              - position: 100
                color: '#F44336' # Red (critical)

            # Display configuration
            show_name: true
            name_position: top
            show_min_max: true
            show_ticks: true
            tick_count: 10

            # Animation
            animation_enabled: true
            animation_duration: 1000
            animation_easing: ease-out

            # Actions
            tap_action:
              action: more-info
```

### Segments Example

```yaml
type: custom:ultra-card
rows:
  - columns:
      - modules:
          - type: gauge
            entity: sensor.air_quality
            gauge_style: arc
            gauge_color_mode: segments
            segments:
              - from: 0
                to: 50
                color: '#4CAF50'
                label: 'Good'
              - from: 51
                to: 100
                color: '#FFC107'
                label: 'Moderate'
              - from: 101
                to: 150
                color: '#FF9800'
                label: 'Unhealthy'
              - from: 151
                to: 200
                color: '#F44336'
                label: 'Hazardous'
```

### Template Example

```yaml
type: custom:ultra-card
rows:
  - columns:
      - modules:
          - type: gauge
            entity: sensor.calculated_value
            value_type: template
            value_template: >
              {% set battery = states('sensor.battery') | float %}
              {% set reserve = states('sensor.battery_reserve') | float %}
              {{ battery + reserve }}
            min_value: 0
            max_value: 200
```

## Configuration Options

### Basic Settings

| Property    | Type   | Default      | Description                   |
| ----------- | ------ | ------------ | ----------------------------- |
| `entity`    | string | **required** | Entity ID to display          |
| `name`      | string | entity name  | Custom display name           |
| `min_value` | number | `0`          | Minimum value for gauge scale |
| `max_value` | number | `100`        | Maximum value for gauge scale |

### Value Configuration

| Property                 | Type   | Default  | Description                                     |
| ------------------------ | ------ | -------- | ----------------------------------------------- |
| `value_type`             | string | `entity` | Value source: `entity`, `attribute`, `template` |
| `value_attribute_entity` | string | -        | Entity for attribute mode                       |
| `value_attribute_name`   | string | -        | Attribute name for attribute mode               |
| `value_template`         | string | -        | Jinja2 template for template mode               |

### Gauge Style

| Property          | Type   | Default  | Description                                                                                                     |
| ----------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| `gauge_style`     | string | `modern` | Style: `basic`, `modern`, `speedometer`, `arc`, `radial`, `lines`, `block`, `minimal`, `inset`, `3d`, `digital` |
| `gauge_size`      | number | `200`    | Diameter/size in pixels (100-400)                                                                               |
| `gauge_thickness` | number | `15`     | Thickness of gauge track (1-50)                                                                                 |

### Pointer Configuration

| Property          | Type    | Default                | Description                                            |
| ----------------- | ------- | ---------------------- | ------------------------------------------------------ |
| `pointer_enabled` | boolean | `true`                 | Show/hide pointer                                      |
| `pointer_style`   | string  | `needle`               | Style: `needle`, `triangle`, `arrow`, `line`, `circle` |
| `pointer_color`   | string  | `var(--primary-color)` | Pointer color                                          |
| `pointer_length`  | number  | `80`                   | Length as % of radius (1-100)                          |
| `pointer_width`   | number  | `4`                    | Width in pixels (1-20)                                 |

### Color Configuration

| Property                 | Type    | Default                | Description                           |
| ------------------------ | ------- | ---------------------- | ------------------------------------- |
| `gauge_color_mode`       | string  | `gradient`             | Mode: `solid`, `gradient`, `segments` |
| `gauge_color`            | string  | `var(--primary-color)` | Color for solid mode                  |
| `gauge_background_color` | string  | `rgba(...)`            | Background track color                |
| `use_gradient`           | boolean | `true`                 | Enable gradient mode                  |
| `gradient_stops`         | array   | default stops          | Array of gradient stop objects        |
| `use_segments`           | boolean | `false`                | Enable segments mode                  |
| `segments`               | array   | -                      | Array of segment objects              |

#### Gradient Stop Object

```yaml
gradient_stops:
  - position: 0 # Position on gauge (0-100)
    color: '#4CAF50' # Color at this position
```

#### Segment Object

```yaml
segments:
  - from: 0 # Start value
    to: 50 # End value
    color: '#4CAF50' # Segment color
    label: 'Low' # Optional label
```

### Display Configuration

| Property            | Type    | Default                       | Description                                 |
| ------------------- | ------- | ----------------------------- | ------------------------------------------- |
| `show_value`        | boolean | `true`                        | Show numeric value                          |
| `value_position`    | string  | `center`                      | Position: `center`, `top`, `bottom`, `none` |
| `value_font_size`   | number  | `24`                          | Value text size (8-48)                      |
| `value_color`       | string  | `var(--primary-text-color)`   | Value text color                            |
| `value_format`      | string  | -                             | Format string (e.g., "%.1f°C")              |
| `show_name`         | boolean | `true`                        | Show name/label                             |
| `name_position`     | string  | `top`                         | Position: `top`, `center`, `bottom`, `none` |
| `name_font_size`    | number  | `16`                          | Name text size (8-32)                       |
| `name_color`        | string  | `var(--secondary-text-color)` | Name text color                             |
| `show_min_max`      | boolean | `true`                        | Show min/max labels                         |
| `min_max_font_size` | number  | `12`                          | Min/max text size (8-20)                    |
| `min_max_color`     | string  | `var(--secondary-text-color)` | Min/max text color                          |

### Tick Configuration

| Property               | Type    | Default                | Description                  |
| ---------------------- | ------- | ---------------------- | ---------------------------- |
| `show_ticks`           | boolean | `true`                 | Show tick marks              |
| `tick_count`           | number  | `10`                   | Number of major ticks (2-50) |
| `tick_color`           | string  | `var(--divider-color)` | Tick mark color              |
| `show_tick_labels`     | boolean | `false`                | Show numeric labels on ticks |
| `tick_label_font_size` | number  | `10`                   | Tick label size (6-16)       |

### Animation Configuration

| Property             | Type    | Default    | Description                                                      |
| -------------------- | ------- | ---------- | ---------------------------------------------------------------- |
| `animation_enabled`  | boolean | `true`     | Enable smooth transitions                                        |
| `animation_duration` | number  | `1000`     | Duration in milliseconds (100-5000)                              |
| `animation_easing`   | string  | `ease-out` | Easing: `linear`, `ease-in`, `ease-out`, `ease-in-out`, `bounce` |

### Action Configuration

| Property            | Type   | Default                 | Description          |
| ------------------- | ------ | ----------------------- | -------------------- |
| `tap_action`        | object | `{ action: 'default' }` | Action on tap        |
| `hold_action`       | object | `{ action: 'default' }` | Action on hold       |
| `double_tap_action` | object | `{ action: 'default' }` | Action on double tap |

## Use Cases

### Battery Level Indicator

Perfect for displaying battery levels with color-coded segments:

- 0-20%: Red (Critical)
- 21-50%: Yellow (Low)
- 51-100%: Green (Good)

### Temperature Monitoring

Display temperature with gradient from cold (blue) to hot (red):

- Use speedometer or arc style
- Gradient from blue → green → yellow → red
- Value format with temperature units

### Speed/RPM Gauge

Car-style speedometer for speed or RPM monitoring:

- Speedometer style for authentic look
- Pointer with needle or arrow style
- Tick marks for easy reading

### Progress Tracking

Track progress of tasks or processes:

- Minimal or radial style
- 0-100 range
- Simple gradient or solid color

### Air Quality Index

Display air quality with segments:

- Good (0-50): Green
- Moderate (51-100): Yellow
- Unhealthy (101-150): Orange
- Hazardous (151-200): Red

### System Monitoring

CPU, RAM, disk usage:

- Modern or arc style
- Percentage format
- Color-coded based on usage levels

## Tips and Best Practices

1. **Choose the Right Style**: Match the gauge style to your data type:

   - Speedometer for speed/RPM
   - Arc for compact displays
   - Radial for full-range metrics
   - Lines/Block for modern aesthetics

2. **Color Psychology**: Use intuitive colors:

   - Green for good/safe values
   - Yellow/Orange for warnings
   - Red for critical/dangerous values

3. **Gradient vs Segments**:

   - Use gradients for continuous data visualization
   - Use segments for categorized or threshold-based data

4. **Pointer Style**: Choose based on gauge style:

   - Needle for traditional/speedometer
   - Line for minimal/modern
   - Arrow for directional emphasis

5. **Animation**: Enable animations for smooth transitions, but consider:

   - Fast-changing values may look better with shorter durations
   - Disable for extremely frequent updates to reduce CPU usage

6. **Size Considerations**:

   - 150-200px: Good for dashboard cards
   - 250-300px: Large, prominent displays
   - Adjust thickness proportionally to size

7. **Accessibility**:
   - Don't rely solely on color
   - Include value display for precise readings
   - Use sufficient contrast for text elements

## Advanced Examples

### Multi-State Battery Gauge with Logic

```yaml
- type: gauge
  entity: sensor.battery
  gauge_style: speedometer
  gauge_color_mode: segments
  segments:
    - from: 0
      to: 15
      color: '#F44336'
      label: 'Critical'
    - from: 16
      to: 30
      color: '#FF9800'
      label: 'Low'
    - from: 31
      to: 70
      color: '#FFC107'
      label: 'Normal'
    - from: 71
      to: 100
      color: '#4CAF50'
      label: 'Full'
  display_mode: every
  display_conditions:
    - type: entity_state
      entity: binary_sensor.battery_monitoring
      operator: '='
      value: 'on'
```

### Custom Calculated Value Gauge

```yaml
- type: gauge
  entity: sensor.power_usage
  value_type: template
  value_template: >
    {% set usage = states('sensor.power_usage') | float %}
    {% set max_capacity = states('sensor.max_capacity') | float %}
    {{ (usage / max_capacity * 100) | round(1) }}
  min_value: 0
  max_value: 100
  value_format: '%.1f%%'
  gauge_style: modern
  gauge_color_mode: gradient
  gradient_stops:
    - position: 0
      color: '#4CAF50'
    - position: 70
      color: '#FFC107'
    - position: 90
      color: '#F44336'
```

## Browser Compatibility

The Gauge Module uses SVG for rendering and is compatible with:

- ✅ Chrome/Chromium (including Android)
- ✅ Firefox
- ✅ Safari (including iOS)
- ✅ Edge

## Performance Notes

- Animations use CSS transitions for smooth, hardware-accelerated rendering
- SVG rendering is efficient even with complex gradients
- Multiple gauges on one card are fully supported
- Updates are optimized to only re-render when values change

## Troubleshooting

### Gauge not displaying

- Verify entity exists and has a numeric state
- Check min/max values are correctly set
- Ensure gauge_size is reasonable (100-400)

### Colors not showing correctly

- Check color format (hex, rgb, rgba, or CSS variables)
- Verify gradient stops are ordered by position
- For segments, ensure from/to ranges don't overlap

### Pointer not moving

- Verify pointer_enabled is true
- Check value is within min/max range
- Ensure entity state is numeric

### Animation issues

- Reduce animation_duration for fast-changing values
- Try different easing functions
- Disable animations if updates are very frequent

## Future Enhancements

Potential features for future versions:

- Zone indicators (warning/danger zones)
- Dual needles for comparison
- Historical value indicators
- Custom SVG pointer shapes
- More gauge styles (analog, vintage, futuristic)

## Contributing

Have ideas for new gauge styles or features? Check out the `MODULE_DEVELOPMENT_GUIDELINES.md` for information on contributing to Ultra Card modules.

## Support

For issues, questions, or feature requests, please visit:

- GitHub: https://github.com/WJDDesigns/Ultra-Card
- Community Forum: [Link to forum]

---

**Created by WJD Designs** | Version 1.0.0
