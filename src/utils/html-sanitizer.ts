import DOMPurify from 'dompurify';

const FORBIDDEN_ACTIVE_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
];

/**
 * CSS constructs that cause the browser to fetch a URL. These are the reason
 * downloaded content cannot be given free rein over `style`: a request fired on
 * render confirms to a third party that the viewer saw the card.
 */
const CSS_FETCH_CONSTRUCTS = /url\s*\(|image-set\s*\(|-moz-binding|behavior\s*:|@import/i;

/**
 * Strip the declarations that can fetch a URL, keeping the rest of the rule.
 *
 * Withholding `style` wholesale was too blunt. Of the published presets that use
 * inline styles, every one is cosmetic — `color: indianred` for Sunday in a
 * weekday strip, `text-align: left` on a heading — and not one contains a
 * `url()`. Dropping the attribute made those presets render wrong while blocking
 * a vector they never used.
 *
 * Inline styles cannot carry selectors or `@import`, so a network fetch is the
 * only way out; remove those declarations and what remains is safe to keep.
 * `<style>` elements are a different matter and stay forbidden for downloaded
 * content, since they can carry both.
 */
export function stripCssFetches(style: string): string {
  if (!style || !CSS_FETCH_CONSTRUCTS.test(style)) return style;

  return style
    .split(';')
    // A fragment with no colon is not a declaration. This also drops the tail of
    // a url() that contained a semicolon inside quotes, which splitting above
    // would have severed — safe, because the half holding url() is dropped too.
    .filter(part => part.includes(':') && !CSS_FETCH_CONSTRUCTS.test(part))
    .map(part => part.trim())
    .filter(Boolean)
    .join('; ');
}

/**
 * Set only for the duration of a synchronous DOMPurify.sanitize call below.
 * DOMPurify hooks are global to the instance and receive no per-call context, and
 * sanitize() cannot yield midway, so a flag is safe here where it would not be
 * around anything async.
 */
let stripFetchesFromStyle = false;

DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (!stripFetchesFromStyle) return;
  const element = node as Element;
  const style = element.getAttribute?.('style');
  if (!style) return;

  const cleaned = stripCssFetches(style);
  if (cleaned === style) return;
  if (cleaned) element.setAttribute('style', cleaned);
  else element.removeAttribute('style');
});

function sanitizeWith<T>(trusted: boolean, run: () => T): T {
  stripFetchesFromStyle = !trusted;
  try {
    return run();
  } finally {
    stripFetchesFromStyle = false;
  }
}

/**
 * @param trusted Whether the content was authored locally. Downloaded content
 * keeps its cosmetic inline styles but loses anything that would fetch a URL, and
 * cannot use `<style>` blocks at all.
 */
export function sanitizeMarkdownHtml(
  html: string,
  enableHtml: boolean,
  options?: { trusted?: boolean }
): string {
  const trusted = options?.trusted !== false;

  return sanitizeWith(trusted, () =>
    DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS:
        enableHtml && trusted ? FORBIDDEN_ACTIVE_TAGS : [...FORBIDDEN_ACTIVE_TAGS, 'style'],
      // DOMParser moves raw <style> (and similar) out of implicit body fragments; DOMPurify then
      // serializes only body.innerHTML, so stylesheet blocks vanish. FORCE_BODY keeps markup in the
      // body subtree so sanitized output still contains <style> when HTML is enabled.
      FORCE_BODY: enableHtml,
    })
  );
}

export function sanitizePresetHtml(html: string): string {
  return sanitizeWith(false, () =>
    DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: [...FORBIDDEN_ACTIVE_TAGS, 'style'],
    })
  );
}

/** @see sanitizeMarkdownHtml for how `style` is treated on downloaded content. */
export function sanitizeRichTextHtml(html: string, options?: { trusted?: boolean }): string {
  const trusted = options?.trusted !== false;

  return sanitizeWith(trusted, () =>
    DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'a', 'mark'],
      ALLOWED_ATTR: ['style', 'href', 'target', 'rel', 'class', 'data-color'],
    })
  );
}

/** Escape dynamic strings for HTML text nodes and double-quoted attribute values. */
export function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
