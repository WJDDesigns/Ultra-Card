import { html, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig, DeviceBreakpoint } from '../types';
import { getModuleRegistry, ModuleManifest } from '../modules/module-registry';
import { BaseUltraModule } from '../modules/base-module';
import { logicService } from './logic-service';
import { UcHoverEffectsService } from './uc-hover-effects-service';
import { localize } from '../localize/localize';
import { responsiveDesignService } from './uc-responsive-design-service';
import { ucCustomVariablesService } from './uc-custom-variables-service';
import { autoMigrateCardModule } from '../utils/template-migration';

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
  // Current preview breakpoint for simulating device widths
  private _previewBreakpoint: DeviceBreakpoint = 'desktop';

  /**
   * Set the preview breakpoint for simulating different device widths.
   * When set, modules will render with the effective design properties for that breakpoint.
   */
  setPreviewBreakpoint(breakpoint: DeviceBreakpoint): void {
    this._previewBreakpoint = breakpoint;
  }

  /**
   * Get the current preview breakpoint
   */
  getPreviewBreakpoint(): DeviceBreakpoint {
    return this._previewBreakpoint;
  }

  /**
   * Create a modified module with design properties merged for the preview breakpoint.
   * This allows modules to render with the correct device-specific styles in Live Preview
   * without relying on CSS media queries (which check viewport, not container width).
   */
  private _applyPreviewBreakpointDesign(module: CardModule): CardModule {
    const moduleWithDesign = module as any;
    
    // If no design object, return as-is
    if (!moduleWithDesign.design) {
      return module;
    }

    // Get effective design for the current preview breakpoint
    // This merges base + device-specific properties correctly for ALL breakpoints including desktop
    const effectiveDesign = responsiveDesignService.getEffectiveDesign(
      moduleWithDesign.design,
      this._previewBreakpoint
    );

    // Create a new module object with the merged design properties
    // This ensures modules render with breakpoint-specific values
    return {
      ...module,
      design: {
        ...moduleWithDesign.design,
        // Spread effective design properties at top level for direct access
        ...effectiveDesign,
        // Keep the responsive structure for reference but mark effective values
        _effectiveBreakpoint: this._previewBreakpoint,
        _effectiveDesign: effectiveDesign,
      },
    } as CardModule;
  }

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
      showLogicOverlay?: boolean | undefined; // Show "Hidden by Logic" overlay if logic conditions not met
      onModuleEnsureRequested?: (() => void) | undefined; // Called after ensureModuleLoaded resolves so caller can re-render
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
    // Pass 'live' context to prevent lock overlays and use separate DOM element
    const moduleContent = this._getModuleContent(
      module,
      hass,
      config,
      'live',
      options?.onModuleEnsureRequested
    );

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
            style="display: grid; grid-template-columns: 1fr; gap: 16px; background: transparent; background-image: none; border: none; border-radius: 0; position: inherit; top: auto; bottom: auto; left: auto; right: auto; z-index: auto; width: auto; height: auto; max-width: none; max-height: none; min-width: none; min-height: auto; overflow: visible; clip-path: none; backdrop-filter: none; box-shadow: none; box-sizing: border-box"
          >
            <div
              class="card-column"
              style="display: flex; flex-direction: column; background: transparent; background-image: none; border: none; border-radius: 0; position: inherit; top: auto; bottom: auto; left: auto; right: auto; z-index: auto; width: auto; height: auto; max-width: none; max-height: none; min-width: none; min-height: auto; overflow: visible; clip-path: none; backdrop-filter: none; box-shadow: none; box-sizing: border-box"
            >
              ${animationData.class
                ? html`
                    <div
                      class="${animationData.class}"
                      style="display: block; min-width: 0; min-height: 0; animation-duration: ${animationData.duration};"
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
      animationClass?: string | undefined; // Animation class to apply (calculated by caller)
      animationDuration?: string | undefined;
      animationDelay?: string | undefined;
      animationTiming?: string | undefined;
      introAnimation?: string | undefined;
      outroAnimation?: string | undefined;
      shouldTriggerStateAnimation?: boolean | undefined;
      isHaPreview?: boolean | undefined; // Explicitly mark as HA Preview rendering (not dashboard)
      isDashboardEditMode?: boolean | undefined; // Dashboard is in edit mode (show placeholders for invisible modules)
      onModuleEnsureRequested?: (() => void) | undefined; // Called after ensureModuleLoaded resolves so caller can re-render
    }
  ): TemplateResult {
    const moduleWithDesign = module as any;

    // Get module content from module handler
    // Use explicit flag if provided, otherwise assume dashboard context
    const previewContext = options?.isHaPreview
      ? 'ha-preview'
      : options?.isDashboardEditMode
        ? 'dashboard'
        : undefined;
    const moduleContent = this._getModuleContent(
      module,
      hass,
      config,
      previewContext,
      options?.onModuleEnsureRequested
    );

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

  renderModuleLoadingState(
    module: CardModule,
    onModuleEnsureRequested?: () => void
  ): TemplateResult {
    const registry = getModuleRegistry();
    const metadata = registry.getModuleMetadata(module.type);
    const loadError = registry.getModuleLoadError(module.type);
    const canLoad = registry.canLoadModule(module.type);

    if (!loadError && canLoad) {
      registry
        .ensureModuleLoaded(module.type)
        .then(() => onModuleEnsureRequested?.())
        .catch(() => {
          onModuleEnsureRequested?.();
        });

      return this._renderSkeleton(module.type, metadata);
    }

    return html`
      <div class="unknown-module" role="status">
        <span>
          ${loadError
            ? `Module failed to load: ${metadata?.title || module.type}`
            : `Unknown Module: ${module.type}`}
        </span>
        ${loadError && canLoad
          ? html`
              <button
                type="button"
                class="uc-module-retry-load"
                style="margin-top:8px;cursor:pointer;"
                @click=${() => {
                  registry.clearModuleLoadError(module.type);
                  onModuleEnsureRequested?.();
                }}
              >
                Retry load
              </button>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Get module content by calling the module's renderPreview method
   * 
   * IMPORTANT: This method resolves all variable references ($varname) in the module
   * to their actual entity IDs before passing to the module's renderPreview.
   * This enables true variable indirection - change a variable's entity in one place,
   * all modules using that variable automatically update.
   * 
   * The original config keeps $varname for editor display.
   * The resolved config is used for rendering.
   * 
   * If the module handler does NOT set handlesOwnDesignStyles = true, this method
   * automatically wraps the module content with design-tab styles (background, padding,
   * margin, border, shadow, etc.) so that the Design tab affects every module uniformly.
   * 
   * @private
   */
  private _getModuleContent(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard',
    onModuleEnsureRequested?: () => void
  ): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (!moduleHandler) {
      return this.renderModuleLoadingState(module, onModuleEnsureRequested);
    }

    // Step 1: Resolve all variable references in the module
    const resolvedModule = ucCustomVariablesService.resolveModuleVariables(module, config);
    const migratedModule = autoMigrateCardModule(resolvedModule);
    const moduleToRender =
      previewContext === 'live'
        ? this._applyPreviewBreakpointDesign(migratedModule)
        : migratedModule;
    const content = moduleHandler.renderPreview(moduleToRender, hass, config, previewContext);

    // Step 2: Apply design-tab styles as an outer wrapper when the module doesn't self-handle
    if (!moduleHandler.handlesOwnDesignStyles && moduleHandler instanceof BaseUltraModule) {
      return this._wrapWithDesignStyles(content, moduleToRender, hass, moduleHandler);
    }

    return content;
  }

  private _renderSkeleton(
    moduleType: string,
    metadata?: ModuleManifest
  ): TemplateResult {
    const category = metadata?.category || 'content';
    const title = metadata?.title || moduleType;
    const icon = metadata?.icon || 'mdi:puzzle-outline';
    const variant =
      category === 'media'
        ? 'media'
        : category === 'data'
          ? 'data'
          : category === 'interactive' || category === 'input'
            ? 'control'
            : category === 'layout'
              ? 'layout'
              : 'content';

    return html`
      <style>
        .uc-module-skeleton {
          --uc-skeleton-base: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
          --uc-skeleton-highlight: color-mix(in srgb, var(--primary-text-color) 18%, transparent);
          --uc-skeleton-accent: color-mix(in srgb, var(--primary-color) 16%, transparent);
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          min-height: 72px;
          padding: 14px;
          box-sizing: border-box;
          border-radius: 14px;
          overflow: hidden;
          background:
            linear-gradient(135deg, var(--uc-skeleton-accent), transparent 42%),
            color-mix(in srgb, var(--card-background-color, var(--ha-card-background, white)) 88%, var(--primary-text-color) 12%);
          border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
        }

        .uc-module-skeleton::after {
          content: '';
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            color-mix(in srgb, var(--primary-text-color) 10%, transparent),
            transparent
          );
          animation: ucSkeletonShimmer 1.45s ease-in-out infinite;
          pointer-events: none;
        }

        .uc-skeleton-header,
        .uc-skeleton-row {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .uc-skeleton-icon,
        .uc-skeleton-pill,
        .uc-skeleton-line,
        .uc-skeleton-block,
        .uc-skeleton-button {
          background: linear-gradient(90deg, var(--uc-skeleton-base), var(--uc-skeleton-highlight), var(--uc-skeleton-base));
          background-size: 220% 100%;
          border-radius: 999px;
          animation: ucSkeletonPulse 1.45s ease-in-out infinite;
        }

        .uc-skeleton-icon {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          color: color-mix(in srgb, var(--primary-color) 52%, var(--secondary-text-color));
        }

        .uc-skeleton-title {
          width: min(180px, 58%);
          height: 12px;
        }

        .uc-skeleton-pill {
          width: 46px;
          height: 22px;
          margin-left: auto;
        }

        .uc-skeleton-line {
          height: 10px;
        }

        .uc-skeleton-line.short { width: 34%; }
        .uc-skeleton-line.medium { width: 58%; }
        .uc-skeleton-line.long { width: 82%; }

        .uc-skeleton-block {
          height: 86px;
          border-radius: 12px;
        }

        .uc-skeleton-button {
          width: 74px;
          height: 30px;
          margin-left: auto;
        }

        .uc-module-skeleton[data-variant='media'] {
          min-height: 142px;
        }

        .uc-module-skeleton[data-variant='layout'] .uc-skeleton-row {
          gap: 8px;
        }

        @keyframes ucSkeletonShimmer {
          100% { transform: translateX(100%); }
        }

        @keyframes ucSkeletonPulse {
          0%, 100% { background-position: 0% 50%; opacity: 0.76; }
          50% { background-position: 100% 50%; opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .uc-module-skeleton::after,
          .uc-skeleton-icon,
          .uc-skeleton-pill,
          .uc-skeleton-line,
          .uc-skeleton-block,
          .uc-skeleton-button {
            animation: none;
          }
        }
      </style>
      <div
        class="uc-module-skeleton"
        data-variant="${variant}"
        role="status"
        aria-busy="true"
        aria-label="Loading ${title}"
      >
        <div class="uc-skeleton-header">
          <div class="uc-skeleton-icon"><ha-icon icon="${icon}"></ha-icon></div>
          <div class="uc-skeleton-line uc-skeleton-title"></div>
          ${variant === 'data' || variant === 'control'
            ? html`<div class="uc-skeleton-pill"></div>`
            : ''}
        </div>
        ${variant === 'media'
          ? html`
              <div class="uc-skeleton-block"></div>
              <div class="uc-skeleton-line medium"></div>
            `
          : variant === 'data'
            ? html`
                <div class="uc-skeleton-line long"></div>
                <div class="uc-skeleton-line medium"></div>
                <div class="uc-skeleton-line short"></div>
              `
            : variant === 'control'
              ? html`
                  <div class="uc-skeleton-row">
                    <div class="uc-skeleton-line long"></div>
                    <div class="uc-skeleton-button"></div>
                  </div>
                `
              : variant === 'layout'
                ? html`
                    <div class="uc-skeleton-row">
                      <div class="uc-skeleton-line medium"></div>
                      <div class="uc-skeleton-line medium"></div>
                    </div>
                    <div class="uc-skeleton-line long"></div>
                  `
                : html`
                    <div class="uc-skeleton-line long"></div>
                    <div class="uc-skeleton-line medium"></div>
                  `}
      </div>
    `;
  }

  /**
   * Wrap module content with design-tab styles (background, padding, margin, border, shadow…).
   * Only called for modules that do NOT set handlesOwnDesignStyles = true.
   * @private
   */
  private _wrapWithDesignStyles(
    content: TemplateResult,
    module: CardModule,
    hass: HomeAssistant,
    handler: BaseUltraModule
  ): TemplateResult {
    const styles = handler.buildDesignStyles(module, hass);
    const styleStr = handler.buildStyleString(styles);
    const hoverClass = handler.getHoverEffectClass(module);

    if (!styleStr && !hoverClass) {
      return content;
    }

    return html`
      <div class="uc-module-design-wrapper ${hoverClass}" style="${styleStr}">
        ${content}
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
}

// Export singleton instance
export const ucModulePreviewService = new UcModulePreviewService();
