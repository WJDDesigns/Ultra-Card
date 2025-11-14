# 🎉 Ultra Card 2.0 - The Ultimate Home Assistant Card Experience

## Version 2.1.0-beta18

### 🐛 Bug Fixes

- **Possible fix for nowrap in modules** - Fixed potential issues with nowrap functionality in modules

---

## Version 2.1.0-beta17

### 🚀 Improvements

- **Improved word wrap and added separate reset values to text items in design tab** - Enhanced word wrap functionality and added individual reset controls for text items in the design tab

---

## Version 2.1.0-beta16

### 🚀 Improvements

- **Improved template mode input box recognition** - Enhanced template mode input box recognition for better user experience
- **Built a hut out of popscicle sticks** - Added popscicle stick hut functionality

---

## Version 2.1.0-beta15

### 🚀 Improvements

- **Added color templating and value templating to Gauge Module** - Gauge Module now supports dynamic color and value templating for enhanced customization

### 🐛 Bug Fixes

- **Fixed issue where icon templates were conflicting with animations** - Resolved conflicts between icon templates and animation systems

---

## Version 2.1.0-beta14

### 🚀 Improvements

- **Added new Climate Module for pro members** - New Climate Module added for Ultra Card Pro members
- **Added white space to design tab** - White space controls added to design tab (works with some modules)
- **Adjusted z-index and spacing** - Improved z-index handling and spacing adjustments across modules
- **Improved template mode in some modules** - Enhanced template mode functionality in various modules
- **Added background templating to icon and info module** - Background templating support added to icon and info modules

---

## Version 2.1.0-beta13

### 🚀 Improvements

- **Improved css handling of bar modules and separator modules to allow for space constraints** - Enhanced CSS handling for bar and separator modules to better accommodate space constraints

---

## Version 2.1.0-beta12

### 🐛 Bug Fixes

- **Fixed separator css to make sure it creates space in different alignment settings** - Resolved separator spacing issues across various alignment configurations

---

## Version 2.1.0-beta11

### 🚀 Improvements

- **Improved CSS standardized CSS** - Enhanced and standardized CSS across the card
- **Added Template mode to Graphs Module** - Template mode support added to the Graphs module
- **Spinbox Module** - New Spinbox module added
- **Camera Module** - New Camera module added

---

## Version 2.1.0-beta10

### 🚀 Improvements

- **Improved CSS for nested layouts** - Enhanced CSS handling for nested layout structures
- **Added alignments to column** - New alignment options for column modules

---

## Version 2.1.0-beta9

### 🐛 Bug Fixes

- **Improved and fixed nested layout css** - Enhanced CSS handling for nested layouts
- **Fixed slider update issues** - Resolved problems with slider module updates
- **Fixed issues with light module color settings** - Corrected color setting functionality in the light module

---

## Version 2.1.0-beta8

### 🚀 Major Improvements

- **Improved Slider Module based on swiper** - Enhanced slider module with better performance and features using Swiper library (Note: vertical slider is still not complete)
- **Removed Smart Scaling** - Removed smart scaling feature as it wasn't working as expected

### 🐛 Bug Fixes

- **Fixed input limitation on light module in xy and hs** - Resolved input constraints in light module for XY and HS color modes
- **Fixed odd card panel heights in different viewport sizing** - Corrected card panel height issues across various viewport sizes
- **Fixed color pick and button style issues** - Resolved color picker and button styling problems
- **Improved module config error handling** - Enhanced error handling for module configuration issues
- **Updated alignment options in info module** - Improved alignment options available in the info module

---

## Version 2.1.0-beta7

### 🐛 Bug Fixes

- **Fixed dropdown module issues in slider** - Resolved issues with dropdown module functionality when used within slider modules
- **Fixed light module issues** - Corrected various problems affecting the light module functionality
- **Improved light module navigation** - Enhanced navigation and user experience within the light module

---

## Version 2.1.0-beta6

### 🐛 Critical Migration Fixes

- **Fixed Migration Quote Bug** - Migration now properly wraps template code in quotes for valid JSON
- **Fixed Migration Whitespace** - Normalized whitespace to prevent parsing errors from newlines and tabs
- **Cleaner Migration Output** - Single-line JSON format for better readability and reliability

### 📋 What Was Fixed

The "Migrate to Unified Template" button now generates properly formatted JSON:

**Before (Broken)**:

- icon_color property was missing quotes around template code
- Multi-line format with excessive whitespace
- Result: Invalid JSON that wouldn't parse

**After (Fixed)**:

- Template code properly wrapped in quotes for valid JSON
- Clean single-line format
- Result: Valid JSON that parses correctly

Thanks LightningManGTS and Konijntje for reporting!

---

## Version 2.1.0-beta5

### 🚀 Major Features

- **Unified Template System** - Revolutionary new template system that replaces multiple template boxes with one powerful unified template
  - Control multiple properties from a single template (icon, color, name, state text, and their colors)
  - Uses entity context variables (state, entity, attributes, name) for seamless entity remapping
  - Returns JSON objects for multi-property control or simple strings for single properties
  - Fully implemented in 5 core modules: Icon, Info, Text, Bar, and Markdown
  - Basic structure added to Graphs, Spinbox, and Camera modules
  - See UNIFIED_TEMPLATES.md for complete documentation and examples

### 🐛 Bug Fixes

- **Fixed Template Object Parsing** - Fixed critical bug where Home Assistant returned templates as objects instead of strings
- **Fixed Template Boolean Parsing** - Templates are no longer incorrectly interpreted as boolean values
- **Removed Debug Logging** - Cleaned up console output for production use

### 📋 Module Support

**Fully Supported (6 Properties)**:

- Icon Module: icon, icon_color, name, name_color, state_text, state_color
- Info Module: icon, icon_color, name, name_color, state_text, state_color

**Fully Supported (Content + Color)**:

- Text Module: content, color
- Bar Module: value, color
- Markdown Module: content, color

**Basic Structure Added**:

- Graphs Module (fields added, rendering TBD)
- Spinbox Module (fields added, rendering TBD)
- Camera Module (fields added, rendering TBD)

---

## Version 2.1.0-beta4

### 🧪 Experimental Features

- **New Template System for Testing** - Experimental template evaluation system for advanced testing and validation

---

## Version 2.1.0-beta3

### 🐛 Bug Fixes & Improvements

- **Improved Nested Layout Logic** - Enhanced nested layout system with automatic scaling and better layout handling for complex card structures
- **Fixed Dropdown Clipping** - Resolved issue where dropdowns in slider modules were being clipped by container boundaries
- **Fixed Slider Auto Play** - Corrected auto play functionality in slider modules to work reliably

---

## Version 2.0.0

Ultra Card 2.0 represents a complete transformation of the Home Assistant card experience, featuring a complete TypeScript rewrite, revolutionary new modules, and professional-grade features that set the new standard for dashboard customization.

## 🌟 General Improvements

### ⚡ Performance & Reliability

- **Complete TypeScript Rewrite** - Improved reliability, type safety, and maintainability
- **Smart Versioning System** - Version numbers embedded in filenames for better cache management
- **Optimized Rendering** - Enhanced update mechanism for 3rd party cards matching native Home Assistant behavior
- **Memory Management** - Optimized preset loading and caching system
- **Clean Console Output** - Removed debug logging for professional, noise-free experience

### 🎨 Global Design System

- **Professional Spacing Defaults** - Consistent 8px margins across all modules
- **Global Design Controls** - Complete control over margins, padding, and spacing
- **Responsive Text Scaling** - Text modules scale appropriately on different screen sizes
- **Font Weight Consistency** - Proper bold/normal weight rendering across all elements
- **Transparency Slider** - Color pickers include transparency/alpha slider for full RGBA control
- **Card Shadow Options** - Customizable shadow options in card settings
- **Border Customization** - Comprehensive border customization options
- **Theme Compatibility** - Seamless integration with both light and dark Home Assistant themes

### 📱 Mobile & Responsive Design

- **Responsive by Default** - All modules use responsive design principles
- **Touch Gesture Support** - Enhanced pinch to zoom and swipe gestures
- **Mobile Menu Visibility** - Improved overflow menu handling on mobile devices
- **Container-Friendly Design** - Modules stay within their containers across all screen sizes

### 🎯 Smart Features

- **Haptic Feedback** - Global tactile feedback option for all interactions
- **Auto Action Linking** - Automatic action linking for icon and info modules
- **Entity Image Support** - Rich visual displays with entity image integration

### 🎨 Design & Layout Enhancements

- **Export & Paste Row Functionality** - Copy complete row configurations and import from clipboard
- **Collapsible Rows** - Better editor organization with expandable/collapsible rows
- **Row Naming & Headers** - Enhanced row headers with improved naming and layout options
- **Module Nesting Support** - Layout modules can contain other layout modules (1 level deep)

### 🔗 Action System Enhancements

- **Toggle Entity Field** - New entity field for toggle actions providing better control
- **Enhanced Action System** - Improved integration with Home Assistant's native action system
- **Entity Source Support** - Dropdown module supports select and input_select entities
- **Smart Action Linking** - Automatic action linking for new modules

## 🆓 Free Features

### 🎛️ New Free Modules

- **Interactive Slider Module** - Numeric input controls with smooth animations and customizable styling
- **Smart Spinbox Module** - Increment/decrement controls for precise numeric adjustments
- **Dynamic Dropdown Module** - Interactive selectors with Home Assistant actions and entity source support
- **Professional Gauge Module** - Beautiful gauge-style data visualizations with customizable ranges
- **Enhanced Separator Module** - Both horizontal and vertical orientations with multiple styling options

### 🎥 Camera Module Revolution

- **Fullscreen Toggle** - Immersive camera viewing with one-click fullscreen mode
- **Pinch to Zoom** - Enhanced touch gesture handling for better zoom functionality
- **Audio Toggle Control** - Camera feeds with audio support and controls
- **Responsive Design** - Automatically adapts to different screen sizes and layouts

### 📊 Bar Module Enhancements

- **Minimal Bar Style** - Sleek minimal progress bar with thin line and dot indicator
- **Dynamic Line Thickness** - Controlled by bar height setting with proportional dot scaling
- **Full Gradient Support** - Complete gradient mode support (Full, Cropped, Value-Based)

### 💡 Light Module Improvements

- **On/Off Toggle** - Convenient toggle control for quick on/off switching
- **Auto Bulb Detection** - Automatic detection for bulbs supporting both RGBWW/RGBCCT
- **Enhanced Color Control** - Better color picker integration and control

### 📝 Text & Content Modules

- **CodeMirror Editor** - Modern markdown module with syntax highlighting and better editing experience
- **Template Support** - Enhanced template input fields with better code editing
- **YAML Support** - Improved YAML configuration and editing capabilities

## 💎 Pro Features

### 🎬 Video Background Module

- **Professional Video Backgrounds** - Add stunning video backgrounds to any card for enhanced visual appeal
- **Glass Blur Effects** - Advanced glass styling with adjustable blur intensity for perfect translucent appearances
- **Seamless Integration** - Works with all card layouts and responsive designs

### 🎨 Pro Animation Modules

- **Animated Clock** - Beautiful flip clock with smooth animations and customizable styles
- **Animated Weather** - Current weather display with animated weather icons
- **Animated Forecast** - Multi-day weather forecast with animated icons and detailed information

### ☁️ Cloud Integration & Sync

- **Ultra Card Pro Cloud Integration** - Seamless cloud sync capabilities with HACS integration
- **Auto Dashboard Snapshots** - Automatic daily snapshots of all Ultra Cards with 30-day retention
- **Manual Card Backups** - Create named backups of individual cards with up to 30 backups total
- **Smart Replace Restore** - Enhanced snapshot restore that matches cards by custom name or position

### 🎴 3rd Party Card Integration

- **Native Card Support** - Integrate ANY Home Assistant custom card directly into Ultra Card layouts
- **Click-to-Add Interface** - Simply click any card to add it to your layout
- **Native Configuration** - Configure cards using their own native editors
- **Live Preview** - See exactly how cards will look before adding them
- **Smart Caching** - No flashing or reloading with intelligent card element caching

### 📊 Pro Bar Module Features

- **Glass Blur Slider** - Enhanced glass effect customization with adjustable blur intensity

## 🛍️ Misc Features

### 🌐 Preset Marketplace

- **Integrated Marketplace** - Browse curated community-created card presets directly from the editor
- **One-Click Installation** - Install presets instantly without manual JSON copying
- **Category Filtering** - Browse by category (Dashboards, Vehicles, Weather, etc.)
- **Preview Before Install** - See preset screenshots and descriptions before applying

### ⭐ Favorites System

- **Mark Favorite Presets** - Star your most-used presets for quick access
- **Favorites Tab** - Dedicated section for your starred presets
- **Smart Recommendations** - System learns from your favorites to suggest similar presets
- **Persistent Storage** - Favorites sync across browser sessions

### 🛠️ Developer Experience

- **Enhanced Error Handling** - Better error messages and recovery for marketplace operations
- **Improved Mobile Support** - Enhanced touch interactions and responsive design
- **Accessibility Improvements** - Better keyboard navigation and screen reader support

## 📋 Complete Module Reference

### 🆓 Free Modules

**🏠 Icon Module**

- Display entity states with customizable icons, colors, and labels
- Support for active/inactive states with different icons and colors
- Template-based dynamic icon and color selection
- Hover animations and click actions

**📊 Bar Module**

- Visual progress bars for numeric entity values
- Multiple styles: Standard, Minimal (thin line with dot), Glass
- Gradient support with Full, Cropped, and Value-Based modes
- Customizable colors, animations, and sizing

**📝 Text Module**

- Display custom text content with rich formatting
- Template support for dynamic content
- Multiple text sizes and styling options
- Perfect for labels, descriptions, and custom information

**ℹ️ Info Module**

- Display entity information in organized rows
- Support for multiple info items per module
- Template-based dynamic content
- Customizable labels, values, and formatting

**📷 Camera Module**

- Display camera feeds with fullscreen support
- Pinch to zoom and pan controls
- Audio toggle for cameras with audio support
- Responsive design that adapts to container sizes

**🎛️ Slider Module**

- Interactive slider controls for numeric inputs
- Smooth animations and customizable styling
- Perfect for dimmers, volume controls, and adjustable values
- Auto-play functionality with customizable timing

**🔢 Spinbox Module**

- Numeric input with increment/decrement controls
- Precise value adjustment for any numeric entity
- Customizable step values and ranges
- Ideal for temperature controls and precise adjustments

**📋 Dropdown Module**

- Interactive dropdown selectors with custom options
- Support for Home Assistant actions (More Info, Toggle, Navigate, etc.)
- Entity source mode for select and input_select entities
- Drag & drop option reordering

**📊 Gauge Module**

- Beautiful gauge-style data visualizations
- Customizable ranges, colors, and needle styles
- Perfect for temperature, pressure, and percentage displays
- Smooth animations and responsive design

**📏 Separator Module**

- Horizontal and vertical separators for layout organization
- Multiple styles: line, double line, dotted, shadow, blank space
- Customizable colors, thickness, and positioning
- Perfect for visual organization and section breaks

**🖼️ Image Module**

- Display images with unlimited height support
- Customizable aspect ratios and cropping
- Support for local and remote images
- Responsive design with container adaptation

**📈 Graph Module**

- Display entity history graphs and statistics
- Forecast controls for weather and prediction data
- Customizable time ranges and data points
- Integration with Home Assistant's history system

**🎯 Light Module**

- Specialized light controls with on/off toggle
- Auto-detection for RGBWW/RGBCCT bulbs
- Enhanced color picker integration
- Smart default actions for lighting control

### 💎 Pro Modules

**🎬 Video Background Module**

- Add stunning video backgrounds to any card
- Professional video integration with responsive design
- Glass blur effects with adjustable intensity
- Perfect for creating immersive dashboard experiences

**🕐 Animated Clock Module**

- Beautiful flip clock with smooth animations
- Multiple clock styles and customization options
- Real-time updates with smooth transitions
- Perfect for dashboard centerpieces and time displays

**🌤️ Animated Weather Module**

- Current weather display with animated weather icons
- Dynamic weather representations
- Smooth animations that respond to weather changes
- Professional weather visualization

**📅 Animated Forecast Module**

- Multi-day weather forecast with animated icons
- Detailed weather information and predictions
- Smooth transitions between forecast periods
- Comprehensive weather data visualization

**🎨 Layout Modules**

- **Row Module**: Horizontal layout container for organizing modules
- **Column Module**: Vertical layout container for stacked modules
- **Horizontal Module**: Specialized horizontal arrangement
- **Grid Module**: Grid-based layout system
- **Slider Module**: Carousel-style module container

### 🔧 System Modules

**🎴 3rd Party Card Module**

- Integrate ANY Home Assistant custom card
- Native configuration using each card's own editor
- Live preview and smart caching
- Seamless integration with Ultra Card layouts

**⚙️ Action System**

- Comprehensive action support for all modules
- More Info, Toggle, Navigate, URL, Perform Action, Assist
- Entity picker integration
- Smart default actions for new modules

## 🎉 What's New in 2.0

Ultra Card 2.0 represents the culmination of months of development, user feedback, and innovation. This release transforms the Home Assistant dashboard experience with:

- **Complete TypeScript Foundation** for reliability and performance
- **Revolutionary Module System** with 15+ new module types
- **Professional Pro Features** for power users and organizations
- **3rd Party Card Integration** breaking down barriers between card ecosystems
- **Advanced Design System** with professional spacing and responsive controls
- **Preset Marketplace** for community-driven card sharing
- **Smart Features** that adapt to your workflow and preferences

## 🚀 Getting Started

Ultra Card 2.0 is available now with both free and Pro tiers. Pro users get access to advanced modules, cloud sync, 3rd party card integration, and priority support.

**Upgrade to Ultra Card Pro**: [ultracard.io](https://ultracard.io)

---

_Ultra Card 2.0 - Redefining what's possible with Home Assistant dashboards._
