/**
 * Keyboard activation for clickable non-button elements.
 *
 * Editor rows, swatches, chips and similar are <div>/<span> elements with a
 * click handler. They carry role="button", tabindex="0" and `data-uc-activate`;
 * this one document listener makes Enter and Space click them, as a native
 * button would. The attribute keeps it away from HA's own role="button"
 * elements, which handle their keys themselves.
 */
let installed = false;

export function onActivationKey(e: KeyboardEvent): void {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  if (e.defaultPrevented || e.repeat) return;
  const target = e.composedPath()[0];
  if (!(target instanceof HTMLElement) || !target.hasAttribute('data-uc-activate')) return;
  e.preventDefault();
  target.click();
}

export function installKeyboardActivation(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('keydown', onActivationKey);
}
