# Text Module

The Text module allows you to display custom text content with full typography controls and template support.

## Features

- **Custom text content** - Static text or dynamic content
- **Template support** - Use Jinja2 templates for dynamic text
- **Typography controls** - Font size, weight, color, alignment
- **Icon support** - Optional icon before or after text
- **Conditional display** - Show/hide based on conditions

## Configuration

### Basic Text

- Set custom text content
- Choose font size and color
- Align text left, center, or right

### Template Mode

- Enable template mode for dynamic content
- Use Jinja2 syntax: `{{ states('sensor.temperature') }}°F`
- Access entity states, attributes, and functions

### Icon Options

- Add optional icon before or after text
- Choose from thousands of Material Design icons
- Customize icon color and size

## Examples

### Static Text

Simple heading or label text.

### Dynamic Temperature

`{{ states('sensor.temperature') }}°F` - Shows current temperature

### Conditional Greeting

`{% if now().hour < 12 %}Good Morning{% else %}Good Evening{% endif %}` - Time-based greeting
