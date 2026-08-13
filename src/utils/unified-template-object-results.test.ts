import { describe, it, expect } from 'vitest';
import { parseUnifiedTemplate, unifiedTemplateQrContent } from './template-parser';

/**
 * Home Assistant's render_template subscription applies literal_eval to the
 * rendered string, so a template that produces JSON arrives as a real object
 * rather than text. Consumers must therefore hand the cached value to
 * parseUnifiedTemplate untouched — String()-ing it first yields
 * "[object Object]" and silently loses every property.
 */
describe('unified template results arriving as objects', () => {
  it('reads qr_content from an object result', () => {
    const parsed = parseUnifiedTemplate({ qr_content: 'https://ultracard.io' });
    expect(unifiedTemplateQrContent(parsed)).toBe('https://ultracard.io');
  });

  it('reads qr_content from an equivalent string result', () => {
    const parsed = parseUnifiedTemplate('{"qr_content": "https://ultracard.io"}');
    expect(unifiedTemplateQrContent(parsed)).toBe('https://ultracard.io');
  });

  it('falls back to content when qr_content is absent', () => {
    expect(unifiedTemplateQrContent(parseUnifiedTemplate({ content: 'https://example.com' }))).toBe(
      'https://example.com'
    );
  });

  it('loses everything when an object result is stringified first', () => {
    const parsed = parseUnifiedTemplate(String({ qr_content: 'https://ultracard.io' }));
    expect(unifiedTemplateQrContent(parsed)).toBeUndefined();
  });

  it('keeps bar properties that arrive as an object', () => {
    const parsed = parseUnifiedTemplate({
      value: 42,
      label: 'Comfortable',
      color: '#4ade80',
      value_min: -5,
      value_max: 45,
    });
    expect(parsed.value).toBe(42);
    expect(parsed.label).toBe('Comfortable');
    expect(parsed.color).toBe('#4ade80');
    expect(parsed.value_min).toBe(-5);
    expect(parsed.value_max).toBe(45);
  });
});
