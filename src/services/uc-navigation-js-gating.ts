import type { UltraCardConfig } from '../types';

/**
 * Whether navigation `[[[ JavaScript ]]]` templates may run for this card config.
 *
 * The code runs through `new Function` with the live `hass` object in scope, so
 * it can call any service and read any state. Only content the user authored
 * themselves is trusted with that.
 *
 * Downloaded presets are all untrusted, including ones tagged `standard`. The
 * tag is derived from an `author` field that arrives in the same payload as the
 * preset, so it cannot authorise itself — a compromised or spoofed marketplace
 * entry would otherwise get full execution.
 *
 * @see docs/navigation-js-templates.md
 */
export function navigationJsTemplatesAllowedForConfig(config?: UltraCardConfig): boolean {
  if (config?.disable_navigation_js_templates === true) {
    return false;
  }

  const origin = config?._contentOrigin;

  // `undefined` means the config predates origin tracking, so it was authored
  // locally by definition.
  if (origin === undefined || origin === 'local') {
    return true;
  }

  // Escape hatch for downloaded content the user has explicitly reviewed. Opt-in
  // only, and never inferred from anything the preset itself supplies.
  return config?.allow_navigation_js_from_untrusted === true;
}
