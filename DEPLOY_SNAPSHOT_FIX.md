# Deploy Snapshot Fix v1.2.4 - Quick Reference

## 🎯 What Was Fixed

**Issue:** Snapshots appeared as "corrupted" due to WordPress escaping special characters in Jinja templates  
**Solution:** Base64 encoding prevents WordPress from corrupting the JSON data  
**Status:** ✅ **FIXED** in version 1.2.4

---

## 📦 Files to Upload

Upload these files to your WordPress installation:

### Required:

```
ultra-card-integration.php → wp-content/plugins/ultra-card-integration/
```

### Optional (for diagnostics):

```
diagnose-snapshot.php → WordPress root directory (same folder as wp-config.php)
```

---

## ⚡ Quick Deploy Steps

1. **Backup Current Plugin** (optional safety measure):

   ```bash
   # Download current ultra-card-integration.php before replacing
   ```

2. **Upload Fixed Plugin:**

   - Via WordPress Admin: Plugins → Upload → Replace
   - Via FTP: Upload to `wp-content/plugins/ultra-card-integration/`
   - Via SSH: `scp ultra-card-integration.php user@site:/path/to/wp-content/plugins/ultra-card-integration/`

3. **No Restart Needed** - Changes take effect immediately

4. **Test Immediately:**
   - Create new snapshot in Home Assistant
   - Verify not corrupted in WordPress
   - Test download button

---

## ✅ Quick Test Checklist

```
□ Upload plugin file
□ Create new manual snapshot from HA
□ Check WordPress - should NOT say "CORRUPTED"
□ Click download button - should download valid JSON
□ Test restore in HA - should restore all cards
```

**Expected Result:** All 5 items checked = Success! ✅

---

## 🔍 How to Verify Fix Applied

### Check Plugin Version:

1. WordPress Admin → Plugins
2. Find "Ultra Card Integration"
3. Version should show **1.2.4**

### Check Logs (when creating snapshot):

Look for this line in WordPress error logs:

```
🔐 Base64 encoding JSON to prevent WordPress corruption...
```

If you see this line, the fix is active.

---

## 🗑️ Clean Up Old Snapshots

**Old corrupted snapshots cannot be recovered.**

They were corrupted during storage and must be deleted:

1. WordPress Admin → Ultra Card Backups
2. Find snapshots marked "CORRUPTED" (including #737)
3. Click "Delete" on each one
4. Create fresh snapshots to replace them

---

## 📊 What Changed Technically

### Storage (Create Snapshot):

```php
// OLD v1.2.3 (BROKEN)
json_encode() → store → WordPress escapes → ❌ CORRUPTED

// NEW v1.2.4 (FIXED)
json_encode() → base64_encode() → store → ✅ SAFE
```

### Retrieval (View/Download/Restore):

```php
// NEW v1.2.4
get_post_meta() → base64_decode() → json_decode() → ✅ VALID
```

### Backward Compatibility:

```php
// Tries base64 first, falls back to legacy format
if (base64_decode fails) {
    try_legacy_format()
}
```

---

## 📝 Reference Documentation

- **Full Technical Details:** `SNAPSHOT_CORRUPTION_FIX.md`
- **Step-by-Step Testing:** `TEST_SNAPSHOT_FIX.md`
- **Diagnostic Tool:** `diagnose-snapshot.php` (upload to WP root)

---

## 🆘 Troubleshooting

### Still Showing as Corrupted?

1. Verify plugin version is 1.2.4
2. Delete old snapshot (#737)
3. Create NEW snapshot
4. Clear WordPress cache

### Download Still Fails?

1. Make sure you're logged into WordPress
2. Try clicking download from the list (not typing URL)
3. Check WordPress error logs

### Restore Fails in HA?

1. Check browser console (F12) for errors
2. Make sure it's a NEW snapshot (created after fix)
3. Verify Pro login is active

---

## 🎉 Success Indicators

You'll know it worked when:

✅ New snapshots show as "Dashboard Snapshot" (not corrupted)  
✅ Download button produces valid JSON file  
✅ Restore button works in Home Assistant  
✅ Card count shows correctly (e.g., "35 cards")  
✅ File size displays (e.g., "421.52 KB")

---

## 🔒 Security Note

The `diagnose-snapshot.php` script is only for diagnostics. After confirming snapshots work:

**Optional:** Delete `diagnose-snapshot.php` from your WordPress root  
**Reason:** Reduces attack surface (admin-only script not needed in production)

---

## 📞 Support

If issues persist:

1. Check WordPress PHP error logs
2. Check browser console (F12) in HA
3. Run diagnostic script with snapshot ID
4. Contact: support@ultracard.io

Include:

- WordPress PHP error logs
- Browser console errors
- Snapshot ID being tested
- Plugin version (should be 1.2.4)

---

**Version:** 1.2.4  
**Released:** October 3, 2025  
**Compatibility:** All WordPress versions 5.0+  
**Breaking Changes:** None (backward compatible)
