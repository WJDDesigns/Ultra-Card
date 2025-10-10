# Deploy Cloud Session Sync - Step by Step Guide

## 🎯 Quick Deployment (5 Minutes)

### Step 1: Upload WordPress Plugin (2 mins)

1. **Go to:** ultracard.io/wp-admin/plugins.php
2. **Deactivate:** "Ultra Card Integration"
3. **Upload:** `/Users/wayne/Ultra Card/ultra-card-integration.php`
4. **Activate:** "Ultra Card Integration"

The plugin will **automatically create** the `wp_ultra_card_sessions` table.

### Step 2: Verify Database Table (30 seconds)

**phpMyAdmin or Database Tool:**

```sql
SHOW TABLES LIKE 'wp_ultra_card_sessions';
```

**Should see:** 1 table found ✅

**View structure:**

```sql
DESCRIBE wp_ultra_card_sessions;
```

**Should see:** 9 columns (id, session_id, user_id, user_data, device_id, device_name, created_at, last_validated, expires_at)

### Step 3: Deploy Frontend to Home Assistant (1 min)

**Option A - HACS (Recommended):**

- HACS will auto-update on next refresh
- Or manually: HACS → Custom repositories → Ultra Card → Redownload

**Option B - Manual:**

1. Copy `/Users/wayne/Ultra Card/ultra-card.js`
2. Upload to: `/config/www/ultra-card/ultra-card.js`
3. Add cache-busting parameter in dashboard: `?v=2.0-beta8`

### Step 4: Clear Cache & Test (1-2 mins)

**Desktop:**

```javascript
// Browser console (F12)
localStorage.clear();
location.reload();
```

**Mobile:**

- HA App → Settings → Clear Frontend Cache
- Or restart HA app

**Test:**

1. Login on desktop → Check console for session creation
2. Open mobile → Should auto-login (check console)
3. Logout on mobile → Desktop logs out within 30s

---

## ✅ Verification Checklist

After deployment, verify each item:

### WordPress Backend

- [ ] Plugin activated successfully
- [ ] Database table `wp_ultra_card_sessions` exists
- [ ] Table has 9 columns with correct structure
- [ ] REST API endpoint responds: `https://ultracard.io/wp-json/ultra-card/v1/session/create`
- [ ] Cron job registered: `wp_next_scheduled('ultra_card_cleanup_sessions')`

### Frontend Deployment

- [ ] `ultra-card.js` uploaded to Home Assistant
- [ ] Cache cleared on all devices
- [ ] Console shows: "✅ Cloud session sync enabled"
- [ ] Version shows: "🚀 Ultra Card v2.0-beta8"

### Functionality Tests

- [ ] Login on desktop creates session in database
- [ ] Console shows: "✅ Cloud session created: sess\_..."
- [ ] Mobile device auto-authenticates without login
- [ ] Console shows: "✅ Found active cloud session"
- [ ] PRO modules unlocked on mobile
- [ ] Logout on one device logs out both devices
- [ ] Session validation polling runs every 30 seconds

---

## 🔍 Testing Each Endpoint

### Test Session Create

**Desktop Console:**

```javascript
// After logging in, check:
fetch('https://ultracard.io/wp-json/ultra-card/v1/session/create', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    device_id: 'test123',
    device_name: 'Test Device',
  }),
})
  .then(r => r.json())
  .then(d => console.log('Session Create:', d));

// Expected: {success: true, session_id: "sess_...", expires_at: ...}
```

### Test Session Current

```javascript
fetch('https://ultracard.io/wp-json/ultra-card/v1/session/current', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer YOUR_JWT_TOKEN',
  },
})
  .then(r => r.json())
  .then(d => console.log('Current Session:', d));

// Expected: {success: true, session: {session_id: "...", user: {...}}}
```

### Test Session Validate

```javascript
fetch('https://ultracard.io/wp-json/ultra-card/v1/session/validate', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    session_id: 'sess_YOUR_SESSION_ID',
  }),
})
  .then(r => r.json())
  .then(d => console.log('Validate:', d));

// Expected: {success: true, valid: true, user: {...}}
```

### Test Session Logout

```javascript
fetch('https://ultracard.io/wp-json/ultra-card/v1/session/logout', {
  method: 'DELETE',
  headers: {
    Authorization: 'Bearer YOUR_JWT_TOKEN',
  },
})
  .then(r => r.json())
  .then(d => console.log('Logout:', d));

// Expected: {success: true, message: "Session invalidated"}
```

---

## 🚨 Common Issues & Fixes

### "Cloud session sync enabled" not showing

**Problem:** Old build deployed  
**Fix:** Force refresh with Ctrl+F5 (Cmd+Shift+R on Mac)

### "Failed to create cloud session"

**Problem:** Database table missing or REST API blocked  
**Fix:**

```sql
-- Manually create table
CREATE TABLE wp_ultra_card_sessions (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id varchar(64) NOT NULL,
  user_id bigint(20) UNSIGNED NOT NULL,
  user_data longtext NOT NULL,
  device_id varchar(255),
  device_name varchar(255),
  created_at datetime NOT NULL,
  last_validated datetime NOT NULL,
  expires_at datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY session_id (session_id),
  KEY user_id (user_id),
  KEY expires_at (expires_at)
);
```

### "No active cloud session found" when expected

**Problem:** Session expired or not created  
**Fix:**

```sql
-- Check if session exists
SELECT * FROM wp_ultra_card_sessions WHERE user_id = YOUR_USER_ID;

-- If exists but expired, shows expires_at < NOW()
-- If not exists, user needs to login on first device
```

### Device B still shows locked PRO modules

**Problem:** Cache not cleared or session not synced  
**Fix:**

1. Force refresh: Ctrl+F5
2. Clear localStorage: `localStorage.clear()`
3. Check console for cloud session messages
4. Verify JWT token is valid

---

## 📱 Mobile-Specific Notes

### iOS Home Assistant App

- Clear cache: Settings → Companion App → Reset Frontend Cache
- May need to restart app completely
- Check Console: Safari → Develop → Your iPhone → Home Assistant

### Android Home Assistant App

- Clear cache: Settings → Companion App → Clear Frontend Cache
- May need to force close and restart
- Check Console: Chrome → chrome://inspect → Your Device

---

## 🔄 Rollback Plan

If you need to disable cloud sync:

### Disable in Frontend Only:

Edit `src/services/uc-cloud-auth-service.ts`:

```typescript
constructor() {
  this._loadFromStorage();
  this._setupAutoRefresh();

  // DISABLED - Uncomment to re-enable
  // ucSessionSyncService.enable();

  this._checkCloudSession();
}
```

Rebuild: `npm run build`

### Complete Rollback:

1. Restore previous `ultra-card-integration.php`
2. Restore previous `ultra-card.js`
3. Optionally drop table: `DROP TABLE wp_ultra_card_sessions;`

Auth will work in localStorage-only mode (single device).

---

## 📞 Support

If issues persist:

1. **Check WordPress Debug Log:**

   ```bash
   tail -f wp-content/debug.log | grep "Ultra Card"
   ```

2. **Check Browser Console:** F12 → Console tab

3. **Check Database:**

   ```sql
   SELECT COUNT(*) FROM wp_ultra_card_sessions;
   ```

4. **Test Endpoints:** Use Postman or curl with your JWT token

---

## 🎊 Expected Experience

**Before:**

- Login on desktop ❌ Still locked on mobile
- Login on mobile ❌ Still locked on desktop
- Have to login on each device separately

**After:**

- Login on desktop ✅ **Mobile unlocks automatically!**
- Login on mobile ✅ **Desktop unlocks automatically!**
- Logout anywhere ✅ **All devices logout together!**

**True cross-device authentication sync is now live!** 🚀
