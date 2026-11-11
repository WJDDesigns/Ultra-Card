import { describe, it, expect, afterEach } from 'vitest';
import { ucNavigationService } from './uc-navigation-service';

const svc = ucNavigationService as any;

/** home-assistant > home-assistant-main > ha-panel-lovelace > hui-root > #view, each in a shadow root. */
function buildDashboard(): { ha: HTMLElement; view: HTMLElement } {
  const ha = document.createElement('home-assistant');
  const main = document.createElement('home-assistant-main');
  ha.attachShadow({ mode: 'open' }).appendChild(main);
  const panel = document.createElement('ha-panel-lovelace');
  main.attachShadow({ mode: 'open' }).appendChild(panel);
  const root = document.createElement('hui-root');
  panel.attachShadow({ mode: 'open' }).appendChild(root);
  const view = document.createElement('div');
  view.id = 'view';
  root.attachShadow({ mode: 'open' }).appendChild(view);
  document.body.appendChild(ha);
  return { ha, view };
}

/** A fake rendered dock: .navbar fills the screen, .navbar-card sits at the bottom. */
function addLayer(position: string, screenH: number, cardTop: number, cardH: number) {
  const navLayer = document.createElement('div');
  const navbar = document.createElement('div');
  navbar.className = `navbar mobile docked ${position}`;
  const card = document.createElement('div');
  card.className = `navbar-card mobile docked ${position}`;
  navbar.appendChild(card);
  navLayer.appendChild(navbar);
  document.body.appendChild(navLayer);
  Object.defineProperty(navbar, 'clientHeight', { value: screenH });
  Object.defineProperty(card, 'offsetTop', { value: cardTop });
  Object.defineProperty(card, 'offsetHeight', { value: cardH });
  const container = document.createElement('div');
  svc.viewLayers.set(container, { viewContainer: container, navLayer, viewId: 'v', activeModule: {} });
  return navLayer;
}

let cleanup: HTMLElement[] = [];
afterEach(() => {
  svc.viewLayers.clear();
  svc.registeredModules.delete('spacer-test');
  svc.clearContentSpacer();
  cleanup.forEach(el => el.remove());
  cleanup = [];
});

describe('bottom dock leaves room for the last card', () => {
  it('pads the dashboard view by the dock height', () => {
    const { ha, view } = buildDashboard();
    cleanup.push(ha, addLayer('bottom', 800, 690, 110));
    svc.registeredModules.set('spacer-test', {});
    svc.updateContentSpacer();
    expect(view.style.paddingBottom).toBe('118px');
  });

  it('does not pad for a top or side dock', () => {
    const { ha, view } = buildDashboard();
    cleanup.push(ha, addLayer('top', 800, 0, 60), addLayer('left', 800, 0, 800));
    svc.registeredModules.set('spacer-test', {});
    svc.updateContentSpacer();
    expect(view.style.paddingBottom).toBe('');
  });

  it('removes the padding when the dock goes away', () => {
    const { ha, view } = buildDashboard();
    const layer = addLayer('bottom', 800, 720, 80);
    cleanup.push(ha, layer);
    svc.registeredModules.set('spacer-test', {});
    svc.updateContentSpacer();
    expect(view.style.paddingBottom).toBe('88px');

    layer.style.display = 'none';
    svc.updateContentSpacer();
    expect(view.style.paddingBottom).toBe('');
  });
});
