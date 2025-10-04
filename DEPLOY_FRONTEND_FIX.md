# Quick Deploy: Snapshot Frontend Fixes

## 🎯 What This Fixes

1. ✅ **Snapshot list showing "0 cards"** → Will now show correct count (e.g., "35 cards")
2. ✅ **"Last Snapshot" time not updating** → Will update immediately after manual snapshots

---

## 📤 Deploy Steps (2 minutes)

### Step 1: Upload Updated Frontend File

**File to upload:**

```
ultra-card.js → /config/www/ultra-card/ultra-card.js
```

**Methods:**

- **File Editor:** Copy file to `/config/www/ultra-card/`
- **Samba/SSH:** Upload to `/config/www/ultra-card/`
- **HACS:** Wait for next Ultra Card release (or manual install)

---

### Step 2: Clear Browser Cache

**Hard Refresh:**

- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

**OR Clear Cache:**

1. Browser Settings → Clear Browsing Data
2. Select "Cached images and files"
3. Click "Clear data"

---

### Step 3: Test the Fixes

#### Test 1: Snapshot List

1. Open Ultra Card Editor → Pro tab
2. Open "Backup & Snapshot History"
3. ✅ **Check:** Does it show correct card counts? (not "0 cards")

#### Test 2: Last Snapshot Time

1. In Pro tab, look at "Auto Dashboard Snapshots" section
2. Note the "Last Snapshot" time
3. Click "Perform Manual Dashboard Snapshot"
4. Wait for success notification
5. ✅ **Check:** Did "Last Snapshot" update to current time?

---

## ✅ Expected Results

### Before Fix:

- ❌ Snapshot list shows "0 cards"
- ❌ Last snapshot time stuck on old time
- ✅ Download works
- ✅ Restore works

### After Fix:

- ✅ Snapshot list shows "35 cards across 4 views"
- ✅ Last snapshot time updates to current time
- ✅ Download works
- ✅ Restore works

---

## 🔍 Verify Fix Applied

### Check 1: Open Browser Console (F12)

After creating a manual snapshot, you should see:

```
📸 Starting manual dashboard snapshot...
💾 Saved last snapshot time: 2025-10-03T20:48:19.759Z
✅ Manual snapshot completed successfully
```

### Check 2: Network Tab

When opening snapshot modal:

- Look for API call to `/snapshots`
- URL should include `?_=<timestamp>` (cache-busting)

---

## 🐛 If Still Shows "0 cards"

### Quick Fixes:

1. **Hard refresh multiple times:** `Ctrl+Shift+R` 3 times
2. **Close and reopen modal:** Don't just refresh, close X button and reopen
3. **Check WordPress plugin version:** Should be v1.2.4 (already deployed)
4. **Create NEW snapshot:** Old snapshots may still show 0, new ones will show correct count

### Still Not Working?

**Check WordPress backend:**

1. Go to WordPress → Ultra Card Backups
2. Do snapshots show "35 cards" there?
3. If YES → Frontend cache issue, try incognito mode
4. If NO → Backend not updated, re-upload `ultra-card-integration.php` v1.2.4

---

## 📋 Files Deployed

| File                         | Location                  | Version   | Status              |
| ---------------------------- | ------------------------- | --------- | ------------------- |
| `ultra-card.js`              | `/config/www/ultra-card/` | 2.0-beta3 | 🆕 NEW              |
| `ultra-card-integration.php` | WordPress plugins         | 1.2.4     | ✅ Already deployed |

---

## 🎉 Success Checklist

```
□ Uploaded ultra-card.js to Home Assistant
□ Hard refreshed browser (Ctrl+Shift+R)
□ Snapshot list shows correct card counts
□ Last snapshot time updates after manual snapshot
□ Download still works
□ Restore still works
```

---

## 💡 What Changed Technically

### Change 1: Cache-Busting

Added timestamp to snapshot API calls to force fresh data:

```typescript
?_=1696365820000  // Unique timestamp prevents browser caching
```

**Note:** No custom HTTP headers used to avoid CORS preflight issues.

### Change 2: Timestamp Update

Manual snapshots now save the timestamp to localStorage and notify all listeners:

```typescript
ucSnapshotSchedulerService.updateLastSnapshotTime();
```

---

## 🔄 Quick Reference

| Action                 | Result                          |
| ---------------------- | ------------------------------- |
| Create manual snapshot | ✅ Updates "Last Snapshot" time |
| Reopen snapshot modal  | ✅ Shows fresh data (no cache)  |
| Download snapshot      | ✅ Already working              |
| Restore snapshot       | ✅ Already working              |

---

**Deploy Time:** ~2 minutes  
**Frontend Version:** 2.0-beta3  
**Backend Version:** 1.2.4 (already deployed)  
**Status:** Ready to deploy! 🚀
