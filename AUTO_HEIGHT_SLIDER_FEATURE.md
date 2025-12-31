# Auto-Height Slider Feature

## Overview

The Auto-Height Slider feature allows slider modules to dynamically adjust their height based on the content of each page. This solves the issue where sliders with mixed content heights (e.g., thermostats vs. cameras) would either have too much empty space or cut off content.

## What Changed

### New Property: `auto_height`

- **Type**: `boolean`
- **Default**: `true` (enabled by default)
- **Location**: Slider module configuration

When `auto_height` is `true`:
- Slider container uses `height: auto` with `min-height: 100px`
- Overflow is set to `visible`
- Each slide's height is determined by its content
- Smooth height transitions occur when switching between slides

When `auto_height` is `false`:
- Slider uses fixed height specified by `slider_height`
- Behavior is identical to previous versions

## Configuration Examples

### Example 1: Auto-Height Enabled (Default)

```yaml
type: custom:ultra-card
layout:
  rows:
    - id: row1
      columns:
        - id: col1
          modules:
            - id: slider1
              type: slider
              # auto_height: true  # This is the default, no need to specify
              modules:
                - id: page1
                  type: horizontal
                  modules:
                    # Compact content (e.g., thermostats)
                - id: pagebreak1
                  type: pagebreak
                - id: page2
                  type: horizontal
                  modules:
                    # Larger content (e.g., camera feeds)
```

Result: The slider will be ~180px for the thermostat page and ~400px for the camera page.

### Example 2: Fixed Height (Legacy Behavior)

```yaml
- id: slider1
  type: slider
  auto_height: false
  slider_height: 300
  modules:
    # Content here
```

Result: Slider maintains a fixed 300px height regardless of content.

### Example 3: Mixed Content Slider

```yaml
type: custom:ultra-card
layout:
  rows:
    - id: main-row
      columns:
        - id: main-col
          modules:
            - id: dashboard-slider
              type: slider
              auto_height: true  # Explicitly enabled
              show_pagination: true
              pagination_style: numbers
              transition_effect: slide-left
              transition_speed: 300
              modules:
                # Page 1: Gauge row (compact)
                - id: gauges
                  type: horizontal
                  alignment: center
                  modules:
                    - id: gauge1
                      type: gauge
                      entity: sensor.battery_soc
                      gauge_size: 120
                    - id: gauge2
                      type: gauge
                      entity: sensor.solar_power
                      gauge_size: 120
                
                - id: break1
                  type: pagebreak
                
                # Page 2: Thermostat icons (medium height)
                - id: thermostats
                  type: horizontal
                  wrap: true
                  modules:
                    - type: icon
                      # ... 7 thermostat icons
                
                - id: break2
                  type: pagebreak
                
                # Page 3: Camera feeds (tall)
                - id: cameras
                  type: horizontal
                  modules:
                    - type: external_card
                      card_type: webrtc-camera
                      # ... camera config
```

## UI Changes

### Editor Interface

In the Slider module's **General** tab, you'll now see:

1. **Auto Height** toggle (enabled by default)
   - When ON: Height field is hidden, slider adapts to content
   - When OFF: Height field appears for fixed height input

2. **Slider Height** field (only visible when Auto Height is OFF)
   - Range: 50-1000 pixels
   - Default: 300 pixels

## Technical Details

### CSS Behavior

#### Auto-Height Mode (`auto_height: true`)
```css
.slider-container {
  height: auto;
  min-height: 100px;
  overflow: visible;
}

.slider-wrapper {
  height: auto;
  transition: height 300ms ease-in-out;
}

.slider-slide {
  /* No fixed height - content determines size */
}
```

#### Fixed Height Mode (`auto_height: false`)
```css
.slider-container {
  height: 300px; /* Or specified slider_height */
  overflow: hidden;
}

.slider-wrapper {
  height: 100%;
}

.slider-slide {
  height: 100%;
}
```

### Transition Effects

All transition effects work with auto-height:
- ✅ **Slide effects** (left, right, top, bottom) - Work perfectly
- ⚠️ **Absolute effects** (fade, zoom, circle) - Work but may have minor layout shifts

### Backward Compatibility

- **Existing configurations** (where `auto_height` is undefined) continue to work with fixed height behavior
- **New sliders** default to auto-height mode
- No breaking changes to existing YAML configurations

## Benefits

1. **No more height conflicts** - Mixed content heights work seamlessly
2. **Better UX** - No empty space or cut-off content
3. **Cleaner editor** - Height field only appears when needed
4. **Smooth transitions** - Height changes animate naturally
5. **Flexible** - Works with all module types

## Testing Checklist

✅ Create new slider → Auto-height enabled by default  
✅ Toggle auto-height ON → Height field disappears  
✅ Toggle auto-height OFF → Height field appears  
✅ Mix short and tall content → Heights adjust per page  
✅ Navigate between pages → Smooth height transitions  
✅ Existing sliders → Continue working with fixed height  
✅ Build successful → No TypeScript errors  

## Version

Implemented in: **Ultra Card v2.1.0-beta8**

---

## For the Original User Issue

The user had:
- **Slider 1** (Thermostats): `slider_height: 180`
- **Slider 2** (Cameras): `slider_height: 400`

The issue was that they were in the same column and affecting each other's heights.

### Solution Options

#### Option A: Use Auto-Height (Recommended)
Remove explicit height settings and let the slider adapt:

```yaml
- id: slider-thermostats
  type: slider
  # auto_height: true (default - no need to specify)
  # slider_height: 180 (remove this)
  modules:
    # ... thermostat content
```

#### Option B: Keep them in separate rows (as you've already done)
Your current solution of separate rows works too! Auto-height just makes it even better.

#### Option C: Use fixed height with overflow
```yaml
auto_height: false
slider_height: 400
```

This forces both to the same height, but may leave empty space.

