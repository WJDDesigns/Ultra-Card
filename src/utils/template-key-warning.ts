import { TemplateResult, html } from 'lit';
import { findUnknownTemplateKeys } from './template-parser';
import { localize } from '../localize/localize';

/**
 * Inline warning for unified-template JSON keys the current surface doesn't
 * support. Unsupported keys are silently ignored at render time, which users
 * mistake for "the template doesn't work" — surface them while editing instead.
 *
 * Render directly below an `<ultra-template-editor>`:
 * ```
 * ${renderTemplateKeyWarning(entity.unified_template, ['icon', 'icon_color', ...], lang)}
 * ```
 */
export function renderTemplateKeyWarning(
  template: string | undefined,
  validKeys: readonly string[],
  lang: string
): TemplateResult | '' {
  const unknownKeys = findUnknownTemplateKeys(template, validKeys);
  if (unknownKeys.length === 0) return '';
  return html`
    <div
      class="template-key-warning"
      style="margin-top: 8px; padding: 10px 12px; border-radius: 6px; border-left: 4px solid var(--warning-color, #ff9800); background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.1); font-size: 12px; color: var(--primary-text-color); line-height: 1.5;"
    >
      <strong>
        ${localize(
          'editor.template.unknown_keys_title',
          lang,
          'Unrecognized template keys (they will be ignored):'
        )}
      </strong>
      <ul style="margin: 4px 0 0; padding-left: 18px;">
        ${unknownKeys.map(
          w => html`
            <li>
              <code>"${w.key}"</code>
              ${w.suggestion
                ? html` —
                    ${localize('editor.template.did_you_mean', lang, 'did you mean')}
                    <code>"${w.suggestion}"</code>?`
                : ''}
            </li>
          `
        )}
      </ul>
      <div style="margin-top: 4px;">
        ${localize('editor.template.supported_keys', lang, 'Supported keys for this module:')}
        ${validKeys.map((k, i) => html`<code>${k}</code>${i < validKeys.length - 1 ? ', ' : ''}`)}
      </div>
    </div>
  `;
}
