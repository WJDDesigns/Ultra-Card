import { describe, it, expect } from 'vitest';
import { parseUnifiedTemplate } from './template-parser';
import {
  resolveCardAppearance,
  buildCardContainerStyleFromAppearance,
  buildCardUnifiedTemplateKey,
  buildCardFieldTemplateKey,
} from './card-appearance-template';
import { UltraCardConfig } from '../types';

describe('parseUnifiedTemplate card appearance keys', () => {
  it('parses card appearance JSON keys', () => {
    const parsed = parseUnifiedTemplate(
      JSON.stringify({
        card_background: '#1b1f3a',
        card_border_color: '#3d4570',
        card_border_radius: 12,
        card_padding: 16,
        card_shadow_enabled: true,
        card_shadow_color: 'rgba(0,0,0,0.2)',
      })
    );

    expect(parsed.card_background).toBe('#1b1f3a');
    expect(parsed.card_border_color).toBe('#3d4570');
    expect(parsed.card_border_radius).toBe(12);
    expect(parsed.card_padding).toBe(16);
    expect(parsed.card_shadow_enabled).toBe(true);
    expect(parsed.card_shadow_color).toBe('rgba(0,0,0,0.2)');
  });

  it('maps plain string results to content for background-only templates', () => {
    const parsed = parseUnifiedTemplate('#fff3cd');
    expect(parsed.content).toBe('#fff3cd');
    expect(parsed._isString).toBe(true);
  });
});

describe('resolveCardAppearance', () => {
  const baseConfig: UltraCardConfig = {
    type: 'custom:ultra-card',
    layout: { rows: [] },
    card_background: '#111111',
    card_border_color: '#222222',
    card_border_radius: 8,
  };

  it('returns static config when no templates are active', () => {
    const resolved = resolveCardAppearance(baseConfig, undefined);
    expect(resolved.card_background).toBe('#111111');
    expect(resolved.card_border_color).toBe('#222222');
    expect(resolved.card_border_radius).toBe(8);
  });

  it('applies unified template JSON results over static config', () => {
    const config: UltraCardConfig = {
      ...baseConfig,
      card_unified_template_mode: true,
      card_unified_template: '{{ states("sensor.day_period") }}',
    };
    const templateKey = buildCardUnifiedTemplateKey('card_test', '{{ states("sensor.day_period") }}');
    const hass = {
      __uvc_template_strings: {
        [templateKey]: JSON.stringify({
          card_background: '#d1ecf1',
          card_border_radius: 20,
        }),
      },
    } as any;
    (config as any).__ucInstanceId = 'card_test';

    const resolved = resolveCardAppearance(config, hass);
    expect(resolved.card_background).toBe('#d1ecf1');
    expect(resolved.card_border_radius).toBe(20);
    expect(resolved.card_border_color).toBe('#222222');
  });

  it('evaluates inline card_background Jinja when unified mode is off', () => {
    const template = "{% if true %}#fff3cd{% else %}#343a40{% endif %}";
    const config: UltraCardConfig = {
      ...baseConfig,
      card_background: template,
    };
    const key = buildCardFieldTemplateKey('card_background', 'card_test', template);
    const hass = {
      __uvc_template_strings: {
        [key]: '#fff3cd',
      },
    } as any;
    (config as any).__ucInstanceId = 'card_test';

    const resolved = resolveCardAppearance(config, hass);
    expect(resolved.card_background).toBe('#fff3cd');
  });

  it('maps unified plain string result to card background', () => {
    const config: UltraCardConfig = {
      ...baseConfig,
      card_unified_template_mode: true,
      card_unified_template: '{% if true %}#fff3cd{% endif %}',
    };
    const templateKey = buildCardUnifiedTemplateKey(
      'card_test',
      '{% if true %}#fff3cd{% endif %}'
    );
    const hass = {
      __uvc_template_strings: {
        [templateKey]: '#fff3cd',
      },
    } as any;
    (config as any).__ucInstanceId = 'card_test';

    const resolved = resolveCardAppearance(config, hass);
    expect(resolved.card_background).toBe('#fff3cd');
  });
});

describe('buildCardContainerStyleFromAppearance', () => {
  it('builds background and border styles', () => {
    const style = buildCardContainerStyleFromAppearance(
      {
        card_background: '#1b1f3a',
        card_border_radius: 12,
        card_border_color: '#3d4570',
        card_border_width: 1,
      },
      { defaultBorderWidth: 1, defaultBorderColor: 'var(--divider-color)' }
    );

    expect(style).toContain('background: #1b1f3a');
    expect(style).toContain('border-radius: 12px');
    expect(style).toContain('border: 1px solid #3d4570');
  });
});
