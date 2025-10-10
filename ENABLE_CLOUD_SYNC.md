# How to Enable Cloud Session Sync

## Quick Start (Once Backend API is Ready)

### Step 1: Verify Backend API is Working

Test these endpoints are responding:

```bash
# Test session creation
curl -X POST https://ultracard.io/wp-json/ultra-card/v1/session/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test","device_name":"Test Device","user_id":123}'

# Should return: {"success":true,"session_id":"sess_..."}
```

### Step 2: Enable in Frontend

Edit `src/services/uc-cloud-auth-service.ts`:

**Find this (around line 75):**

```typescript
constructor() {
  this._loadFromStorage();
  this._setupAutoRefresh();

  // Check for active cloud session on initialization
  this._checkCloudSession();
}
```

**Change to:**

```typescript
constructor() {
  this._loadFromStorage();
  this._setupAutoRefresh();

  // ENABLE CLOUD SESSION SYNC
  ucSessionSyncService.enable();

  // Check for active cloud session on initialization
  this._checkCloudSession();
}
```

### Step 3: Rebuild & Deploy

```bash
cd "/Users/wayne/Ultra Card"
npm run build
# Deploy ultra-card.js to Home Assistant
```

### Step 4: Test Cross-Device Sync

1. **Clear cache on both devices**

   ```javascript
   // In browser console
   localStorage.clear();
   ```

2. **Login on Desktop**

   - Open Ultra Card editor
   - Go to PRO tab
   - Login with credentials
   - Check console for: `✅ Cloud session created`

3. **Open Mobile Device**

   - Navigate to dashboard with Ultra Card
   - Check console for: `✅ Found active cloud session`
   - PRO features should work automatically

4. **Test Logout Sync**
   - Logout on mobile
   - Within 30 seconds, desktop should logout automatically
   - Check console for: `⚠️ Session invalidated remotely`

## Console Messages Reference

### Success Messages (Cloud Sync Working):

```
✅ Cloud session sync enabled
🔄 Creating cloud session...
✅ Cloud session created: sess_abc123xyz
🔄 Attempting to save to HA storage: ultra-card-pro-auth
✅ Saved to HA storage: ultra-card-pro-auth
🔄 Checking for active cloud session...
✅ Found active cloud session, syncing authentication
🔄 Starting session validation polling
✅ Cloud session invalidated
```

### Error Messages (Backend Not Ready):

```
⚠️ Failed to create cloud session, using local-only mode: [error details]
⚠️ Failed to fetch cloud session: [error details]
```

If you see error messages, the backend API needs fixes.

## Troubleshooting

### "Failed to create cloud session"

- **Check:** Backend API endpoint responding
- **Check:** JWT token valid
- **Check:** WordPress REST API enabled
- **Check:** CORS headers configured

### "No active cloud session found"

- **Check:** User actually logged in on other device
- **Check:** Session not expired (max 7 days)
- **Check:** Database table exists and has data

### "Session invalidated remotely" (unexpected)

- **Check:** Session validation endpoint returning correct data
- **Check:** Database session record not corrupted
- **Check:** Session hasn't actually expired

### PRO modules still locked after auto-login

- **Check:** Console shows "Found active cloud session"
- **Check:** Subscription data included in session response
- **Check:** JWT token in session is valid

## Disabling Cloud Sync (Rollback)

If you need to disable cloud sync:

Edit `src/services/uc-cloud-auth-service.ts`:

```typescript
constructor() {
  this._loadFromStorage();
  this._setupAutoRefresh();

  // DISABLED - Backend not ready yet
  // ucSessionSyncService.enable();

  // Check for active cloud session on initialization
  this._checkCloudSession();
}
```

Rebuild and deploy. Auth will work in localStorage-only mode.

## Performance Impact

- **Polling:** Every 30 seconds per device
- **API Calls:** ~2 requests/minute per authenticated device
- **Data Transfer:** <1KB per request
- **Server Load:** Minimal (simple SELECT query)

With 100 active PRO users:

- ~200 requests/minute to validation endpoint
- Easily handled by WordPress/MySQL

## Security Notes

1. **Session Hijacking Protection:**

   - Device ID tracked with each session
   - Can implement device verification on critical actions

2. **Token Security:**

   - JWT tokens stored server-side only
   - Not exposed in localStorage on client

3. **Session Expiry:**

   - Auto-expires after 7 days inactivity
   - Can be invalidated immediately by user

4. **Concurrent Sessions:**
   - Multiple devices can share same session
   - Optional: Add device limit per user

## Advanced Configuration

### Change Polling Interval

Edit `src/services/uc-session-sync-service.ts`:

```typescript
private static readonly POLL_INTERVAL = 30000; // Change to desired ms
```

### Change Session Expiry

Edit backend API session creation to use different expiry time:

```php
// Default: 7 days
$expires_at = date('Y-m-d H:i:s', strtotime('+7 days'));

// Change to 30 days:
$expires_at = date('Y-m-d H:i:s', strtotime('+30 days'));
```

### Add Device Limit

In backend API, check active sessions count before creating new one:

```php
$active_sessions = count_user_sessions($user_id);
if ($active_sessions >= 5) {
    return new WP_Error('too_many_devices', 'Maximum 5 devices allowed');
}
```

## Monitoring

### Check Active Sessions

Query database:

```sql
SELECT
  session_id,
  user_id,
  device_name,
  created_at,
  last_validated,
  expires_at
FROM wp_ultra_card_sessions
WHERE expires_at > NOW()
ORDER BY last_validated DESC;
```

### Clean Up Expired Sessions

Manual cleanup:

```sql
DELETE FROM wp_ultra_card_sessions
WHERE expires_at < NOW();
```

Set up cron job to run this daily.

## Support

If issues persist after following this guide:

1. Check browser console for detailed error messages
2. Check WordPress error logs
3. Verify all 4 API endpoints are responding correctly
4. Test with Postman to isolate frontend vs backend issues

---

**Once enabled, users will experience seamless cross-device authentication without any manual intervention!**
