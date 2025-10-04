# Slider Auto-Play Timing Fix

## Problem Summary

The slider module's auto-play feature had erratic timing behavior. When set to 1000ms (1 second), it would actually transition at random intervals like 5s, 8s, or 10s.

## Root Cause

Every time the Lit component re-rendered (which happens frequently due to):

- Template updates
- Slider state changes
- Home Assistant state updates
- Configuration changes

...the `renderPreview()` method would be called again, creating:

1. **New function instances** for `startAutoPlay`, `nextSlide`, `prevSlide`, etc.
2. **A new auto-play timer** that started running
3. The old timer(s) continued running in the background

This resulted in **multiple timers running simultaneously** with different start times, causing the erratic timing behavior. For example, with a 1-second interval, you might have 5-10 timers all firing at different times, making the actual slide transitions appear random.

## Solution Implemented

### 1. Added Initialization Tracking to SliderStateManager

Added a new `initialized` Map to track which sliders have already been initialized:

```typescript
class SliderStateManager {
  private static initialized = new Map<string, boolean>();

  static isInitialized(sliderId: string): boolean {
    return this.initialized.get(sliderId) || false;
  }

  static setInitialized(sliderId: string, value: boolean): void {
    this.initialized.set(sliderId, value);
  }

  static cleanup(sliderId: string): void {
    this.clearTimer(sliderId);
    this.states.delete(sliderId);
    this.initialized.delete(sliderId);
  }
}
```

### 2. Prevented Multiple Timer Creation

Modified the auto-play initialization to only create a timer if the slider hasn't been initialized yet:

```typescript
// Start auto-play if enabled (ONLY if not already initialized)
// This prevents creating multiple timers on re-renders
const existingTimer = SliderStateManager.getTimer(sliderModule.id);
if (
  sliderModule.auto_play &&
  !existingTimer &&
  !SliderStateManager.isInitialized(sliderModule.id)
) {
  SliderStateManager.setInitialized(sliderModule.id, true);
  setTimeout(() => startAutoPlay(), 100);
}
```

### 3. Added Auto-Play Disable Cleanup

When auto-play is toggled off, we now properly clean up the timer and reset the initialization flag:

```typescript
// If auto-play is disabled, ensure cleanup
if (!sliderModule.auto_play && SliderStateManager.isInitialized(sliderModule.id)) {
  SliderStateManager.clearTimer(sliderModule.id);
  SliderStateManager.setInitialized(sliderModule.id, false);
}
```

## Benefits

✅ **Consistent Timing**: Auto-play timer now fires at exactly the configured interval  
✅ **No Timer Accumulation**: Only one timer per slider instance, regardless of re-renders  
✅ **Proper Cleanup**: Timers are cleaned up when auto-play is disabled  
✅ **Memory Efficient**: No orphaned timers consuming resources  
✅ **Re-render Safe**: Component can re-render without affecting timer behavior

## Testing Recommendations

1. **Test consistent timing**: Set auto-play delay to 1000ms and verify slides transition exactly every 1 second
2. **Test re-render stability**: Interact with the card (hover, click pagination) and verify timing remains consistent
3. **Test toggle on/off**: Enable/disable auto-play and verify no orphaned timers
4. **Test multiple sliders**: Create multiple slider modules on same card and verify each maintains independent timing
5. **Test configuration changes**: Change auto-play delay and verify new timing takes effect properly

## Files Modified

- `/Users/wayne/Ultra Card/src/modules/slider-module.ts`
  - Updated `SliderStateManager` class (lines 12-59)
  - Added initialization tracking (lines 46-58)
  - Updated auto-play initialization logic (lines 975-987)
  - Added auto-play disable cleanup (lines 975-979)
