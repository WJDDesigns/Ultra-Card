/**
 * Constructable stylesheets shared by every Ultra Card on the page.
 *
 * The combined module CSS used to be copied into a <style> in each card's shadow
 * root, so ten cards meant ten copies to parse. A constructed sheet is parsed once
 * and adopted by every root.
 */

export const supportsAdoptedStyleSheets: boolean =
  typeof ShadowRoot !== 'undefined' &&
  'adoptedStyleSheets' in ShadowRoot.prototype &&
  typeof CSSStyleSheet !== 'undefined' &&
  'replaceSync' in CSSStyleSheet.prototype;

const sheets = new Map<string, { css: string; sheet: CSSStyleSheet }>();

/** One sheet per key; its rules are replaced in place when the text changes. */
export function getSharedStyleSheet(key: string, css: string): CSSStyleSheet {
  const entry = sheets.get(key);
  if (entry) {
    if (entry.css !== css) {
      entry.sheet.replaceSync(css);
      entry.css = css;
    }
    return entry.sheet;
  }
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  sheets.set(key, { css, sheet });
  return sheet;
}

/**
 * Put `wanted` at the front of the root's adopted sheets, in order, replacing any
 * sheets from `previous` that this caller added before. Sheets other code adopted
 * (Lit's static styles) keep their place after them, so the cascade order is the
 * same as the <style> elements this replaces: tree styles came before Lit's.
 */
export function adoptLeadingStyleSheets(
  root: ShadowRoot,
  wanted: CSSStyleSheet[],
  previous: CSSStyleSheet[]
): void {
  const drop = new Set([...previous, ...wanted]);
  const rest = root.adoptedStyleSheets.filter(s => !drop.has(s));
  root.adoptedStyleSheets = [...wanted, ...rest];
}
