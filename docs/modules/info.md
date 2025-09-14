# Info Module

Display entity information with customizable formatting, icons, and template support.

## Features

- **Entity display** - Show entity state, name, and units
- **Icon support** - Optional icons with color and size controls
- **Template formatting** - Use Jinja2 templates for custom value formatting
- **Layout controls** - Icon position and content alignment
- **Size customization** - Individual sizing for icon, name, and value text

## Configuration

### Entity Settings

- **Entity** - Select entity to display
- **Show Name** - Display entity name above value
- **Custom Name** - Override entity name with custom text
- **Show State** - Display entity state/value
- **Show Units** - Display unit of measurement

### Icon Settings

- **Show Icon** - Enable/disable icon display
- **Icon** - Choose icon to display
- **Icon Color** - Custom icon color
- **Icon Size** - Icon size in pixels
- **Icon Position** - Before or after content
- **Icon Gap** - Space between icon and content

### Template Mode

- **Template Mode** - Enable template formatting
- **Value Template** - Jinja2 template for formatting entity value
- **Examples**:
  - `{{ states('sensor.temperature') | round(1) }}°F`
  - `{{ states('sensor.humidity') }}% humidity`

### Layout & Positioning

- **Overall Alignment** - Left, center, right alignment
- **Icon Alignment** - Icon positioning
- **Content Alignment** - Text content alignment

### Size Settings

- **Icon Size** - Icon dimensions in pixels
- **Name Size** - Entity name text size
- **Value Size** - Entity value text size

## Examples

### Temperature Display

Show temperature sensor with thermometer icon and custom formatting.

### Humidity Monitor

Display humidity percentage with water drop icon.

### Custom Formatted Sensor

Use templates to format sensor values with custom units and rounding.
