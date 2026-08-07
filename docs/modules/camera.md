# Camera Module

Display live camera feeds with controls and customization options.

## Features

- **Live camera streams** - Real-time video feeds using the same HLS/WebRTC players as Home Assistant's own picture cards
- **Still image mode** - Static snapshots with auto-refresh
- **Image fit control** - Cover, contain, or fill the frame
- **Crop controls** - Focus on specific areas of camera view
- **Aspect ratio linking** - Maintain proportions or set independently
- **Sound button** - Mute/unmute the stream without leaving the dashboard
- **Name overlay** - Camera name display with positioning options
- **Template support** - Dynamic camera selection based on conditions

## Configuration

### Camera Configuration

- **Camera Entity** - Select camera or mjpeg entity
- **Camera Name** - Custom name (leave empty for entity name)
- **Show Camera Name** - Display name overlay on feed

### Display Settings

- **Stream Mode** - How the feed is delivered:
  - **Auto (HA Default)** - Still images refreshed roughly every 10 seconds, matching Home Assistant's picture-entity behaviour. Lightest on the network.
  - **Always Live** - A continuous stream via HLS or WebRTC. Requires the `stream` integration (or a WebRTC-capable camera).
  - **Snapshot Only** - Still images refreshed on your own interval, set below.
- **Image Fit** - How the feed fills the frame:
  - **Cover** - Crops the feed so it fills the frame edge to edge (default)
  - **Contain** - Shows the whole frame, adding bars where the ratios differ
  - **Fill** - Stretches the feed to the frame
- **Enable Audio** - Starts the stream unmuted where the browser allows it. Browsers block unmuted autoplay until you interact with the page, so the stream may start muted until you press the sound button.
- **Sound Button** - Shows a mute/unmute button over the stream.
- **Player Controls** - Shows the browser's native video controls.
- **Auto Refresh** / **Refresh Interval** - Snapshot mode only: how often the still image is re-fetched (in seconds).

### Dimensions

- **Width** - Camera display width (100-1000px)
- **Height** - Camera display height (100-1000px)
- **Link Aspect Ratio** - Maintain proportions when resizing
- **Aspect Ratio** - Current width:height ratio

The module keeps the camera's own aspect ratio wherever possible, so a 16:9 feed stays 16:9 rather than being letterboxed inside a differently shaped box.

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
