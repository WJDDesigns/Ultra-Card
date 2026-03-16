import { HomeAssistant } from 'custom-card-helpers';
import { TapActionConfig } from '../components/ultra-link';

export interface ConfirmationDialogOptions {
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  confirmText?: string;
  cancelText?: string;
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
    overlay.setAttribute('aria-label', 'Confirm Action');

    const showConfirmButton = options?.showConfirmButton !== false;
    const showCancelButton = options?.showCancelButton !== false;
    const effectiveShowCancelButton = showCancelButton || !showConfirmButton;
    const confirmText = options?.confirmText?.trim() || 'Yes';
    const cancelText = options?.cancelText?.trim() || 'Cancel';

    // If the renderer passed rich HTML, preserve it; otherwise show plain text description.
    const actionDetailsHtml = actionDescription.includes('<')
      ? actionDescription
      : `
          <div style="background: var(--secondary-background-color); padding: 12px; border-radius: 8px; margin-top: 12px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px;">
              Action Details:
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); line-height: 1.6;">
              ${actionDescription}
            </div>
          </div>
        `;

    overlay.innerHTML = `
      <div class="uc-confirmation-backdrop"></div>
      <div class="uc-confirmation-panel">
        <h2 class="uc-confirmation-title">Confirm Action</h2>
        <p class="uc-confirmation-message">Are you sure you want to execute this action?</p>
        <div class="uc-confirmation-details">${actionDetailsHtml}</div>
        <div class="uc-confirmation-actions"></div>
      </div>
    `;

    const actionsRow = overlay.querySelector('.uc-confirmation-actions') as HTMLDivElement;

    let resolved = false;
    const finalize = (confirmed: boolean): void => {
      if (resolved) return;
      resolved = true;
      document.removeEventListener('keydown', handleKeydown);
      if (style.parentNode) style.remove();
      if (overlay.parentNode) overlay.remove();
      resolve(confirmed);
    };

    const handleKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finalize(false);
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
    document.addEventListener('keydown', handleKeydown);

    requestAnimationFrame(() => {
      const primaryAction = overlay.querySelector('.uc-confirmation-btn.primary') as HTMLElement | null;
      const secondaryAction = overlay.querySelector('.uc-confirmation-btn.secondary') as HTMLElement | null;
      const primaryRect = primaryAction?.getBoundingClientRect();
      const secondaryRect = secondaryAction?.getBoundingClientRect();
      const primaryStyle = primaryAction ? window.getComputedStyle(primaryAction) : null;
      const secondaryStyle = secondaryAction ? window.getComputedStyle(secondaryAction) : null;

    });

    // Scoped styles for custom modal
    const style = document.createElement('style');
    style.textContent = `
      .uc-confirmation-overlay {
        position: fixed;
        inset: 0;
        z-index: 10000;
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
        margin-bottom: 14px;
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

  /**
   * Gets a human-readable description of the action
   */
  private getActionDescription(action: TapActionConfig): string {
    switch (action.action) {
      case 'more-info':
        return `Show more information${action.entity ? ` for ${action.entity}` : ''}`;
      case 'toggle':
        return `Toggle${action.entity ? ` ${action.entity}` : action.target ? ' target entities' : ''}`;
      case 'navigate':
        return `Navigate to ${action.navigation_path || 'unknown path'}`;
      case 'url':
        return `Open URL: ${action.url_path || 'unknown URL'}`;
      case 'perform-action':
        const service = action.service || action.perform_action || 'unknown service';
        return `Execute service: ${service}${action.entity ? ` on ${action.entity}` : ''}`;
      case 'assist':
        return 'Open voice assistant';
      case 'nothing':
        return 'No action (nothing)';
      case 'default':
        return `Default action${action.entity ? ` for ${action.entity}` : ''}`;
      default:
        return `Unknown action: ${action.action}`;
    }
  }
}

export const ucActionConfirmationService = UcActionConfirmationService.getInstance();

