# Rating Update Instructions for Ultra Card

## ✅ What's Been Updated

### 1. **WordPress Snippet Updated**

- **File**: `UPDATED_RATING_DIRECTORIES_PRO_SNIPPET.php`
- **New Features**:
  - ✅ Extracts rating from `_drts_voting_rating` field
  - ✅ Extracts rating count (number of votes)
  - ✅ Improved gallery image extraction
  - ✅ Better error handling for nested arrays

### 2. **Frontend Code Updated**

- **File**: `src/services/directories-pro-presets-api.ts`

  - ✅ Added `rating_count` field to interface
  - ✅ Properly maps rating and rating count from API

- **File**: `src/editor/tabs/layout-tab.ts`
  - ✅ Shows rating count alongside rating (e.g., "4.5 (12)")
  - ✅ Only shows count if more than 1 vote

## 🔧 What You Need to Do

### Step 1: Update WordPress Snippet

Replace your current WordPress snippet with the content from:
**`UPDATED_RATING_DIRECTORIES_PRO_SNIPPET.php`**

### Step 2: Test the Integration

1. **Check a preset with ratings** in your WordPress admin
2. **Verify the API response** includes the rating data
3. **Check the Ultra Card interface** shows ratings properly

## 📊 Rating Data Structure

The snippet now properly extracts from this structure:

```php
_drts_voting_rating = array (
  0 => array (
    '' => array (
      'count' => 1,           // Number of votes
      'sum' => '5',          // Total sum of ratings
      'average' => '5',      // Average rating (what we display)
      'last_voted_at' => 1758592062,
      'count_init' => 0,
      'sum_init' => '0',
      'level' => 5,
    ),
  ),
)
```

## 🎯 Expected Results

After updating, you should see:

- ✅ **Ratings displayed** for community presets (e.g., "⭐ 4.5")
- ✅ **Vote counts shown** when multiple votes (e.g., "⭐ 4.5 (12)")
- ✅ **Gallery images** working in the new slider
- ✅ **Better error handling** for malformed data

## 🐛 Troubleshooting

If ratings don't appear:

1. **Check WordPress logs** for any PHP errors
2. **Test the API endpoint** directly: `/wp-json/wp/v2/presets_dir_ltg`
3. **Verify the field name** `_drts_voting_rating` exists in your setup
4. **Check if ratings are enabled** in Directories Pro settings

## 📝 Notes

- **Only community presets** show ratings (WJD Designs presets don't)
- **Rating count only shows** if there's more than 1 vote
- **Ratings are on a 1-5 scale** (displayed with 1 decimal place)
- **Gallery images** are now properly extracted and work with the new slider
