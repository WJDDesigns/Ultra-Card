# Ultra Card Snapshot Frontend Fixes

**Date:** October 3, 2025  
**Version:** 2.0-beta3  
**Status:** ✅ FIXED

## Issues Fixed

### 1. Snapshot List Shows "0 cards" in Home Assistant

**Problem:**  
The Backup & Snapshot History modal in Home Assistant displayed "0 cards" even after the WordPress backend was fixed to show "35 cards correctly".

**Root Cause:**  
Browser HTTP caching was preventing the frontend from fetching fresh data from the API. The cached API response still contained the old "0 cards" data.

**Solution:**  
Added cache-busting to the `listSnapshots()` API call:

- Added timestamp query parameter (`?_=${Date.now()}`)
- Timestamp changes with every request, forcing fresh data
- No custom headers (avoids CORS preflight issues)

**Files Modified:**

- `src/services/uc-snapshot-service.ts` - Added cache-busting headers and timestamp

**Code Changes:**

```typescript
async listSnapshots(limit: number = 30): Promise<SnapshotListItem[]> {
  // Add cache-busting timestamp to prevent stale data
  // Note: Using timestamp in URL is sufficient; custom headers cause CORS issues
  const timestamp = Date.now();
  const response = await this.apiCall(`/snapshots?limit=${limit}&_=${timestamp}`, {
    method: 'GET',
  });
  return response as SnapshotListItem[];
}
```

---

### 2. "Last Snapshot" Timestamp Doesn't Update After Manual Snapshot

**Problem:**  
After creating a manual snapshot, the "Last Snapshot" time displayed in the Auto Dashboard Snapshots section didn't update automatically.

**Root Cause:**  
The manual snapshot creation flow (`_handleManualSnapshot()`) created the snapshot but didn't update the last snapshot timestamp stored in localStorage. Only the automatic scheduler saved this timestamp.

**Solution:**

1. Added public method `updateLastSnapshotTime()` to the scheduler service
2. Called this method after manual snapshot creation
3. Notifies all listeners to refresh their displays

**Files Modified:**

- `src/services/uc-snapshot-scheduler-service.ts` - Added `updateLastSnapshotTime()` public method
- `src/editor/ultra-card-editor.ts` - Called `updateLastSnapshotTime()` after manual snapshot creation

**Code Changes:**

**Scheduler Service:**

```typescript
/**
 * Update last snapshot time (public method for manual snapshots)
 */
updateLastSnapshotTime(): void {
  this._saveLastSnapshotTime();
  this._notifyListeners();
}
```

**Editor:**

```typescript
// Create the snapshot
await ucSnapshotService.createSnapshot();

// Update the last snapshot timestamp
ucSnapshotSchedulerService.updateLastSnapshotTime();

// Refresh the scheduler status to update the display
await this._updateSnapshotSchedulerStatus();
```

---

## Testing Instructions

### Test 1: Snapshot List Refresh

1. **Open** Backup & Snapshot History modal in HA
2. **Note** the current snapshot list
3. **Close** the modal
4. **Create** a new manual snapshot
5. **Reopen** the modal
6. ✅ **Expected:** New snapshot appears with correct card count immediately

**Why it works:**  
Cache-busting forces a fresh API call every time the modal opens, bypassing browser cache.

---

### Test 2: Last Snapshot Time Update

1. **Open** Ultra Card Editor → Pro tab
2. **Note** the "Last Snapshot" time
3. **Click** "Perform Manual Dashboard Snapshot"
4. **Wait** for success notification
5. ✅ **Expected:** "Last Snapshot" time updates to "Just now" or current time

**Why it works:**  
The manual snapshot handler now explicitly saves the timestamp and notifies all status listeners.

---

## Deployment

### Files to Deploy:

1. **Frontend (Home Assistant):**

   ```
   ultra-card.js → /www/ultra-card/ultra-card.js
   ```

2. **Backend (Already Deployed):**
   ```
   ultra-card-integration.php (v1.2.4) - Already on server
   ```

### Deployment Steps:

1. **Copy frontend file to Home Assistant:**

   - Upload `ultra-card.js` to `/www/ultra-card/` (or your custom path)
   - Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
   - Refresh Home Assistant

2. **Verify backend is up-to-date:**
   - WordPress plugin should be v1.2.4
   - Check in WordPress → Plugins → Ultra Card Integration

---

## Expected Behavior After Fix

### Snapshot List:

- ✅ Shows correct card count (e.g., "35 cards")
- ✅ Updates immediately when reopening modal
- ✅ No stale cached data

### Last Snapshot Display:

- ✅ Updates after manual snapshot creation
- ✅ Updates after automatic snapshot creation
- ✅ Shows accurate "X hours ago" or "X minutes ago"

### Download:

- ✅ Works (already working)
- ✅ Produces valid JSON (already working)

### Restore:

- ✅ Works (already working)
- ✅ Restores all cards correctly (already working)

---

## Technical Details

### Cache-Busting Strategy

**Why Needed:**  
Browsers aggressively cache GET requests to improve performance. The snapshot API endpoint was being cached, causing stale "0 cards" data to persist.

**Solution Approach:**

1. **Timestamp Parameter:** `?_=1696365820000` - unique per request
2. **No Custom Headers:** Avoids CORS preflight complications
3. **No API Changes:** Works with existing WordPress backend

**Browser Compatibility:**  
Works on all modern browsers (Chrome, Firefox, Safari, Edge)

---

### Timestamp Update Flow

**Before Fix:**

```
Manual Snapshot → API Call → ✅ Success → ❌ No timestamp update → Display shows old time
```

**After Fix:**

```
Manual Snapshot → API Call → ✅ Success → ✅ Save timestamp → ✅ Notify listeners → Display updates
```

---

## Verification

### Check 1: Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Open snapshot modal
4. Look for snapshot API call
5. ✅ URL should include `?_=<timestamp>` parameter
6. ✅ No CORS errors in console

### Check 2: Console Logs

After creating manual snapshot, you should see:

```
📸 Starting manual dashboard snapshot...
✅ Snapshot created successfully
💾 Saved last snapshot time: 2025-10-03T20:48:19.759Z
✅ Manual snapshot completed successfully
```

---

## Rollback Plan

If issues occur:

1. **Frontend Rollback:**

   - Restore previous `ultra-card.js` file
   - Clear browser cache
   - Note: Cache-busting is additive, no breaking changes

2. **Backend Already Fixed:**
   - Keep WordPress plugin at v1.2.4
   - Base64 encoding is essential for snapshot integrity

---

## Related Files

### Frontend Files Modified:

- `src/services/uc-snapshot-service.ts` - Cache-busting
- `src/services/uc-snapshot-scheduler-service.ts` - Public timestamp update method
- `src/editor/ultra-card-editor.ts` - Call timestamp update after manual snapshot

### Backend Files (Already Fixed):

- `ultra-card-integration.php` (v1.2.4) - Base64 encoding for snapshots

### Build Output:

- `ultra-card.js` (2.0-beta3) - Production build with all fixes

---

## Summary

✅ **Snapshot list cache issue:** FIXED with cache-busting  
✅ **Last snapshot time not updating:** FIXED with explicit timestamp save  
✅ **Download/restore:** Already working  
✅ **WordPress backend:** Already fixed (v1.2.4)

**All snapshot functionality now working correctly!** 🎉

---

**Questions or Issues?**  
Contact: support@ultracard.io  
Frontend Version: 2.0-beta3  
Backend Version: 1.2.4  
Last Updated: October 3, 2025
