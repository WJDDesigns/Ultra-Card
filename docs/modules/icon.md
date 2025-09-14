# Icon Module

Interactive status icons with animations, state-based styling, and tap actions.

## Features

- **State-based display** - Different icons for active/inactive states
- **Animations** - Pulse, spin, bounce, shake, fade, and more
- **Custom styling** - Colors, sizes, backgrounds for each state
- **Tap actions** - Toggle, more-info, navigate, call-service
- **Template support** - Advanced template mode for complex logic

## Configuration

### Entity Configuration

- **Entity** - Select the entity this icon represents
- **Active/Inactive States** - Define what values are considered active/inactive
- **Custom Names** - Override entity names for each state

### Icon Settings

- **Active Icon** - Icon to show when entity is active
- **Inactive Icon** - Icon to show when entity is inactive
- **Colors** - Custom colors for each state
- **Sizes** - Different sizes for active/inactive states

### Animations

- **Active Animation** - Animation when icon is active (pulse, spin, bounce, etc.)
- **Inactive Animation** - Animation when icon is inactive
- **Background Shapes** - Circle, square, or no background

### Template Mode

- **Advanced templates** - Use Jinja2 for complex icon logic
- **Visibility control** - Show/hide icons based on template results
- **Dynamic content** - Custom state text based on conditions

## Examples

### Light Control

Toggle light with different icons for on/off states and pulse animation when on.

### Battery Status

Show battery icon with color changes based on level and charging animation.

### Security System

Display security status with different icons and animations for armed/disarmed states.
