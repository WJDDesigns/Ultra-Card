import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';

export interface UltraLinkConfig {
  tap_action?: TapActionConfig;
  hold_action?: TapActionConfig;
  double_tap_action?: TapActionConfig;
}

export interface TapActionConfig {
  action:
    | 'default'
    | 'more-info'
    | 'toggle'
    | 'navigate'
    | 'url'
    | 'perform-action'
    | 'assist'
    | 'nothing';
  entity?: string;
  navigation_path?: string;
  url_path?: string;
  service?: string;
  service_data?: Record<string, any>;
}

export class UltraLinkComponent {
  static render(
    hass: HomeAssistant,
    config: UltraLinkConfig,
    updateConfig: (updates: Partial<UltraLinkConfig>) => void,
    title: string = 'Link Configuration'
  ): TemplateResult {
    return html`
      <div class="ultra-link-component">
        <style>
          /* Hide redundant field labels from ha-form */
          .ultra-clean-form ha-form .mdc-form-field > label,
          .ultra-clean-form ha-form .mdc-text-field > label,
          .ultra-clean-form ha-form .mdc-floating-label,
          .ultra-clean-form ha-form .mdc-notched-outline__leading,
          .ultra-clean-form ha-form .mdc-notched-outline__notch,
          .ultra-clean-form ha-form .mdc-notched-outline__trailing,
          .ultra-clean-form ha-form .mdc-floating-label--float-above,
          .ultra-clean-form ha-form label[for],
          .ultra-clean-form ha-form .ha-form-label {
            display: none !important;
          }

          /* Style the form inputs without labels */
          .ultra-clean-form ha-form .mdc-text-field,
          .ultra-clean-form ha-form .mdc-select,
          .ultra-clean-form ha-form ha-entity-picker,
          .ultra-clean-form ha-form ha-icon-picker {
            margin-top: 0 !important;
          }

          /* Ensure input fields have proper spacing */
          .ultra-clean-form ha-form .mdc-text-field--outlined .mdc-notched-outline {
            border-radius: 8px;
          }

          /* Remove any default margins from form elements */
          .ultra-clean-form ha-form > * {
            margin: 0 !important;
          }

          /* Style field titles and descriptions */
          .field-title {
            font-size: 16px !important;
            font-weight: 600 !important;
            color: var(--primary-text-color) !important;
            margin-bottom: 4px !important;
            display: block !important;
          }

          .field-description {
            font-size: 13px !important;
            color: var(--secondary-text-color) !important;
            margin-bottom: 12px !important;
            display: block !important;
            opacity: 0.8 !important;
            line-height: 1.4 !important;
          }

          .section-title {
            font-size: 18px !important;
            font-weight: 700 !important;
            color: var(--primary-color) !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }
        </style>

        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
        >
          ${title}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; font-weight: 400; margin-bottom: 16px; color: var(--secondary-text-color);"
        >
          Configure what happens when users interact with this element. Choose different actions for
          tap, hold, and double-tap gestures.
        </div>

        <!-- Tap Behavior -->
        <div class="tap-behavior-group" style="margin-bottom: 24px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Tap Behavior
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
          >
            Action to perform when the element is tapped/clicked.
          </div>
          ${UltraLinkComponent.renderCleanForm(
            hass,
            { action: config.tap_action?.action || 'default' },
            [
              {
                name: 'action',
                selector: {
                  select: {
                    options: [
                      { value: 'default', label: 'Default' },
                      { value: 'more-info', label: 'More info' },
                      { value: 'toggle', label: 'Toggle' },
                      { value: 'navigate', label: 'Navigate' },
                      { value: 'url', label: 'URL' },
                      { value: 'perform-action', label: 'Perform action' },
                      { value: 'assist', label: 'Assist' },
                      { value: 'nothing', label: 'Nothing' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
            ],
            (e: CustomEvent) => {
              const newTapAction = { ...config.tap_action, action: e.detail.value.action };
              updateConfig({ tap_action: newTapAction });
            }
          )}
          ${UltraLinkComponent.renderActionFields(
            hass,
            config.tap_action || { action: 'default' },
            updates => {
              const newTapAction = { ...config.tap_action, ...updates };
              updateConfig({ tap_action: newTapAction });
            }
          )}
        </div>

        <!-- Hold Behavior -->
        <div class="hold-behavior-group" style="margin-bottom: 24px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Hold Behavior
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
          >
            Action to perform when the element is pressed and held.
          </div>
          ${UltraLinkComponent.renderCleanForm(
            hass,
            { action: config.hold_action?.action || 'default' },
            [
              {
                name: 'action',
                selector: {
                  select: {
                    options: [
                      { value: 'default', label: 'Default' },
                      { value: 'more-info', label: 'More info' },
                      { value: 'toggle', label: 'Toggle' },
                      { value: 'navigate', label: 'Navigate' },
                      { value: 'url', label: 'URL' },
                      { value: 'perform-action', label: 'Perform action' },
                      { value: 'assist', label: 'Assist' },
                      { value: 'nothing', label: 'Nothing' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
            ],
            (e: CustomEvent) => {
              const newHoldAction = { ...config.hold_action, action: e.detail.value.action };
              updateConfig({ hold_action: newHoldAction });
            }
          )}
          ${UltraLinkComponent.renderActionFields(
            hass,
            config.hold_action || { action: 'default' },
            updates => {
              const newHoldAction = { ...config.hold_action, ...updates };
              updateConfig({ hold_action: newHoldAction });
            }
          )}
        </div>

        <!-- Double Tap Behavior -->
        <div class="double-tap-behavior-group">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Double Tap Behavior
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
          >
            Action to perform when the element is double-tapped/clicked.
          </div>
          ${UltraLinkComponent.renderCleanForm(
            hass,
            { action: config.double_tap_action?.action || 'default' },
            [
              {
                name: 'action',
                selector: {
                  select: {
                    options: [
                      { value: 'default', label: 'Default' },
                      { value: 'more-info', label: 'More info' },
                      { value: 'toggle', label: 'Toggle' },
                      { value: 'navigate', label: 'Navigate' },
                      { value: 'url', label: 'URL' },
                      { value: 'perform-action', label: 'Perform action' },
                      { value: 'assist', label: 'Assist' },
                      { value: 'nothing', label: 'Nothing' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
            ],
            (e: CustomEvent) => {
              const newDoubleAction = {
                ...config.double_tap_action,
                action: e.detail.value.action,
              };
              updateConfig({ double_tap_action: newDoubleAction });
            }
          )}
          ${UltraLinkComponent.renderActionFields(
            hass,
            config.double_tap_action || { action: 'default' },
            updates => {
              const newDoubleAction = { ...config.double_tap_action, ...updates };
              updateConfig({ double_tap_action: newDoubleAction });
            }
          )}
        </div>
      </div>
    `;
  }

  /**
   * Renders a clean ha-form without redundant labels
   * @param hass Home Assistant instance
   * @param data Form data
   * @param schema Form schema
   * @param onChange Change handler
   * @returns Clean form template
   */
  private static renderCleanForm(
    hass: HomeAssistant,
    data: Record<string, any>,
    schema: any[],
    onChange: (e: CustomEvent) => void
  ): TemplateResult {
    return html`
      <div class="ultra-clean-form">
        <ha-form .hass=${hass} .data=${data} .schema=${schema} @value-changed=${onChange}></ha-form>
      </div>
    `;
  }

  private static renderActionFields(
    hass: HomeAssistant,
    action: TapActionConfig,
    updateAction: (updates: Partial<TapActionConfig>) => void
  ): TemplateResult {
    switch (action.action) {
      case 'more-info':
      case 'toggle':
        return html`
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              Entity
            </div>
            <div
              class="field-description"
              style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              Select the entity to
              ${action.action === 'more-info' ? 'show more info for' : 'toggle'}.
            </div>
            ${UltraLinkComponent.renderCleanForm(
              hass,
              { entity: action.entity || '' },
              [
                {
                  name: 'entity',
                  selector: { entity: {} },
                },
              ],
              (e: CustomEvent) => updateAction({ entity: e.detail.value.entity })
            )}
          </div>
        `;

      case 'navigate':
        return html`
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              Navigation Path
            </div>
            <div
              class="field-description"
              style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              Choose where to navigate or enter a custom path (e.g., /lovelace/dashboard).
            </div>
            ${UltraLinkComponent.renderNavigationPicker(hass, action.navigation_path || '', path =>
              updateAction({ navigation_path: path })
            )}
          </div>
        `;

      case 'url':
        return html`
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              URL Path
            </div>
            <div
              class="field-description"
              style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              Enter the URL to navigate to (e.g., https://www.example.com).
            </div>
            ${UltraLinkComponent.renderCleanForm(
              hass,
              { url_path: action.url_path || '' },
              [
                {
                  name: 'url_path',
                  selector: { text: {} },
                },
              ],
              (e: CustomEvent) => updateAction({ url_path: e.detail.value.url_path })
            )}
          </div>
        `;

      case 'perform-action':
        return html`
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              Service
            </div>
            <div
              class="field-description"
              style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              Enter the service to call (e.g., light.turn_on).
            </div>
            ${UltraLinkComponent.renderCleanForm(
              hass,
              { service: action.service || '' },
              [
                {
                  name: 'service',
                  selector: { text: {} },
                },
              ],
              (e: CustomEvent) => updateAction({ service: e.detail.value.service })
            )}

            <div style="margin-top: 12px;">
              <div
                class="field-title"
                style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
              >
                Service Data (optional)
              </div>
              <div
                class="field-description"
                style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
              >
                Enter service data as YAML (e.g., entity_id: light.living_room).
              </div>
              ${UltraLinkComponent.renderCleanForm(
                hass,
                {
                  service_data: action.service_data
                    ? JSON.stringify(action.service_data, null, 2)
                    : '',
                },
                [
                  {
                    name: 'service_data',
                    selector: {
                      text: {
                        multiline: true,
                        type: 'text',
                      },
                    },
                  },
                ],
                (e: CustomEvent) => {
                  try {
                    const data = e.detail.value.service_data
                      ? JSON.parse(e.detail.value.service_data)
                      : undefined;
                    updateAction({ service_data: data });
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }
              )}
            </div>
          </div>
        `;

      default:
        return html``;
    }
  }

  private static renderNavigationPicker(
    hass: HomeAssistant,
    currentPath: string,
    updatePath: (path: string) => void
  ): TemplateResult {
    // Get available navigation paths from Home Assistant
    const dashboards = Object.keys(hass.panels).filter(
      key => hass.panels[key].url_path || key === 'lovelace'
    );

    const commonPaths = [
      { value: '/lovelace', label: 'Overview (/lovelace)' },
      { value: '/config', label: 'Settings (/config)' },
      { value: '/config/dashboard', label: 'Dashboards (/config/dashboard)' },
      { value: '/config/entities', label: 'Entities (/config/entities)' },
      { value: '/config/devices', label: 'Devices (/config/devices)' },
      { value: '/config/automations', label: 'Automations (/config/automations)' },
      { value: '/config/scripts', label: 'Scripts (/config/scripts)' },
      { value: '/config/scenes', label: 'Scenes (/config/scenes)' },
      { value: '/developer-tools', label: 'Developer Tools (/developer-tools)' },
      ...dashboards.map(key => ({
        value: hass.panels[key].url_path || `/lovelace/${key}`,
        label: `${hass.panels[key].title || key} (${hass.panels[key].url_path || `/lovelace/${key}`})`,
      })),
    ];

    return UltraLinkComponent.renderCleanForm(
      hass,
      { navigation_path: currentPath },
      [
        {
          name: 'navigation_path',
          selector: {
            select: {
              options: [{ value: '', label: 'Custom path...' }, ...commonPaths],
              mode: 'dropdown',
              custom_value: true,
            },
          },
        },
      ],
      (e: CustomEvent) => updatePath(e.detail.value.navigation_path)
    );
  }

  static getDefaultConfig(): UltraLinkConfig {
    return {
      tap_action: { action: 'default' },
      hold_action: { action: 'default' },
      double_tap_action: { action: 'default' },
    };
  }

  static handleAction(action: TapActionConfig, hass: HomeAssistant, element?: HTMLElement): void {
    switch (action.action) {
      case 'more-info':
        if (action.entity) {
          const event = new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId: action.entity },
          });
          element?.dispatchEvent(event);
        }
        break;

      case 'toggle':
        if (action.entity) {
          hass.callService('homeassistant', 'toggle', { entity_id: action.entity });
        }
        break;

      case 'navigate':
        if (action.navigation_path) {
          window.history.pushState(null, '', action.navigation_path);
          const event = new CustomEvent('location-changed', {
            bubbles: true,
            composed: true,
            detail: { replace: false },
          });
          window.dispatchEvent(event);
        }
        break;

      case 'url':
        if (action.url_path) {
          window.open(action.url_path, '_blank');
        }
        break;

      case 'perform-action':
        if (action.service) {
          const [domain, service] = action.service.split('.');
          if (domain && service) {
            hass.callService(domain, service, action.service_data || {});
          }
        }
        break;

      case 'assist':
        const assistEvent = new CustomEvent('hass-assist', {
          bubbles: true,
          composed: true,
        });
        element?.dispatchEvent(assistEvent);
        break;

      case 'nothing':
      case 'default':
      default:
        // Do nothing
        break;
    }
  }
}
