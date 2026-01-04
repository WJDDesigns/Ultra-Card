# Preset Ratings Deployment Guide

## Quick Deploy Checklist

### 1. Upload WordPress Plugin Updates

**File to upload**: `ultra-card-integration.php`

**Upload to**:

```
ultracard.io/wp-content/plugins/ultra-card-integration/
```

**What changed**:

- Added `ultra_card_register_preset_rating_fields()` function
- Added `ultra_card_get_preset_meta_with_ratings()` function
- Added `ultra_card_add_preset_cors_headers()` filter
- Extracts `_drts_voting_rating` meta and exposes as `rating` and `rating_count`

### 2. Deploy Ultra Card Frontend

**Files to deploy**:

```
ultra-card.js
ultra-card.js.LICENSE.txt
```

**Deploy via HACS or Manual**:

```bash
# Option A: Git tag for HACS
git add ultra-card.js ultra-card.js.LICENSE.txt dist/
git commit -m "feat: Add clickable star ratings to preset cards"
git tag v2.3.0-beta2
git push origin main --tags

# Option B: Manual copy to Home Assistant
cp ultra-card.js ~/homeassistant/www/ultra-card/
```

### 3. Verify WordPress Configuration

**Check these settings on ultracard.io**:

1. **Directories Pro is active**

   - Go to: Plugins → Installed Plugins
   - Ensure "Directories Pro" is activated

2. **Voting is enabled for presets**

   - Go to: Directories → Content Types → Presets
   - Check: "Enable Voting" is ON
   - Verify: Rating type is "Star Rating" (1-5)

3. **Post type is correct**

   - The post type slug should be `presets_dir_ltg`
   - Or update the PHP array to match your actual post type

4. **REST API is accessible**
   - Visit: `https://ultracard.io/wp-json/wp/v2/presets_dir_ltg`
   - Should return JSON (not 404 error)

### 4. Test the Integration

#### Test on WordPress Side

**Check if rating data is exposed**:

```bash
# Visit this URL in your browser
https://ultracard.io/wp-json/wp/v2/presets_dir_ltg/123?_embed=true

# Look for this in the response:
{
  "preset_meta": {
    "rating": 4.5,
    "rating_count": 12,
    "downloads": 45,
    ...
  }
}
```

#### Test in Ultra Card Editor

1. Open Home Assistant
2. Edit any Ultra Card
3. Go to **Presets** tab
4. Look for **Community** presets
5. **Verify**:
   - Stars appear in top right corner
   - Correct number of stars are filled/half/empty
   - Review count shows in parentheses
   - Hover effect works (stars scale, background changes)
   - Click opens preset page in new tab

## Troubleshooting Deployment

### Issue: Stars Don't Appear

**Symptom**: No stars show up on any presets

**Possible Causes**:

1. **WordPress plugin not activated**

   - Fix: Activate `ultra-card-integration.php` plugin
   - Check: WordPress admin → Plugins

2. **Post type mismatch**

   - Fix: Update `$post_types` array in PHP
   - Check: `get_post_type()` for a preset post
   - Add your actual post type to the array

3. **No ratings in database**

   - Fix: Add some test ratings via Directories Pro frontend
   - Check: Post meta for `_drts_voting_rating` field

4. **CORS blocking request**
   - Fix: Check browser console for CORS errors
   - Verify: `ultra_card_add_preset_cors_headers()` is running
   - Test: Add logging to the CORS function

**Debug Commands**:

```php
// Add to functions.php temporarily
add_action('init', function() {
    $post_types = get_post_types(array('public' => true));
    error_log('Available post types: ' . print_r($post_types, true));
});
```

### Issue: Stars Show Wrong Rating

**Symptom**: Stars don't match the actual rating

**Possible Causes**:

1. **Rating data format changed**

   - Check: Current `_drts_voting_rating` structure
   - Compare: With the expected format in `ultra_card_get_preset_meta_with_ratings()`
   - Update: PHP parsing logic if needed

2. **Caching issue**
   - Clear: Browser cache (Ctrl+F5)
   - Clear: Service worker cache
   - Clear: WordPress object cache

**Debug Commands**:

```php
// Check rating data for specific post
$post_id = 123;
$rating_data = get_post_meta($post_id, '_drts_voting_rating', true);
error_log('Rating data for post 123: ' . print_r(maybe_unserialize($rating_data), true));
```

### Issue: Click Doesn't Open Page

**Symptom**: Clicking stars does nothing

**Possible Causes**:

1. **preset_url is missing**

   - Check: WordPress REST response includes `link` field
   - Verify: `get_permalink()` returns valid URL

2. **Popup blocker**

   - Try: Allow popups from Home Assistant domain
   - Alternative: Use `window.location.href` instead of `window.open()`

3. **Event handler not firing**
   - Check: Browser console for JavaScript errors
   - Verify: Build completed successfully

**Debug Commands**:

```javascript
// Check in browser console
const preset = ucPresetsService.getPresetsByCategory('all')[0];
console.log('Preset URL:', preset.preset_url);
```

## Rollback Plan

If issues occur, you can quickly rollback:

### Rollback Frontend

```bash
# Revert to previous tag
git checkout v2.3.0-beta1
npm run build
cp ultra-card.js ~/homeassistant/www/ultra-card/
```

### Rollback Backend

```php
// Comment out the new functions in ultra-card-integration.php

/*
add_action('rest_api_init', 'ultra_card_register_preset_rating_fields');
function ultra_card_register_preset_rating_fields() { ... }

function ultra_card_get_preset_meta_with_ratings() { ... }

add_filter('rest_pre_serve_request', 'ultra_card_add_preset_cors_headers', 10, 4);
function ultra_card_add_preset_cors_headers() { ... }
*/
```

Then re-upload to WordPress.

## Monitoring After Deployment

### Check These Metrics

1. **Error Logs**

   - Location: `wp-content/debug.log`
   - Look for: "Ultra Card: Extracting rating"
   - Should see: Successful extractions for each preset

2. **API Requests**

   - Check: Browser Network tab
   - Endpoint: `/wp-json/wp/v2/presets_dir_ltg`
   - Response should include: `preset_meta.rating`

3. **User Engagement**
   - Monitor: Click-through rate to preset pages
   - Track: New ratings submitted
   - Measure: Preset downloads after ratings added

### Success Indicators

✅ Stars display correctly for all rated presets
✅ Clicking stars opens preset page
✅ No JavaScript console errors
✅ No PHP errors in debug.log
✅ Users can successfully rate presets
✅ New ratings update in real-time (after refresh)

## Production Deployment Steps

### Step-by-Step Process

1. **Backup Current State**

   ```bash
   # Backup WordPress plugin
   ssh ultracard.io
   cd wp-content/plugins/ultra-card-integration/
   cp ultra-card-integration.php ultra-card-integration.php.backup

   # Backup Ultra Card files
   cd ~/homeassistant/www/ultra-card/
   cp ultra-card.js ultra-card.js.backup
   ```

2. **Upload WordPress Changes**

   - Upload: `ultra-card-integration.php`
   - Method: FTP, cPanel, or SSH
   - Verify: Plugin still shows as active after upload

3. **Deploy Ultra Card Frontend**

   - Copy: `ultra-card.js` to Home Assistant
   - Clear: Browser cache
   - Refresh: Home Assistant page (Ctrl+F5)

4. **Test Immediately**

   - Open: Ultra Card editor
   - Navigate: Presets tab
   - Verify: Stars appear and are clickable

5. **Monitor Logs**

   ```bash
   # Watch WordPress logs
   tail -f wp-content/debug.log | grep "Ultra Card"

   # Watch Home Assistant logs
   tail -f home-assistant.log
   ```

6. **Announce to Users**
   - Post: Discord announcement
   - Update: Release notes
   - Document: In README.md

## Configuration Options

### WordPress Constants

Add to `wp-config.php` if you want verbose logging:

```php
define('ULTRA_CARD_DEBUG_RATINGS', true);
```

Then update the PHP function to check this constant.

### Home Assistant Options

Users can disable preset ratings if desired (future feature):

```yaml
# In card config
editor:
  show_preset_ratings: true # Default
```

## Support Resources

### If Users Report Issues

1. **Ask for screenshots** of the Presets tab
2. **Check browser console** for JavaScript errors
3. **Verify WordPress version** meets requirements
4. **Test with different browsers** (Chrome, Firefox, Safari)
5. **Check Directories Pro version** is up to date

### Common User Questions

**Q: Why don't I see stars on all presets?**
A: Stars only appear for Community presets that have ratings. Built-in and Default presets don't show ratings.

**Q: Can I rate directly from the editor?**
A: Not yet! Click the stars to open the preset page where you can rate. In-editor rating coming in future update.

**Q: How often do ratings update?**
A: Ratings are fetched when you open the Presets tab and cached for 5 minutes. Refresh the tab to see latest ratings.

**Q: Why are some stars half-filled?**
A: Half stars represent decimal ratings. For example, 4.7/5 shows as 4.5 stars (4 full + 1 half).

## Maintenance

### Regular Checks

**Weekly**:

- Monitor error logs for rating extraction failures
- Check API response times
- Verify CORS headers are working

**Monthly**:

- Review preset engagement metrics
- Update rating display based on user feedback
- Optimize caching if needed

**Quarterly**:

- Audit rating data integrity
- Check for Directories Pro updates that might change data structure
- Performance optimization review

## Version History

### v2.3.0-beta2 (January 2025)

- ✅ Added clickable star ratings to preset cards
- ✅ Integrated Directories Pro `_drts_voting_rating` extraction
- ✅ Added hover effects and animations
- ✅ Added review count badges
- ✅ Added comprehensive error handling and logging

### Future Versions

**v2.3.0-beta3** (Planned):

- [ ] In-editor rating modal
- [ ] Rating submission via API
- [ ] Filter by minimum rating
- [ ] Sort by "Top Rated"

**v2.3.0** (Stable Release):

- [ ] Fully tested rating system
- [ ] A/B tested optimal star placement
- [ ] Performance optimized
- [ ] Full documentation
