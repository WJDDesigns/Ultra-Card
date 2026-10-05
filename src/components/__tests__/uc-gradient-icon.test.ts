/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { html, render } from 'lit';
import { iconMaskUrl, renderColoredIcon, UcGradientIcon } from '../uc-gradient-icon';

const PATH = 'M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12';
const GRADIENT = 'linear-gradient(90deg, red, blue)';

const nextFrame = () => new Promise(r => requestAnimationFrame(() => r(null)));

describe('uc-gradient-icon', () => {
  it('encodes the icon path into an SVG mask URL', () => {
    const url = iconMaskUrl(PATH);
    expect(url.startsWith('url("data:image/svg+xml,')).toBe(true);
    expect(decodeURIComponent(url)).toContain(`d='${PATH}'`);
    expect(decodeURIComponent(url)).toContain("viewBox='0 0 24 24'");
  });

  it('picks uc-gradient-icon only for gradients', () => {
    const host = document.createElement('div');
    render(html`${renderColoredIcon('mdi:information', GRADIENT, 30)}`, host);
    expect(host.querySelector('uc-gradient-icon')).toBeTruthy();
    render(html`${renderColoredIcon('mdi:information', 'red', 30)}`, host);
    expect(host.querySelector('uc-gradient-icon')).toBeNull();
    expect(host.querySelector<HTMLElement>('ha-icon')!.style.color).toBe('red');
  });

  it('masks the gradient with the resolved glyph path', async () => {
    const el = document.createElement('uc-gradient-icon') as UcGradientIcon;
    el.icon = 'mdi:information';
    el.gradient = GRADIENT;
    document.body.appendChild(el);
    await el.updateComplete;

    const haIcon = el.shadowRoot!.querySelector('ha-icon') as HTMLElement & { _path?: string };
    haIcon._path = PATH;
    await nextFrame();
    await el.updateComplete;

    const fill = el.shadowRoot!.querySelector<HTMLElement>('.fill');
    expect(fill).toBeTruthy();
    expect(fill!.getAttribute('style')).toContain('linear-gradient');
    expect(fill!.getAttribute('style')).toContain('mask-image');
    expect(haIcon.style.visibility).toBe('hidden');
    el.remove();
  });
});
