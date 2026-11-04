import { describe, it, expect, beforeEach } from 'vitest';
import {
  UcCollapsibleSections,
  changedLeaves,
  sectionKeyFromTitle,
  summarizeFields,
  _resetCollapsibleSectionsCache,
} from '../uc-collapsible-sections';

function section(title: string, body = '<div class="field">x</div>'): string {
  return `<div class="settings-section"><div class="section-title">${title}</div>${body}</div>`;
}

async function mount(inner: string, tab = 'general'): Promise<UcCollapsibleSections> {
  const el = document.createElement('uc-collapsible-sections') as UcCollapsibleSections;
  el.moduleType = 'navigation';
  el.tab = tab;
  el.innerHTML = inner;
  document.body.appendChild(el);
  await el.updateComplete;
  el.scan();
  await el.updateComplete;
  return el;
}

const collapsed = (el: Element) =>
  Array.from(el.querySelectorAll('.settings-section')).map(s =>
    s.hasAttribute('data-uc-collapsed')
  );

describe('uc-collapsible-sections', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    _resetCollapsibleSectionsCache();
  });

  it('opens the first titled section and collapses the rest', async () => {
    const el = await mount(section('Items') + section('Desktop mode') + section('Mobile mode'));
    expect(collapsed(el)).toEqual([false, true, true]);
    const head = el.querySelector('.section-title')!;
    expect(head.getAttribute('role')).toBe('button');
    expect(head.querySelector('.uc-sec-chevron')).not.toBeNull();
  });

  it('leaves short tabs open and ignores untitled and nested sections', async () => {
    const el = await mount(
      '<div class="settings-section"><label>Name</label></div>' +
        section('One', section('Nested')) +
        section('Two')
    );
    expect(collapsed(el)).toEqual([false, false, false, false]);
    expect(el.querySelector('.settings-section')!.hasAttribute('data-uc-collapsible')).toBe(false);
  });

  it('toggles on header click and remembers the choice per module type', async () => {
    const el = await mount(section('Items') + section('Desktop mode') + section('Mobile mode'));
    const heads = el.querySelectorAll<HTMLElement>('.section-title');
    heads[1].click();
    expect(collapsed(el)).toEqual([false, false, true]);
    heads[0].click();
    expect(collapsed(el)).toEqual([true, false, true]);

    el.remove();
    const again = await mount(section('Items') + section('Desktop mode') + section('Mobile mode'));
    expect(collapsed(again)).toEqual([true, false, true]);
  });

  it('expands a collapsed section when a button in its header is used', async () => {
    const el = await mount(
      section('Items') + section('Routes <button class="add">Add</button>') + section('Mobile mode')
    );
    (el.querySelector('.add') as HTMLElement).click();
    expect(collapsed(el)).toEqual([false, false, true]);
    (el.querySelector('.add') as HTMLElement).click();
    expect(collapsed(el)).toEqual([false, false, true]);
  });

  it('folds away fields placed right after a section', async () => {
    const el = await mount(
      section('A') +
        section('B') +
        '<div class="field-container" id="b-slider">slider</div>' +
        section('C')
    );
    const slider = el.querySelector('#b-slider')!;
    expect(slider.hasAttribute('data-uc-sec-owned-hidden')).toBe(true);
    expect(slider.hasAttribute('data-uc-sec-owned')).toBe(false);
    el.querySelectorAll<HTMLElement>('.section-title')[1].click();
    expect(slider.hasAttribute('data-uc-sec-owned-hidden')).toBe(false);
    // Shown fields are marked so they indent under their section's box.
    expect(slider.hasAttribute('data-uc-sec-owned')).toBe(true);
    expect(slider.hasAttribute('data-uc-sec-owned-last')).toBe(true);
    const [, b, c] = Array.from(el.querySelectorAll('.settings-section'));
    expect(b.hasAttribute('data-uc-sec-has-owned')).toBe(true);
    expect(c.hasAttribute('data-uc-sec-has-owned')).toBe(false);
  });

  it('expand all / collapse all', async () => {
    const el = await mount(section('A') + section('B') + section('C'));
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.textContent).toContain('Expand all');
    btn.click();
    expect(collapsed(el)).toEqual([false, false, false]);
    await el.updateComplete;
    expect(btn.textContent).toContain('Collapse all');
    btn.click();
    expect(collapsed(el)).toEqual([true, true, true]);
  });
});

describe('collapsible section helpers', () => {
  it('builds stable keys from titles with counts', () => {
    expect(sectionKeyFromTitle('NAVIGATION ITEMS (3)')).toBe('navigation items');
    expect(sectionKeyFromTitle(' Desktop-Modus ')).toBe('desktop modus');
  });

  it('lists nested settings that differ from defaults', () => {
    const leaves = changedLeaves(
      {
        id: 'a',
        type: 'navigation',
        nav_desktop: { mode: 'docked', position: 'bottom' },
        extra: '',
      },
      { nav_desktop: { mode: 'floating', position: 'bottom' } }
    );
    expect(leaves).toEqual([{ key: 'mode', value: 'docked' }]);
  });

  it('summarises select labels, numbers and text but skips booleans', () => {
    const text = summarizeFields([
      {
        name: 'mode',
        value: 'floating',
        selector: { select: { options: [{ value: 'floating', label: 'Floating' }] } },
      },
      { name: 'show', value: true, selector: { boolean: {} } },
      { name: 'gap', value: 12, selector: { number: { unit_of_measurement: 'px' } } },
      { name: 'label', value: 'Home', selector: { text: {} } },
      { name: 'more', value: 'ignored', selector: { text: {} } },
    ]);
    expect(text).toBe('Floating · 12px · Home');
  });
});
