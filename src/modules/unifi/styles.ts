/** Shared CSS for the UniFi Network module preview. */

export function unifiModuleStyles(): string {
  return `
.uc-unifi {
  --uc-unifi-accent: var(--primary-color, #00bcd4);
  position: relative;
  width: 100%;
  color: var(--primary-text-color);
  font-family: var(--ha-font-family-body, inherit);
}

.uc-unifi-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 12px;
  letter-spacing: 0.3px;
}
.uc-unifi-curation-note {
  font-size: 12px;
  color: var(--secondary-text-color);
  margin: -4px 0 12px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
  border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
}

/* ── Wizard ─────────────────────────────────────────────── */
.uc-unifi-wizard {
  background: var(--secondary-background-color);
  border: 1px solid var(--divider-color);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.uc-unifi-wizard h3 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 8px;
}
.uc-unifi-wizard p {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--secondary-text-color);
  line-height: 1.45;
}
.uc-unifi-wizard-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.uc-unifi-btn {
  appearance: none;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  background: var(--primary-color);
  color: var(--text-primary-color, #fff);
}
.uc-unifi-btn[disabled] { opacity: 0.5; cursor: default; }
.uc-unifi-btn.secondary {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}
.uc-unifi-btn.linkish {
  background: transparent;
  color: var(--secondary-text-color);
  padding: 8px 10px;
}
.uc-unifi-progress {
  height: 4px;
  border-radius: 2px;
  background: rgba(127,127,127,0.2);
  overflow: hidden;
  margin-top: 10px;
}
.uc-unifi-progress > i {
  display: block;
  height: 100%;
  background: var(--primary-color);
  width: var(--pct, 0%);
  transition: width 0.2s ease;
}
.uc-unifi-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.uc-unifi-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(127,127,127,0.15);
  color: var(--secondary-text-color);
}
.uc-unifi-badge.ok { background: rgba(105,240,174,0.18); color: #69f0ae; }
.uc-unifi-badge.warn { background: rgba(255,215,64,0.18); color: #ffd740; }
.uc-unifi-badge.bad { background: rgba(255,82,82,0.18); color: #ff8a80; }

/* ── Empty ──────────────────────────────────────────────── */
.uc-unifi-empty {
  text-align: center;
  padding: 28px 16px;
  color: var(--secondary-text-color);
}
.uc-unifi-empty ha-icon { --mdc-icon-size: 40px; color: var(--primary-color); margin-bottom: 8px; }
.uc-unifi-empty a { color: var(--primary-color); }

/* ── Rack ───────────────────────────────────────────────── */
.uc-unifi-rack {
  --rack-bg: #0b0e14;
  position: relative;
  border-radius: 12px;
  padding: 16px 14px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(40,80,140,0.18), transparent 55%),
    linear-gradient(180deg, #10141c 0%, var(--rack-bg) 100%);
  border: 1px solid rgba(80,100,140,0.25);
  perspective: 900px;
  overflow: hidden;
}
.uc-unifi-rack.style-light {
  --rack-bg: #e8ecf2;
  background: linear-gradient(180deg, #f4f6fa, #dfe5ee);
  border-color: #b8c0cc;
  color: #1a1f2a;
}
.uc-unifi-rack.style-glass {
  background: rgba(20, 28, 44, 0.45);
  backdrop-filter: blur(12px);
  border-color: rgba(120,180,255,0.25);
}
.uc-unifi-rack.style-blueprint {
  background:
    linear-gradient(rgba(30,80,160,0.08) 1px, transparent 1px) 0 0 / 20px 20px,
    linear-gradient(90deg, rgba(30,80,160,0.08) 1px, transparent 1px) 0 0 / 20px 20px,
    #061018;
  border-color: #1e4a8c;
  color: #7eb6ff;
}
/* Blank: components float directly on the dashboard, zero chrome.
   Units keep their own horizontal padding so photos and footer text
   never clip at the card edges. */
.uc-unifi-rack.style-blank {
  background: none;
  border: none;
  padding: 4px 2px;
  box-shadow: none;
}
.uc-unifi-rack.style-blank .uc-unifi-photo-unit {
  background: transparent;
}

/* Blank background toggle: strips container/card backgrounds for every
   view — components float on the dashboard. (Rack style controls faceplate
   chrome; this toggle controls the containers.) */
.uc-unifi.is-blank .uc-unifi-rack {
  background: none;
  border: none;
  box-shadow: none;
  padding-left: 4px;
  padding-right: 4px;
}
.uc-unifi.is-blank .uc-unifi-topo {
  background: none;
  border: none;
}
.uc-unifi.is-blank .uc-unifi-device-tile,
.uc-unifi.is-blank .uc-unifi-port-card,
.uc-unifi.is-blank .uc-unifi-port-detail,
.uc-unifi.is-blank .uc-unifi-wan-card {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}
.uc-unifi-rack-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  transform: rotateX(4deg);
  transform-origin: center top;
}
.uc-unifi-rack-unit {
  position: relative;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
.uc-unifi-rack-unit:hover {
  filter: brightness(1.08);
}

/* Faceplates */
.uc-unifi-faceplate {
  width: 100%;
  color: inherit;
}
.uc-unifi-fp-svg {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35));
}
.uc-unifi-port.is-active .uc-unifi-port-led {
  animation: uc-unifi-port-blink var(--uc-unifi-act, 1s) ease-in-out infinite;
}
.uc-unifi-poe-dot {
  animation: uc-unifi-poe-pulse 2s ease-in-out infinite;
}

/* Editor: drag-and-drop rack ordering */
.uc-unifi-order-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.uc-unifi-order-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--card-background-color, rgba(0,0,0,0.06));
  border: 1px solid var(--divider-color, rgba(120,130,150,0.2));
  cursor: grab;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.uc-unifi-order-row:active { cursor: grabbing; }
.uc-unifi-order-row.is-over {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}
.uc-unifi-order-row .pos {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.55;
  min-width: 16px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* Real product photo rack units.
   Note: selectors are scoped (2 classes) so the card-level
   .card-column img height:auto rule cannot override the sizing. */
.uc-unifi-photo-unit {
  position: relative;
  border-radius: 6px;
  background: rgba(10, 14, 22, 0.55);
  padding: 8px 18px 4px;
}
.uc-unifi-photo-stage {
  position: relative;
  text-align: center;
}
.uc-unifi-photo-frame {
  position: relative;
  display: inline-block;
  max-width: 100%;
}
.uc-unifi-photo-unit .uc-unifi-photo-img {
  display: block;
  margin: 0 auto;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 116px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.45));
}
/* Live lights on the physical ports of the product photo */
.uc-unifi-photo-unit .uc-unifi-port-lights {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
/* One cell per physical port, sized to the jack opening in the photo */
.uc-unifi-port-cell {
  position: absolute;
  box-sizing: border-box;
}
/* Our Etherlighting: fills the opening, hiding the factory photo's own port
   colour (lit blue inserts) so only live state is visible. */
.uc-unifi-port-cell .etherlight {
  position: absolute;
  inset: 0;
  border-radius: 1.5px;
  background: #0a0d12;
  /* Dark rim inside the opening keeps the jack looking recessed rather than
     like a flat painted tile. */
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.6),
    inset 0 1px 2px rgba(0, 0, 0, 0.85);
}
.uc-unifi-port-cell.kind-sfp .etherlight { border-radius: 1px; }
.uc-unifi-port-cell.is-down .etherlight {
  background: linear-gradient(180deg, #10141b 0%, #05070a 100%);
}
/* Lit port: a translucent light guide in the jack mouth, brighter at the top
   edge where the LED sits, falling off into the recess. */
.uc-unifi-port-cell.is-up .etherlight {
  /* Flat fallback first: without color-mix the gradient below is dropped and
     the port would otherwise render as an unlit black hole. */
  background: var(--plc);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--plc) 78%, #ffffff) 0%,
    var(--plc) 42%,
    color-mix(in srgb, var(--plc) 42%, #000000) 100%
  );
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.45),
    inset 0 0 2px rgba(255, 255, 255, 0.5),
    0 0 2px var(--plc);
}
/* Faint halo spilling out of a lit opening */
.uc-unifi-port-cell .halo {
  position: absolute;
  inset: -28% -20%;
  background: radial-gradient(ellipse at 50% 50%, var(--plc) 0%, transparent 65%);
  opacity: 0.26;
  filter: blur(2px);
  border-radius: 40%;
  pointer-events: none;
}
/* Activity LEDs sitting directly above the opening: green rx, amber tx */
.uc-unifi-port-cell .leds {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  margin-bottom: 1px;
  display: flex;
  justify-content: center;
  gap: clamp(1px, 12%, 2px);
  pointer-events: none;
}
.uc-unifi-port-cell .leds i {
  width: clamp(2px, 32%, 4px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(120,130,150,0.3);
  flex: 0 0 auto;
}
.uc-unifi-port-cell .led-rx.is-lit { background: #00e676; opacity: 0.45; }
.uc-unifi-port-cell .led-tx.is-lit { background: #ffd740; opacity: 0.45; }
.uc-unifi-port-cell .led-rx.is-active {
  opacity: 1;
  box-shadow: 0 0 3px #00e676, 0 0 6px rgba(0,230,118,0.6);
  animation: uc-unifi-port-blink var(--uc-unifi-act, 1s) steps(2, jump-none) infinite;
}
.uc-unifi-port-cell .led-tx.is-active {
  opacity: 1;
  box-shadow: 0 0 3px #ffd740, 0 0 6px rgba(255,215,64,0.6);
  animation: uc-unifi-port-blink var(--uc-unifi-act, 1s) steps(2, jump-none) infinite;
}
/* Steady PoE bar beneath powered ports */
.uc-unifi-port-cell .led-poe {
  position: absolute;
  top: 100%;
  margin-top: 1px;
  left: 15%;
  width: 70%;
  height: 1.5px;
  border-radius: 1px;
  background: #ffb300;
  box-shadow: 0 0 3px #ffb300;
}
/* Synthetic port row below the photo (models without measured port maps) */
.uc-unifi-photo-strip {
  display: flex;
  justify-content: center;
  margin-top: 7px;
  pointer-events: none;
}
.uc-unifi-port-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3px;
  min-width: 0;
}
.uc-unifi-port-cell.in-row {
  position: relative;
  width: 11px;
  height: 13px;
  flex: 0 0 auto;
}
.uc-unifi-port-cell.in-row.kind-sfp { width: 13px; height: 10px; }
.uc-unifi-port-cell.in-row .leds { gap: 1px; }
.uc-unifi-port-cell.in-row .leds i { width: 3px; }
.uc-unifi-photo-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 2px 2px;
  font-size: 10px;
  color: rgba(200,214,235,0.85);
}
.uc-unifi-rack.style-light .uc-unifi-photo-unit { background: rgba(255,255,255,0.55); }
.uc-unifi-rack.style-light .uc-unifi-photo-footer { color: rgba(30,40,60,0.8); }
.uc-unifi-photo-footer .nm {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.uc-unifi-photo-footer .meta { margin-left: auto; display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
.uc-unifi-photo-footer .ports { font-variant-numeric: tabular-nums; opacity: 0.75; }
.uc-unifi-photo-footer .state.ok { color: #69f0ae; }
.uc-unifi-photo-footer .state.bad { color: #ff8a65; }
/* Smart plug / outlet tile */
.uc-unifi-plug-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
}
.uc-unifi-plug-tile .uc-unifi-plug-img {
  width: 72px;
  height: 72px;
  max-height: 72px;
  object-fit: contain;
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.35));
}
.uc-unifi-plug-tile ha-icon { --mdc-icon-size: 40px; opacity: 0.7; }
.uc-unifi-plug-tile.is-on .uc-unifi-plug-img { filter: drop-shadow(0 0 10px rgba(105,240,174,0.5)); }

.uc-unifi-ap-puck {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
}
.uc-unifi-ap-stage {
  position: relative;
  width: 104px;
  height: 104px;
}
/* Inset 20px inscribes the photo box inside the ring (r=46/100 of stage),
   so even portrait wall APs stay fully inside the circle. Scoped selector
   beats the card shell's .card-column img height:auto rule. */
.uc-unifi-ap-stage .uc-unifi-ap-photo {
  position: absolute;
  inset: 20px;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  max-width: calc(100% - 40px);
  max-height: calc(100% - 40px);
  /* No circular crop: wall/in-wall APs are rectangular and would distort */
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));
}
.uc-unifi-ap-stage .uc-unifi-ap-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.uc-unifi-ap-label { font-size: 12px; font-weight: 600; text-align: center; }
.uc-unifi-ap-meta { font-size: 11px; opacity: 0.65; text-align: center; }
.uc-unifi-ring-spin {
  filter: drop-shadow(0 0 4px var(--accent, #00e5ff));
}

.uc-unifi-rack-aps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

/* ── Ports view ─────────────────────────────────────────── */
.uc-unifi-ports-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}
.uc-unifi-ports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 8px;
}
.uc-unifi-port-card {
  background: var(--secondary-background-color);
  border: 1px solid var(--divider-color);
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.uc-unifi-port-card:hover { border-color: var(--primary-color); transform: translateY(-1px); }
.uc-unifi-port-card.is-up { border-color: rgba(105,240,174,0.45); }
.uc-unifi-port-card .idx {
  font-size: 11px; font-weight: 700; opacity: 0.7; margin-bottom: 4px;
}
.uc-unifi-port-card .name {
  font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.uc-unifi-port-card .meta { font-size: 10px; opacity: 0.65; margin-top: 4px; }
.uc-unifi-bar {
  height: 4px; border-radius: 2px; background: rgba(127,127,127,0.2); margin-top: 6px; overflow: hidden;
}
.uc-unifi-bar > i { display: block; height: 100%; border-radius: 2px; }

.uc-unifi-port-detail {
  margin-top: 12px;
  padding: 14px;
  border-radius: 12px;
  background: var(--secondary-background-color);
  border: 1px solid var(--divider-color);
}
.uc-unifi-port-detail h4 { margin: 0 0 8px; font-size: 14px; }
.uc-unifi-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  font-size: 12px;
}
.uc-unifi-detail-grid .lbl { opacity: 0.6; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
.uc-unifi-detail-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }

/* ── Devices view ───────────────────────────────────────── */
.uc-unifi-devices {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}
.uc-unifi-device-tile {
  background: var(--secondary-background-color);
  border: 1px solid var(--divider-color);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
}
.uc-unifi-device-tile:hover { border-color: var(--primary-color); }
/* Fixed-size photo box so every tile presents its photo identically,
   whatever the image aspect ratio. Scoped selectors (2 classes) beat the
   card shell's .card-column img height:auto rule. */
.uc-unifi-device-tile .uc-unifi-tile-photobox {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.uc-unifi-device-tile .uc-unifi-tile-photo {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 80px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.3));
}
/* Live camera snapshot (UniFi Protect): 16:9-ish cover crop with a motion
   glow when the camera's motion sensor is on. */
.uc-unifi-device-tile .uc-unifi-tile-snapbox {
  position: relative;
  height: 96px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(0,0,0,0.25);
}
.uc-unifi-device-tile .uc-unifi-tile-snap {
  width: 100%;
  height: 96px;
  object-fit: cover;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
.uc-unifi-device-tile .uc-unifi-tile-snapbox.is-motion {
  box-shadow: inset 0 0 0 2px #ff5252, 0 0 12px rgba(255, 82, 82, 0.55);
  animation: uc-unifi-motion-pulse 1.4s ease-in-out infinite;
}
@keyframes uc-unifi-motion-pulse {
  0%, 100% { box-shadow: inset 0 0 0 2px #ff5252, 0 0 6px rgba(255, 82, 82, 0.35); }
  50% { box-shadow: inset 0 0 0 2px #ff5252, 0 0 16px rgba(255, 82, 82, 0.75); }
}
.uc-unifi-motion-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: rgba(211, 47, 47, 0.85);
  backdrop-filter: blur(2px);
}
.uc-unifi-motion-badge.is-ring {
  left: auto;
  right: 6px;
  background: rgba(25, 118, 210, 0.85);
}
.uc-unifi-device-head {
  display: flex; align-items: center; gap: 10px;
}
.uc-unifi-device-head .name { font-weight: 700; font-size: 13px; line-height: 1.2; }
.uc-unifi-device-head .model { font-size: 11px; opacity: 0.6; }
.uc-unifi-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;
}
.uc-unifi-stats .v { font-weight: 700; font-variant-numeric: tabular-nums; }
.uc-unifi-spark { width: 100%; height: 28px; }

/* Utilization ring mini */
.uc-unifi-mini-ring { width: 48px; height: 48px; flex-shrink: 0; }

/* ── Topology ───────────────────────────────────────────── */
.uc-unifi-topo {
  position: relative;
  width: 100%;
  min-height: 280px;
  border-radius: 12px;
  background:
    radial-gradient(circle at 50% 20%, rgba(0,180,255,0.08), transparent 50%),
    #0a0e16;
  border: 1px solid rgba(60,90,140,0.3);
  overflow: hidden;
}
.uc-unifi-topo svg { width: 100%; height: 100%; min-height: 280px; display: block; }
.uc-unifi-topo-node {
  cursor: pointer;
}
.uc-unifi-topo-node circle.core {
  fill: #141c2a;
  stroke: #3d8bfd;
  stroke-width: 2;
  filter: drop-shadow(0 0 6px rgba(61,139,253,0.45));
}
.uc-unifi-topo-node.is-online circle.core {
  stroke: #2bd97c;
  filter: drop-shadow(0 0 6px rgba(43,217,124,0.45));
}
.uc-unifi-topo-node.is-offline circle.core {
  stroke: #ff5252;
  filter: drop-shadow(0 0 6px rgba(255,82,82,0.4));
}
.uc-unifi-topo-node text {
  fill: #cde;
  font-size: 10px;
  text-anchor: middle;
}
.uc-unifi-flow {
  fill: none;
  stroke-linecap: round;
  stroke-dasharray: 6 10;
  animation: uc-unifi-flow var(--flow-speed, 1.4s) linear infinite;
  filter: drop-shadow(0 0 4px currentColor);
}

/* ── Clients / WAN ──────────────────────────────────────── */
.uc-unifi-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.uc-unifi-table th {
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  opacity: 0.6;
  padding: 6px 8px;
  border-bottom: 1px solid var(--divider-color);
  cursor: pointer;
  user-select: none;
}
.uc-unifi-table td {
  padding: 8px;
  border-bottom: 1px solid rgba(127,127,127,0.12);
  vertical-align: middle;
}
.uc-unifi-table tr:hover td { background: rgba(127,127,127,0.06); }
.uc-unifi-wan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}
.uc-unifi-wan-card {
  background: var(--secondary-background-color);
  border-radius: 12px;
  padding: 14px;
  border: 1px solid var(--divider-color);
}
.uc-unifi-wan-card .target { font-weight: 700; font-size: 13px; }
.uc-unifi-wan-card .latency {
  font-size: 28px; font-weight: 800; font-variant-numeric: tabular-nums;
  margin: 6px 0;
  color: var(--primary-color);
}
.uc-unifi-wan-card .unit { font-size: 12px; opacity: 0.6; }

/* ── Keyframes ──────────────────────────────────────────── */
@keyframes uc-unifi-port-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
@keyframes uc-unifi-poe-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes uc-unifi-flow {
  to { stroke-dashoffset: -32; }
}

@media (prefers-reduced-motion: reduce) {
  .uc-unifi-port.is-active .uc-unifi-port-led,
  .uc-unifi-poe-dot,
  .uc-unifi-flow,
  .uc-unifi-port-cell .led-rx.is-active,
  .uc-unifi-port-cell .led-tx.is-active,
  .uc-unifi-ring-spin {
    animation: none !important;
  }
}

.uc-unifi.anim-off .uc-unifi-port.is-active .uc-unifi-port-led,
.uc-unifi.anim-off .uc-unifi-poe-dot,
.uc-unifi.anim-off .uc-unifi-flow,
.uc-unifi.anim-off .uc-unifi-port-cell .led-rx.is-active,
.uc-unifi.anim-off .uc-unifi-port-cell .led-tx.is-active,
.uc-unifi.anim-off .uc-unifi-tile-snapbox.is-motion,
.uc-unifi.anim-off .uc-unifi-ring-spin {
  animation: none !important;
}
.uc-unifi.anim-subtle .uc-unifi-flow {
  animation-duration: calc(var(--flow-speed, 1.4s) * 2);
}
`;
}
