# Camera Module

Display live camera feeds with controls and customization options.

## Features

- **Live camera streams** - Real-time video feeds
- **Still image mode** - Static snapshots with auto-refresh
- **Crop controls** - Focus on specific areas of camera view
- **Aspect ratio linking** - Maintain proportions or set independently
- **Name overlay** - Camera name display with positioning options
- **Template support** - Dynamic camera selection based on conditions

## Configuration

### Camera Configuration

- **Camera Entity** - Select camera or mjpeg entity
- **Camera Name** - Custom name (leave empty for entity name)
- **Show Camera Name** - Display name overlay on feed

### Display Settings

- **Live View** - Enable live stream (requires stream integration)
- **Auto Refresh** - Automatically refresh still images
- **Refresh Interval** - How often to refresh (in seconds)

### Dimensions

- **Width** - Camera display width (100-1000px)
- **Height** - Camera display height (100-1000px)
- **Link Aspect Ratio** - Maintain proportions when resizing
- **Aspect Ratio** - Current width:height ratio

### Name Position

- **Top Left** - Name in upper left corner
- **Top Right** - Name in upper right corner
- **Center** - Name in center of image
- **Bottom Left** - Name in lower left corner
- **Bottom Right** - Name in lower right corner

### Crop & Position

- **Left Crop** - Crop from left edge (percentage)
- **Right Crop** - Crop from right edge (percentage)
- **Top Crop** - Crop from top edge (percentage)
- **Bottom Crop** - Crop from bottom edge (percentage)

### Template Mode

- **Template Mode** - Dynamic camera entity selection
- **Camera Template** - Jinja2 template for camera entity
- **Examples:**
  - Show outdoor camera when sunny: `{% if states('weather.home') == 'sunny' %}camera.outdoor{% else %}camera.indoor{% endif %}`
  - Switch cameras with input boolean: `{% if is_state('input_boolean.front_camera', 'on') %}camera.front{% else %}camera.back{% endif %}`

## Examples

### Security Camera

Display front door camera with live view and name overlay.

### Weather-Based Camera

Show outdoor camera during day, indoor camera at night.

### Multi-Camera Selector

Use input select to choose which camera to display.
