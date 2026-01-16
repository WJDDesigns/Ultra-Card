# Media Player Module

Full-featured media player controls with multiple layout modes, album art, progress bar, and comprehensive playback controls.

## Features

- **Multiple layouts** - Compact bar, full card, or ultra-compact mini mode
- **Album art** - Displays album artwork with configurable border radius
- **Track info** - Shows current track title and artist
- **Progress bar** - Interactive seek bar with time display
- **Playback controls** - Play, pause, stop, skip previous/next
- **Volume control** - Slider with mute toggle
- **Shuffle & repeat** - Toggle buttons with state indication
- **Source selection** - Change input sources (speakers, devices)
- **Dynamic colors** - Optional color extraction from album art
- **Blurred background** - Customizable blur and opacity from album art
- **Animated visuals** - 10 different visualizer types that animate with the music

## Layout Modes

### Compact

Horizontal bar layout ideal for dashboards:
- Album art thumbnail on the left
- Track title and artist in the center
- Play/pause button and expand toggle on the right
- Thin progress bar at the bottom
- Expandable to reveal full controls

### Card

Full card layout with all controls visible:
- Large album art at the top
- Track info centered below
- Progress bar with time labels
- Full control button row (shuffle, skip, play/pause, repeat)
- Volume slider
- Source selector dropdown

### Mini

Ultra-compact single line for sidebars:
- Small icon/thumbnail
- Now playing text (truncated)
- Play/pause button

## Configuration

### Entity Configuration

- **Media Player Entity** - Select a media_player entity (required)
- **Custom Name** - Override the entity name (optional)

### Display Options

| Option | Description | Default |
|--------|-------------|---------|
| Show Album Art | Display album artwork or fallback icon | On |
| Show Track Info | Display track title and artist | On |
| Show Album Name | Display album name (Spotify, Plex, etc.) | On |
| Show Progress Bar | Display playback progress | On |
| Show Duration | Display current time / total duration | On |
| Show Controls | Display play/pause and skip controls | On |
| Show Volume | Display volume slider and mute button | On |
| Show Stop Button | Display stop button with play/pause | Off |
| Show Source Selector | Display source/speaker selection | Off |
| Show Shuffle Button | Display shuffle toggle | Off |
| Show Repeat Button | Display repeat mode button | Off |
| Show Sound Mode | Display sound mode selector | Off |

### Behavior Options

| Option | Description | Default |
|--------|-------------|---------|
| Enable Seek | Allow clicking progress bar to seek | On |
| Auto-Hide When Off | Hide module when media player is off/idle | Off |
| Expandable | Allow expanding compact layout for more controls | On |

### Visual Options

| Option | Description | Default |
|--------|-------------|---------|
| Blurred Background | Use album art as a blurred, darkened background | On |
| ↳ Blur Amount | Amount of blur effect (5-60px) | 10px |
| ↳ Blur Opacity | Opacity of blurred background (10-80%) | 40% |
| ↳ Expand Past Card | Allow blur to extend beyond card edges for dramatic effect | On |
| Dynamic Colors | Extract accent colors from album art for controls and visualizer | Off |
| Animated Visuals | Show animated visualizer behind album art when playing | Off |
| ↳ Visualizer Type | Choose from 10 different visualizer styles | Rings |

Note: The media player container has a default opacity of 0.9 for better visual integration.

### Visualizer Types

When Animated Visuals is enabled, choose from these visualizer styles. All visualizers span the full card width:

| Type | Description |
|------|-------------|
| **Rings** | Pulsing concentric circles centered in the card |
| **Bars** | Vertical bars that bounce across the full width |
| **Wave** | Flowing horizontal lines that animate |
| **Dots** | Bouncing dots across the full width with glow effect |
| **Spectrum** | Radial bars arranged in a circle |
| **Pulse** | Breathing glow with expanding ripple rings |
| **Orbit** | Multiple orbital rings with glowing dots |
| **Spiral** | Rotating spiral arms at different speeds |
| **Equalizer** | Full-width EQ bars from edge to edge |
| **Particles** | Rising particles across the entire background |

All visualizers automatically use dynamic colors when that option is enabled.

### Color Customization

When dynamic colors is disabled, you can customize:

- **Progress Bar Color** - Color of the progress fill
- **Progress Background** - Background of the progress bar
- **Button Color** - Default button color
- **Active Button Color** - Color for active buttons (shuffle, repeat)

### Icon Customization

Customize all control icons:

- Fallback icon (when no album art)
- Play/Pause icons
- Previous/Next icons
- Volume icons (muted, low, medium, high)

## Supported Media Players

Works with any Home Assistant media_player entity:

- **Streaming Services** - Spotify, Apple Music, YouTube Music
- **Media Servers** - Plex, Jellyfin, Emby
- **Speakers** - Sonos, Google Home, Amazon Echo
- **TV/Video** - Chromecast, Apple TV, Roku
- **Local Media** - VLC, MPD, Music Assistant

### Spotify-Specific Features

When connected to a Spotify entity, the module includes:

- **Album Name Display** - Shows the album name from Spotify metadata
- **Spotify-Branded Source Selector** - Green Spotify icon for device selection
- **Full Playback Controls** - Play, pause, skip, shuffle, repeat all work
- **Device Selection** - Switch between all available Spotify Connect devices
- **Progress Bar with Seek** - Interactive seek bar with real-time position updates
- **Volume Control** - Adjust volume (note: mute is not supported by Spotify)

Note: Stop button is not shown for Spotify as it doesn't support the stop action (use pause instead).

## Examples

### Living Room Speaker

Compact layout for a Sonos speaker with volume and source selection:

- Layout: Compact
- Show Volume: On
- Show Source: On
- Expandable: On

### Now Playing Dashboard

Full card layout for a music dashboard:

- Layout: Card
- Show Shuffle: On
- Show Repeat: On
- Animated Visuals: On
- Card Size: 280px

### Sidebar Mini Player

Ultra-compact mini layout for sidebar:

- Layout: Mini
- Show Album Art: On
- Show Controls: On

## Tips

1. **Compact is Best for Most Uses** - The expandable compact layout provides quick access while saving space.

2. **Enable Only What You Need** - Disable unused controls to keep the interface clean.

3. **Dynamic Colors** - This feature is experimental and may not work with all album art sources.

4. **Feature Support** - Some controls (shuffle, repeat, seek) only appear if the media player supports them.

5. **Auto-Hide** - Use auto-hide when off to save space when nothing is playing.

## Actions

The module supports tap, hold, and double-tap actions on the container:

- **Default action** - More Info dialog (shows full media player details)
- All standard Ultra Card actions available (navigate, URL, service calls, etc.)

Note: Control buttons (play, pause, volume, etc.) handle their own actions and don't trigger container actions.
