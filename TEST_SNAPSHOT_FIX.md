# Quick Test Guide: Snapshot Fix v1.2.4

## 1. Upload the Fixed Plugin

1. Upload the updated `ultra-card-integration.php` to your WordPress site:

   ```
   Path: wp-content/plugins/ultra-card-integration/ultra-card-integration.php
   ```

2. **OR** if using FTP, replace the file directly

3. No need to deactivate/reactivate - changes take effect immediately

---

## 2. Delete Old Corrupted Snapshots (Optional)

Old corrupted snapshots (like #737) **cannot be recovered** because the corruption happened during storage.

1. Go to WordPress Admin → Ultra Card Backups
2. Find any snapshots marked as "CORRUPTED"
3. Click "Delete" on each one
4. These were already corrupted and can't be fixed

---

## 3. Create a New Test Snapshot

### From Home Assistant:

1. Open your Ultra Card editor
2. Go to the **Pro** tab
3. Scroll to **Dashboard Snapshots**
4. Click **"Create Manual Snapshot"**
5. Wait for success message: ✅ "Manual snapshot created successfully"

---

## 4. Verify in WordPress

### Check WordPress Backend:

1. Go to WordPress Admin → Ultra Card Backups
2. Find the newly created snapshot (should be at the top)
3. **Verify it shows:**
   - ✅ "Dashboard Snapshot" (NOT "CORRUPTED")
   - ✅ Correct card count (e.g., "35 cards")
   - ✅ File size showing (e.g., "421.52 KB")

---

## 5. Test Download

1. In WordPress backups list, find your new snapshot
2. Click the **"Download"** button
3. ✅ **Expected:** A JSON file downloads (e.g., `ultra-card-snapshot-2025-10-03-161905.json`)
4. Open the file in a text editor
5. ✅ **Expected:** Valid JSON with your card configurations

**If it fails:** Check browser console and WordPress PHP error logs

---

## 6. Test Restore (in Home Assistant)

1. Go back to Home Assistant
2. Open Ultra Card editor → Pro tab → Dashboard Snapshots
3. Click **"Restore"** on your test snapshot
4. ✅ **Expected:** Success message with card count
5. ✅ **Expected:** All cards visible in the dashboard

**If it fails:** Check browser console (F12) for error messages

---

## 7. Test View (Optional)

1. In WordPress backups list
2. Click **"View"** button on your snapshot
3. ✅ **Expected:** Modal showing snapshot details and card list

_(Note: View feature may still show "coming soon" - this is separate from the corruption fix)_

---

## What Changed (Technical)

### Before (v1.2.3 - BROKEN):

```
WordPress stored JSON → Added slashes → Corrupted special chars → ❌ Syntax error
```

### After (v1.2.4 - FIXED):

```
JSON → Base64 encode → WordPress stores safely → Base64 decode → ✅ Valid JSON
```

**Base64 encoding** protects your Jinja templates and special characters from WordPress's automatic escaping.

---

## Expected WordPress Logs

If you want to verify behind the scenes, check your WordPress error logs. You should see:

```
========================================
Ultra Card: CREATE SNAPSHOT DEBUG
========================================
✅ Snapshot post created: ID 738
📝 Encoding snapshot data to JSON...
✅ JSON encoding successful
  - Encoded JSON size: 431632 bytes
🔐 Base64 encoding JSON to prevent WordPress corruption...
  - Base64 encoded size: 575510 bytes
💾 Storing snapshot data in post meta...
  - update_post_meta result: SUCCESS
🔍 VERIFYING saved data...
  - Sizes match? YES ✅
🔓 Decoding base64...
  - Decoded JSON size: 431632 bytes
  - JSON decode successful? YES ✅
  - Has "cards" key? YES ✅
  - Cards in retrieved data: 35
========================================
Ultra Card: SNAPSHOT CREATED SUCCESSFULLY
========================================
```

---

## Troubleshooting

### Snapshot Still Shows as Corrupted

**Possible Causes:**

1. ❌ Old snapshot (created before fix) - **Delete and create new one**
2. ❌ Plugin file not updated - **Verify version 1.2.4 in WordPress → Plugins**
3. ❌ Caching issue - **Clear WordPress cache, refresh browser**

### Download Returns 404 Error

**Possible Causes:**

1. ❌ Not logged into WordPress - **Log in first**
2. ❌ Wrong snapshot ID - **Click download from the list, don't type URL manually**
3. ❌ Permission issue - **Verify you're the snapshot owner**

### Restore Fails in Home Assistant

**Check Console (F12) for errors:**

- `Failed to decode snapshot data` → Old corrupted snapshot, create new one
- `No snapshot_data found` → Backend issue, check WordPress logs
- `Access denied` → Login to Pro tab again

---

## Success Criteria ✅

You'll know the fix worked when:

1. ✅ New snapshot appears as **"Dashboard Snapshot"** (not corrupted)
2. ✅ Download button works and produces valid JSON file
3. ✅ Restore button works and restores all cards
4. ✅ No "Syntax error" messages in console or logs
5. ✅ Snapshot size shows correctly (e.g., "421.52 KB")

---

## Clean Up

After confirming everything works:

1. **Keep** `ultra-card-integration.php` (v1.2.4)
2. **Keep** `SNAPSHOT_CORRUPTION_FIX.md` (for reference)
3. **Optional:** Delete `diagnose-snapshot.php` (was only for diagnostics)
4. **Optional:** Delete old corrupted snapshots from WordPress

---

## Next Steps

Once verified working:

1. ✅ Use snapshots normally - corruption is permanently fixed
2. ✅ Manual snapshots will work reliably
3. ✅ Auto-snapshots will work reliably (if Pro user)
4. ✅ Download/restore will work for all future snapshots

**Note:** Old corrupted snapshots (#737 and earlier) cannot be recovered. They were corrupted during storage and must be deleted. Create new snapshots to replace them.

---

**Need Help?**  
If issues persist after following this guide:

1. Check WordPress PHP error logs
2. Check browser console (F12) in Home Assistant
3. Verify plugin version is 1.2.4
4. Contact support@ultracard.io with error logs
