# Enhanced Drag and Drop Functionality

## Overview

This PR enhances the Ultra Vehicle Card editor by adding drag and drop functionality directly within the Bars and Icons tabs, allowing users to reorder their bars and icon rows without having to switch to the Customize tab.

## Changes

### Bars Tab

- Added drag and drop functionality to reorder bars directly in the Bars tab
- Synchronized bar reordering with the Customize tab's sections_order
- Added visual drag handles and styling for improved user experience

### Icons Tab

- Enhanced the existing drag and drop for icon rows to better synchronize with the Customize tab
- Ensured icon row reordering properly updates both the icon_rows array and sections_order
- Added visual drag handles and styling consistent with other tabs

### Cross-Tab Synchronization

The implementation ensures that regardless of where a user rearranges elements (Customize tab, Bars tab, or Icons tab), the changes are correctly reflected across all tabs:

- When bars are reordered in the Bars tab, both the `bars` array and `sections_order` are updated
- When icon rows are reordered in the Icons tab, both the `icon_rows` array and `sections_order` are updated
- The Customize tab's existing logic for handling expanded sections is leveraged for consistent behavior

## How It Works

The synchronization relies on properly updating both the element arrays (`bars`, `icon_rows`) and the `sections_order` array that controls the overall layout:

1. When dragging in the Bars tab or Icons tab, the respective element arrays are reordered
2. If the `sections_order` uses specific references like `bar_0` or `icon_row_XYZ`, those entries are also reordered
3. Visual indicators show which element is being dragged and where it will be dropped

## Benefits for Users

- More intuitive editing experience - users can organize elements where they configure them
- Consistent behavior regardless of which tab is used for organizing the card
- Improved visual feedback during drag and drop operations
- Less jumping between tabs required for common layout adjustments

## Testing Recommendations

Testing should focus on verifying:

1. Bars can be reordered in the Bars tab with visual feedback
2. Icon rows can be reordered in the Icons tab with visual feedback
3. Changes made in any tab are properly reflected when switching to another tab
4. Edits to properties work correctly after reordering elements
