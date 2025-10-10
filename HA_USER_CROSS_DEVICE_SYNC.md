# Home Assistant User-Based Cross-Device Sync

## Overview

Implemented "magic" cross-device PRO authentication using Home Assistant user context. Users only need to log in once, and all devices with the same HA user are automatically authenticated.

## What Changed

### Key Features

1. **90-Day Sessions with Sliding Expiration**

   - Sessions last 90 days from last use (not 7 days)
   - Every time user accesses a card, session extends by another 90 days
   - Active users essentially never need to re-login

2. **Home Assistant User ID Integration**

   - Sessions are keyed by HA user ID, not just WordPress user
   - All devices logged into the same HA instance share PRO status
   - No WordPress login required on additional devices

3. **Automatic Cross-Device Sync**
   - Login on desktop → phone/TV automatically unlocked
   - Works on TVs, tablets, phones without any manual login
   - True "magic" experience

## Technical Implementation

### Backend (WordPress)

**File:** `ultra-card-integration.php`

1. **Database Schema Update**

   - Added `ha_user_id` column to `wp_ultra_card_sessions` table
   - Migration function automatically adds column to existing installations

2. **Session Expiration Updated**

   - Changed from 7 days to 90 days in `create_session()`
   - Added sliding expiration in `validate_session()` - extends session on each validation

3. **Session Creation**

   - Now requires and stores `ha_user_id` from request
   - Sessions looked up by both WordPress user + HA user

4. **Session Retrieval**
   - `/session/current` endpoint now accepts `?ha_user_id={id}` parameter
   - Looks up session by HA user ID (for cross-device magic)
   - Falls back to JWT token authentication if HA user ID not provided

### Frontend (TypeScript)

**Files:**

- `src/services/uc-cloud-auth-service.ts`
- `src/services/uc-session-sync-service.ts`

1. **HA User ID Extraction**

   - Added `_getHassUserId()` method to extract user ID from `window.hass.user.id`
   - Available in all Home Assistant contexts

2. **Session Creation**

   - `createSession()` now accepts and sends `ha_user_id` to WordPress
   - Called automatically after successful login

3. **Session Retrieval**

   - `getCurrentSession()` now sends `ha_user_id` as query parameter
   - Devices can retrieve session without JWT token using HA user ID

4. **Automatic Cross-Device Check**
   - On card load, extracts HA user ID from context
   - Calls `/session/current?ha_user_id={id}`
   - If session found, auto-authenticates without any user interaction

## User Experience

### First Login (Any Device)

1. User opens card editor
2. Clicks "Login to PRO"
3. Enters WordPress credentials
4. Card automatically extracts HA user ID
5. Session created with 90-day expiration

### Other Devices (Automatic)

1. User opens HA dashboard (already logged into HA)
2. Card loads, extracts HA user ID automatically
3. Retrieves session from cloud using HA user ID
4. PRO features unlocked - no login prompt!

### Session Maintenance

- Every time user views a card, session validates
- Validation extends expiration by another 90 days
- Active users never need to re-login
- Inactive for 90 days? Must authenticate again

## Security

- Sessions tied to BOTH WordPress user AND HA user
- HA user IDs are UUIDs (hard to guess)
- All devices must be logged into same HA instance
- Sessions expire after 90 days of inactivity
- Logout on one device invalidates session for all devices

## Migration

Existing installations automatically upgraded:

1. `ultra_card_add_ha_user_id_column()` migration function
2. Called during plugin activation
3. Adds column if it doesn't exist
4. Safe to run multiple times

## Files Modified

### WordPress Backend

- `ultra-card-integration.php`
  - Database table schema (added `ha_user_id` column)
  - Migration function
  - Session expiration (7 days → 90 days)
  - Sliding expiration logic
  - Session creation (accepts `ha_user_id`)
  - Session retrieval (supports `ha_user_id` lookup)

### Frontend

- `src/services/uc-cloud-auth-service.ts`

  - Added `_getHassUserId()` method
  - Updated `login()` to extract and pass HA user ID
  - Updated `_checkCloudSession()` to pass HA user ID

- `src/services/uc-session-sync-service.ts`
  - Updated `createSession()` signature to accept `haUserId`
  - Updated `getCurrentSession()` to send `ha_user_id` as query param

## Deployment

### WordPress

1. Upload `ultra-card-integration.php` to WordPress
2. Plugin automatically runs migration on activation
3. Existing sessions will work but won't have HA user ID
4. New logins will create sessions with HA user ID

### Frontend

1. Copy `ultra-card.js` to Home Assistant
2. Hard refresh browser caches
3. Feature automatically enabled

## Testing

1. **Desktop Login:** Log into PRO on desktop browser
2. **Phone Test:** Open HA on phone (should auto-unlock)
3. **TV Test:** Open HA on TV/cast device (should auto-unlock)
4. **Expiration Test:** Wait 30 seconds, verify session still valid
5. **Logout Test:** Logout on phone, verify desktop locks within 30 seconds

## Console Output

### Desktop (First Login)

```
🔄 Checking for active cloud session...
📭 No active cloud session found
🔄 Creating cloud session...
✅ Cloud session created: sess_abc123
🔄 Starting session validation polling
✅ Successfully logged in
```

### Phone (Automatic Sync)

```
🔄 Checking for active cloud session...
✅ Retrieved active cloud session
✅ Found active cloud session, syncing authentication
🔄 Starting session validation polling
```

## Benefits

✅ No WordPress login on additional devices
✅ Works on TVs, phones, tablets automatically
✅ 90-day sessions with sliding expiration
✅ No separate HA integration needed
✅ Secure (tied to HA user + WordPress account)
✅ Logout syncs across all devices
✅ Active users essentially never need to re-login

## Future Enhancements

- Admin setting to configure session duration
- Device management UI (view/revoke sessions per device)
- Session activity tracking
- Email notifications on new device login
