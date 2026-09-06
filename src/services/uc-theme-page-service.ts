/**
 * Lets a theme paint the Lovelace view behind its cards.
 *
 * Neumorphism, wood, metal: these looks only work when the page is the same
 * material as the card, so a theme may set `tokens.page_background`. Each
 * themed card claims the background on the nearest `hui-root` (set as the
 * `--lovelace-background` custom property, which every HA view reads); the
 * property is removed when the last claiming card leaves the page, so
 * navigating to an unthemed view restores Home Assistant's own background.
 *
 * Precedence is HA's: a view `background:` or a view theme sets the same
 * variable on `hui-view`, which is closer to the content and therefore wins,
 * so a user who wants a different page keeps it by setting it on the view.
 * A global switch (Hub > Themes) turns page painting off entirely.
 */

const LOVELACE_BG = '--lovelace-background';
const PRIMARY_BG = '--primary-background-color';

/** Per hui-root: which cards claim which background. */
const CLAIMS = new WeakMap<HTMLElement, Map<HTMLElement, string>>();
/** Card -> root it claimed on, so release works after the card is detached. */
const ROOT_OF = new WeakMap<HTMLElement, HTMLElement>();

export function findHuiRoot(el: Element): HTMLElement | null {
  let node: Node | null = el;
  while (node) {
    if (node instanceof HTMLElement && node.localName === 'hui-root') return node;
    const parent: Node | null = node.parentNode;
    node = parent instanceof ShadowRoot ? parent.host : parent;
  }
  return null;
}

function paint(root: HTMLElement): void {
  const claims = CLAIMS.get(root);
  const bg = claims && claims.size ? Array.from(claims.values()).pop() : undefined;
  if (bg) {
    root.style.setProperty(LOVELACE_BG, bg);
    // HA derives other colours from the primary background (header, gaps
    // between sections), so keep it in step, but only with a plain colour:
    // a gradient there would break every `var()` that expects one.
    if (/gradient\(|url\(/i.test(bg)) root.style.removeProperty(PRIMARY_BG);
    else root.style.setProperty(PRIMARY_BG, bg);
    root.setAttribute('data-uc-theme-page', '');
  } else {
    root.style.removeProperty(LOVELACE_BG);
    root.style.removeProperty(PRIMARY_BG);
    root.removeAttribute('data-uc-theme-page');
  }
}

class UcThemePageService {
  /** Claim (or update) this card's page background. `undefined` releases it. */
  claim(card: HTMLElement, background: string | undefined): void {
    if (!background) {
      this.release(card);
      return;
    }
    const root = findHuiRoot(card) ?? ROOT_OF.get(card) ?? null;
    if (!root) return;
    let claims = CLAIMS.get(root);
    if (!claims) {
      claims = new Map();
      CLAIMS.set(root, claims);
    }
    if (claims.get(card) === background) return;
    claims.set(card, background);
    ROOT_OF.set(card, root);
    paint(root);
  }

  release(card: HTMLElement): void {
    const root = ROOT_OF.get(card);
    if (!root) return;
    ROOT_OF.delete(card);
    const claims = CLAIMS.get(root);
    if (!claims?.delete(card)) return;
    paint(root);
  }

  /** What a root is currently painted with, if anything (for tests and tooling). */
  current(root: HTMLElement): string | undefined {
    const claims = CLAIMS.get(root);
    return claims && claims.size ? Array.from(claims.values()).pop() : undefined;
  }
}

export const ucThemePageService = new UcThemePageService();
