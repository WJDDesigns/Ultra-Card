import { Z_INDEX } from '../utils/uc-z-index';

interface ConfirmOptions {
  /** Highlight confirm button in --error-color for destructive actions */
  destructive?: boolean | undefined;
  confirmText?: string | undefined;
  cancelText?: string | undefined;
}

class UcConfirmService {
  /**
   * Shows a styled confirmation dialog.
   * Returns true if the user confirmed, false if cancelled/dismissed.
   */
  confirm(title: string, message: string, options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const { destructive = false, confirmText = 'Confirm', cancelText = 'Cancel' } = options;

      const { overlay, style } = this._buildOverlay();

      overlay.innerHTML = `
        <div class="uc-cd-backdrop"></div>
        <div class="uc-cd-panel" role="dialog" aria-modal="true" aria-labelledby="uc-cd-title">
          <h2 class="uc-cd-title" id="uc-cd-title"></h2>
          <p class="uc-cd-message"></p>
          <div class="uc-cd-actions"></div>
        </div>
      `;

      (overlay.querySelector('.uc-cd-title') as HTMLElement).textContent = title;
      (overlay.querySelector('.uc-cd-message') as HTMLElement).textContent = message;

      const actions = overlay.querySelector('.uc-cd-actions') as HTMLElement;

      const cancelBtn = this._makeButton(cancelText, false, destructive);
      const confirmBtn = this._makeButton(confirmText, true, destructive);

      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);

      let resolved = false;
      const finalize = (confirmed: boolean) => {
        if (resolved) return;
        resolved = true;
        document.removeEventListener('keydown', handleKey);
        style.remove();
        overlay.remove();
        resolve(confirmed);
      };

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          finalize(false);
          return;
        }
        if (e.key === 'Enter') {
          const activeEl = document.activeElement;
          if (activeEl === cancelBtn) {
            e.preventDefault();
            finalize(false);
            return;
          }
          if (activeEl === confirmBtn) {
            e.preventDefault();
            finalize(true);
            return;
          }
          // For destructive dialogs, require explicit focus on confirm to avoid accidental Enter confirms.
          if (destructive) return;
          e.preventDefault();
          finalize(true);
        }
      };

      overlay.querySelector('.uc-cd-backdrop')!.addEventListener('click', () => finalize(false));
      cancelBtn.addEventListener('click', () => finalize(false));
      confirmBtn.addEventListener('click', () => finalize(true));

      document.body.appendChild(overlay);
      document.addEventListener('keydown', handleKey);
      requestAnimationFrame(() => (destructive ? cancelBtn : confirmBtn).focus());
    });
  }

  /**
   * Shows a styled prompt dialog with a text input.
   * Returns the entered string, or null if cancelled/dismissed.
   */
  prompt(title: string, message: string, defaultValue = ''): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      const { overlay, style } = this._buildOverlay();

      overlay.innerHTML = `
        <div class="uc-cd-backdrop"></div>
        <div class="uc-cd-panel" role="dialog" aria-modal="true" aria-labelledby="uc-cd-title">
          <h2 class="uc-cd-title" id="uc-cd-title"></h2>
          <p class="uc-cd-message"></p>
          <input class="uc-cd-input" type="text" />
          <div class="uc-cd-actions"></div>
        </div>
      `;

      (overlay.querySelector('.uc-cd-title') as HTMLElement).textContent = title;
      (overlay.querySelector('.uc-cd-message') as HTMLElement).textContent = message;

      const input = overlay.querySelector('.uc-cd-input') as HTMLInputElement;
      input.value = defaultValue;

      const actions = overlay.querySelector('.uc-cd-actions') as HTMLElement;
      const cancelBtn = this._makeButton('Cancel', false, false);
      const confirmBtn = this._makeButton('OK', true, false);

      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);

      let resolved = false;
      const finalize = (value: string | null) => {
        if (resolved) return;
        resolved = true;
        document.removeEventListener('keydown', handleKey);
        style.remove();
        overlay.remove();
        resolve(value);
      };

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { e.preventDefault(); finalize(null); }
        if (e.key === 'Enter') { e.preventDefault(); finalize(input.value.trim() || null); }
      };

      overlay.querySelector('.uc-cd-backdrop')!.addEventListener('click', () => finalize(null));
      cancelBtn.addEventListener('click', () => finalize(null));
      confirmBtn.addEventListener('click', () => finalize(input.value.trim() || null));

      document.body.appendChild(overlay);
      document.addEventListener('keydown', handleKey);
      requestAnimationFrame(() => input.focus());
    });
  }

  private _makeButton(text: string, isPrimary: boolean, destructive: boolean): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = isPrimary ? 'uc-cd-btn primary' : 'uc-cd-btn secondary';
    if (isPrimary && destructive) btn.classList.add('destructive');
    btn.textContent = text;
    return btn;
  }

  private _buildOverlay(): { overlay: HTMLDivElement; style: HTMLStyleElement } {
    const overlay = document.createElement('div');
    overlay.className = 'uc-cd-overlay';

    const style = document.createElement('style');
    style.textContent = `
      .uc-cd-overlay {
        position: fixed;
        inset: 0;
        z-index: ${Z_INDEX.DIALOG_OVERLAY};
        display: grid;
        place-items: center;
      }
      .uc-cd-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
      }
      .uc-cd-panel {
        position: relative;
        width: min(92vw, 480px);
        border-radius: 12px;
        background: var(--card-background-color, #1f1f1f);
        color: var(--primary-text-color);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
        padding: 20px 20px 16px;
      }
      .uc-cd-title {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.3;
        color: var(--primary-text-color);
      }
      .uc-cd-message {
        margin: 0 0 16px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--secondary-text-color);
      }
      .uc-cd-input {
        width: 100%;
        box-sizing: border-box;
        padding: 8px 10px;
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color, #2b2b2b);
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
      }
      .uc-cd-input:focus {
        border-color: var(--primary-color);
      }
      .uc-cd-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .uc-cd-btn {
        border-radius: 6px;
        min-height: 36px;
        padding: 0 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.15s ease;
      }
      .uc-cd-btn:hover { opacity: 0.85; }
      .uc-cd-btn.secondary {
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--primary-text-color);
      }
      .uc-cd-btn.primary {
        border: 1px solid var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .uc-cd-btn.primary.destructive {
        border-color: var(--error-color, #f44336);
        background: var(--error-color, #f44336);
        color: #fff;
      }
    `;
    document.head.appendChild(style);
    return { overlay, style };
  }
}

export const ucConfirmService = new UcConfirmService();
