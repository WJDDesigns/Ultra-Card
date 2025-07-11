import { html, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, CameraModule } from '../types';
import { FormUtils } from '../utils/form-utils';

// For now, let's define a minimal link component interface until we find the real one
interface UltraLinkConfig {
  tap_action?: any;
  hold_action?: any;
  double_tap_action?: any;
}

class UltraLinkComponent {
  static render(
    hass: HomeAssistant,
    config: UltraLinkConfig,
    onUpdate: (updates: Partial<UltraLinkConfig>) => void,
    title: string
  ): TemplateResult {
    return html`<div>Link Configuration (${title})</div>`;
  }

  static handleAction(action: any, hass: HomeAssistant, element: HTMLElement): void {
    // Basic action handling
    if (action.action === 'more-info' && action.entity) {
      const event = new CustomEvent('hass-more-info', {
        detail: { entityId: action.entity },
        bubbles: true,
        composed: true,
      });
      element.dispatchEvent(event);
    }
  }
}

export class UltraCameraModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'camera',
    title: 'Camera Module',
    description: 'Display live camera feeds with comprehensive control options',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:camera',
    category: 'content',
    tags: ['camera', 'live', 'feed', 'security', 'surveillance'],
  };

  private clickTimeout: any = null;
  private holdTimeout: any = null;
  private isHolding = false;

  createDefault(id?: string): CameraModule {
    return {
      id: id || this.generateId('camera'),
      type: 'camera',

      // Core properties
      entity: '',
      camera_name: '',
      show_name: true,

      // Display settings
      aspect_ratio: '16:9',
      image_fit: 'cover',
      border_radius: '8',

      // Camera controls
      show_controls: false,
      auto_refresh: true,
      refresh_interval: 30,

      // Image quality
      image_quality: 'high',

      // Live view (streaming)
      live_view: false,

      // Error handling
      show_unavailable: true,
      fallback_image: '',

      // Global link configuration
      tap_action: { action: 'more-info' },
      hold_action: { action: 'default' },
      double_tap_action: { action: 'default' },

      // Template support
      template_mode: false,
      template: '',
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: any,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const cameraModule = module as CameraModule;

    return html`
      <div class="camera-module-settings">
        <!-- Camera Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Camera Configuration
          </div>

          ${FormUtils.renderField(
            'Camera Entity',
            'Select the camera entity to display. This should be a camera or mjpeg entity from Home Assistant.',
            hass,
            { entity: cameraModule.entity || '' },
            [FormUtils.createSchemaItem('entity', { entity: { domain: ['camera'] } })],
            (e: CustomEvent) => updateModule({ entity: e.detail.value.entity })
          )}
          ${FormUtils.renderField(
            'Camera Name',
            'Custom name for the camera. Leave empty to use entity name.',
            hass,
            { camera_name: cameraModule.camera_name || '' },
            [FormUtils.createSchemaItem('camera_name', { text: {} })],
            (e: CustomEvent) => updateModule({ camera_name: e.detail.value.camera_name })
          )}

          <div style="display: flex; align-items: center; gap: 16px; margin-top: 16px;">
            <span class="field-title">Show Camera Name</span>
            ${FormUtils.renderCleanForm(
              hass,
              { show_name: cameraModule.show_name !== false },
              [FormUtils.createSchemaItem('show_name', { boolean: {} })],
              (e: CustomEvent) => updateModule({ show_name: e.detail.value.show_name })
            )}
          </div>
        </div>

        <!-- Display Settings Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Display Settings
          </div>

          ${FormUtils.renderField(
            'Aspect Ratio',
            'Set the aspect ratio for the camera display.',
            hass,
            { aspect_ratio: cameraModule.aspect_ratio || '16:9' },
            [
              FormUtils.createSchemaItem('aspect_ratio', {
                select: {
                  options: [
                    { value: '16:9', label: '16:9 (Widescreen)' },
                    { value: '4:3', label: '4:3 (Standard)' },
                    { value: '1:1', label: '1:1 (Square)' },
                    { value: 'auto', label: 'Auto (Original)' },
                  ],
                },
              }),
            ],
            (e: CustomEvent) => updateModule({ aspect_ratio: e.detail.value.aspect_ratio })
          )}
          ${FormUtils.renderField(
            'Image Fit',
            'How the camera image should fit within the container.',
            hass,
            { image_fit: cameraModule.image_fit || 'cover' },
            [
              FormUtils.createSchemaItem('image_fit', {
                select: {
                  options: [
                    { value: 'cover', label: 'Cover (Fill container, may crop)' },
                    { value: 'contain', label: 'Contain (Fit entirely, may have bars)' },
                    { value: 'fill', label: 'Fill (Stretch to fit)' },
                    { value: 'scale-down', label: 'Scale Down (Shrink if needed)' },
                  ],
                },
              }),
            ],
            (e: CustomEvent) => updateModule({ image_fit: e.detail.value.image_fit })
          )}
          ${FormUtils.renderField(
            'Border Radius (px)',
            'Rounded corners for the camera image. 0 for sharp corners.',
            hass,
            { border_radius: cameraModule.border_radius || '8' },
            [
              FormUtils.createSchemaItem('border_radius', {
                number: { min: 0, max: 50, mode: 'box' },
              }),
            ],
            (e: CustomEvent) =>
              updateModule({ border_radius: e.detail.value.border_radius?.toString() })
          )}
        </div>

        <!-- Camera Controls Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Camera Controls
          </div>

          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <span class="field-title">Show Controls</span>
            ${FormUtils.renderCleanForm(
              hass,
              { show_controls: cameraModule.show_controls || false },
              [FormUtils.createSchemaItem('show_controls', { boolean: {} })],
              (e: CustomEvent) => updateModule({ show_controls: e.detail.value.show_controls })
            )}
          </div>

          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <span class="field-title">Auto Refresh</span>
            ${FormUtils.renderCleanForm(
              hass,
              { auto_refresh: cameraModule.auto_refresh !== false },
              [FormUtils.createSchemaItem('auto_refresh', { boolean: {} })],
              (e: CustomEvent) => updateModule({ auto_refresh: e.detail.value.auto_refresh })
            )}
          </div>

          ${cameraModule.auto_refresh !== false
            ? html`
                <div style="margin-top: 16px;">
                  ${this.renderConditionalFieldsGroup(
                    'Auto Refresh Settings',
                    html`
                      ${FormUtils.renderField(
                        'Refresh Interval (seconds)',
                        'How often to refresh the camera image automatically.',
                        hass,
                        { refresh_interval: cameraModule.refresh_interval || 30 },
                        [
                          FormUtils.createSchemaItem('refresh_interval', {
                            number: { min: 5, max: 300, mode: 'box' },
                          }),
                        ],
                        (e: CustomEvent) =>
                          updateModule({ refresh_interval: e.detail.value.refresh_interval })
                      )}
                    `
                  )}
                </div>
              `
            : ''}
        </div>

        <!-- Image Quality & Error Handling Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Image Quality & Error Handling
          </div>

          ${FormUtils.renderField(
            'Image Quality',
            'Quality setting for the camera stream. Higher quality uses more bandwidth.',
            hass,
            { image_quality: cameraModule.image_quality || 'high' },
            [
              FormUtils.createSchemaItem('image_quality', {
                select: {
                  options: [
                    { value: 'high', label: 'High Quality' },
                    { value: 'medium', label: 'Medium Quality' },
                    { value: 'low', label: 'Low Quality (Faster)' },
                  ],
                },
              }),
            ],
            (e: CustomEvent) => updateModule({ image_quality: e.detail.value.image_quality })
          )}

          <div style="display: flex; align-items: center; gap: 16px; margin: 16px 0;">
            <span class="field-title">Live View</span>
            ${FormUtils.renderCleanForm(
              hass,
              { live_view: cameraModule.live_view || false },
              [FormUtils.createSchemaItem('live_view', { boolean: {} })],
              (e: CustomEvent) => updateModule({ live_view: e.detail.value.live_view })
            )}
          </div>
          <div
            style="margin-bottom: 16px; color: var(--secondary-text-color); font-size: 12px; font-style: italic;"
          >
            Enable to show live camera stream (requires stream integration). When disabled, shows
            still image snapshots.
          </div>

          <div style="display: flex; align-items: center; gap: 16px; margin: 16px 0;">
            <span class="field-title">Show Unavailable State</span>
            ${FormUtils.renderCleanForm(
              hass,
              { show_unavailable: cameraModule.show_unavailable !== false },
              [FormUtils.createSchemaItem('show_unavailable', { boolean: {} })],
              (e: CustomEvent) =>
                updateModule({ show_unavailable: e.detail.value.show_unavailable })
            )}
          </div>

          ${FormUtils.renderField(
            'Fallback Image URL',
            'Optional image to show when camera is unavailable. Can be a URL or local path.',
            hass,
            { fallback_image: cameraModule.fallback_image || '' },
            [FormUtils.createSchemaItem('fallback_image', { text: {} })],
            (e: CustomEvent) => updateModule({ fallback_image: e.detail.value.fallback_image })
          )}
        </div>

        <!-- Link Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          ${UltraLinkComponent.render(
            hass,
            {
              tap_action: cameraModule.tap_action || { action: 'more-info' },
              hold_action: cameraModule.hold_action || { action: 'default' },
              double_tap_action: cameraModule.double_tap_action || { action: 'default' },
            },
            (updates: Partial<UltraLinkConfig>) => {
              const moduleUpdates: Partial<CameraModule> = {};
              if (updates.tap_action) moduleUpdates.tap_action = updates.tap_action;
              if (updates.hold_action) moduleUpdates.hold_action = updates.hold_action;
              if (updates.double_tap_action)
                moduleUpdates.double_tap_action = updates.double_tap_action;
              updateModule(moduleUpdates);
            },
            'Link Configuration'
          )}
        </div>

        <!-- Template Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              Template Configuration
            </div>
            ${FormUtils.renderCleanForm(
              hass,
              { template_mode: cameraModule.template_mode || false },
              [FormUtils.createSchemaItem('template_mode', { boolean: {} })],
              (e: CustomEvent) => updateModule({ template_mode: e.detail.value.template_mode })
            )}
          </div>

          ${cameraModule.template_mode
            ? this.renderConditionalFieldsGroup(
                'Template Settings',
                html`
                  ${FormUtils.renderField(
                    'Template Code',
                    'Enter Jinja2 template code to dynamically set camera entity. Example: {{ states.camera.front_door.entity_id if is_state("input_boolean.show_front", "on") else states.camera.back_yard.entity_id }}',
                    hass,
                    { template: cameraModule.template || '' },
                    [FormUtils.createSchemaItem('template', { text: { multiline: true } })],
                    (e: CustomEvent) => updateModule({ template: e.detail.value.template })
                  )}
                `
              )
            : html`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable template mode to use dynamic camera selection
                </div>
              `}
        </div>
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const cameraModule = module as CameraModule;
    const moduleWithDesign = cameraModule as any;

    // Get camera entity
    let cameraEntity = cameraModule.entity;

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🎥 Camera Preview Debug:', {
        entity: cameraEntity,
        hasHass: !!hass,
        states: hass
          ? Object.keys(hass.states)
              .filter(id => id.includes('camera'))
              .slice(0, 5)
          : [],
        module: cameraModule,
      });
    }

    // Handle template mode
    if (cameraModule.template_mode && cameraModule.template) {
      try {
        // Note: In a real implementation, you'd evaluate the template
        // For preview purposes, we'll use the original entity
        cameraEntity = cameraModule.entity;
      } catch (error) {
        console.warn('Template evaluation failed:', error);
      }
    }

    const entity = cameraEntity ? hass.states[cameraEntity] : null;
    const isUnavailable = !entity || entity.state === 'unavailable';

    if (process.env.NODE_ENV === 'development') {
      console.log('🎥 Camera Entity Status:', {
        cameraEntity,
        entity: entity ? { state: entity.state, attributes: entity.attributes } : null,
        isUnavailable,
      });
    }

    // Get camera name
    const cameraName =
      cameraModule.camera_name ||
      (entity ? entity.attributes.friendly_name || entity.entity_id : 'Camera');

    // Container styles for positioning and effects
    const containerStyles = {
      padding: this.getPaddingCSS(moduleWithDesign),
      margin: this.getMarginCSS(moduleWithDesign),
      background: this.getBackgroundCSS(moduleWithDesign),
      backgroundImage: this.getBackgroundImageCSS(moduleWithDesign, hass),
      border: this.getBorderCSS(moduleWithDesign),
      borderRadius: this.addPixelUnit(moduleWithDesign.border_radius) || '0px',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
    };

    // Camera image styles
    const imageStyles = {
      borderRadius: this.addPixelUnit(cameraModule.border_radius) || '8px',
      objectFit: cameraModule.image_fit || 'cover',
      width: '100%',
      height: '200px', // Default height for preview
      display: 'block',
    };

    // Get aspect ratio styling
    const aspectRatioStyle = this.getAspectRatioStyle(cameraModule.aspect_ratio);

    // Camera content
    const cameraContent = html`
      <div class="camera-module-container" style=${this.styleObjectToCss(containerStyles)}>
        ${cameraModule.show_name !== false
          ? html`
              <div
                class="camera-name"
                style="margin-bottom: 8px; font-weight: 500; color: var(--primary-text-color);"
              >
                ${cameraName}
              </div>
            `
          : ''}

        <div class="camera-image-container" style=${aspectRatioStyle}>
          ${!cameraEntity
            ? html`
                <div
                  class="camera-unavailable"
                  style=${this.styleObjectToCss({
                    ...imageStyles,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    backgroundColor: 'var(--warning-color, #ff9800)',
                    color: 'white',
                  })}
                >
                  <ha-icon
                    icon="mdi:camera-plus"
                    style="font-size: 48px; margin-bottom: 8px;"
                  ></ha-icon>
                  <span style="font-weight: 500;">No Camera Selected</span>
                  <span style="font-size: 12px; margin-top: 4px; opacity: 0.9;"
                    >Choose a camera entity below</span
                  >
                </div>
              `
            : !isUnavailable
              ? html`
                  <!-- Use HA's native camera image component - same as picture-glance card -->
                  <hui-image
                    .hass=${hass}
                    .cameraImage=${cameraEntity}
                    .cameraView=${cameraModule.live_view ? 'live' : 'auto'}
                    style=${this.styleObjectToCss(imageStyles)}
                    class="camera-image"
                    @error=${(e: Event) => console.log('🎥 HA hui-image error:', e)}
                    @load=${() => console.log('🎥 HA hui-image loaded successfully')}
                  ></hui-image>
                  ${cameraModule.show_controls
                    ? html`
                        <div class="camera-controls">
                          <button
                            class="camera-control-btn"
                            title="Refresh Camera"
                            @click=${() => this.refreshCamera(cameraEntity, hass)}
                          >
                            <ha-icon icon="mdi:refresh"></ha-icon>
                          </button>
                        </div>
                      `
                    : ''}
                `
              : html`
                  <div
                    class="camera-unavailable"
                    style=${this.styleObjectToCss({
                      ...imageStyles,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      backgroundColor: 'var(--error-color, #f44336)',
                      color: 'white',
                    })}
                  >
                    ${cameraModule.fallback_image
                      ? html`
                          <img
                            src=${cameraModule.fallback_image}
                            alt="Fallback"
                            style="max-width: 100%; max-height: 100%; object-fit: cover;"
                          />
                        `
                      : html`
                          <ha-icon
                            icon="mdi:camera-off"
                            style="font-size: 48px; margin-bottom: 8px;"
                          ></ha-icon>
                          <span style="font-weight: 500;">Camera Unavailable</span>
                          <span style="font-size: 12px; margin-top: 4px; opacity: 0.9;"
                            >Entity: ${cameraEntity}</span
                          >
                        `}
                  </div>
                `}
        </div>
      </div>
    `;

    // Handle link actions
    return this.hasActiveLink(cameraModule)
      ? html`<div
          class="camera-module-clickable"
          @click=${(e: Event) => this.handleClick(e, cameraModule, hass)}
          @dblclick=${(e: Event) => this.handleDoubleClick(e, cameraModule, hass)}
          @mousedown=${(e: Event) => this.handleMouseDown(e, cameraModule, hass)}
          @mouseup=${(e: Event) => this.handleMouseUp(e, cameraModule, hass)}
          @mouseleave=${(e: Event) => this.handleMouseLeave(e, cameraModule, hass)}
          @touchstart=${(e: Event) => this.handleTouchStart(e, cameraModule, hass)}
          @touchend=${(e: Event) => this.handleTouchEnd(e, cameraModule, hass)}
        >
          ${cameraContent}
        </div>`
      : cameraContent;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const cameraModule = module as CameraModule;
    const errors = [...baseValidation.errors];

    // Entity validation (unless template mode)
    if (
      !cameraModule.template_mode &&
      (!cameraModule.entity || cameraModule.entity.trim() === '')
    ) {
      errors.push('Camera entity is required when not using template mode');
    }

    // Template validation
    if (
      cameraModule.template_mode &&
      (!cameraModule.template || cameraModule.template.trim() === '')
    ) {
      errors.push('Template code is required when template mode is enabled');
    }

    // Refresh interval validation
    if (cameraModule.auto_refresh !== false && cameraModule.refresh_interval) {
      if (cameraModule.refresh_interval < 5 || cameraModule.refresh_interval > 300) {
        errors.push('Refresh interval must be between 5 and 300 seconds');
      }
    }

    // Border radius validation
    if (cameraModule.border_radius && isNaN(Number(cameraModule.border_radius))) {
      errors.push('Border radius must be a number');
    }

    // Action validation
    if (cameraModule.tap_action && cameraModule.tap_action.action) {
      errors.push(...this.validateAction(cameraModule.tap_action));
    }
    if (cameraModule.hold_action && cameraModule.hold_action.action) {
      errors.push(...this.validateAction(cameraModule.hold_action));
    }
    if (cameraModule.double_tap_action && cameraModule.double_tap_action.action) {
      errors.push(...this.validateAction(cameraModule.double_tap_action));
    }

    return { valid: errors.length === 0, errors };
  }

  // Event Handling Methods
  private handleClick(event: Event, module: CameraModule, hass: HomeAssistant): void {
    event.preventDefault();
    if (this.clickTimeout) clearTimeout(this.clickTimeout);

    this.clickTimeout = setTimeout(() => {
      this.handleTapAction(event, module, hass);
    }, 300);
  }

  private handleDoubleClick(event: Event, module: CameraModule, hass: HomeAssistant): void {
    event.preventDefault();
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }
    this.handleDoubleAction(event, module, hass);
  }

  private handleMouseDown(event: Event, module: CameraModule, hass: HomeAssistant): void {
    this.isHolding = false;
    this.holdTimeout = setTimeout(() => {
      this.isHolding = true;
      this.handleHoldAction(event, module, hass);
    }, 500);
  }

  private handleMouseUp(event: Event, module: CameraModule, hass: HomeAssistant): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
  }

  private handleMouseLeave(event: Event, module: CameraModule, hass: HomeAssistant): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
    this.isHolding = false;
  }

  private handleTouchStart(event: Event, module: CameraModule, hass: HomeAssistant): void {
    this.handleMouseDown(event, module, hass);
  }

  private handleTouchEnd(event: Event, module: CameraModule, hass: HomeAssistant): void {
    this.handleMouseUp(event, module, hass);
  }

  private handleTapAction(event: Event, module: CameraModule, hass: HomeAssistant): void {
    if (this.isHolding) return;

    if (module.tap_action) {
      // For camera modules, default to more-info if action is 'default'
      const action =
        module.tap_action.action === 'default'
          ? { action: 'more-info', entity: module.entity }
          : module.tap_action;
      UltraLinkComponent.handleAction(action as any, hass, event.target as HTMLElement);
    } else if (module.entity) {
      // Default action for cameras: show more-info
      UltraLinkComponent.handleAction(
        { action: 'more-info', entity: module.entity } as any,
        hass,
        event.target as HTMLElement
      );
    }
  }

  private handleHoldAction(event: Event, module: CameraModule, hass: HomeAssistant): void {
    if (module.hold_action && module.hold_action.action !== 'nothing') {
      UltraLinkComponent.handleAction(module.hold_action as any, hass, event.target as HTMLElement);
    }
  }

  private handleDoubleAction(event: Event, module: CameraModule, hass: HomeAssistant): void {
    if (module.double_tap_action && module.double_tap_action.action !== 'nothing') {
      UltraLinkComponent.handleAction(
        module.double_tap_action as any,
        hass,
        event.target as HTMLElement
      );
    }
  }

  // Helper Methods
  private hasActiveLink(module: CameraModule): boolean {
    const hasTapAction = module.tap_action && module.tap_action.action !== 'nothing';
    const hasHoldAction = module.hold_action && module.hold_action.action !== 'nothing';
    const hasDoubleAction =
      module.double_tap_action && module.double_tap_action.action !== 'nothing';

    return hasTapAction || hasHoldAction || hasDoubleAction || !!module.entity; // Default tap for camera
  }

  private refreshCamera(entity: string, hass: HomeAssistant): void {
    console.log('🎥 Manual refresh triggered for camera:', entity);

    // Try to refresh the hui-image component
    const huiImageElements = document.querySelectorAll(`hui-image[class*="camera-image"]`);
    huiImageElements.forEach((element: any) => {
      if (element.cameraImage === entity && element.hass === hass) {
        console.log('🎥 Refreshing hui-image component');
        // Force a refresh by updating the hass object reference
        element.hass = { ...hass };
        element.requestUpdate();
      }
    });
  }

  private getCameraImageUrl(entity: string, hass: HomeAssistant, quality?: string): string {
    if (!entity || !hass) {
      console.log('🎥 Camera URL: Missing entity or hass', { entity, hasHass: !!hass });
      return '';
    }

    // Use HA's native camera image URL generation - same method as picture-glance card
    // This is the proven approach that works with all camera types including RTSP
    let finalUrl: string;

    try {
      // Method 1: Try to use HA's internal camera URL helper (if available)
      if ((hass as any).hassUrl) {
        const hassUrl = (hass as any).hassUrl();
        finalUrl = `${hassUrl}/api/camera_proxy/${entity}`;
      } else {
        // Method 2: Use relative URL (most common case)
        finalUrl = `/api/camera_proxy/${entity}`;
      }

      // Add cache busting parameter (same as picture-glance)
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl += `${separator}token=${Date.now()}`;
    } catch (error) {
      console.warn('🎥 Error generating camera URL:', error);
      // Fallback to basic URL
      finalUrl = `/api/camera_proxy/${entity}?token=${Date.now()}`;
    }

    console.log('🎥 Camera URL (HA native method):', {
      entity,
      finalUrl,
      cameraState: hass.states[entity]?.state,
      supportedFeatures: hass.states[entity]?.attributes?.supported_features,
    });

    return finalUrl;
  }

  private async getCameraImageBlob(
    entity: string,
    hass: HomeAssistant,
    quality?: string
  ): Promise<string> {
    try {
      console.log('🎥 Trying authenticated blob approach for camera:', entity);

      // Simple approach: use the same URL structure as HA's native camera interface
      const timestamp = Date.now();
      const url = `/api/camera_proxy/${entity}?t=${timestamp}`;

      // Try to fetch with same credentials as HA interface
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Include all credentials (cookies, etc.)
        headers: {
          Accept: 'image/*',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) {
        console.log(`🎥 Blob fetch failed with status ${response.status}:`, response.statusText);
        return await this.getCameraImageViaWebSocket(entity, hass);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      console.log('🎥 Blob URL created successfully:', {
        blobUrl,
        blobSize: blob.size,
        blobType: blob.type,
      });

      return blobUrl;
    } catch (error) {
      console.error('🎥 Blob method failed:', error);
      return await this.getCameraImageViaWebSocket(entity, hass);
    }
  }

  private async getCameraImageViaWebSocket(entity: string, hass: HomeAssistant): Promise<string> {
    try {
      console.log('🎥 Attempting WebSocket camera image fetch');

      // Use Home Assistant's connection to get camera thumbnail
      const connection = (hass as any).connection;
      if (!connection) {
        throw new Error('No WebSocket connection available');
      }

      const result = await connection.sendMessagePromise({
        type: 'camera_thumbnail',
        entity_id: entity,
      });

      if (result && result.content) {
        // Convert base64 to blob URL
        const byteCharacters = atob(result.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const blobUrl = URL.createObjectURL(blob);

        console.log('🎥 WebSocket camera image successful:', {
          blobUrl,
          blobSize: blob.size,
        });

        return blobUrl;
      }

      throw new Error('No image content received from WebSocket');
    } catch (error) {
      console.error('🎥 WebSocket camera image failed:', error);
      return '';
    }
  }

  private getAspectRatioStyle(aspectRatio?: string): string {
    if (!aspectRatio || aspectRatio === 'auto') {
      return 'width: 100%;';
    }

    const ratioMap: Record<string, string> = {
      '16:9': '56.25%', // 9/16 * 100
      '4:3': '75%', // 3/4 * 100
      '1:1': '100%', // 1/1 * 100
    };

    const paddingBottom = ratioMap[aspectRatio] || '56.25%';

    return `
      position: relative;
      width: 100%;
      padding-bottom: ${paddingBottom};
      overflow: hidden;
    `;
  }

  private async handleImageError(event: Event, module: CameraModule): Promise<void> {
    const img = event.target as HTMLImageElement;
    console.log('🎥 Camera Image Error:', {
      entity: module.entity,
      originalSrc: img.src,
      error: event,
    });

    // Only try blob approach once (avoid infinite loops)
    if (!img.dataset.triedBlob && module.entity) {
      img.dataset.triedBlob = 'true';
      console.log('🎥 Trying authenticated blob approach...');

      try {
        // Get hass instance from various possible sources
        const hass =
          (document.querySelector('home-assistant') as any)?.hass ||
          (document.querySelector('ha-panel-lovelace') as any)?.hass ||
          (window as any).hassConnection?.hass;

        if (hass) {
          const blobUrl = await this.getCameraImageBlob(module.entity, hass, module.image_quality);

          if (blobUrl) {
            console.log('🎥 Successfully got blob URL, updating image');
            img.src = blobUrl;
            return;
          }
        } else {
          console.log('🎥 Could not find hass instance for blob approach');
        }
      } catch (error) {
        console.error('🎥 Blob approach failed:', error);
      }
    }

    // Fallback to provided fallback image or error display
    if (module.fallback_image) {
      console.log('🎥 Using fallback image');
      img.src = module.fallback_image;
    } else {
      console.log('🎥 No fallback image, showing error message');
      // Hide the image and show unavailable state
      img.style.display = 'none';

      // Try to show an error message with helpful guidance
      const container = img.closest('.camera-image-container');
      if (container) {
        const entityState = module.entity
          ? (document.querySelector('home-assistant') as any)?.hass?.states?.[module.entity]
          : null;
        const cameraType =
          entityState?.attributes?.brand || entityState?.attributes?.model || 'Unknown';

        container.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            background-color: var(--warning-color, #ff9800);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            min-height: 150px;
            border: 1px solid rgba(255,255,255,0.2);
          ">
            <ha-icon icon="mdi:camera-off" style="font-size: 48px; margin-bottom: 12px; opacity: 0.9;"></ha-icon>
            <span style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">Camera Load Failed</span>
            <span style="font-size: 13px; margin-bottom: 8px; opacity: 0.9;">Entity: ${module.entity}</span>
            <span style="font-size: 12px; margin-bottom: 12px; opacity: 0.8;">Camera Type: ${cameraType}</span>
            <div style="font-size: 11px; opacity: 0.8; line-height: 1.4; margin-bottom: 12px;">
              <div style="margin-bottom: 6px;">• Check camera entity is working in HA</div>
              <div style="margin-bottom: 6px;">• Verify RTSP credentials in HA config</div>
              <div>• Try refreshing the browser</div>
            </div>
            <button 
              onclick="window.retryCamera_${module.entity?.replace(/\./g, '_')}"
              style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
              "
              onmouseover="this.style.background='rgba(255,255,255,0.3)'"
              onmouseout="this.style.background='rgba(255,255,255,0.2)'"
            >
              🔄 Retry Camera Load
            </button>
          </div>
        `;

        // Set up the retry function
        if (module.entity) {
          const retryFunctionName = `retryCamera_${module.entity.replace(/\./g, '_')}`;
          (window as any)[retryFunctionName] = async () => {
            console.log('🎥 Manual retry triggered for camera:', module.entity);

            // Get fresh hass instance
            const hass = (document.querySelector('home-assistant') as any)?.hass;
            if (hass) {
              try {
                // Force a new image load with simple URL (same as HA native)
                const newTimestamp = Date.now();
                const newUrl = `/api/camera_proxy/${module.entity}?t=${newTimestamp}`;

                // Create a new image element
                const newImg = document.createElement('img');
                newImg.className = 'camera-image';
                newImg.style.cssText = `
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  object-fit: ${module.image_fit || 'cover'};
                  border-radius: inherit;
                `;

                // Set up new error handler
                newImg.onerror = (e: Event) => this.handleImageError(e, module);

                // On successful load, replace the container content
                newImg.onload = () => {
                  console.log('🎥 Retry successful!');
                  if (container) {
                    container.innerHTML = '';
                    container.appendChild(newImg);
                  }
                };

                // Start loading
                newImg.src = newUrl;

                // Show loading indicator temporarily
                if (container) {
                  container.innerHTML = `
                    <div style="
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-direction: column;
                      background-color: var(--primary-color);
                      color: white;
                      padding: 20px;
                      border-radius: 8px;
                      text-align: center;
                      min-height: 150px;
                    ">
                      <div style="
                        width: 32px;
                        height: 32px;
                        border: 3px solid rgba(255,255,255,0.3);
                        border-top: 3px solid white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 12px;
                      "></div>
                      <span style="font-weight: 500; font-size: 14px;">Retrying Camera Load...</span>
                      <style>
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      </style>
                    </div>
                  `;
                }
              } catch (error) {
                console.error('🎥 Retry failed:', error);
              }
            }
          };
        }
      }
    }
  }

  protected renderConditionalFieldsGroup(title: string, content: TemplateResult): TemplateResult {
    return html`
      <div
        class="conditional-fields-group"
        style="margin-top: 16px; padding: 16px; border-left: 4px solid var(--primary-color); background: rgba(var(--rgb-primary-color), 0.08); border-radius: 0 8px 8px 0;"
      >
        <div
          style="font-weight: 600; color: var(--primary-color); margin-bottom: 12px; font-size: 14px;"
        >
          ${title}
        </div>
        ${content}
      </div>
    `;
  }

  // Style utility methods
  private styleObjectToCss(styles: Record<string, string>): string {
    return Object.entries(styles)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;
    if (/^\d+$/.test(value)) return `${value}px`;
    return value;
  }

  private getPaddingCSS(moduleWithDesign: any): string {
    return moduleWithDesign.padding_top ||
      moduleWithDesign.padding_bottom ||
      moduleWithDesign.padding_left ||
      moduleWithDesign.padding_right
      ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '12px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '12px'}`
      : '8px 12px';
  }

  private getMarginCSS(moduleWithDesign: any): string {
    if (
      moduleWithDesign.margin_top ||
      moduleWithDesign.margin_bottom ||
      moduleWithDesign.margin_left ||
      moduleWithDesign.margin_right
    ) {
      return `${this.addPixelUnit(moduleWithDesign.margin_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_bottom) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_left) || '0px'}`;
    }
    return '0px';
  }

  private getBackgroundCSS(moduleWithDesign: any): string {
    return moduleWithDesign.background_color || 'transparent';
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    if (moduleWithDesign.background_image_type === 'url' && moduleWithDesign.background_image) {
      return `url('${moduleWithDesign.background_image}')`;
    } else if (
      moduleWithDesign.background_image_type === 'entity' &&
      moduleWithDesign.background_image_entity
    ) {
      const entity = hass.states[moduleWithDesign.background_image_entity];
      if (entity) {
        return `url('/api/camera_proxy/${moduleWithDesign.background_image_entity}')`;
      }
    }
    return '';
  }

  private getBorderCSS(moduleWithDesign: any): string {
    if (
      moduleWithDesign.border_width &&
      moduleWithDesign.border_style &&
      moduleWithDesign.border_color
    ) {
      return `${moduleWithDesign.border_width} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color}`;
    }
    return '';
  }

  private validateAction(action: any): string[] {
    const errors: string[] = [];
    if (action.action === 'navigate' && !action.navigation_path) {
      errors.push('Navigation path is required for navigate action');
    }
    if (action.action === 'call-service' && (!action.service || !action.service_data)) {
      errors.push('Service and service data are required for call-service action');
    }
    return errors;
  }

  getStyles(): string {
    return `
      .camera-module-container {
        width: 100%;
        box-sizing: border-box;
      }
      
      .camera-name {
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 8px;
        text-align: center;
      }
      
      .camera-image-container {
        position: relative;
        width: 100%;
        overflow: hidden;
      }
      
      .camera-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      }
      
      .camera-unavailable {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background-color: var(--disabled-color, #f5f5f5);
        color: var(--secondary-text-color);
        min-height: 150px;
      }
      
      .camera-controls {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        gap: 4px;
      }
      
      .camera-control-btn {
        background: rgba(0, 0, 0, 0.6);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .camera-control-btn:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: scale(1.1);
      }
      
      .camera-module-clickable {
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .camera-module-clickable:hover {
        transform: scale(1.02);
      }
      
      .camera-module-clickable:active {
        transform: scale(0.98);
      }

      /* Standard field styling */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: var(--primary-text-color) !important;
        margin-bottom: 4px !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
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

      /* Conditional fields grouping */
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
        transition: all 0.2s ease;
        animation: slideInFromLeft 0.3s ease-out;
      }

      @keyframes slideInFromLeft {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
  }
}
