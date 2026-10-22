/**
 * Popup and drawer content is rendered into a portal appended to document.body,
 * which sits outside the <home-assistant> element. HA listens for these events
 * on <home-assistant> itself, so events fired by cards inside a portal (for
 * example a tile card's more-info tap) bubble to body/document and are never
 * handled. Catch them at the portal root and re-fire them on <home-assistant>.
 */
export const UC_PORTAL_FORWARDED_HA_EVENTS = [
  'hass-more-info',
  'hass-action',
  'show-dialog',
  'hass-notification',
] as const;

const FORWARDER_KEY = '_ucHaEventForwarder';

export function forwardHaEventsFromPortal(portal: HTMLElement): void {
  if ((portal as any)[FORWARDER_KEY]) return;

  const forward = (ev: Event) => {
    const target = document.querySelector('home-assistant');
    if (!target || target.contains(portal)) return;
    ev.stopPropagation();
    target.dispatchEvent(
      new CustomEvent(ev.type, {
        detail: (ev as CustomEvent).detail,
        bubbles: true,
        composed: true,
      })
    );
  };

  for (const type of UC_PORTAL_FORWARDED_HA_EVENTS) {
    portal.addEventListener(type, forward);
  }
  (portal as any)[FORWARDER_KEY] = forward;
}
