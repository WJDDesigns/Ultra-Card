# 📝 WordPress Snapshot Settings Panel - COMPLETE!

## ✅ What Was Added

Added a **Snapshot Settings** panel to the WordPress dashboard where Pro users can configure auto-snapshot timing and preferences.

---

## 🎯 New Features

### **1. New "Snapshot Settings" Tab**

Pro users now see a 4th tab in the Ultra Card Backups panel:

```
Ultra Card Backups
├─ All Backups
├─ Dashboard Snapshots
├─ Manual Card Backups
└─ Snapshot Settings (NEW - Pro only)
```

---

### **2. Settings Panel Content**

Beautiful, modern settings UI with:

✅ **Enable/Disable Toggle**

- Checkbox to turn auto-snapshots on/off
- Clear description of what it does

✅ **Time Picker**

- 24-hour format time input
- Choose when daily snapshots run

✅ **Timezone Selector**

- Dropdown with common timezones:
  - UTC
  - Eastern Time (ET)
  - Central Time (CT)
  - Mountain Time (MT)
  - Pacific Time (PT)
  - London, Paris, Berlin
  - Tokyo, Shanghai, Sydney

✅ **Info Box**

- Explains how dashboard snapshots work
- 30-day retention policy
- Card position tracking

✅ **Save Button**

- Beautiful gradient button
- Saves all settings to user_meta

---

## 🎨 Design Features

### **Header**

- Purple gradient background
- "⚙️ Snapshot Settings" title
- Descriptive subtitle

### **Settings Card**

- Clean white card with shadow
- Organized form groups
- Helpful descriptions for each field
- Focus states on inputs

### **Info Box**

- Light blue background
- Left border accent
- Clear explanation of feature

### **Success Message**

- Green success banner after save
- "✅ Settings saved successfully!"

---

## 💾 Data Storage

Settings are stored in WordPress `user_meta`:

| Meta Key                  | Type    | Default   | Description                    |
| ------------------------- | ------- | --------- | ------------------------------ |
| `ultra_snapshot_enabled`  | boolean | `true`    | Enable/disable auto-snapshots  |
| `ultra_snapshot_time`     | string  | `"03:00"` | Time in HH:MM format (24-hour) |
| `ultra_snapshot_timezone` | string  | `"UTC"`   | Timezone for snapshot time     |

---

## 🔄 How It Works

### **WordPress → Home Assistant Sync**

1. **User changes settings in WordPress**

   - Updates `user_meta` in WordPress database

2. **Home Assistant fetches settings**

   - Calls `GET /ultra-card/v1/snapshot-settings`
   - Gets enabled, time, timezone

3. **Scheduler adjusts**
   - Updates next snapshot time
   - Respects new timezone
   - Enables/disables scheduler

### **Bi-directional Sync**

- WordPress is the source of truth
- HA reads settings on login
- HA can also update settings via REST API
- Both UIs stay in sync

---

## 🚀 User Flow

### **Scenario: Change Snapshot Time**

1. **Go to WordPress Dashboard**

   - Navigate to Ultra Card Backups panel
   - Click "Snapshot Settings" tab

2. **Adjust Settings**

   - Enable auto-snapshots (if not already)
   - Set time to "22:00" (10 PM)
   - Set timezone to "America/Los_Angeles"

3. **Save**

   - Click "💾 Save Settings"
   - See success message

4. **Settings Sync to HA**

   - Next time user opens card editor in HA
   - Scheduler fetches new settings
   - Adjusts next snapshot time to 10 PM Pacific

5. **Snapshot Runs**
   - At 10 PM Pacific, scheduler triggers
   - Creates dashboard snapshot
   - Updates "Last Snapshot" time in both UIs

---

## 🔍 Code Changes

### **ultra-card-integration.php**

#### **Added Snapshot Settings Tab:**

```php
$panel_links['settings'] = array(
    'title' => __('Snapshot Settings', 'ultra-card'),
    'icon' => 'fas fa-cog',
    'weight' => 4,
);
```

#### **Route to Settings Panel:**

```php
if ($link === 'settings') {
    return $this->render_snapshot_settings_panel($user_id);
}
```

#### **New Method: `render_snapshot_settings_panel()`**

- Renders settings form
- Handles form submission
- Updates user_meta
- Shows success message

#### **Meta Keys Used:**

- `ultra_snapshot_enabled`
- `ultra_snapshot_time`
- `ultra_snapshot_timezone`

---

## ✅ Testing Checklist

### **Test 1: Access Settings Panel**

- [ ] Login to WordPress as Pro user
- [ ] Go to Ultra Card Backups panel
- [ ] Click "Snapshot Settings" tab
- [ ] Settings form appears

### **Test 2: Change Time**

- [ ] Set time to "14:00"
- [ ] Click Save
- [ ] See success message
- [ ] Reload page
- [ ] Time persists at "14:00"

### **Test 3: Change Timezone**

- [ ] Select "America/New_York"
- [ ] Click Save
- [ ] See success message
- [ ] Timezone persists

### **Test 4: Disable Snapshots**

- [ ] Uncheck "Enable Daily Auto-Snapshots"
- [ ] Click Save
- [ ] Settings persist

### **Test 5: HA Sync**

- [ ] Make changes in WordPress
- [ ] Open card editor in HA
- [ ] Go to PRO tab
- [ ] Settings dialog shows WordPress values
- [ ] Scheduler respects new time

### **Test 6: Free User**

- [ ] Login as Free user
- [ ] Go to Ultra Card Backups panel
- [ ] "Snapshot Settings" tab NOT visible
- [ ] Only see first 2 tabs

---

## 📊 WordPress Panel Structure

```
Ultra Card Backups Panel (Pro User)
│
├─ All Backups
│  └─ Shows all snapshots + manual backups
│
├─ Dashboard Snapshots
│  └─ Shows only auto snapshots (daily)
│
├─ Manual Card Backups
│  └─ Shows only manual card backups
│
└─ Snapshot Settings (NEW!)
   ├─ Enable/Disable Toggle
   ├─ Time Picker
   ├─ Timezone Selector
   ├─ Info Box
   └─ Save Button
```

---

## 🎨 Visual Design

```
┌─────────────────────────────────────────┐
│ ⚙️ Snapshot Settings                    │
│ Configure automatic daily dashboard...   │ ← Purple gradient header
├─────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ [✓] Enable Daily Auto-Snapshots     │ │ ← Toggle
│ │     Automatically backup all...      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Snapshot Time                            │
│ ┌─────────────────────────────────────┐ │
│ │ 03:00                  ▼            │ │ ← Time picker
│ └─────────────────────────────────────┘ │
│                                          │
│ Timezone                                 │
│ ┌─────────────────────────────────────┐ │
│ │ UTC                    ▼            │ │ ← Timezone selector
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 📅 How it works                     │ │
│ │ Dashboard Snapshots automatically... │ │ ← Info box
│ └─────────────────────────────────────┘ │
│                                          │
│ [ 💾 Save Settings ]                    │ ← Gradient button
└─────────────────────────────────────────┘
```

---

## 🔗 Integration Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  WordPress  │ ◄─────► │  REST API    │ ◄─────► │ Home Asst.  │
│  Dashboard  │         │  Endpoints   │         │   Editor    │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                         │
      │                        │                         │
   Settings                Settings                  Settings
   Panel UI              Stored in DB              Fetched + Used
      │                        │                         │
      ▼                        ▼                         ▼
  user_meta:           user_meta table          Scheduler Service
  - enabled            - key/value pairs         - Reads settings
  - time               - Per user                - Adjusts timing
  - timezone                                     - Triggers snapshots
```

---

## 🎯 Key Benefits

✅ **Centralized Settings**

- One place to configure snapshot timing
- Settings sync across HA and WordPress

✅ **User-Friendly**

- Beautiful, intuitive UI
- Clear descriptions
- Instant feedback

✅ **Flexible Scheduling**

- Choose any time
- Respect user timezone
- Enable/disable anytime

✅ **Professional Design**

- Matches Ultra Card Pro branding
- Consistent with HA settings dialog
- Mobile responsive

---

## 🚀 Ready to Test!

Upload the updated `ultra-card-integration.php` to WordPress and test the new Snapshot Settings panel! 🎉

**Location:** WordPress Dashboard → Ultra Card Backups → Snapshot Settings

The settings will sync to Home Assistant and control the auto-snapshot scheduler! ⏰
