/**
 * Editor UI for tap/hold/double-tap actions (the Actions tab of every module).
 *
 * Split out of ultra-link.ts so dashboards do not download it: the runtime
 * action runner stays in the main bundle, this file loads with the editor
 * chunk and registers itself on UltraLinkComponent.
 */
import { html, TemplateResult } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { localize } from '../localize/localize';
import { registerUltraLinkEditor, UltraLinkConfig, TapActionConfig } from './ultra-link';

export class UltraLinkEditor {
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
          ${UltraLinkEditor.renderCleanForm(
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
          ${UltraLinkEditor.renderActionFields(
            hass,
            config.tap_action || { action: 'nothing' },
            updates => {
              const merged = { ...config.tap_action, ...updates };
              const newTapAction: TapActionConfig = {
                ...merged,
                action: merged.action ?? 'nothing',
              };
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
          ${UltraLinkEditor.renderCleanForm(
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
          ${UltraLinkEditor.renderActionFields(
            hass,
            config.hold_action || { action: 'nothing' },
            updates => {
              const merged = { ...config.hold_action, ...updates };
              const newHoldAction: TapActionConfig = {
                ...merged,
                action: merged.action ?? 'nothing',
              };
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
          ${UltraLinkEditor.renderCleanForm(
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
          ${UltraLinkEditor.renderActionFields(
            hass,
            config.double_tap_action || { action: 'nothing' },
            updates => {
              const merged = { ...config.double_tap_action, ...updates };
              const newDoubleAction: TapActionConfig = {
                ...merged,
                action: merged.action ?? 'nothing',
              };
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
  static renderCleanForm(
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

  /**
   * Where a `url` action opens. Left off the config entirely when set back to a
   * new tab, so the saved YAML only grows for people who want the other choice.
   */
  static renderUrlTargetField(
    hass: HomeAssistant,
    action: TapActionConfig,
    updateAction: (updates: Partial<TapActionConfig>) => void
  ): TemplateResult {
    return html`
      <div style="margin-top: 12px;">
        <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
          Open In Same Tab
        </div>
        <div
          class="field-description"
          style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
        >
          Replace the current page instead of opening a new browser tab.
        </div>
        ${UltraLinkEditor.renderCleanForm(
          hass,
          { url_target: action.url_target === '_self' },
          [
            {
              name: 'url_target',
              selector: { boolean: {} },
            },
          ],
          (e: CustomEvent) =>
            updateAction({ url_target: e.detail.value.url_target ? '_self' : undefined })
        )}
      </div>
    `;
  }

  /**
   * Inline "Supports templates" hint with a help-circle button that opens the
   * Template Cheatsheet pre-filtered to the action examples.
   */
  static renderTemplatesHint(): TemplateResult {
    return html`
      <div
        class="ultra-link-template-hint"
        style="display:flex;align-items:center;gap:8px;margin-top:6px;padding:6px 10px;background:rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);border:1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.25);border-radius:6px;font-size:12px;color:var(--primary-text-color);"
      >
        <ha-icon
          icon="mdi:code-tags"
          style="--mdc-icon-size:16px;color:var(--primary-color);"
        ></ha-icon>
        <span style="flex:1;line-height:1.4;">
          Supports Jinja templates &mdash;
          <code style="background:rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.08);padding:1px 4px;border-radius:3px;font-size:11px;">{{ states('sensor.foo') }}</code>
          renders at tap time.
        </span>
        <button
          type="button"
          class="ultra-link-template-help-btn"
          style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:var(--primary-color);color:var(--text-primary-color, white);border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:500;"
          title="View template examples for actions"
          @click=${(e: Event) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).dispatchEvent(
              new CustomEvent('uc-open-template-cheatsheet', {
                detail: { module: 'actions' },
                bubbles: true,
                composed: true,
              })
            );
          }}
        >
          <ha-icon
            icon="mdi:help-circle"
            style="--mdc-icon-size:14px;width:14px;height:14px;"
          ></ha-icon>
          Examples
        </button>
      </div>
    `;
  }

  static renderActionFields(
    hass: HomeAssistant,
    action: TapActionConfig,
    updateAction: (updates: Partial<TapActionConfig>) => void
  ): TemplateResult {
    switch (action.action) {
      case 'default':
        // No-op; default platform behavior or nothing
        return html``;
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
            ${UltraLinkEditor.renderCleanForm(
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
            ${UltraLinkEditor.renderNavigationPicker(hass, action.navigation_path || '', path =>
              updateAction({ navigation_path: path })
            )}
            ${UltraLinkEditor.renderTemplatesHint()}
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
            ${UltraLinkEditor.renderCleanForm(
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
            ${UltraLinkEditor.renderUrlTargetField(hass, action, updateAction)}
            ${UltraLinkEditor.renderTemplatesHint()}
          </div>
        `;

      case 'call-service':
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
            ${UltraLinkEditor.renderCleanForm(
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
              ${UltraLinkEditor.renderCleanForm(
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
              ${UltraLinkEditor.renderCleanForm(
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

  static renderNavigationPicker(
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

    return UltraLinkEditor.renderCleanForm(
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
}

registerUltraLinkEditor(UltraLinkEditor);
