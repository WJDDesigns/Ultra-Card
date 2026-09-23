# FreeSpace

FreeSpace is a custom Lovelace **view layout** shipped with Ultra Card. It lets you place any card anywhere on a scaled artboard: drag, resize, rotate, and layer cards over each other, while keeping Home Assistant’s native edit dialogs and a Sections-like look.

Requires **[Ultra Card Connect](https://github.com/WJDDesigns/ultra-card-connect)** for discoverability and edit tools. Existing FreeSpace views keep rendering without Connect.

## Enable

1. Install Ultra Card Connect (HACS → Integrations).
2. Open **Ultra Card Hub → Home**.
3. Turn on **Enable FreeSpace** (stored in this browser).

## Use

1. Edit a dashboard.
2. Pencil the view → **Layout** → **FreeSpace (Ultra Card)**.
3. Add cards with the FAB (or HA’s add-card flow).
4. In edit mode:
   - **Click** a card to select it (highlight + handles).
   - **Double-click** to open HA’s card editor.
   - **Right-click** (or the ⋮ button) for edit / duplicate / layer / delete.
   - **Click empty space** to deselect.
   - Drag to move; resize with edge/corner handles.
   - Rotate with the **top-left** rotate icon (only when selected; hold **Shift** to snap 15°).

### Breakpoints

Edit mode shows a **Desktop / Laptop / Tablet / Phone** bar. Each breakpoint has its own artboard width and per-card coordinates. Missing breakpoints fall back to the next larger one (phone → tablet → laptop → desktop).

| Breakpoint | Min width | Default artboard |
|------------|-----------|------------------|
| Desktop    | ≥ 1440px  | 1400             |
| Laptop     | ≥ 1024px  | 1100             |
| Tablet     | ≥ 768px   | 768              |
| Phone      | &lt; 768px    | 390              |

Use **Copy from Desktop** to seed the current breakpoint from the desktop layout, then tweak.

On phones, if no card has an explicit Phone layout and `narrow: stack` (default), cards stack in reading order until you arrange a Phone layout.

## Config

```yaml
type: custom:ultra-freespace-view
title: Living room
freespace:
  canvas_widths: # set these in View settings → FreeSpace view specific settings
    desktop: 1400
    laptop: 1100
    tablet: 768
    phone: 390
  min_height: 800
  grid: 8
  narrow: stack # stack | scale (phone fallback when no phone layout)
cards:
  - type: tile
    entity: light.sofa
    view_layout:
      desktop:
        x: 96
        y: 64
        w: 320
        h: 160
        r: 0
        z: 2
      phone:
        x: 16
        y: 16
        w: 358
        h: 120
        r: 0
        z: 2
```

In the view editor (pencil on the view), **FreeSpace view specific settings** lets you set each breakpoint’s canvas size, snap grid, min height, and phone fallback behaviour.

**Sizing (Sections-like):** Edit and live use the same rules. Hub → Home → **Layout width** (Full width) applies to FreeSpace and Sections. With Full width on, every breakpoint fills the view. With it off, the design canvas is centered and edit mode shows dashed width bounds. Cards outside the lines still work. The edit-mode dot grid is a full-bleed background layer behind the cards.

## Importing from Sections

If you switch a Sections view to FreeSpace and HA left `sections:` in the YAML, edit mode shows an **Import sections** banner. That flattens section cards into positioned `cards` and removes `sections` in one save.

## Architecture notes

- Custom element: `ultra-freespace-view` (always registered from `ultra-card.js`).
- Implementation chunk: `uc-freespace.<hash>.js` (lazy).
- Layout dropdown entry is injected by a guarded patch of `hui-view-editor` (same idea as layout-card), only when FreeSpace is enabled and Connect is installed.
- Persistence: `lovelace.saveConfig` on pointer-up / menu actions (never mid-drag).

See also: [bundle strategy](bundle-strategy.md), [Ultra Dashboard](ultra-dashboard.md).
