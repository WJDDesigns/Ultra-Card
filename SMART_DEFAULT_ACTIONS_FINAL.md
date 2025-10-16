# Smart Default Actions - Final Implementation

## Overview

Ultra Card now features intelligent action resolution that automatically determines the most appropriate action for each entity type. This provides a native-feeling experience where buttons trigger presses, automations toggle, scripts run, and more - all without explicit configuration.

## How It Works

### 1. Storage Layer (`'default'` action)

- New modules are created with `tap_action: { action: 'default', entity: <moduleEntity> }`
- This is stored in the configuration and persists across sessions
- The `'default'` value acts as a smart placeholder that resolves at runtime

### 2. Display Layer (Editor UI)

- In the Actions tab dropdown, `'default'` is displayed as **"More Info"** (the first item)
- This is purely a UI representation - the actual stored value remains `'default'`
- When viewing the dropdown:
  - If stored action is `'default'` → shows as "More Info" (but keeps `'default'` internally)
  - Clicking on "More Info" when it's already the default → preserves `'default'` action
  - Changing to a different action → stores that specific action (e.g., `'toggle'`, `'navigate'`)

### 3. Runtime Resolution (`ultra-link.ts`)

- When an action is triggered with `action: 'default'`, the `resolveDefaultAction()` method:
  - Checks the entity's domain
  - Returns the appropriate native action based on entity type
  - Falls back to `'more-info'` for unknown types

## Entity Type Mappings

| Entity Domain     | Resolved Action                  | Description               |
| ----------------- | -------------------------------- | ------------------------- |
| `button.*`        | `perform-action: button.press`   | Triggers the button       |
| `script.*`        | `perform-action: script.turn_on` | Runs the script           |
| `scene.*`         | `perform-action: scene.turn_on`  | Activates the scene       |
| `automation.*`    | `toggle`                         | Toggles automation on/off |
| `switch.*`        | `toggle`                         | Toggles switch on/off     |
| `light.*`         | `toggle`                         | Toggles light on/off      |
| `fan.*`           | `toggle`                         | Toggles fan on/off        |
| `input_boolean.*` | `toggle`                         | Toggles input boolean     |
| `lock.*`          | `toggle`                         | Locks/unlocks             |
| `cover.*`         | `toggle`                         | Opens/closes              |
| All others        | `more-info`                      | Shows entity details      |

## User Experience

### For New Modules

1. User adds a module with an entity (e.g., a button entity)
2. The Actions tab shows "More Info" as the default selection
3. When tapped on the card, it intelligently triggers `button.press` (not more-info)
4. User can still explicitly change to any other action if desired

### For Existing Modules

1. Modules with explicit actions (e.g., `'toggle'`, `'navigate'`) continue to work exactly as before
2. Modules that were previously using `'more-info'` by default now show that explicitly in the dropdown
3. No breaking changes to existing configurations

### Smart Default Benefits

- **Button entities**: Pressing the card triggers the button (native feel)
- **Automation entities**: Tapping toggles the automation on/off
- **Script entities**: Tapping runs the script
- **Sensor entities**: Tapping shows more info (appropriate fallback)

## Implementation Files

### Modified Files

1. **`src/components/ultra-link.ts`**
   - Added `resolveDefaultAction()` method for entity domain detection
   - Modified `handleAction()` to resolve `'default'` actions before execution
2. **`src/tabs/global-actions-tab.ts`**

   - Display logic converts `'default'` to `'more-info'` for UI representation
   - Event handler preserves `'default'` when user clicks on the displayed value
   - Entity picker shows for `'default'` actions with smart description
   - Removed `'default'` from dropdown options (following Mushroom Cards pattern)

3. **`src/types.ts`**

   - Added `'default'` to `ActionType` union type

4. **Module defaults updated:**
   - `src/modules/info-module.ts`
   - `src/modules/icon-module.ts`
   - `src/modules/animated-weather-module.ts`
   - `src/modules/animated-forecast-module.ts`

## Key Technical Decisions

### Why Remove 'default' from Dropdown?

Following Mushroom Cards' implementation pattern, we discovered that Home Assistant's `ui_action` selector doesn't properly render custom action types like `'default'`. This was causing:

- Blank spaces in the dropdown list
- Rendering issues with list items
- Inconsistent display behavior

By removing `'default'` from the dropdown and showing it as `'more-info'`, we achieve:

- Clean, standard HA dropdown appearance
- No blank spaces or rendering glitches
- Proper integration with HA's native UI components
- Smart resolution still works via stored `'default'` value

### Why Not Convert to Hard-coded Actions?

We preserve the `'default'` value in storage rather than converting to specific actions because:

1. **Future-proof**: If entity domain changes or new action types are added, the card adapts automatically
2. **User Intent**: User chose "let the card decide", not "always do X"
3. **Flexibility**: Entity can be swapped without reconfiguring actions
4. **Maintenance**: One source of truth for default behavior logic

### Preventing Dropdown Loops

The implementation includes safeguards against the common dropdown revert bug:

- Value comparison before processing updates
- Skip processing when displayed value matches current value
- Deferred preview updates to prevent mid-render changes
- Proper distinction between `actualAction` and `displayAction`

## Testing Scenarios

✅ **Button Entity**: Tap triggers `button.press` service
✅ **Automation Entity**: Tap toggles automation on/off  
✅ **Switch Entity**: Tap toggles switch on/off
✅ **Script Entity**: Tap runs the script
✅ **Sensor Entity**: Tap shows more info dialog
✅ **Dropdown Stability**: No revert-to-previous-value on click
✅ **No Blank Spaces**: Clean dropdown rendering
✅ **Entity Swapping**: Changing entity preserves smart default behavior

## Migration Notes

- Existing cards continue to work without changes
- New modules automatically get smart default behavior
- Users can still override with explicit actions anytime
- No configuration migration needed
