import { html, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig } from '../types';
import { getModuleRegistry } from '../modules';
import { logicService } from './logic-service';
import { UcHoverEffectsService } from './uc-hover-effects-service';
import { localize } from '../localize/localize';

/**
 * Centralized Module Preview Service
 *
 * This service provides a single source of truth for rendering module previews
 * that mirrors exactly what the Home Assistant preview window does.
 *
 * Purpose:
 * - Eliminate fragmented preview implementations across modules
 * - Ensure popup Live Preview matches HA preview window exactly
 * - Simplify module development by centralizing container/animation/styling logic
 *
 * Modules should only implement their core content in renderPreview().
 * This service handles:
 * - Card container wrapping
 * - Design properties (padding, margin, borders, background)
 * - Animation wrappers (intro/outro/state-based)
 * - Hover effects
 * - Logic visibility evaluation
 */
class UcModulePreviewService {
  /**
   * Render a module in isolation with full card container wrapping
   * Used by: Layout tab popup Live Preview
   *
   * This renders a single module as if it's the only thing in a card,
   * matching what the HA preview window shows.
   */
  renderModuleInCard(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    options?: {
      showLogicOverlay?: boolean; // Show "Hidden by Logic" overlay if logic conditions not met
    }
  ): TemplateResult {
    const showLogicOverlay = options?.showLogicOverlay ?? true;

    // Initialize logic service
    logicService.setHass(hass);

    // Check module visibility
    const shouldShow = logicService.evaluateModuleVisibility(module);
    const moduleWithDesign = module as any;
    const globalLogicVisible = logicService.evaluateLogicProperties({
      logic_entity: moduleWithDesign.design?.logic_entity,
      logic_attribute: moduleWithDesign.design?.logic_attribute,
      logic_operator: moduleWithDesign.design?.logic_operator,
      logic_value: moduleWithDesign.design?.logic_value,
    });

    const isLogicHidden = !shouldShow || !globalLogicVisible;

    // Get module content from module handler
    // Pass isEditorPreview=true to prevent lock overlays in Live Preview
    const moduleContent = this._getModuleContent(module, hass, config, true);

    // Get animation data for preview
    const animationData = this._getPreviewAnimationData(moduleWithDesign);

    // Get card container styling
    const cardStyle = this._getCardContainerStyle(config);

    // Wrap with card container and logic status indicator
    return html`
      <div class="module-with-logic ${isLogicHidden ? 'logic-hidden' : ''}">
        <div class="card-container" style="${cardStyle}">
          <div
            class="card-row"
            style="display: grid; grid-template-columns: 1fr; gap: 16px; background: transparent; background-image: none; border: none; border-radius: 0; position: inherit; top: auto; bottom: auto; left: auto; right: auto; z-index: auto; width: 100%; height: auto; max-width: none; max-height: none; min-width: none; min-height: auto; overflow: visible; clip-path: none; backdrop-filter: none; box-shadow: none; box-sizing: border-box"
          >
            <div
              class="card-column"
              style="display: flex; flex-direction: column; background: transparent; background-image: none; border: none; border-radius: 0; position: inherit; top: auto; bottom: auto; left: auto; right: auto; z-index: auto; width: 100%; height: auto; max-width: none; max-height: none; min-width: none; min-height: auto; overflow: visible; clip-path: none; backdrop-filter: none; box-shadow: none; box-sizing: border-box"
            >
              ${animationData.class
                ? html`
                    <div
                      class="${animationData.class}"
                      style="display: inherit; width: inherit; height: inherit; flex: inherit; animation-duration: ${animationData.duration};"
                    >
                      ${moduleContent}
                    </div>
                  `
                : moduleContent}
            </div>
          </div>
        </div>
        ${showLogicOverlay && isLogicHidden
          ? html`
              <div class="logic-overlay">
                <ha-icon icon="mdi:eye-off-outline"></ha-icon>
                <span
                  >${localize(
                    'editor.layout.hidden_by_logic',
                    hass?.locale?.language || 'en',
                    'Hidden by Logic'
                  )}</span
                >
              </div>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Render module content with animation and hover effect wrappers
   * Used by: ultra-card.ts for runtime rendering
   *
   * This is called when rendering modules within rows/columns in the actual card.
   * Animation state tracking must be handled by the calling component.
   */
  renderModuleContent(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    options?: {
      animationClass?: string; // Animation class to apply (calculated by caller)
      animationDuration?: string;
      animationDelay?: string;
      animationTiming?: string;
      introAnimation?: string;
      outroAnimation?: string;
      shouldTriggerStateAnimation?: boolean;
    }
  ): TemplateResult {
    const moduleWithDesign = module as any;

    // Get module content from module handler
    // Detect edit context to avoid locking in previews and while editing dashboards
    const isEditorContext = this._isEditorContext(hass);
    const moduleContent = this._getModuleContent(module, hass, config, isEditorContext);

    // Get hover effect configuration
    const hoverEffect = moduleWithDesign.design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    const animationClass = options?.animationClass || '';
    const animationDuration = options?.animationDuration || '2s';
    const animationDelay = options?.animationDelay || '0s';
    const animationTiming = options?.animationTiming || 'ease';
    const introAnimation = options?.introAnimation || 'none';
    const outroAnimation = options?.outroAnimation || 'none';
    const shouldTriggerStateAnimation = options?.shouldTriggerStateAnimation || false;

    // Apply animation wrapper if needed
    if (
      animationClass ||
      introAnimation !== 'none' ||
      outroAnimation !== 'none' ||
      shouldTriggerStateAnimation
    ) {
      return html`
        <div
          class="module-animation-wrapper ${animationClass} ${hoverEffectClass}"
          style="
            --animation-duration: ${animationDuration};
            --animation-delay: ${animationDelay};
            --animation-timing: ${animationTiming};
          "
        >
          ${moduleContent}
        </div>
      `;
    }

    // Apply hover effect wrapper if needed
    if (hoverEffectClass) {
      return html` <div class="module-hover-wrapper ${hoverEffectClass}">${moduleContent}</div> `;
    }

    return moduleContent;
  }

  /**
   * Get module content by calling the module's renderPreview method
   * @private
   */
  private _getModuleContent(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    isEditorPreview?: boolean
  ): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler) {
      return moduleHandler.renderPreview(module, hass, config, isEditorPreview);
    }

    // Fallback for unknown module types
    return html`
      <div class="unknown-module">
        <span>Unknown Module: ${module.type}</span>
      </div>
    `;
  }

  /**
   * Get card container styling for preview
   * Mimics the ultra-card container styling
   * @private
   */
  private _getCardContainerStyle(config: UltraCardConfig): string {
    const styles = [];

    // Apply background color - use HA card background as default
    if (config.card_background) {
      styles.push(`background: ${config.card_background}`);
    } else {
      styles.push(`background: var(--card-background-color, var(--ha-card-background, white))`);
    }

    // Apply border radius
    if (config.card_border_radius !== undefined) {
      styles.push(`border-radius: ${config.card_border_radius}px`);
    } else {
      styles.push(`border-radius: 12px`);
    }

    // Only apply border if explicitly configured
    if (config.card_border_color || config.card_border_width !== undefined) {
      const borderWidth = config.card_border_width !== undefined ? config.card_border_width : 0;
      const borderColor = config.card_border_color || 'transparent';
      if (borderWidth > 0) {
        styles.push(`border: ${borderWidth}px solid ${borderColor}`);
      }
    }

    // Apply padding - use default 16px for preview if not configured
    // This ensures modules don't hang off the edges of the preview container
    if (config.card_padding !== undefined) {
      styles.push(`padding: ${config.card_padding}px`);
    } else {
      styles.push(`padding: 16px`);
    }

    // Apply margin
    if (config.card_margin !== undefined) {
      styles.push(`margin: ${config.card_margin}px`);
    }

    // Apply custom shadow
    if (config.card_shadow_enabled) {
      const shadowColor = config.card_shadow_color || 'rgba(0, 0, 0, 0.15)';
      const horizontal = config.card_shadow_horizontal ?? 0;
      const vertical = config.card_shadow_vertical ?? 2;
      const blur = config.card_shadow_blur ?? 8;
      const spread = config.card_shadow_spread ?? 0;
      styles.push(`box-shadow: ${horizontal}px ${vertical}px ${blur}px ${spread}px ${shadowColor}`);
    }

    return styles.join('; ');
  }

  /**
   * Get preview animation data for the module
   * @private
   */
  private _getPreviewAnimationData(moduleWithDesign: any): { class: string; duration: string } {
    // Check if module has animation configured
    const animationType =
      moduleWithDesign.animation_type || moduleWithDesign.design?.animation_type;

    if (!animationType || animationType === 'none') {
      return { class: '', duration: '2s' };
    }

    // Get animation duration or use default
    const animationDuration =
      moduleWithDesign.animation_duration || moduleWithDesign.design?.animation_duration || '2s';

    // Check if entity condition is configured and evaluate it
    const animationEntity =
      moduleWithDesign.animation_entity || moduleWithDesign.design?.animation_entity;

    // If no entity configured, show animation in preview
    if (!animationEntity) {
      return { class: `animation-${animationType}`, duration: animationDuration };
    }

    // If entity is configured, don't show state-based animation in static preview
    // (it will animate in the live card when conditions are met)
    return { class: '', duration: animationDuration };
  }

  /** Determine if we are rendering inside an editor context (HA edit dialog or dashboard edit) */
  private _isEditorContext(hass?: HomeAssistant): boolean {
    try {
      if ((hass as any)?.editMode) return true;

      // Consider editor context only if an edit-card dialog is VISIBLE
      const isVisible = (el: Element): boolean => {
        const rect = el.getClientRects?.();
        return !!rect && rect.length > 0 && rect[0].width > 0 && rect[0].height > 0;
      };

      // Consider typical editor preview containers
      const candidates = [
        ...Array.from(document.querySelectorAll('hui-dialog-edit-card')),
        ...Array.from(document.querySelectorAll('hui-card-preview')),
      ] as Element[];

      for (const el of candidates) {
        if (isVisible(el)) return true;
        const host = el.closest('ha-dialog, mwc-dialog') as Element | null;
        if (host && isVisible(host)) return true;
      }
    } catch {}
    return false;
  }
}

// Export singleton instance
export const ucModulePreviewService = new UcModulePreviewService();
