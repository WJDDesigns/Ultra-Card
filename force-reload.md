# Force Home Assistant to Reload Ultra Card

## Quick Fix Steps:

1. **Clear Browser Storage** (run in browser console):

```javascript
// Remove debug flag
localStorage.removeItem('uc_debug_3p');
// Clear all UC related storage
Object.keys(localStorage)
  .filter(k => k.includes('uc_'))
  .forEach(k => localStorage.removeItem(k));
```

2. **Force Home Assistant Resource Reload**:

   - Go to: **Settings** → **Dashboards** → **Resources** (three dots menu, top right)
   - Find `ultra-card.js` in the list
   - Click on it to edit
   - Add `?v=2` to the end of the URL (or increment if already there)
   - Example: `/local/ultra-card.js?v=2`
   - Click **Update**

3. **Clear and Reload**:
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or: Open DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"

## Alternative: Full Cache Clear

If the above doesn't work:

1. **Home Assistant Profile**:

   - Click your user icon (bottom left)
   - Enable "Advanced Mode" if not already
   - Look for "Clear Cache" option
   - Click it and confirm

2. **Browser Full Clear**:
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Clear for "Last hour" or "Last 24 hours"

## Verify Success

After reloading, check console - you should see:

- ✅ `🚀 Ultra Card v2.0-beta21 22 modules` (this stays)
- ❌ No `[UC-3P]` messages (these should be gone)

## Re-enable Debug (if needed later)

To re-enable debug logging for testing:

```javascript
// In browser console:
localStorage.setItem('uc_debug_3p', '1');
// Or
window.__UC_DEBUG_3P = true;
```
