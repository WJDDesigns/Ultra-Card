import { describe, it, expect, afterEach } from 'vitest';
import { ucNavigationService } from './uc-navigation-service';
import { collectNavLiveEntities } from '../utils/uc-nav-live-entities';
import { STATE_COLOR_KIND } from '../utils/uc-state-color';

const stateColor = (entity: string) => ({
  kind: STATE_COLOR_KIND,
  fallback: '#888888',
  rules: [
    {
      color: '#ffc107',
      match: 'every',
      conditions: [{ type: 'entity_state', entity, operator: '=', value: 'on' }],
    },
  ],
});

const navModule = (): any => ({
  id: 'nav1',
  type: 'navigation',
  nav_scope: 'all_views',
  nav_routes: [
    { id: 'r1', icon: 'mdi:lamp', url: '/lovelace/0', icon_color: stateColor('light.lamp') },
    { id: 'r2', icon: 'mdi:home', url: '/lovelace/1', badge: { entity: 'sensor.count' } },
  ],
});

const hassWith = (lamp: string): any => ({
  states: {
    'light.lamp': { entity_id: 'light.lamp', state: lamp, attributes: {}, last_updated: lamp },
  },
});

let haEl: HTMLElement | null = null;
afterEach(() => {
  ucNavigationService.unregisterModule('card-test', 'nav1');
  haEl?.remove();
  haEl = null;
});

describe('navbar entity colours stay live', () => {
  it('lists the entities a navbar depends on', () => {
    const live = collectNavLiveEntities(navModule());
    expect([...live.entities].sort()).toEqual(['light.lamp', 'sensor.count']);
    expect(live.anyChange).toBe(false);
  });

  it('flags JS templates, which can read any entity', () => {
    const mod = navModule();
    mod.nav_routes[1].icon_color = "[[[ return states['sun.sun'].state === 'above_horizon' ? 'gold' : 'grey' ]]]";
    expect(collectNavLiveEntities(mod).anyChange).toBe(true);
  });

  it('re-resolves colour by entity state from the live hass on each redraw', () => {
    haEl = document.createElement('home-assistant');
    (haEl as any).hass = hassWith('off');
    document.body.appendChild(haEl);

    ucNavigationService.registerModule('card-test', 'nav1', navModule(), hassWith('off'), {} as any);
    const reg = (ucNavigationService as any).registeredModules.get('card-test-nav1');
    expect(reg.module.nav_routes[0].icon_color).toBe('#888888');

    // The card that holds the navbar is off screen now; only HA's root hass changes.
    (haEl as any).hass = hassWith('on');
    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      (ucNavigationService as any).renderNavigationForContainer(reg, container);
    } catch {
      // Drawing in jsdom may fail on layout APIs; the colour is resolved before that.
    }
    expect(reg.module.nav_routes[0].icon_color).toBe('#ffc107');
    expect(reg.rawModule.nav_routes[0].icon_color.kind).toBe(STATE_COLOR_KIND);
    container.remove();
  });
});
