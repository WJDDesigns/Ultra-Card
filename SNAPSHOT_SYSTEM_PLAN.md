# Ultra Card Pro Snapshot System - Complete Architecture

## Overview

Transform from individual card backups to full dashboard snapshot system with smart restore.

---

## Core Concepts

### 1. Auto Snapshot (Daily Full Dashboard)

**What it does:** Captures ALL Ultra Cards across entire dashboard once per day

**Storage Structure:**

```
ultra_snapshot (post type)
├── snapshot_type: 'auto'
├── snapshot_date: '2025-01-15'
├── card_count: 15
├── view_data: JSON {
│   "views": [
│     {
│       "view_id": "home",
│       "view_title": "Home",
│       "cards": [
│         {
│           "card_index": 0,
│           "card_id": "ultra-card-1",
│           "config": {...compressed...},
│           "card_name": "Living Room",
│           "stats": {rows: 3, columns: 4, modules: 12}
│         }
│       ]
│     }
│   ]
}
├── total_size_kb: 450
├── scheduled_time: '03:00'
├── created_timestamp: Unix timestamp
```

**Retention:** 30 days, auto-prune oldest

**User Settings:**

- Preferred time (default 3 AM)
- Enable/disable auto snapshots
- Timezone

### 2. Manual Card Backup (Single Card)

**What it does:** User manually saves one specific card

**Storage Structure:**

```
ultra_card_backup (post type)
├── backup_type: 'manual'
├── card_name: 'Living Room Card' (auto-generated or user-named)
├── config_json: {...compressed...}
├── config_hash: MD5
├── card_stats: {rows: 3, columns: 4, modules: 12}
├── created_timestamp: Unix timestamp
```

**Limit:** 30 total across ALL cards (FIFO - delete oldest when creating #31)

---

## Database Schema

### New Post Types

#### `ultra_snapshot` (Daily Dashboard Snapshots)

```php
register_post_type('ultra_snapshot', [
    'labels' => ['name' => 'Dashboard Snapshots'],
    'public' => false,
    'show_ui' => true,
    'supports' => ['title', 'author', 'custom-fields']
]);
```

**Meta Fields:**

- `snapshot_type`: 'auto' | 'manual_dashboard'
- `snapshot_date`: YYYY-MM-DD
- `view_data`: JSON (compressed) - all cards with positions
- `card_count`: Integer
- `total_size_kb`: Float
- `scheduled_time`: HH:MM
- `dashboard_hash`: MD5 of all card configs combined
- `created_timestamp`: Unix timestamp

#### `ultra_card_backup` (Individual Card Backups)

```php
register_post_type('ultra_card_backup', [
    'labels' => ['name' => 'Card Backups'],
    'public' => false,
    'show_ui' => true,
    'supports' => ['title', 'author', 'custom-fields']
]);
```

**Meta Fields:**

- `card_name`: String (auto or user-provided)
- `config_json`: Compressed config
- `config_hash`: MD5
- `card_stats`: JSON {rows, columns, modules}
- `view_id`: Where card was located (optional)
- `view_title`: View name (optional)
- `card_index`: Position in view (optional)
- `created_timestamp`: Unix timestamp

### User Meta (Preferences)

```php
// User preferences for snapshots
update_user_meta($user_id, 'ultra_snapshot_enabled', true);
update_user_meta($user_id, 'ultra_snapshot_time', '03:00');
update_user_meta($user_id, 'ultra_snapshot_timezone', 'America/New_York');
```

---

## REST API Endpoints

### Dashboard Snapshots

```php
// GET /ultra-card/v1/snapshots
// List all daily snapshots
// Response: [
//   {
//     id: 123,
//     date: '2025-01-15',
//     card_count: 15,
//     views: ['Home', 'Energy', 'Security'],
//     size_kb: 450,
//     created: '2025-01-15 03:00:00'
//   }
// ]

// GET /ultra-card/v1/snapshots/{id}
// Get full snapshot with all card configs and positions
// Response: {
//   id: 123,
//   views: [
//     {
//       view_id: 'home',
//       view_title: 'Home',
//       cards: [{card_index: 0, config: {...}, ...}]
//     }
//   ]
// }

// POST /ultra-card/v1/snapshots/trigger
// Manually trigger a full dashboard snapshot (Pro only)
// Body: { dashboard_data: {...} }

// POST /ultra-card/v1/snapshots/{id}/restore
// Restore entire snapshot
// Returns: { instructions: '...', configs: [...] }

// DELETE /ultra-card/v1/snapshots/{id}
// Delete snapshot (manual only, not auto)
```

### Card Backups

```php
// GET /ultra-card/v1/card-backups
// List all manual card backups
// Response: [
//   {
//     id: 456,
//     card_name: 'Living Room Card',
//     stats: {rows: 3, columns: 4, modules: 12},
//     created: '2025-01-15 14:30:00'
//   }
// ]

// POST /ultra-card/v1/card-backups
// Create new card backup
// Body: {
//   config: {...},
//   card_name: 'My Card',
//   view_id: 'home',
//   view_title: 'Home',
//   card_index: 2
// }

// GET /ultra-card/v1/card-backups/{id}
// Get single card backup with full config

// PUT /ultra-card/v1/card-backups/{id}
// Update card backup name

// DELETE /ultra-card/v1/card-backups/{id}
// Delete card backup
```

### Settings

```php
// GET /ultra-card/v1/snapshot-settings
// Get user's snapshot preferences
// Response: {
//   enabled: true,
//   time: '03:00',
//   timezone: 'America/New_York',
//   next_snapshot: '2025-01-16 03:00:00'
// }

// PUT /ultra-card/v1/snapshot-settings
// Update snapshot preferences
// Body: { enabled: true, time: '03:00', timezone: 'America/New_York' }
```

---

## Frontend Services

### `uc-dashboard-scanner-service.ts` (NEW)

Scans Home Assistant dashboard to find all Ultra Cards

```typescript
interface DashboardCard {
  card_id: string;
  card_index: number;
  view_id: string;
  view_title: string;
  config: UltraCardConfig;
}

class UcDashboardScannerService {
  // Scan entire dashboard for Ultra Cards
  async scanDashboard(): Promise<DashboardCard[]>;

  // Get dashboard structure (views/tabs)
  async getDashboardViews(): Promise<{ id: string; title: string }[]>;

  // Find all UC cards in a specific view
  async scanView(viewId: string): Promise<DashboardCard[]>;
}
```

### `uc-snapshot-service.ts` (NEW)

Manages dashboard snapshots

```typescript
interface DashboardSnapshot {
  id: number;
  date: string;
  card_count: number;
  views: {
    view_id: string;
    view_title: string;
    card_count: number;
  }[];
  size_kb: number;
  created: string;
}

class UcSnapshotService {
  // Create manual dashboard snapshot
  async createSnapshot(): Promise<DashboardSnapshot>;

  // List all snapshots
  async listSnapshots(): Promise<DashboardSnapshot[]>;

  // Get full snapshot details
  async getSnapshot(id: number): Promise<FullSnapshot>;

  // Restore entire snapshot
  async restoreSnapshot(id: number): Promise<RestoreInstructions>;

  // Get snapshot settings
  async getSettings(): Promise<SnapshotSettings>;

  // Update snapshot settings
  async updateSettings(settings: SnapshotSettings): Promise<void>;
}
```

### `uc-card-backup-service.ts` (UPDATED)

Manages individual card backups

```typescript
interface CardBackup {
  id: number;
  card_name: string;
  stats: { rows: number; columns: number; modules: number };
  created: string;
}

class UcCardBackupService {
  // Create manual backup of current card
  async createBackup(config: UltraCardConfig, name?: string): Promise<CardBackup>;

  // List all card backups
  async listBackups(): Promise<CardBackup[]>;

  // Get single backup with full config
  async getBackup(id: number): Promise<CardBackup & { config: UltraCardConfig }>;

  // Restore card backup
  async restoreBackup(id: number): Promise<UltraCardConfig>;

  // Delete backup
  async deleteBackup(id: number): Promise<void>;

  // Update backup name
  async renameBackup(id: number, name: string): Promise<void>;
}
```

---

## UI Components

### 1. Ultra Card Pro Section (Top of Settings)

**Location:** Settings tab, very top

**Content:**

- Pro/Free banner (existing)
- User info + logout (existing)
- **NEW: Snapshot Status Card**
  - "Last Snapshot: Yesterday at 3:00 AM (15 cards)"
  - "Next Snapshot: Tomorrow at 3:00 AM"
  - Settings icon to configure time
- **NEW: Quick Actions**
  - "📸 Snapshot Now" button (triggers manual snapshot)
  - "📜 View Snapshots" button (opens history)
  - "💾 Backup This Card" button (quick manual backup)

### 2. Snapshot History Modal (UPDATED)

**File:** `src/components/uc-snapshot-history-modal.ts`

**Two Tabs:**

**Tab 1: Dashboard Snapshots**

- List of daily snapshots
- Shows: Date, card count, size
- Expandable: Click to see which views/cards
- Actions: Restore All, Download, Delete (manual only)

```
📸 Jan 15, 2025 - 3:00 AM [15 cards]
  ├─ 🏠 Home (8 cards)
  ├─ ⚡ Energy (4 cards)
  └─ 🔒 Security (3 cards)
  [Restore All] [Download] [🗑️]

📸 Jan 14, 2025 - 3:00 AM [14 cards]
  ├─ 🏠 Home (7 cards)
  ├─ ⚡ Energy (4 cards)
  └─ 🔒 Security (3 cards)
  [Restore All] [Download]
```

**Tab 2: Card Backups**

- List of manual card backups
- Shows: Card name, stats, date
- Actions: Restore, Rename, Download, Delete

```
💾 Living Room Card
   3 rows • 4 columns • 12 modules
   Jan 15, 2025 2:30 PM
   [Restore] [Rename] [Download] [🗑️]

💾 Kitchen Dashboard
   2 rows • 3 columns • 8 modules
   Jan 14, 2025 5:15 PM
   [Restore] [Rename] [Download] [🗑️]
```

### 3. Snapshot Settings Dialog (NEW)

**File:** `src/components/uc-snapshot-settings-dialog.ts`

**Content:**

- Toggle: Enable/Disable auto snapshots
- Time picker: "Snapshot time: [03:00] AM/PM"
- Timezone selector
- Info: "Snapshots capture all Ultra Cards across your entire dashboard"
- Save button

### 4. Card Backup Dialog (UPDATED)

**File:** `src/components/uc-card-backup-dialog.ts`

**Content:**

- Auto-filled card name (editable)
- Shows current card stats
- "You have X/30 backups" indicator
- Create button

---

## Export/Import Encoding

### Current Problem

Plain JSON is too easy to read and not unique

### Solution: Use Row Export Format

```typescript
// Encode like row export does
function encodeConfig(config: UltraCardConfig): string {
  const json = JSON.stringify(config);
  const compressed = pako.gzip(json);
  const base64 = btoa(String.fromCharCode(...compressed));
  return `UC_CONFIG_V1:${base64}`;
}

function decodeConfig(encoded: string): UltraCardConfig {
  const base64 = encoded.replace('UC_CONFIG_V1:', '');
  const compressed = Uint8Array.from(atob(base64), c => c.charCodeCode(0));
  const json = pako.ungzip(compressed, { to: 'string' });
  return JSON.parse(json);
}
```

---

## Cron Jobs (WordPress)

### Daily Snapshot Job

```php
// Schedule for each Pro user at their preferred time
add_action('ultra_card_daily_snapshot', 'execute_daily_snapshot');

function execute_daily_snapshot($user_id) {
    // This will be triggered by frontend, not cron
    // Frontend sends full dashboard data to API
    // Backend just stores it
}
```

### Cleanup Job

```php
// Run daily at midnight
add_action('ultra_card_cleanup_snapshots', 'cleanup_old_snapshots');

function cleanup_old_snapshots() {
    // Delete auto snapshots older than 30 days
    // Keep manual snapshots indefinitely
    // Enforce 30 card backup limit per user
}
```

---

## Implementation Steps

1. ✅ Update WordPress backend (new post types, REST API)
2. ✅ Create dashboard scanner service
3. ✅ Create snapshot service
4. ✅ Update card backup service
5. ✅ Build snapshot history modal
6. ✅ Add snapshot settings dialog
7. ✅ Move Pro section to top of settings
8. ✅ Update export/import encoding
9. ✅ Test restore workflow
10. ✅ Launch!

---

## Key Benefits

✅ **Daily auto-snapshots** - Set and forget
✅ **Full dashboard backup** - Not just one card
✅ **Position tracking** - Cards go back where they belong
✅ **Multi-view support** - Across all dashboard pages
✅ **One-click restore** - "Restore 15 cards"
✅ **30-day history** - Time machine for your dashboard
✅ **Manual card backups** - Quick single-card saves
✅ **Encoded exports** - Professional format

This is a KILLER feature! 🚀
