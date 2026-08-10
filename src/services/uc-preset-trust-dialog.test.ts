// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { confirmUntrustedPreset } from './uc-preset-trust-dialog';
import type { PresetRiskFindings } from './uc-preset-trust-scanner';

const item = (value: string, ...sources: string[]) => ({ value, sources });

const findings = (over: Partial<PresetRiskFindings> = {}): PresetRiskFindings => ({
  serviceCalls: [item('lock.unlock', 'Button')],
  remoteHosts: [],
  embeddedCards: [],
  hasAny: true,
  ...over,
});

function panel(): HTMLElement | null {
  return document.querySelector('.uc-preset-trust-panel');
}

function clickButton(label: string): void {
  const button = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.uc-preset-trust-btn')
  ).find(candidate => candidate.textContent === label);
  if (!button) throw new Error(`No button labelled ${label}`);
  button.click();
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('confirmUntrustedPreset', () => {
  it('resolves immediately without a dialog when there is nothing to disclose', async () => {
    await expect(
      confirmUntrustedPreset('Clean', {
        serviceCalls: [],
        remoteHosts: [],
        embeddedCards: [],
        hasAny: false,
      })
    ).resolves.toBe(true);
    expect(panel()).toBeNull();
  });

  it('shows the prompt and resolves true when the user accepts', async () => {
    const pending = confirmUntrustedPreset('Modern Vehicle Card', findings());
    expect(panel()).not.toBeNull();
    clickButton('Add preset');
    await expect(pending).resolves.toBe(true);
  });

  it('resolves false when the user cancels, and cleans up after itself', async () => {
    const pending = confirmUntrustedPreset('Modern Vehicle Card', findings());
    clickButton('Cancel');
    await expect(pending).resolves.toBe(false);
    expect(panel()).toBeNull();
    expect(document.querySelector('.uc-preset-trust-dialog')).toBeNull();
  });

  /**
   * The prompt opens inside Home Assistant's own modal dialog. It regressed once
   * by rendering behind it, where it could never be clicked, so the preset
   * silently never applied. Whatever happens to the presentation, the promise has
   * to settle and the prompt has to be reachable.
   */
  it('opens in the top layer via showModal when the platform supports it', async () => {
    const proto = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
    const hadShowModal = 'showModal' in proto;
    const original = proto.showModal;
    const showModal = vi.fn();
    proto.showModal = showModal;

    try {
      const pending = confirmUntrustedPreset('Modern Vehicle Card', findings());
      expect(showModal).toHaveBeenCalledOnce();
      clickButton('Cancel');
      await expect(pending).resolves.toBe(false);
    } finally {
      if (hadShowModal) proto.showModal = original;
      else delete proto.showModal;
    }
  });

  it('still presents a reachable prompt when modal presentation fails', async () => {
    const proto = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
    const hadShowModal = 'showModal' in proto;
    const original = proto.showModal;
    proto.showModal = () => {
      throw new Error('not supported here');
    };

    try {
      const pending = confirmUntrustedPreset('Modern Vehicle Card', findings());

      expect(document.querySelector('.uc-preset-trust-dialog')).not.toBeNull();
      expect(panel()).not.toBeNull();

      clickButton('Cancel');
      await expect(pending).resolves.toBe(false);
    } finally {
      if (hadShowModal) proto.showModal = original;
      else delete proto.showModal;
    }
  });

  it('lists every category it was given', async () => {
    const pending = confirmUntrustedPreset(
      'Kitchen Sink',
      findings({
        serviceCalls: [item('lock.unlock', 'Button')],
        remoteHosts: [item('images.unsplash.com', 'Image')],
        embeddedCards: [item('custom:mushroom-card', 'External Card')],
      })
    );
    const text = panel()?.textContent ?? '';
    expect(text).toContain('lock.unlock');
    expect(text).toContain('images.unsplash.com');
    expect(text).toContain('custom:mushroom-card');
    clickButton('Cancel');
    await pending;
  });

  it('names the module each finding belongs to', async () => {
    const pending = confirmUntrustedPreset(
      'Modern Vehicle Card',
      findings({
        serviceCalls: [],
        remoteHosts: [item('images.unsplash.com', 'Image', 'Text')],
      })
    );
    const text = panel()?.textContent ?? '';
    expect(text).toContain('images.unsplash.com');
    expect(text).toContain('in Image, Text');
    clickButton('Cancel');
    await pending;
  });

  it('escapes preset-controlled strings rather than rendering them as markup', async () => {
    const pending = confirmUntrustedPreset('<img src=x onerror=alert(1)>', {
      serviceCalls: [item('<script>alert(2)</script>', '<b>bold</b>')],
      remoteHosts: [],
      embeddedCards: [],
      hasAny: true,
    });

    expect(document.querySelector('.uc-preset-trust-panel img')).toBeNull();
    expect(document.querySelector('.uc-preset-trust-panel script')).toBeNull();
    expect(document.querySelector('.uc-preset-trust-panel b')).toBeNull();
    // Present as visible text, so the user can see what the preset claimed to be.
    expect(panel()?.textContent).toContain('onerror');
    clickButton('Cancel');
    await pending;
  });
});
