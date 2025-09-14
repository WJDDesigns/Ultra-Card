# Bar Module

Progress bars for displaying sensor values with animations, gradients, and side labels.

## Features

- **Multiple data sources** - Entity values, attributes, calculated differences, or templates
- **Visual styles** - Flat, glossy, embossed, glass, metallic, neon, and more
- **Animations** - Charging stripes, pulse, glow, rainbow, heartbeat effects
- **Gradient support** - Color gradients with customizable stops
- **Side labels** - Left and right labels with template support

## Configuration

### Data Source

- **Entity (0-100)** - Direct percentage from sensor
- **Entity Attribute** - Use specific attribute value
- **Difference** - Calculate percentage from current/total entities
- **Template** - Custom Jinja2 template for percentage calculation

### Appearance

- **Bar Style** - Choose from multiple visual styles
- **Height** - Adjust bar thickness
- **Width** - Set bar width as percentage
- **Border Radius** - Rounded corners
- **Alignment** - Left, center, or right alignment

### Colors & Gradients

- **Bar Color** - Solid color or gradient
- **Background Color** - Bar background
- **Gradient Mode** - Full, cropped, or value-based gradients
- **Custom Color Stops** - Define gradient colors and positions

### Labels

- **Left Side** - Title and value with template support
- **Right Side** - Additional info with template support
- **Percentage Text** - Show percentage directly on bar

### Animations

- **Animation Types** - Charging, pulse, glow, rainbow, bubbles, and more
- **Triggers** - Animate based on entity state or attribute
- **Override Conditions** - Different animation when conditions are met

## Examples

### Battery Level

Show battery percentage with charging animation when plugged in.

### Fuel Level

Display fuel percentage with low-fuel warning color gradient.

### Download Progress

Progress bar with speed and time remaining labels on sides.
