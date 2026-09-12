/**
 * Procedural SVG printer + AMS illustrations for the Bambu Lab module.
 *
 * Three families, all drawn with the same design language (soft gradients,
 * hairline strokes, glass reflections, live lightbar/toolhead accents):
 *   - h2              → H2-series look: silver pillars, top control band, tall door
 *   - enclosed_corexy → X1 / P1 / P2S cube: dark frame, front screen, glass door
 *   - bedslinger      → A1 / A1 mini: open frame, light body, exposed bed
 *
 * Hotspot anchors are fractions of each family's viewBox. The stage element
 * locks its aspect-ratio to the viewBox so overlays line up exactly.
 */

import { TemplateResult, svg, html, nothing } from 'lit';
import type { BambuModelFamily } from '../../services/uc-bambu-service';
import type { PrinterSnapshot, PrinterTray } from '../printer-shared/printer-state';
import { isHeating, fireMoreInfo } from '../printer-shared/printer-state';

type Family = BambuModelFamily | 'generic';

export interface HotspotAnchors {
  nozzle: { x: number; y: number };
  bed: { x: number; y: number };
  chamber?: { x: number; y: number };
  screen: { x: number; y: number };
  fan?: { x: number; y: number };
  progress?: { x: number; y: number };
}

interface FamilyGeometry {
  w: number;
  h: number;
  anchors: HotspotAnchors;
}

const GEOMETRY: Record<Family, FamilyGeometry> = {
  h2: {
    w: 240,
    h: 300,
    anchors: {
      nozzle: { x: 0.5, y: 0.515 },
      bed: { x: 0.5, y: 0.81 },
      chamber: { x: 0.27, y: 0.62 },
      screen: { x: 0.295, y: 0.132 },
      fan: { x: 0.775, y: 0.5 },
      progress: { x: 0.79, y: 0.132 },
    },
  },
  enclosed_corexy: {
    w: 240,
    h: 260,
    anchors: {
      nozzle: { x: 0.5, y: 0.535 },
      bed: { x: 0.5, y: 0.825 },
      chamber: { x: 0.27, y: 0.65 },
      screen: { x: 0.27, y: 0.13 },
      fan: { x: 0.78, y: 0.53 },
      progress: { x: 0.8, y: 0.13 },
    },
  },
  bedslinger: {
    w: 240,
    h: 260,
    anchors: {
      nozzle: { x: 0.5, y: 0.465 },
      bed: { x: 0.5, y: 0.76 },
      screen: { x: 0.235, y: 0.855 },
      fan: { x: 0.79, y: 0.33 },
      progress: { x: 0.8, y: 0.855 },
    },
  },
  generic: {
    w: 240,
    h: 260,
    anchors: {
      nozzle: { x: 0.5, y: 0.535 },
      bed: { x: 0.5, y: 0.825 },
      screen: { x: 0.27, y: 0.13 },
      fan: { x: 0.78, y: 0.53 },
      progress: { x: 0.8, y: 0.13 },
    },
  },
};

export const HOTSPOTS: Record<Family, HotspotAnchors> = {
  h2: GEOMETRY.h2.anchors,
  enclosed_corexy: GEOMETRY.enclosed_corexy.anchors,
  bedslinger: GEOMETRY.bedslinger.anchors,
  generic: GEOMETRY.generic.anchors,
};

export function anchorsForFamily(family: Family | undefined): HotspotAnchors {
  return (GEOMETRY[family || 'generic'] || GEOMETRY.generic).anchors;
}

export function geometryForFamily(family: Family | undefined): FamilyGeometry {
  return GEOMETRY[family || 'generic'] || GEOMETRY.generic;
}

/* -------------------------------------------------------------------------- */
/* Shared defs                                                                 */
/* -------------------------------------------------------------------------- */

function defs(): TemplateResult {
  return svg`
    <defs>
      <linearGradient id="ucb-pillar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#eef0f3"/>
        <stop offset="0.45" stop-color="#c9ccd3"/>
        <stop offset="1" stop-color="#8f939c"/>
      </linearGradient>
      <linearGradient id="ucb-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a2d34"/>
        <stop offset="1" stop-color="#15171b"/>
      </linearGradient>
      <linearGradient id="ucb-band" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#141519"/>
        <stop offset="1" stop-color="#090a0c"/>
      </linearGradient>
      <linearGradient id="ucb-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
        <stop offset="0.35" stop-color="#ffffff" stop-opacity="0.04"/>
        <stop offset="0.6" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0.06"/>
      </linearGradient>
      <linearGradient id="ucb-interior" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#101216"/>
        <stop offset="1" stop-color="#060708"/>
      </linearGradient>
      <linearGradient id="ucb-metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6a6e78"/>
        <stop offset="1" stop-color="#3a3d45"/>
      </linearGradient>
      <linearGradient id="ucb-light-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fafbfc"/>
        <stop offset="1" stop-color="#d4d7dd"/>
      </linearGradient>
      <radialGradient id="ucb-chamber-glow" cx="0.5" cy="0" r="0.9">
        <stop offset="0" stop-color="#fff6dc" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#fff6dc" stop-opacity="0"/>
      </radialGradient>
      <filter id="ucb-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.6"/>
      </filter>
      <filter id="ucb-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  `;
}

interface DrawOpts {
  accent: string;
  model?: string | undefined;
  progress?: number | null | undefined;
  printing?: boolean;
  lightOn?: boolean | null | undefined;
  heating?: boolean;
  fanOn?: boolean;
}

/** Spinning fan: hub + three blades, centered via transform-box. */
function fan(cx: number, cy: number, r: number, accent: string): TemplateResult {
  const blade = (deg: number) => svg`
    <path
      d="M ${cx} ${cy} m 0 ${-r * 0.15} q ${r * 0.55} ${-r * 0.75} ${r * 0.1} ${-r * 0.95} q ${-r * 0.45} ${r * 0.35} ${-r * 0.1} ${r * 0.95} z"
      transform="rotate(${deg} ${cx} ${cy})"
    />
  `;
  return svg`
    <g class="ucb-fan-housing">
      <circle cx=${cx} cy=${cy} r=${r + 3} fill="#0d0e11" stroke="#3a3d46" stroke-width="1"/>
      <g
        class="ucb-fan-blades"
        fill=${accent}
        opacity="0.85"
        style="transform-origin:${cx}px ${cy}px;transform-box:view-box;"
      >
        ${blade(0)}${blade(120)}${blade(240)}
      </g>
      <circle cx=${cx} cy=${cy} r=${r * 0.28} fill="#22252c" stroke="#4b4f59" stroke-width="0.8"/>
    </g>
  `;
}

/** Toolhead with LED and nozzle. */
function toolhead(cx: number, top: number, accent: string, heating: boolean): TemplateResult {
  const w = 34;
  const h = 34;
  const x = cx - w / 2;
  return svg`
    <g class="ucb-toolhead">
      <rect x=${x} y=${top} width=${w} height=${h} rx="5" fill="#2b2e36" stroke="#4d5160" stroke-width="1"/>
      <rect x=${x + 4} y=${top + 4} width=${w - 8} height=${h * 0.5} rx="3" fill="#3b3f4a"/>
      <rect x=${x + 8} y=${top + 8} width=${w - 16} height="3" rx="1.5" fill="#5c6170"/>
      <circle cx=${cx} cy=${top + h - 8} r="2.2" fill=${accent} class="ucb-led"/>
      <path
        d="M ${cx - 6} ${top + h} L ${cx + 6} ${top + h} L ${cx + 2.5} ${top + h + 9} L ${cx - 2.5} ${top + h + 9} Z"
        fill="#d0d3da" stroke="#9a9ea8" stroke-width="0.6"
        class="ucb-nozzle ${heating ? 'hot' : ''}"
        filter=${heating ? 'url(#ucb-glow)' : nothing}
      />
      ${heating ? svg`<circle cx=${cx} cy=${top + h + 10} r="4" fill="#ff9a3c" opacity="0.55" filter="url(#ucb-soft)"/>` : nothing}
    </g>
  `;
}

/** Printed object on the bed, height follows progress. */
function printObject(cx: number, bedTop: number, progress: number | null | undefined, accent: string): TemplateResult {
  if (progress == null || progress <= 0) return svg``;
  const maxH = 46;
  const h = Math.max(3, (Math.min(100, progress) / 100) * maxH);
  const w = 40;
  return svg`
    <g class="ucb-object">
      <rect x=${cx - w / 2} y=${bedTop - h} width=${w} height=${h} rx="2.5" fill=${accent} opacity="0.9"/>
      <rect x=${cx - w / 2} y=${bedTop - h} width=${w} height="2" fill="#ffffff" opacity="0.35"/>
      <rect x=${cx - w / 2} y=${bedTop - h} width="3" height=${h} fill="#000" opacity="0.18"/>
    </g>
  `;
}

/** Heated bed with plate, frame, and light strip. */
function bed(x: number, y: number, w: number, accent: string, lightbar: boolean): TemplateResult {
  return svg`
    <g class="ucb-bed">
      <rect x=${x} y=${y} width=${w} height="6" rx="1.5" fill="#1d1f25" stroke="#3a3d46" stroke-width="0.8"/>
      <rect x=${x + 2} y=${y - 3} width=${w - 4} height="4" rx="1" fill="#33363f"/>
      <rect x=${x - 4} y=${y + 6} width=${w + 8} height="7" rx="2" fill="url(#ucb-metal)"/>
      ${lightbar
        ? svg`
            <rect x=${x + 6} y=${y + 6} width=${w - 12} height="10" rx="3" fill="#cfe6ff" opacity="0.18" filter="url(#ucb-soft)"/>
            <rect x=${x + 10} y=${y + 8} width=${w - 20} height="3" rx="1.5" fill="#eef7ff" opacity="1" filter="url(#ucb-glow)"/>
          `
        : nothing}
      <rect x=${x + 10} y=${y - 3.5} width=${w - 20} height="1" fill=${accent} opacity="0.25"/>
    </g>
  `;
}

/** Touchscreen with a faint UI. */
function touchscreen(x: number, y: number, w: number, h: number): TemplateResult {
  return svg`
    <g class="ucb-screen">
      <rect x=${x} y=${y} width=${w} height=${h} rx="4" fill="#0b0c10" stroke="#34373f" stroke-width="1"/>
      <rect x=${x + 2} y=${y + 2} width=${w - 4} height=${h - 4} rx="3" fill="#16181e"/>
      <circle cx=${x + w * 0.62} cy=${y + h / 2} r=${h * 0.3} fill="none" stroke="#3f434d" stroke-width="1.2"/>
      <circle cx=${x + w * 0.62} cy=${y + h / 2} r=${h * 0.11} fill="#3f434d"/>
      <rect x=${x + 6} y=${y + 7} width="12" height="2.4" rx="1.2" fill="#3f434d"/>
      <rect x=${x + 6} y=${y + 13} width="8" height="2.4" rx="1.2" fill="#3f434d"/>
      <rect x=${x + 6} y=${y + 19} width="10" height="2.4" rx="1.2" fill="#3f434d"/>
    </g>
  `;
}

function grille(x: number, y: number, w: number, h: number): TemplateResult {
  const lines: TemplateResult[] = [];
  for (let i = 0; i <= w; i += 4) {
    lines.push(svg`<line x1=${x + i} y1=${y} x2=${x + i} y2=${y + h} stroke="#22252c" stroke-width="1.4"/>`);
  }
  return svg`<g class="ucb-grille">${lines}</g>`;
}

/* -------------------------------------------------------------------------- */
/* H2 family (reference: H2D)                                                  */
/* -------------------------------------------------------------------------- */

function h2Svg(o: DrawOpts): TemplateResult {
  const W = 240;
  const H = 300;
  const bodyX = 26;
  const bodyW = W - bodyX * 2;
  const doorX = 34;
  const doorY = 78;
  const doorW = W - doorX * 2;
  const doorH = 198;
  const cx = W / 2;
  return svg`
    <svg class="uc-bambu-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${defs()}
      <ellipse cx=${cx} cy="293" rx="104" ry="5" fill="#000" opacity="0.35" filter="url(#ucb-soft)"/>

      <!-- side pillars -->
      <rect x="6" y="16" width="22" height="272" rx="9" fill="url(#ucb-pillar)"/>
      <rect x="212" y="16" width="22" height="272" rx="9" fill="url(#ucb-pillar)"/>
      <rect x="9" y="20" width="3" height="262" rx="1.5" fill="#fff" opacity="0.45"/>
      <rect x="215" y="20" width="3" height="262" rx="1.5" fill="#fff" opacity="0.45"/>

      <!-- body -->
      <rect x=${bodyX} y="8" width=${bodyW} height="286" rx="7" fill="url(#ucb-body)" stroke="#33363e" stroke-width="1"/>
      <rect x="106" y="2" width="28" height="9" rx="2.5" fill="#0b0c0f"/>

      <!-- top control band -->
      <rect x=${bodyX} y="8" width=${bodyW} height="64" rx="7" fill="url(#ucb-band)"/>
      <rect x=${bodyX} y="66" width=${bodyW} height="6" fill="#0b0c0f"/>
      <line x1=${bodyX} y1="72" x2=${bodyX + bodyW} y2="72" stroke="#3a3d46" stroke-width="0.8"/>
      ${touchscreen(40, 20, 62, 40)}
      <text x="160" y="45" text-anchor="end" fill="#a6a9b1" font-size="13" font-weight="700" font-family="Inter, system-ui, sans-serif" letter-spacing="1.2">${o.model || ''}</text>

      <!-- interior -->
      <rect x=${doorX} y=${doorY} width=${doorW} height=${doorH} rx="3" fill="url(#ucb-interior)"/>
      ${o.lightOn ? svg`<rect x=${doorX} y=${doorY} width=${doorW} height=${doorH} fill="url(#ucb-chamber-glow)"/>` : nothing}
      <rect x=${doorX + 8} y=${doorY + 4} width=${doorW - 16} height="3" rx="1.5" fill="#fff" opacity=${o.lightOn ? '0.7' : '0.1'} filter=${o.lightOn ? 'url(#ucb-glow)' : nothing}/>

      <!-- gantry -->
      <rect x=${doorX + 8} y="98" width=${doorW - 16} height="7" rx="2" fill="url(#ucb-metal)"/>
      <rect x=${doorX + 8} y="99" width=${doorW - 16} height="1.5" fill="#8a8e98" opacity="0.6"/>
      <rect x=${doorX + 6} y=${doorY + 10} width="6" height="70" rx="2" fill="#23262d"/>
      <rect x=${doorX + doorW - 12} y=${doorY + 10} width="6" height="70" rx="2" fill="#23262d"/>

      ${toolhead(cx, 92, o.accent, !!o.heating)}

      <!-- chamber fan / grille -->
      ${grille(178, 122, 22, 56)}
      ${fan(186, 150, 9, o.accent)}

      <!-- purge chute / aux -->
      <rect x=${doorX + 14} y="128" width="18" height="30" rx="3" fill="#1a1c22" stroke="#2f323a" stroke-width="0.8"/>

      <!-- bed -->
      ${printObject(cx, 208, o.printing ? o.progress : null, o.accent)}
      ${bed(48, 208, 144, o.accent, true)}
      <rect x="116" y="222" width="8" height="40" fill="#15171c"/>

      <!-- glass + frame -->
      <rect x=${doorX} y=${doorY} width=${doorW} height=${doorH} rx="3" fill="url(#ucb-glass)"/>
      <rect x=${doorX} y=${doorY} width=${doorW} height=${doorH} rx="3" fill="none" stroke="#3c3f48" stroke-width="1.2"/>
      <rect x="198" y="160" width="6" height="40" rx="3" fill="#9a9ea8"/>
      <rect x="199" y="162" width="1.5" height="36" rx="0.75" fill="#fff" opacity="0.5"/>

      <!-- base -->
      <rect x=${bodyX} y="284" width=${bodyW} height="10" rx="3" fill="#0b0c0f"/>
    </svg>
  `;
}

/* -------------------------------------------------------------------------- */
/* Enclosed CoreXY (X1 / P1 / P2S)                                             */
/* -------------------------------------------------------------------------- */

function enclosedSvg(o: DrawOpts): TemplateResult {
  const W = 240;
  const H = 260;
  const bodyX = 14;
  const bodyW = W - bodyX * 2;
  const doorX = 30;
  const doorY = 66;
  const doorW = W - doorX * 2;
  const doorH = 168;
  const cx = W / 2;
  return svg`
    <svg class="uc-bambu-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${defs()}
      <ellipse cx=${cx} cy="253" rx="108" ry="5" fill="#000" opacity="0.35" filter="url(#ucb-soft)"/>

      <!-- body -->
      <rect x=${bodyX} y="10" width=${bodyW} height="238" rx="10" fill="url(#ucb-body)" stroke="#33363e" stroke-width="1"/>
      <rect x=${bodyX + 3} y="13" width="3" height="232" rx="1.5" fill="#fff" opacity="0.08"/>
      <rect x=${bodyX + bodyW - 6} y="13" width="3" height="232" rx="1.5" fill="#000" opacity="0.3"/>

      <!-- top band with screen + camera bump -->
      <rect x=${bodyX} y="10" width=${bodyW} height="52" rx="10" fill="url(#ucb-band)"/>
      <rect x=${bodyX} y="54" width=${bodyW} height="8" fill="#0b0c0f"/>
      <line x1=${bodyX} y1="62" x2=${bodyX + bodyW} y2="62" stroke="#3a3d46" stroke-width="0.8"/>
      ${touchscreen(36, 18, 56, 34)}
      <rect x="112" y="4" width="16" height="7" rx="2" fill="#0b0c0f"/>
      <circle cx="120" cy="7.5" r="2" fill="#2f3239"/>
      <text x="160" y="40" text-anchor="end" fill="#a6a9b1" font-size="12" font-weight="700" font-family="Inter, system-ui, sans-serif" letter-spacing="1.2">${o.model || ''}</text>

      <!-- interior -->
      <rect x=${doorX} y=${doorY} width=${doorW} height=${doorH} rx="3" fill="url(#ucb-interior)"/>
      ${o.lightOn ? svg`<rect x=${doorX} y=${doorY} width=${doorW} height=${doorH} fill="url(#ucb-chamber-glow)"/>` : nothing}
      <rect x=${doorX + 8} y=${doorY + 4} width=${doorW - 16} height="3" rx="1.5" fill="#fff" opacity=${o.lightOn ? '0.7' : '0.1'} filter=${o.lightOn ? 'url(#ucb-glow)' : nothing}/>

      <!-- gantry -->
      <rect x=${doorX + 8} y="86" width=${doorW - 16} height="7" rx="2" fill="url(#ucb-metal)"/>
      <rect x=${doorX + 8} y="87" width=${doorW - 16} height="1.5" fill="#8a8e98" opacity="0.6"/>
      <rect x=${doorX + 6} y=${doorY + 10} width="6" height="60" rx="2" fill="#23262d"/>
      <rect x=${doorX + doorW - 12} y=${doorY + 10} width="6" height="60" rx="2" fill="#23262d"/>

      ${toolhead(cx, 80, o.accent, !!o.heating)}

      ${grille(180, 110, 20, 52)}
      ${fan(187, 138, 8.5, o.accent)}

      <rect x=${doorX + 12} y="112" width="16" height="26" rx="3" fill="#1a1c22" stroke="#2f323a" stroke-width="0.8"/>

      ${printObject(cx, 192, o.printing ? o.progress : null, o.accent)}
      ${bed(44, 192, 152, o.accent, false)}
      <rect x="116" y="205" width="8" height="26" fill="#15171c"/>

      <rect x=${doorX} y=${doorY} width=${doorW} height=${doorH} rx="3" fill="url(#ucb-glass)"/>
      <rect x=${doorX} y=${doorY} width=${doorW} height=${doorH} rx="3" fill="none" stroke="#3c3f48" stroke-width="1.2"/>
      <rect x="200" y="136" width="5" height="34" rx="2.5" fill="#9a9ea8"/>

      <rect x=${bodyX} y="240" width=${bodyW} height="8" rx="3" fill="#0b0c0f"/>
    </svg>
  `;
}

/* -------------------------------------------------------------------------- */
/* Bedslinger (A1 / A1 mini)                                                   */
/* -------------------------------------------------------------------------- */

function bedslingerSvg(o: DrawOpts): TemplateResult {
  const W = 240;
  const H = 260;
  const cx = W / 2;
  return svg`
    <svg class="uc-bambu-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${defs()}
      <ellipse cx=${cx} cy="252" rx="104" ry="5" fill="#000" opacity="0.3" filter="url(#ucb-soft)"/>

      <!-- base -->
      <rect x="28" y="196" width="184" height="46" rx="8" fill="url(#ucb-light-body)" stroke="#b8bcc4" stroke-width="1"/>
      <rect x="32" y="200" width="176" height="3" rx="1.5" fill="#fff" opacity="0.8"/>
      <rect x="28" y="236" width="184" height="6" rx="3" fill="#9a9ea8"/>
      <!-- front screen (bottom-left) -->
      ${touchscreen(38, 208, 44, 22)}
      <text x="158" y="224" text-anchor="end" fill="#6f737c" font-size="12" font-weight="700" font-family="Inter, system-ui, sans-serif" letter-spacing="1.2">${o.model || ''}</text>

      <!-- Z pillars -->
      <rect x="54" y="30" width="16" height="170" rx="4" fill="url(#ucb-light-body)" stroke="#b8bcc4" stroke-width="1"/>
      <rect x="170" y="30" width="16" height="170" rx="4" fill="url(#ucb-light-body)" stroke="#b8bcc4" stroke-width="1"/>
      <rect x="57" y="34" width="2" height="162" rx="1" fill="#fff" opacity="0.7"/>
      <rect x="173" y="34" width="2" height="162" rx="1" fill="#fff" opacity="0.7"/>

      <!-- top crossbar -->
      <rect x="50" y="28" width="140" height="14" rx="5" fill="url(#ucb-light-body)" stroke="#b8bcc4" stroke-width="1"/>

      <!-- X rail -->
      <rect x="62" y="74" width="116" height="8" rx="2" fill="url(#ucb-metal)"/>
      <rect x="62" y="75" width="116" height="1.5" fill="#8a8e98" opacity="0.6"/>

      ${toolhead(cx, 62, o.accent, !!o.heating)}

      <!-- part fan on toolhead side -->
      ${fan(190, 86, 8, o.accent)}

      <!-- bed -->
      ${printObject(cx, 184, o.printing ? o.progress : null, o.accent)}
      ${bed(52, 184, 136, o.accent, false)}
      <rect x="66" y="197" width="108" height="3" rx="1.5" fill="#15171c"/>

    </svg>
  `;
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

export function renderPrinterIllustration(
  family: Family | undefined,
  opts: {
    accent?: string | undefined;
    customImage?: string | undefined;
    model?: string | undefined;
    progress?: number | null | undefined;
    printing?: boolean | undefined;
    lightOn?: boolean | null | undefined;
    heating?: boolean | undefined;
    fanOn?: boolean | undefined;
  } = {}
): TemplateResult {
  const accent = opts.accent || 'var(--primary-color, #03a9f4)';
  if (opts.customImage) {
    return html`<img class="uc-bambu-photo" src=${opts.customImage} alt="" loading="lazy" />`;
  }
  const o: DrawOpts = {
    accent,
    model: opts.model,
    progress: opts.progress,
    printing: opts.printing === true,
    lightOn: opts.lightOn,
    heating: opts.heating === true,
    fanOn: opts.fanOn === true,
  };
  const f = family || 'enclosed_corexy';
  if (f === 'bedslinger') return bedslingerSvg(o);
  if (f === 'h2') return h2Svg(o);
  return enclosedSvg(o);
}

function hotspotBadge(
  label: string,
  value: string,
  x: number,
  y: number,
  opts: { accent?: string; glow?: boolean; entityId?: string | undefined; index?: number } = {}
): TemplateResult {
  const click = opts.entityId ? (e: Event) => fireMoreInfo(e, opts.entityId) : undefined;
  return html`
    <div
      class="uc-bambu-hotspot ${opts.glow ? 'glow' : ''} ${click ? 'is-clickable' : ''}"
      style="left:${x * 100}%;top:${y * 100}%;--hotspot-accent:${opts.accent || 'var(--primary-color)'};--i:${opts.index ?? 0}"
      role=${click ? 'button' : nothing}
      tabindex=${click ? '0' : nothing}
      @click=${click}
    >
      <span class="hs-value">${value}</span>
      <span class="hs-label">${label}</span>
    </div>
  `;
}

export function renderPrinterWithHotspots(
  snap: PrinterSnapshot,
  opts: {
    accent?: string | undefined;
    customImage?: string | undefined;
    showTemps?: boolean | undefined;
    showProgress?: boolean | undefined;
    /** Farm tiles: value-only badges, no screen/progress overlays. */
    compact?: boolean | undefined;
    animation?: 'off' | 'subtle' | 'full' | undefined;
  } = {}
): TemplateResult {
  const family = (snap.modelFamily as Family) || 'enclosed_corexy';
  const geo = geometryForFamily(family);
  const anchors = geo.anchors;
  const accent = opts.accent || 'var(--primary-color, #03a9f4)';
  const heatingNozzle = isHeating(snap.nozzleTemp, snap.nozzleTarget);
  const heatingBed = isHeating(snap.bedTemp, snap.bedTarget);
  const anim = opts.animation || 'full';
  const printing = snap.status === 'printing' || snap.status === 'preparing';
  // Spin from real fan data when we have it; otherwise assume the part fan
  // runs while printing so the illustration still comes alive.
  const reported = snap.fans.filter(f => f.percent != null);
  const fanPct = reported.length
    ? Math.max(0, ...reported.map(f => f.percent || 0))
    : printing
      ? 60
      : 0;
  const fanOn = fanPct > 0;

  return html`
    <div
      class="uc-bambu-stage anim-${anim} ${fanOn ? 'fan-on' : ''} ${printing ? 'printing' : ''} ${opts.compact ? 'compact' : ''} ${snap.status}"
      style="aspect-ratio:${geo.w}/${geo.h};${fanOn ? `--fan-duration:${Math.max(0.35, 2.4 - fanPct / 50)}s;` : ''}"
    >
      ${renderPrinterIllustration(family, {
        accent,
        customImage: opts.customImage,
        model: snap.model,
        progress: snap.progress,
        printing,
        lightOn: snap.lightOn,
        heating: heatingNozzle,
        fanOn,
      })}
      ${opts.showTemps !== false
        ? html`
            ${hotspotBadge(
              'Nozzle',
              snap.nozzleTemp == null ? '—' : `${Math.round(snap.nozzleTemp)}°`,
              anchors.nozzle.x,
              anchors.nozzle.y,
              {
                accent: '#ff9800',
                glow: heatingNozzle && anim !== 'off',
                entityId: snap.refs.nozzleTemp,
                index: 1,
              }
            )}
            ${hotspotBadge(
              'Bed',
              snap.bedTemp == null ? '—' : `${Math.round(snap.bedTemp)}°`,
              anchors.bed.x,
              anchors.bed.y,
              {
                accent: '#e91e63',
                glow: heatingBed && anim !== 'off',
                entityId: snap.refs.bedTemp,
                index: 2,
              }
            )}
            ${anchors.chamber && snap.chamberTemp != null
              ? hotspotBadge(
                  'Chamber',
                  `${Math.round(snap.chamberTemp)}°`,
                  anchors.chamber.x,
                  anchors.chamber.y,
                  { accent: '#2196f3', entityId: snap.refs.chamberTemp, index: 3 }
                )
              : nothing}
          `
        : nothing}
      ${!opts.compact
        ? html`<div
            class="uc-bambu-screen ${snap.refs.status ? 'is-clickable' : ''}"
            style="left:${anchors.screen.x * 100}%;top:${anchors.screen.y * 100}%;--i:0"
            @click=${snap.refs.status
              ? (e: Event) => fireMoreInfo(e, snap.refs.status)
              : undefined}
          >
            <span class="screen-status">${snap.statusRaw || snap.status}</span>
            ${snap.progress != null
              ? html`<span class="screen-pct">${Math.round(snap.progress)}%</span>`
              : nothing}
          </div>`
        : nothing}
      ${!opts.compact && opts.showProgress !== false && snap.progress != null && anchors.progress
        ? html`<div
            class="uc-bambu-progress-badge ${snap.refs.progress ? 'is-clickable' : ''}"
            style="left:${anchors.progress.x * 100}%;top:${anchors.progress.y * 100}%;--i:4"
            @click=${snap.refs.progress ? (e: Event) => fireMoreInfo(e, snap.refs.progress) : undefined}
          >
            ${Math.round(snap.progress)}%
          </div>`
        : nothing}
    </div>
  `;
}

/**
 * AMS housing; 4 slots for AMS / Lite / 2 Pro, 1 slot for AMS HT and external
 * spool holders. Slots open the tray entity. `name` labels the unit when a
 * printer has several.
 */
export function renderAmsIllustration(
  trays: PrinterTray[],
  opts: {
    model?: string | undefined;
    name?: string | undefined;
    humidityIndex?: number | null | undefined;
    compact?: boolean | undefined;
    humidityEntityId?: string | undefined;
    /** Force slot count; defaults to 1 for HT/external, otherwise 4. */
    slotCount?: number | undefined;
  } = {}
): TemplateResult {
  const model = opts.model || '';
  const single = /\bHT\b/i.test(model) || /external/i.test(model);
  const count = opts.slotCount ?? (single ? Math.max(1, trays.length) : 4);
  const slots = Array.from({ length: count }, (_, i) => trays[i] || null);
  const isLite = /lite/i.test(model);
  return html`
    <div
      class="uc-bambu-ams ${isLite ? 'lite' : ''} ${opts.compact ? 'compact' : ''} ${count === 1
        ? 'single'
        : ''}"
      style="--ams-slots:${count}"
    >
      <div class="ams-lid"></div>
      ${opts.name ? html`<div class="ams-name" title=${opts.name}>${opts.name}</div>` : nothing}
      <div class="ams-body">
        ${slots.map((t, i) => {
          if (!t) {
            return html`<div class="ams-slot empty"><span class="slot-num">${i + 1}</span></div>`;
          }
          const color = t.empty ? 'rgba(127,127,127,0.22)' : t.color || '#888';
          const click = t.entityId ? (e: Event) => fireMoreInfo(e, t.entityId) : undefined;
          return html`
            <div
              class="ams-slot ${t.active ? 'active' : ''} ${t.empty ? 'empty' : ''} ${click ? 'is-clickable' : ''}"
              role=${click ? 'button' : nothing}
              tabindex=${click ? '0' : nothing}
              title=${t.name || t.type || `Slot ${i + 1}`}
              @click=${click}
            >
              <div class="spool" style="--c:${color}">
                <div class="spool-ring"></div>
                <div class="spool-inner"></div>
              </div>
              <span class="mat">${t.empty ? 'Empty' : t.type || '—'}</span>
              ${t.remain != null && t.remain >= 0
                ? html`<span class="remain">${Math.round(t.remain)}%</span>`
                : nothing}
            </div>
          `;
        })}
      </div>
      ${opts.humidityIndex != null
        ? html`<div
            class="ams-hum ${opts.humidityEntityId ? 'is-clickable' : ''}"
            title="Humidity index"
            @click=${opts.humidityEntityId ? (e: Event) => fireMoreInfo(e, opts.humidityEntityId) : undefined}
          >
            <ha-icon icon="mdi:water-percent"></ha-icon>${opts.humidityIndex}
          </div>`
        : nothing}
    </div>
  `;
}

/** Validate hotspot anchors stay within 0..1 (used by tests). */
export function hotspotBoundsOk(family: Family): boolean {
  const a = anchorsForFamily(family);
  const pts = [a.nozzle, a.bed, a.screen, a.chamber, a.fan, a.progress].filter(Boolean) as Array<{
    x: number;
    y: number;
  }>;
  return pts.every(p => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1);
}
