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
- Return a plain string for simple text, or a JSON object to also drive
  styling and the icon dynamically

Supported JSON output keys for the Text module:

| Key                          | Type   | Description                                  |
| ---------------------------- | ------ | -------------------------------------------- |
| `content`                    | string | Text body to display                         |
| `color`                      | string | Text color (any valid CSS color)             |
| `icon`                       | string | Icon name (e.g. `mdi:fire`) — overrides the configured icon |
| `icon_color`                 | string | Icon color (any valid CSS color)             |
| `container_background_color` | string | Module container background color            |

### Icon Options

- Add optional icon before or after text
- Choose from thousands of Material Design icons
- Customize icon color and size
- Drive the icon and its color dynamically via template mode (see above)

## Examples

### Static Text

Simple heading or label text.

### Dynamic Temperature

`{{ states('sensor.temperature') }}°F` - Shows current temperature

### Conditional Greeting

`{% if now().hour < 12 %}Good Morning{% else %}Good Evening{% endif %}` - Time-based greeting

### Dynamic Icon and Icon Color

```jinja
{% set t = states('sensor.temperature') | float(0) %}
{
  "content": "{{ t }}°",
  "color": "{% if t > 30 %}#FF4444{% else %}var(--primary-text-color){% endif %}",
  "icon": "{% if t > 30 %}mdi:fire{% elif t < 10 %}mdi:snowflake{% else %}mdi:thermometer{% endif %}",
  "icon_color": "{% if t > 30 %}#FF4444{% elif t < 10 %}#2196F3{% else %}var(--primary-color){% endif %}"
}
```
