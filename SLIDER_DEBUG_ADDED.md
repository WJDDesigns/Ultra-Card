# Slider Debug Logging Added

## Overview

Added comprehensive debugging to the slider module to diagnose navigation issues. The slider was not changing pages when clicking arrows or pagination dots.

## Debug Points Added

### 1. Page Structure Logging

**Location**: `renderPreview()` method, after page grouping logic

Logs:
- `sliderId`: Unique identifier for the slider
- `totalModules`: Total number of modules in the slider
- `pageBreakCount`: Number of pagebreak modules found
- `pagesCount`: Number of pages created
- `modulesPerPage`: Array showing how many modules are on each page
- `moduleTypes`: Types of all modules in order

**Purpose**: Verify that pages are being grouped correctly from the module array.

### 2. Initialization Start

**Location**: Start of `initSwiper` function

Logs when Swiper initialization begins for a specific slider ID.

### 3. DOM Elements Detection

**Location**: After querying for pagination and navigation elements

Logs:
- Whether pagination element was found
- Whether next arrow element was found
- Whether previous arrow element was found
- Number of slides found in DOM

**Purpose**: Verify that all required DOM elements exist before initializing Swiper.

### 4. Swiper Configuration

**Location**: After calling `mapConfigToSwiper()`

Logs:
- Swiper modules being used (Navigation, Pagination, etc.)
- `slidesPerView` setting
- `loop` setting
- `autoHeight` setting
- Navigation enabled/disabled
- Pagination enabled/disabled
- Effect type (slide, fade, etc.)
- Direction (horizontal, vertical)

**Purpose**: Verify the configuration being passed to Swiper is correct.

### 5. Swiper Instance State

**Location**: After Swiper initialization

Logs:
- `activeIndex`: Current active slide index
- `slidesLength`: Total number of slides
- `realIndex`: Real index (for loop mode)
- `isBeginning`: Whether at first slide
- `isEnd`: Whether at last slide
- Loop parameter value
- SlidesPerView parameter value

**Purpose**: Verify Swiper initialized correctly with proper state.

### 6. Slide Change Events

**Location**: In `slideChange` event handler

Logs every time a slide changes:
- Current active index
- Real index (for loop mode)
- Previous index

**Purpose**: Confirm that Swiper is detecting and responding to navigation attempts.

### 7. Navigation Click Events

**Location**: Added event listeners to next/prev/pagination elements

Logs when:
- Next button is clicked (with current index and isEnd state)
- Previous button is clicked (with current index and isBeginning state)
- Pagination is clicked (with target element and current index)

**Purpose**: Verify that click events are being received by navigation elements.

### 8. Ref Callback

**Location**: In the `ref` directive callback

Logs:
- When ref callback is called
- Whether element has Swiper instance attached
- Whether element has initialization attribute
- When initialization is scheduled
- Warning if init function not found

**Purpose**: Track when and how often the ref callback executes and whether initialization happens.

## Bug Fixes Applied

### Loop Mode Fix

**Issue**: Swiper's loop mode requires at least 3 slides to work properly. With only 2 slides, navigation can break.

**Fix**: Automatically disable loop when there are fewer than 3 pages:

```typescript
loop: (sliderModule.loop ?? true) && pageCount >= 3
```

**Location**: `mapConfigToSwiper()` method, line ~1426

## How to Use Debug Logs

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Filter by `[Slider Debug]`** to see only slider-related logs
4. **Reload the card** to see initialization sequence
5. **Click navigation arrows/dots** to see interaction logs

## Expected Log Sequence

On successful initialization:
```
[Slider Debug] Page structure: {...}
[Slider Debug] Ref callback called: {...}
[Slider Debug] Scheduling init for: slider-xxx
[Slider Debug] Starting initialization for: slider-xxx
[Slider Debug] DOM elements found: {...}
[Slider Debug] Swiper options: {...}
[Slider Debug] Swiper initialized successfully: {...}
```

On navigation click:
```
[Slider Debug] Next button clicked: {...}
[Slider Debug] Slide changed: {...}
```

## Common Issues to Look For

1. **Pages not grouping correctly**: Check page structure log
2. **Missing DOM elements**: Check DOM elements found log
3. **Wrong configuration**: Check Swiper options log
4. **Navigation not working**: Check if click events are logged
5. **Slide not changing**: Check if slideChange event fires
6. **Loop issues**: Check if loop is enabled with < 3 slides

## Next Steps

After reviewing debug logs, you can:
1. Identify which step is failing
2. Check if Swiper is initializing at all
3. Verify configuration is correct
4. Confirm navigation elements exist
5. Test if events are being fired

## Removing Debug Logs

Once the issue is fixed, search for `[Slider Debug]` and remove or comment out the console.log statements.

## Version

Added in: **v2.1.0-beta8**

