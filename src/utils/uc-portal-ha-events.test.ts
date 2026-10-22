/** @vitest-environment jsdom */
import { describe, it, expect, afterEach } from 'vitest';
import { forwardHaEventsFromPortal } from './uc-portal-ha-events';

afterEach(() => {
  document.body.innerHTML = '';
});

const setup = () => {
  const ha = document.createElement('home-assistant');
  document.body.appendChild(ha);
  const portal = document.createElement('div');
  document.body.appendChild(portal);
  const card = document.createElement('hui-tile-card');
  portal.appendChild(card);
  return { ha, portal, card };
};

describe('forwardHaEventsFromPortal', () => {
  it('re-fires more-info from portal content on <home-assistant> once', () => {
    const { ha, portal, card } = setup();
    forwardHaEventsFromPortal(portal);
    forwardHaEventsFromPortal(portal);

    const seen: string[] = [];
    let reachedDocumentFromPortal = 0;
    ha.addEventListener('hass-more-info', e => seen.push((e as CustomEvent).detail.entityId));
    document.addEventListener('hass-more-info', e => {
      if (e.target !== ha) reachedDocumentFromPortal++;
    });

    card.dispatchEvent(
      new CustomEvent('hass-more-info', {
        detail: { entityId: 'light.kitchen' },
        bubbles: true,
        composed: true,
      })
    );

    expect(seen).toEqual(['light.kitchen']);
    expect(reachedDocumentFromPortal).toBe(0);
  });

  it('forwards hass-action and show-dialog too', () => {
    const { ha, portal, card } = setup();
    forwardHaEventsFromPortal(portal);
    const seen: string[] = [];
    ha.addEventListener('hass-action', e => seen.push(e.type));
    ha.addEventListener('show-dialog', e => seen.push(e.type));

    card.dispatchEvent(new CustomEvent('hass-action', { bubbles: true, composed: true }));
    card.dispatchEvent(new CustomEvent('show-dialog', { bubbles: true, composed: true }));

    expect(seen).toEqual(['hass-action', 'show-dialog']);
  });

  it('leaves events alone when there is no <home-assistant> element', () => {
    const portal = document.createElement('div');
    document.body.appendChild(portal);
    forwardHaEventsFromPortal(portal);
    let reachedDocument = 0;
    document.addEventListener('hass-more-info', () => reachedDocument++, { once: true });

    portal.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true }));

    expect(reachedDocument).toBe(1);
  });
});
