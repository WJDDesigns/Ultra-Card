import { TemplateResult, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, StateSwitcherModule } from '../types';
import { getModuleRegistry } from './module-registry';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { isChildModuleVisible, renderChildModulePreview } from './layout-container-utils';

export class UltraStateSwitcherModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'state_switcher',
    title: 'State Switcher',
    description: 'Shows exactly one child at a time — the first whose logic conditions match',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:swap-horizontal-bold',
    category: 'layout',
    tags: ['layout', 'switcher', 'conditional', 'state', 'container', 'transition'],
  };

  createDefault(id?: string, hass?: HomeAssistant): StateSwitcherModule {
    return {
      id: id || this.generateId('state_switcher'),
      type: 'state_switcher',
      modules: [],
      transition: 'fade',
      transition_duration: 300,
      fallback_mode: 'none',
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const switcherModule = module as StateSwitcherModule;
    const lang = hass?.locale?.language || 'en';
    const children = switcherModule.modules || [];
    const registry = getModuleRegistry();

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- How it works -->
        ${this.renderSettingsSection(
          localize('editor.state_switcher.how.title', lang, 'How It Works'),
          localize(
            'editor.state_switcher.how.desc',
            lang,
            'Add modules to this container, then give each one display conditions in its Logic tab. The switcher shows only the FIRST child whose conditions match — top to bottom. A child without conditions always matches, so put a default last.'
          ),
          []
        )}

        <!-- Children overview -->
        ${children.length > 0
          ? html`
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  ${localize('editor.state_switcher.order.title', lang, 'Match Order')}
                </div>
                ${children.map((child, index) => {
                  const meta = registry.getModuleMetadata(child.type);
                  const name = (child as any).name || meta?.title || child.type;
                  const conditionCount = (child.display_conditions || []).length;
                  const hasConditions =
                    conditionCount > 0 &&
                    child.display_mode !== undefined &&
                    child.display_mode !== 'always';
                  return html`
                    <div
                      style="display: flex; align-items: center; gap: 10px; padding: 8px 4px; border-bottom: 1px solid var(--divider-color); font-size: 13px;"
                    >
                      <span
                        style="min-width: 20px; height: 20px; border-radius: 50%; background: var(--primary-color); color: var(--text-primary-color, #fff); display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;"
                        >${index + 1}</span
                      >
                      <ha-icon
                        icon="${meta?.icon || 'mdi:puzzle'}"
                        style="--mdc-icon-size: 18px; color: var(--secondary-text-color);"
                      ></ha-icon>
                      <span style="flex: 1; color: var(--primary-text-color);">${name}</span>
                      <span
                        style="font-size: 12px; color: ${hasConditions
                          ? 'var(--success-color, #4caf50)'
                          : 'var(--warning-color, #ff9800)'};"
                      >
                        ${hasConditions
                          ? localize(
                              'editor.state_switcher.order.has_conditions',
                              lang,
                              'Has conditions'
                            )
                          : localize(
                              'editor.state_switcher.order.always',
                              lang,
                              'Always matches'
                            )}
                      </span>
                    </div>
                  `;
                })}
              </div>
            `
          : ''}

        <!-- Fallback -->
        ${this.renderSettingsSection(
          localize('editor.state_switcher.fallback.title', lang, 'Fallback'),
          localize(
            'editor.state_switcher.fallback.desc',
            lang,
            'What to show when no child conditions match.'
          ),
          [
            {
              title: localize('editor.state_switcher.fallback.mode', lang, 'Fallback Mode'),
              description: '',
              hass,
              data: { fallback_mode: switcherModule.fallback_mode || 'none' },
              schema: [
                this.selectField('fallback_mode', [
                  {
                    value: 'none',
                    label: localize(
                      'editor.state_switcher.fallback.none',
                      lang,
                      'Show nothing'
                    ),
                  },
                  {
                    value: 'first',
                    label: localize(
                      'editor.state_switcher.fallback.first',
                      lang,
                      'Show first child'
                    ),
                  },
                  {
                    value: 'last',
                    label: localize(
                      'editor.state_switcher.fallback.last',
                      lang,
                      'Show last child'
                    ),
                  },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ fallback_mode: e.detail.value.fallback_mode });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}

        <!-- Transition -->
        ${this.renderSettingsSection(
          localize('editor.state_switcher.transition.title', lang, 'Transition'),
          localize(
            'editor.state_switcher.transition.desc',
            lang,
            'Animation when the visible child changes.'
          ),
          [
            {
              title: localize('editor.state_switcher.transition.type', lang, 'Transition'),
              description: '',
              hass,
              data: { transition: switcherModule.transition || 'fade' },
              schema: [
                this.selectField('transition', [
                  { value: 'none', label: localize('editor.common.none', lang, 'None') },
                  {
                    value: 'fade',
                    label: localize('editor.state_switcher.transition.fade', lang, 'Fade'),
                  },
                  {
                    value: 'slide_left',
                    label: localize(
                      'editor.state_switcher.transition.slide_left',
                      lang,
                      'Slide Left'
                    ),
                  },
                  {
                    value: 'slide_right',
                    label: localize(
                      'editor.state_switcher.transition.slide_right',
                      lang,
                      'Slide Right'
                    ),
                  },
                  {
                    value: 'slide_up',
                    label: localize(
                      'editor.state_switcher.transition.slide_up',
                      lang,
                      'Slide Up'
                    ),
                  },
                  {
                    value: 'slide_down',
                    label: localize(
                      'editor.state_switcher.transition.slide_down',
                      lang,
                      'Slide Down'
                    ),
                  },
                  {
                    value: 'scale',
                    label: localize('editor.state_switcher.transition.scale', lang, 'Scale'),
                  },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ transition: e.detail.value.transition });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        <div style="margin-top: -16px; margin-bottom: 32px;">
          ${this.renderSliderField(
            localize('editor.state_switcher.transition.duration', lang, 'Transition Duration'),
            '',
            switcherModule.transition_duration ?? 300,
            300,
            0,
            1500,
            50,
            next => updateModule({ transition_duration: next }),
            'ms'
          )}
        </div>
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const switcherModule = module as StateSwitcherModule;
    const lang = hass?.locale?.language || 'en';
    const children = switcherModule.modules || [];
    const isEditorPreview = previewContext === 'live' || previewContext === 'ha-preview';

    // First child whose logic conditions match wins
    let active: CardModule | undefined = children.find(cm => isChildModuleVisible(cm, hass));
    if (!active && children.length > 0) {
      const fallback = switcherModule.fallback_mode || 'none';
      if (fallback === 'first') active = children[0];
      else if (fallback === 'last') active = children[children.length - 1];
    }

    if (children.length === 0) {
      if (!isEditorPreview) return html``;
      return html`
        <div class="state-switcher-empty">
          <span>${localize('editor.state_switcher.empty.no_modules', lang, 'No modules added yet')}</span>
          <small
            >${localize(
              'editor.state_switcher.empty.add_modules',
              lang,
              'Add modules in the layout builder, then set each one’s display conditions in its Logic tab'
            )}</small
          >
        </div>
      `;
    }

    if (!active) {
      if (!isEditorPreview) return html``;
      return html`
        <div class="state-switcher-empty">
          <span
            >${localize(
              'editor.state_switcher.empty.no_match',
              lang,
              'No child conditions match right now'
            )}</span
          >
          <small
            >${localize(
              'editor.state_switcher.empty.no_match_hint',
              lang,
              'Set Fallback Mode to show a default, or add a child without conditions as the last item'
            )}</small
          >
        </div>
      `;
    }

    const transition = switcherModule.transition || 'fade';
    const duration = switcherModule.transition_duration ?? 300;
    const designStyles = this.buildDesignStyles(module, hass);
    const hoverClass = this.getHoverEffectClass(module);

    // repeat() keyed by child id recreates the DOM node when the active child
    // changes, which restarts the entry animation.
    return this.wrapWithAnimation(
      html`
        <div
          class="state-switcher-container ${hoverClass}"
          style="${this.buildStyleString(designStyles)}; --switch-duration: ${duration}ms;"
        >
          ${repeat(
            [active],
            cm => cm.id || cm.type,
            childModule => html`
              <div class="state-switcher-active ${transition !== 'none' ? `uc-switch-${transition}` : ''}">
                ${renderChildModulePreview(childModule, hass, config, previewContext)}
              </div>
            `
          )}
        </div>
      `,
      module,
      hass
    );
  }

  // Explicit Logic tab renderer (some editors call this directly)
  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  getStyles(): string {
    return `
      .state-switcher-container {
        width: 100%;
        box-sizing: border-box;
      }

      .state-switcher-active {
        min-width: 0;
      }

      @keyframes uc-switch-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes uc-switch-slide-left-in {
        from { opacity: 0; transform: translateX(24px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes uc-switch-slide-right-in {
        from { opacity: 0; transform: translateX(-24px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes uc-switch-slide-up-in {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes uc-switch-slide-down-in {
        from { opacity: 0; transform: translateY(-24px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes uc-switch-scale-in {
        from { opacity: 0; transform: scale(0.92); }
        to { opacity: 1; transform: scale(1); }
      }

      .uc-switch-fade {
        animation: uc-switch-fade-in var(--switch-duration, 300ms) ease both;
      }

      .uc-switch-slide_left {
        animation: uc-switch-slide-left-in var(--switch-duration, 300ms) ease both;
      }

      .uc-switch-slide_right {
        animation: uc-switch-slide-right-in var(--switch-duration, 300ms) ease both;
      }

      .uc-switch-slide_up {
        animation: uc-switch-slide-up-in var(--switch-duration, 300ms) ease both;
      }

      .uc-switch-slide_down {
        animation: uc-switch-slide-down-in var(--switch-duration, 300ms) ease both;
      }

      .uc-switch-scale {
        animation: uc-switch-scale-in var(--switch-duration, 300ms) ease both;
      }

      .state-switcher-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
      }

      .state-switcher-empty span {
        font-size: 14px;
        font-weight: 500;
      }

      .state-switcher-empty small {
        font-size: 12px;
        opacity: 0.8;
      }

      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
