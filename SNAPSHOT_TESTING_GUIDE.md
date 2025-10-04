# 🧪 Snapshot System Testing Guide

## Quick Test (5 Minutes)

### Step 1: Upload & Login

1. Upload `/Users/wayne/Ultra Card/ultra-card.js` to Home Assistant
2. Refresh browser (hard refresh: Cmd+Shift+R)
3. Edit any Ultra Card
4. Go to **PRO** tab
5. Login with Pro credentials

**Expected Result:**

- ✅ Snapshot status section appears
- ✅ Shows "Auto-snapshots enabled" (or paused)
- ✅ Shows "Next Snapshot: Tomorrow at 3:00 AM"

---

### Step 2: Open Settings

1. Click the ⚙️ **Settings** button in snapshot section
2. Settings dialog opens

**Expected Result:**

- ✅ Toggle for "Enable Daily Auto-Snapshots"
- ✅ Time picker (24-hour format)
- ✅ Timezone selector
- ✅ "Next Snapshot" preview
- ✅ Storage policy info

---

### Step 3: Test Immediate Snapshot

1. In settings dialog, set time to **current time + 2 minutes**
   - e.g., If it's 2:15 PM now, set to **14:17**
2. Click **Save Settings**
3. Open browser console (F12)
4. Wait 2 minutes

**Expected Console Logs:**

```
⏰ Time to create auto-snapshot!
🤖 Creating automatic daily snapshot...
📸 Scanning dashboard for Ultra Cards...
✅ Auto snapshot created: X cards backed up
```

**Expected UI:**

- ✅ "Last Snapshot" updates to "Just now"
- ✅ "Next Snapshot" updates to "Tomorrow at 2:17 PM"

---

### Step 4: Verify WordPress Storage

1. Go to https://ultracard.io/wp-admin
2. Navigate to: **Ultra Card → Backups → Dashboard Snapshots**

**Expected Result:**

- ✅ New snapshot appears in list
- ✅ Shows date/time
- ✅ Shows card count
- ✅ Shows view breakdown

---

### Step 5: Test Settings Toggle

1. Go back to HA → PRO tab → ⚙️ Settings
2. **Uncheck** "Enable Daily Auto-Snapshots"
3. Save

**Expected Result:**

- ✅ Status shows "Auto-snapshots paused"
- ✅ "Next Snapshot" disappears
- ✅ Info shows "Auto-snapshots are currently disabled"

---

### Step 6: Test Logout

1. Click **Logout** in PRO tab
2. Check PRO tab

**Expected Result:**

- ✅ Snapshot status section disappears
- ✅ Console shows: `⏸️ Auto-snapshot scheduler stopped`

---

## 🐛 Troubleshooting

### Issue: "Loading snapshot status..." Doesn't Resolve

**Debug:**

```javascript
// In browser console:
const status = await ucSnapshotSchedulerService.getStatus();
console.log('Status:', status);
```

**Solution:**

- Check if logged in as Pro user
- Verify `ucSnapshotSchedulerService.start()` was called

---

### Issue: Snapshot Not Triggering

**Debug:**

```javascript
// Check settings:
const settings = await ucSnapshotService.getSettings();
console.log('Settings:', settings);

// Check last snapshot:
console.log('Last:', localStorage.getItem('ultra_card_last_auto_snapshot'));

// Manual trigger:
await ucSnapshotSchedulerService.triggerManualSnapshot();
```

**Solution:**

- Verify time is correct
- Check if already ran today
- Look for error logs in console

---

### Issue: Multiple Snapshots Created

**Debug:**

```javascript
// Clear last snapshot time to test:
localStorage.removeItem('ultra_card_last_auto_snapshot');
```

**Note:** Should only create ONE snapshot per day max.

---

### Issue: Settings Not Saving

**Debug:**

```javascript
// Test API directly:
const wordpressUrl = 'https://ultracard.io';
const authHeader = ucCloudAuthService.getAuthHeader();

const response = await fetch(`${wordpressUrl}/wp-json/ultra-card/v1/snapshots/settings`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: authHeader,
  },
  body: JSON.stringify({
    enabled: true,
    time: '03:00',
    timezone: 'UTC',
  }),
});

console.log('Response:', await response.json());
```

---

## 📊 Manual Testing Commands

### Check Current Status:

```javascript
const status = await ucSnapshotSchedulerService.getStatus();
console.log('🔍 Status:', {
  enabled: status.enabled,
  next: status.nextSnapshotTime?.toLocaleString(),
  last: status.lastSnapshotTime?.toLocaleString(),
  running: status.isRunning,
});
```

### Get All Snapshots:

```javascript
const snapshots = await ucSnapshotService.listSnapshots();
console.log('📸 Snapshots:', snapshots);
```

### Get Settings:

```javascript
const settings = await ucSnapshotService.getSettings();
console.log('⚙️ Settings:', settings);
```

### Force Snapshot Now:

```javascript
await ucSnapshotSchedulerService.triggerManualSnapshot();
console.log('✅ Snapshot triggered manually');
```

### Check Pro Status:

```javascript
const user = ucCloudAuthService.getCurrentUser();
console.log('👤 User:', {
  id: user?.id,
  username: user?.username,
  tier: user?.subscription?.tier,
  isPro: user?.subscription?.tier === 'pro',
});
```

---

## ✅ Success Criteria

**All checks must pass:**

- [ ] Snapshot status section visible in PRO tab (Pro users only)
- [ ] Settings dialog opens and saves successfully
- [ ] Snapshot triggers at scheduled time
- [ ] Snapshot appears in WordPress dashboard
- [ ] "Next Snapshot" time calculates correctly
- [ ] "Last Snapshot" time updates after creation
- [ ] Toggle on/off works
- [ ] Scheduler stops on logout
- [ ] Only one snapshot per day
- [ ] No errors in console

---

## 🎯 Edge Cases to Test

### 1. Timezone Changes

- Set timezone to PST
- Set time to 3:00 AM
- Verify snapshot runs at correct local time

### 2. Day Boundary

- Set time to 11:59 PM
- Wait until 12:01 AM
- Verify new snapshot can be created

### 3. Page Reload

- Set time to future
- Reload page
- Verify scheduler restarts
- Verify status persists

### 4. Multiple Cards Open

- Open 3 different Ultra Card editors
- All should show same snapshot status
- Trigger snapshot from one
- All should update

### 5. Offline/Online

- Go offline
- Wait for scheduled time
- Go back online
- Snapshot should trigger on next check

---

## 📝 Notes

- **localStorage** is used for tracking last snapshot (survives page reloads)
- **Scheduler checks every 60 seconds** (not resource-intensive)
- **Pro users only** - Free users never see scheduler
- **WordPress handles storage** - HA just sends data
- **30-day auto-pruning** happens on WordPress side
- **Silent failures** - won't interrupt user experience

---

Happy testing! 🚀
