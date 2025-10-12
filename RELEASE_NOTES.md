# Release Notes

## Version 2.0-beta14

### 🐛 Bug Fixes

- **Fixed issue with 3rd party cards being squished** - 3rd party cards now render properly without layout constraints

### 🚀 New Features

- **Added new transparency slider in color picker** - Color pickers now include a transparency/alpha slider for full RGBA control
- **Added auto for bulbs that support both RGBWW/RGBCCT** - Automatic detection and support for dual white temperature bulbs

## Version 2.0-beta9

### 🐛 Bug Fixes

- **Fixed Background Filter Blurring Content** - Background filters now only blur the background layer, keeping icons and text sharp and readable
- **Fixed Animated Clock Module Smart Sizing** - Animated Clock module now properly responds to Smart Scaling feature
- **Reduced Console Logging** - Removed excess debug logging for cleaner console output

## Version 2.0-beta8

### 🔐 Critical Authentication Fixes

- **Fixed users being logged out after page refresh** - Resolved critical bug where valid authentication sessions were incorrectly treated as expired, causing users to be logged out on every page refresh
- **Improved token validation logic** - Separated actual token expiry checks from proactive refresh checks, ensuring users stay logged in with valid tokens
- **Added retry mechanism for token refresh** - Implemented exponential backoff (3 retries) for token refresh failures to handle temporary network issues gracefully
- **Fixed race conditions** - Replaced static flags with instance-level authentication tracking to prevent conflicts when multiple editor instances are created/destroyed
- **Enhanced error handling** - Network errors during token refresh no longer log users out; the system now distinguishes between connection issues and invalid credentials
- **Reduced console logging** - Minimized verbose success messages, keeping only essential errors and warnings for cleaner console output

### 🛡️ Security & Reliability

- Token refresh now retries up to 3 times with exponential backoff before failing
- Users remain logged in during temporary network issues as long as token is still valid
- Invalid refresh tokens (4xx errors) immediately logout, while server errors (5xx) trigger retries
- Each editor instance manages authentication independently to prevent conflicts
- Session persistence is now bulletproof and reliable

### 📝 Technical Details

For developers: See `ULTRA_PRO_AUTH_FIXES.md` for detailed technical documentation including:

- Token validation improvements
- Retry logic implementation
- Session restoration flow
- Testing scenarios

## Version 2.0-beta4

### 🚀 New Features

- **Ultra Card Pro Integration** - Added comprehensive Pro tier system with enhanced features and cloud sync capabilities. Register at [ultracard.io](https://ultracard.io) to unlock Pro features.
- **New PRO Modules (Requires Pro Account)**:
  - **Animated Clock** - Beautiful flip clock with smooth animations and customizable styles
  - **Animated Weather** - Current weather display with animated weather icons
  - **Animated Forecast** - Multi-day weather forecast with animated icons and detailed information
- **Pro Tab in Editor** - New dedicated Pro tab showing account status, cloud sync features, auto-snapshot status, and backup management
- **Smart Scaling (Experimental)** - New responsive scaling feature that intelligently adapts card content to fit tighter columns or edit panels. The card automatically scales down when space is limited (edit mode, narrow columns) while maintaining readability and layout. Can be enabled/disabled in card settings under Behavior section.
- **Auto Dashboard Snapshots (Pro)** - Automatic daily snapshots of all Ultra Cards across your entire dashboard with 30-day retention
- **Manual Card Backups (Pro)** - Create named backups of individual cards with up to 30 backups total
- **Smart Replace Restore** - Enhanced snapshot restore that matches cards by custom name or position for accurate recovery

### 🐛 Bug Fixes & Improvements

- **Fixed inactive icon picker visual bug** - Resolved display issues with the inactive icon picker component
- **Fixed intensity gauge display issue** - Corrected rendering problems with the intensity gauge module
- **Fixed background filters not affecting images** - CSS filters now properly apply to background images
- **Fixed custom background option for cards** - Implemented ability to set custom backgrounds at the card level
- **Fixed intensity gauge formatting and resizing** - Improved layout and sizing behavior of intensity gauge module
- **Improved template fields with CodeMirror** - Enhanced template input fields with better code editing experience and syntax highlighting
- **Improved template function and console logging** - Enhanced template evaluation system with better error logging and debugging
- **Fixed clock module styling** - Enhanced clock module with additional styling options and improved appearance
- **Enhanced snapshot Smart Replace feature** - Smart Replace now works with both custom and auto-generated card names, matching by name for custom cards and by position for auto-generated cards
- **Fixed Vaadin component deprecation warnings** - Addressed deprecation warnings and CORS-related issues

### 🎨 UI/UX Improvements

- Improved camera module responsiveness and display options
- Enhanced slider module autoplay timing and interaction
- Better mobile menu visibility and overflow handling
- Professional Pro/Free tier banners and visual indicators
- Modernized Pro tab interface matching Home Assistant design patterns

## Version 2.0-beta3

### 🐛 Bug Fixes & Improvements

- **Improved pinch to zoom** - Enhanced touch gesture handling for better zoom functionality on mobile devices
- **Remove gap field limits for vertical layout module** - Removed restrictive limits on gap field values for more flexible vertical layouts
- **Fix mobile overflow menu visibility** - Resolved issues with overflow menus not displaying properly on mobile devices
- **Add card shadow options in settings** - New shadow customization options available in card settings
- **Fix dropdown module display issue** - Resolved display problems with dropdown modules
- **Fix slider autoplay timing** - Corrected timing issues with slider autoplay functionality

## Version 2.0-beta2

### 🐛 Bug Fixes

- **Fixed CORS issues with presets** - Resolved cross-origin resource sharing problems affecting preset loading and marketplace functionality

## Version 2.0-beta1

### 🚀 New Features

- **New Slider Module** - Interactive slider control for numeric inputs and adjustable values
- **Enhanced Camera Module** - Added audio toggle control for camera feeds with audio support
- **Forecast Controls for Graphs Module** - New forecast display options and controls for weather and prediction graphs
- **Vertical and Horizontal Info Controls** - New layout options for info module items with flexible orientation

### 🎨 UI/UX Improvements

- **Improved Live Preview** - Enhanced real-time preview functionality with better responsiveness and accuracy
- **Ultra Card Pro Integration** - Added dedicated Pro tab for Ultra Card Pro features and settings

### 🐛 Bug Fixes

- **Fixed gauge styling issues** - Resolved visual inconsistencies and display problems with gauge modules
- **Fixed gauge padding** - Corrected padding and spacing issues affecting gauge module layouts

## Version 1.2.0-beta16

### 🚀 New Features

- **Added Spinbox Module** - New module type for numeric input with increment/decrement controls
- **Added pinning to live preview window** - Pin the preview window to keep it visible while editing other modules. Click the pin icon in the preview window header to toggle pinning.
- **Enhanced Dropdown Module** - Improved functionality and user experience for dropdown selections
- **Added new Gauge Module (work in progress)** - New module type for displaying gauge-style data visualizations

### 🔧 Miscellaneous

- **Various improvements** - Additional enhancements and refinements

## Version 1.2.0-beta15

### 🎨 UI/UX Improvements

- **Fixed responsiveness issues** - Improved card layout and display across different screen sizes and devices
- **Enhanced display when using built in home assistant resizing settings** - Better integration with Home Assistant's native resizing controls
- **Fixed icon spacing between devices** - Corrected spacing issues that affected icon alignment and visual consistency

### 🐛 Bug Fixes

- **Possible fix for clipping issues** - Addressed various clipping problems that affected module display and interaction

### 🚀 New Features

- **Automatic action linking** - When adding icon module or info module item will automatically link to more info inside the action tab
- **Dropdown Module Entity Source Support** - Dropdown module now supports `select` and `input_select` entities as a data source. Choose between:
  - **Manual Mode**: Define custom options with individual actions, icons, and colors (existing functionality)
  - **Entity Source Mode**: Automatically populate options from a `select` or `input_select` entity. The dropdown displays the entity's current state and updates the entity when an option is selected. Options are automatically synced with entity changes for fully reactive behavior.
- **Entity image support** - Added entity image support inside icon and info modules for richer visual displays

### 🔧 Miscellaneous

- **Various improvements** - More stuff that I likely forgot about...

## Version 1.2.0-beta14

### 🎨 UI/UX Improvements

- **Updated presets UI** - Enhanced preset interface for better user experience
- **Fixed responsive module box issue** - Resolved layout problems with module containers on different screen sizes
- **Fixed icon module entity field issue** - Corrected entity field handling in icon module configuration

## Version 1.2.0-beta13

### 🐛 Bug Fixes

- **Fixed icon inactive/active fields** - Resolved issues with icon module inactive/active field handling and display
- **Fixed hover animations dropdown freeze** - Eliminated dropdown freezing issues in hover animation controls that prevented proper selection
- **Fixed Module popup clipping** - Resolved popup clipping issues that prevented proper module editing and configuration
- **Enhanced fix for CORS issues for presets** - Improved CORS handling for better preset functionality and loading

## Version 1.2.0-beta11

### 🚀 New Features

- **Added haptic feedback option in card settings** - Global toggle for tactile feedback on all interactions
- **Added pinch to zoom to camera module** - Enhanced camera viewing with zoom and pan controls
- **Added exported code privacy protection** - Automatically removes sensitive data from exported configurations

## Version 1.2.0-beta9

### 🚀 New Features

#### 📹 Camera Module Fullscreen Toggle

- **Enhanced Camera Experience**: Camera modules now include a fullscreen toggle button for immersive viewing
- **One-Click Fullscreen**: Easily expand camera feeds to fullscreen mode with a single click
- **Improved User Interface**: Seamless integration with existing camera module controls
- **Better Mobile Experience**: Optimized fullscreen viewing for mobile devices and tablets

### 🎨 Design & Layout Improvements

#### 🏠 Default Home Assistant Styling

- **Native HA Integration**: New cards now inherit default background and border styles from Home Assistant theme
- **Consistent Look & Feel**: Cards automatically match your Home Assistant dashboard styling
- **Enhanced Border Control**: Added comprehensive border customization options for fine-tuning appearance
- **Theme Compatibility**: Seamless integration with both light and dark Home Assistant themes

### 🐛 Bug Fixes

#### 🔧 Dialog Box Z-Index Issues

- **Fixed Row Header Dialogs**: Resolved z-index conflicts where overflow row header dialog boxes appeared underneath column content
- **Improved Layer Management**: Enhanced stacking order for all dialog boxes and modal overlays
- **Better User Experience**: Dialog boxes now consistently appear above all other content as expected
- **Cross-Browser Compatibility**: Fixed rendering issues across different browsers and devices

_Includes all improvements from v1.2.0-beta8 below._

## Version 1.2.0-beta8

### 🚀 Major New Features

#### 📤 Export & Paste Icons in Row Headers

- **Export Row Configuration**: New export icon in row headers allows you to copy the complete configuration of any row (including all modules and settings) to your clipboard as JSON
- **Paste Row Configuration**: New paste icon enables you to quickly duplicate rows or import row configurations from other cards
- **Row Management Icons**: Row headers now feature a complete set of management tools:
  - **🗂️ Collapse/Expand**: Toggle row visibility in the editor (leftmost icon)
  - **📤 Export**: Copy row configuration to clipboard (JSON format)
  - **📋 Paste**: Import row configuration from clipboard
  - **🗑️ Delete**: Remove the row and all its contents
  - **⚙️ Settings**: Access row-specific configuration options

#### 🌐 Integrated Online Preset Marketplace

- **Browse Presets Online**: Access a curated marketplace of community-created card presets directly from the editor
- **One-Click Installation**: Install presets instantly without manual JSON copying
- **Category Filtering**: Browse presets by category (Dashboards, Vehicles, Weather, etc.)
- **Preview Before Install**: See preset screenshots and descriptions before applying
- **Community Contributions**: Submit your own presets to share with the community
- **Auto-Updates**: Marketplace content updates automatically with new community submissions

#### ⭐ Favorites System

- **Mark Favorite Presets**: Star your most-used presets for quick access
- **Favorites Tab**: Dedicated section for your starred presets in the marketplace
- **Quick Access**: Favorite presets appear at the top of relevant categories
- **Persistent Storage**: Your favorites are saved locally and sync across browser sessions
- **Smart Recommendations**: System learns from your favorites to suggest similar presets

#### 📹 Camera Module Fullscreen Support

- **Fullscreen Toggle**: New fullscreen button in camera modules for immersive viewing
- **Touch/Click to Expand**: Tap any camera feed to enter fullscreen mode
- **Gesture Support**: Pinch to zoom, swipe to exit on touch devices
- **Keyboard Navigation**: ESC key to exit, arrow keys for multi-camera navigation
- **Maintains Aspect Ratio**: Fullscreen mode respects original camera proportions
- **Works with Live Feeds**: Full support for both static images and live camera streams

### 🎨 Design & Layout Improvements

#### 🔧 Global Design Formatting Fixes

- **Text Module Font Sizing**: Fixed inconsistent text size applications in text modules
- **Proper CSS Inheritance**: Text size settings now properly cascade through nested elements
- **Responsive Text Scaling**: Text modules now scale appropriately on different screen sizes
- **Font Weight Consistency**: Fixed bold/normal weight rendering across all text elements
- **Line Height Optimization**: Improved line spacing for better text readability
- **Color Inheritance**: Fixed text color inheritance issues in nested layouts

#### 📐 Module Nesting Support (1 Layer)

- **Layout Module Nesting**: Layout modules (Row, Column, Horizontal) can now contain other layout modules
- **Single-Level Deep**: Supports one level of nesting (e.g., Row → Column → Modules)
- **Flexible Arrangements**: Create complex layouts like rows within columns or columns within rows
- **Visual Hierarchy**: Nested layouts maintain proper spacing and alignment
- **Editor Support**: Full drag-and-drop support for creating and managing nested layouts
- **Performance Optimized**: Nesting doesn't impact rendering performance

### 🛠️ Technical Improvements

- **Enhanced Error Handling**: Better error messages and recovery for marketplace operations
- **Improved Memory Management**: Optimized preset loading and caching system
- **Faster Rendering**: Performance optimizations for complex nested layouts
- **Better Mobile Support**: Enhanced touch interactions for fullscreen camera mode
- **Accessibility Improvements**: Better keyboard navigation and screen reader support

### 🐛 Bug Fixes

- Fixed Global Design text size not applying correctly to text modules
- Resolved layout calculation issues with nested modules
- Fixed camera module aspect ratio preservation in fullscreen
- Corrected row export/import handling of complex module configurations
- Fixed marketplace connection issues on slower networks
- Resolved favorites synchronization across browser tabs

_Includes all improvements from v1.2.0-beta7 below._

## Version 1.2.0-beta7

### 🧹 Production Polish

- **Removed Debug Logging**: Cleaned up all debug console.log statements from the spacing improvements for a professional, noise-free experience
- **Optimized Performance**: Eliminated console overhead for better runtime performance
- **Clean Console**: No more debug messages cluttering the browser console while maintaining full functionality

_Includes all improvements from v1.2.0-beta6 below._

## Version 1.2.0-beta6

### 🎛️ Major Global Design Spacing Improvements

We've completely overhauled the spacing controls in the Global Design tab to fix several critical issues and improve the user experience:

#### 🚫 Fixed Auto-Fill Behavior

- **No More Unwanted Auto-Fill**: When unlocked, typing in one margin/padding field no longer automatically fills all other fields
- **Individual Field Control**: Each spacing field now operates independently by default
- **Precise Control**: You can now set different values for top, right, bottom, and left margins/padding without interference

#### 🔒 Enhanced Lock Functionality

- **Perfect Value Mirroring**: When locked, the top field value (including units) is now correctly mirrored to all other fields in real-time
- **Unit Preservation**: Typing "10px" in a locked top field now correctly copies "10px" to all sides (not just "10")
- **Smart Lock Behavior**: Lock only affects the intended spacing type (margin lock doesn't affect padding and vice versa)

#### 📝 Improved Input Handling

- **Full Unit Support**: All CSS units now work properly - px, rem, em, %, vh, vw, etc.
- **No More Input Blocking**: Fixed issue where certain characters couldn't be typed in spacing fields
- **Preserved Formatting**: Values you type are preserved exactly as entered (no more automatic conversion or stripping)

#### 🔧 Technical Fixes

- **Removed Hardcoded Padding**: Eliminated fixed 4px padding from info module entities - users now have complete control via Global Design
- **Fixed Value Processing**: Removed `parseFloat()` calls that were stripping units from spacing values
- **Resolved Template Conflicts**: Fixed reactive update conflicts that were overriding user input
- **Better State Management**: Enhanced lock state initialization and management to prevent edge cases

#### 💡 How It Works Now

- **Unlocked Mode (Default)**: Each margin/padding field works independently - perfect for asymmetric spacing
- **Locked Mode**: Click the lock icon to enable synchronized editing - typing in the top field mirrors to all sides
- **Global Design Integration**: All spacing values now properly apply to module rendering with correct units

These improvements make the Global Design spacing controls much more intuitive and reliable across all modules.

## Version 1.2.0-beta5

### 🖼️ Image Module Improvements

- **Unlimited Image Heights**: Removed the 800px height restriction on image modules
  - Users can now set images to any height they need (previously limited to 800px max)
  - Removed both UI form constraints and validation limits
  - Only maintains sensible minimum of 1px to prevent invalid configurations
  - Perfect for large banners, full-height images, or any custom sizing needs

## Version 1.2.0-beta4

### 📱 Camera Module Responsive Improvements

We've made the camera module much more responsive and container-friendly:

- **Responsive by Default**: Camera modules now use 100% width by default instead of fixed pixel sizes
- **Stays Within Containers**: No more cameras overflowing their card boundaries
- **Smart Sizing**: Automatically adapts to different screen sizes and layouts
- **Global Design Integration**: Full compatibility with the Design tab for custom dimensions
- **Maintains All Features**: Cropping, aspect ratios, and all existing functionality still work perfectly

**💡 How It Works**: The camera module now respects its container size while giving you complete control through the Global Design tab. The pixel dimension controls in the General tab are now fallbacks for specific use cases.

## Version 1.2.0-beta3

### 🎯 Enhanced Module Spacing & Defaults

We've implemented consistent, professional spacing defaults across all modules to improve the overall visual experience:

- **Standard 8px top/bottom margins** applied to all modules for proper web design spacing
- **Improved visual hierarchy** and readability throughout the card
- **Better mobile and responsive layout** behavior across all devices
- **Consistent spacing** between modules regardless of type

**💡 Important**: You have **complete control** over these defaults! Use the **Global Design Tab** to:

- Override margins and padding for any individual module
- Set custom spacing values per module or globally
- **Remove default spacing entirely** if you prefer custom layouts
- Apply your own spacing preferences to match your dashboard design

### 🔧 Bar Module Improvements

- **Fixed Left/Right Side Labels**: Cleaned up the display when title fields are empty
  - **Removed orphaned colons** (":") that appeared when no title was specified
  - Now displays clean "Value" instead of awkward ": Value"
  - **Improved spacing** between title and value elements for better readability
  - Only shows the colon separator when there's actually a title present

### 🛠️ Technical Improvements

- Enhanced conditional rendering logic for bar module labels
- Better default spacing system implementation across all module types
- Improved CSS organization for consistent spacing behavior
- More robust template handling for cleaner UI displays

## Version 1.2.0-beta1

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

## Version 1.1.0-beta3 (Separator Module Enhancements)

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

## Version 1.1.0-beta1 (New Minimal Bar Style & Improvements)

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

## Version 2.0-beta1 (TypeScript Rewrite)

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
