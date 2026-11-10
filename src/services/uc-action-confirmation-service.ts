import type { HomeAssistant } from '../ha/types';
import { TapActionConfig } from '../components/ultra-link';
import { localize } from '../localize/localize';

export interface ConfirmationDialogOptions {
  showConfirmButton?: boolean | undefined;
  showCancelButton?: boolean | undefined;
  confirmText?: string | undefined;
  cancelText?: string | undefined;
}

/**
 * Service for showing action confirmation dialogs
 */
export class UcActionConfirmationService {
  private static instance: UcActionConfirmationService;
  private hass: HomeAssistant | null = null;

  private constructor() {}

  static getInstance(): UcActionConfirmationService {
    if (!UcActionConfirmationService.instance) {
      UcActionConfirmationService.instance = new UcActionConfirmationService();
    }
    return UcActionConfirmationService.instance;
  }

  setHass(hass: HomeAssistant): void {
    this.hass = hass;
  }

  /**
   * Shows a confirmation dialog before executing an action
   * @param action The action to confirm
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  async showConfirmation(action: TapActionConfig, options?: ConfirmationDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const actionDescription = this.getActionDescription(action);

      // Custom modal is now the canonical renderer in all environments.
      // This avoids duplicated message text caused by legacy rich-content paths.
      this._createManualDialog(actionDescription, resolve, options);
    });
  }

  private _createManualDialog(
    actionDescription: string,
    resolve: (value: boolean) => void,
    options?: ConfirmationDialogOptions
  ): void {
    const overlay = document.createElement('div');
    overlay.className = 'uc-confirmation-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const title = this._t('title', 'Confirm Action');
    overlay.setAttribute('aria-label', title);

    const showConfirmButton = options?.showConfirmButton !== false;
    const showCancelButton = options?.showCancelButton !== false;
    const effectiveShowCancelButton = showCancelButton || !showConfirmButton;
    const confirmText = options?.confirmText?.trim() || this._t('yes', 'Yes');
    const cancelText = options?.cancelText?.trim() || this._t('cancel', 'Cancel');

    // Static skeleton only. Everything derived from the action (paths, entity
    // ids, service names) can come from a downloaded preset or a template
    // result, so it is written with textContent below and never parsed as HTML.
    overlay.innerHTML = `
      <div class="uc-confirmation-backdrop"></div>
      <div class="uc-confirmation-panel">
        <h2 class="uc-confirmation-title"></h2>
        <p class="uc-confirmation-message"></p>
        <div class="uc-confirmation-details">
          <div class="uc-confirmation-details-label"></div>
          <div class="uc-confirmation-details-text"></div>
        </div>
        <div class="uc-confirmation-actions"></div>
      </div>
    `;

    const setText = (selector: string, text: string): void => {
      const el = overlay.querySelector(selector);
      if (el) el.textContent = text;
    };
    setText('.uc-confirmation-title', title);
    setText(
      '.uc-confirmation-message',
      this._t('message', 'Are you sure you want to execute this action?')
    );
    setText('.uc-confirmation-details-label', this._t('details', 'Action Details:'));
    setText('.uc-confirmation-details-text', actionDescription);

    const actionsRow = overlay.querySelector('.uc-confirmation-actions') as HTMLDivElement;

    let resolved = false;
    const finalize = (confirmed: boolean): void => {
      if (resolved) return;
      resolved = true;
      document.removeEventListener('keydown', handleKeydown, { capture: true });
      if (style.parentNode) style.remove();
      if (overlay.parentNode) overlay.remove();
      resolve(confirmed);
    };

    // Capture-phase handler so this runs BEFORE the popup module's document-level
    // keydown listeners. Otherwise, when this dialog is opened from inside an
    // Ultra popup, Escape would also close the popup underneath and the popup's
    // focus trap would steal Tab focus away from the dialog buttons.
    const handleKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        finalize(false);
        return;
      }
      if (event.key === 'Tab') {
        const buttons = Array.from(
          overlay.querySelectorAll<HTMLElement>('.uc-confirmation-btn')
        );
        if (buttons.length === 0) return;
        event.preventDefault();
        event.stopPropagation();
        const index = buttons.indexOf(document.activeElement as HTMLElement);
        const next = event.shiftKey
          ? index <= 0
            ? buttons.length - 1
            : index - 1
          : index === -1 || index === buttons.length - 1
            ? 0
            : index + 1;
        buttons[next]?.focus();
      }
    };

    if (effectiveShowCancelButton) {
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.className = 'uc-confirmation-btn secondary';
      cancelButton.textContent = cancelText;
      cancelButton.addEventListener('click', () => {
        finalize(false);
      });
      actionsRow.appendChild(cancelButton);
    }

    if (showConfirmButton) {
      const confirmButton = document.createElement('button');
      confirmButton.type = 'button';
      confirmButton.className = 'uc-confirmation-btn primary';
      confirmButton.textContent = confirmText;
      confirmButton.addEventListener('click', () => {
        finalize(true);
      });
      actionsRow.appendChild(confirmButton);
    }

    overlay.querySelector('.uc-confirmation-backdrop')?.addEventListener('click', () => finalize(false));
    document.body.appendChild(overlay);
    document.addEventListener('keydown', handleKeydown, { capture: true });

    requestAnimationFrame(() => {
      const focusTarget =
        (overlay.querySelector('.uc-confirmation-btn.primary') as HTMLElement | null) ??
        (overlay.querySelector('.uc-confirmation-btn.secondary') as HTMLElement | null);
      focusTarget?.focus();
    });

    // Scoped styles for custom modal
    const style = document.createElement('style');
    style.textContent = `
      .uc-confirmation-overlay {
        position: fixed;
        inset: 0;
        /* Ultra popup portals use the max 32-bit z-index (2147483647). The dialog
           must match it so DOM order (this overlay is appended to <body> after any
           open portal) puts the confirmation on top of popups. */
        z-index: 2147483647;
        display: grid;
        place-items: center;
      }
      .uc-confirmation-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.56);
      }
      .uc-confirmation-panel {
        position: relative;
        width: min(92vw, 520px);
        border-radius: 14px;
        background: var(--card-background-color, #1f1f1f);
        color: var(--primary-text-color);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.42);
        padding: 18px 18px 14px;
      }
      .uc-confirmation-title {
        margin: 0 0 10px;
        font-size: 20px;
        line-height: 1.2;
      }
      .uc-confirmation-message {
        margin: 0 0 10px;
        font-size: 15px;
        line-height: 1.45;
      }
      .uc-confirmation-details {
        margin: 12px 0 14px;
        padding: 12px;
        border-radius: 8px;
        background: var(--secondary-background-color);
      }
      .uc-confirmation-details-label {
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .uc-confirmation-details-text {
        font-size: 13px;
        line-height: 1.6;
        color: var(--secondary-text-color);
        overflow-wrap: anywhere;
      }
      .uc-confirmation-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .uc-confirmation-btn {
        border: 1px solid var(--divider-color);
        border-radius: 999px;
        min-height: 34px;
        padding: 0 14px;
        font-weight: 600;
        cursor: pointer;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }
      .uc-confirmation-btn.primary {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
    `;
    document.head.appendChild(style);
  }

  /** Dialog string in the user's language, English until the locale chunk loads. */
  private _t(key: string, fallback: string, vars?: Record<string, string>): string {
    const lang = this.hass?.locale?.language || 'en';
    let text = localize(`editor.actions.confirm_dialog.${key}`, lang, fallback);
    for (const [name, value] of Object.entries(vars ?? {})) {
      text = text.split(`{${name}}`).join(value);
    }
    return text;
  }

  /**
   * A human-readable, plain-text description of the action. The result is
   * always rendered with textContent; it is never markup.
   */
  private getActionDescription(action: TapActionConfig): string {
    const entity = action.entity ? String(action.entity) : '';
    switch (action.action) {
      case 'more-info':
        return entity
          ? this._t('more_info_for', 'Show more information for {entity}', { entity })
          : this._t('more_info', 'Show more information');
      case 'toggle':
        if (entity) return this._t('toggle_entity', 'Toggle {entity}', { entity });
        return action.target
          ? this._t('toggle_targets', 'Toggle target entities')
          : this._t('toggle', 'Toggle');
      case 'navigate':
        return this._t('navigate', 'Navigate to {path}', {
          path: String(action.navigation_path || this._t('unknown_path', 'unknown path')),
        });
      case 'url':
        return this._t('open_url', 'Open URL: {url}', {
          url: String(action.url_path || this._t('unknown_url', 'unknown URL')),
        });
      case 'perform-action': {
        const service = String(
          action.service || action.perform_action || this._t('unknown_service', 'unknown service')
        );
        return entity
          ? this._t('service_on', 'Execute service: {service} on {entity}', { service, entity })
          : this._t('service', 'Execute service: {service}', { service });
      }
      case 'assist':
        return this._t('assist', 'Open voice assistant');
      case 'nothing':
        return this._t('nothing', 'No action (nothing)');
      case 'default':
        return entity
          ? this._t('default_for', 'Default action for {entity}', { entity })
          : this._t('default', 'Default action');
      default:
        return this._t('unknown', 'Unknown action: {action}', { action: String(action.action) });
    }
  }
}

export const ucActionConfirmationService = UcActionConfirmationService.getInstance();

