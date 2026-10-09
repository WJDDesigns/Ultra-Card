import { html, TemplateResult } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { forwardHaptic } from '../ha/helpers';
import { UltraCardConfig, CardModule } from '../types';
import { ucActionConfirmationService } from '../services/uc-action-confirmation-service';
import {
  closePopupById,
  getContainingPopupKey,
  getPopupForModule,
  openPopupById,
} from '../services/popup-trigger-registry';
import {
  containsTemplate,
  renderActionTemplate,
  renderTemplateValues,
} from '../utils/uc-action-template-renderer';

export interface UltraLinkConfig {
  tap_action?: TapActionConfig | undefined;
  hold_action?: TapActionConfig | undefined;
  double_tap_action?: TapActionConfig | undefined;
}

export interface TapActionConfig {
  action:
    | 'default'
    | 'more-info'
    | 'toggle'
    | 'navigate'
    | 'url'
    | 'perform-action'
    | 'call-service' // Legacy/alternative for 'perform-action'
    | 'assist'
    | 'nothing'
    | 'none'; // Legacy/alternative for 'nothing'
  entity?: string | undefined;
  navigation_path?: string | undefined;
  url_path?: string | undefined;
  /** Where a `url` action opens. Defaults to `_blank` so existing links keep opening a new tab. */
  url_target?: '_blank' | '_self' | undefined;
  // Modern perform-action property (preferred)
  perform_action?: string | undefined;
  // Legacy service property (for backward compatibility)
  service?: string | undefined;
  target?: Record<string, any> | undefined; // Home Assistant action target
  data?: Record<string, any> | undefined; // Modern data property for perform-action
  service_data?: Record<string, any> | undefined; // Legacy service data property
  [key: string]: any; // Allow additional HA action properties
}

type UltraLinkEditorImpl = typeof import('./ultra-link-editor').UltraLinkEditor;
let editorImpl: UltraLinkEditorImpl | null = null;

/** Called by ultra-link-editor.ts when the editor chunk loads. */
export function registerUltraLinkEditor(impl: UltraLinkEditorImpl): void {
  editorImpl = impl;
}

export class UltraLinkComponent {
  /**
   * The Actions-tab editor UI lives in ultra-link-editor.ts (editor chunk) and
   * registers itself; outside the editor nothing renders it, so the fallback is empty.
   */
  static render(...args: Parameters<UltraLinkEditorImpl['render']>): TemplateResult {
    return editorImpl ? editorImpl.render(...args) : html``;
  }






  static getDefaultConfig(): UltraLinkConfig {
    return {
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
    };
  }

  /**
   * Resolves a 'default' action to the appropriate native action based on entity domain
   * @param action The action config with 'default' action type
   * @param hass Home Assistant instance
   * @returns Resolved action config with native action for the entity type
   */
  private static resolveDefaultAction(
    action: TapActionConfig,
    hass: HomeAssistant
  ): TapActionConfig {
    // If no entity is specified or action is not 'default', return as-is
    if (!action.entity || action.action !== 'default') {
      return action;
    }

    const entityId = action.entity;
    const domain = entityId.split('.')[0];

    // Map entity domains to their native actions
    switch (domain) {
      case 'button':
        // Buttons should call button.press service
        return {
          ...action,
          action: 'perform-action',
          service: 'button.press',
          entity: entityId,
        };

      case 'script':
        // Scripts should call script.turn_on or script.<name>
        // Home Assistant allows both script.turn_on with entity_id or script.<name>
        return {
          ...action,
          action: 'perform-action',
          service: 'script.turn_on',
          entity: entityId,
        };

      case 'scene':
        // Scenes should call scene.turn_on
        return {
          ...action,
          action: 'perform-action',
          service: 'scene.turn_on',
          entity: entityId,
        };

      case 'automation':
      case 'switch':
      case 'light':
      case 'fan':
      case 'input_boolean':
      case 'lock':
      case 'cover':
        // These entities support native toggle
        return {
          ...action,
          action: 'toggle',
          entity: entityId,
        };

      default:
        // For all other entities (sensor, binary_sensor, etc.), default to more-info
        return {
          ...action,
          action: 'more-info',
          entity: entityId,
        };
    }
  }

  private static resolveDefaultEntity(
    moduleEntity?: string,
    module?: CardModule
  ): string | undefined {
    if (moduleEntity) {
      return moduleEntity;
    }

    const moduleRecord = module as Record<string, unknown> | undefined;
    if (!moduleRecord) {
      return undefined;
    }

    if (typeof moduleRecord.entity === 'string') {
      return moduleRecord.entity;
    }

    if (moduleRecord.type === 'info' && Array.isArray(moduleRecord.info_entities)) {
      const firstInfoEntity = moduleRecord.info_entities.find(
        item => item && typeof item === 'object' && typeof (item as Record<string, unknown>).entity === 'string'
      ) as Record<string, unknown> | undefined;
      if (firstInfoEntity && typeof firstInfoEntity.entity === 'string') {
        return firstInfoEntity.entity;
      }
    }

    if (moduleRecord.type === 'image') {
      if (typeof moduleRecord.entity === 'string') return moduleRecord.entity;
      if (typeof moduleRecord.image_entity === 'string') return moduleRecord.image_entity;
      if (typeof moduleRecord.single_entity === 'string') return moduleRecord.single_entity;
    }

    if (moduleRecord.type === 'icon' && Array.isArray(moduleRecord.icons)) {
      const firstIconEntity = moduleRecord.icons.find(
        item => item && typeof item === 'object' && typeof (item as Record<string, unknown>).entity === 'string'
      ) as Record<string, unknown> | undefined;
      if (firstIconEntity && typeof firstIconEntity.entity === 'string') {
        return firstIconEntity.entity;
      }
    }

    return undefined;
  }

  private static collectModuleEntities(moduleEntity?: string, module?: CardModule): string[] {
    const entities: string[] = [];
    const addEntity = (value: unknown) => {
      if (typeof value !== 'string') return;
      const trimmed = value.trim();
      if (!trimmed) return;
      if (!entities.includes(trimmed)) {
        entities.push(trimmed);
      }
    };

    addEntity(moduleEntity);
    const primary = this.resolveDefaultEntity(moduleEntity, module);
    addEntity(primary);

    const moduleRecord = module as Record<string, unknown> | undefined;
    if (!moduleRecord) {
      return entities;
    }

    if (Array.isArray(moduleRecord.icons)) {
      for (const item of moduleRecord.icons) {
        if (item && typeof item === 'object') {
          addEntity((item as Record<string, unknown>).entity);
        }
      }
    }

    if (Array.isArray(moduleRecord.info_entities)) {
      for (const item of moduleRecord.info_entities) {
        if (item && typeof item === 'object') {
          addEntity((item as Record<string, unknown>).entity);
        }
      }
    }

    return entities;
  }

  /**
   * Keep entity-bound actions aligned with the module's current entity context.
   * This heals duplicated modules where action.entity can remain stuck on the
   * source module's old entity after the new module entity is changed.
   */
  private static normalizeEntityBoundAction(
    action: TapActionConfig,
    moduleEntity?: string,
    module?: CardModule
  ): TapActionConfig {
    if (action.action !== 'more-info' && action.action !== 'toggle') {
      return action;
    }

    // Respect explicit target-based toggles.
    if (action.action === 'toggle' && action.target) {
      return action;
    }

    const moduleEntities = this.collectModuleEntities(moduleEntity, module);
    const fallbackEntity = moduleEntities[0];
    if (!fallbackEntity) {
      return action;
    }

    if (!action.entity) {
      return { ...action, entity: fallbackEntity };
    }

    // For implicit-entity modules (icon/info), heal stale entity references
    // copied from duplicated modules if they no longer exist in this module.
    const moduleType = (module as any)?.type;
    const isImplicitEntityModule = moduleType === 'icon' || moduleType === 'info';
    if (isImplicitEntityModule && !moduleEntities.includes(action.entity)) {
      return { ...action, entity: fallbackEntity };
    }

    return action;
  }

  /**
   * Render any Jinja templates embedded in the action config. Returns a fresh
   * action object — never mutates the original. Entity context is taken from
   * the action's `entity` (preferred, may also be a template), falling back to
   * the module's primary entity.
   */
  private static async renderActionTemplates(
    action: TapActionConfig,
    hass: HomeAssistant,
    moduleEntity?: string,
    module?: CardModule,
    cardConfig?: UltraCardConfig
  ): Promise<TapActionConfig> {
    if (!hass) return action;

    // Quick bail-out: skip if no field looks templated.
    const objHasTemplate = (v: unknown): boolean => {
      if (v && typeof v === 'object') {
        try {
          const s = JSON.stringify(v);
          return s.includes('{{') || s.includes('{%');
        } catch {
          return false;
        }
      }
      return false;
    };
    const hasAnyTemplate =
      containsTemplate(action.entity) ||
      containsTemplate(action.url_path) ||
      containsTemplate(action.navigation_path) ||
      objHasTemplate(action.data) ||
      objHasTemplate(action.service_data) ||
      objHasTemplate(action.target);
    if (!hasAnyTemplate) return action;

    const resolved: TapActionConfig = { ...action };

    // Render `entity` first — it influences the context for the rest.
    if (containsTemplate(resolved.entity)) {
      const rendered = await renderActionTemplate(
        resolved.entity,
        hass,
        this.resolveDefaultEntity(moduleEntity, module),
        cardConfig
      );
      resolved.entity = rendered ? rendered.trim() : resolved.entity;
    }

    const contextEntity = resolved.entity || this.resolveDefaultEntity(moduleEntity, module);

    if (containsTemplate(resolved.url_path)) {
      resolved.url_path = await renderActionTemplate(
        resolved.url_path,
        hass,
        contextEntity,
        cardConfig
      );
    }

    if (containsTemplate(resolved.navigation_path)) {
      resolved.navigation_path = await renderActionTemplate(
        resolved.navigation_path,
        hass,
        contextEntity,
        cardConfig
      );
    }

    if (resolved.data && typeof resolved.data === 'object') {
      resolved.data = await renderTemplateValues(resolved.data, hass, contextEntity, cardConfig);
    }

    if (resolved.service_data && typeof resolved.service_data === 'object') {
      resolved.service_data = await renderTemplateValues(
        resolved.service_data,
        hass,
        contextEntity,
        cardConfig
      );
    }

    if (resolved.target && typeof resolved.target === 'object') {
      resolved.target = await renderTemplateValues(
        resolved.target,
        hass,
        contextEntity,
        cardConfig
      );
    }

    return resolved;
  }

  static async handleAction(
    action: TapActionConfig | undefined,
    hass: HomeAssistant,
    element?: HTMLElement,
    config?: UltraCardConfig,
    moduleEntity?: string,
    module?: CardModule
  ): Promise<void> {
    // Check if this module should trigger a popup instead of its normal action
    if (module?.id) {
      const popupId = getPopupForModule(module.id);
      if (popupId) {
        // This module is configured as a popup trigger - open the popup instead
        openPopupById(popupId);
        return;
      }
    }

    // Resolve the containing popup up front: the action itself can re-render
    // the popup content and detach `element` before we get a chance to look.
    const popupKeyToClose =
      module?.close_popup_after_action === true ? getContainingPopupKey(element) : undefined;
    const closeContainingPopup = () => {
      if (popupKeyToClose) {
        closePopupById(popupKeyToClose);
      }
    };

    // If action is undefined or missing, or explicitly set to 'default', use smart resolution
    let resolvedAction: TapActionConfig;

    if (!action || !action.action || action.action === 'default') {
      // For undefined actions, create a default action with the module's entity
      const defaultAction: TapActionConfig = { ...(action || { action: 'default' }) };
      const defaultEntity = this.resolveDefaultEntity(moduleEntity, module);
      if (defaultEntity) {
        // Explicit default actions should track the module's primary entity.
        defaultAction.entity = defaultEntity;
      }
      resolvedAction = this.resolveDefaultAction(defaultAction, hass);
    } else {
      resolvedAction = action;
    }

    // Skip confirmation and execution for 'nothing' or 'none' actions.
    // Closing still applies, so a plain "Close" button needs no action at all.
    if (resolvedAction.action === 'nothing' || resolvedAction.action === 'none') {
      closeContainingPopup();
      return;
    }

    // Resolve any Jinja templates inside the action config (url_path,
    // navigation_path, entity, and string values inside data/service_data/target).
    // Done as a one-shot render at fire time so live entity values flow into
    // the action.
    resolvedAction = await this.renderActionTemplates(
      resolvedAction,
      hass,
      moduleEntity,
      module,
      config
    );

    resolvedAction = this.normalizeEntityBoundAction(resolvedAction, moduleEntity, module);

    // Check if confirmation is required
    const confirmAction = module?.confirm_action === true;

    if (confirmAction) {
      // Set hass for the confirmation service
      ucActionConfirmationService.setHass(hass);

      // Show confirmation dialog BEFORE executing the action
      // This will block execution until user confirms or cancels
      const confirmed = await ucActionConfirmationService.showConfirmation(resolvedAction, {
        showConfirmButton: module?.confirm_action_show_confirm_button,
        showCancelButton: module?.confirm_action_show_cancel_button,
        confirmText: module?.confirm_action_confirm_text,
        cancelText: module?.confirm_action_cancel_text,
      });

      // If user cancelled, don't execute the action
      if (!confirmed) {
        return;
      }
    }

    // Trigger haptic feedback if enabled (default: true)
    const hapticEnabled = config?.haptic_feedback !== false;
    if (hapticEnabled && resolvedAction.action !== 'default') {
      // Use appropriate haptic type based on action following HA guidelines
      switch (resolvedAction.action) {
        case 'toggle':
          forwardHaptic('light'); // Physical metaphor for toggling
          break;
        case 'more-info':
        case 'navigate':
        case 'url':
          forwardHaptic('selection'); // Selection is actively changing
          break;
        case 'perform-action':
        case 'call-service':
        case 'assist':
          forwardHaptic('medium'); // Physical metaphor for performing actions
          break;
        default:
          forwardHaptic('selection'); // Default fallback
          break;
      }
    }

    // Home Assistant stores perform-action services under 'perform_action' key
    const serviceToCall = resolvedAction.service || resolvedAction.perform_action;

    switch (resolvedAction.action) {
      case 'more-info':
        if (resolvedAction.entity) {
          const event = new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId: resolvedAction.entity },
          });
          element?.dispatchEvent(event);
        }
        break;

      case 'toggle':
        if (resolvedAction.entity) {
          // Legacy entity-based toggle
          hass.callService('homeassistant', 'toggle', { entity_id: resolvedAction.entity });
        } else if (resolvedAction.target) {
          // Modern target-based toggle (supports device_id, area_id, etc.)
          const serviceData: any = {};

          // Handle different target types
          if (resolvedAction.target.entity_id) {
            serviceData.entity_id = resolvedAction.target.entity_id;
          }
          if (resolvedAction.target.device_id) {
            serviceData.device_id = resolvedAction.target.device_id;
          }
          if (resolvedAction.target.area_id) {
            serviceData.area_id = resolvedAction.target.area_id;
          }
          if (resolvedAction.target.floor_id) {
            serviceData.floor_id = resolvedAction.target.floor_id;
          }
          if (resolvedAction.target.label_id) {
            serviceData.label_id = resolvedAction.target.label_id;
          }

          hass.callService('homeassistant', 'toggle', serviceData);
        }
        break;

      case 'navigate':
        if (resolvedAction.navigation_path) {
          window.history.pushState(null, '', resolvedAction.navigation_path);
          const event = new CustomEvent('location-changed', {
            bubbles: true,
            composed: true,
            detail: { replace: false },
          });
          window.dispatchEvent(event);
        }
        break;

      case 'url':
        if (resolvedAction.url_path) {
          if (resolvedAction.url_target === '_self') {
            window.location.assign(resolvedAction.url_path);
          } else {
            window.open(resolvedAction.url_path, '_blank', 'noopener');
          }
        }
        break;

      // 'call-service' is the pre-2024.8 spelling of 'perform-action'. Home Assistant's
      // own handleAction still honours it, so configs and community presets written
      // against the old name must keep working rather than silently doing nothing.
      case 'call-service':
      case 'perform-action':
        if (serviceToCall) {
          const [domain, service] = serviceToCall.split('.');
          if (domain && service) {
            // Enhanced service data handling for better target support
            // Support both modern 'data' and legacy 'service_data' properties
            const serviceData = { ...(resolvedAction.data || resolvedAction.service_data) };

            // Only auto-inject entity_id if NO explicit data was provided
            // When user has explicit data/service_data, respect their configuration
            // Services like device_tracker.see don't accept entity_id and will error
            const hasExplicitData = resolvedAction.data || resolvedAction.service_data;
            if (!hasExplicitData && resolvedAction.entity && !serviceData.entity_id) {
              serviceData.entity_id = resolvedAction.entity;
            }

            // Handle all target types from HA action system
            if (resolvedAction.target) {
              if (resolvedAction.target.entity_id && !serviceData.entity_id) {
                serviceData.entity_id = resolvedAction.target.entity_id;
              }
              if (resolvedAction.target.device_id && !serviceData.device_id) {
                serviceData.device_id = resolvedAction.target.device_id;
              }
              if (resolvedAction.target.area_id && !serviceData.area_id) {
                serviceData.area_id = resolvedAction.target.area_id;
              }
              if (resolvedAction.target.floor_id && !serviceData.floor_id) {
                serviceData.floor_id = resolvedAction.target.floor_id;
              }
              if (resolvedAction.target.label_id && !serviceData.label_id) {
                serviceData.label_id = resolvedAction.target.label_id;
              }
            }

            try {
              await hass.callService(domain, service, serviceData);
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
            action: resolvedAction,
            serviceProperty: resolvedAction.service,
            performActionProperty: resolvedAction.perform_action,
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

      default:
        // Do nothing (including 'nothing' action which is already handled above)
        break;
    }

    closeContainingPopup();
  }
}
