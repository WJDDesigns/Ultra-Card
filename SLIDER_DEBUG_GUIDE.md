# Slider Auto-Play Debug Guide

## What We Added

I've added comprehensive logging to track exactly what's happening with the slider auto-play timer. This will help us identify why the timing is still inconsistent.

## How to Test

1. **Reload Home Assistant** to get the new build with logging
2. **Open browser console** (F12 or right-click → Inspect → Console)
3. **Watch your slider** with auto-play enabled at 1000ms

## What to Look For in the Console

The logs are prefixed with `[SLIDER xxxxxxxx]` where `xxxxxxxx` is the first 8 characters of the slider ID.

### Key Log Messages:

1. **`renderPreview called (render #X)`**

   - Shows how often the component is re-rendering
   - If this number increases rapidly, we have excessive re-renders
   - Example: `[SLIDER 12345678] renderPreview called (render #5, auto_play: true, delay: 1000ms)`

2. **`Auto-play check`**

   - Shows the conditions for starting auto-play
   - Example: `[SLIDER 12345678] Auto-play check: enabled=true, existingTimer=false, initialized=false`

3. **`Initializing auto-play`**

   - Should appear ONCE per slider instance
   - If you see this multiple times, the initialization flag isn't working
   - Example: `[SLIDER 12345678] Initializing auto-play (will start in 100ms)`

4. **`Timer SET`**

   - Shows when a timer is created
   - Shows total active timers count
   - **Critical**: Should be 1 per slider. If you see more, we have a problem!
   - Example: `[SLIDER 12345678] Timer SET (active timers: 1)`

5. **`Auto-play timer FIRED`**

   - Shows when the timer actually fires
   - **Watch the timing between these messages** - should be consistent at 1000ms
   - Example: `[SLIDER 12345678] Auto-play timer FIRED (1000ms interval)`

6. **`Slide change`**
   - Shows actual slide transitions with timing
   - **Most important metric** - time since last change should match delay
   - Example: `[SLIDER 12345678] Slide change: 0 -> 1 (1000ms since last change)`

## What We're Diagnosing

### Scenario 1: Multiple Timers Being Created

**Symptoms:**

```
[SLIDER 12345678] renderPreview called (render #1)
[SLIDER 12345678] Initializing auto-play
[SLIDER 12345678] Timer SET (active timers: 1)
[SLIDER 12345678] renderPreview called (render #2)
[SLIDER 12345678] Initializing auto-play    ← BAD: Should say "already initialized"
[SLIDER 12345678] Timer SET (active timers: 2)    ← BAD: Should be 1
```

**Meaning:** Initialization flag isn't working, multiple timers are being created

### Scenario 2: Configuration Not Persisting

**Symptoms:**

```
[SLIDER 12345678] renderPreview called (render #1, auto_play: true, delay: 1000ms)
[SLIDER 12345678] renderPreview called (render #2, auto_play: true, delay: 3000ms)
```

**Meaning:** The delay value is changing between renders (falling back to default 3000ms)

### Scenario 3: Timers Being Cleared and Recreated

**Symptoms:**

```
[SLIDER 12345678] Timer CLEARED
[SLIDER 12345678] Starting auto-play with 1000ms delay
[SLIDER 12345678] Timer SET (active timers: 1)
... happens repeatedly
```

**Meaning:** Something is triggering timer restarts (manual navigation, config changes)

### Scenario 4: Correct Behavior

**Expected logs:**

```
[SLIDER 12345678] renderPreview called (render #1, auto_play: true, delay: 1000ms)
[SLIDER 12345678] Auto-play check: enabled=true, existingTimer=false, initialized=false
[SLIDER 12345678] Initializing auto-play (will start in 100ms)
[SLIDER 12345678] Initialized flag set to: true
[SLIDER 12345678] Starting auto-play with 1000ms delay
[SLIDER 12345678] Timer SET (active timers: 1)
[SLIDER 12345678] renderPreview called (render #2, auto_play: true, delay: 1000ms)
[SLIDER 12345678] Auto-play check: enabled=true, existingTimer=true, initialized=true
[SLIDER 12345678] Auto-play already initialized, skipping    ← GOOD!
[SLIDER 12345678] Auto-play timer FIRED (1000ms interval)
[SLIDER 12345678] Slide change: 0 -> 1 (1000ms since last change)    ← GOOD!
[SLIDER 12345678] Auto-play timer FIRED (1000ms interval)
[SLIDER 12345678] Slide change: 1 -> 2 (1000ms since last change)    ← GOOD!
```

## Next Steps

1. **Capture the logs** - Let the slider run for 10-15 seconds and copy all `[SLIDER]` logs
2. **Share the logs** - Paste them so we can analyze what's happening
3. **Note the behavior** - What timing intervals are you actually seeing?

## What to Report

Please provide:

- ✅ Full console logs with `[SLIDER]` prefix
- ✅ What interval you configured (should be 1000ms)
- ✅ What actual timing you're observing (e.g., "fires at 8s, then 5s, then 10s")
- ✅ How many sliders are on your card
- ✅ Whether you're in the editor or viewing the actual card

This detailed logging will help us pinpoint exactly where the timing issue is occurring!
