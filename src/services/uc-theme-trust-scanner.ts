/**
 * What a downloaded theme can do to you once installed.
 *
 * The sanitiser (`sanitizeThemeDefinition`) already refuses CSS that reaches
 * outside the browser (`url()` other than inline `data:image/*` artwork,
 * `@import`, `@font-face`, expressions). What is
 * left is still worth a look before it lands on every card: custom CSS can hide
 * or cover controls, a palette override recolours Home Assistant variables on
 * the card, and a preview image tells its host that you looked at the theme.
 * Nothing here blocks; findings are shown so the user can decide.
 */

import type { UcThemeDefinition } from '../themes/uc-theme-types';

export interface UcThemeCssFinding {
  /** Human-readable reason, e.g. "hides elements (display: none)". */
  reason: string;
  /** Selectors of the rules that triggered it, deduplicated. */
  selectors: string[];
}

export interface UcThemeRiskFindings {
  /** Non-empty when the theme ships custom CSS. */
  css: { lines: number; rules: number; findings: UcThemeCssFinding[] } | null;
  /** HA variables the theme pins (`primary`, `card_bg`, ...). */
  paletteOverrides: string[];
  /** Third-party hosts contacted when the preview image is shown. */
  remoteHosts: string[];
  /** The theme paints the Lovelace view behind its cards. */
  pageBackground: string | null;
  hasAny: boolean;
}

const BENIGN_HOST_SUFFIXES = ['ultracard.io', 'home-assistant.io'];

const CSS_CHECKS: Array<{ re: RegExp; reason: string }> = [
  { re: /display\s*:\s*none/i, reason: 'hides elements (display: none)' },
  { re: /visibility\s*:\s*hidden/i, reason: 'hides elements (visibility: hidden)' },
  { re: /opacity\s*:\s*0(?:\.0+)?\s*[;}]/i, reason: 'makes elements invisible (opacity: 0)' },
  { re: /pointer-events\s*:\s*none/i, reason: 'disables clicks (pointer-events: none)' },
  { re: /position\s*:\s*(fixed|sticky)/i, reason: 'positions content over the page (position: fixed/sticky)' },
  { re: /z-index\s*:\s*\d{4,}/i, reason: 'very high z-index (may cover dialogs)' },
  { re: /content\s*:\s*["'][^"']+["']/i, reason: 'injects text (content: "...")' },
  { re: /url\(\s*["']?data:image\//i, reason: 'ships inline artwork (data: images)' },
];

const OUTSIDE_CARD_SELECTOR = /(^|[\s,>+~])(:host|html|body|ha-card|hui-[a-z-]+|home-assistant[a-z-]*)(?![\w-])/i;

function isBenignHost(host: string): boolean {
  const lower = host.toLowerCase();
  return BENIGN_HOST_SUFFIXES.some(s => lower === s || lower.endsWith(`.${s}`));
}

/** Split CSS into `{ selector, body }` pairs; tolerant of nested at-rules. */
function splitRules(css: string): Array<{ selector: string; body: string }> {
  const rules: Array<{ selector: string; body: string }> = [];
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let depth = 0;
  let selectorStart = 0;
  let bodyStart = -1;
  let selector = '';
  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];
    if (ch === '{') {
      if (depth === 0) {
        selector = stripped.slice(selectorStart, i).trim();
        bodyStart = i + 1;
      }
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && bodyStart >= 0) {
        rules.push({ selector, body: stripped.slice(bodyStart, i) });
        selectorStart = i + 1;
        bodyStart = -1;
      } else if (depth < 0) {
        depth = 0;
      }
    }
  }
  return rules;
}

export function scanThemeCss(css: string | undefined): UcThemeRiskFindings['css'] {
  if (!css || !css.trim()) return null;
  const rules = splitRules(css);
  const byReason = new Map<string, Set<string>>();
  const add = (reason: string, selector: string) => {
    const set = byReason.get(reason) ?? new Set<string>();
    set.add(selector || '(at-rule)');
    byReason.set(reason, set);
  };

  for (const rule of rules) {
    if (OUTSIDE_CARD_SELECTOR.test(rule.selector)) {
      add('targets the card host or Home Assistant chrome', rule.selector);
    }
    for (const check of CSS_CHECKS) {
      if (check.re.test(rule.body + '}')) add(check.reason, rule.selector);
    }
  }

  const findings: UcThemeCssFinding[] = Array.from(byReason, ([reason, selectors]) => ({
    reason,
    selectors: Array.from(selectors).sort().slice(0, 8),
  })).sort((a, b) => a.reason.localeCompare(b.reason));

  return { lines: css.split('\n').length, rules: rules.length, findings };
}

export function scanThemeForRisks(theme: UcThemeDefinition | null | undefined): UcThemeRiskFindings {
  const empty: UcThemeRiskFindings = {
    css: null,
    paletteOverrides: [],
    remoteHosts: [],
    pageBackground: null,
    hasAny: false,
  };
  if (!theme) return empty;

  const css = scanThemeCss(theme.css);
  const paletteOverrides = Object.entries(theme.tokens?.palette ?? {})
    .filter(([, v]) => !!v)
    .map(([k]) => k)
    .sort();

  const remoteHosts: string[] = [];
  if (theme.preview && /^https?:\/\//i.test(theme.preview)) {
    try {
      const host = new URL(theme.preview).hostname;
      if (host && !isBenignHost(host)) remoteHosts.push(host);
    } catch {
      /* not a URL */
    }
  }

  const pageBackground = theme.tokens?.page_background?.trim() || null;
  const findings: UcThemeRiskFindings = { css, paletteOverrides, remoteHosts, pageBackground, hasAny: false };
  findings.hasAny = !!css || paletteOverrides.length > 0 || remoteHosts.length > 0 || !!pageBackground;
  return findings;
}

/** Plain-text summary for a confirm dialog. */
export function describeThemeRisks(findings: UcThemeRiskFindings): string[] {
  const lines: string[] = [];
  if (findings.css) {
    lines.push(`Custom CSS: ${findings.css.rules} rule${findings.css.rules === 1 ? '' : 's'} (${findings.css.lines} lines).`);
    for (const f of findings.css.findings) {
      lines.push(`  - ${f.reason}: ${f.selectors.join(', ')}`);
    }
  }
  if (findings.pageBackground) {
    lines.push(`Paints the dashboard background behind its cards (${findings.pageBackground.slice(0, 60)}).`);
  }
  if (findings.paletteOverrides.length) {
    lines.push(`Overrides Home Assistant colours on the card: ${findings.paletteOverrides.join(', ')}.`);
  }
  if (findings.remoteHosts.length) {
    lines.push(`Loads its preview image from: ${findings.remoteHosts.join(', ')}.`);
  }
  return lines;
}
