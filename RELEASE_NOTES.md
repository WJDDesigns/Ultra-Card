# 🎉 Ultra Card - The Ultimate Home Assistant Card Experience

## Version 2.3.0-beta25

### 🐛 Bug Fixes

- **Fixed Column inheritance issues** - Improved column layout and responsive behavior
- **Fixed Overflow of children in columns** - Resolved content overflow and clipping issues
- **Fixed Theme color and opacity issues** - Enhanced color handling and customization options

---

## Version 2.3.0-beta25

### 🐛 Bug Fixes

- **Fixed issue with nested tab module inside popup module inside new builder**
- **Fixed icon module template json issue**

---

## Version 2.3.0-beta25

### 🐛 Bug Fixes

- **Fixed issue with nested tab module inside popup module inside new builder**
- **Fixed icon module template json issue**

---

## Version 2.3.0-beta22

### 🚀 New Features

- **Added viewport column breakpoint menu** - New breakpoint menu for responsive column layouts across different viewports
- **Added Pro User toggle to remove default modules on new cards** - Pro users can now disable default modules when creating new cards

### 🐛 Bug Fixes

- **Fixed double border issue with row builder** - Resolved visual border duplication in row builder
- **Fixed issues with popup module with multiple windows** - Corrected popup behavior when using multiple browser windows
- **Fixed using certain operators in active/inactive state** - Resolved issues with comparison operators in state conditions

---

## Version 2.3.0-beta20

### 🚀 New Features

- **Added new Robot Vacuum Module for Pro Users** - Control and monitor your robot vacuum with a dedicated module

### 🐛 Bug Fixes

- **Fixed Gauge offsets for values** - Corrected offset calculations for gauge value display
- **Fixed horizontal module navigation conflict with popups** - Resolved navigation conflicts when using horizontal modules with popups

### 🔧 Improvements

- **Improved variable display** - Enhanced variable display functionality across modules
- **Improved Graph Module** - Better performance and functionality for graph visualizations

---

## Version 2.3.0-beta18

### 🚀 New Features

- **Added new device breakpoints for custom designs per device layouts** - Create unique designs for different screen sizes with new responsive breakpoint system
- **Added device breakpoints in Live Preview for testing** - Test your responsive designs directly in the editor preview
- **Added Icon Size/Text size sliders for Text Module** - More granular control over text module appearance

### 🐛 Bug Fixes

- **Fixed issue with Ultra Card toggle state for tracking** - Resolved toggle state tracking issues
- **Fixed issues with gradients being saved to favorites** - Gradient colors now save correctly to favorites

### 🔧 Improvements

- **Improved popup code to fix issues** - Various popup module stability improvements

### ⚠️ Warning

Probably broke other stuff so enjoy at your own risk, I mean it...

---

## Version 2.3.0-beta17

### 🐛 Bug Fixes

- **Fixed mobile padding discrepancy** - Resolved padding inconsistencies on mobile devices
- **Fixed popup module rendering issues** - Corrected rendering problems affecting popup modules

---

## Version 2.3.0-beta15

### 🚀 Improvements

- **Improved actions service** - Enhanced actions service for better reliability and performance

### 🐛 Bug Fixes

- **Fixed preset loading issues** - Resolved issues with preset loading functionality

---

## Version 2.3.0-beta14

### 🚀 New Features

- **Added 24-hour grace period for pro user verification** - Pro users now have a 24-hour grace period during any server issues to ensure uninterrupted access
- **Added conditional logic for grid entities with override** - Grid entities now support conditional logic with override capabilities for more flexible configurations

---

## Version 2.3.0-beta13

### 🚀 Improvements

- **Tightened up the sprocket looking thing** - Visual refinements to the sprocket UI element
- **Improved logging so it doesn't take down the main site** - Optimized logging system to prevent performance issues affecting the main site

### 🐛 Bug Fixes

- **Fixed issue with global and local variables** - Resolved variable scope issues affecting both global and local variable functionality

---

## Version 2.3.0-beta12

### 🚀 Improvements

- **Improved custom variables** - Enhanced custom variables system for better performance and reliability
- **Improved presets to include ratings and multiple image previews** - Presets now feature rating system and support for multiple preview images

### 🐛 Bug Fixes

- **Fixed Pro Button border issue in add module window** - Resolved border styling issue affecting Pro button display in the add module interface

---

## Version 2.3.0-beta7

### 🐛 Bug Fixes

- **Fixed UC card being pre-selected when adding new cards** - Removed automatic backup events that were interfering with HA's card picker
- **Fixed state mode variables not updating in real-time** - State mode now outputs a Jinja expression so HA's template engine handles reactivity

---

## Version 2.3.0-beta6

### 🐛 Bug Fixes

- **Fixed UC card being pre-selected when adding new cards** - Removed automatic backup events that were interfering with HA's card picker
- **Fixed state mode variables not updating in real-time** - State mode now outputs a Jinja expression so HA's template engine handles reactivity

---

## Version 2.3.0-beta5

### 🐛 Bug Fixes

- **Fixed card-specific variables not resolving after config save** - Variables with `isGlobal: false` now work correctly even after Home Assistant serialization

---

## Version 2.3.0-beta4

### 🐛 Bug Fixes

- **Fixed local/card-specific variables not resolving in templates** - Card-specific variables now properly resolve when used in templates
- **Fixed variable save button deleting variables on mobile** - Added safety check to prevent accidental deletion when state gets out of sync

---

## Version 2.3.0-beta3

### 🚀 New Features

- **Global/Card-Specific Variable Scope** - Custom variables now support two scopes:
  - **Global**: Variables sync across all Ultra Cards on your dashboard (stored in localStorage + backup)
  - **This Card**: Variables only available in the specific card (stored in card config)
- **Variable Scope Toggle** - When adding or editing a variable, choose between Global or Card-specific scope with visual toggle buttons
- **Scope Badges** - Variables now display scope badges (Global/This Card) for easy identification

### 🐛 Bug Fixes

- **Fixed variables lost on browser cache clear** - Global variables are now automatically backed up to card config and restored when localStorage is cleared. This ensures variables survive:
  - Browser cache/data clearing
  - Switching browsers
  - Private/Incognito mode
  - Works fully offline without cloud sync

### 🎨 UI Improvements

- **Redesigned Variable Item Layout** - Cleaner preview with header containing name, scope badge, and action buttons; body showing entity, type, and resolved value
- **Redesigned Variable Edit Form** - Full-width stacked form that fits within the card, with all fields including the new scope toggle
- **Better Variable Sections** - Separate sections for Global and Card-specific variables with clear headers and delete buttons

---

## Version 2.3.0-beta2

### 🚀 New Features

- **Added new custom variables system** - Create and manage custom variables for dynamic card configuration
- **Added custom sizing for columns** - More control over column widths and layout flexibility
- **Added searching in modules/cards/presets** - Quickly find modules, cards, and presets with the new search functionality

### 🚀 Improvements

- **Added new toggle auto maker and adjusted behavior** - Enhanced toggle module with auto maker functionality and improved behavior

### 🐛 Bug Fixes

- **Fixed gauge module design issues** - Resolved design problems affecting gauge modules
- **Fixed design tab not working with gauge modules** - Design tab now properly applies to gauge modules

---

## Version 2.3.0-beta1

### 🚀 New Features

- **Added new live search for modules and cards** - A powerful live search feature that allows you to quickly find and add modules and cards in the editor. Simply start typing and the interface will filter available options in real-time for faster workflow.

---

## Version 2.2.0 🚀

Welcome to **Ultra Card 2.2.0** — our biggest update since 2.0! This release packs a whole weather system, new modules galore, typography freedom, and enough bug fixes to make your dashboard smoother than butter on a hot pan. Let's dive in!

---

### 🌦️ Dynamic Weather Module — Rain or Shine, Your Dashboard Shines!

Say hello to the **Dynamic Weather Module**, a gorgeous new way to visualize weather conditions right on your dashboard! This module brings weather to life with:

- **GPU-accelerated effects** for rain, snow, fog, and sun beams — no more micro-stutters
- **Instance-scoped rendering** — each weather module operates independently
- **Seamless integration** with your weather entities

**How to use:** Add a new module, select "Dynamic Weather", pick your weather entity, and watch the magic happen. Customize effects intensity and let your dashboard match the sky outside!

---

### 🆕 New Modules — Your Dashboard's New Best Friends

**🔘 Toggle Module**
A sleek new toggle for quick on/off controls! Perfect for lights, switches, and automations.
- Customizable styling and colors
- Match state templating for dynamic icons based on entity state
- Just add a Toggle module, select your entity, and tap away!

**📊 Status Module**
Display entity status information with enhanced visual feedback. Great for showing device states, connection status, or any entity that needs a quick visual indicator.

**🏀 Sports Score Module**
Live sports scores on your dashboard? Yes, please! 
- Display real-time game scores and information
- **New in 2.2.0:** Extended text color customization options
- Keep your eye on the game while managing your smart home

**📅 Pro Calendar Module** *(Pro Feature)*
A beautiful calendar module with customizable views and event display. 
- Drag-and-drop list for reordering items when clipped
- Height display option for compact list view
- Perfect for keeping track of your schedule at a glance

**📐 Grid Module**
Create flexible grid-based layouts with ease!
- **Image icons for entities** — use custom images instead of standard icons
- Perfect for photo galleries, device grids, or custom dashboards

**🎹 Accordion Module**
Collapsible sections for organized content!
- Comprehensive styling, colors, and behavior settings
- Keep your dashboard tidy while packing in more information

---

### 🎨 Typography & Design — Express Yourself!

**Google Fonts Integration** 
Access **30+ beautiful font families** directly from Google Fonts! No more boring Arial — pick from:
- Space Grotesk, Poppins, Montserrat, Playfair Display, and many more
- Fonts load dynamically from Google CDN when selected
- Apply different fonts across your entire card or per-module

**Enhanced Card Mod Support**
All design properties now generate CSS custom properties that you can override with card-mod:
```yaml
style: |
  :host {
    --my-row-bg-color: red;
    --my-row-text-color: white;
  }
```

---

### 🎴 Cards Tab — Native Meets 3rd Party

The **3rd Party tab** has evolved into the **Cards tab**! Now you can add:
- **Native Home Assistant cards** (button, entity, gauge, etc.)
- **3rd party custom cards** (Mushroom, Mini Graph, etc.)
- **YAML cards** — perfect for WebRTC or other YAML-based configurations

All cards live together harmoniously in one unified interface. Simply click to add!

---

### 📷 Camera Module — Hollywood Upgrade

Your camera feeds just got a serious upgrade:
- **Parity with HA** — layout and controls now mirror native Home Assistant behavior
- **Playback mode selector** — choose how your camera streams
- **Fixed audio reliability** — no more lingering audio issues
- **WebRTC compatibility** — fixed initial play issues

---

### 🪟 Popup Module — Now with Entity Triggers!

**Entity-Triggered Popups** — Automate your popup displays!

**How to use:**
1. Create a popup module with your desired content
2. In popup settings, select an entity as the trigger
3. Configure the trigger condition (state equals "on", numeric threshold, etc.)
4. The popup automatically opens when conditions are met
5. Optionally configure auto-close when conditions clear

Perfect for alerts, notifications, or context-sensitive information!

---

### 📊 Charts & Gauges — More Control, Better Visuals

**Graph Module Enhancements:**
- **Min/Max values** — set custom ranges for better data visualization
- No more auto-scaling surprises!

**Bar Module Improvements:**
- **Min/Max values** — constrain your bars to meaningful ranges
- Horizontal flip for arc and speedometer styles

**Chart Module:**
- Now displays bar count correctly
- Apex Chart display improvements

**Dropdown Module:**
- Specify visible items count
- Header customization with configurable icon and title
- Only one dropdown open at a time — no more UI conflicts

---

### 🎛️ Module Improvements — The Little Things Matter

**Icon Module:**
- Choose between **static icon** or **entity-based** icons
- Background padding slider for perfect spacing

**Info Module:**
- New **distribution options** for layout control
- Change layout direction even without an icon

**Button Module:**
- **Icon size configuration** — make those icons as big or small as you want

**Slider Module:**
- **Settable slider direction** — horizontal or vertical, your choice!
- Reduced lag in climate module sliders

**Climate Module:**
- Improved interaction handling and responsiveness
- Removed the extra "custom name" field that was causing confusion

**Spinbox Module:**
- Fixed mobile button deselection issues
- No more focus retention problems on mobile

---

### 📋 Module Management — Copy, Paste, Export, Import!

**Module Copy/Paste System**
Copy any module and paste it elsewhere — complete with all its settings!

**Card Export/Import**
Export your entire card configuration (including all settings) and import it anywhere. Share your creations with the community!

**Export Glyph Support**
Unicode characters, zero-width spaces, and special glyphs are now preserved during export operations.

---

### 🐛 Bug Fixes — Squashed 'Em All!

**Layout & Display:**
- Fixed transform origin issues causing incorrect scaling in responsive cards
- Fixed border placement and background colors based on entity state
- Fixed text color issues in text module
- Fixed background image visibility in rows/columns
- Fixed overflow behavior in layout modules
- Fixed vertical module design tab configuration
- Fixed row arrange drag and drop functionality
- Fixed nested layout rendering issues

**Module-Specific:**
- Fixed toggle module functionality and state change sensing
- Fixed info module templating issues
- Fixed popup modules nesting and z-index conflicts
- Fixed popup edit mode visibility issues
- Fixed sports score module update issues
- Fixed gauge and climate module z-index problems
- Fixed markdown module underscore rendering
- Fixed chart module bar count display

**Mobile & Touch:**
- Fixed mobile button deselection in spinbox module
- Fixed dropdown not closing when swiping on mobile
- Fixed spinbox focus retention on mobile
- Improved iPad user interface issues

**3rd Party Integration:**
- Possible fix for mushroom template issues as 3rd party module
- Fixed WebRTC camera card compatibility
- Improved 3rd party card stability

**Camera:**
- Fixed audio playback issues
- Fixed WebRTC initial play problems

**Dropdown:**
- Fixed duplicate dropdown conflicts
- Improved synchronization across editor and rendered cards

---

### 🎨 UI/UX Improvements

- Improved popup display logic and positioning
- Added overlay toggle option for popups
- Migration tool improvements
- Pro Cards naming standardization
- Calendar module height display option for compact list view
- Better nested layout rendering in builder

---

### 📝 A Note on the Background Module

The legacy all-in-one background module has been **removed** to avoid conflicts with core Home Assistant view behavior. If you were using it, you can achieve similar effects with the card's built-in background options or the Video Background module (Pro).

---

### 🙏 Special Thanks

A massive thank you to the Ultra Card Discord community! Your bug reports, feature requests, and continuous feedback made this release possible. Every crash log, every "hey this is weird" message, and every "wouldn't it be cool if..." helped shape Ultra Card 2.2.0.

You're the real MVPs! 🏆

---

### 🚀 Getting Started

Already using Ultra Card? Just update through HACS and enjoy the new features!

New to Ultra Card? Check out [ultracard.io](https://ultracard.io) to get started.

**Pro tip:** After updating, do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to ensure you're running the latest version!

---

_Ultra Card 2.2.0 — Because your smart home deserves a smarter dashboard._

---

## Version 2.2.0-beta14

### 🚀 New Features

- **Image Icons for Grid Module Entities** - Added the ability to use image icons for entities within the grid module for enhanced visual customization.
- **Accordion Module Customization** - Added comprehensive customization options to the accordion module including styling, colors, and behavior settings.
- **Entity-Triggered Popups** - Added the ability to use entities to trigger popups. To use this feature:
  1. Create a popup module with your desired content
  2. In the popup settings, select an entity as the trigger
  3. Configure the trigger condition (e.g., state equals "on", numeric threshold, etc.)
  4. The popup will automatically open when the entity meets the trigger condition
  5. You can also configure the popup to auto-close when the condition is no longer met

### 🐛 Bug Fixes

- **Fixed Sports Score Module Update Issue** - Resolved an issue where the sports score module was not properly updating when scores changed.
- **Fixed Background Image Visibility in Rows/Columns** - Corrected visibility issues with background images in row and column layouts.
- **Fixed Popup Edit Mode Issues** - Resolved visibility and interaction problems with popups when in edit mode, ensuring proper display and functionality.

---

## Version 2.2.0-beta10

### 🚀 New Features

- **Added bar module min/max values**
- **Added the ability to change layout direction in info module without icon**

### 🚀 Improvements

- **Improved nested layout rendering issues in builder**

### 🐛 Bug Fixes

- **Fixed WebRTC card initial play issue**
- **Fixed toggle functionality and sensing state changes from other modules**

---

## Version 2.2.0-beta8

### 🔧 Maintenance

- **Bumped for new version issues** - Version number correction and release asset fixes.

---

## Version 2.0.0-beta7

### 🚀 New Features

- **New Pro Calendar Module** - Added a new calendar module for Ultra Card Pro members, providing integrated calendar functionality with customizable views and event display options.

### 🐛 Bug Fixes

- **Fixed Toggle Module Functionality Issue** - Resolved an issue where the toggle module was not properly responding to user interactions or updating entity states correctly.
- **Fixed Info Module Templating Issue** - Corrected template evaluation problems in the info module that were causing incorrect or missing dynamic content display.
- **Fixed Popup Modules Nesting Issue** - Resolved layout conflicts when popup modules were nested within other modules, ensuring proper rendering and z-index handling.
- **Possible Fix for WebRTC Camera Card** - Potential fix for compatibility issues when using WebRTC camera cards as 3rd party card integrations within Ultra Card layouts.

---

## Version 2.2.0-beta5

### 🚀 New Features

- **Added support for native home assistant cards** - Native Home Assistant cards can now be integrated directly into Ultra Card layouts alongside 3rd party cards.
- **New toggle module** - Added a new toggle module for quick on/off controls with customizable styling.
- **New status module** - Added a new status module for displaying entity status information with enhanced visual feedback.

### 🚀 Improvements

- **Changed 3rd party tab to cards tab and merged native with 3rd party** - The 3rd party tab has been renamed to "Cards" tab and now includes both native Home Assistant cards and 3rd party cards in a unified interface.
- **Improved 3rd party card stability** - Enhanced stability and reliability for 3rd party card integration with better error handling and caching.
- **Improved popup display logic** - Enhanced popup rendering and positioning logic for better user experience across all modules.
- **Improved iPad user interface issues** - Fixed various UI issues specific to iPad devices including touch interactions and layout rendering.
- **Added min and max values in graphs** - Graph modules now support configurable min and max value ranges for better data visualization control.
- **Added settable slider direction for slider module** - Slider module now supports configurable direction (horizontal/vertical) for flexible layout options.

### 🐛 Bug Fixes

- **Fixed border placement in modules as well as background color based on state** - Resolved border positioning issues and ensured background colors properly reflect entity states across all modules.
- **Fixed text color issue on text module** - Resolved text color rendering issues in the text module to ensure proper color display.

---

## Version 2.2.0-beta4

### 🚀 New Features

- **Icon size to button module** - Added icon size configuration option to the button module for better control over icon display.

### 🚀 Improvements

- **Added distribution options in info module** - Enhanced info module with new distribution options for better layout control.
- **Adjusted audio tweaks to camera module** - Improved audio handling and controls in the camera module.

### 🐛 Bug Fixes

- **Possible fix for mushroom template when adding as 3rd party module** - Potential fix for template handling issues when mushroom cards are added as 3rd party modules.
- **Fix z-index issue in gauge modules and popups** - Resolved z-index conflicts in gauge modules and their popup dialogs.
- **Possible fix for spinbox module keeping focus on mobile** - Potential fix for focus retention issues in spinbox module on mobile devices.
- **Possible fix for dropdown not closing when swiping out on mobile** - Potential fix for dropdown menu behavior when swiping on mobile devices.
- **Fixed z-index for climate module and popups** - Resolved z-index issues affecting climate module and its popup dialogs.

---

## Version 2.2.0-beta3

### 🚀 New Features

- **Google Font support** - Added comprehensive Google Fonts integration with 30+ popular font families. Fonts are dynamically loaded from Google CDN when selected, providing access to professional typography options throughout the card.

### 🚀 Improvements

- **Improved dropdown behavior** - Enhanced dropdown module to ensure only one dropdown can be open at a time across all instances, preventing UI conflicts and improving user experience.
- **Improved CSS for Card Mod targeting** - Enhanced CSS variable generation system with better prefix support and more comprehensive variable coverage. All design properties now generate CSS custom properties (e.g., --my-row-bg-color, --my-row-text-color) that can be easily overridden using card-mod, making it easier to style Ultra Cards from external CSS.
- **Exporting allows for glyphs** - Enhanced export functionality to properly preserve Unicode characters including empty character glyphs (zero-width spaces, non-breaking spaces, etc.) during clipboard and file export operations.

### 🐛 Bug Fixes

- **Fix transform origin issue in some cards** - Resolved transform origin problems that were causing incorrect scaling and rotation behavior in certain card configurations, particularly affecting cards with responsive scaling enabled.

---

## Version 2.2.0-beta2

### 🚀 Improvements

- **Camera module parity with HA** - Updated camera module layout and controls to mirror native Home Assistant behavior, including a new playback mode selector.
- **Dropdown header customization** - Added configurable icon and title controls so dropdown headers can better reflect their context.
- **Removed legacy background module** - Eliminated the all-in-one background module to avoid conflicts with core Home Assistant view behavior.
- **Improved dropdown synchronization** - Tightened dropdown syncing logic to ensure selections remain aligned across editor previews and rendered cards.

### 🐛 Bug Fixes

- **Dynamic Weather module instance handling** - Resolved an issue where dynamic weather changes were not scoped per module instance.
- **Camera audio reliability** - Fixed lingering audio playback problems inside the camera module.

---

## Version 2.2.0-beta1

### 🚀 New Features

- **Added new Dynamic Weather Module** - New Dynamic Weather Module with enhanced weather visualization capabilities
- **Added New Background Module** - New Background Module for advanced background customization

### 🐛 Bug Fixes

- **Possible Fix for Camera Module Audio** - Potential fix for audio issues in Camera Module
- **Possible Fix for Dropdown Module duplicates causing conflicts** - Potential fix for duplicate dropdown modules causing conflicts
- **Possible Fix for mobile buttons not deselecting after being pressed (spinbox module)** - Potential fix for mobile button deselection issues in Spinbox Module

---

## Version 2.1.0

## 🚀 Major Features

### Unified Template System
- **Revolutionary new template system** - Replaces multiple template boxes with one powerful unified template
  - Control multiple properties from a single template (icon, color, name, state text, and their colors)
  - Uses entity context variables (state, entity, attributes, name) for seamless entity remapping
  - Returns JSON objects for multi-property control or simple strings for single properties
  - Fully implemented in 5 core modules: Icon, Info, Text, Bar, and Markdown
  - Basic structure added to Graphs, Spinbox, and Camera modules
  - See UNIFIED_TEMPLATES.md for complete documentation and examples

### New Modules
- **Map Module** - Interactive map functionality for visualizing locations
- **Climate Module** (Pro) - New Climate Module added for Ultra Card Pro members
- **Slider Control Module** - Powerful new module for controlling numeric values with sliders, offering flexible configuration and real-time updates

### Enhanced Module Features
- **Gauge Module Enhancements**
  - Added color templating and value templating support
  - Added Icon Pointers for Gauge Module - Icons can now be used as pointers inside the track
- **Template Mode Support**
  - Added Template mode to Graphs Module
  - Spinbox Module templating support
  - Camera Module templating support
  - Background templating added to icon and info modules

## 🐛 Bug Fixes

### Critical Fixes
- **Fixed Migration Quote Bug** - Migration now properly wraps template code in quotes for valid JSON
- **Fixed Migration Whitespace** - Normalized whitespace to prevent parsing errors from newlines and tabs
- **Fixed Template Object Parsing** - Fixed critical bug where Home Assistant returned templates as objects instead of strings
- **Fixed Template Boolean Parsing** - Templates are no longer incorrectly interpreted as boolean values

### Module-Specific Fixes
- **Fixed icon templates conflicting with animations** - Resolved conflicts between icon templates and animation systems
- **Fixed separator CSS spacing** - Resolved separator spacing issues across various alignment configurations
- **Fixed dropdown module issues in slider** - Resolved issues with dropdown module functionality when used within slider modules
- **Fixed dropdown clipping** - Resolved issue where dropdowns in slider modules were being clipped by container boundaries
- **Fixed slider update issues** - Resolved problems with slider module updates
- **Fixed slider auto play** - Corrected auto play functionality in slider modules to work reliably
- **Fixed light module issues** - Corrected various problems affecting the light module functionality
- **Fixed light module color settings** - Corrected color setting functionality in the light module
- **Fixed input limitation on light module** - Resolved input constraints in light module for XY and HS color modes
- **Fixed spinbox module hover button on mobile** - Fixed hover button behavior on mobile devices for spinbox module
- **Fixed nowrap in modules** - Fixed potential issues with nowrap functionality in modules

### UI & Display Fixes
- **Fixed gradient opacity issues in bar module**
- **Fixed clock visibility on smaller displays**
- **Fixed field cursor jump issues**
- **Fixed video background bug**
- **Fixed animation alignment issues**
- **Fixed odd card panel heights** - Corrected card panel height issues across various viewport sizes
- **Fixed color pick and button style issues** - Resolved color picker and button styling problems
- **Fixed clipboard issue on some browsers** - Fixed clipboard functionality issues on certain browsers

### Editor & Configuration Fixes
- **Fixed modules without entities** - Added entity selection capability to action tab for modules without entities
- **Improved module config error handling** - Enhanced error handling for module configuration issues

## 🚀 Improvements

### Template System
- **Improved template migration to unified template mode** - Enhanced template migration process with cleaner output
- **Improved template mode input box recognition** - Enhanced template mode input box recognition for better user experience
- **Improved template mode field** - Enhanced template mode field functionality
- **Improved template mode in some modules** - Enhanced template mode functionality in various modules
- **Cleaner Migration Output** - Single-line JSON format for better readability and reliability

### CSS & Layout Improvements
- **Improved CSS standardized CSS** - Enhanced and standardized CSS across the card
- **Improved CSS for nested layouts** - Enhanced CSS handling for nested layout structures
- **Improved nested layout logic** - Enhanced nested layout system with automatic scaling and better layout handling for complex card structures
- **Improved CSS handling of bar modules and separator modules** - Enhanced CSS handling to better accommodate space constraints
- **Improved word wrap** - Enhanced word wrap functionality and added individual reset controls for text items in the design tab

### Module Improvements
- **Improved Slider Module based on swiper** - Enhanced slider module with better performance and features using Swiper library (Note: vertical slider is still not complete)
- **Improved dropdown module** - Enhanced dropdown module with automatic up/down detection, arrow click behavior, and padding conflict resolution
- **Improved whitespace for modules** - Better whitespace handling across modules
- **Improved popup header for Safari browsers** - Enhanced popup header compatibility for Safari browsers
- **Updated alignment options in info module** - Improved alignment options available in the info module
- **Added alignments to column** - New alignment options for column modules

### Design Tab Enhancements
- **Added white space to design tab** - White space controls added to design tab (works with some modules)
- **Added separate reset values to text items** - Individual reset controls for text items in the design tab
- **Adjusted z-index and spacing** - Improved z-index handling and spacing adjustments across modules

### Light Module Enhancements
- **Enhanced light module** - New features and functionality added
- **Improved light module navigation** - Enhanced navigation and user experience within the light module

### Performance & Developer Experience
- **Reduced flooding of console warnings** - Reduced excessive console warning messages
- **Removed debug logging** - Cleaned up console output for production use
- **Removed Smart Scaling** - Removed smart scaling feature as it wasn't working as expected

---

## 🙏 Special Thanks

A huge thank you to the Ultra Card Discord community for their invaluable bug reports, feature requests, and continuous feedback that helped shape this release. Your contributions make Ultra Card better with every update!

---

## Version 2.1.0-beta21

### 🐛 Bug Fixes

- **Possible fix to clipboard issue on some browsers** - Fixed clipboard functionality issues on certain browsers

---

## Version 2.1.0-beta20

### 🐛 Bug Fixes

- **Fix spinbox module hover button on mobile** - Fixed hover button behavior on mobile devices for spinbox module
- **Fix modules that do not have an entity to add entity selection for action tab** - Added entity selection capability to action tab for modules without entities

### 🚀 Improvements

- **Improved template migration to unified template mode** - Enhanced template migration process for unified template mode
- **Dropdown module improvements and features** - Various improvements and new features for dropdown module

---

## Version 2.1.0-beta19

### 🚀 Improvements

- **Improved dropdown module with automatic up/down detection, arrow click behavior and padding conflicts** - Enhanced dropdown module with better detection and interaction handling
- **Improved popup header for safari based browsers** - Enhanced popup header compatibility for Safari browsers
- **Improved whitespace for modules** - Better whitespace handling across modules
- **Improved template mode field** - Enhanced template mode field functionality
- **Reduce flooding of console warnings** - Reduced excessive console warning messages

---

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
