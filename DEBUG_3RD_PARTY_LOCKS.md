# Debug Build: 3rd Party Locks in Layout Containers

## Version: 2.0-beta27.5-debug

This debug build adds detailed console logging to help diagnose why 3rd party cards show lock overlays when moved into horizontal/vertical layout containers.

## What Changed

Added debug logging in three key places:

### 1. Module Registration (`third-party-limit-service.ts`)

When a card is registered, you'll see:

```
[3P Service] Registering card <cardId>: {
  dashboardId: "default",
  totalModules: 5,
  externalCards: 2,
  allModules: [...]
}
```

This shows how many modules were extracted, including nested ones.

### 2. Service Evaluation (`third-party-limit-service.ts`)

When the service evaluates which cards should be allowed:

```
[3P Service] Evaluate: {
  dashboardId: "default",
  isPro: false,
  totalThirdParty: 2,
  allThirdParty: [...]
}
```

This shows the total count of 3rd party modules across all registered cards.

### 3. Lock Check (`external-card-module.ts`)

When each external card checks if it should show a lock:

```
[3P Lock Check] Module: module-123: {
  key: "default:card-hash:abc123:module-123",
  totalThirdParty: 2,
  allowedKeysCount: 2,
  isAllowed: true,
  shouldLock: false,
  allAllowedKeys: [...]
}
```

This shows the exact key being checked and whether it's in the allowed set.

## How to Test

1. **Install this debug version** (v2.0-beta27.5-debug)
2. **Open browser console** (F12)
3. **Reproduce the issue**:
   - Add 2 external cards at the top level
   - Verify they show correctly (not locked)
   - Add a horizontal or vertical container
   - Drag those 2 cards into the container
   - Save the card configuration
4. **Check the console logs** - look for the patterns above

## What to Look For

### Expected Behavior (Working Correctly)

- Registration should show `externalCards: 2` (or however many you have)
- Evaluation should show `totalThirdParty: 2` (same count)
- Lock check should show `isAllowed: true` for both cards
- Lock check should show matching keys in `allAllowedKeys`

### Problem Indicators

- **Extraction missing nested modules**: Registration shows `externalCards: 0` after moving into container
- **Key mismatch**: Lock check key doesn't appear in `allAllowedKeys` array
- **Count mismatch**: Registration shows 2 cards but evaluation shows different number
- **Timing issue**: No registration log appears after moving modules

## Known Behavior

The lock check includes this line:

```typescript
if ((hass as any)?.editMode) {
  return false; // Never lock in edit mode
}
```

This means:

- **During editing**: No locks are shown (this is intentional)
- **After saving**: Locks may appear if modules are not in the allowed set

This is expected - the question is WHY modules moved into containers aren't in the allowed set after saving.

## Next Steps

After collecting the console logs, we'll be able to see exactly where the issue is and implement the proper fix. Share the console output and I'll provide the solution.
