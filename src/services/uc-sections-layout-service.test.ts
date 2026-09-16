import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  findActiveHuiRoot,
  normalizeSectionsLayout,
  sectionsLayoutVars,
  ucSectionsLayoutService,
} from './uc-sections-layout-service';

const MAX_W = '--ha-view-sections-column-max-width';
const GAP = '--ha-view-sections-column-gap';

/**
 * home-assistant > (shadow) home-assistant-main > (shadow) partial-panel-resolver
 *   > ha-panel-lovelace > (shadow) hui-root > (shadow) hui-view > (shadow) card
 */
function mountLovelace(): {
  root: HTMLElement;
  resolver: HTMLElement;
  panelShadow: ShadowRoot;
  addCard: () => HTMLElement;
} {
  const ha = document.createElement('home-assistant');
  const main = document.createElement('home-assistant-main');
  const resolver = document.createElement('partial-panel-resolver');
  const panel = document.createElement('ha-panel-lovelace');
  const root = document.createElement('hui-root');
  const view = document.createElement('hui-view');
  ha.attachShadow({ mode: 'open' }).appendChild(main);
  main.attachShadow({ mode: 'open' }).appendChild(resolver);
  resolver.appendChild(panel);
  const panelShadow = panel.attachShadow({ mode: 'open' });
  panelShadow.appendChild(root);
  root.attachShadow({ mode: 'open' }).appendChild(view);
  const viewShadow = view.attachShadow({ mode: 'open' });
  document.body.appendChild(ha);
  return {
    root,
    resolver,
    panelShadow,
    addCard: () => {
      const card = document.createElement('ultra-card');
      viewShadow.appendChild(card);
      return card;
    },
  };
}

describe('normalizeSectionsLayout', () => {
  it('falls back to HA defaults for garbage', () => {
    expect(normalizeSectionsLayout(null)).toEqual({ mode: 'default', column_max_width: 500 });
    expect(normalizeSectionsLayout({ mode: 'nope', column_max_width: 'x' })).toEqual({
      mode: 'default',
      column_max_width: 500,
    });
  });

  it('clamps widths and gaps', () => {
    expect(normalizeSectionsLayout({ mode: 'custom', column_max_width: 50 }).column_max_width).toBe(200);
    expect(normalizeSectionsLayout({ mode: 'custom', column_max_width: 99999 }).column_max_width).toBe(4000);
    expect(normalizeSectionsLayout({ mode: 'full', column_gap: -4 }).column_gap).toBe(0);
    expect(normalizeSectionsLayout({ mode: 'full', column_gap: 999 }).column_gap).toBe(200);
    expect(normalizeSectionsLayout({ mode: 'full', column_gap: '' }).column_gap).toBeUndefined();
  });
});

describe('sectionsLayoutVars', () => {
  it('emits nothing for the default so HA is left alone', () => {
    expect(sectionsLayoutVars({ mode: 'default', column_max_width: 500, column_gap: 16 })).toEqual({});
  });

  it('maps full and custom to the HA theme variables', () => {
    expect(sectionsLayoutVars({ mode: 'full', column_max_width: 500 })).toEqual({ [MAX_W]: '100vw' });
    expect(sectionsLayoutVars({ mode: 'custom', column_max_width: 800, column_gap: 16 })).toEqual({
      [MAX_W]: '800px',
      [GAP]: '16px',
    });
  });
});

describe('ucSectionsLayoutService', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    ucSectionsLayoutService.reset();
  });

  it('finds the active hui-root through the HA shadow chain', () => {
    expect(findActiveHuiRoot()).toBeNull();
    const { root } = mountLovelace();
    expect(findActiveHuiRoot()).toBe(root);
  });

  it('persists non-default settings and clears storage on reset', () => {
    ucSectionsLayoutService.set({ mode: 'custom', column_max_width: 700 });
    expect(JSON.parse(localStorage.getItem('ultra-card-sections-layout') ?? 'null')).toEqual({
      mode: 'custom',
      column_max_width: 700,
    });
    ucSectionsLayoutService.reset();
    expect(localStorage.getItem('ultra-card-sections-layout')).toBeNull();
  });

  it('paints the active root when the setting changes and unpaints on default', () => {
    const { root } = mountLovelace();
    ucSectionsLayoutService.set({ mode: 'full', column_gap: 24 });
    expect(root.style.getPropertyValue(MAX_W)).toBe('100vw');
    expect(root.style.getPropertyValue(GAP)).toBe('24px');
    expect(root.getAttribute('data-uc-sections-layout')).toBe('full');

    ucSectionsLayoutService.set({ mode: 'default' });
    expect(root.style.getPropertyValue(MAX_W)).toBe('');
    expect(root.style.getPropertyValue(GAP)).toBe('');
    expect(root.hasAttribute('data-uc-sections-layout')).toBe(false);
  });

  it('applies from a card subtree and is a no-op outside a view', () => {
    ucSectionsLayoutService.set({ mode: 'custom', column_max_width: 640 });
    const { root, addCard } = mountLovelace();
    expect(root.style.getPropertyValue(MAX_W)).toBe('');
    ucSectionsLayoutService.touch(addCard());
    expect(root.style.getPropertyValue(MAX_W)).toBe('640px');

    const stray = document.createElement('ultra-card');
    document.body.appendChild(stray);
    ucSectionsLayoutService.touch(stray);
    expect(document.documentElement.style.getPropertyValue(MAX_W)).toBe('');
  });

  it('paints roots that appear after start(), including re-created ones', async () => {
    vi.useFakeTimers();
    try {
      ucSectionsLayoutService.set({ mode: 'full' });
      ucSectionsLayoutService.start();
      // HA shell not there yet: bootstrap keeps retrying.
      vi.advanceTimersByTime(600);
      const { root, resolver, panelShadow } = mountLovelace();
      vi.advanceTimersByTime(300);
      expect(root.style.getPropertyValue(MAX_W)).toBe('100vw');

      // Dashboard reload: ha-panel-lovelace swaps hui-root for a new one.
      root.remove();
      const root2 = document.createElement('hui-root');
      panelShadow.appendChild(root2);
      await Promise.resolve(); // MutationObserver callbacks are microtasks
      expect(root2.style.getPropertyValue(MAX_W)).toBe('100vw');

      // Panel swap: a new ha-panel-lovelace under partial-panel-resolver.
      panelShadow.host.remove();
      const panel3 = document.createElement('ha-panel-lovelace');
      const root3 = document.createElement('hui-root');
      panel3.attachShadow({ mode: 'open' }).appendChild(root3);
      resolver.appendChild(panel3);
      await Promise.resolve();
      expect(root3.style.getPropertyValue(MAX_W)).toBe('100vw');
    } finally {
      vi.useRealTimers();
    }
  });

  it('notifies subscribers once per effective change', () => {
    let n = 0;
    const off = ucSectionsLayoutService.subscribe(() => n++);
    ucSectionsLayoutService.set({ mode: 'full' });
    ucSectionsLayoutService.set({ mode: 'full' });
    expect(n).toBe(1);
    off();
  });
});
