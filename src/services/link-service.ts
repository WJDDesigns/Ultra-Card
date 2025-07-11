import { HomeAssistant, ActionConfig } from 'custom-card-helpers';

export interface LinkAction {
  action_type?:
    | 'none'
    | 'toggle'
    | 'show_more_info'
    | 'navigate'
    | 'url'
    | 'call_service'
    | 'perform_action'
    | 'show_map'
    | 'voice_assistant'
    | 'trigger';

  // Basic navigation
  navigation_path?: string;
  url?: string;
  url_path?: string;

  // Service calls
  service?: string;
  service_data?: Record<string, any>;
  target?: {
    entity_id?: string | string[];
    device_id?: string | string[];
    area_id?: string | string[];
  };

  // Entity actions
  entity?: string;

  // Map coordinates
  latitude?: number;
  longitude?: number;

  // Voice assistant
  start_listening?: boolean;

  // Custom action configuration for more complex actions
  custom_action?: ActionConfig;

  // Confirmation dialog
  confirmation?: {
    text?: string;
    exemptions?: { user: string }[];
  };
}

export class LinkService {
  private static instance: LinkService;
  private hass?: HomeAssistant;

  static getInstance(): LinkService {
    if (!LinkService.instance) {
      LinkService.instance = new LinkService();
    }
    return LinkService.instance;
  }

  setHass(hass: HomeAssistant): void {
    this.hass = hass;
  }

  async executeAction(action: LinkAction): Promise<void> {
    if (!this.hass || !action.action_type || action.action_type === 'none') {
      return;
    }

    try {
      // Handle confirmation if required
      if (action.confirmation) {
        const confirmed = confirm(action.confirmation.text || 'Are you sure?');
        if (!confirmed) return;
      }

      switch (action.action_type) {
        case 'toggle':
          if (action.entity) {
            await this.hass.callService('homeassistant', 'toggle', {
              entity_id: action.entity,
            });
          }
          break;

        case 'show_more_info':
          if (action.entity) {
            const event = new CustomEvent('hass-more-info', {
              detail: { entityId: action.entity },
              bubbles: true,
              composed: true,
            });
            document.dispatchEvent(event);
          }
          break;

        case 'navigate':
          if (action.navigation_path) {
            history.pushState(null, '', action.navigation_path);
            const event = new CustomEvent('location-changed', {
              detail: { replace: false },
              bubbles: true,
              composed: true,
            });
            window.dispatchEvent(event);
          }
          break;

        case 'url':
          if (action.url || action.url_path) {
            const url = action.url || action.url_path || '';
            window.open(url, '_blank');
          }
          break;

        case 'call_service':
          if (action.service) {
            const [domain, service] = action.service.split('.');
            if (domain && service) {
              await this.hass.callService(domain, service, action.service_data, action.target);
            }
          }
          break;

        case 'perform_action':
          if (action.custom_action) {
            // Use Home Assistant's action handler
            const actionEvent = new CustomEvent('action', {
              detail: { action: 'tap', config: action.custom_action },
              bubbles: true,
              composed: true,
            });
            document.dispatchEvent(actionEvent);
          }
          break;

        case 'show_map':
          if (action.latitude && action.longitude) {
            const mapPath = `/map?latitude=${action.latitude}&longitude=${action.longitude}`;
            history.pushState(null, '', mapPath);
            const event = new CustomEvent('location-changed', {
              detail: { replace: false },
              bubbles: true,
              composed: true,
            });
            window.dispatchEvent(event);
          }
          break;

        case 'voice_assistant':
          if (action.start_listening !== false) {
            // Trigger voice assistant
            const voiceEvent = new CustomEvent('hass-start-voice-conversation', {
              bubbles: true,
              composed: true,
            });
            document.dispatchEvent(voiceEvent);
          }
          break;

        case 'trigger':
          // Handle trigger actions (automation, script, etc.)
          if (action.entity) {
            await this.hass.callService('automation', 'trigger', {
              entity_id: action.entity,
            });
          }
          break;

        default:
          console.warn('Unknown action type:', action.action_type);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      // Optionally show user-friendly error message
    }
  }

  getActionTypeOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'none', label: 'No Action' },
      { value: 'toggle', label: 'Toggle' },
      { value: 'show_more_info', label: 'Show More Info' },
      { value: 'navigate', label: 'Navigate to Path' },
      { value: 'url', label: 'Open URL' },
      { value: 'call_service', label: 'Call Service' },
      { value: 'perform_action', label: 'Perform Action' },
      { value: 'show_map', label: 'Show Map' },
      { value: 'voice_assistant', label: 'Voice Assistant' },
      { value: 'trigger', label: 'Trigger' },
    ];
  }

  validateAction(action: LinkAction): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!action.action_type || action.action_type === 'none') {
      return { valid: true, errors: [] };
    }

    switch (action.action_type) {
      case 'toggle':
      case 'show_more_info':
      case 'trigger':
        if (!action.entity) {
          errors.push('Entity is required for this action type');
        }
        break;

      case 'navigate':
        if (!action.navigation_path) {
          errors.push('Navigation path is required');
        }
        break;

      case 'url':
        if (!action.url && !action.url_path) {
          errors.push('URL is required');
        }
        break;

      case 'call_service':
        if (!action.service) {
          errors.push('Service is required');
        } else if (!action.service.includes('.')) {
          errors.push('Service must be in domain.service format');
        }
        break;

      case 'show_map':
        if (action.latitude === undefined || action.longitude === undefined) {
          errors.push('Latitude and longitude are required for map action');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Helper method to render link action form
  renderActionForm(
    hass: HomeAssistant,
    action: LinkAction,
    onUpdate: (updates: Partial<LinkAction>) => void
  ): any {
    // This will be imported and used by components that need link functionality
    return {
      action,
      actionTypes: this.getActionTypeOptions(),
      onUpdate,
      validate: () => this.validateAction(action),
    };
  }
}

// Export singleton instance
export const linkService = LinkService.getInstance();
