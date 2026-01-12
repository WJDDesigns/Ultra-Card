import {
  DeviceBreakpoint,
  DEVICE_BREAKPOINTS,
  SharedDesignProperties,
  ResponsiveDesignProperties,
  isResponsiveDesign,
} from '../types';

// Type alias for design config - can be flat or responsive
type DesignConfig = SharedDesignProperties | ResponsiveDesignProperties;

/**
 * Service for handling responsive design functionality.
 * Provides utilities for:
 * - Detecting current device breakpoint
 * - Merging base + device-specific design overrides
 * - Generating responsive CSS with media queries
 * - Managing device-specific property updates
 */
export class ResponsiveDesignService {
  private static instance: ResponsiveDesignService;
  private currentBreakpoint: DeviceBreakpoint = 'desktop';
  private resizeObserver?: ResizeObserver;
  private breakpointListeners: Set<(breakpoint: DeviceBreakpoint) => void> = new Set();

  private constructor() {
    this._initializeBreakpointDetection();
  }

  public static getInstance(): ResponsiveDesignService {
    if (!ResponsiveDesignService.instance) {
      ResponsiveDesignService.instance = new ResponsiveDesignService();
    }
    return ResponsiveDesignService.instance;
  }

  /**
   * Initialize viewport breakpoint detection
   */
  private _initializeBreakpointDetection(): void {
    if (typeof window !== 'undefined') {
      this._updateCurrentBreakpoint();
      window.addEventListener('resize', () => this._updateCurrentBreakpoint());
    }
  }

  /**
   * Update current breakpoint based on window width
   */
  private _updateCurrentBreakpoint(): void {
    const width = window.innerWidth;
    const newBreakpoint = this._getBreakpointFromWidth(width);
    
    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      // Notify all listeners
      this.breakpointListeners.forEach(listener => listener(newBreakpoint));
    }
  }

  /**
   * Determine breakpoint from viewport width
   */
  private _getBreakpointFromWidth(width: number): DeviceBreakpoint {
    if (width >= DEVICE_BREAKPOINTS.desktop.minWidth) {
      return 'desktop';
    } else if (width >= DEVICE_BREAKPOINTS.laptop.minWidth) {
      return 'laptop';
    } else if (width >= DEVICE_BREAKPOINTS.tablet.minWidth) {
      return 'tablet';
    } else {
      return 'mobile';
    }
  }

  /**
   * Get the current device breakpoint based on viewport
   */
  public getCurrentBreakpoint(): DeviceBreakpoint {
    return this.currentBreakpoint;
  }

  /**
   * Subscribe to breakpoint changes
   */
  public onBreakpointChange(callback: (breakpoint: DeviceBreakpoint) => void): () => void {
    this.breakpointListeners.add(callback);
    return () => this.breakpointListeners.delete(callback);
  }

  /**
   * Normalize design config to responsive format.
   * Converts flat SharedDesignProperties to ResponsiveDesignProperties with base.
   * PRESERVES root-level properties for backwards compatibility.
   */
  public normalizeDesign(design: DesignConfig | undefined): ResponsiveDesignProperties {
    if (!design) {
      return { base: {} };
    }
    
    if (isResponsiveDesign(design)) {
      return design;
    }
    
    // Flat design - keep root-level properties AND wrap in base for backwards compatibility
    // This ensures both design.border_radius AND design.base.border_radius work
    const flatDesign = design as SharedDesignProperties;
    return { ...flatDesign, base: flatDesign };
  }

  /**
   * Get effective design properties for a specific breakpoint.
   * Merges: top-level properties → base properties → device-specific overrides.
   * This ensures backward compatibility with flat design objects while supporting responsive overrides.
   */
  public getEffectiveDesign(
    design: DesignConfig | undefined,
    breakpoint: DeviceBreakpoint
  ): SharedDesignProperties {
    if (!design) return {};
    
    const normalized = this.normalizeDesign(design);
    const base = normalized.base || {};
    const deviceOverrides = normalized[breakpoint] || {};
    
    // Extract top-level design properties (excluding responsive keys)
    // These are for backward compatibility with flat design objects
    const responsiveKeys = ['base', 'desktop', 'laptop', 'tablet', 'mobile', '_effectiveBreakpoint', '_effectiveDesign'];
    const topLevelProps: Record<string, any> = {};
    for (const [key, value] of Object.entries(design)) {
      if (!responsiveKeys.includes(key) && value !== undefined) {
        topLevelProps[key] = value;
      }
    }
    
    // Merge: top-level → base → device-specific (later values win)
    return { ...topLevelProps, ...base, ...deviceOverrides };
  }

  /**
   * Get the design properties for a specific device (without base merge).
   * Used in editor to show device-specific values only.
   */
  public getDeviceDesign(
    design: DesignConfig | undefined,
    device: DeviceBreakpoint | 'base'
  ): Partial<SharedDesignProperties> {
    const normalized = this.normalizeDesign(design);
    
    if (device === 'base') {
      return normalized.base || {};
    }
    
    return normalized[device] || {};
  }

  /**
   * Check if a device has any custom override values
   */
  public hasDeviceOverrides(design: DesignConfig | undefined, device: DeviceBreakpoint): boolean {
    const normalized = this.normalizeDesign(design);
    const deviceDesign = normalized[device];
    
    if (!deviceDesign) return false;
    
    // Check if there are any non-empty values
    return Object.entries(deviceDesign).some(([, value]) => {
      return value !== undefined && value !== null && value !== '';
    });
  }

  /**
   * Check which properties have device-specific overrides
   */
  public getDeviceOverrideKeys(
    design: DesignConfig | undefined,
    device: DeviceBreakpoint
  ): string[] {
    const normalized = this.normalizeDesign(design);
    const deviceDesign = normalized[device];
    
    if (!deviceDesign) return [];
    
    return Object.entries(deviceDesign)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key]) => key);
  }

  /**
   * Set a design property for a specific device.
   * Returns a new design object (immutable update).
   */
  public setDeviceProperty(
    design: DesignConfig | undefined,
    device: DeviceBreakpoint | 'base',
    property: keyof SharedDesignProperties,
    value: any
  ): ResponsiveDesignProperties {
    const normalized = this.normalizeDesign(design);
    
    const targetKey = device === 'base' ? 'base' : device;
    const currentDeviceDesign = normalized[targetKey] || {};
    
    // Create new device design with updated property
    const updatedDeviceDesign: Partial<SharedDesignProperties> = {
      ...currentDeviceDesign,
      [property]: value,
    };
    
    // Remove empty values
    if (value === '' || value === undefined || value === null) {
      delete updatedDeviceDesign[property];
    }
    
    return {
      ...normalized,
      [targetKey]: updatedDeviceDesign,
    };
  }

  /**
   * Remove a device-specific property override.
   * Returns a new design object (immutable update).
   */
  public removeDeviceProperty(
    design: DesignConfig | undefined,
    device: DeviceBreakpoint,
    property: keyof SharedDesignProperties
  ): ResponsiveDesignProperties {
    const normalized = this.normalizeDesign(design);
    const deviceDesign = normalized[device];
    
    if (!deviceDesign) return normalized;
    
    const { [property]: _, ...rest } = deviceDesign;
    
    return {
      ...normalized,
      [device]: Object.keys(rest).length > 0 ? rest : undefined,
    };
  }

  /**
   * Clear all overrides for a specific device.
   * Returns a new design object (immutable update).
   */
  public clearDeviceOverrides(
    design: DesignConfig | undefined,
    device: DeviceBreakpoint
  ): ResponsiveDesignProperties {
    const normalized = this.normalizeDesign(design);
    
    const { [device]: _, ...rest } = normalized;
    
    return rest as ResponsiveDesignProperties;
  }

  /**
   * Generate CSS with media queries for responsive design.
   * Device-specific overrides use !important to override inline styles.
   * 
   * Text properties (color, font-size, etc.) target ALL descendants to reach nested text elements.
   * Box properties (background, border, etc.) target only direct children (the module container).
   */
  public generateResponsiveCSS(
    elementSelector: string,
    design: DesignConfig | undefined
  ): string {
    const normalized = this.normalizeDesign(design);
    const cssRules: string[] = [];

    // Two selectors for different property types:
    // - Box properties: target direct children (module container with inline styles)
    // - Text properties: target ALL descendants (text is in deeply nested elements)
    const boxSelector = `${elementSelector} > *`;
    const textSelector = `${elementSelector} *`;

    // Helper to generate rules for a device's design
    const generateDeviceRules = (deviceDesign: Partial<SharedDesignProperties>, useImportant: boolean, mediaQuery?: string) => {
      const textCSS = this._generateTextCSSProperties(deviceDesign, useImportant);
      const boxCSS = this._generateBoxCSSProperties(deviceDesign, useImportant);
      
      const rules: string[] = [];
      
      if (textCSS) {
        const textRule = `${textSelector} { ${textCSS} }`;
        rules.push(mediaQuery ? `${mediaQuery} { ${textRule} }` : textRule);
      }
      
      if (boxCSS) {
        const boxRule = `${boxSelector} { ${boxCSS} }`;
        rules.push(mediaQuery ? `${mediaQuery} { ${boxRule} }` : boxRule);
      }
      
      return rules;
    };

    // Base styles (no media query - default/fallback) - no !important needed
    if (normalized.base && Object.keys(normalized.base).length > 0) {
      cssRules.push(...generateDeviceRules(normalized.base, false));
    }

    // Desktop overrides (≥1381px) - use !important to override inline styles
    if (normalized.desktop && Object.keys(normalized.desktop).length > 0) {
      cssRules.push(...generateDeviceRules(normalized.desktop, true, `@media (min-width: ${DEVICE_BREAKPOINTS.desktop.minWidth}px)`));
    }

    // Laptop overrides (1025px - 1380px) - use !important to override inline styles
    if (normalized.laptop && Object.keys(normalized.laptop).length > 0) {
      cssRules.push(...generateDeviceRules(normalized.laptop, true, `@media (min-width: ${DEVICE_BREAKPOINTS.laptop.minWidth}px) and (max-width: ${DEVICE_BREAKPOINTS.laptop.maxWidth}px)`));
    }

    // Tablet overrides (601px - 1024px) - use !important to override inline styles
    if (normalized.tablet && Object.keys(normalized.tablet).length > 0) {
      cssRules.push(...generateDeviceRules(normalized.tablet, true, `@media (min-width: ${DEVICE_BREAKPOINTS.tablet.minWidth}px) and (max-width: ${DEVICE_BREAKPOINTS.tablet.maxWidth}px)`));
    }

    // Mobile overrides (≤600px) - use !important to override inline styles
    if (normalized.mobile && Object.keys(normalized.mobile).length > 0) {
      cssRules.push(...generateDeviceRules(normalized.mobile, true, `@media (max-width: ${DEVICE_BREAKPOINTS.mobile.maxWidth}px)`));
    }

    return cssRules.join('\n');
  }

  /**
   * Generate CSS for hiding elements on specific devices
   */
  public generateHideOnDevicesCSS(
    elementSelector: string,
    hiddenOnDevices: DeviceBreakpoint[] | undefined
  ): string {
    if (!hiddenOnDevices || hiddenOnDevices.length === 0) return '';

    const cssRules: string[] = [];

    if (hiddenOnDevices.includes('desktop')) {
      cssRules.push(`@media (min-width: ${DEVICE_BREAKPOINTS.desktop.minWidth}px) { ${elementSelector} { display: none !important; } }`);
    }

    if (hiddenOnDevices.includes('laptop')) {
      cssRules.push(`@media (min-width: ${DEVICE_BREAKPOINTS.laptop.minWidth}px) and (max-width: ${DEVICE_BREAKPOINTS.laptop.maxWidth}px) { ${elementSelector} { display: none !important; } }`);
    }

    if (hiddenOnDevices.includes('tablet')) {
      cssRules.push(`@media (min-width: ${DEVICE_BREAKPOINTS.tablet.minWidth}px) and (max-width: ${DEVICE_BREAKPOINTS.tablet.maxWidth}px) { ${elementSelector} { display: none !important; } }`);
    }

    if (hiddenOnDevices.includes('mobile')) {
      cssRules.push(`@media (max-width: ${DEVICE_BREAKPOINTS.mobile.maxWidth}px) { ${elementSelector} { display: none !important; } }`);
    }

    return cssRules.join('\n');
  }

  /**
   * Generate CSS for TEXT properties only.
   * These need to target ALL descendants because text is in deeply nested elements.
   * Includes: color, font-*, text-*, line-height, letter-spacing, white-space
   */
  private _generateTextCSSProperties(design: Partial<SharedDesignProperties>, useImportant: boolean = false): string {
    const cssProps: string[] = [];
    const imp = useImportant ? ' !important' : '';

    // Text color
    if (design.color) cssProps.push(`color: ${design.color}${imp}`);
    
    // Text alignment and transform
    if (design.text_align) cssProps.push(`text-align: ${design.text_align}${imp}`);
    if (design.text_transform) cssProps.push(`text-transform: ${design.text_transform}${imp}`);
    
    // Font properties
    if (design.font_size) cssProps.push(`font-size: ${design.font_size}${imp}`);
    if (design.font_family) cssProps.push(`font-family: ${design.font_family}${imp}`);
    if (design.font_weight) cssProps.push(`font-weight: ${design.font_weight}${imp}`);
    if (design.font_style) cssProps.push(`font-style: ${design.font_style}${imp}`);
    
    // Line/letter spacing
    if (design.line_height) cssProps.push(`line-height: ${design.line_height}${imp}`);
    if (design.letter_spacing) cssProps.push(`letter-spacing: ${design.letter_spacing}${imp}`);
    if (design.white_space) cssProps.push(`white-space: ${design.white_space}${imp}`);

    // Text shadow
    if (design.text_shadow_h || design.text_shadow_v || design.text_shadow_blur) {
      const h = design.text_shadow_h || '0';
      const v = design.text_shadow_v || '0';
      const blur = design.text_shadow_blur || '0';
      const color = design.text_shadow_color || 'rgba(0,0,0,0.5)';
      cssProps.push(`text-shadow: ${h}px ${v}px ${blur}px ${color}${imp}`);
    }

    return cssProps.join('; ');
  }

  /**
   * Generate CSS for BOX properties only.
   * These apply to the container element (direct child of wrapper).
   * Includes: background-*, border-*, padding-*, margin-*, size, position, box-shadow
   */
  private _generateBoxCSSProperties(design: Partial<SharedDesignProperties>, useImportant: boolean = false): string {
    const cssProps: string[] = [];
    const imp = useImportant ? ' !important' : '';

    // Background properties
    if (design.background_color) cssProps.push(`background-color: ${design.background_color}${imp}`);
    if (design.background_image) cssProps.push(`background-image: url(${design.background_image})${imp}`);
    if (design.background_repeat) cssProps.push(`background-repeat: ${design.background_repeat}${imp}`);
    if (design.background_position) cssProps.push(`background-position: ${design.background_position}${imp}`);
    if (design.background_size) cssProps.push(`background-size: ${design.background_size}${imp}`);
    if (design.backdrop_filter) cssProps.push(`backdrop-filter: ${design.backdrop_filter}${imp}`);

    // Size properties
    if (design.width) cssProps.push(`width: ${design.width}${imp}`);
    if (design.height) cssProps.push(`height: ${design.height}${imp}`);
    if (design.max_width) cssProps.push(`max-width: ${design.max_width}${imp}`);
    if (design.max_height) cssProps.push(`max-height: ${design.max_height}${imp}`);
    if (design.min_width) cssProps.push(`min-width: ${design.min_width}${imp}`);
    if (design.min_height) cssProps.push(`min-height: ${design.min_height}${imp}`);

    // Spacing properties
    if (design.margin_top) cssProps.push(`margin-top: ${design.margin_top}${imp}`);
    if (design.margin_bottom) cssProps.push(`margin-bottom: ${design.margin_bottom}${imp}`);
    if (design.margin_left) cssProps.push(`margin-left: ${design.margin_left}${imp}`);
    if (design.margin_right) cssProps.push(`margin-right: ${design.margin_right}${imp}`);
    if (design.padding_top) cssProps.push(`padding-top: ${design.padding_top}${imp}`);
    if (design.padding_bottom) cssProps.push(`padding-bottom: ${design.padding_bottom}${imp}`);
    if (design.padding_left) cssProps.push(`padding-left: ${design.padding_left}${imp}`);
    if (design.padding_right) cssProps.push(`padding-right: ${design.padding_right}${imp}`);

    // Border properties
    if (design.border_radius) cssProps.push(`border-radius: ${design.border_radius}${imp}`);
    if (design.border_style && design.border_style !== 'none') {
      cssProps.push(`border-style: ${design.border_style}${imp}`);
    }
    if (design.border_width) cssProps.push(`border-width: ${design.border_width}${imp}`);
    if (design.border_color) cssProps.push(`border-color: ${design.border_color}${imp}`);

    // Position properties
    if (design.position) cssProps.push(`position: ${design.position}${imp}`);
    if (design.top) cssProps.push(`top: ${design.top}${imp}`);
    if (design.bottom) cssProps.push(`bottom: ${design.bottom}${imp}`);
    if (design.left) cssProps.push(`left: ${design.left}${imp}`);
    if (design.right) cssProps.push(`right: ${design.right}${imp}`);
    if (design.z_index) cssProps.push(`z-index: ${design.z_index}${imp}`);

    // Box shadow
    if (design.box_shadow_h || design.box_shadow_v || design.box_shadow_blur || design.box_shadow_spread) {
      const h = design.box_shadow_h || '0';
      const v = design.box_shadow_v || '0';
      const blur = design.box_shadow_blur || '0';
      const spread = design.box_shadow_spread || '0';
      const color = design.box_shadow_color || 'rgba(0,0,0,0.2)';
      cssProps.push(`box-shadow: ${h}px ${v}px ${blur}px ${spread}px ${color}${imp}`);
    }

    // Other box properties
    if (design.overflow) cssProps.push(`overflow: ${design.overflow}${imp}`);
    if (design.clip_path) cssProps.push(`clip-path: ${design.clip_path}${imp}`);

    return cssProps.join('; ');
  }

  /**
   * Get summary of which devices have overrides (for display in editor)
   */
  public getOverrideSummary(design: DesignConfig | undefined): {
    desktop: boolean;
    laptop: boolean;
    tablet: boolean;
    mobile: boolean;
  } {
    return {
      desktop: this.hasDeviceOverrides(design, 'desktop'),
      laptop: this.hasDeviceOverrides(design, 'laptop'),
      tablet: this.hasDeviceOverrides(design, 'tablet'),
      mobile: this.hasDeviceOverrides(design, 'mobile'),
    };
  }

  /**
   * Check if design has any responsive overrides at all
   */
  public hasAnyResponsiveOverrides(design: DesignConfig | undefined): boolean {
    const summary = this.getOverrideSummary(design);
    return summary.desktop || summary.laptop || summary.tablet || summary.mobile;
  }
}

// Export singleton instance
export const responsiveDesignService = ResponsiveDesignService.getInstance();
