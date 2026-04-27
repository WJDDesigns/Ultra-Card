import type { UltraCardConfig } from '../types';

/**
 * Whether navigation `[[[ JavaScript ]]]` templates may run for this card config.
 * Imported YAML/shortcode and community presets are untrusted — JS is blocked.
 * @see docs/navigation-js-templates.md
 */
export function navigationJsTemplatesAllowedForConfig(config?: UltraCardConfig): boolean {
  if (config?.disable_navigation_js_templates === true) {
    return false;
  }
  const origin = config?._contentOrigin;
  return origin !== 'imported' && origin !== 'preset_community';
}
