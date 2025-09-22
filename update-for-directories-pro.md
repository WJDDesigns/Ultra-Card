# Update Ultra Card for Directories Pro

## Files to Replace:

### 1. Replace src/services/uc-presets-service.ts

- **Backup current file** (rename to `uc-presets-service-old.ts`)
- **Rename** `uc-presets-service-updated.ts` to `uc-presets-service.ts`

### 2. Update import in any files that import the old API

The main file that needs updating is the layout-tab.ts, but it should automatically work with the new service.

## Quick Steps:

1. **In your file explorer:**

   - Rename `src/services/uc-presets-service.ts` to `src/services/uc-presets-service-old.ts`
   - Rename `src/services/uc-presets-service-updated.ts` to `src/services/uc-presets-service.ts`

2. **The new service will:**

   - Use `directoriesProPresetsAPI` instead of `wordpressPresetsAPI`
   - Fetch from `/presets_dir_ltg` endpoint
   - Handle Directories Pro data structure
   - Include all your enhancements (word limiting, Read More, etc.)

3. **Test:**
   - Open Ultra Card editor
   - Go to presets tab
   - Should now load from Directories Pro

## WordPress Snippet for Directories Pro:

Make sure you've updated your WordPress snippet to use the Directories Pro version from the migration guide, with:

- Post type: `presets_dir_ltg`
- Post ID: `517` (your new Directories Pro preset)
- Enhanced field detection

## Expected Result:

After these changes, Ultra Card will:

- ✅ Load presets from Directories Pro (`presets_dir_ltg`)
- ✅ Show your "Person Badge" preset in Badges tab
- ✅ Display truncated descriptions with Read More button
- ✅ Open ultracard.io preset pages when Read More is clicked
- ✅ Show "Default" badge for your presets

The integration will be fully migrated to Directories Pro!
