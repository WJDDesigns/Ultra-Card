/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { html, render } from 'lit';
import '../uc-gradient-editor';
import type { UCGradientEditor } from '../uc-gradient-editor';
import { createDefaultGradientStops, type GradientStop } from '../uc-gradient-editor';

/**
 * Regression cover for #115: the editor used to pin the default first/last
 * stops to 0% and 100% on every commit, so typing any other percentage snapped
 * straight back and only a YAML edit could move them.
 */

async function mountEditor(stops: GradientStop[]): Promise<{
  el: UCGradientEditor;
  emitted: GradientStop[][];
}> {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const emitted: GradientStop[][] = [];
  render(
    html`<uc-gradient-editor
      .stops=${stops}
      @gradient-changed=${(e: CustomEvent) => emitted.push(e.detail.stops)}
    ></uc-gradient-editor>`,
    host
  );
  const el = host.querySelector('uc-gradient-editor') as UCGradientEditor;
  await el.updateComplete;
  return { el, emitted };
}

function percentInputs(el: UCGradientEditor): HTMLInputElement[] {
  return Array.from(el.shadowRoot!.querySelectorAll('input.percentage-input'));
}

async function typePercent(
  el: UCGradientEditor,
  index: number,
  value: string
): Promise<void> {
  const input = percentInputs(el)[index]!;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await el.updateComplete;
}

describe('uc-gradient-editor percentage editing', () => {
  let stops: GradientStop[];

  beforeEach(() => {
    stops = createDefaultGradientStops();
  });

  it('renders one percentage input per stop', async () => {
    const { el } = await mountEditor(stops);
    expect(percentInputs(el)).toHaveLength(3);
  });

  it('moves the first default stop off 0% instead of snapping it back', async () => {
    const { el, emitted } = await mountEditor(stops);

    await typePercent(el, 0, '20');

    expect(el.stops.find(s => s.id === '1')!.position).toBe(20);
    expect(emitted[emitted.length - 1]!.find(s => s.id === '1')!.position).toBe(20);
  });

  it('moves the last default stop off 100% instead of snapping it back', async () => {
    const { el, emitted } = await mountEditor(stops);

    await typePercent(el, 2, '80');

    expect(el.stops.find(s => s.id === '3')!.position).toBe(80);
    expect(emitted[emitted.length - 1]!.find(s => s.id === '3')!.position).toBe(80);
  });

  it('keeps the edited value after blur commits', async () => {
    const { el } = await mountEditor(stops);

    await typePercent(el, 0, '15');
    percentInputs(el)[0]!.dispatchEvent(new Event('blur', { bubbles: true }));
    await el.updateComplete;

    expect(el.stops.find(s => s.id === '1')!.position).toBe(15);
  });

  it('emits a change per keystroke so edits survive an editor re-render', async () => {
    const { el, emitted } = await mountEditor(stops);

    await typePercent(el, 1, '40');

    expect(emitted.length).toBeGreaterThan(0);
    expect(emitted[emitted.length - 1]!.find(s => s.id === '2')!.position).toBe(40);
  });

  it('clamps out-of-range input into 0-100', async () => {
    const { el } = await mountEditor(stops);

    await typePercent(el, 1, '150');
    expect(el.stops.find(s => s.id === '2')!.position).toBe(100);

    await typePercent(el, 1, '-20');
    expect(el.stops.find(s => s.id === '2')!.position).toBe(0);
  });

  it('ignores a transiently empty field rather than resetting it to 0', async () => {
    const { el } = await mountEditor(stops);

    await typePercent(el, 1, '');

    expect(el.stops.find(s => s.id === '2')!.position).toBe(50);
  });

  it('allows deleting a stop that sits at a boundary position', async () => {
    const { el } = await mountEditor([
      { id: '1', position: 0, color: '#ff0000' },
      { id: '2', position: 50, color: '#ffff00' },
      { id: '3', position: 100, color: '#00ff00' },
    ]);

    const deleteButtons = Array.from(
      el.shadowRoot!.querySelectorAll('button.delete-button')
    ) as HTMLButtonElement[];
    expect(deleteButtons[0]!.disabled).toBe(false);

    deleteButtons[0]!.click();
    await el.updateComplete;

    expect(el.stops.map(s => s.id)).toEqual(['2', '3']);
  });

  it('never allows dropping below two stops', async () => {
    const { el } = await mountEditor([
      { id: '1', position: 0, color: '#ff0000' },
      { id: '2', position: 100, color: '#00ff00' },
    ]);

    const deleteButtons = Array.from(
      el.shadowRoot!.querySelectorAll('button.delete-button')
    ) as HTMLButtonElement[];
    expect(deleteButtons.every(b => b.disabled)).toBe(true);

    deleteButtons[0]!.click();
    await el.updateComplete;

    expect(el.stops).toHaveLength(2);
  });
});
