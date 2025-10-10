# Cloud Session Sync API Specification

## Overview

Cross-device authentication sync using server-side session management at ultracard.io.

## Backend API Endpoints (To Be Implemented)

### 1. Create Session

**Endpoint:** `POST /wp-json/ultra-card/v1/session/create`

**Purpose:** Store user session on server after successful login

**Request Headers:**

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "device_id": "unique-device-identifier",
  "device_name": "Chrome on Desktop",
  "user_id": 123
}
```

**Response:**

```json
{
  "success": true,
  "session_id": "sess_abc123xyz",
  "expires_at": 1234567890
}
```

### 2. Get Current Session

**Endpoint:** `GET /wp-json/ultra-card/v1/session/current`

**Purpose:** Retrieve active session for current user (used by other devices to sync)

**Request Headers:**

```
Authorization: Bearer {jwt_token}
```

**Response:**

```json
{
  "success": true,
  "session": {
    "session_id": "sess_abc123xyz",
    "user": {
      "id": 123,
      "username": "user",
      "email": "user@example.com",
      "displayName": "User Name",
      "token": "jwt_token_here",
      "refreshToken": "refresh_token_here",
      "expiresAt": 1234567890,
      "subscription": {
        "tier": "pro",
        "status": "active"
      }
    },
    "created_at": 1234567890,
    "last_validated": 1234567890
  }
}
```

**Response (No Active Session):**

```json
{
  "success": false,
  "message": "No active session found"
}
```

### 3. Validate Session

**Endpoint:** `POST /wp-json/ultra-card/v1/session/validate`

**Purpose:** Check if session is still valid and update last validated time

**Request Headers:**

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "session_id": "sess_abc123xyz"
}
```

**Response:**

```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": 123,
    "subscription": {
      "tier": "pro",
      "status": "active"
    }
  }
}
```

### 4. Logout (Invalidate Session)

**Endpoint:** `DELETE /wp-json/ultra-card/v1/session/logout`

**Purpose:** Invalidate current session (affects all devices)

**Request Headers:**

```
Authorization: Bearer {jwt_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Session invalidated"
}
```

## Database Schema (WordPress)

### Table: `wp_ultra_card_sessions`

```sql
CREATE TABLE wp_ultra_card_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL UNIQUE,
  user_id BIGINT UNSIGNED NOT NULL,
  jwt_token TEXT NOT NULL,
  refresh_token TEXT,
  device_id VARCHAR(255),
  device_name VARCHAR(255),
  created_at DATETIME NOT NULL,
  last_validated DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  INDEX user_id_idx (user_id),
  INDEX session_id_idx (session_id),
  INDEX expires_at_idx (expires_at)
);
```

## Frontend Implementation Strategy

### Session Flow

1. **Login on Device A:**

   ```
   User logs in → Get JWT token → Create cloud session → Store session_id locally
   ```

2. **Auto-sync on Device B:**

   ```
   Device B loads → Check local session_id → If none, poll for active session
   → Found active session → Get user data from cloud → Auto-authenticated
   ```

3. **Session Validation:**

   ```
   Every 30 seconds → Validate session → If invalid, logout locally
   ```

4. **Logout:**
   ```
   User logs out → Invalidate cloud session → All devices detect on next validation
   ```

### Storage Strategy

**Local Storage Keys:**

- `ultra-card-session-id` - Lightweight session identifier
- `ultra-card-cloud-auth` - Full user data (cached, validated against cloud)

**Sync Polling:**

- Check every 30 seconds if session is still valid
- If session becomes invalid, trigger logout on all devices
- If new session is found (user logged in elsewhere), sync user data

## Security Considerations

1. **Session Expiry:** Sessions expire after 7 days of inactivity
2. **Token Refresh:** JWT tokens refreshed automatically before expiry
3. **Device Limit:** Optional limit on concurrent sessions per user
4. **Session Hijacking:** Validate device_id on critical operations
5. **Cleanup:** Expired sessions cleaned up daily via cron job

## Error Handling

### Frontend Fallback

If cloud session API is unavailable:

- Continue using localStorage-only mode
- Log warning but don't break functionality
- Retry cloud sync on next app load

### Session Conflicts

If multiple devices create sessions simultaneously:

- Server keeps most recent session
- Older sessions receive "session replaced" on validation
- User notified and can re-authenticate

## Implementation Priority

### Phase 1 (Backend - Required First)

1. Create database table
2. Implement session/create endpoint
3. Implement session/current endpoint
4. Implement session/validate endpoint
5. Implement session/logout endpoint
6. Add session cleanup cron job

### Phase 2 (Frontend)

1. Create session sync service
2. Update auth service to use sessions
3. Add session polling
4. Add cross-device logout detection
5. Update UI to show active devices (future enhancement)

## Testing Checklist

- [ ] Login on device A, verify session created
- [ ] Load device B, verify auto-login from cloud session
- [ ] Logout on device A, verify device B logs out on next poll
- [ ] Token refresh works across devices
- [ ] Session expires after 7 days
- [ ] Expired sessions cleaned up properly
- [ ] Multiple simultaneous logins handled gracefully
- [ ] Fallback to localStorage if API unavailable
