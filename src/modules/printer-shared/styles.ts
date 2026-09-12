/**
 * Shared CSS for Bambu Lab + generic 3D Printer modules.
 * Outer wrappers should set data-uc-role="pane".
 */

export const PRINTER_SHARED_STYLES = `
  .uc-printer-root {
    color: var(--primary-text-color);
    font-family: var(--ha-font-family-body, inherit);
    --uc-printer-radius: 12px;
    --uc-printer-gap: 10px;
    box-sizing: border-box;
  }

  /* ---------------------------------------------------------------------- */
  /* Style presets. Every preset except "theme" paints its own surface so    */
  /* the choice is visible regardless of the surrounding card theme.         */
  /* ---------------------------------------------------------------------- */
  .uc-printer-root.style-dark,
  .uc-printer-root.style-light,
  .uc-printer-root.style-glass,
  .uc-printer-root.style-carbon {
    padding: 14px;
    border-radius: 16px;
    background: var(--uc-printer-surface);
    border: 1px solid var(--uc-printer-border);
    color: var(--uc-printer-text);
    --primary-text-color: var(--uc-printer-text);
    --secondary-text-color: var(--uc-printer-text-2);
  }
  .uc-printer-root.style-dark {
    --uc-printer-surface: #1a1c23;
    --uc-printer-surface-2: #242730;
    --uc-printer-border: rgba(255,255,255,0.08);
    --uc-printer-text: #f2f3f7;
    --uc-printer-text-2: rgba(242,243,247,0.7);
    --card-background-color: #1a1c23;
  }
  .uc-printer-root.style-light {
    --uc-printer-surface: #f4f5f8;
    --uc-printer-surface-2: #ffffff;
    --uc-printer-border: rgba(0,0,0,0.08);
    --uc-printer-text: #1b1d23;
    --uc-printer-text-2: rgba(27,29,35,0.65);
    --card-background-color: #f4f5f8;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  }
  .uc-printer-root.style-glass {
    --uc-printer-surface: linear-gradient(160deg, rgba(60,66,84,0.55), rgba(24,26,34,0.55));
    --uc-printer-surface-2: rgba(255,255,255,0.07);
    --uc-printer-border: rgba(255,255,255,0.16);
    --uc-printer-text: #f6f7fb;
    --uc-printer-text-2: rgba(246,247,251,0.7);
    --uc-printer-hole: rgba(22,24,32,0.92);
    --card-background-color: rgba(30,32,40,0.6);
    backdrop-filter: blur(14px) saturate(140%);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
  }
  .uc-printer-root.style-carbon {
    --uc-printer-surface:
      repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px),
      repeating-linear-gradient(-45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 6px),
      #101216;
    --uc-printer-surface-2: #1a1d24;
    --uc-printer-border: rgba(255,255,255,0.07);
    --uc-printer-text: #e9ebf0;
    --uc-printer-text-2: rgba(233,235,240,0.65);
    --card-background-color: #101216;
  }
  .uc-printer-root.style-theme {
    --uc-printer-surface: var(--ha-card-background, var(--card-background-color));
    --uc-printer-surface-2: var(--secondary-background-color);
    --uc-printer-border: var(--divider-color);
    --uc-printer-text: var(--primary-text-color);
    --uc-printer-text-2: var(--secondary-text-color);
  }

  /* Anything backed by an entity opens more-info. Feedback is a hover lift,
     not a press-shrink. */
  .uc-printer-root .is-clickable {
    cursor: pointer;
    transition:
      transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1),
      box-shadow 0.18s ease,
      filter 0.18s ease,
      background 0.18s ease;
    -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) {
    .uc-printer-root .is-clickable:hover {
      transform: translateY(-1px);
      filter: brightness(1.08);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    }
  }
  .uc-printer-root .is-clickable:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  /* Inline text spans shouldn't cast shadows */
  .uc-printer-root span.is-clickable:hover,
  .uc-printer-root .job-name.is-clickable:hover { box-shadow: none; transform: none; }

  .uc-printer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
  }
  .uc-printer-header .title {
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: 0.02em;
  }

  .uc-printer-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: color-mix(in srgb, var(--uc-status-color) 18%, transparent);
    color: var(--uc-status-color);
  }
  .uc-printer-status-pill .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--uc-status-color);
    box-shadow: 0 0 6px var(--uc-status-color);
  }

  .uc-printer-progress-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .uc-printer-progress-bar .track {
    flex: 1;
    height: 8px;
    border-radius: 999px;
    background: rgba(127,127,127,0.2);
    overflow: hidden;
  }
  .uc-printer-progress-bar .fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--primary-color), var(--success-color, #4caf50));
    transition: width 0.4s ease;
  }
  .uc-printer-progress-bar .pct {
    font-size: 0.8rem;
    font-weight: 600;
    min-width: 2.5em;
    text-align: right;
  }
  .uc-printer-progress-bar.compact .track { height: 5px; }

  .uc-printer-progress-ring {
    position: relative;
    display: inline-grid;
    place-items: center;
    border-radius: 50%;
  }
  .uc-printer-progress-ring .ring-label {
    position: absolute;
    font-size: 0.75rem;
    font-weight: 700;
  }
  .uc-printer-progress-ring .ring-fill {
    transition: stroke-dashoffset 0.5s ease;
  }

  /* Temps: chips share the row equally so 2 or 3 chips always fill it */
  .uc-printer-temps {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uc-printer-gap);
  }
  .uc-printer-temp-chip {
    flex: 1 1 0;
    min-width: 72px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 10px;
    border-radius: var(--uc-printer-radius);
    background: var(--uc-printer-surface-2, var(--secondary-background-color));
    border: 1px solid var(--uc-printer-border, var(--divider-color));
  }
  .uc-printer-temp-chip.heating {
    box-shadow: 0 0 12px color-mix(in srgb, var(--uc-temp-accent, #ff9800) 45%, transparent);
  }
  .uc-printer-temp-chip ha-icon {
    --mdc-icon-size: 18px;
    color: var(--uc-temp-accent, var(--primary-color));
  }
  .uc-printer-temp-chip .temp-value {
    font-weight: 700;
    font-size: 0.95rem;
  }
  .uc-printer-temp-chip .temp-target {
    font-weight: 400;
    opacity: 0.65;
    font-size: 0.8em;
  }
  .uc-printer-temp-chip .temp-label,
  .uc-printer-temp-chip .temp-sub {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.7;
  }

  .uc-printer-stat {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--uc-printer-radius);
    background: var(--uc-printer-surface-2, var(--secondary-background-color));
    border: 1px solid var(--uc-printer-border, var(--divider-color));
  }
  .uc-printer-stat ha-icon {
    --mdc-icon-size: 20px;
    color: var(--uc-stat-accent, var(--primary-color));
  }
  .uc-printer-stat .stat-value { font-weight: 700; font-size: 0.95rem; }
  .uc-printer-stat .stat-label { font-size: 0.7rem; opacity: 0.7; }

  /* Stat + controls share a row; each fills its half */
  .uc-printer-row {
    display: flex;
    gap: var(--uc-printer-gap);
    align-items: stretch;
    flex-wrap: wrap;
  }
  .uc-printer-row > * { flex: 1 1 160px; min-width: 0; }
  .uc-printer-row > .uc-printer-controls {
    justify-content: flex-end;
    padding: 4px 8px;
    border-radius: var(--uc-printer-radius);
    background: var(--uc-printer-surface-2, var(--secondary-background-color));
    border: 1px solid var(--uc-printer-border, var(--divider-color));
  }
  .uc-printer-row > .uc-printer-controls .ctrl {
    background: var(--uc-printer-surface, var(--uc-pane-bg, var(--card-background-color)));
  }

  .uc-printer-spool {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    border-radius: 8px;
  }
  .uc-printer-spool.active svg {
    filter: drop-shadow(0 0 6px var(--spool-color));
  }
  .uc-printer-spool .spool-label {
    font-size: 0.65rem;
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.8;
  }
  .uc-printer-spool .spool-active-dot {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success-color, #4caf50);
    box-shadow: 0 0 6px var(--success-color, #4caf50);
  }

  .uc-printer-ams-strip {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }
  .uc-printer-ams-strip .ams-humidity {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 0.75rem;
    opacity: 0.8;
  }
  .uc-printer-ams-strip .ams-humidity ha-icon { --mdc-icon-size: 14px; }

  /* Print job: full-width panel */
  .uc-printer-job {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border-radius: var(--uc-printer-radius);
    background: var(--uc-printer-surface-2, var(--secondary-background-color));
    border: 1px solid var(--uc-printer-border, var(--divider-color));
  }
  .uc-printer-job .job-thumb {
    width: 56px;
    height: 56px;
    flex-shrink: 0;
    border-radius: 10px;
    object-fit: cover;
    background: rgba(0,0,0,0.3);
  }
  .uc-printer-job .job-meta {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .uc-printer-job .job-name {
    font-weight: 600;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .uc-printer-job .job-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    font-size: 0.75rem;
    opacity: 0.75;
  }
  .uc-printer-job .job-row .is-clickable:hover { opacity: 1; text-decoration: underline; }

  .uc-printer-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .uc-printer-controls .ctrl {
    display: inline-grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid var(--uc-printer-border, var(--divider-color));
    background: var(--uc-printer-surface-2, var(--secondary-background-color));
    color: var(--primary-text-color);
    cursor: pointer;
    padding: 0;
  }
  .uc-printer-controls .ctrl:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .uc-printer-controls .ctrl.danger { color: var(--error-color, #f44336); }
  .uc-printer-controls .ctrl.on {
    background: color-mix(in srgb, var(--warning-color, #ffc107) 25%, transparent);
    color: var(--warning-color, #ffc107);
  }
  .uc-printer-controls .ctrl.active {
    background: color-mix(in srgb, var(--primary-color) 30%, transparent);
    border-color: var(--primary-color);
  }
  .uc-printer-controls .ctrl ha-icon { --mdc-icon-size: 20px; pointer-events: none; }
  .uc-printer-controls .speed-group {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }
  .uc-printer-controls .ctrl.speed { width: 34px; height: 34px; }

  /* Fans: icon spins about its own center */
  .uc-printer-fans { display: flex; flex-direction: column; gap: 6px; }
  .uc-printer-fans .fan-row {
    display: grid;
    grid-template-columns: 22px minmax(70px, 1fr) 1fr auto;
    align-items: center;
    gap: 8px;
    padding: 2px 4px;
    margin: 0 -4px;
    border-radius: 8px;
  }
  .uc-printer-fans .fan-icon-wrap {
    display: inline-grid;
    place-items: center;
    width: 22px;
    height: 22px;
    line-height: 0;
  }
  .uc-printer-fans .fan-icon-wrap ha-icon {
    --mdc-icon-size: 18px;
    display: block;
    width: 18px;
    height: 18px;
    transform-origin: 50% 50%;
    will-change: transform;
  }
  .uc-printer-fans .fan-icon-wrap.spinning ha-icon {
    animation: uc-fan-spin var(--fan-duration, 1s) linear infinite;
  }
  .uc-printer-fans .fan-label { font-size: 0.8rem; }
  .uc-printer-fans .fan-bar {
    height: 6px;
    border-radius: 999px;
    background: rgba(127,127,127,0.2);
    overflow: hidden;
  }
  .uc-printer-fans .fan-bar .fill {
    height: 100%;
    background: var(--success-color, #4caf50);
  }
  .uc-printer-fans .fan-pct {
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 2.5em;
    text-align: right;
  }
  .uc-printer-fans input[type="range"] { grid-column: 1 / -1; width: 100%; }

  /* Camera: 16:9 by default; .fill stretches to the container (grid cells) */
  .uc-printer-camera {
    position: relative;
    border-radius: var(--uc-printer-radius);
    overflow: hidden;
    background: #000;
    aspect-ratio: 16 / 9;
    width: 100%;
    display: block;
  }
  .uc-printer-camera.fill {
    aspect-ratio: auto;
    height: 100%;
    min-height: 150px;
  }
  .uc-printer-camera uc-printer-snapshot {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
  .uc-printer-camera uc-printer-snapshot.is-error::after {
    content: 'Snapshot unavailable';
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 0.8rem;
    opacity: 0.6;
    background: var(--uc-printer-surface-2, #222);
  }
  .uc-printer-camera ha-camera-stream {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* let the wrapper own the click → more-info */
  }
  .uc-printer-camera .cam-live {
    position: absolute;
    left: 8px;
    top: 8px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 7px;
    border-radius: 999px;
    background: rgba(0,0,0,0.55);
    color: #fff;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .uc-printer-camera .cam-live .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff3b30;
    box-shadow: 0 0 6px #ff3b30;
    animation: uc-led-pulse 1.6s ease-in-out infinite;
  }
  .uc-printer-camera .cam-expand {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: rgba(0,0,0,0.55);
    color: #fff;
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
  }
  .uc-printer-camera .cam-expand ha-icon { --mdc-icon-size: 16px; }
  .uc-printer-camera:hover .cam-expand { opacity: 1; }
  .uc-printer-camera.empty {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 4px;
    opacity: 0.6;
    font-size: 0.85rem;
    background: var(--uc-printer-surface-2, #222);
  }
  .uc-printer-camera.empty.fill { aspect-ratio: auto; }

  .uc-printer-details { display: flex; flex-direction: column; gap: 4px; }
  .uc-printer-details .detail-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.8rem;
    padding: 4px 2px;
    border-bottom: 1px solid var(--uc-printer-border, rgba(127,127,127,0.15));
    border-radius: 4px;
  }
  .uc-printer-details .detail-row:last-child { border-bottom: none; }
  .uc-printer-details .detail-label { opacity: 0.7; }
  .uc-printer-details .detail-value { font-weight: 600; text-align: right; }
  .uc-printer-details .detail-row.accent .detail-value {
    color: var(--warning-color, #ffc107);
  }

  /* ---------------------------------------------------------------------- */
  /* Illustration stage + overlays (shared by Bambu and generic modules)     */
  /* ---------------------------------------------------------------------- */
  .uc-bambu-stage {
    position: relative;
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
    container-type: inline-size;
    /* aspect-ratio is set inline to match the SVG viewBox */
  }

  /* Overlays shrink with the stage so small tiles stay legible */
  @container (max-width: 240px) {
    .uc-bambu-hotspot { padding: 3px 7px; min-width: 44px; }
    .uc-bambu-hotspot .hs-value { font-size: 0.68rem; }
    .uc-bambu-hotspot .hs-label { font-size: 0.5rem; }
    .uc-bambu-screen { padding: 2px 6px; min-width: 48px; }
    .uc-bambu-screen .screen-pct { font-size: 0.75rem; }
    .uc-bambu-progress-badge { width: 34px; height: 34px; font-size: 0.62rem; }
  }
  @container (max-width: 180px) {
    .uc-bambu-hotspot { padding: 2px 6px; min-width: 0; }
    .uc-bambu-hotspot .hs-label { display: none; }
    .uc-bambu-screen,
    .uc-bambu-progress-badge { display: none; }
  }

  /* Explicit compact mode (farm tiles) */
  .uc-bambu-stage.compact .uc-bambu-hotspot {
    padding: 2px 6px;
    min-width: 0;
    background: rgba(10, 12, 18, 0.9);
  }
  .uc-bambu-stage.compact .uc-bambu-hotspot .hs-value { font-size: 0.66rem; }
  .uc-bambu-stage.compact .uc-bambu-hotspot .hs-label { display: none; }
  .uc-bambu-stage .uc-bambu-svg,
  .uc-bambu-stage .uc-bambu-photo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  /* Overlays pop in (staggered via --i) and lift on hover; the centering
     translate is part of every transform so they never jump. */
  .uc-bambu-hotspot,
  .uc-bambu-screen,
  .uc-bambu-progress-badge {
    /* 'backwards' holds the hidden start during the stagger delay, then hands
       control back to normal styles so :hover transforms still apply. */
    animation: uc-overlay-in 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
    animation-delay: calc(var(--i, 0) * 70ms);
    transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.18s ease;
  }
  @media (hover: hover) {
    .uc-printer-root .uc-bambu-hotspot.is-clickable:hover,
    .uc-printer-root .uc-bambu-screen.is-clickable:hover,
    .uc-printer-root .uc-bambu-progress-badge.is-clickable:hover {
      transform: translate(-50%, -50%) scale(1.07);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
      filter: none;
    }
  }
  .uc-bambu-stage.anim-off .uc-bambu-hotspot,
  .uc-bambu-stage.anim-off .uc-bambu-screen,
  .uc-bambu-stage.anim-off .uc-bambu-progress-badge { animation: none; }

  .uc-bambu-hotspot {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 9px;
    border-radius: 999px;
    background: rgba(10, 12, 18, 0.86);
    border: 1px solid color-mix(in srgb, var(--hotspot-accent) 55%, transparent);
    backdrop-filter: blur(6px);
    min-width: 52px;
    color: #fff;
    z-index: 2;
  }
  .uc-bambu-hotspot.glow {
    box-shadow: 0 0 14px color-mix(in srgb, var(--hotspot-accent) 55%, transparent);
  }
  .uc-bambu-hotspot .hs-value {
    font-weight: 700;
    font-size: 0.75rem;
    color: var(--hotspot-accent);
    line-height: 1.1;
  }
  .uc-bambu-hotspot .hs-label {
    font-size: 0.55rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.75;
  }
  .uc-bambu-screen {
    position: absolute;
    transform: translate(-50%, -50%);
    background: rgba(6, 8, 12, 0.92);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    padding: 3px 8px;
    text-align: center;
    min-width: 56px;
    max-width: 30%;
    color: #e8eaf0;
    line-height: 1.15;
    z-index: 2;
  }
  .uc-bambu-screen .screen-status {
    display: block;
    font-size: 0.55rem;
    text-transform: capitalize;
    opacity: 0.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .uc-bambu-screen .screen-pct {
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--primary-color);
  }
  .uc-bambu-progress-badge {
    position: absolute;
    transform: translate(-50%, -50%);
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.72rem;
    color: #fff;
    background: rgba(10,12,18,0.9);
    border: 2px solid var(--primary-color);
    z-index: 2;
  }

  /* Fan blades spin about the hub (origin is set inline per fan in SVG units) */
  .uc-bambu-stage.anim-full.fan-on .ucb-fan-blades,
  .uc-bambu-stage.anim-subtle.fan-on .ucb-fan-blades {
    animation: uc-fan-spin var(--fan-duration, 1s) linear infinite;
  }
  .uc-bambu-stage.anim-subtle.fan-on .ucb-fan-blades {
    animation-duration: calc(var(--fan-duration, 1s) * 2);
  }
  .uc-bambu-stage.anim-off .ucb-fan-blades { animation: none; }

  /* Toolhead sweeps while printing */
  .uc-bambu-stage .ucb-toolhead {
    transform-box: fill-box;
    transform-origin: center;
  }
  .uc-bambu-stage.anim-full.printing .ucb-toolhead {
    animation: uc-toolhead-sweep 3.2s ease-in-out infinite alternate;
  }
  .uc-bambu-stage.anim-full .ucb-led {
    animation: uc-led-pulse 2.4s ease-in-out infinite;
  }
  .uc-bambu-stage .ucb-nozzle.hot { fill: #ffb266; }

  @keyframes uc-fan-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes uc-toolhead-sweep {
    from { transform: translateX(-26px); }
    to { transform: translateX(26px); }
  }
  @keyframes uc-led-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
  @keyframes uc-overlay-in {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.72); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .uc-printer-fans .fan-icon-wrap.spinning ha-icon,
    .uc-bambu-stage .ucb-fan-blades,
    .uc-bambu-stage .ucb-toolhead,
    .uc-bambu-stage .ucb-led,
    .uc-bambu-hotspot,
    .uc-bambu-screen,
    .uc-bambu-progress-badge { animation: none !important; }
    .uc-printer-root .is-clickable { transition: none; }
    .uc-printer-progress-bar .fill,
    .uc-printer-progress-ring .ring-fill { transition: none; }
  }

  .uc-printer-root.anim-off .fan-icon-wrap.spinning ha-icon { animation: none; }
`;
