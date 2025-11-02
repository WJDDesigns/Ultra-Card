# Unified Template System Guide

## Overview

The Unified Template System allows you to control multiple display properties from a single Jinja2 template using JSON responses. This replaces the need for multiple separate template boxes and enables seamless entity remapping with entity context variables.

## Key Benefits

1. **One Template Instead of Many** - Control icon, color, name, and more from one place
2. **Entity Context Variables** - Templates automatically work with any entity (no hardcoded entity IDs)
3. **Seamless Entity Remapping** - Change entity, template still works
4. **Cleaner UI** - No more cluttered template sections
5. **Backward Compatible** - Legacy templates still work

## Supported Modules

- Icon Module
- Info Module
- Text Module
- Markdown Module
- Bar Module
- Graphs Module
- Spinbox Module
- Camera Module

## Entity Context Variables

When you write a unified template, these variables are automatically available:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `entity` | Entity ID | `'sensor.temperature'` |
| `state` | Current state value | `'23.5'` |
| `name` | Custom name or friendly name | `'Living Room Temp'` |
| `attributes` | Full attribute object | `{ unit_of_measurement: '°C' }` |
| `unit` | Unit of measurement | `'°C'` |
| `domain` | Entity domain | `'sensor'` |
| `device_class` | Device class | `'temperature'` |
| `friendly_name` | HA friendly name | `'Living Room Temperature'` |
| `config` | Icon/entity configuration | `{ icon_inactive: 'mdi:thermometer' }` |
| `state_number` | State as number | `23.5` |
| `state_boolean` | State as boolean | `true` |

## Template Response Formats

### Simple String (Icon Only)

Return a simple string to update just the icon:

```jinja2
{% if state | int > 25 %}
  mdi:fire
{% else %}
  mdi:snowflake
{% endif %}
```

### JSON Object (Multiple Properties)

Return JSON to control multiple properties:

```jinja2
{% set temp = state | int %}
{
  "icon": "{% if temp > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}",
  "icon_color": "{% if temp > 25 %}#FF0000{% else %}#0000FF{% endif %}"
}
```

## Available JSON Properties

### Icon Module
- `icon` - Icon name (e.g., `"mdi:fire"`)
- `icon_color` - CSS color (e.g., `"#FF0000"`, `"red"`, `"rgb(255,0,0)"`)

### Info Module
- `icon` - Icon name
- `icon_color` - Icon color

### Text Module
- `content` - Text content
- `color` - Text color

### Bar Module
- `value` - Bar value (number or string)
- `color` - Bar color
- `label` - Bar label text

## Complete Examples

### Example 1: Battery Status (Works with ANY Battery Entity!)

```jinja2
{% set level = state | int %}
{
  "icon": "mdi:battery-{{ (level / 10) | round(0) * 10 }}",
  "icon_color": "{% if level <= 20 %}#FF0000{% elif level <= 50 %}#FF8800{% else %}#00CC00{% endif %}"
}
```

**Use this template with:**
- `sensor.phone_battery`
- `sensor.laptop_battery`  
- `sensor.watch_battery`
- ANY battery sensor!

### Example 2: Temperature with Dynamic Color

```jinja2
{% set temp = state | float %}
{
  "icon": "{% if temp > 25 %}mdi:fire{% elif temp < 15 %}mdi:snowflake{% else %}mdi:thermometer{% endif %}",
  "icon_color": "{% if temp > 30 %}#FF0000{% elif temp > 25 %}#FF6600{% elif temp < 10 %}#0066FF{% elif temp < 15 %}#4444FF{% else %}#00CC00{% endif %}"
}
```

### Example 3: Light with RGB Color

```jinja2
{
  "icon": "{% if state == 'on' %}mdi:lightbulb-on{% else %}mdi:lightbulb-off{% endif %}",
  "icon_color": "{% if state == 'on' and attributes.rgb_color %}rgb({{ attributes.rgb_color | join(',') }}){% else %}#888888{% endif %}"
}
```

### Example 4: Person Presence

```jinja2
{
  "icon": "{% if state == 'home' %}mdi:home-account{% else %}mdi:car{% endif %}",
  "icon_color": "{% if state == 'home' %}#4CAF50{% else %}#FF9800{% endif %}"
}
```

### Example 5: Weather with Attributes

```jinja2
{% set condition = state %}
{% set temp = attributes.temperature %}
{
  "icon": "mdi:weather-{{ condition }}",
  "icon_color": "{% if condition == 'sunny' %}#FFD700{% elif condition in ['rainy', 'pouring'] %}#4682B4{% elif condition == 'cloudy' %}#A9A9A9{% else %}var(--primary-color){% endif %}"
}
```

### Example 6: Using Device Class

```jinja2
{% if device_class == 'motion' %}
  {
    "icon": "{% if state == 'on' %}mdi:motion-sensor{% else %}mdi:motion-sensor-off{% endif %}",
    "icon_color": "{% if state == 'on' %}#FF0000{% else %}#888888{% endif %}"
  }
{% endif %}
```

## Active/Inactive State Control

By default, templates control **display only** (icon, color) and **NOT** the active/inactive state used for animations.

### Default Behavior (Display Only)

```yaml
entity: sensor.temperature
active_state: "hot"        # Controls when animations play
inactive_state: "cold"
unified_template: |
  { "icon": "mdi:fire", "icon_color": "red" }
```

✅ Template changes icon and color  
✅ Animations controlled by `active_state` and `inactive_state`  
✅ Clear separation of concerns

### Override State Control (Optional)

Enable "Ignore Entity State Config" toggle to let template control state logic:

```yaml
entity: sensor.temperature
ignore_entity_state_config: true  # Template controls state too
unified_template: |
  {% if state|int > 25 %}
    { "icon": "mdi:fire", "icon_color": "red" }
  {% else %}
    { "icon": "mdi:snowflake", "icon_color": "blue" }
  {% endif %}
```

⚠️ When this is enabled, `active_state` and `inactive_state` are ignored  
⚠️ Template result determines if icon is "active" or "inactive"

## Migration from Legacy Templates

### Auto-Migration

If you have existing legacy templates, Ultra Card will show a migration banner:

**Before (Multiple Template Boxes):**
```yaml
dynamic_icon_template_mode: true
dynamic_icon_template: "{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}"
dynamic_color_template_mode: true
dynamic_color_template: "{% if state|int > 25 %}red{% else %}blue{% endif %}"
```

**After (One Unified Template):**
```yaml
unified_template_mode: true
ignore_entity_state_config: false  # Preserves display-only behavior
unified_template: |
  {
    "icon": {% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %},
    "icon_color": {% if state|int > 25 %}red{% else %}blue{% endif %}
  }
```

### Migration Rules

1. **From `template_mode`** → `ignore_entity_state_config: true` (preserves state control)
2. **From `dynamic_*_template`** → `ignore_entity_state_config: false` (preserves display-only)
3. **Legacy templates still work** - Migration is optional

## Best Practices

### 1. Use Entity Context Variables

❌ **Don't hardcode:**
```jinja2
{% if states('sensor.living_room_temperature') | float > 25 %}
```

✅ **Use context:**
```jinja2
{% if state | float > 25 %}
```

### 2. Return JSON for Multiple Properties

❌ **Don't use multiple templates:**
- Dynamic Icon Template: `mdi:fire`
- Dynamic Color Template: `red`

✅ **Use one unified template:**
```jinja2
{ "icon": "mdi:fire", "icon_color": "red" }
```

### 3. Handle Edge Cases

✅ **Check for valid data:**
```jinja2
{% if state and state != 'unavailable' and state != 'unknown' %}
  {% set level = state | int %}
  { "icon": "mdi:battery-{{ level }}", "icon_color": "green" }
{% else %}
  { "icon": "mdi:battery-unknown", "icon_color": "#888888" }
{% endif %}
```

### 4. Use HA Variables

✅ **Use theme colors:**
```jinja2
{
  "icon_color": "var(--primary-color)"
}
```

### 5. Keep Templates Reusable

✅ **Generic battery template works everywhere:**
```jinja2
{% set level = state | int %}
{
  "icon": "mdi:battery-{{ (level / 10) | round(0) * 10 }}",
  "icon_color": "{% if level <= 20 %}#FF0000{% elif level <= 50 %}#FF8800{% else %}#00CC00{% endif %}"
}
```

Just change the entity - template adapts automatically!

## Troubleshooting

### Template Returns Empty

**Problem:** Template shows blank icon

**Solution:** Check your Jinja2 syntax:
```jinja2
{% if state | int > 25 %}  # ✅ Correct
{% if state > 25 %}        # ❌ Wrong (state is string)
```

### JSON Parse Error

**Problem:** "Invalid JSON" error

**Solution:** Ensure proper JSON syntax:
```jinja2
# ❌ Wrong - missing quotes
{ icon: mdi:fire }

# ✅ Correct - quoted property names and values  
{ "icon": "mdi:fire" }
```

### Entity Context Not Working

**Problem:** `state` variable shows as undefined

**Solution:** Entity must exist in Home Assistant:
```jinja2
# Check entity exists first
{% if entity and state %}
  ...
{% endif %}
```

### Animation Not Working

**Problem:** Icon doesn't animate even though template shows fire icon

**Solution:** Check "Ignore Entity State Config" setting:
- If unchecked: Set `active_state` properly
- If checked: Template must return boolean-like value when state control is needed

## Advanced Patterns

### Conditional Icon Sets

```jinja2
{% if domain == 'light' %}
  {
    "icon": "{% if state == 'on' %}mdi:lightbulb-on{% else %}mdi:lightbulb-off{% endif %}",
    "icon_color": "{% if state == 'on' and attributes.rgb_color %}rgb({{ attributes.rgb_color | join(',') }}){% else %}#888888{% endif %}"
  }
{% elif domain == 'switch' %}
  {
    "icon": "{% if state == 'on' %}mdi:toggle-switch{% else %}mdi:toggle-switch-off{% endif %}",
    "icon_color": "{% if state == 'on' %}#4CAF50{% else %}#888888{% endif %}"
  }
{% endif %}
```

### Multi-Condition Logic

```jinja2
{% set battery = state | int %}
{% set charging = attributes.is_charging %}
{
  "icon": "{% if charging %}mdi:battery-charging-{{ (battery / 10) | round(0) * 10 }}{% else %}mdi:battery-{{ (battery / 10) | round(0) * 10 }}{% endif %}",
  "icon_color": "{% if charging %}#00CC00{% elif battery <= 20 %}#FF0000{% elif battery <= 50 %}#FF8800{% else %}#00CC00{% endif %}"
}
```

### Time-Based Context

```jinja2
{% set hour = now().hour %}
{
  "icon": "mdi:{% if hour < 6 %}weather-night{% elif hour < 12 %}weather-sunny{% elif hour < 18 %}weather-sunset{% else %}weather-night{% endif %}",
  "icon_color": "{% if hour < 6 %}#4444AA{% elif hour < 12 %}#FFD700{% elif hour < 18 %}#FF8C00{% else %}#4444AA{% endif %}"
}
```

## Community Presets

### Preset: Generic Battery Monitor
```jinja2
{% set level = state | int %}
{
  "icon": "mdi:battery-{{ (level / 10) | round(0) * 10 }}",
  "icon_color": "{% if level <= 10 %}#FF0000{% elif level <= 20 %}#FF4400{% elif level <= 30 %}#FF8800{% elif level <= 50 %}#FFCC00{% elif level <= 70 %}#CCFF00{% elif level <= 90 %}#88FF00{% else %}#00CC00{% endif %}"
}
```

### Preset: Generic Temperature Sensor
```jinja2
{% set temp = state | float %}
{
  "icon": "{% if temp > 30 %}mdi:fire{% elif temp > 25 %}mdi:thermometer-high{% elif temp > 15 %}mdi:thermometer{% elif temp > 10 %}mdi:thermometer-low{% else %}mdi:snowflake{% endif %}",
  "icon_color": "{% if temp > 30 %}#FF0000{% elif temp > 25 %}#FF6600{% elif temp < 10 %}#0066FF{% elif temp < 15 %}#4444FF{% else %}#00CC00{% endif %}"
}
```

### Preset: Generic Light Control
```jinja2
{
  "icon": "{% if state == 'on' %}mdi:lightbulb-on{% else %}mdi:lightbulb-off{% endif %}",
  "icon_color": "{% if state == 'on' %}{% if attributes.rgb_color %}rgb({{ attributes.rgb_color | join(',') }}){% else %}#FFD700{% endif %}{% else %}#888888{% endif %}"
}
```

### Preset: Generic Motion Sensor
```jinja2
{
  "icon": "{% if state == 'on' %}mdi:motion-sensor{% else %}mdi:motion-sensor-off{% endif %}",
  "icon_color": "{% if state == 'on' %}#FF4444{% else %}#888888{% endif %}"
}
```

### Preset: Generic Door/Window Sensor
```jinja2
{
  "icon": "{% if device_class == 'door' %}{% if state == 'on' %}mdi:door-open{% else %}mdi:door-closed{% endif %}{% elif device_class == 'window' %}{% if state == 'on' %}mdi:window-open{% else %}mdi:window-closed{% endif %}{% else %}{% if state == 'on' %}mdi:checkbox-marked-circle{% else %}mdi:checkbox-blank-circle-outline{% endif %}{% endif %}",
  "icon_color": "{% if state == 'on' %}#FF9800{% else %}#4CAF50{% endif %}"
}
```

## Migration Guide

### Step 1: Detect Legacy Templates

Open your icon/info module in the editor. If you see a migration banner, you have legacy templates.

### Step 2: Review Current Templates

Note what your current templates do:
- Advanced Template Mode (`template_mode`) - controls display AND state
- Dynamic Icon Template - controls icon only
- Dynamic Color Template - controls color only

### Step 3: Click "Migrate to Unified Template"

Ultra Card will automatically:
- Combine your templates into one
- Set `ignore_entity_state_config` appropriately
- Disable legacy templates
- Preserve exact behavior

### Step 4: Test Migration

1. Check preview still looks correct
2. Test animations still work as expected
3. Verify entity remapping works

### Step 5: Enhance Template (Optional)

Now that you have entity context variables, update template to use them:

**Before migration:**
```jinja2
{% if states('sensor.phone_battery') | int <= 20 %}red{% else %}green{% endif %}
```

**After migration:**
```jinja2
{% if state | int <= 20 %}red{% else %}green{% endif %}
```

Now works with ANY battery entity!

## Performance Tips

1. **Use Simple Conditions** - Avoid complex nested logic
2. **Cache Calculations** - Use `{% set %}` to store computed values
3. **Minimal JSON** - Only include properties you're changing
4. **Avoid External API Calls** - Stick to Home Assistant data

## FAQ

### Q: Can I still use legacy templates?

A: Yes! Legacy templates continue to work. Migration is optional.

### Q: What happens if I use both unified and legacy templates?

A: Unified template takes priority. Legacy templates are ignored.

### Q: Can templates control animations?

A: By default, NO. Enable "Ignore Entity State Config" to let template control active/inactive state.

### Q: Do templates work in entity remapping presets?

A: YES! That's the main benefit. Templates use context variables, so they work with any entity.

### Q: Can I return partial JSON?

A: Yes! Only include properties you want to change:
```jinja2
{ "icon_color": "red" }  # Only updates color, icon stays default
```

### Q: What if my JSON is malformed?

A: Ultra Card shows a helpful error message in the editor and falls back to default values.

### Q: Can I use Home Assistant template functions?

A: Yes! All standard Jinja2 and HA template functions work: `states()`, `state_attr()`, `now()`, `distance()`, etc.

## Support

For questions and examples, see:
- [Module Development Guidelines](MODULE_DEVELOPMENT_GUIDELINES.md)
- [GitHub Discussions](https://github.com/WJDDesigns/Ultra-Card/discussions)
- [Discord Community](https://discord.gg/ultra-card)

## Version History

- **v2.1.0** - Initial unified template system release
- Icon and Info modules supported
- Auto-migration from legacy templates
- Entity context variables

