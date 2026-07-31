import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CardModule, UltraCardConfig } from './../types';
import { getModuleRegistry } from './module-registry';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { ucModulePreviewService } from '../services/uc-module-preview-service';
import { autoMigrateCardModule } from '../utils/template-migration';

/**
 * Shared child-rendering helpers for the newer layout container modules
 * (grid_layout, flip_card, drawer, scroll_row, state_switcher).
 *
 * Mirrors the behavior of vertical/horizontal `_renderChildModulePreview`:
 * logic-based visibility, Pro-module lock overlay, state-based animation
 * wrapper, and margin zeroing so the container's gap is the sole spacing
 * source for children without explicit margins.
 */

/** Interactive elements inside child modules that must keep working even when
 *  the layout container itself has tap/hold/double-tap actions configured. */
export const INTERACTIVE_CHILD_SELECTORS = [
  'button',
  'input',
  'select',
  'textarea',
  'a[href]',
  'ha-switch',
  'ha-slider',
  'ha-control-slider',
  'ha-control-select',
  '[role="button"]',
  '[role="slider"]',
  '[role="switch"]',
];

/** Evaluate a child module's logic visibility (module conditions + global design logic). */
export function isChildModuleVisible(child: CardModule, hass: HomeAssistant): boolean {
  logicService.setHass(hass);
  const m: any = child as any;
  const visibleByModule = logicService.evaluateModuleVisibility(m);
  const visibleByGlobal = logicService.evaluateLogicProperties({
    logic_entity: m?.design?.logic_entity,
    logic_attribute: m?.design?.logic_attribute,
    logic_operator: m?.design?.logic_operator,
    logic_value: m?.design?.logic_value,
  });
  return visibleByModule && visibleByGlobal;
}

/** Zero out child margins unless the child declares explicit margins (container gap rules). */
function zeroChildMargins(child: CardModule): CardModule {
  const childDesign = (child as any).design || {};
  const hasExplicitMargin =
    childDesign.margin_top !== undefined ||
    childDesign.margin_bottom !== undefined ||
    childDesign.margin_left !== undefined ||
    childDesign.margin_right !== undefined ||
    (child as any).margin_top !== undefined ||
    (child as any).margin_bottom !== undefined ||
    (child as any).margin_left !== undefined ||
    (child as any).margin_right !== undefined;

  if (hasExplicitMargin) return child;
  return {
    ...(child as any),
    margin_top: '0',
    margin_bottom: '0',
    margin_left: '0',
    margin_right: '0',
  } as CardModule;
}

function hasProAccess(hass: HomeAssistant): boolean {
  const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
  if (
    integrationUser?.subscription?.tier === 'pro' &&
    integrationUser?.subscription?.status === 'active'
  ) {
    return true;
  }
  if (ucCloudAuthService.isAuthenticated()) {
    const cloudUser = ucCloudAuthService.getCurrentUser();
    if (cloudUser?.subscription?.tier === 'pro' && cloudUser?.subscription?.status === 'active') {
      return true;
    }
  }
  return false;
}

/**
 * Render a child module inside a layout container. Returns an empty template
 * when the child is hidden by logic conditions.
 */
export function renderChildModulePreview(
  child: CardModule,
  hass: HomeAssistant,
  config?: UltraCardConfig,
  previewContext?: 'live' | 'ha-preview' | 'dashboard'
): TemplateResult {
  if (!isChildModuleVisible(child, hass)) {
    return html``;
  }

  const moduleToRender = zeroChildMargins(child);
  const registry = getModuleRegistry();
  const moduleHandler = registry.getModule(moduleToRender.type);

  if (!moduleHandler) {
    return ucModulePreviewService.renderModuleLoadingState(moduleToRender);
  }

  const isProModule =
    moduleHandler.metadata?.tags?.includes('pro') ||
    moduleHandler.metadata?.tags?.includes('premium') ||
    false;
  const shouldShowProOverlay = isProModule && !hasProAccess(hass);

  const migratedChild = autoMigrateCardModule(moduleToRender);
  const moduleContent = moduleHandler.renderPreview(migratedChild, hass, config, previewContext);

  if (shouldShowProOverlay) {
    return html`
      <div class="pro-module-locked" style="position: relative;">
        ${moduleContent}
        <div
          class="pro-module-overlay"
          style="
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            z-index: 10;
          "
        >
          <div
            style="
              text-align: center;
              color: white;
              padding: 6px;
              max-width: 95%;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
            "
          >
            <ha-icon icon="mdi:lock" style="font-size: 20px; flex-shrink: 0;"></ha-icon>
            <div style="font-size: 11px; font-weight: 600; line-height: 1.2; white-space: nowrap;">
              Pro Module
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // State-based animation wrapper for children when configured
  const m: any = moduleToRender as any;
  const animationType = m.animation_type || m.design?.animation_type;
  if (animationType && animationType !== 'none') {
    const animationDuration = m.animation_duration || m.design?.animation_duration || '2s';
    const animationDelay = m.animation_delay || m.design?.animation_delay || '0s';
    const animationTiming = m.animation_timing || m.design?.animation_timing || 'ease';
    const entityId = m.animation_entity || m.design?.animation_entity;
    const triggerType = m.animation_trigger_type || m.design?.animation_trigger_type || 'state';
    const attribute = m.animation_attribute || m.design?.animation_attribute;
    const targetState = m.animation_state || m.design?.animation_state;

    let shouldAnimate = false;
    if (!entityId) {
      shouldAnimate = true;
    } else if (targetState && hass && hass.states[entityId]) {
      const entity = hass.states[entityId];
      if (triggerType === 'attribute' && attribute) {
        shouldAnimate = String(entity.attributes[attribute]) === targetState;
      } else {
        shouldAnimate = entity.state === targetState;
      }
    }

    if (shouldAnimate) {
      return html`
        <div
          class="module-animation-wrapper animation-${animationType}"
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
  }

  return moduleContent;
}
