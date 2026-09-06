import { describe, it, expect, beforeEach } from 'vitest';
import { findHuiRoot, ucThemePageService } from './uc-theme-page-service';

/** hui-root > (shadow) #view > hui-view > (shadow) card, as in Home Assistant. */
function mountView(): { root: HTMLElement; addCard: () => HTMLElement } {
  const root = document.createElement('hui-root');
  const rootShadow = root.attachShadow({ mode: 'open' });
  const view = document.createElement('hui-view');
  rootShadow.appendChild(view);
  const viewShadow = view.attachShadow({ mode: 'open' });
  document.body.appendChild(root);
  return {
    root,
    addCard: () => {
      const card = document.createElement('ultra-card');
      viewShadow.appendChild(card);
      return card;
    },
  };
}

describe('ucThemePageService', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('finds hui-root across shadow boundaries', () => {
    const { root, addCard } = mountView();
    expect(findHuiRoot(addCard())).toBe(root);
    expect(findHuiRoot(document.createElement('div'))).toBeNull();
  });

  it('paints the view root while a card claims it and restores it on release', () => {
    const { root, addCard } = mountView();
    const card = addCard();
    ucThemePageService.claim(card, '#e4e8ef');
    expect(root.style.getPropertyValue('--lovelace-background')).toBe('#e4e8ef');
    expect(root.style.getPropertyValue('--primary-background-color')).toBe('#e4e8ef');
    expect(root.hasAttribute('data-uc-theme-page')).toBe(true);

    ucThemePageService.release(card);
    expect(root.style.getPropertyValue('--lovelace-background')).toBe('');
    expect(root.style.getPropertyValue('--primary-background-color')).toBe('');
    expect(root.hasAttribute('data-uc-theme-page')).toBe(false);
  });

  it('keeps the paint until the last claiming card leaves', () => {
    const { root, addCard } = mountView();
    const a = addCard();
    const b = addCard();
    ucThemePageService.claim(a, '#111');
    ucThemePageService.claim(b, '#111');
    ucThemePageService.release(a);
    expect(root.style.getPropertyValue('--lovelace-background')).toBe('#111');
    ucThemePageService.release(b);
    expect(root.style.getPropertyValue('--lovelace-background')).toBe('');
  });

  it('claiming undefined releases, and a detached card can still release', () => {
    const { root, addCard } = mountView();
    const card = addCard();
    ucThemePageService.claim(card, '#222');
    card.remove();
    ucThemePageService.claim(card, undefined);
    expect(ucThemePageService.current(root)).toBeUndefined();
  });

  it('does not put a gradient into --primary-background-color', () => {
    const { root, addCard } = mountView();
    const bg = 'linear-gradient(180deg, #08041a, #2d1058)';
    ucThemePageService.claim(addCard(), bg);
    expect(root.style.getPropertyValue('--lovelace-background')).toBe(bg);
    expect(root.style.getPropertyValue('--primary-background-color')).toBe('');
  });

  it('ignores cards outside a Lovelace view (editor previews)', () => {
    const card = document.createElement('ultra-card');
    document.body.appendChild(card);
    ucThemePageService.claim(card, '#333');
    expect(document.documentElement.style.getPropertyValue('--lovelace-background')).toBe('');
  });
});
