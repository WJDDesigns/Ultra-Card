/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveEditorLovelaceConfig } from './uc-lovelace-config';

function mountHaShell(panelLovelace?: { config?: unknown }): {
  panel: HTMLElement;
  cleanup: () => void;
} {
  const ha = document.createElement('home-assistant');
  const haShadow = ha.attachShadow({ mode: 'open' });
  const main = document.createElement('home-assistant-main');
  const mainShadow = main.attachShadow({ mode: 'open' });
  const panel = document.createElement('ha-panel-lovelace');
  if (panelLovelace) {
    (panel as any).lovelace = panelLovelace;
  }
  mainShadow.appendChild(panel);
  haShadow.appendChild(main);
  document.body.appendChild(ha);
  return {
    panel,
    cleanup: () => {
      document.body.removeChild(ha);
    },
  };
}

describe('resolveEditorLovelaceConfig', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns empty views when no Lovelace panel is present', () => {
    expect(resolveEditorLovelaceConfig()).toEqual({ views: [] });
  });

  it('reads config from the active ha-panel-lovelace', () => {
    const config = { views: [{ title: 'Home', cards: [] }] };
    const { cleanup } = mountHaShell({ config });
    expect(resolveEditorLovelaceConfig()).toEqual(config);
    cleanup();
  });

  it('ignores a panel lovelace object that is not a LovelaceConfig', () => {
    const { cleanup } = mountHaShell({ config: { path: 'default' } as any });
    expect(resolveEditorLovelaceConfig()).toEqual({ views: [] });
    cleanup();
  });

  it('falls back to a top-level ha-panel-lovelace query', () => {
    const panel = document.createElement('ha-panel-lovelace');
    const config = { views: [{ title: 'Fallback' }] };
    (panel as any).lovelace = { config };
    document.body.appendChild(panel);
    expect(resolveEditorLovelaceConfig()).toEqual(config);
  });
});
