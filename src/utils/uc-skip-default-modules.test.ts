import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getSkipDefaultModules,
  setSkipDefaultModules,
  SKIP_DEFAULT_MODULES_KEY,
  SKIP_DEFAULT_MODULES_LEGACY_KEY,
} from './uc-skip-default-modules';
import { UltraCard } from '../cards/ultra-card';

describe('Start with Empty Card setting', () => {
  beforeEach(() => {
    localStorage.clear();
    delete (globalThis as any).__ultraCardSkipDefaultModules;
  });
  afterEach(() => localStorage.clear());

  it('is off by default', () => {
    expect(getSkipDefaultModules()).toBe(false);
  });

  it('honours the key written by shipped Hub builds', () => {
    localStorage.setItem(SKIP_DEFAULT_MODULES_LEGACY_KEY, 'true');
    expect(getSkipDefaultModules()).toBe(true);
  });

  it('legacy Hub turning it off wins over the newer key', () => {
    localStorage.setItem(SKIP_DEFAULT_MODULES_KEY, 'true');
    localStorage.setItem(SKIP_DEFAULT_MODULES_LEGACY_KEY, 'false');
    expect(getSkipDefaultModules()).toBe(false);
  });

  it('set writes both keys', () => {
    setSkipDefaultModules(true);
    expect(localStorage.getItem(SKIP_DEFAULT_MODULES_KEY)).toBe('true');
    expect(localStorage.getItem(SKIP_DEFAULT_MODULES_LEGACY_KEY)).toBe('true');
    setSkipDefaultModules(false);
    expect(getSkipDefaultModules()).toBe(false);
  });

  it('getStubConfig returns an empty column when enabled', () => {
    localStorage.setItem(SKIP_DEFAULT_MODULES_LEGACY_KEY, 'true');
    const cfg = UltraCard.getStubConfig();
    expect(cfg.layout!.rows[0].columns[0].modules).toEqual([]);
  });

  it('getStubConfig keeps starter modules when disabled', () => {
    const cfg = UltraCard.getStubConfig();
    expect(cfg.layout!.rows[0].columns[0].modules.length).toBeGreaterThan(0);
  });
});
