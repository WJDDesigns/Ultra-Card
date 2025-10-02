# Ultra Card Pro - Critical Fixes Needed

## Issue 1: Services Not Initialized ❌

**Problem:** New snapshot services aren't initialized with WordPress URL
**Location:** `src/editor/ultra-card-editor.ts` line ~3117
**Fix:** Add initialization after login

## Issue 2: Tab Naming ❌

**Problem:** Need "Builder" instead of "Layout Builder" and add new "Pro" tab
**Location:** `src/editor/ultra-card-editor.ts`
**Fix:** Rename tab + add Pro tab

## Issue 3: WordPress Dashboard Shows Same Data ❌

**Problem:** All backup types (auto/snapshot/manual) show same data
**Location:** `ultra-card-integration.php` - `render_panel_content` method
**Fix:** Update to query correct post types based on panel link

## Issue 4: Naming Consistency ❌

**Problem:** Need clear distinction between:

- **Dashboard Snapshots** (full dashboard, all cards)
- **Manual Card Backups** (single card backup)

**Locations to update:**

- WordPress panel names
- Modal tabs
- Translation keys
- UI labels

---

## Priority Order:

1. Fix service initialization (blocking)
2. Fix WordPress dashboard queries (blocking)
3. Update naming/labels (UX)
4. Add Pro tab (enhancement)
