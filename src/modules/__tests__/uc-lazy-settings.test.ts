/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { html, render } from 'lit';
import { createLazySettings, installSettingsMethods } from '../uc-lazy-settings';

/**
 * Phase 3: the core modules' settings tabs live in a lazy chunk. The module keeps
 * a one-line `renderGeneralTab()` that renders a placeholder until the chunk is
 * in memory and the real tab synchronously after that.
 */
describe('createLazySettings', () => {
  it('renders a placeholder first, then the settings once the chunk resolves', async () => {
    let resolve!: (v: { label: string }) => void;
    const importer = vi.fn(() => new Promise<{ label: string }>(r => (resolve = r)));
    const settings = createLazySettings(importer, 'test settings');

    const host = document.createElement('div');
    render(html`${settings(s => html`<b>${s.label}</b>`)}`, host);
    expect(host.querySelector('.uc-settings-loading')).toBeTruthy();
    expect(host.querySelector('b')).toBeNull();
    expect(settings.isLoaded()).toBe(false);

    resolve({ label: 'loaded' });
    await settings.prefetch();
    await new Promise(r => setTimeout(r, 0));
    expect(host.querySelector('b')?.textContent).toBe('loaded');
    expect(settings.isLoaded()).toBe(true);

    // Later renders are synchronous: the callback result is returned as-is.
    const direct = settings(s => s.label);
    expect(direct).toBe('loaded');
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it('shows a failure message when the chunk cannot be fetched and retries next render', async () => {
    let calls = 0;
    const importer = vi.fn(() => {
      calls += 1;
      return calls === 1 ? Promise.reject(new Error('Load failed')) : Promise.resolve({ ok: true });
    });
    const settings = createLazySettings(importer, 'flaky settings');

    const host = document.createElement('div');
    render(html`${settings(() => html`<b>ok</b>`)}`, host);
    await new Promise(r => setTimeout(r, 0));
    expect(host.querySelector('.uc-settings-failed')).toBeTruthy();

    render(html`${settings(() => html`<b>ok</b>`)}`, host);
    await settings.prefetch();
    await new Promise(r => setTimeout(r, 0));
    expect(host.querySelector('b')?.textContent).toBe('ok');
    expect(importer).toHaveBeenCalledTimes(2);
  });
});

describe('installSettingsMethods', () => {
  it('copies the subclass methods onto the host prototype without overriding host methods', () => {
    class Host {
      shared(): string {
        return 'host';
      }
      tab(): string {
        return (this as unknown as { helper(): string }).helper();
      }
    }
    class Settings extends Host {
      override shared(): string {
        return 'settings';
      }
      helper(): string {
        return 'from settings';
      }
    }
    installSettingsMethods(Host, Settings);
    const host = new Host();
    expect(host.shared()).toBe('host');
    expect(host.tab()).toBe('from settings');
  });
});
