import { describe, it, expect, afterEach } from 'vitest';
import '../uc-textfield';
import '../uc-spinner';
import '../uc-select';
import type { UcSelect } from '../uc-select';
import type { UcTextfield } from '../uc-textfield';
import * as fs from 'node:fs';
import * as path from 'node:path';

afterEach(() => {
  document.body.innerHTML = '';
});

async function mount(props: Partial<UcTextfield> = {}): Promise<UcTextfield> {
  const el = document.createElement('uc-textfield') as UcTextfield;
  Object.assign(el, props);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('uc-textfield', () => {
  it('renders a real input with the value and placeholder', async () => {
    const el = await mount({ value: 'Movie night', placeholder: 'Enter preset name' });
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input).toBeTruthy();
    expect(input.value).toBe('Movie night');
    expect(input.getAttribute('placeholder')).toBe('Enter preset name');
  });

  it('bubbles input events to the host with the new value on e.target', async () => {
    const el = await mount({ value: '' });
    let seen = '';
    el.addEventListener('input', e => {
      seen = (e.target as UcTextfield).value;
    });
    const input = el.shadowRoot!.querySelector('input')!;
    input.value = 'Reading';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    expect(seen).toBe('Reading');
  });

  it('renders a textarea when multiline', async () => {
    const el = await mount({ multiline: true, rows: 4, value: '[[[ return 0; ]]]' });
    const ta = el.shadowRoot!.querySelector('textarea')!;
    expect(ta).toBeTruthy();
    expect(ta.value).toBe('[[[ return 0; ]]]');
  });

  it('passes number constraints through', async () => {
    const el = await mount({ type: 'number', min: '-90', max: '90', step: 'any' });
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.type).toBe('number');
    expect(input.getAttribute('min')).toBe('-90');
    expect(input.getAttribute('max')).toBe('90');
  });
});

describe('uc-spinner', () => {
  it('renders a progress indicator', async () => {
    const el = document.createElement('uc-spinner') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="progressbar"]')).toBeTruthy();
  });
});

/**
 * Home Assistant removed `<ha-textfield>` and `<ha-circular-progress>` from its
 * frontend. Any use renders as an empty element (GitHub #247), so keep them out.
 */
describe('no removed Home Assistant elements', () => {
  const SRC = path.join(__dirname, '..', '..');
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
      const p = path.join(dir, d.name);
      if (d.isDirectory())
        return d.name === '__tests__' || d.name === 'website-demo' ? [] : walk(p);
      return p.endsWith('.ts') && !p.endsWith('.test.ts') ? [p] : [];
    });

  it('does not render <ha-textfield> or <ha-circular-progress>', () => {
    const offenders = walk(SRC).filter(f =>
      /<ha-textfield\b|<ha-circular-progress\b/.test(
        fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      )
    );
    expect(offenders.map(f => path.relative(SRC, f))).toEqual([]);
  });

  // HA dropped every Material (mwc-*/md-*) element when it moved to Web Awesome.
  it('does not render Material <mwc-*> or <md-*> elements', () => {
    const offenders = walk(SRC).filter(f =>
      /<(mwc|md)-[a-z]/.test(fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''))
    );
    expect(offenders.map(f => path.relative(SRC, f))).toEqual([]);
  });
});

describe('uc-select', () => {
  async function mountSelect(props: Partial<UcSelect>): Promise<UcSelect> {
    const el = document.createElement('uc-select') as UcSelect;
    Object.assign(el, props);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }
  const options = [
    { value: 'click', label: 'Click to open' },
    { value: 'hover', label: 'Hover to open' },
  ];

  it('renders the options with the current value selected', async () => {
    const el = await mountSelect({ options, value: 'hover' });
    const select = el.shadowRoot!.querySelector('select')!;
    const labels = [...select.querySelectorAll('option')].map(o => o.textContent!.trim());
    expect(labels).toEqual(['Click to open', 'Hover to open']);
    expect(select.value).toBe('hover');
  });

  it('fires selected with detail.value and updates e.target.value', async () => {
    const el = await mountSelect({ options, value: 'click' });
    let detail = '';
    let target = '';
    el.addEventListener('selected', e => {
      detail = (e as CustomEvent).detail.value;
      target = (e.target as UcSelect).value;
    });
    const select = el.shadowRoot!.querySelector('select')!;
    select.value = 'hover';
    select.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    expect(detail).toBe('hover');
    expect(target).toBe('hover');
  });

  it('does not let the change bubble into the editor', async () => {
    const el = await mountSelect({ options, value: 'click' });
    let leaked = 0;
    document.body.addEventListener('selected', () => leaked++);
    document.body.addEventListener('change', () => leaked++);
    const select = el.shadowRoot!.querySelector('select')!;
    select.value = 'hover';
    select.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    expect(leaked).toBe(0);
  });
});
