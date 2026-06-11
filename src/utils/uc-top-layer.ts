/**
 * Promote an element into the browser's top layer via the Popover API.
 *
 * Overlays rendered inside HA's edit-card dialog use `position: fixed`, but the
 * dialog surface establishes a containing block (transform/filter/contain), so
 * without promotion they get trapped and render as a "small window" clipped to
 * the dialog. Promotion also guarantees correct paint order against other
 * top-layer UI (e.g. the Add Module popup): top-layer elements paint in the
 * order they were shown, so an overlay promoted after the popup paints above it.
 *
 * Callers must neutralize the UA `[popover]` styles in their own CSS
 * (margin, border, padding, width, height, max-width/height, overflow, background).
 *
 * Browsers without the Popover API (Safari < 17) silently keep the existing
 * z-index stacking — no worse than before.
 */
export function promoteToTopLayer(el: HTMLElement): void {
  const showPopover = (el as HTMLElement & { showPopover?: () => void }).showPopover;
  if (typeof showPopover !== 'function') return;
  if (!el.hasAttribute('popover')) el.setAttribute('popover', 'manual');
  try {
    if (!el.matches(':popover-open')) showPopover.call(el);
  } catch {
    el.removeAttribute('popover');
  }
}
