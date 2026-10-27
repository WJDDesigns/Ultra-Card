/**
 * PIN / code prompt shown before a lock (or other entity) service call that needs a code.
 *
 * Follows the confirmation dialog's pattern: a plain DOM overlay on <body> at the top
 * z-index, so it also works from inside Ultra popups and drawers.
 */

export interface CodePromptOptions {
  title: string;
  /** HA `code_format` regex. A numeric format shows the keypad; anything else a text field. */
  codeFormat?: string | undefined;
  confirmText: string;
  cancelText: string;
  clearLabel: string;
  placeholder: string;
  /**
   * A PIN saved in the card. When set, the prompt checks the typed code itself and
   * stays open on a wrong one instead of passing it on.
   */
  expected?: string | undefined;
  /** Shown in the field after a wrong `expected` code. */
  wrongText?: string | undefined;
}

function formatRegex(codeFormat?: string): RegExp | null {
  if (!codeFormat) return null;
  try {
    return new RegExp(codeFormat);
  } catch {
    return null;
  }
}

/** HA locks with a numeric code use formats like `^\d{4}$` or `^\d+$`. */
export function isNumericCodeFormat(codeFormat?: string): boolean {
  if (!codeFormat) return true;
  return /^\^?\\d(\{\d+(,\d*)?\}|[+*])?\$?$/.test(codeFormat);
}

/** Resolves with the typed code, or null when cancelled. */
export function promptForCode(options: CodePromptOptions): Promise<string | null> {
  return new Promise(resolve => {
    const numeric = isNumericCodeFormat(options.codeFormat);
    const regex = formatRegex(options.codeFormat);

    const overlay = document.createElement('div');
    overlay.className = 'uc-code-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', options.title);

    const backdrop = document.createElement('div');
    backdrop.className = 'uc-code-backdrop';
    const panel = document.createElement('div');
    panel.className = 'uc-code-panel';

    const title = document.createElement('h2');
    title.className = 'uc-code-title';
    title.textContent = options.title;

    const input = document.createElement('input');
    input.className = 'uc-code-input';
    input.type = 'password';
    input.autocomplete = 'off';
    input.placeholder = options.placeholder;
    // With the keypad on screen, a focused field would pop the phone keyboard over it,
    // so the field is display-only and typed digits are handled in onKeydown.
    if (numeric) input.readOnly = true;

    const actions = document.createElement('div');
    actions.className = 'uc-code-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'uc-code-btn';
    cancel.textContent = options.cancelText;
    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = 'uc-code-btn primary';
    confirm.textContent = options.confirmText;
    actions.append(cancel, confirm);

    const showWrong = (): void => {
      input.value = '';
      input.placeholder = options.wrongText || options.placeholder;
      input.classList.remove('uc-code-input--wrong');
      // Restart the shake on repeated misses
      void input.offsetWidth;
      input.classList.add('uc-code-input--wrong');
      refresh();
    };
    /** Resolves when the code is acceptable; a wrong saved PIN keeps the prompt open. */
    const submit = (): void => {
      if (!isValid()) return;
      if (options.expected !== undefined && input.value !== options.expected) {
        showWrong();
        return;
      }
      finish(input.value);
    };

    const isValid = (): boolean => {
      const v = input.value;
      if (!v) return false;
      return regex ? regex.test(v) : true;
    };
    const refresh = (): void => {
      confirm.disabled = !isValid();
    };

    panel.append(title, input);

    if (numeric) {
      const pad = document.createElement('div');
      pad.className = 'uc-code-pad';
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];
      for (const k of keys) {
        const key = document.createElement('button');
        key.type = 'button';
        key.className = 'uc-code-key';
        if (k === 'clear') {
          key.textContent = options.clearLabel;
          key.classList.add('uc-code-key--small');
        } else if (k === 'back') {
          key.textContent = '⌫';
          key.setAttribute('aria-label', 'Backspace');
        } else {
          key.textContent = k;
        }
        key.addEventListener('click', () => {
          if (k === 'clear') input.value = '';
          else if (k === 'back') input.value = input.value.slice(0, -1);
          else input.value += k;
          refresh();
        });
        pad.appendChild(key);
      }
      panel.appendChild(pad);
    }

    panel.appendChild(actions);
    overlay.append(backdrop, panel);

    const style = document.createElement('style');
    style.textContent = `
      .uc-code-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: grid;
        place-items: center;
      }
      .uc-code-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.56);
      }
      .uc-code-panel {
        position: relative;
        width: min(88vw, 320px);
        border-radius: 18px;
        background: var(--card-background-color, #1f1f1f);
        color: var(--primary-text-color);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.42);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-sizing: border-box;
      }
      .uc-code-title {
        margin: 0;
        font-size: 18px;
        line-height: 1.25;
        text-align: center;
      }
      .uc-code-input {
        font: inherit;
        font-size: 22px;
        letter-spacing: 6px;
        text-align: center;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }
      .uc-code-input:focus {
        border-color: var(--primary-color);
      }
      .uc-code-input--wrong {
        border-color: var(--error-color, #db4437);
        animation: uc-code-shake 0.35s ease;
      }
      .uc-code-input--wrong::placeholder {
        color: var(--error-color, #db4437);
        letter-spacing: normal;
        font-size: 15px;
      }
      @keyframes uc-code-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        75% { transform: translateX(6px); }
      }
      .uc-code-pad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .uc-code-key {
        font: inherit;
        font-size: 22px;
        font-weight: 500;
        height: 56px;
        border-radius: 14px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .uc-code-key--small {
        font-size: 14px;
      }
      .uc-code-key:active {
        background: color-mix(in srgb, var(--primary-color) 25%, var(--secondary-background-color));
      }
      .uc-code-actions {
        display: flex;
        gap: 10px;
      }
      .uc-code-btn {
        flex: 1;
        font: inherit;
        font-weight: 600;
        min-height: 40px;
        border-radius: 999px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .uc-code-btn.primary {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .uc-code-btn:disabled {
        opacity: 0.45;
        cursor: default;
      }
    `;

    let done = false;
    const finish = (value: string | null): void => {
      if (done) return;
      done = true;
      document.removeEventListener('keydown', onKeydown, { capture: true });
      overlay.remove();
      style.remove();
      resolve(value);
    };

    // Capture phase so an Ultra popup underneath doesn't also see Escape / Enter.
    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        finish(null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        submit();
      } else if (numeric && /^[0-9]$/.test(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        input.value += e.key;
        refresh();
      } else if (numeric && e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        input.value = input.value.slice(0, -1);
        refresh();
      }
    };

    input.addEventListener('input', refresh);
    cancel.addEventListener('click', () => finish(null));
    confirm.addEventListener('click', submit);
    backdrop.addEventListener('click', () => finish(null));

    refresh();
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKeydown, { capture: true });
    if (!numeric) requestAnimationFrame(() => input.focus());
  });
}
