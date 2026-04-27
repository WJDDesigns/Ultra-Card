/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  resolveUltraCardModulePreloadMode,
  scheduleBackgroundModulePreloads,
} from './uc-module-preload-scheduler';

describe('resolveUltraCardModulePreloadMode', () => {
  beforeEach(() => {
    delete (window as Window & { __ultraCardModulePreload?: string }).__ultraCardModulePreload;
    localStorage.removeItem('ultra-card-module-preload');
  });

  it('defaults to batched', () => {
    expect(resolveUltraCardModulePreloadMode()).toBe('batched');
  });

  it('reads window.__ultraCardModulePreload', () => {
    (window as Window & { __ultraCardModulePreload?: string }).__ultraCardModulePreload = 'full';
    expect(resolveUltraCardModulePreloadMode()).toBe('full');
  });

  it('maps off to minimal', () => {
    (window as Window & { __ultraCardModulePreload?: string }).__ultraCardModulePreload = 'off';
    expect(resolveUltraCardModulePreloadMode()).toBe('minimal');
  });

  it('reads localStorage when window unset', () => {
    localStorage.setItem('ultra-card-module-preload', 'minimal');
    expect(resolveUltraCardModulePreloadMode()).toBe('minimal');
  });

  it('window wins over localStorage', () => {
    localStorage.setItem('ultra-card-module-preload', 'minimal');
    (window as Window & { __ultraCardModulePreload?: string }).__ultraCardModulePreload = 'full';
    expect(resolveUltraCardModulePreloadMode()).toBe('full');
  });
});

describe('scheduleBackgroundModulePreloads', () => {
  beforeEach(() => {
    delete (window as Window & { __ultraCardModulePreload?: string }).__ultraCardModulePreload;
    localStorage.removeItem('ultra-card-module-preload');
    vi.stubGlobal(
      'requestIdleCallback',
      (cb: IdleRequestCallback) => {
        queueMicrotask(() =>
          cb({
            didTimeout: false,
            timeRemaining: () => 50,
          } as IdleDeadline)
        );
        return 1;
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('skips when mode is minimal', () => {
    (window as Window & { __ultraCardModulePreload?: string }).__ultraCardModulePreload = 'minimal';
    const ensure = vi.fn().mockResolvedValue(undefined);
    scheduleBackgroundModulePreloads({
      getAllModuleMetadata: () => [{ type: 'a' }, { type: 'b' }],
      canLoadModule: () => true,
      ensureModuleLoaded: ensure,
    } as any);
    expect(ensure).not.toHaveBeenCalled();
  });

  it('only preloads types with loaders', async () => {
    const registry = {
      getAllModuleMetadata: () => [{ type: 'a' }, { type: 'no_loader' }],
      canLoadModule: (t: string) => t === 'a',
      ensureModuleLoaded: vi.fn().mockResolvedValue(undefined),
    };
    scheduleBackgroundModulePreloads(registry as any);
    await vi.waitFor(() => expect(registry.ensureModuleLoaded).toHaveBeenCalledTimes(1));
    expect(registry.ensureModuleLoaded).toHaveBeenCalledWith('a');
  });

  it('full mode starts every load without waiting', async () => {
    (window as Window & { __ultraCardModulePreload?: string }).__ultraCardModulePreload = 'full';
    const types = ['a', 'b', 'c', 'd'];
    let peak = 0;
    let inflight = 0;
    const ensure = vi.fn().mockImplementation(async () => {
      inflight++;
      peak = Math.max(peak, inflight);
      await Promise.resolve();
      inflight--;
    });
    const registry = {
      getAllModuleMetadata: () => types.map(type => ({ type })),
      canLoadModule: () => true,
      ensureModuleLoaded: ensure,
    };
    scheduleBackgroundModulePreloads(registry as any);
    await vi.waitFor(() => expect(ensure).toHaveBeenCalledTimes(4));
    expect(peak).toBe(4);
  });

  it('batched mode caps concurrency at 3', async () => {
    const types = ['a', 'b', 'c', 'd', 'e'];
    let peak = 0;
    let inflight = 0;
    const ensure = vi.fn().mockImplementation(async () => {
      inflight++;
      peak = Math.max(peak, inflight);
      await Promise.resolve();
      inflight--;
    });
    const registry = {
      getAllModuleMetadata: () => types.map(type => ({ type })),
      canLoadModule: () => true,
      ensureModuleLoaded: ensure,
    };
    scheduleBackgroundModulePreloads(registry as any);
    await vi.waitFor(() => expect(ensure).toHaveBeenCalledTimes(5));
    expect(peak).toBeLessThanOrEqual(3);
  });
});
