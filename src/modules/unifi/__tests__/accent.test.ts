import { describe, it, expect } from 'vitest';
import { unifiAccent, unifiAccentOverride, unifiLinkPaint, UNIFI_ACCENT_VAR } from '../accent';
import type { UnifiModule } from '../../../types';

const module = (over: Partial<UnifiModule> = {}): UnifiAccentMod =>
  ({
    accent_color: undefined,
    device_overrides: [],
    ...over,
  }) as UnifiAccentMod;

type UnifiAccentMod = Pick<UnifiModule, 'accent_color' | 'device_overrides'>;

describe('unifiAccent', () => {
  it('falls back to the CSS token when nothing is set', () => {
    expect(unifiAccent(module())).toBe(UNIFI_ACCENT_VAR);
    expect(unifiAccentOverride(module())).toBeUndefined();
  });

  it('uses the module accent, and a per-device override wins', () => {
    const m = module({
      accent_color: '#ff0000',
      device_overrides: [{ device_id: 'ap1', accent_color: '#00ff00' }],
    });
    expect(unifiAccent(m)).toBe('#ff0000');
    expect(unifiAccent(m, 'ap1')).toBe('#00ff00');
    expect(unifiAccent(m, 'other')).toBe('#ff0000');
  });
});

describe('unifiLinkPaint', () => {
  it('keeps the UniFi speed palette when no accent is set', () => {
    expect(unifiLinkPaint(10000)).toBe('#00e5ff');
    expect(unifiLinkPaint(1000)).toBe('#69f0ae');
    expect(unifiLinkPaint(100)).toBe('#ffd740');
  });

  it('paints gigabit+ and unknown speed with a user accent', () => {
    expect(unifiLinkPaint(10000, '#ff0000')).toBe('#ff0000');
    expect(unifiLinkPaint(1000, '#ff0000')).toBe('#ff0000');
    expect(unifiLinkPaint(null, '#ff0000', 'rgba(100,155,235,0.55)')).toBe('#ff0000');
  });

  it('leaves sub-gigabit on the speed palette even with an accent', () => {
    expect(unifiLinkPaint(100, '#ff0000')).toBe('#ffd740');
  });

  it('uses the unknown fallback when there is no accent', () => {
    expect(unifiLinkPaint(null, undefined, 'rgba(100,155,235,0.55)')).toBe(
      'rgba(100,155,235,0.55)'
    );
  });
});
