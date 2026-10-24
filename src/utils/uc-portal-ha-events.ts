/**
 * Popup and drawer content is rendered into a portal appended to document.body,
 * which sits outside the <home-assistant> element. HA listens for these events
 * on <home-assistant> itself, so events fired by cards inside a portal (for
 * example a tile card's more-info tap) bubble to body/document and are never
 * handled. Catch them at the portal root and re-fire them on <home-assistant>.
 * Lit context requests are forwarded the same way (see forwardContextRequest).
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
  portal.addEventListener('context-request', forwardContextRequest);
  (portal as any)[FORWARDER_KEY] = forward;
}

/**
 * Newer HA elements (e.g. ha-camera-stream for live cameras) get their
 * connection and config from Lit context provided by <home-assistant>, not from
 * a `hass` property. A context request from inside a portal never reaches that
 * provider, so the element renders nothing. Re-ask on <home-assistant>, keeping
 * the original requester as the context target.
 */
function forwardContextRequest(ev: Event): void {
  const portal = ev.currentTarget as HTMLElement;
  const target = document.querySelector('home-assistant');
  if (!target || target.contains(portal)) return;
  const req = ev as Event & {
    context?: unknown;
    callback?: unknown;
    subscribe?: boolean;
    contextTarget?: Element;
  };
  ev.stopPropagation();
  const forwarded = new Event('context-request', { bubbles: true, composed: true });
  Object.assign(forwarded, {
    context: req.context,
    callback: req.callback,
    subscribe: req.subscribe,
    contextTarget: req.contextTarget ?? (ev.composedPath()[0] as Element),
  });
  target.dispatchEvent(forwarded);
}
