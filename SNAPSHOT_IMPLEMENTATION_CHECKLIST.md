# Ultra Card Pro Snapshot System - Implementation Checklist

## 🎯 Goal

Transform from individual card backups to intelligent dashboard snapshot system with daily auto-snapshots and manual card backups.

---

## Phase 1: WordPress Backend Foundation ⚙️

### Step 1.1: REST API Endpoints for Snapshots

**File:** `ultra-card-integration.php`

**Tasks:**

- [ ] Add snapshot REST endpoints (list, create, get, restore, delete)
- [ ] Add card backup REST endpoints (list, create, get, restore, delete, rename)
- [ ] Add snapshot settings endpoints (get/update user preferences)
- [ ] Test all endpoints with Postman/REST client

**Acceptance Criteria:**

- Can create a snapshot via POST request
- Can retrieve snapshot list
- Can get individual snapshot with full data
- Proper error handling and authentication

**Estimated Time:** 2-3 hours

---

### Step 1.2: Snapshot Storage Logic

**File:** `ultra-card-integration.php` - Add new methods to `UltraCardCloudSync` class

**Tasks:**

- [ ] `create_dashboard_snapshot($view_data)` - Store full dashboard snapshot
- [ ] `get_dashboard_snapshots($user_id, $limit)` - List snapshots with card counts
- [ ] `get_snapshot_details($snapshot_id)` - Get full snapshot with all cards
- [ ] `delete_dashboard_snapshot($snapshot_id)` - Delete snapshot
- [ ] Auto-prune snapshots older than 30 days (cron job)

**Acceptance Criteria:**

- Snapshots store multiple cards with view/position data
- Can retrieve snapshot showing "15 cards across 3 views"
- Old snapshots automatically deleted after 30 days

**Estimated Time:** 3-4 hours

---

### Step 1.3: Card Backup FIFO System

**File:** `ultra-card-integration.php`

**Tasks:**

- [ ] `create_card_backup($config, $card_name, $view_info)` - Create manual backup
- [ ] `enforce_backup_limit($user_id)` - Auto-delete oldest when limit reached
- [ ] `rename_card_backup($backup_id, $new_name)` - Update backup name
- [ ] `get_card_backups($user_id)` - List all manual backups

**Acceptance Criteria:**

- Can create up to 30 card backups
- 31st backup automatically deletes oldest
- Backups have auto-generated names that users can edit

**Estimated Time:** 2-3 hours

---

### Step 1.4: User Snapshot Preferences

**File:** `ultra-card-integration.php`

**Tasks:**

- [ ] User meta: `ultra_snapshot_enabled`, `ultra_snapshot_time`, `ultra_snapshot_timezone`
- [ ] GET/PUT endpoints for snapshot settings
- [ ] Default values: enabled=true, time='03:00', timezone=UTC

**Acceptance Criteria:**

- User can set preferred snapshot time
- Settings persist across sessions
- Defaults work for new users

**Estimated Time:** 1-2 hours

---

## Phase 2: TypeScript Services 🔧

### Step 2.1: Dashboard Scanner Service

**New File:** `src/services/uc-dashboard-scanner-service.ts`

**Tasks:**

- [ ] `scanDashboard()` - Find all Ultra Cards in current dashboard
- [ ] `getDashboardViews()` - Get list of views/tabs
- [ ] `scanView(viewId)` - Find UC cards in specific view
- [ ] Track: `view_id`, `view_title`, `card_index`, `config`

**Acceptance Criteria:**

- Can detect all UC cards across all dashboard views
- Captures card positions correctly
- Works with multi-view dashboards

**Estimated Time:** 4-5 hours (complex - HA dashboard API)

---

### Step 2.2: Snapshot Service

**New File:** `src/services/uc-snapshot-service.ts`

**Tasks:**

- [ ] `createSnapshot()` - Scan dashboard, send to API
- [ ] `listSnapshots()` - Get all daily snapshots
- [ ] `getSnapshot(id)` - Get full snapshot details
- [ ] `restoreSnapshot(id)` - Restore entire dashboard
- [ ] `getSettings()` / `updateSettings()` - Manage preferences

**Acceptance Criteria:**

- Can create manual snapshot of entire dashboard
- Shows snapshot history with card counts per view
- Restore provides instructions for all cards

**Estimated Time:** 3-4 hours

---

### Step 2.3: Card Backup Service (Updated)

**New File:** `src/services/uc-card-backup-service.ts`

**Tasks:**

- [ ] `createBackup(config, name)` - Save single card
- [ ] `listBackups()` - Show all 30 manual backups
- [ ] `restoreBackup(id)` - Load card config
- [ ] `deleteBackup(id)` - Remove backup
- [ ] `renameBackup(id, name)` - Update name

**Acceptance Criteria:**

- Quick backup of current card
- List shows card names and stats
- FIFO enforcement (30 max)

**Estimated Time:** 2-3 hours

---

### Step 2.4: Export/Import Encoding

**File:** `src/utils/uc-config-encoder.ts` (NEW)

**Tasks:**

- [ ] `encodeConfig(config)` - Compress + Base64 like row export
- [ ] `decodeConfig(encoded)` - Reverse process
- [ ] Format: `UC_CONFIG_V1:{base64_data}`
- [ ] Use pako.js for gzip compression

**Acceptance Criteria:**

- Export looks "encrypted" (not plain JSON)
- Can successfully decode exported configs
- Format matches row export style

**Estimated Time:** 1-2 hours

---

## Phase 3: UI Components 🎨

### Step 3.1: Move Pro Section to Top

**File:** `src/editor/ultra-card-editor.ts`

**Tasks:**

- [ ] Reorder Settings tab: Pro section FIRST, then other settings
- [ ] Pro section shows: Banner, User info, Snapshot status
- [ ] Add "Snapshot Status Card" showing last/next snapshot

**Acceptance Criteria:**

- Pro section is first thing users see in Settings
- Clean, prominent placement
- Snapshot info visible at a glance

**Estimated Time:** 1-2 hours

---

### Step 3.2: Snapshot History Modal (Redesigned)

**File:** `src/components/uc-snapshot-history-modal.ts`

**Tasks:**

- [ ] **Tab 1: Dashboard Snapshots**
  - List daily snapshots
  - Show: Date, card count, views breakdown
  - Expandable to see individual cards
  - Actions: Restore All, Download, Delete
- [ ] **Tab 2: Card Backups**
  - List manual backups
  - Show: Name, stats, date
  - Actions: Restore, Rename, Download, Delete

**Acceptance Criteria:**

- Two clear tabs
- Snapshot view shows "15 cards: Home (8), Energy (4), Security (3)"
- Click to expand and see card list
- All actions functional

**Estimated Time:** 4-5 hours

---

### Step 3.3: Snapshot Settings Dialog

**New File:** `src/components/uc-snapshot-settings-dialog.ts`

**Tasks:**

- [ ] Toggle: Enable/disable auto snapshots
- [ ] Time picker for daily snapshot time
- [ ] Timezone selector
- [ ] Save button with confirmation
- [ ] Show "Next snapshot: Tomorrow at 3:00 AM"

**Acceptance Criteria:**

- User can configure snapshot schedule
- Settings save successfully
- Clear indication of next snapshot time

**Estimated Time:** 2-3 hours

---

### Step 3.4: Card Backup Dialog (Simplified)

**File:** `src/components/uc-manual-backup-dialog.ts` (UPDATE)

**Tasks:**

- [ ] Auto-fill card name (editable)
- [ ] Show current card stats (rows, columns, modules)
- [ ] Show "X/30 backups used"
- [ ] Create button
- [ ] Warning if at limit

**Acceptance Criteria:**

- Quick, simple backup creation
- Clear feedback on limits
- Auto-naming works well

**Estimated Time:** 1-2 hours

---

### Step 3.5: Pro Section Quick Actions

**File:** `src/editor/ultra-card-editor.ts`

**Tasks:**

- [ ] Button: "📸 Snapshot Now" (trigger manual full snapshot)
- [ ] Button: "📜 View Snapshots" (open history modal)
- [ ] Button: "💾 Backup This Card" (quick card backup)
- [ ] Status indicator: "Last Snapshot: Yesterday at 3:00 AM (15 cards)"

**Acceptance Criteria:**

- Three prominent action buttons
- Status shows helpful info
- Clicking works as expected

**Estimated Time:** 2-3 hours

---

## Phase 4: WordPress Dashboard Modernization 💎

### Step 4.1: Update Dashboard Panel Content

**File:** `ultra-card-integration.php` - `render_panel_content()` method

**Tasks:**

- [ ] Show snapshot list (not individual backups)
- [ ] Each snapshot shows: Date, card count, views
- [ ] Click to expand and see card list
- [ ] Actions per snapshot: Restore All, Download, View Details
- [ ] Modern card-based UI (already styled from previous work)

**Acceptance Criteria:**

- Dashboard shows daily snapshots
- Beautiful, professional design
- Clear breakdown of what's in each snapshot

**Estimated Time:** 3-4 hours

---

### Step 4.2: Add Snapshot Trigger

**File:** `ultra-card-integration.php` or dashboard JS

**Tasks:**

- [ ] "Create Snapshot Now" button
- [ ] Shows progress: "Capturing dashboard..."
- [ ] Success message with card count
- [ ] Refresh list after creation

**Acceptance Criteria:**

- Can manually trigger snapshot from WordPress
- Provides clear feedback
- Updates list immediately

**Estimated Time:** 1-2 hours

---

## Phase 5: Restore Workflow 🔄

### Step 5.1: Dashboard Restore Instructions

**Both Files:** Frontend service + WordPress dashboard

**Tasks:**

- [ ] When restoring snapshot, show:
  - "This will restore 15 Ultra Cards across 3 views"
  - List of views and card counts
  - Instructions: "Open each view and paste configs"
- [ ] Provide downloadable JSON for each card
- [ ] OR: Single "restore bundle" with all cards

**Acceptance Criteria:**

- Clear instructions for restoration
- Easy access to all card configs
- User knows exactly what to do

**Estimated Time:** 2-3 hours

---

### Step 5.2: Position Tracking

**File:** `src/services/uc-dashboard-scanner-service.ts`

**Tasks:**

- [ ] Capture card index within view
- [ ] Save view path/ID
- [ ] Include in snapshot data
- [ ] On restore, show: "This card was in 'Home' view, position 2"

**Acceptance Criteria:**

- Users know where cards came from
- Can manually recreate dashboard layout
- Position info displayed in restore

**Estimated Time:** 2-3 hours

---

## Phase 6: Polish & Testing ✨

### Step 6.1: Update Translations

**File:** `src/translations/en.json`

**Tasks:**

- [ ] Add all new snapshot-related keys
- [ ] Update existing backup keys
- [ ] Ensure consistency across UI

**Acceptance Criteria:**

- All text uses translation keys
- English version complete
- Other languages have placeholders

**Estimated Time:** 1 hour

---

### Step 6.2: Error Handling

**All Files**

**Tasks:**

- [ ] Network failures (queue for retry)
- [ ] Snapshot limit reached (clear message)
- [ ] Authentication expired (re-login prompt)
- [ ] Dashboard scan failures (graceful degradation)

**Acceptance Criteria:**

- User never sees cryptic errors
- Clear actionable messages
- Offline mode works

**Estimated Time:** 2-3 hours

---

### Step 6.3: Testing

**Manual Testing**

**Tasks:**

- [ ] Create daily snapshot (auto + manual)
- [ ] View snapshot history
- [ ] Expand snapshot to see cards
- [ ] Restore individual card
- [ ] Create manual card backup
- [ ] Hit 30 backup limit (FIFO works)
- [ ] Update snapshot settings
- [ ] Test cross-device sync
- [ ] Test on mobile
- [ ] Test in WordPress dashboard

**Acceptance Criteria:**

- Everything works as designed
- No console errors
- Smooth UX

**Estimated Time:** 3-4 hours

---

## Total Estimated Time: 50-65 hours

## Phase Order & Approval Points

**Milestone 1: Backend Complete** ✅

- Steps 1.1 - 1.4
- Test: Can create/retrieve snapshots via API
- **APPROVAL CHECKPOINT**

**Milestone 2: Services Complete** ✅

- Steps 2.1 - 2.4
- Test: Can scan dashboard and create snapshot from frontend
- **APPROVAL CHECKPOINT**

**Milestone 3: UI Complete** ✅

- Steps 3.1 - 3.5
- Test: Full user flow works in card editor
- **APPROVAL CHECKPOINT**

**Milestone 4: WordPress Complete** ✅

- Steps 4.1 - 4.2
- Test: Dashboard panel shows snapshots beautifully
- **APPROVAL CHECKPOINT**

**Milestone 5: Restore & Polish** ✅

- Steps 5.1 - 6.3
- Test: Full end-to-end workflow
- **FINAL APPROVAL & LAUNCH**

---

## Current Status: 🟢 READY TO START

**Next Step:** Phase 1, Step 1.1 - Add REST API endpoints for snapshots

**Should I proceed?** Reply "yes" to start, or let me know if you want to adjust the plan!
