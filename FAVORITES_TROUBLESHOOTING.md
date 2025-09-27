# Ultra Card Favorites Troubleshooting Guide

If your favorites are disappearing in Ultra Card, this guide will help you diagnose and fix the issue.

## Quick Diagnosis

Open your browser's developer console (F12) and run these commands to check your favorites status:

```javascript
// Check row favorites
debugUltraCardFavorites();

// Check favorite colors
debugUltraCardFavoriteColors();
```

## Common Causes & Solutions

### 1. Browser Storage Issues

**Symptoms:**

- Favorites disappear after browser restart
- Console shows "localStorage is not available" warnings
- Using incognito/private browsing mode

**Solutions:**

- **Exit incognito mode**: Favorites don't persist in private browsing
- **Clear browser cache selectively**: Don't clear "Site Data" or "Local Storage"
- **Check browser storage settings**: Ensure localStorage is enabled
- **Try a different browser**: Test if the issue persists

### 2. Storage Quota Exceeded

**Symptoms:**

- Console shows "localStorage quota exceeded" errors
- Favorites stop saving after reaching a certain number
- New favorites replace old ones unexpectedly

**Solutions:**

- **Clear old browser data**: Remove unused website data
- **Reduce favorites count**: Keep fewer than 50 favorites
- **Use browser storage cleaner**: Clear cache but preserve site data

### 3. Data Corruption

**Symptoms:**

- Favorites partially load then disappear
- Console shows "Invalid data format" warnings
- Some favorites work while others don't

**Solutions:**

- **Clear Ultra Card storage**: Run this in console:
  ```javascript
  localStorage.removeItem('ultra-card-favorites');
  localStorage.removeItem('ultra-card-favorite-colors');
  ```
- **Refresh the page**: Reload Ultra Card after clearing storage
- **Recreate favorites**: Add your favorites back manually

### 4. Browser Security Restrictions

**Symptoms:**

- Favorites work in some contexts but not others
- Issues with iframe embedding
- Problems in certain browser modes

**Solutions:**

- **Check iframe permissions**: Ensure proper embedding settings
- **Disable browser extensions**: Test with extensions disabled
- **Update browser**: Use the latest version of your browser

## Advanced Troubleshooting

### Check Storage Health

Run this comprehensive check in the browser console:

```javascript
// Check localStorage availability
function checkStorageHealth() {
  console.log('=== Storage Health Check ===');

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    console.log('✅ localStorage is working');
  } catch (error) {
    console.log('❌ localStorage error:', error);
  }

  // Check favorites data
  const favoritesData = localStorage.getItem('ultra-card-favorites');
  const colorsData = localStorage.getItem('ultra-card-favorite-colors');

  console.log('Favorites data size:', favoritesData ? favoritesData.length : 'none');
  console.log('Colors data size:', colorsData ? colorsData.length : 'none');

  // Check total storage usage
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  console.log('Total localStorage usage:', totalSize, 'characters');

  console.log('========================');
}

checkStorageHealth();
```

### Monitor Favorites in Real-Time

Add this code to monitor favorites changes:

```javascript
// Monitor favorites changes
window.addEventListener('storage', function (e) {
  if (e.key === 'ultra-card-favorites') {
    console.log('Favorites changed in another tab:', e.newValue ? 'added/updated' : 'removed');
  }
});

// Monitor custom events
window.addEventListener('ultra-card-favorites-changed', function () {
  console.log('Favorites changed in current tab');
});
```

## Prevention Tips

1. **Regular Backups**: Export your favorites periodically using the Ultra Card export feature
2. **Limit Favorites**: Keep the number of favorites reasonable (< 50)
3. **Browser Maintenance**: Regularly clear browser cache but preserve site data
4. **Update Browser**: Keep your browser updated for better storage support
5. **Avoid Private Mode**: Don't use incognito mode for persistent favorites

## Getting Help

If the issue persists after trying these solutions:

1. **Collect Debug Info**: Run the debug commands and save the console output
2. **Check Browser Console**: Look for any error messages
3. **Note Your Setup**: Browser version, operating system, and Home Assistant version
4. **Report the Issue**: Include the debug information when reporting the problem

## Storage Keys Used by Ultra Card

Ultra Card uses these localStorage keys:

- `ultra-card-favorites`: Saved row favorites
- `ultra-card-favorite-colors`: Saved color favorites
- `ultra-card-presets`: User-created presets
- `wp-presets-cache-*`: WordPress preset cache

Never manually edit these keys unless instructed to do so for troubleshooting.
