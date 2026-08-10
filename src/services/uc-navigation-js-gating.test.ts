import { describe, it, expect } from 'vitest';
import { navigationJsTemplatesAllowedForConfig } from './uc-navigation-js-gating';
import type { UltraCardConfig } from '../types';

const cfg = (c: Partial<UltraCardConfig>): UltraCardConfig => c as UltraCardConfig;

describe('navigationJsTemplatesAllowedForConfig (S1)', () => {
  it('allows locally authored configs, including ones predating origin tracking', () => {
    expect(navigationJsTemplatesAllowedForConfig({} as UltraCardConfig)).toBe(true);
    expect(navigationJsTemplatesAllowedForConfig(cfg({ _contentOrigin: 'local' }))).toBe(true);
    expect(navigationJsTemplatesAllowedForConfig(undefined)).toBe(true);
  });

  // The whole point of S1: a `standard` tag is derived from an author field that
  // arrives in the same payload as the preset, so it cannot authorise itself.
  it('blocks every downloaded origin, standard presets included', () => {
    expect(navigationJsTemplatesAllowedForConfig(cfg({ _contentOrigin: 'preset_standard' }))).toBe(
      false
    );
    expect(navigationJsTemplatesAllowedForConfig(cfg({ _contentOrigin: 'preset_community' }))).toBe(
      false
    );
    expect(navigationJsTemplatesAllowedForConfig(cfg({ _contentOrigin: 'imported' }))).toBe(false);
  });

  it('fails closed on an origin it does not recognise', () => {
    expect(
      navigationJsTemplatesAllowedForConfig({
        _contentOrigin: 'something_added_later',
      } as unknown as UltraCardConfig)
    ).toBe(false);
  });

  it('blocks when disable_navigation_js_templates is true', () => {
    expect(
      navigationJsTemplatesAllowedForConfig(
        cfg({ _contentOrigin: 'local', disable_navigation_js_templates: true })
      )
    ).toBe(false);
  });

  describe('explicit opt-in for downloaded content', () => {
    it('re-enables JS when the user has opted in', () => {
      expect(
        navigationJsTemplatesAllowedForConfig(
          cfg({ _contentOrigin: 'preset_standard', allow_navigation_js_from_untrusted: true })
        )
      ).toBe(true);
      expect(
        navigationJsTemplatesAllowedForConfig(
          cfg({ _contentOrigin: 'imported', allow_navigation_js_from_untrusted: true })
        )
      ).toBe(true);
    });

    it('still honours the hard disable over the opt-in', () => {
      expect(
        navigationJsTemplatesAllowedForConfig(
          cfg({
            _contentOrigin: 'preset_community',
            allow_navigation_js_from_untrusted: true,
            disable_navigation_js_templates: true,
          })
        )
      ).toBe(false);
    });

    it('ignores a non-true value, so a truthy string cannot unlock it', () => {
      expect(
        navigationJsTemplatesAllowedForConfig({
          _contentOrigin: 'imported',
          allow_navigation_js_from_untrusted: 'yes',
        } as unknown as UltraCardConfig)
      ).toBe(false);
    });
  });
});
