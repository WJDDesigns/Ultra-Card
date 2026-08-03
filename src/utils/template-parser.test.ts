import { describe, it, expect } from 'vitest';
import { parseUnifiedTemplate, findUnknownTemplateKeys } from './template-parser';

const INFO_KEYS = [
  'icon',
  'icon_color',
  'name',
  'name_color',
  'state_text',
  'state',
  'state_color',
  'container_background_color',
];

describe('parseUnifiedTemplate state alias', () => {
  it('maps "state" to state_text in JSON string results', () => {
    const parsed = parseUnifiedTemplate('{"state": "open", "icon_color": "green"}');
    expect(parsed.state_text).toBe('open');
    expect(parsed.icon_color).toBe('green');
  });

  it('maps "state" to state_text in object results', () => {
    const parsed = parseUnifiedTemplate({ state: 'open' });
    expect(parsed.state_text).toBe('open');
  });

  it('prefers explicit state_text over the state alias', () => {
    const parsed = parseUnifiedTemplate({ state: 'raw', state_text: 'formatted' });
    expect(parsed.state_text).toBe('formatted');
  });
});

describe('findUnknownTemplateKeys', () => {
  it('returns nothing for supported keys', () => {
    const template = '{"icon": "mdi:fire", "state_text": "{{ state }}"}';
    expect(findUnknownTemplateKeys(template, INFO_KEYS)).toEqual([]);
  });

  it('flags unsupported keys with an explicit suggestion', () => {
    const warnings = findUnknownTemplateKeys('{"label": "Fridge"}', INFO_KEYS);
    expect(warnings).toEqual([{ key: 'label', suggestion: 'name' }]);
  });

  it('suggests near-miss keys via edit distance', () => {
    const warnings = findUnknownTemplateKeys('{"state_txt": "open"}', INFO_KEYS);
    expect(warnings).toEqual([{ key: 'state_txt', suggestion: 'state_text' }]);
  });

  it('flags unknown keys without a suggestion when nothing is close', () => {
    const warnings = findUnknownTemplateKeys('{"frobnicate": 1}', INFO_KEYS);
    expect(warnings).toEqual([{ key: 'frobnicate', suggestion: undefined }]);
  });

  it('ignores Jinja expressions and quoted values', () => {
    const template =
      '{"icon_color": "{% if state == \'closed\' %}green{% else %}red{% endif %}", "icon": "mdi:fridge"}';
    expect(findUnknownTemplateKeys(template, INFO_KEYS)).toEqual([]);
  });

  it('dedupes repeated unknown keys', () => {
    const template = '{% if x %}{"foo": 1}{% else %}{"foo": 2}{% endif %}';
    const warnings = findUnknownTemplateKeys(template, INFO_KEYS);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].key).toBe('foo');
  });

  it('handles empty and plain-string templates', () => {
    expect(findUnknownTemplateKeys('', INFO_KEYS)).toEqual([]);
    expect(findUnknownTemplateKeys(undefined, INFO_KEYS)).toEqual([]);
    expect(findUnknownTemplateKeys('{{ state }}', INFO_KEYS)).toEqual([]);
  });
});
