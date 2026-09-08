/**
 * Gate: every module source that references `--uc-pane-*` tokens must announce
 * `data-uc-role="pane"` on a painted surface (so glass backdrop-filter from
 * UC_THEME_BASE_CSS can apply). Intentional carve-outs are listed below.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const MODULES_DIR = path.resolve(__dirname, '../../modules');

/** Files that may mention pane tokens without a live pane wrapper. */
const PANE_ROLE_CARVE_OUTS: Readonly<Record<string, string>> = {
  // Template stub, not shipped.
  '_module-template.ts': 'template only',
  // Stylesheet-only UniFi chrome; rack-view.ts owns the role attribute.
  'unifi/styles.ts': 'CSS companion to rack-view.ts',
  // Full-bleed background layer, not a nested pane.
  'video-bg-module.ts': 'full-bleed background',
  // Orphaned `.entity-item` CSS only — runtime chrome does not use pane vars.
  'info-module.ts': 'dead CSS; no live pane wrapper',
  'graphs-module.ts': 'dead CSS; no live pane wrapper',
};

function walk(dir: string, base = ''): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, rel));
    else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
      out.push(rel);
    }
  }
  return out;
}

describe('pane role adoption', () => {
  const files = walk(MODULES_DIR);
  const paneVarFiles = files.filter(rel => {
    const src = fs.readFileSync(path.join(MODULES_DIR, rel), 'utf8');
    return /--uc-pane/.test(src);
  });

  it('every pane-token module announces data-uc-role="pane" (or is carved out)', () => {
    const missing: string[] = [];
    for (const rel of paneVarFiles) {
      if (PANE_ROLE_CARVE_OUTS[rel]) continue;
      const src = fs.readFileSync(path.join(MODULES_DIR, rel), 'utf8');
      if (!/data-uc-role=["']pane["']/.test(src)) {
        missing.push(rel);
      }
    }
    expect(missing, `Missing data-uc-role="pane" in: ${missing.join(', ')}`).toEqual([]);
  });

  it('carve-outs are still present and documented', () => {
    for (const rel of Object.keys(PANE_ROLE_CARVE_OUTS)) {
      expect(
        fs.existsSync(path.join(MODULES_DIR, rel)),
        `Carve-out file missing: ${rel}`
      ).toBe(true);
    }
  });

  it('entity wrappers (fan, lock, media_player) use pane tokens + role', () => {
    for (const rel of ['fan-module.ts', 'lock-module.ts', 'media-player-module.ts']) {
      const src = fs.readFileSync(path.join(MODULES_DIR, rel), 'utf8');
      expect(src, rel).toMatch(/--uc-pane-bg/);
      expect(src, rel).toMatch(/data-uc-role=["']pane["']/);
    }
  });

  it('priority solid wrappers (alarm, solar, light, vacuum, timer, climate) use pane tokens + role', () => {
    for (const rel of [
      'alarm-panel-module.ts',
      'solar-analytics-module.ts',
      'light-module.ts',
      'vacuum-module.ts',
      'timer-module.ts',
      'climate-module.ts',
    ]) {
      const src = fs.readFileSync(path.join(MODULES_DIR, rel), 'utf8');
      expect(src, rel).toMatch(/--uc-pane-bg/);
      expect(src, rel).toMatch(/data-uc-role=["']pane["']/);
    }
  });

  it('batch-2 solid wrappers (vampire, toggle, alert, calendar) use pane tokens + role', () => {
    for (const rel of [
      'vampire-power-module.ts',
      'toggle-module.ts',
      'alert-center-module.ts',
      'calendar-module.ts',
    ]) {
      const src = fs.readFileSync(path.join(MODULES_DIR, rel), 'utf8');
      expect(src, rel).toMatch(/--uc-pane-bg/);
      expect(src, rel).toMatch(/data-uc-role=["']pane["']/);
    }
  });

  it('batch-3 surfaces (map, external-card, scroll-row, lunar, sports, vehicle) use pane tokens + role', () => {
    for (const rel of [
      'map-module.ts',
      'external-card-module.ts',
      'scroll-row-module.ts',
      'lunar-phase-module.ts',
      'sports-score-module.ts',
      'vehicle-maintenance-module.ts',
    ]) {
      const src = fs.readFileSync(path.join(MODULES_DIR, rel), 'utf8');
      expect(src, rel).toMatch(/--uc-pane-bg/);
      expect(src, rel).toMatch(/data-uc-role=["']pane["']/);
    }
  });
  it('batch-4 residuals (screensaver, status-summary, area-summary, appliance, dog-duty, battery-fleet) use pane tokens + role', () => {
    for (const rel of [
      'screensaver-module.ts',
      'status-summary-module.ts',
      'area-summary-module.ts',
      'appliance-module.ts',
      'dog-duty-module.ts',
      'battery-fleet-module.ts',
      'animated-clock-module.ts',
    ]) {
      const src = fs.readFileSync(path.join(MODULES_DIR, rel), 'utf8');
      expect(src, rel).toMatch(/--uc-pane-bg/);
      expect(src, rel).toMatch(/data-uc-role=["']pane["']/);
    }
  });

  it('batch-5 residual color-mix/solid surfaces keep pane tokens + role', () => {
    for (const rel of [
      'fan-module.ts',
      'lock-module.ts',
      'alarm-panel-module.ts',
      'solar-analytics-module.ts',
      'separator-module.ts',
      'tabs-module.ts',
      'stack-module.ts',
    ]) {
      const src = fs.readFileSync(path.join(MODULES_DIR, rel), 'utf8');
      expect(src, rel).toMatch(/--uc-pane-bg/);
      expect(src, rel).toMatch(/data-uc-role=["']pane["']/);
    }
  });

});
