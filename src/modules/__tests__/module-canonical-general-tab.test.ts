import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Extract `renderGeneralTab` method body (brace-balanced) for static linting.
 */
function extractRenderGeneralTabSource(fileContent: string): string | null {
  const idx = fileContent.indexOf('renderGeneralTab');
  if (idx === -1) return null;
  const braceOpen = fileContent.indexOf('{', idx);
  if (braceOpen === -1) return null;
  let depth = 0;
  for (let i = braceOpen; i < fileContent.length; i++) {
    const c = fileContent[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        return fileContent.slice(braceOpen + 1, i);
      }
    }
  }
  return null;
}

const MODULES_DIR = path.join(__dirname, '..');

const EXCLUDED_FILES = new Set([
  'base-module.ts',
  '_module-template.ts',
  'index.ts',
  'module-loaders.ts',
  'module-manifest-data.ts',
  'module-registry.ts',
  'module-registry-load-error.test.ts',
  'animated-clock-module-editor.ts',
  'animated-forecast-module-editor.ts',
  'animated-weather-module-editor.ts',
  'calendar-module-views.ts',
]);

/**
 * Modules whose `renderGeneralTab` must pass the canonical anti-pattern checks.
 * Goal is full coverage of `src/modules/*-module.ts` (excluding EXCLUDED_FILES and the
 * NON_ENFORCED list below for documented carve-outs).
 */
const CANONICAL_ENFORCED_MODULES = new Set([
  // Phase 1
  'image-module.ts',
  'climate-module.ts',
  'vacuum-module.ts',
  // Phase 2 + Phase 3 batches
  'accordion-module.ts',
  'activity-feed-module.ts',
  'alarm-panel-module.ts',
  'alert-center-module.ts',
  'animated-clock-module.ts',
  'animated-forecast-module.ts',
  'animated-weather-module.ts',
  'area-summary-module.ts',
  'auto-entity-list-module.ts',
  'background-module.ts',
  'badge-of-honor-module.ts',
  'bar-module.ts',
  'battery-monitor-module.ts',
  'boolean-input-module.ts',
  'button-input-module.ts',
  'button-module.ts',
  'calendar-module.ts',
  'camera-module.ts',
  'color-input-module.ts',
  'counter-input-module.ts',
  'cover-module.ts',
  'datetime-input-module.ts',
  'dropdown-module.ts',
  'dynamic-list-module.ts',
  'dynamic-weather-module.ts',
  'energy-display-module.ts',
  'external-card-module.ts',
  'fan-module.ts',
  'gauge-module.ts',
  'graphs-module.ts',
  'grid-module.ts',
  'horizontal-module.ts',
  'icon-module.ts',
  'info-module.ts',
  'light-module.ts',
  'living-canvas-module.ts',
  'lock-module.ts',
  'map-module.ts',
  'markdown-module.ts',
  'media-player-module.ts',
  'native-card-module.ts',
  'navigation-module.ts',
  'number-input-module.ts',
  'pagebreak-module.ts',
  'people-module.ts',
  'popup-module.ts',
  'qr-code-module.ts',
  'screensaver-module.ts',
  'select-input-module.ts',
  'separator-module.ts',
  'slider-control-module.ts',
  'slider-input-module.ts',
  'slider-module.ts',
  'solar-analytics-module.ts',
  'spinbox-module.ts',
  'sports-score-module.ts',
  'stack-module.ts',
  'status-summary-module.ts',
  'tabs-module.ts',
  'text-input-module.ts',
  'text-module.ts',
  'timer-module.ts',
  'toggle-module.ts',
  'vertical-module.ts',
  'video-bg-module.ts',
  'virtual-pet-module.ts',
]);

/**
 * Documented carve-outs: modules that use a forbidden marker for a specific reason and
 * shouldn't be force-migrated yet. Track each one with an explicit reason so future
 * cleanup work can revisit. (Empty at the moment — separator-module's dual-mode width
 * control was migrated to `renderUnitAwareSliderField` so it now passes the canonical
 * checks like every other module.)
 */
const NON_ENFORCED_REASON: Record<string, string> = {};

const FORBIDDEN: { name: string; re: RegExp }[] = [
  { name: '<input type="file"', re: /<input\s+[^>]*type\s*=\s*["']file["']/i },
  /**
   * Raw `<input type="checkbox">` produces a visually distinct toggle switch
   * (Template Mode style) that doesn't match HA's standard switch. Use
   * `renderUcForm + booleanField` so toggles look identical across modules.
   */
  { name: '<input type="checkbox" (use booleanField)', re: /<input\s+[^>]*type\s*=\s*["']checkbox["']/i },
  { name: '<ha-switch', re: /<ha-switch\b/i },
  { name: '<ha-icon-picker', re: /<ha-icon-picker\b/i },
  /**
   * NOTE: `<ha-textfield>` is intentionally NOT in this forbidden list. It has
   * legitimate special uses (password type, leadingIcon / suffix slots, number
   * type with min/max/step) that can't be reproduced through `textField`. Prefer
   * `this.renderFieldSection(...) + this.textField('name')` for plain text inputs
   * — but bare `<ha-textfield>` is allowed when special HA features are needed.
   */
  {
    name: 'nested injectUcFormStyles in <style>',
    re: /<style>[\s\S]*?\$\{[^}]*injectUcFormStyles\s*\(\)/i,
  },
  { name: 'raw HTML <select', re: /<select\b/i },
  /**
   * Custom pill / segmented button class names. All of these should be replaced by
   * `renderSegmentedField` so toggles look identical across modules.
   */
  {
    name: 'option-btn pill row (use renderSegmentedField)',
    re: /class\s*=\s*["'][^"']*\boption-btn\b[^"']*["']/i,
  },
  {
    name: 'layout-style-option div (use renderSegmentedField)',
    re: /class\s*=\s*["'][^"']*\blayout-style-option\b[^"']*["']/i,
  },
  {
    name: 'view-mode-btn (use renderSegmentedField)',
    re: /class\s*=\s*["'][^"']*\bview-mode-btn\b[^"']*["']/i,
  },
  {
    name: 'style-btn (use renderSegmentedField)',
    re: /class\s*=\s*["'][^"']*\bstyle-btn\b[^"']*["']/i,
  },
  {
    name: 'control-button-group (use renderSegmentedField)',
    re: /class\s*=\s*["'][^"']*\bcontrol-button-group\b[^"']*["']/i,
  },
  {
    name: 'position-option (use renderSegmentedField)',
    re: /class\s*=\s*["'][^"']*\bposition-option\b[^"']*["']/i,
  },
  {
    name: 'position-grid (use renderSegmentedField)',
    re: /class\s*=\s*["'][^"']*\bposition-grid\b[^"']*["']/i,
  },
  {
    name: 'alignment-btn (use renderSegmentedField)',
    re: /class\s*=\s*["'][^"']*\balignment-btn\b[^"']*["']/i,
  },
  {
    name: 'orientation-btn (use renderSegmentedField)',
    re: /class\s*=\s*["'][^"']*\borientation-btn\b[^"']*["']/i,
  },
  {
    name: 'species-btn (use renderSegmentedField)',
    re: /class\s*=\s*["'][^"']*\bspecies-btn\b[^"']*["']/i,
  },
  /**
   * Bespoke filter-chip + chip-remove pattern. Use `renderChipListField`
   * (mode: 'free-text', variant: 'primary' | 'exclude') instead.
   */
  {
    name: 'filter-chip (use renderChipListField)',
    re: /class\s*=\s*["'][^"']*\bfilter-chip\b[^"']*["']/i,
  },
  /**
   * Hand-written `<div class="conditional-fields-group">` was being used as a
   * generic conditional wrapper, but its CSS adds a primary-colored left accent
   * bar + tinted background — that visual style is reserved for *labelled*
   * sub-sections (Template Mode, Animation Trigger, etc.) and looks wrong when
   * applied to plain "show these fields when a toggle is on" groups. The
   * canonical helper `renderConditionalFieldsGroup(header, content)` forces a
   * header so the accent is always paired with a label; for unlabeled
   * conditional reveals use a plain `<div>` so the parent `.settings-section`
   * provides the only frame.
   */
  {
    name: 'bare <div class="conditional-fields-group"> (use renderConditionalFieldsGroup with header, or plain <div>)',
    re: /<div\s+[^>]*class\s*=\s*["'][^"']*\bconditional-fields-group\b[^"']*["'][^>]*>(?!\s*<div\s+class\s*=\s*["'][^"']*\bconditional-fields-header\b)/i,
  },
];

/**
 * Why we previously missed the gauge-module "settings-section without a visible
 * box" regression: the static checks below only test what `renderGeneralTab`
 * *contains* (forbidden markup), not how the surrounding `.settings-section`
 * actually *renders*. Gauge-module wrote `<div class="settings-section">` with
 * no inline background/padding, so it looked invisible — the only visible
 * frame was the inner `.conditional-fields-group` accent bar. The forbidden
 * list never caught it because the class name itself is correct.
 *
 * The shared stylesheet (`getCleanFormStyles` in `src/utils/uc-form-utils.ts`)
 * is now the single source of truth for the box look, so a bare
 * `<div class="settings-section">` renders identically to one with inline
 * styles. The test below guards that invariant so a future refactor cannot
 * silently remove the visual styling again.
 */
describe('shared settings-section CSS (regression guard)', () => {
  it('getCleanFormStyles defines a visible .settings-section box', () => {
    const cssPath = path.join(__dirname, '../../utils/uc-form-utils.ts');
    const css = fs.readFileSync(cssPath, 'utf8');
    // Pluck the .settings-section { ... } rule out of the stylesheet.
    const match = css.match(/\.settings-section\s*\{([\s\S]*?)\}/);
    expect(match, '.settings-section block must exist in getCleanFormStyles').toBeTruthy();
    const block = match![1];
    expect(block, '.settings-section needs background').toMatch(/background\s*:/);
    expect(block, '.settings-section needs border-radius').toMatch(/border-radius\s*:/);
    expect(block, '.settings-section needs padding').toMatch(/padding\s*:/);
  });
});

describe('module General tab canonical patterns (static)', () => {
  it('enforced modules must not use forbidden markup in renderGeneralTab', () => {
    const files = fs.readdirSync(MODULES_DIR).filter(f => f.endsWith('-module.ts'));

    for (const file of files) {
      if (EXCLUDED_FILES.has(file)) continue;
      if (!CANONICAL_ENFORCED_MODULES.has(file)) continue;

      const full = path.join(MODULES_DIR, file);
      const content = fs.readFileSync(full, 'utf8');
      const body = extractRenderGeneralTabSource(content);
      expect(body, `${file}: renderGeneralTab body`).toBeTruthy();

      for (const { name, re } of FORBIDDEN) {
        expect(re.test(body!), `${file}: forbidden "${name}" in renderGeneralTab`).toBe(false);
      }
    }
  });

  it('every module is either enforced or has a documented carve-out reason', () => {
    const files = fs.readdirSync(MODULES_DIR).filter(f => f.endsWith('-module.ts'));
    const unaccounted: string[] = [];
    for (const file of files) {
      if (EXCLUDED_FILES.has(file)) continue;
      if (CANONICAL_ENFORCED_MODULES.has(file)) continue;
      if (NON_ENFORCED_REASON[file]) continue;
      unaccounted.push(file);
    }
    expect(
      unaccounted,
      `These modules are neither enforced nor have a documented carve-out reason. Add to CANONICAL_ENFORCED_MODULES (preferred) or NON_ENFORCED_REASON with a reason.`
    ).toEqual([]);
  });
});
