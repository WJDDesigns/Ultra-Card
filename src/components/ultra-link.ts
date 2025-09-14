import { LitElement, html, css, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { localize } from '../localize/localize';

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
  // Modern perform-action property (preferred)
  perform_action?: string;
  // Legacy service property (for backward compatibility)
  service?: string;
  target?: Record<string, any>; // Home Assistant action target
  data?: Record<string, any>; // Modern data property for perform-action
  service_data?: Record<string, any>; // Legacy service data property
  [key: string]: any; // Allow additional HA action properties
}

export class UltraLinkComponent {
  static render(
    hass: HomeAssistant,
    config: UltraLinkConfig,
    updateConfig: (updates: Partial<UltraLinkConfig>) => void,
    title?: string
  ): TemplateResult {
    const lang = hass.locale?.language || 'en';
    const localizedTitle = title || localize('editor.actions.title', lang, 'Link Configuration');
    return html`
      <div class="ultra-link-config">
        <style>
          .ultra-link-config {
            padding: 16px;
          }

          .field-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .field-description {
            font-size: 13px;
            font-weight: 400;
            margin-bottom: 16px;
            color: var(--secondary-text-color);
            line-height: 1.4;
          }

          .behavior-group {
            margin-bottom: 24px;
          }

          /* Hide unwanted form elements */
          .ultra-link-config ha-form {
            display: block;
            margin: 0;
            padding: 0;
          }

          /* Hide redundant labels */
          .ultra-link-config ha-form .mdc-form-field > label,
          .ultra-link-config ha-form .mdc-text-field > label,
          .ultra-link-config ha-form .mdc-floating-label,
          .ultra-link-config ha-form .mdc-notched-outline__leading,
          .ultra-link-config ha-form .mdc-notched-outline__notch,
          .ultra-link-config ha-form .mdc-notched-outline__trailing,
          .ultra-link-config ha-form .mdc-floating-label--float-above,
          .ultra-link-config ha-form label[for],
          .ultra-link-config ha-form .ha-form-label,
          .ultra-link-config ha-form .form-label {
            display: none !important;
          }

          /* Hide labels containing underscores */
          .ultra-link-config ha-form label[data-label*='_'],
          .ultra-link-config ha-form .label-text:contains('_'),
          .ultra-link-config label:contains('_') {
            display: none !important;
          }

          /* Additional safeguards for underscore labels */
          .ultra-link-config ha-form .mdc-text-field-character-counter,
          .ultra-link-config ha-form .mdc-text-field-helper-text,
          .ultra-link-config ha-form mwc-formfield,
          .ultra-link-config ha-form .formfield {
            display: none !important;
          }
        </style>

        <div class="field-title" style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">
          ${localizedTitle}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; font-weight: 400; margin-bottom: 16px; color: var(--secondary-text-color);"
        >
          ${localize(
            'editor.actions.description',
            lang,
            'Configure what happens when users interact with this element. Choose different actions for tap, hold, and double-tap gestures.'
          )}
        </div>

        <!-- Tap Behavior -->
        <div class="tap-behavior-group" style="margin-bottom: 24px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.actions.tap_behavior', lang, 'Tap Behavior')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
          >
            ${localize(
              'editor.actions.tap_behavior_desc',
              lang,
              'Action to perform when the element is tapped/clicked.'
            )}
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
                      { value: 'nothing', label: 'Nothing' },
                      { value: 'more-info', label: 'More info' },
                      { value: 'toggle', label: 'Toggle' },
                      { value: 'navigate', label: 'Navigate' },
                      { value: 'url', label: 'URL' },
                      { value: 'perform-action', label: 'Perform action' },
                      { value: 'assist', label: 'Assist' },
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
            config.tap_action || { action: 'nothing' },
            updates => {
              const newTapAction = { ...config.tap_action, ...updates };
              updateConfig({ tap_action: newTapAction });
            }
          )}
        </div>

        <!-- Hold Behavior -->
        <div class="hold-behavior-group" style="margin-bottom: 24px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.actions.hold_behavior', lang, 'Hold Behavior')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
          >
            ${localize(
              'editor.actions.hold_behavior_desc',
              lang,
              'Action to perform when the element is pressed and held.'
            )}
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
                      { value: 'nothing', label: 'Nothing' },
                      { value: 'more-info', label: 'More info' },
                      { value: 'toggle', label: 'Toggle' },
                      { value: 'navigate', label: 'Navigate' },
                      { value: 'url', label: 'URL' },
                      { value: 'perform-action', label: 'Perform action' },
                      { value: 'assist', label: 'Assist' },
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
            config.hold_action || { action: 'nothing' },
            updates => {
              const newHoldAction = { ...config.hold_action, ...updates };
              updateConfig({ hold_action: newHoldAction });
            }
          )}
        </div>

        <!-- Double Tap Behavior -->
        <div class="double-tap-behavior-group">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.actions.double_tap_behavior', lang, 'Double Tap Behavior')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
          >
            ${localize(
              'editor.actions.double_tap_behavior_desc',
              lang,
              'Action to perform when the element is double-tapped/clicked.'
            )}
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
                      { value: 'nothing', label: 'Nothing' },
                      { value: 'more-info', label: 'More info' },
                      { value: 'toggle', label: 'Toggle' },
                      { value: 'navigate', label: 'Navigate' },
                      { value: 'url', label: 'URL' },
                      { value: 'perform-action', label: 'Perform action' },
                      { value: 'assist', label: 'Assist' },
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
            config.double_tap_action || { action: 'nothing' },
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
      case 'default':
        // No-op; default platform behavior or nothing
        break;
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
                  label: 'Entity',
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
              Choose the service to call or enter a custom service.
            </div>
            ${UltraLinkComponent.renderCleanForm(
              hass,
              { service: action.service || '' },
              [
                {
                  name: 'service',
                  selector: {
                    select: {
                      options: [
                        // Home Assistant Core Services
                        { value: 'homeassistant.restart', label: 'Restart Home Assistant' },
                        { value: 'homeassistant.stop', label: 'Stop Home Assistant' },
                        { value: 'homeassistant.reload_core_config', label: 'Reload Core Config' },
                        {
                          value: 'homeassistant.reload_config_entry',
                          label: 'Reload Config Entry',
                        },
                        { value: 'homeassistant.update_entity', label: 'Update Entity' },

                        // System Services
                        { value: 'system_log.clear', label: 'Clear System Log' },
                        { value: 'recorder.purge', label: 'Purge Recorder' },
                        { value: 'hassio.host_reboot', label: 'Reboot Host System' },
                        { value: 'hassio.host_shutdown', label: 'Shutdown Host System' },

                        // Light Services
                        { value: 'light.turn_on', label: 'Turn On Light' },
                        { value: 'light.turn_off', label: 'Turn Off Light' },
                        { value: 'light.toggle', label: 'Toggle Light' },

                        // Switch Services
                        { value: 'switch.turn_on', label: 'Turn On Switch' },
                        { value: 'switch.turn_off', label: 'Turn Off Switch' },
                        { value: 'switch.toggle', label: 'Toggle Switch' },

                        // Climate Services
                        { value: 'climate.set_temperature', label: 'Set Temperature' },
                        { value: 'climate.turn_on', label: 'Turn On Climate' },
                        { value: 'climate.turn_off', label: 'Turn Off Climate' },

                        // Media Player Services
                        { value: 'media_player.play_media', label: 'Play Media' },
                        { value: 'media_player.media_play', label: 'Media Play' },
                        { value: 'media_player.media_pause', label: 'Media Pause' },
                        { value: 'media_player.media_stop', label: 'Media Stop' },
                        { value: 'media_player.volume_set', label: 'Set Volume' },

                        // Automation Services
                        { value: 'automation.trigger', label: 'Trigger Automation' },
                        { value: 'automation.turn_on', label: 'Enable Automation' },
                        { value: 'automation.turn_off', label: 'Disable Automation' },

                        // Script Services
                        { value: 'script.turn_on', label: 'Run Script' },

                        // Scene Services
                        { value: 'scene.turn_on', label: 'Activate Scene' },

                        // Cover Services
                        { value: 'cover.open_cover', label: 'Open Cover' },
                        { value: 'cover.close_cover', label: 'Close Cover' },
                        { value: 'cover.toggle', label: 'Toggle Cover' },

                        // Lock Services
                        { value: 'lock.lock', label: 'Lock' },
                        { value: 'lock.unlock', label: 'Unlock' },

                        // Notify Services
                        { value: 'notify.persistent_notification', label: 'Send Notification' },

                        // Input Services
                        { value: 'input_boolean.toggle', label: 'Toggle Input Boolean' },
                        { value: 'input_select.select_option', label: 'Select Input Option' },

                        // Custom option
                        { value: 'custom', label: 'Custom Service...' },
                      ],
                      mode: 'dropdown',
                      custom_value: true,
                    },
                  },
                },
              ],
              (e: CustomEvent) => {
                const serviceValue = e.detail.value?.service || e.detail.value;
                updateAction({ service: serviceValue });
              }
            )}

            <div style="margin-top: 12px;">
              <div
                class="field-title"
                style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
              >
                Target Entity (optional)
              </div>
              <div
                class="field-description"
                style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
              >
                Choose an entity to target with this service call.
              </div>
              ${UltraLinkComponent.renderCleanForm(
                hass,
                { entity: action.entity || '' },
                [
                  {
                    name: 'entity',
                    selector: { entity: {} },
                    label: 'Entity',
                  },
                ],
                (e: CustomEvent) => {
                  const entityValue = e.detail.value?.entity || e.detail.value;
                  updateAction({ entity: entityValue });
                }
              )}
            </div>

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
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
    };
  }

  static handleAction(action: TapActionConfig, hass: HomeAssistant, element?: HTMLElement): void {
    // Home Assistant stores perform-action services under 'perform_action' key
    const serviceToCall = action.service || action.perform_action;

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
          // Legacy entity-based toggle
          hass.callService('homeassistant', 'toggle', { entity_id: action.entity });
        } else if (action.target) {
          // Modern target-based toggle (supports device_id, area_id, etc.)
          const serviceData: any = {};

          // Handle different target types
          if (action.target.entity_id) {
            serviceData.entity_id = action.target.entity_id;
          }
          if (action.target.device_id) {
            serviceData.device_id = action.target.device_id;
          }
          if (action.target.area_id) {
            serviceData.area_id = action.target.area_id;
          }
          if (action.target.floor_id) {
            serviceData.floor_id = action.target.floor_id;
          }
          if (action.target.label_id) {
            serviceData.label_id = action.target.label_id;
          }

          hass.callService('homeassistant', 'toggle', serviceData);
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
        if (serviceToCall) {
          const [domain, service] = serviceToCall.split('.');
          if (domain && service) {
            // Enhanced service data handling for better target support
            // Support both modern 'data' and legacy 'service_data' properties
            let serviceData = { ...(action.data || action.service_data) };

            // If entity is specified but not in service_data, add it
            if (action.entity && !serviceData.entity_id) {
              serviceData.entity_id = action.entity;
            }

            // Handle all target types from HA action system
            if (action.target) {
              if (action.target.entity_id && !serviceData.entity_id) {
                serviceData.entity_id = action.target.entity_id;
              }
              if (action.target.device_id && !serviceData.device_id) {
                serviceData.device_id = action.target.device_id;
              }
              if (action.target.area_id && !serviceData.area_id) {
                serviceData.area_id = action.target.area_id;
              }
              if (action.target.floor_id && !serviceData.floor_id) {
                serviceData.floor_id = action.target.floor_id;
              }
              if (action.target.label_id && !serviceData.label_id) {
                serviceData.label_id = action.target.label_id;
              }
            }

            try {
              hass.callService(domain, service, serviceData);
            } catch (error) {
              console.error(`❌ Ultra Card: Failed to execute service ${serviceToCall}:`, error);
            }
          } else {
            console.warn(
              `⚠️ Ultra Card: Invalid service format "${serviceToCall}". Expected format: domain.service`
            );
          }
        } else {
          console.warn(`⚠️ Ultra Card: No service specified for perform-action`, {
            action: action,
            serviceProperty: action.service,
            performActionProperty: action.perform_action,
          });
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
      default:
        // Do nothing
        break;
    }
  }
}
