# Camera Grid Module

Free NVR-style grid for multiple camera entities, plus optional image/logo, text, clock, and empty tiles.

## Features

- **Multiple cameras** in one module, drag-reordered in the editor
- **Layouts** — regular, auto-fit, masonry, spotlight (hierarchical), and custom spans
- **Logo or image tiles** that can sit where a camera would go (centre, corner, or custom span)
- **Adaptive streaming** — live video on the featured or large tiles, snapshots on the rest
- **Tap to spotlight**, hold for fullscreen, or open more-info
- **Auto-cycle** the spotlight on an interval
- **Motion spotlight** — link a `binary_sensor` per camera so motion jumps that feed to the featured slot
- **Status badges** for motion, recording, and offline, plus optional snapshot time
- **Pagination** with dots, arrows, and optional auto-page

## Layouts

- **Regular** — even cells in a fixed column count
- **Auto-fit** — columns wrap from a minimum tile width
- **Masonry** — shortest-column packing using each tile’s aspect ratio
- **Spotlight** — one featured tile spanning 2×2 or 3×3, with the rest filling around it
- **Custom** — per-tile column and row spans for NVR patterns such as a logo in the middle

## Stream modes

- **Auto** — Home Assistant snapshot polling (`hui-image`)
- **Live** — `ha-camera-stream` (WebRTC / HLS / MJPEG)
- **Snapshot** — still images on the configured refresh interval

Per-tile stream mode can inherit the grid default or override it.

## Tile types

- **Camera** — entity, optional name, motion sensor, recording entity
- **Image** — upload, URL, or entity picture (logos)
- **Text** — static label tile
- **Clock** — 12h / 24h, optional date
- **Empty** — spacer for custom layouts

## Actions

- **Tap** — spotlight (spotlight layout), fullscreen, more-info, or nothing
- **Hold** — fullscreen, more-info, or nothing
- Image and text tiles can also use a YAML `tap_action`

## Notes

- Fullscreen reuses the shared camera overlay (pinch-zoom, audio toggle, Escape to close)
- Rearranging tiles is editor-only in this version
- Motion hold pauses auto-cycle while the sensor is on
