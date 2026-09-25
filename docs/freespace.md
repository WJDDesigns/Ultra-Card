# FreeSpace

FreeSpace is a custom Lovelace **view layout** shipped with Ultra Card. It lets you place any card anywhere on a scaled artboard: drag, resize, rotate, and layer cards over each other, while keeping Home Assistant’s native edit dialogs and a Sections-like look.

Requires **[Ultra Card Connect](https://github.com/WJDDesigns/ultra-card-connect)** for discoverability and edit tools. Existing FreeSpace views keep rendering without Connect.

## Enable

Install Ultra Card Connect (HACS → Integrations). That's it: FreeSpace is on for everyone who has Ultra Card and Connect installed, and there is no switch to turn on. Hub → Home shows **FreeSpace is ready** when Connect is detected.

## Use

1. Edit a dashboard.
2. Pencil the view → **Layout** → **FreeSpace (Ultra Card)**.
3. Add cards with the FAB (or HA’s add-card flow).
4. In edit mode:
   - **Click** a card to select it (highlight + handles).
   - **Shift-, Ctrl- or Cmd-click** to add or remove cards from the selection, or **drag on empty space** to draw a selection box (mouse and pen). **Cmd/Ctrl+A** selects every card.
   - **Double-click** to open HA’s card editor.
   - **Right-click** (or the ⋮ button) for edit / duplicate / layer / pin / delete.
   - **Click empty space** to deselect.
   - Drag to move (dragging one selected card moves the whole selection); resize with edge/corner handles.
   - Arrow keys nudge the selection 1px (10px with Shift). Delete removes it.
   - Rotate with the **top-left** rotate icon (only when selected; hold **Shift** to snap 15°).

### Toolbar

The toolbar at the top of the view in edit mode always shows the breakpoints, plus **Use Desktop / Custom** on Laptop, Tablet and Phone (see Breakpoints). With nothing selected it shows **Snap to grid** (this session only) and **Add card**.

With **one card** selected:

- **X / Y / W / H / °** fields for exact position, size and rotation
- **Pin**: Left, Center, Right, or Left & right (see below)
- **Align**: left, center, right or top of the canvas (16px inset)
- **Layer**: bring to front, forward, backward, send to back
- **Edit**, **Duplicate**, **Delete**

With **two or more** selected:

- **Align** to the selection: left, center, right, top, middle, bottom
- **Distribute** horizontally or vertically (3 or more cards), spacing them evenly between the outermost two
- **Pin** all selected cards at once
- **Delete** all selected cards (asks first)

### Pins

A pin controls what happens to a card when the screen is wider or narrower than when you placed it. It is set per card, per breakpoint, from the toolbar or the right-click menu (**Pin to**).

| Pin | When the screen gets wider |
|-----|----------------------------|
| Left (default) | Keeps its distance from the left edge |
| Right | Keeps its distance from the right edge |
| Center | Stays the same distance from the middle |
| Left & right | Keeps both edge distances and stretches (never below 80px) |

Pins only change anything when **Full width** is on (Hub → Home → Layout width), because that is when the canvas width follows the screen. With Full width off the canvas has a fixed width and every pin looks the same. While editing, a dashed line connects the selected card to the edge it is pinned to. Pinned cards can overlap on a much narrower screen; they are not reflowed.

In YAML a pin looks like `pin: right` with `ref_w: 1920` (the canvas width the card was placed at) next to `x`/`y`/`w`/`h`.

### Breakpoints

Edit mode shows a **Desktop / Laptop / Tablet / Phone** bar. Each breakpoint has its own artboard width. Laptop, Tablet and Phone are each either **Use Desktop** or **Custom**:

- **Use Desktop** (default): the breakpoint shows the Desktop layout.
- **Custom**: the breakpoint has its own positions. Moving, resizing, aligning or pinning any card on a breakpoint that uses Desktop switches it to Custom automatically, copying the Desktop layout for every card first so nothing else jumps.
- Choosing **Use Desktop** again (it asks first) removes that breakpoint's positions so it follows Desktop again.

A card with no layout for a breakpoint always falls back to its Desktop layout, never to another breakpoint.

| Breakpoint | Min width | Default artboard |
|------------|-----------|------------------|
| Desktop    | ≥ 1440px  | 1400             |
| Laptop     | ≥ 1024px  | 1100             |
| Tablet     | ≥ 768px   | 768              |
| Phone      | &lt; 768px    | 390              |

On phones, while Phone uses Desktop and `narrow: stack` is set (the default), cards stack in reading order. Choose **Custom** to arrange a Phone layout.

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

**Sizing (Sections-like):** Edit and live use the same rules. Hub → Home → **Layout width** (Full width) applies to FreeSpace and Sections. With Full width on, the dashboard fills the screen on every device. With it off, the design canvas is centered and edit mode shows dashed width bounds. Editing a smaller breakpoint on a bigger screen (Phone on a desktop) always shows a centered frame at that device's canvas width, with dashed lines at its left and right edges. Cards outside the lines still work. The edit-mode dot grid is a full-bleed background layer behind the cards.

## Importing from Sections

If you switch a Sections view to FreeSpace and HA left `sections:` in the YAML, edit mode shows an **Import sections** banner. That flattens section cards into positioned `cards` and removes `sections` in one save.

## Architecture notes

- Custom element: `ultra-freespace-view` (always registered from `ultra-card.js`).
- Implementation chunk: `uc-freespace.<hash>.js` (lazy).
- Layout dropdown entry is injected by a guarded patch of `hui-view-editor` (same idea as layout-card), only when Connect is installed.
- Persistence: `lovelace.saveConfig` on pointer-up / menu actions (never mid-drag).

See also: [bundle strategy](bundle-strategy.md), [Ultra Dashboard](ultra-dashboard.md).
