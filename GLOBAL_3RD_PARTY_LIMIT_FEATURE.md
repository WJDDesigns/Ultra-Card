# Global 3rd Party Card Limit Feature

## Overview

Implemented a global dashboard-wide limit for 3rd party external card modules in Ultra Card. Non-Pro users are now limited to **5 external card modules across all Ultra Card instances** on their entire dashboard, while Pro users enjoy unlimited external cards.

## Critical Bug Fix (January 2025)

**Issue**: The dashboard scanner was only scanning the "current" dashboard path determined from the URL. When opening the editor, the URL doesn't follow the standard `/lovelace/dashboard-name` pattern, causing the regex to fail and default to scanning only the "default" dashboard. This resulted in:

- External cards on non-default dashboards being incorrectly locked
- The global counter showing 0 cards even when cards existed
- Users with only 1 external card seeing it locked with Pro overlay

**Fix**: Added new `scanAllDashboards()` method that:

- Scans **ALL dashboards** in Home Assistant via WebSocket API
- Includes both the default dashboard and all custom dashboards
- Works correctly regardless of which dashboard or URL the editor is opened from
- Provides accurate global count across the entire Home Assistant instance

## Changes Made

### 1. Global Counter System

**File**: `src/editor/tabs/layout-tab.ts`

#### Added New Methods:

- **`_countAllExternalCardModulesGlobally()`**: Async method that scans the entire dashboard for all Ultra Card instances and counts all `external_card` modules across them
- **`_refreshGlobalExternalCardCount()`**: Updates the cached global count and ensures only one refresh happens at a time
- **`_handleRefresh3rdPartyTab()`**: Handles the refresh button click in the 3rd Party tab

#### Added State Variable:

- **`_globalExternalCardCount`**: Reactive state variable that stores the current global count across the dashboard

### 2. Dashboard Scanner Integration

**Imported Service**: `ucDashboardScannerService`

- Scans **ALL dashboards** in Home Assistant (not just the current one)
- Finds all Ultra Card instances across all dashboards (including nested ones)
- Counts external card modules in each instance globally

**New Method**: `scanAllDashboards()` - Added to scan across all dashboards instead of just the current dashboard. This fixes a critical bug where cards on non-default dashboards would be incorrectly locked.

**Initialization**: Added initialization in the `updated()` lifecycle method to ensure the scanner service has access to the Home Assistant instance.

### 3. Updated UI Display

**3rd Party Tab Changes**:

- Changed counter to cap at 5: Shows `"5 / 5 cards used"` instead of `"7 / 5"` when over limit
- Removed confusing **"Pro: Unlimited"** text that made free users think they had Pro
- Added clear call-to-action: **"Want Unlimited?"** with **"Get Pro"** button
- Button links directly to [https://ultracard.io/product/ultra-card-pro/](https://ultracard.io/product/ultra-card-pro/)
- Counter automatically refreshes when the tab is rendered
- Refresh button now updates the global count
- Styled button with hover effects and professional appearance

### 4. Validation When Adding Cards

**Enhanced `_add3rdPartyCard()` Method**:

- Now checks the global count **before** allowing a new external card to be added
- For non-Pro users: Shows an error toast if they've already reached 5 cards
- For Pro users: No limit enforced
- Error message: _"You have reached the maximum of 5 external cards across your dashboard. Upgrade to Ultra Card Pro for unlimited external cards."_
- Automatically refreshes the global count after successfully adding a card

### 5. Auto-Update on Deletion

**Enhanced `_deleteModule()` Method**:

- Detects when an external card is deleted
- Automatically refreshes the global count after deletion
- Ensures the counter stays accurate in real-time

### 6. Locking Cards Beyond Limit

**Global External Card Enforcement** (`src/modules/external-card-module.ts`):

- Non-Pro users can only **use** the first 5 external cards added (by timestamp) **across ALL dashboards**
- Cards 6, 7, 8, etc. are **locked** with a Pro overlay
- Locked cards show:
  - Blurred preview of the card (opacity 50%)
  - Dark overlay with lock icon 🔒
  - Message: "Pro Feature - Upgrade to Pro for unlimited 3rd party cards"
  - Pointer events disabled (can't interact)
- Uses a **caching system** (5-second TTL) to avoid expensive dashboard scans on every render
- Uses `scanAllDashboards()` method to scan **all dashboards** in Home Assistant, not just the current one
- Cache automatically invalidates when external cards are deleted
- Fallback to local check if global scan fails
- Pro users see all cards unlocked (no limit)

## How It Works

### Workflow

1. **User opens 3rd Party tab**

   - `_render3rdPartyTab()` is called
   - `_refreshGlobalExternalCardCount()` scans all Ultra Cards across **ALL dashboards**
   - Counter displays: "5 / 5 cards used across dashboard" (capped at 5, not "7 / 5")
   - Shows "Want Unlimited?" with "Get Pro" button

2. **User tries to add an external card**

   - `_add3rdPartyCard()` checks current global count
   - If count >= 5 (for non-Pro): Shows error toast and blocks addition
   - If count < 5 or user is Pro: Adds the card and refreshes count

3. **User deletes an external card**

   - `_deleteModule()` detects it's an external card
   - Refreshes global count automatically
   - Counter updates in real-time
   - If 6th+ card exists, it automatically unlocks (becomes 5th card)

4. **External cards render on dashboard**
   - Each external card checks if it should be locked
   - First 5 cards (by timestamp) render normally
   - Cards 6+ show Pro lock overlay with blurred preview
   - Cache refreshes every 5 seconds for performance

### Technical Implementation

The global counter works by:

1. Using `ucDashboardScannerService.scanAllDashboards()` to get all Ultra Card instances **across all dashboards**
2. Scans the default dashboard plus all custom dashboards via WebSocket API
3. Iterating through each card's `layout.rows[].columns[].modules[]`
4. Counting modules where `type === 'external_card'`
5. Caching the result in a reactive state variable for performance

## Pro vs Free Users

### Free Users

- ✅ Can **use** up to 5 external card modules **across their entire dashboard**
- ✅ Counter shows: "5 / 5 cards used across dashboard" (capped display)
- ✅ First 5 cards (by timestamp) work normally
- ⚠️ Cards 6+ are **locked** with Pro overlay (blurred + lock icon)
- ✅ Blocked from adding NEW cards when at 5
- ✅ Can delete existing cards to free up slots and unlock others
- ✅ "Want Unlimited?" call-to-action with "Get Pro" button

### Pro Users

- ✅ **Unlimited external cards** across all Ultra Card instances
- ✅ Counter shows: "Unlimited Cards" with crown icon
- ✅ No validation or limits enforced

## Testing Recommendations

### Test Case 1: Free User - Adding Cards

1. Create a fresh dashboard without Ultra Card Pro
2. Add multiple Ultra Card instances
3. Try adding external cards (Mushroom, Bubble, etc.) across different Ultra Cards
4. Verify the counter increments correctly
5. Try to add a 6th external card - should see error toast

### Test Case 2: Free User - Deleting Cards

1. Have 5 external cards across multiple Ultra Cards
2. Delete one external card
3. Verify counter decrements to "4 / 5"
4. Should now be able to add another card

### Test Case 3: Pro User

1. Enable Ultra Card Pro subscription
2. Open 3rd Party tab
3. Verify it shows "Unlimited Cards" with crown icon
4. Add more than 5 external cards
5. Verify no limits are enforced

### Test Case 4: Multi-Dashboard Scan

1. Create external cards in different dashboards (not just the default)
2. Create external cards in different views within each dashboard
3. Create external cards in nested Ultra Cards (within sections)
4. Open editor from a non-default dashboard
5. Verify the global counter accurately counts all cards across ALL dashboards
6. Verify cards are locked/unlocked correctly regardless of which dashboard you're viewing

## Benefits

1. **Fair Feature Gating**: Free users get meaningful functionality (5 cards) while Pro users get unlimited
2. **Dashboard-Wide Limit**: More flexible than per-card limits
3. **Real-Time Updates**: Counter stays accurate as users add/remove cards
4. **Clear Messaging**: Users understand the limit is global and are prompted to upgrade
5. **Pro Value**: Clear differentiation between free and Pro tiers

## Future Enhancements

Potential improvements:

- Add a visual indicator showing which Ultra Cards contain external cards
- Show a breakdown of external cards per Ultra Card instance
- Add a "Manage External Cards" view that lists all external cards across the dashboard
- Export/import functionality for external card configurations

---

**Version**: 2.0-beta18  
**Date**: January 2025  
**Author**: WJD Designs
