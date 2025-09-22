# Verify API Integration Issue

## Problem:

Ultra Card is not pulling correct data from Directories Pro API. Console logs show it's still getting empty shortcodes and no images.

## Debugging Steps:

### 1. Check Browser Console for API URL

You should see this message when presets load:

```
Fetching WordPress presets from Directories Pro: https://ultracard.io/wp-json/wp/v2/presets_dir_ltg?per_page=50&sort=popular&_embed=true
```

If you see this instead, it's using the old API:

```
Fetching WordPress presets from: https://ultracard.io/wp-json/wp/v2/gd_presets?...
```

### 2. Clear Browser Cache

- **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
- **Clear browser cache** completely
- **Try incognito/private browsing** to bypass cache

### 3. Verify Build Process

If you're using a build process (webpack, etc.):

- **Rebuild Ultra Card** to pick up the new API service
- **Check if dist files** are updated with new code

### 4. Check Import Issues

The `directories-pro-presets-api.ts` file might not be properly imported.

## Quick Fix:

Try renaming the old `wordpress-presets-api.ts` file to `wordpress-presets-api.ts.old` to force Ultra Card to use the new Directories Pro API.

## Expected Result:

After fixing, you should see:

- Correct API URL in console logs
- Real shortcodes being loaded
- Images displaying in preset cards
- Correct categories and tags for each preset
