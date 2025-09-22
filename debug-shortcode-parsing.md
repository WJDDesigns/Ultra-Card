# Debug Shortcode Parsing Issue

## Current Problem:

- ✅ Shortcode is in WordPress API response
- ✅ Preset applies to Ultra Card
- ❌ Shows demo layout instead of actual preset design
- ❌ Entity shows `person.demo_user` instead of `person.ha_labs`

## Console Logs Show:

1. "Failed to parse layout for preset 517: SyntaxError" - Direct JSON parsing fails
2. "Decoded shortcode for preset 517" - Shortcode decoding works
3. "Converted row export to layout for preset 517" - Conversion works

## The Issue:

The shortcode parsing is working, but something in the layout structure isn't matching exactly what Ultra Card expects.

## Debug Steps:

1. **Check what the decoded shortcode contains**
2. **Verify the layout structure matches Ultra Card format**
3. **Ensure all required fields are present**

## Possible Causes:

- Missing required fields in the layout
- ID conflicts between presets
- Layout structure not matching current Ultra Card version
- Entity references not being preserved correctly

## Solution:

Need to add more detailed logging to see the exact layout structure being generated and compare it to what Ultra Card expects.
