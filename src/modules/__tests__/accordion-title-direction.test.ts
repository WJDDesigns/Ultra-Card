import { describe, it, expect } from 'vitest';
import { render } from 'lit';
import { UltraAccordionModule } from '../accordion-module';

const hass: any = { states: {}, language: 'en', locale: { language: 'en' }, themes: {} };

function titleTransform(extra: Record<string, unknown>): string {
  const mod = new UltraAccordionModule();
  const cfg: any = {
    ...mod.createDefault('acc-test'),
    title_mode: 'custom',
    custom_title: 'Accordion Title',
    side_header_style: 'vertical',
    ...extra,
  };
  const host = document.createElement('div');
  render(mod.renderPreview(cfg, hass, {} as any) as any, host);
  const el = [...host.querySelectorAll<HTMLElement>('*')].find(
    e => e.style.writingMode === 'vertical-rl'
  );
  expect(el, 'vertical title element').toBeTruthy();
  return el!.style.transform || 'none';
}

describe('Accordion sideways title direction', () => {
  it('auto keeps the old behaviour', () => {
    expect(titleTransform({ expand_direction: 'right' })).toBe('rotate(180deg)');
    expect(titleTransform({ expand_direction: 'left' })).toBe('none');
  });
  it('up and down override the side', () => {
    expect(titleTransform({ expand_direction: 'left', side_title_direction: 'up' })).toBe(
      'rotate(180deg)'
    );
    expect(titleTransform({ expand_direction: 'right', side_title_direction: 'down' })).toBe(
      'none'
    );
  });
});
