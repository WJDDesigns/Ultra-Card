/**
 * Clipboard helpers for Ultra Card UI surfaces.
 *
 * Home Assistant is commonly served over plain HTTP on a LAN address. In that
 * case the page is not a secure context and `navigator.clipboard` is undefined,
 * so callers must never assume a write succeeded.
 */

/**
 * Copy `text` to the clipboard and report whether the write actually landed.
 *
 * Must be called directly from a user-gesture handler: when the async Clipboard
 * API is unavailable this falls back to `execCommand`, which browsers only
 * honour while the originating gesture is still on the call stack.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;

  // Runs before the first await, so the user gesture is still active here.
  if (!clipboard?.writeText) {
    return legacyCopy(text);
  }

  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    // The gesture is gone once we've awaited, so this seldom succeeds — but it
    // costs nothing and recovers the case where writeText rejected immediately.
    return legacyCopy(text);
  }
}

/**
 * Deprecated `execCommand` copy via an offscreen textarea. Restores any prior
 * document selection so the user's own highlight is not clobbered.
 */
function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const previousRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
    if (selection && previousRange) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
  }
}
