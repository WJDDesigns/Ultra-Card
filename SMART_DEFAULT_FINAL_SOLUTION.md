# Smart Default Actions - Final Solution (No Dropdown Revert Issues)

## Problem Summary

After 3 days of attempting to implement smart default actions, the core issue was:

- Converting stored `'default'` action to `'more-info'` for display caused HA's form system to detect a mismatch
- This mismatch triggered constant re-rendering, causing the dropdown to revert to previous values
- CSS and DOM manipulation attempts to hide blank spaces were band-aids that didn't address the root cause

## Root Cause

**The fundamental problem:** Home Assistant's `ui_action` selector expects the displayed value to match the stored value. Any conversion between the two creates a sync issue that causes dropdown instability.

## The Clean Solution

### Stop Fighting the UI System

Instead of trying to display `'default'` as something else:

1. **Don't store `'default'` at all** when user hasn't made an explicit choice
2. **Use `undefined` in the config** to represent "smart resolution desired"
3. **Display `'more-info'` in the dropdown** as the natural first choice
4. **Resolve at runtime** based on entity domain when action is `undefined` or `'default'`

### Implementation Details

#### 1. Storage Layer (`global-actions-tab.ts`)

**Display Logic:**

```typescript
// If action is undefined/null, show 'more-info' as default
// This represents smart behavior without storing anything
const displayAction =
  action && action.action
    ? action.action === 'nothing'
      ? { ...action, action: 'none' }
      : action
    : { action: 'more-info', entity: moduleEntity };

// Track whether we have an explicit stored action
const hasExplicitAction = action && action.action;
```

**Event Handler:**

```typescript
if (newAction.action === 'more-info' && !hasExplicitAction) {
  // User clicked "More Info" but no action is stored (smart default)
  // Keep it undefined so smart resolution continues
  updateAction(undefined);
} else if (newAction.action === 'none') {
  updateAction({ action: 'nothing' });
} else {
  // User selected specific action - store it explicitly
  updateAction(cleanAction);
}
```

#### 2. Runtime Resolution (`ultra-link.ts`)

```typescript
static handleAction(
  action: TapActionConfig | undefined,
  hass: HomeAssistant,
  element?: HTMLElement,
  config?: UltraCardConfig
): void {
  // If action is undefined or missing, or explicitly 'default', use smart resolution
  let resolvedAction: TapActionConfig;

  if (!action || !action.action || action.action === 'default') {
    resolvedAction = this.resolveDefaultAction(action || { action: 'default' }, hass);
  } else {
    resolvedAction = action;
  }

  // ... rest of action handling
}
```

The `resolveDefaultAction()` method checks entity domain:

- `button.*` → `perform-action: button.press`
- `automation.*` → `toggle`
- `script.*` → `perform-action: script.turn_on`
- `switch.*`, `light.*`, etc. → `toggle`
- All others → `more-info`

#### 3. UI Feedback

When no explicit action is stored:

- Dropdown shows: **"More Info"** (first item, natural default)
- Header shows: **"Smart Default Configuration"**
- Description shows: _"Entity will use its native action (button press, automation toggle, script run, etc.)"_

## Why This Works

### No Value Conversion

- ✅ What we display (`'more-info'`) matches what HA's form expects
- ✅ No conversion between stored and displayed values
- ✅ HA's form system stays in sync

### No Storage Pollution

- ✅ `undefined` in config = "use smart resolution"
- ✅ Only explicit user choices are stored
- ✅ Clean configuration files

### Backwards Compatible

- ✅ Existing `{ action: 'default' }` configs still work
- ✅ Explicit actions (toggle, navigate, etc.) unchanged
- ✅ No migration needed

### No Dropdown Issues

- ✅ No blank spaces
- ✅ No revert-to-previous-value bugs
- ✅ Stable UI that works like standard HA components

## User Experience

### Scenario 1: New Module with Button Entity

1. User adds module with `button.garage_door`
2. Actions tab shows "More Info" selected (but nothing stored)
3. User taps card → triggers `button.press` service
4. Smart resolution in action! 🎉

### Scenario 2: User Wants Explicit Action

1. User opens Actions tab
2. Sees "More Info" with "Smart Default Configuration" header
3. Changes to "Toggle" explicitly
4. Now stores `{ action: 'toggle', entity: 'button.garage_door' }`
5. Tap now toggles (overriding smart behavior)

### Scenario 3: User Changes Entity

1. Module originally had `button.test`
2. User changes entity to `automation.lights`
3. Action still undefined (smart default)
4. Tap now toggles the automation (no config change needed)

## Testing Checklist

✅ **Dropdown Stability**: No revert-to-previous-value  
✅ **No Blank Spaces**: Clean dropdown rendering  
✅ **Smart Resolution**: Button → press, Automation → toggle  
✅ **Entity Swapping**: Changing entity maintains smart behavior  
✅ **Explicit Override**: User can still select specific actions  
✅ **Backwards Compatible**: Existing configs work unchanged

## Files Modified

1. **`src/components/ultra-link.ts`**

   - Updated `handleAction()` to accept `undefined` actions
   - Handles both `undefined` and `'default'` for backwards compatibility

2. **`src/tabs/global-actions-tab.ts`**
   - Removed all value conversion logic
   - Display `undefined` as `'more-info'` naturally
   - Only store explicit user selections
   - Smart UI feedback when no action stored

## Key Takeaway

**Stop trying to make `'default'` appear in the UI.** Let `undefined` be undefined, display it as `'more-info'` naturally, and resolve at runtime. This aligns with how HA's form system expects to work and eliminates all the dropdown issues.

The 3-day struggle was trying to force a custom action type into HA's selector. The solution was to work _with_ the UI system, not against it.
