/**
 * "Draw your pattern" prompt shown before unlocking when a Lock module uses pattern unlock.
 *
 * Same overlay approach as the PIN prompt: plain DOM on <body> at the top z-index, so it
 * also works from inside Ultra popups and drawers.
 */
import '../components/uc-pattern-pad';
import type { UcPatternPad } from '../components/uc-pattern-pad';

export interface PatternPromptOptions {
  title: string;
  /** The saved pattern, dot numbers 1-9 as a string. */
  expected: string;
  hint: string;
  wrongText: string;
  cancelText: string;
}

/** Resolves true once the right pattern is drawn, false when cancelled. */
export function promptForPattern(options: PatternPromptOptions): Promise<boolean> {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'uc-pattern-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', options.title);

    const backdrop = document.createElement('div');
    backdrop.className = 'uc-pattern-backdrop';
    const panel = document.createElement('div');
    panel.className = 'uc-pattern-panel';

    const title = document.createElement('h2');
    title.className = 'uc-pattern-title';
    title.textContent = options.title;

    const message = document.createElement('div');
    message.className = 'uc-pattern-message';
    message.textContent = options.hint;

    const pad = document.createElement('uc-pattern-pad') as UcPatternPad;

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'uc-pattern-btn';
    cancel.textContent = options.cancelText;

    panel.append(title, message, pad, cancel);
    overlay.append(backdrop, panel);

    const style = document.createElement('style');
    style.textContent = `
      .uc-pattern-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: grid;
        place-items: center;
      }
      .uc-pattern-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.56);
      }
      .uc-pattern-panel {
        position: relative;
        width: min(88vw, 320px);
        border-radius: 18px;
        background: var(--card-background-color, #1f1f1f);
        color: var(--primary-text-color);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.42);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-sizing: border-box;
      }
      .uc-pattern-title {
        margin: 0;
        font-size: 18px;
        line-height: 1.25;
        text-align: center;
      }
      .uc-pattern-message {
        min-height: 18px;
        font-size: 13px;
        text-align: center;
        color: var(--secondary-text-color);
      }
      .uc-pattern-message.error {
        color: var(--error-color, #db4437);
      }
      .uc-pattern-btn {
        font: inherit;
        font-weight: 600;
        min-height: 40px;
        border-radius: 999px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
      }
    `;

    let done = false;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = (ok: boolean): void => {
      if (done) return;
      done = true;
      clearTimeout(resetTimer);
      document.removeEventListener('keydown', onKeydown, { capture: true });
      overlay.remove();
      style.remove();
      resolve(ok);
    };

    // Capture phase so an Ultra popup underneath doesn't also see Escape.
    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        finish(false);
      }
    };

    pad.addEventListener('pattern-complete', (e: Event) => {
      const drawn = (e as CustomEvent<{ pattern: string }>).detail.pattern;
      clearTimeout(resetTimer);
      if (drawn === options.expected) {
        pad.status = 'ok';
        pad.disabled = true;
        setTimeout(() => finish(true), 250);
        return;
      }
      pad.status = 'error';
      message.textContent = options.wrongText;
      message.classList.add('error');
      resetTimer = setTimeout(() => {
        pad.clear();
        pad.status = '';
        message.textContent = options.hint;
        message.classList.remove('error');
      }, 900);
    });

    // Starting a new attempt cancels the pending reset so it can't wipe the new drawing.
    pad.addEventListener('pointerdown', () => {
      clearTimeout(resetTimer);
      pad.status = '';
      message.textContent = options.hint;
      message.classList.remove('error');
    });
    cancel.addEventListener('click', () => finish(false));
    backdrop.addEventListener('click', () => finish(false));

    document.head.appendChild(style);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKeydown, { capture: true });
  });
}
