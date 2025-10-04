# Snapshot JSON Encoding Fix - v1.2.3

## Problem Identified

The snapshot corruption issue was caused by **insufficient JSON encoding** in the `create_snapshot()` function. The original code used:

```php
$json_data = json_encode($snapshot_data);
```

This basic encoding:

1. **Didn't handle special characters properly** - Jinja templates with `{% if ... %}`, backslashes, and Unicode characters could cause encoding issues
2. **Had no error checking** - If `json_encode()` failed, it would silently store `false` or `null`
3. **Lacked comprehensive logging** - Made it impossible to diagnose where the failure occurred

## Root Cause

Your Ultra Card configs contain complex Jinja2 templates like:

```
{% if states('weather.forecast_home') == 'rainy' %}mdi:weather-sunny{% else %}mdi:weather-rainy{% endif %}
```

Without proper JSON encoding flags, these special characters could cause:

- Encoding failures
- Data corruption during storage/retrieval
- Invalid JSON that couldn't be decoded

## The Fix

### 1. Proper JSON Encoding Flags

Now uses:

```php
$json_data = json_encode($snapshot_data,
    JSON_UNESCAPED_SLASHES |
    JSON_UNESCAPED_UNICODE |
    JSON_PARTIAL_OUTPUT_ON_ERROR
);
```

**Why these flags matter:**

- `JSON_UNESCAPED_SLASHES` - Prevents `\/` in URLs and Jinja templates
- `JSON_UNESCAPED_UNICODE` - Properly handles Unicode characters (emojis, special symbols)
- `JSON_PARTIAL_OUTPUT_ON_ERROR` - Provides partial data instead of complete failure

### 2. Error Checking

```php
if ($json_data === false || $json_data === null) {
    error_log('❌ CRITICAL: json_encode() FAILED!');
    error_log('   Error: ' . json_last_error_msg());
    wp_delete_post($post_id, true);
    return new WP_Error('json_encode_failed', 'Failed to encode snapshot data');
}
```

### 3. Comprehensive Verification Logging

The function now logs **every step** of the encoding and storage process:

- Input data validation
- JSON encoding success/failure
- Data size before and after storage
- Immediate retrieval and decode verification
- Size comparison to detect truncation

These logs will appear in `php_errorlog.txt` **ALWAYS** (not just when WP_DEBUG is true).

## Testing Steps

### 1. Upload the Updated Plugin

```bash
# Upload the updated ultra-card-integration.php to your WordPress site
# Location: wp-content/plugins/ultra-card-integration/
```

### 2. Restart the Plugin in WordPress Admin

1. Go to **Plugins** → **Installed Plugins**
2. **Deactivate** "Ultra Card Integration"
3. **Activate** "Ultra Card Integration"
4. Verify version shows **1.2.3**

### 3. Clear Any Corrupted Snapshots

In WordPress Admin:

1. Go to the Ultra Card dashboard
2. Delete any snapshots showing as "corrupted"

### 4. Create a New Test Snapshot

In Home Assistant:

1. Open the Ultra Card editor
2. Go to the **Snapshots** section
3. Click **"Create Manual Snapshot"**

### 5. Check the Logs

View `php_errorlog.txt` - you should now see **detailed logs** like:

```
✅ Snapshot post created: ID 738
📝 Encoding snapshot data to JSON...
  - Input card count: 35
  - Input has "views": YES
  - Input has "dashboard_path": YES (ultra-card-tests)
✅ JSON encoding successful
  - Encoded JSON size: 245678 bytes
  - Encoded JSON size (KB): 239.92 KB
💾 Storing snapshot data in post meta...
  - update_post_meta result: SUCCESS
✅ Metadata stored
🔍 VERIFYING saved data...
  - Retrieved meta value type: string
  - Retrieved JSON size: 245678 bytes
  - Sizes match? YES ✅
  - JSON decode successful? YES ✅
  - Has "cards" key? YES ✅
  - Cards in retrieved data: 35
```

### 6. Verify in WordPress

1. Go to the Ultra Card dashboard in WordPress
2. The snapshot should show:
   - **NOT corrupted**
   - Correct card count (35)
   - Correct dashboard name

### 7. Test Download

1. Click the **Download** button next to the snapshot
2. Should download a valid `.json` file
3. Open the file in a text editor - should be valid JSON

### 8. Test Restore

In Home Assistant:

1. Go to Ultra Card editor → Snapshots
2. Click **Restore** on the snapshot
3. Should successfully restore all 35 cards

## What to Look For

### ✅ Success Indicators

- Logs show "YES ✅" for all verification steps
- JSON sizes match before/after storage
- Snapshot shows correct card count in WordPress
- Download works and produces valid JSON
- Restore works in Home Assistant

### ❌ Failure Indicators (Report These)

- Logs show "NO ❌" or "MISMATCH!" anywhere
- JSON size difference after storage
- "json_encode() FAILED" errors
- "Retrieved data cannot be decoded" errors
- Snapshot still shows as corrupted

## Potential Issues & Solutions

### Issue: Data Size Mismatch

**Symptom:** Logs show different sizes for stored vs. retrieved data

**Cause:** Database column too small or `max_allowed_packet` MySQL limit

**Solution:**

```sql
-- Check the meta_value column type
DESCRIBE wp_postmeta;

-- Should be 'longtext' (4GB limit)
-- If it's 'text' (64KB limit), alter it:
ALTER TABLE wp_postmeta MODIFY meta_value LONGTEXT;
```

### Issue: JSON Encode Still Failing

**Symptom:** "json_encode() FAILED" with specific error message

**Solutions by Error:**

- **"Recursion detected"** - Circular reference in config (shouldn't happen with Ultra Card)
- **"Malformed UTF-8"** - Invalid characters in entity names or custom text
- **"Depth limit exceeded"** - Config nested too deeply (increase `ini_set('json_encode_depth', 1024)`)

### Issue: PHP Memory Limit

**Symptom:** Plugin crashes during snapshot creation, no complete logs

**Solution:**
Increase PHP memory limit in `wp-config.php`:

```php
define('WP_MEMORY_LIMIT', '512M');
define('WP_MAX_MEMORY_LIMIT', '512M');
```

## What Changed

**Files Modified:**

- `ultra-card-integration.php`
  - Line 6: Version bumped to `1.2.3`
  - Line 25: Constant version bumped to `1.2.3`
  - Lines 2370-2438: Complete rewrite of snapshot storage logic with proper encoding and verification

**No Changes Needed:**

- Frontend (Home Assistant) code - already working correctly
- Snapshot retrieval functions (`get_snapshot`, `format_backup_list_item`) - already have proper validation

## Next Steps

1. **Upload and test** the fix following the steps above
2. **Send me the new logs** from `php_errorlog.txt` after creating a test snapshot
3. **Report results**:
   - Does it show "YES ✅" for all verification steps?
   - Does WordPress show the snapshot correctly (not corrupted)?
   - Does download work?
   - Does restore work?

If it still fails, the detailed logs will now pinpoint **exactly where** and **why** it's failing, making it much easier to diagnose the next layer of the issue.
