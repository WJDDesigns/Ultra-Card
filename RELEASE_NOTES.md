# Release Notes

## Version 1.2.0-Beta3

### New Features

- **🎯 Enhanced Module Spacing & Defaults**: All modules now have consistent, professional spacing defaults
  - Standard 8px top/bottom margins for proper web design spacing
  - Improved visual hierarchy and readability
  - Better mobile and responsive layout behavior

### Improvements

- **🎛️ Full Spacing Control**: Users have complete control over module spacing via the Global Design Tab
  - Override default margins and padding for any module
  - Set custom spacing values per module or globally
  - Remove default spacing entirely if desired for custom layouts

- **✨ Cleaner Bar Module Labels**: Fixed left/right side label display
  - Removed orphaned colons (":") when title fields are empty
  - Now shows clean "Value" instead of ": Value" when no title is specified
  - Improved spacing between title and value elements

### Technical Improvements

- Enhanced conditional rendering for bar module labels
- Better default spacing system across all module types
- Improved CSS organization for consistent spacing behavior

## Version 1.2.0-Beta1

### New Features

- **New Dropdown Module**: Interactive dropdown selector with Home Assistant actions
  - Support for More Info, Toggle, Navigate, URL, Perform Action, and Assist actions
  - Entity picker integration for More Info and Toggle actions
  - "Keep Selection State" option for scene selectors
  - Icon support with custom colors or entity state colors
  - Drag & drop option reordering
  - Full Global Design Tab compatibility

### Improvements

- Enhanced action system integration
- Improved editor event handling
- Better z-index management for dropdown layering

## Version 1.1.0-Beta3 (Separator Module Enhancements)

### New Features

- **🔄 Vertical Separator Support**: Separator modules now support both horizontal and vertical orientations
  - New "Orientation" toggle in separator configuration
  - Horizontal separators: Use percentage-based width (10-100%)
  - Vertical separators: Use pixel-based height (50-1000px) for better control
  - Proper centering and alignment for both orientations
  - All separator styles work in both orientations (line, double line, dotted, shadow, blank space)

### Bug Fixes

- **Fixed separator visibility**: Improved default colors and thickness for better visibility
- **Fixed vertical separator centering**: Vertical separators now properly center horizontally
- **Fixed height limitations**: Vertical separators can now be up to 1000px tall
- **Fixed container dimensions**: Better minimum dimensions ensure separators are always visible

### Technical Improvements

- Added `height_px` property to SeparatorModule interface for vertical separator sizing
- Enhanced validation for both horizontal and vertical separator constraints
- Improved CSS styling for vertical separator layouts
- Better default values and ranges for separator controls

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
