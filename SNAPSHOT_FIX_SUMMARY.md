# Snapshot View/Download/Restore Fix

## Issues Fixed

### 1. **Corrupted Snapshot Data Causing Frontend Errors**

**Problem:** When trying to restore snapshots, the frontend showed: `Failed to restore snapshot: Cannot read properties of null (reading 'cards')`

**Root Cause:** The WordPress backend functions (`format_backup_list_item()`, `get_snapshot()`, `restore_snapshot()`) were calling `json_decode()` on snapshot data but **never validating** if the decode succeeded. When JSON decode failed, they returned `null` which caused the frontend to crash.

**Fix:** Added comprehensive validation and error handling to all three functions:

- ✅ Check if snapshot data exists before decoding
- ✅ Validate `json_decode()` succeeded using `json_last_error()`
- ✅ Verify `cards` array exists in decoded data
- ✅ Return proper WP_Error responses with detailed error messages
- ✅ Add extensive debug logging to diagnose issues

### 2. **WordPress UI Unable to Display Snapshots**

**Problem:** Snapshots weren't showing properly in the WordPress dashboard

**Root Cause:** The `format_backup_list_item()` function would try to access `$snapshot_data['cards']` even when the data was null/corrupted

**Fix:** Added graceful error handling that returns corrupted/invalid markers:

- ✅ Snapshots with no data show as "Dashboard Snapshot (CORRUPTED)"
- ✅ Snapshots with decode errors show error message in stats
- ✅ Snapshots still appear in the list (not hidden)
- ✅ Card count shows 0 for corrupted snapshots

### 3. **Download Functionality Already Working**

**Status:** The download endpoint was previously fixed and is working correctly ✅

---

## Changes Made

### File: `ultra-card-integration.php`

#### 1. `format_backup_list_item()` - Lines 1525-1612

**Before:**

```php
$snapshot_data = json_decode($snapshot_data_json, true);
$card_count = count($snapshot_data['cards'] ?? []);
// No validation, crashes if decode fails
```

**After:**

```php
// Validate JSON exists
if (empty($snapshot_data_json)) {
    return array('name' => 'Dashboard Snapshot (CORRUPTED)', ...);
}

$snapshot_data = json_decode($snapshot_data_json, true);

// Validate decode succeeded
if ($snapshot_data === null || json_last_error() !== JSON_ERROR_NONE) {
    return array('name' => 'Dashboard Snapshot (CORRUPTED)', ...);
}

// Validate cards array exists
if (!isset($snapshot_data['cards']) || !is_array($snapshot_data['cards'])) {
    return array('name' => 'Dashboard Snapshot (INVALID)', ...);
}
```

#### 2. `get_snapshot()` - Lines 2416-2478

**Before:**

```php
$snapshot_data_json = get_post_meta($snapshot_id, 'snapshot_data', true);
$snapshot_data = json_decode($snapshot_data_json, true);
return rest_ensure_response(array('snapshot_data' => $snapshot_data));
// Returns null if decode fails
```

**After:**

```php
// Validate JSON exists
if (empty($snapshot_data_json)) {
    return new WP_Error('corrupted_snapshot', 'Snapshot data is missing', 500);
}

$snapshot_data = json_decode($snapshot_data_json, true);

// Validate decode succeeded
if ($snapshot_data === null || json_last_error() !== JSON_ERROR_NONE) {
    return new WP_Error('corrupted_snapshot', 'Failed to decode: ' . json_last_error_msg(), 500);
}

// Validate cards array exists
if (!isset($snapshot_data['cards']) || !is_array($snapshot_data['cards'])) {
    return new WP_Error('invalid_snapshot', 'Snapshot has no cards data', 500);
}

// Add debug logging
error_log("✅ Snapshot retrieved successfully: " . count($snapshot_data['cards']) . " cards");
```

#### 3. `restore_snapshot()` - Lines 2515-2592

**Same validation pattern as `get_snapshot()` with additional logging:**

- Logs snapshot ID and user
- Logs data size before decode
- Logs first 200 chars of JSON if decode fails
- Logs available keys if cards array missing
- Logs success with card count

#### 4. Version Bump

- Plugin header: `1.2.1` → `1.2.2`
- Version constant: `1.2.0` → `1.2.2`

---

## Testing Instructions

### Step 1: Upload Updated Plugin

1. Upload the fixed `ultra-card-integration.php` to your WordPress installation
2. Go to WordPress Admin → Plugins
3. **Deactivate** "Ultra Card Integration"
4. **Reactivate** "Ultra Card Integration"
5. This ensures WordPress picks up the new version `1.2.2`

### Step 2: Test Snapshot List (WordPress Dashboard)

1. Log in to your WordPress dashboard
2. Navigate to the Ultra Card Pro section
3. Look for the Snapshots/Backups list
4. **Expected:** All snapshots should now display
   - Valid snapshots show card counts and view breakdowns
   - Corrupted snapshots show "CORRUPTED" or "INVALID" markers
   - No more PHP errors in the logs

### Step 3: Test Snapshot Download (WordPress)

1. In the WordPress dashboard, find a valid snapshot
2. Click the "Download" button
3. **Expected:** JSON file downloads successfully
4. If corrupted: Will show error message instead of downloading

### Step 4: Test Snapshot Restore (Home Assistant)

1. Open Home Assistant
2. Go to an Ultra Card editor → Pro tab → Snapshots
3. Click "View Snapshots" button
4. Select a snapshot and click "Restore"
5. **Expected Results:**
   - **Valid snapshots:** Restore dialog shows card configs for all views
   - **Corrupted snapshots:** Clear error message: `"Failed to restore snapshot: Snapshot data is missing"` or `"Failed to decode snapshot data: [error]"`
   - **No more:** `Cannot read properties of null (reading 'cards')` error

### Step 5: Check Debug Logs

1. Look at `/Users/wayne/Ultra Card/php_errorlog.txt`
2. **Expected log entries:**

```
🔍 GET SNAPSHOT: ID 728, User 1
📦 Snapshot data size: 10240 bytes
✅ Snapshot 728 retrieved successfully: 35 cards
```

If a snapshot is corrupted:

```
🔍 GET SNAPSHOT: ID 999, User 1
❌ Snapshot 999 JSON decode failed: Syntax error
   JSON length: 5432 bytes
```

---

## Why Were Snapshots Corrupted?

The debug logs showed snapshots were **created successfully** with valid data. The corruption happened during **retrieval**, not storage. Possible causes:

1. **WordPress post meta truncation** - Very large JSON (>10KB) may have been truncated by MySQL
2. **Character encoding issues** - Special characters in card configs causing JSON corruption
3. **Memory limits** - PHP memory exhaustion during JSON decode

The new validation will **detect and report** exactly which snapshots are corrupted and why.

---

## Next Steps if Issues Persist

### If Specific Snapshots Are Corrupted:

1. Check the debug logs to see the specific error
2. If `json_decode()` error is "Syntax error" → Data was truncated
3. Solution: Delete corrupted snapshots and create fresh ones

### If All Snapshots Are Corrupted:

1. Check MySQL `wp_postmeta` table for `meta_key='snapshot_data'`
2. Verify the `meta_value` column type is `LONGTEXT` (not `TEXT`)
3. If it's `TEXT`, change to `LONGTEXT`:

```sql
ALTER TABLE wp_postmeta MODIFY meta_value LONGTEXT;
```

### If New Snapshots Are Still Corrupted:

1. Check PHP memory limit: `ini_get('memory_limit')`
2. Increase if needed: `ini_set('memory_limit', '256M')`
3. Check `json_encode()` errors during snapshot creation

---

## Summary

✅ **Fixed:** All three snapshot retrieval functions now validate data before returning
✅ **Fixed:** WordPress UI gracefully handles corrupted snapshots  
✅ **Fixed:** Frontend gets proper error messages instead of null data
✅ **Added:** Comprehensive debug logging for all snapshot operations
✅ **Improved:** Error messages now explain _what_ went wrong

**All snapshot functionality should now work correctly!** 🎉
