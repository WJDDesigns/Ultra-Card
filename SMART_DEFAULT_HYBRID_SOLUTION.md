# Smart Default Actions - Hybrid Solution

## Problem Solved

After 3 days of development, we finally have a working solution that:

1. ✅ Shows "Default" (not "More Info") in the dropdown
2. ✅ Doesn't revert to previous selection when clicked
3. ✅ Preserves all action-specific configuration fields (navigate, URL, perform-action, etc.)
4. ✅ Implements smart entity-based action resolution at runtime

## The Solution: Hybrid Approach

### Core Issue

Home Assistant's `ui_action` selector does **not** support custom action types. It only recognizes:

- `more-info`, `toggle`, `navigate`, `url`, `perform-action`, `assist`, `none`

Any attempt to add `'default'` to the `ui_action` selector's actions array causes it to be rejected, leading to dropdown revert issues.

### Why Previous Attempts Failed

**Attempt 1: Add 'default' to ui_action selector**

- ❌ HA rejected the custom action type
- ❌ Caused blank spaces and rendering glitches
- ❌ Dropdown kept reverting

**Attempt 2: Display 'default' as 'more-info'**

- ❌ Value mismatch between stored ('default') and displayed ('more-info')
- ❌ HA's form system detected mismatch and triggered re-renders
- ❌ Dropdown constantly reverted to previous value

**Attempt 3: Store undefined instead of 'default'**

- ❌ Form still fired value-changed events on render
- ❌ Still caused dropdown revert issues

### The Hybrid Solution ✅

**Use TWO separate UI components:**

1. **Regular `select` dropdown for action TYPE**

   - Shows: "Default", "More Info", "Toggle", "Navigate", "URL", "Perform Action", "Assist", "Nothing"
   - Fully under our control, no HA restrictions
   - Supports 'default' as a valid, stable option

2. **Conditional configuration sections for each action**
   - Manually render the appropriate fields based on selected action
   - For navigate: show navigation path text field
   - For URL: show URL path text field
   - For perform-action: show service selector, target, and data fields
   - For more-info/toggle/default: show entity picker

## Implementation Details

### 1. Action Type Selector (Line 301-364)

```typescript
{
  name: 'action_type',
  selector: {
    select: {
      options: [
        { value: 'default', label: 'Default' },
        { value: 'more-info', label: 'More Info' },
        { value: 'toggle', label: 'Toggle' },
        { value: 'navigate', label: 'Navigate' },
        { value: 'url', label: 'URL' },
        { value: 'perform-action', label: 'Perform Action' },
        { value: 'assist', label: 'Assist' },
        { value: 'none', label: 'Nothing' },
      ],
      mode: 'dropdown',
    },
  },
}
```

**Event Handler:**

```typescript
if (selectedAction === 'default') {
  updateAction({ action: 'default', entity: moduleEntity });
} else if (selectedAction === 'none') {
  updateAction({ action: 'nothing' });
} else {
  updateAction({ action: selectedAction /* + any fields */ });
}
```

### 2. Conditional Configuration Sections

**Default/More Info/Toggle** (Line 372-453):

- Shows entity picker
- Displays "Smart Default Configuration" header for default
- Entity picker for selecting which entity to act on

**Navigate** (Line 456-479):

- Shows navigation path text input
- Updates `navigation_path` property

**URL** (Line 482-505):

- Shows URL path text input
- Updates `url_path` property

**Perform Action** (Line 508-545):

- Shows service text input
- Shows target selector (with entity/device/area pickers)
- Shows data object selector (for service data)
- Supports both modern (`perform_action`) and legacy (`service`) properties

### 3. Runtime Resolution (ultra-link.ts)

```typescript
static handleAction(action: TapActionConfig | undefined, ...) {
  if (!action || !action.action || action.action === 'default') {
    resolvedAction = this.resolveDefaultAction(action || { action: 'default' }, hass);
  }
  // ... rest of action handling
}
```

**Smart Resolution by Domain:**

- `button.*` → `button.press`
- `automation.*`, `switch.*`, `light.*` → `toggle`
- `script.*` → `script.turn_on`
- `scene.*` → `scene.turn_on`
- Others → `more-info`

## User Experience

### Default Action (New!)

1. User adds module with button entity
2. Actions tab shows **"Default"** selected
3. Entity picker shows with description: _"Entity will use its native action (button press, automation toggle, script run, etc.)"_
4. Tapping card → smart resolution → `button.press` service called
5. **No dropdown revert issues!** ✅

### Explicit Actions (Preserved!)

1. User selects "Perform Action"
2. Conditional section appears with:
   - Service selector
   - Target selector (entity/device/area)
   - Data object editor
3. All HA's native pickers and selectors work correctly
4. User can configure complex service calls just like before

### Navigate/URL Actions (Preserved!)

1. User selects "Navigate" or "URL"
2. Text input field appears
3. User enters path or URL
4. Works exactly as it did before

## Why This Works

### ✅ No HA Restrictions

- We control the action type dropdown
- `'default'` is a valid option we define
- No rejection or revert issues

### ✅ No Value Mismatch

- Stored value: `{ action: 'default' }`
- Displayed value: `'default'`
- **Perfect match** → no re-render loops

### ✅ Preserves Functionality

- Each action type gets its proper configuration fields
- Uses HA's native selectors (entity, target, object)
- Same UX as before for non-default actions

### ✅ Smart Resolution

- `'default'` stored in config
- Resolved at runtime by `ultra-link.ts`
- Different behavior per entity domain

## Files Modified

1. **`src/tabs/global-actions-tab.ts`**

   - Replaced `ui_action` selector with regular `select` dropdown
   - Added conditional sections for navigate, URL, and perform-action
   - Preserved entity picker for more-info/toggle/default

2. **`src/components/ultra-link.ts`**
   - Updated `handleAction()` to accept `undefined` and `'default'`
   - Resolves default actions before execution

## Testing Checklist

✅ **"Default" shows in dropdown** (not "More Info")  
✅ **No dropdown revert** when clicking same value  
✅ **Smart resolution works** (button press, automation toggle, etc.)  
✅ **Navigate action** shows path field and works  
✅ **URL action** shows URL field and works  
✅ **Perform Action** shows service/target/data fields  
✅ **More Info/Toggle** show entity picker  
✅ **Assist action** works (no extra fields needed)  
✅ **Nothing action** works

## Key Takeaway

**Don't fight HA's UI system.** When HA's selectors don't support what you need, build your own UI with the same look and feel. The hybrid approach gives us full control over the action type dropdown while preserving all the native HA functionality for action configuration.

The 3-day struggle was trying to force `'default'` into `ui_action`. The solution was to separate concerns: action **type** selection (our custom select) vs action **configuration** (HA's native fields).
