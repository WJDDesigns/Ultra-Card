# Ultra Card - Development Guide

This guide covers the fastest workflow for developing and testing Ultra Card with Home Assistant.

## Quick Start

```bash
# Start development with auto-deploy to Home Assistant
npm run watch:ha
```

That's it! Every time you save a file:

1. Webpack automatically rebuilds (~8-10 seconds)
2. The built file is auto-copied to your HA config
3. Just refresh your browser (F5) to see changes

**No Home Assistant restart needed!**

---

## Setup Requirements

### 1. Mount Your HA Config Volume

The auto-deploy feature expects your Home Assistant config to be mounted at:

```
/Volumes/config/www/community/Ultra-Card/
```

If your path is different, set the `HA_DEPLOY_PATH` environment variable:

```bash
HA_DEPLOY_PATH=/path/to/ha/www/community/Ultra-Card npm run watch:ha
```

### 2. Browser Cache Settings (One-Time Setup)

Home Assistant aggressively caches frontend resources. To see your changes immediately:

#### Option A: Chrome DevTools (Recommended)

1. Open Chrome DevTools (F12 or Cmd+Option+I on Mac)
2. Go to the **Network** tab
3. Check **"Disable cache"**
4. Keep DevTools open while developing

#### Option B: Hard Refresh

- **Mac:** Cmd + Shift + R
- **Windows/Linux:** Ctrl + Shift + F5

#### Option C: Clear Site Data

1. Open DevTools → Application tab
2. Click "Clear storage" in the left sidebar
3. Click "Clear site data"

---

## Available Scripts

| Script                 | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `npm run watch:ha`     | **Recommended** - Watch mode with auto-deploy to HA    |
| `npm run dev:ha`       | Alias for `watch:ha`                                   |
| `npm run watch`        | Watch mode (also auto-deploys if HA volume is mounted) |
| `npm run dev`          | Dev server with hot reload (localhost:8080)            |
| `npm run build`        | Production build                                       |
| `npm run build:deploy` | Build and deploy using deploy.js                       |

---

## Development Workflow

### Fastest Iteration (~10-15 seconds)

1. **Terminal 1:** Run `npm run watch:ha`
2. **Browser:** Open your HA dashboard with DevTools open (cache disabled)
3. **Editor:** Make changes and save
4. **Browser:** Press F5 to refresh

### What Happens on Save:

```
File saved
    ↓
Webpack detects change
    ↓
Rebuilds bundle (~8-10 sec)
    ↓
Auto-copies to /Volumes/config/www/community/Ultra-Card/
    ↓
Console shows: "✓ Auto-deployed to HA"
    ↓
Refresh browser to see changes
```

---

## Troubleshooting

### "HA deploy path not found"

- Make sure `/Volumes/config` is mounted
- Or set `HA_DEPLOY_PATH` to your actual path

### Changes not appearing after refresh

- Make sure DevTools is open with "Disable cache" checked
- Try a hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Clear site data in DevTools → Application

### Build errors

- Check the terminal for TypeScript errors
- Run `npm run lint` to see linting issues

### Auto-deploy not working

- Verify the target directory exists and is writable
- Check terminal output for error messages

---

## Advanced Options

### Custom Deploy Path

```bash
export HA_DEPLOY_PATH=/custom/path/to/Ultra-Card
npm run watch:ha
```

### Auto-Reload Card (Hands-Free Testing)

For completely hands-free testing, install `lovelace-auto-reload-card` via HACS:

- Automatically refreshes the dashboard every X seconds
- Great for testing on tablets or secondary displays

---

## Key Points

- **No HA restarts needed** - Custom cards are static files, just refresh the browser
- **Auto-deploy is built-in** - Webpack copies files automatically on every build
- **Keep DevTools open** - Essential for bypassing browser cache
- **~10-15 second iteration** - Down from 60-90 seconds with the old workflow
