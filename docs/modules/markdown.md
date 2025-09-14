# Markdown Module

Rich text content with full markdown formatting support.

## Features

- **Full markdown support** - Headers, lists, links, emphasis, code blocks
- **HTML support** - Optional HTML tags in content
- **Table support** - Markdown table syntax
- **Code highlighting** - Syntax highlighting for code blocks
- **Template integration** - Use markdown with Home Assistant templates

## Configuration

### Content

- **Markdown Content** - Enter markdown text with full formatting support

### Features

- **Enable HTML** - Allow HTML tags in markdown content
- **Enable Tables** - Support for markdown table syntax
- **Code Highlighting** - Syntax highlighting for code blocks

## Examples

### Dashboard Header

```markdown
# Welcome Home

Today is **{{ now().strftime('%A, %B %d') }}**

Current temperature: {{ states('sensor.temperature') }}°F
```

### Status List

```markdown
## System Status

- ✅ Internet: Connected
- ✅ Security: Armed
- ⚠️ Backup: {{ states('sensor.backup_status') }}
```

### Information Panel

```markdown
### Quick Info

| Sensor      | Value                                |
| ----------- | ------------------------------------ |
| Temperature | {{ states('sensor.temperature') }}°F |
| Humidity    | {{ states('sensor.humidity') }}%     |
```
