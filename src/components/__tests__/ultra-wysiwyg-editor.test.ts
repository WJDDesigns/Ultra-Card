/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import '../ultra-wysiwyg-editor';

async function mountEditor(content = '<p>Hello</p>'): Promise<HTMLElement> {
  const el = document.createElement('ultra-wysiwyg-editor') as HTMLElement & {
    content: string;
    updateComplete: Promise<boolean>;
  };
  el.content = content;
  document.body.appendChild(el);
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  return el;
}

function shadow(el: HTMLElement): ShadowRoot {
  if (!el.shadowRoot) throw new Error('missing shadow root');
  return el.shadowRoot;
}

describe('ultra-wysiwyg-editor', () => {
  beforeAll(async () => {
    await customElements.whenDefined('ultra-wysiwyg-editor');
  });

  it('opens a full-width link bar that accepts typing', async () => {
    const el = await mountEditor();
    const root = shadow(el);
    const linkBtn = [...root.querySelectorAll('button')].find(btn =>
      btn.getAttribute('title')?.toLowerCase().includes('link')
    );
    expect(linkBtn).toBeTruthy();
    linkBtn!.click();
    await (el as any).updateComplete;

    const bar = root.querySelector('.link-input-bar') as HTMLElement | null;
    expect(bar).toBeTruthy();
    expect(getComputedStyle(bar!).position).not.toBe('absolute');

    const input = bar!.querySelector('input') as HTMLInputElement;
    expect(input).toBeTruthy();
    input.value = 'https://example.com/card';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await (el as any).updateComplete;
    expect((root.querySelector('.link-input-bar input') as HTMLInputElement).value).toBe(
      'https://example.com/card'
    );
    el.remove();
  });

  it('does not duplicate alignment controls in the toolbar', async () => {
    const el = await mountEditor();
    const titles = [...shadow(el).querySelectorAll('button')].map(btn => btn.getAttribute('title'));
    expect(titles).not.toContain('Align left');
    expect(titles).not.toContain('Align center');
    expect(titles).not.toContain('Align right');
    el.remove();
  });
});
