import { describe, it, expect } from 'vitest';
import { navigationJsTemplatesAllowedForConfig } from './uc-navigation-js-gating';
import type { UltraCardConfig } from '../types';

describe('navigationJsTemplatesAllowedForConfig (H4)', () => {
  it('allows local, standard preset, and missing origin', () => {
    expect(navigationJsTemplatesAllowedForConfig({} as UltraCardConfig)).toBe(true);
    expect(navigationJsTemplatesAllowedForConfig({ _contentOrigin: 'local' } as UltraCardConfig)).toBe(
      true
    );
    expect(
      navigationJsTemplatesAllowedForConfig({ _contentOrigin: 'preset_standard' } as UltraCardConfig)
    ).toBe(true);
  });

  it('blocks imported and community preset origins', () => {
    expect(
      navigationJsTemplatesAllowedForConfig({ _contentOrigin: 'imported' } as UltraCardConfig)
    ).toBe(false);
    expect(
      navigationJsTemplatesAllowedForConfig({
        _contentOrigin: 'preset_community',
      } as UltraCardConfig)
    ).toBe(false);
  });

  it('blocks when disable_navigation_js_templates is true', () => {
    expect(
      navigationJsTemplatesAllowedForConfig({
        _contentOrigin: 'local',
        disable_navigation_js_templates: true,
      } as UltraCardConfig)
    ).toBe(false);
  });
});
