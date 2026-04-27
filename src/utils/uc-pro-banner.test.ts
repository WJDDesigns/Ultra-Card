// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  UC_ULTRA_CARD_HASS_READY,
  runUltraCardVersionBanner,
} from './uc-pro-banner';

describe('uc-pro-banner', () => {
  beforeEach(() => {
    delete (window as any).__UC_VERSION_BANNER_PRINTED;
    document.body.innerHTML = '';
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports a stable custom event name', () => {
    expect(UC_ULTRA_CARD_HASS_READY).toBe('uc-ultra-card-hass-ready');
  });

  it('skips print when requireHass and no ultra-card has hass', () => {
    const card = document.createElement('ultra-card');
    document.body.appendChild(card);

    runUltraCardVersionBanner(42, { requireHass: true });

    expect((window as any).__UC_VERSION_BANNER_PRINTED).toBeUndefined();
    expect(console.info).not.toHaveBeenCalled();
  });

  it('prints once and ignores subsequent calls', () => {
    const card = document.createElement('ultra-card');
    (card as any).hass = { states: {} };
    document.body.appendChild(card);

    runUltraCardVersionBanner(3, { requireHass: false });
    runUltraCardVersionBanner(99, { requireHass: false });

    expect(console.info).toHaveBeenCalledTimes(1);
  });
});
