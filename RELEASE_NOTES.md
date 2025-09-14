# Release Notes

## Version 1.1.0-Beta1 (New Minimal Bar Style & Improvements)

### New Features

- **🎨 New "Minimal" Bar Style**: Added a sleek minimal progress bar style featuring a thin line with a dot indicator

  - Dynamic line thickness controlled by bar height setting
  - Proportional dot scaling that maintains visual balance
  - Full gradient mode support (Full, Cropped, Value-Based)
  - Custom dot color picker for complete customization
  - Smooth animations including pulse, glow, blink, shimmer, and more
  - Smart container height adjustment to prevent dot cutoff at low heights

- **🔧 Bar Module Improvements**:
  - Fixed bar width control in General tab - now works alongside Global Design Tab
  - Improved UI organization - Bar Style selection now appears above Fill Direction
  - Enhanced gradient rendering for all gradient modes with proper color interpolation
  - Better animation support across all bar styles

### Bug Fixes

- **Fixed bar width slider**: General tab width control now properly affects bar width instead of being overridden by flex properties
- **Fixed Bar Style dropdown**: Converted from FormUtils to direct ha-form implementation for better reliability
- **Fixed gradient color resolution**: Improved CSS variable handling and color interpolation for gradients
- **Fixed minimal style container height**: Automatically adjusts container height to accommodate dot size at low bar heights
- **Fixed dot scaling**: Implemented reasonable size limits to prevent oversized dots at high bar heights

### Technical Improvements

- Enhanced gradient calculation logic with proper CSS variable resolution
- Improved color interpolation for smooth gradient transitions
- Better responsive design for minimal bar style
- Optimized rendering performance for all bar styles
- Added comprehensive animation support for minimal style elements

## Version 2.0-Beta1 (TypeScript Rewrite)

### Major Changes

- **Complete TypeScript Rewrite**: The entire codebase has been rewritten in TypeScript for improved reliability, type safety, and maintainability.
- **New Versioning System**: Added a smart versioning system that embeds the version number in filenames for better cache management.
- **Performance Improvements**: Optimized rendering and updated animations for smoother performance.

### New Features

- **Enhanced Gradient System**: More customization options for gradient bars with better previews.
- **Expanded Animation Options**: Added new animation types including bubbles, fill, and rainbow effects.
- **Section Ordering**: Ability to rearrange sections in the card via drag and drop.
- **Bar Size Options**: Choose from thin, regular, thick or "thiccc" bar sizes.
- **Advanced Icon Customization**: Added text size control and vertical alignment options.
- **Default Inactive States**: Automatically recognize common inactive states like 'off', 'unavailable', 'idle', etc. without requiring manual configuration.
- **Improved Responsive Design**: Better support for various screen sizes and mobile devices.

### Bug Fixes

- Fixed inconsistent gradient rendering in some browsers
- Improved animation performance on lower-end devices
- Fixed text overflow issues in icon labels

### Upgrading from Version 1.x

Users upgrading from version 1.x should note that this is a major update with significant changes to the underlying codebase. While we've maintained backward compatibility with your existing configurations, we recommend:

1. Backing up your configuration before upgrading
2. Testing the new version in a development environment first
3. Checking the console for any warnings or errors after upgrading

Please report any issues on GitHub or in our Discord community.

## Previous Versions

For information about previous releases, please visit our [GitHub releases page](https://github.com/WJDDesigns/Ultra-Card/releases).
