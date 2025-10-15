# Gradient Support in Ultra Card Color Picker

## Overview

The Ultra Card color picker now supports CSS gradient values in addition to standard color formats. You can now enter linear gradients, radial gradients, and other CSS gradient functions directly into any color field.

## Supported Gradient Types

- `linear-gradient()`
- `radial-gradient()`
- `conic-gradient()`
- `repeating-linear-gradient()`
- `repeating-radial-gradient()`

## Example Usage

### Linear Gradient

```css
linear-gradient(180deg, rgba(133, 133, 133, 0.5) 46%, rgba(0, 0, 0, 1) 46%, rgba(0, 0, 0, 1) 100%)
```

### Radial Gradient

```css
radial-gradient(circle, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)
```

### Conic Gradient

```css
conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)
```

## How It Works

The color picker validates gradient syntax by:

1. Checking if the value contains the word "gradient"
2. Verifying it starts with a valid gradient function name
3. Ensuring it has proper parentheses syntax

## Special Handling for Gradients

Since gradients behave differently from single colors, the following special handling is in place:

### Transparency Slider

- **Disabled for gradients**: Gradients contain multiple colors with their own alpha values, so the transparency slider doesn't apply
- Gradients are returned as-is without transparency modifications

### Native Color Picker

- **Not available for gradients**: The browser's native color picker can't display gradients
- When a gradient is selected, the eyedropper tool defaults to a neutral color

### Preview Display

- Gradients are displayed correctly in the preview field
- The full gradient string is shown in the text input
- Contrast color calculation defaults to theme text color for gradients

## Files Modified

1. **src/components/ultra-color-picker.ts**

   - Updated `_isValidColor()` to accept gradient syntax
   - Updated `_extractTransparency()` to handle gradients
   - Updated `_getBaseColor()` to return gradients as-is
   - Updated `_applyTransparency()` to skip gradients
   - Updated `_getColorForNativeInput()` to handle gradients
   - Updated placeholder text to show gradient example

2. **src/services/uc-favorite-colors-service.ts**

   - Updated `_isValidColor()` to accept gradient syntax
   - Gradients can now be saved as favorite colors

3. **src/services/dynamic-color-service.ts**

   - Updated `isValidColor()` to accept gradient syntax
   - Templates can now return gradient values

4. **src/cards/ultra-card.ts** ⚠️ **CRITICAL FIX**
   - Changed `background-color` to `background` in `_getCardStyle()` method
   - This allows the card background to support gradients
   - **Why**: CSS `background-color` property only accepts solid colors, not gradients
   - Gradients require the `background` or `background-image` property

## Testing

To test gradient support:

1. Open any color picker field in the Ultra Card editor
2. Click to open the color palette
3. Type a gradient value in the text input field, for example:
   ```
   linear-gradient(90deg, #ff0000 0%, #0000ff 100%)
   ```
4. Click the checkmark to apply
5. The gradient should be validated and applied to the element

## Notes

- Gradient validation is intentionally permissive to allow for various gradient syntaxes
- Complex gradients with vendor prefixes are supported
- Gradients work with all color-related properties in Ultra Card
- You can save gradients as favorite colors for quick reuse

## Compatibility

This feature is compatible with all modern browsers that support CSS gradients (all current browsers).
