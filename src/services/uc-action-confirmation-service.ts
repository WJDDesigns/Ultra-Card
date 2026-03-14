import { HomeAssistant } from 'custom-card-helpers';
import { TapActionConfig } from '../components/ultra-link';

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
  async showConfirmation(action: TapActionConfig): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const actionDescription = this.getActionDescription(action);
      
      // Try to use Home Assistant's showDialog if available
      if (this.hass && (this.hass as any).callService && (window as any).loadCardHelpers) {
        // Use HA's dialog system if available
        const content = `
          <p style="margin: 0 0 20px 0; color: var(--primary-text-color);">
            Are you sure you want to execute this action?
          </p>
          <div style="background: var(--secondary-background-color); padding: 12px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px;">
              Action Details:
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); line-height: 1.6;">
              ${actionDescription}
            </div>
          </div>
        `;
        
        // Fallback to manual dialog creation
        this._createManualDialog(content, resolve);
      } else {
        // Create dialog manually
        this._createManualDialog(actionDescription, resolve);
      }
    });
  }

  private _createManualDialog(actionDescription: string, resolve: (value: boolean) => void): void {
    const dialog = document.createElement('ha-dialog') as any;
    dialog.open = true;
    dialog.heading = 'Confirm Action';

    let confirmed = false;

    // Content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'uc-confirmation-dialog-content';
    contentDiv.innerHTML = `
      <p class="confirmation-message">
        Are you sure you want to execute this action?
      </p>
    `;
    dialog.appendChild(contentDiv);

    // Use mwc-button for action slots — required by ha-dialog to render correctly
    const cancelButton = document.createElement('mwc-button') as any;
    cancelButton.slot = 'secondaryAction';
    cancelButton.dialogAction = 'cancel';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      confirmed = false;
      dialog.close();
    });
    dialog.appendChild(cancelButton);

    const confirmButton = document.createElement('mwc-button') as any;
    confirmButton.slot = 'primaryAction';
    confirmButton.dialogAction = 'ok';
    confirmButton.setAttribute('raised', '');
    confirmButton.textContent = 'Confirm';
    confirmButton.addEventListener('click', () => {
      confirmed = true;
      dialog.close();
    });
    dialog.appendChild(confirmButton);

    const handleClosed = () => {
      dialog.removeEventListener('closed', handleClosed);
      if (dialog.parentNode) {
        document.body.removeChild(dialog);
      }
      resolve(confirmed);
    };

    dialog.addEventListener('closed', handleClosed);
    document.body.appendChild(dialog);

    // Scoped styles for dialog content and mobile fullscreen fix
    const style = document.createElement('style');
    style.textContent = `
      .uc-confirmation-dialog-content {
        padding: 8px 0 16px;
        text-align: center;
      }
      .uc-confirmation-dialog-content .confirmation-message {
        margin: 0;
        color: var(--primary-text-color);
        font-size: 15px;
        line-height: 1.5;
      }
    `;
    document.head.appendChild(style);

    dialog.addEventListener('closed', () => {
      if (style.parentNode) style.remove();
    }, { once: true });
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

