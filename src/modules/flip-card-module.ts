import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, FlipCardModule } from '../types';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { renderChildModulePreview } from './layout-container-utils';

export class UltraFlipCardModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'flip_card',
    title: 'Flip Card',
    description: 'Two-sided container that flips between a front and back face',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:rotate-3d-variant',
    category: 'layout',
    tags: ['layout', 'flip', 'card', 'container', '3d', 'front', 'back', 'reveal'],
  };

  /** Manually flipped state per module instance (tap trigger). */
  private _flipStates = new Map<string, boolean>();

  createDefault(id?: string, hass?: HomeAssistant): FlipCardModule {
    return {
      id: id || this.generateId('flip_card'),
      type: 'flip_card',
      modules: [],
      flip_trigger: 'tap',
      flip_direction: 'horizontal',
      flip_duration: 600,
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
    const flipModule = module as FlipCardModule;
    const lang = hass?.locale?.language || 'en';
    const trigger = flipModule.flip_trigger || 'tap';

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- How it works -->
        ${this.renderSettingsSection(
          localize('editor.flip_card.faces.title', lang, 'Card Faces'),
          localize(
            'editor.flip_card.faces.desc',
            lang,
            'The first module added to this container is the front face; the second is the back face. Use a Vertical Layout as a face to show multiple modules on one side.'
          ),
          []
        )}

        <!-- Flip Behavior -->
        ${this.renderSettingsSection(
          localize('editor.flip_card.behavior.title', lang, 'Flip Behavior'),
          localize(
            'editor.flip_card.behavior.desc',
            lang,
            'Choose what causes the card to flip to its back face.'
          ),
          []
        )}
        <div style="margin-top: -24px; margin-bottom: 32px;">
          ${this.renderSegmentedField(
            localize('editor.flip_card.behavior.trigger', lang, 'Flip Trigger'),
            '',
            trigger,
            [
              {
                value: 'tap',
                label: localize('editor.flip_card.behavior.tap', lang, 'Tap'),
                icon: 'mdi:gesture-tap',
              },
              {
                value: 'hover',
                label: localize('editor.flip_card.behavior.hover', lang, 'Hover'),
                icon: 'mdi:cursor-default-click-outline',
              },
              {
                value: 'entity',
                label: localize('editor.flip_card.behavior.entity', lang, 'Entity'),
                icon: 'mdi:link-variant',
              },
            ],
            next => updateModule({ flip_trigger: next as 'tap' | 'hover' | 'entity' })
          )}
          ${trigger === 'entity'
            ? html`
                ${this.renderFieldSection(
                  localize('editor.flip_card.behavior.entity_field', lang, 'Entity'),
                  localize(
                    'editor.flip_card.behavior.entity_field_desc',
                    lang,
                    'The card shows the back face while this entity matches the value below.'
                  ),
                  hass,
                  { flip_entity: flipModule.flip_entity || '' },
                  [this.entityField('flip_entity')],
                  (e: CustomEvent) => {
                    updateModule({ flip_entity: e.detail.value.flip_entity });
                    this.triggerPreviewUpdate();
                  }
                )}
                ${this.renderFieldSection(
                  localize('editor.flip_card.behavior.attribute', lang, 'Attribute (optional)'),
                  localize(
                    'editor.flip_card.behavior.attribute_desc',
                    lang,
                    'Leave empty to match against the entity state.'
                  ),
                  hass,
                  { flip_attribute: flipModule.flip_attribute || '' },
                  [this.textField('flip_attribute')],
                  (e: CustomEvent) => {
                    updateModule({ flip_attribute: e.detail.value.flip_attribute });
                    this.triggerPreviewUpdate();
                  }
                )}
                ${this.renderFieldSection(
                  localize('editor.flip_card.behavior.value', lang, 'Show Back When Value Is'),
                  '',
                  hass,
                  { flip_value: flipModule.flip_value || '' },
                  [this.textField('flip_value')],
                  (e: CustomEvent) => {
                    updateModule({ flip_value: e.detail.value.flip_value });
                    this.triggerPreviewUpdate();
                  }
                )}
              `
            : ''}
        </div>

        <!-- Animation -->
        ${this.renderSettingsSection(
          localize('editor.flip_card.animation.title', lang, 'Animation'),
          localize('editor.flip_card.animation.desc', lang, 'Style and speed of the flip.'),
          []
        )}
        <div style="margin-top: -24px; margin-bottom: 32px;">
          ${this.renderSegmentedField(
            localize('editor.flip_card.animation.direction', lang, 'Flip Direction'),
            '',
            flipModule.flip_direction || 'horizontal',
            [
              {
                value: 'horizontal',
                label: localize('editor.flip_card.animation.horizontal', lang, 'Horizontal'),
                icon: 'mdi:axis-z-rotate-clockwise',
              },
              {
                value: 'vertical',
                label: localize('editor.flip_card.animation.vertical', lang, 'Vertical'),
                icon: 'mdi:axis-x-rotate-clockwise',
              },
            ],
            next => updateModule({ flip_direction: next as 'horizontal' | 'vertical' })
          )}
          ${this.renderSliderField(
            localize('editor.flip_card.animation.duration', lang, 'Flip Duration'),
            '',
            flipModule.flip_duration ?? 600,
            600,
            100,
            2000,
            50,
            next => updateModule({ flip_duration: next }),
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
    const flipModule = module as FlipCardModule;
    const lang = hass?.locale?.language || 'en';
    const children = flipModule.modules || [];
    const front = children[0];
    const back = children[1];
    const trigger = flipModule.flip_trigger || 'tap';
    const direction = flipModule.flip_direction || 'horizontal';
    const duration = flipModule.flip_duration ?? 600;

    let flipped = false;
    if (trigger === 'entity') {
      const entityId = flipModule.flip_entity;
      if (entityId && flipModule.flip_value !== undefined && hass?.states[entityId]) {
        const entity = hass.states[entityId];
        const current = flipModule.flip_attribute
          ? entity.attributes[flipModule.flip_attribute]
          : entity.state;
        flipped = this._stateOrAttributeEquals(current, String(flipModule.flip_value));
      }
    } else if (trigger === 'tap') {
      flipped = this._flipStates.get(flipModule.id) || false;
    }

    const designStyles = this.buildDesignStyles(module, hass);
    const hoverClass = this.getHoverEffectClass(module);
    const rotate = direction === 'horizontal' ? 'rotateY' : 'rotateX';

    const handleTap =
      trigger === 'tap'
        ? (e: Event) => {
            // Don't flip when interacting with controls inside a face
            const target = e.target as HTMLElement;
            if (
              target?.closest?.(
                'button, input, select, textarea, a[href], ha-switch, ha-slider, [role="button"], [role="slider"], [role="switch"]'
              )
            ) {
              return;
            }
            this._flipStates.set(flipModule.id, !this._flipStates.get(flipModule.id));
            this.triggerPreviewUpdate(true);
          }
        : null;

    const renderFace = (
      child: CardModule | undefined,
      face: 'front' | 'back'
    ): TemplateResult => {
      if (child) {
        return renderChildModulePreview(child, hass, config, previewContext);
      }
      return html`
        <div class="flip-card-empty-face">
          <ha-icon icon="mdi:card-plus-outline"></ha-icon>
          <span>
            ${face === 'front'
              ? localize(
                  'editor.flip_card.empty.front',
                  lang,
                  'Add a module for the front face'
                )
              : localize('editor.flip_card.empty.back', lang, 'Add a second module for the back face')}
          </span>
        </div>
      `;
    };

    return this.wrapWithAnimation(
      html`
        <div
          class="flip-card-container ${hoverClass} ${trigger === 'hover' ? 'flip-on-hover' : ''} ${flipped
            ? 'is-flipped'
            : ''} flip-${direction}"
          style="${this.buildStyleString(designStyles)}; --flip-duration: ${duration}ms; ${trigger ===
          'tap'
            ? 'cursor: pointer;'
            : ''}"
          @click=${handleTap}
        >
          <div class="flip-card-inner" style="--flip-rotate: ${rotate}(180deg);">
            <div class="flip-card-face flip-card-front">${renderFace(front, 'front')}</div>
            <div class="flip-card-face flip-card-back" style="transform: ${rotate}(180deg);">
              ${renderFace(back, 'back')}
            </div>
          </div>
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
      .flip-card-container {
        perspective: 1000px;
        width: 100%;
        box-sizing: border-box;
      }

      .flip-card-inner {
        display: grid;
        width: 100%;
        transform-style: preserve-3d;
        transition: transform var(--flip-duration, 600ms) cubic-bezier(0.4, 0.2, 0.2, 1);
      }

      .flip-card-container.is-flipped .flip-card-inner,
      .flip-card-container.flip-on-hover:hover .flip-card-inner {
        transform: var(--flip-rotate, rotateY(180deg));
      }

      /* Both faces occupy the same grid cell so the container sizes to the tallest face */
      .flip-card-face {
        grid-area: 1 / 1;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        min-width: 0;
        box-sizing: border-box;
      }

      .flip-card-empty-face {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 80px;
        padding: 16px;
        border: 1px dashed var(--divider-color);
        border-radius: 8px;
        color: var(--secondary-text-color);
        font-size: 13px;
        font-style: italic;
        text-align: center;
      }

      .flip-card-empty-face ha-icon {
        --mdc-icon-size: 22px;
        opacity: 0.7;
      }

      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
