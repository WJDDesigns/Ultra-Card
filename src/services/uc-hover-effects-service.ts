import type { HoverEffectConfig } from '../types';

/**
 * Service for generating CSS hover effects based on configuration
 * Inspired by Hover.css library with custom implementations
 */
export class UcHoverEffectsService {
  /**
   * Generate CSS class name for hover effect
   */
  static getHoverEffectClass(config?: HoverEffectConfig): string {
    if (!config || !config.effect || config.effect === 'none') {
      return '';
    }

    const intensity = config.intensity || 'normal';
    return `uc-hover-${config.effect}-${intensity}`;
  }

  /**
   * Generate CSS styles for hover effects
   */
  static generateHoverEffectStyles(config?: HoverEffectConfig): string {
    if (!config || !config.effect || config.effect === 'none') {
      return '';
    }

    const duration = config.duration || 300;
    const timing = config.timing || 'ease';
    const intensity = config.intensity || 'normal';
    const className = this.getHoverEffectClass(config);

    let styles = `
      .${className} {
        transition: all ${duration}ms ${timing};
        cursor: pointer;
      }
      .${className}:hover {
    `;

    // Generate effect-specific styles
    switch (config.effect) {
      case 'highlight':
        const highlightColor = config.highlight_color || 'rgba(var(--rgb-primary-color), 0.2)';
        styles += `
          background-color: ${highlightColor} !important;
        `;
        break;

      case 'outline':
        const outlineColor = config.outline_color || 'var(--primary-color)';
        const outlineWidth = config.outline_width || 2;
        styles += `
          outline: ${outlineWidth}px solid ${outlineColor};
          outline-offset: 2px;
        `;
        break;

      case 'grow':
        const growScale = this.getScaleValue('grow', intensity);
        styles += `
          transform: scale(${growScale});
        `;
        break;

      case 'shrink':
        const shrinkScale = this.getScaleValue('shrink', intensity);
        styles += `
          transform: scale(${shrinkScale});
        `;
        break;

      case 'pulse':
        // Pulse effect using animation on hover
        const pulseClassName = `uc-pulse-${intensity}`;
        styles += `
          animation: ${pulseClassName} ${duration}ms ${timing} infinite;
        `;
        break;

      case 'bounce':
        // Bounce effect using animation on hover
        const bounceClassName = `uc-bounce-${intensity}`;
        styles += `
          animation: ${bounceClassName} ${duration}ms ${timing};
        `;
        break;

      case 'float':
        // Float effect - smooth upward movement
        const floatDistance = this.getFloatDistance(intensity);
        styles += `
          transform: translateY(-${floatDistance}px);
        `;
        break;

      case 'glow':
        const glowColor = config.glow_color || 'var(--primary-color)';
        const glowIntensity = this.getGlowIntensity(intensity);
        styles += `
          box-shadow: 0 0 ${glowIntensity}px ${glowColor};
        `;
        break;

      case 'shadow':
        const shadowColor = config.shadow_color || 'rgba(0, 0, 0, 0.3)';
        const shadowIntensity = this.getShadowIntensity(intensity);
        styles += `
          box-shadow: 0 ${shadowIntensity}px ${shadowIntensity * 2}px ${shadowColor};
        `;
        break;

      case 'rotate':
        const rotateDegrees = config.rotate_degrees || this.getRotateDegrees(intensity);
        styles += `
          transform: rotate(${rotateDegrees}deg);
        `;
        break;

      case 'skew':
        const skewValue = this.getSkewValue(intensity);
        styles += `
          transform: skew(${skewValue}deg, ${skewValue}deg);
        `;
        break;

      case 'wobble':
        // Wobble effect using animation on hover
        const wobbleClassName = `uc-wobble-${intensity}`;
        styles += `
          animation: ${wobbleClassName} ${duration}ms ${timing};
        `;
        break;

      case 'buzz':
        // Buzz effect using animation on hover
        const buzzClassName = `uc-buzz-${intensity}`;
        styles += `
          animation: ${buzzClassName} ${duration}ms ${timing};
        `;
        break;

      case 'fade':
        const fadeOpacity = this.getFadeOpacity(intensity);
        styles += `
          opacity: ${fadeOpacity};
        `;
        break;
    }

    styles += `
      }
    `;

    return styles;
  }

  /**
   * Generate all hover effect styles for injection into the document
   */
  static generateAllHoverEffectStyles(): string {
    const effects = [
      'highlight',
      'outline',
      'grow',
      'shrink',
      'pulse',
      'bounce',
      'float',
      'glow',
      'shadow',
      'rotate',
      'skew',
      'wobble',
      'buzz',
      'fade',
    ];
    const intensities = ['subtle', 'normal', 'strong'];
    let allStyles = '';

    // First, generate all keyframes
    allStyles += this.generateAllKeyframes();

    // Then generate hover effect styles
    effects.forEach(effect => {
      intensities.forEach(intensity => {
        const config: HoverEffectConfig = {
          effect: effect as any,
          intensity: intensity as any,
          duration: 300,
          timing: 'ease',
        };
        allStyles += this.generateHoverEffectStyles(config);
      });
    });

    return allStyles;
  }

  /**
   * Generate all keyframes needed for animated effects
   */
  private static generateAllKeyframes(): string {
    const intensities = ['subtle', 'normal', 'strong'];
    let keyframes = '';

    intensities.forEach(intensity => {
      // Pulse keyframes
      keyframes += this.generatePulseKeyframes(`uc-pulse-${intensity}`, intensity);

      // Bounce keyframes
      keyframes += this.generateBounceKeyframes(`uc-bounce-${intensity}`, intensity);

      // Wobble keyframes
      keyframes += this.generateWobbleKeyframes(`uc-wobble-${intensity}`, intensity);

      // Buzz keyframes
      keyframes += this.generateBuzzKeyframes(`uc-buzz-${intensity}`, intensity);
    });

    return keyframes;
  }

  // Helper methods for intensity-based values
  private static getScaleValue(type: 'grow' | 'shrink', intensity: string): number {
    const values = {
      grow: { subtle: 1.02, normal: 1.05, strong: 1.1 },
      shrink: { subtle: 0.98, normal: 0.95, strong: 0.9 },
    };
    return values[type][intensity as keyof (typeof values)[typeof type]] || values[type].normal;
  }

  private static getBounceDistance(intensity: string): number {
    const values = { subtle: 2, normal: 4, strong: 8 };
    return values[intensity as keyof typeof values] || values.normal;
  }

  private static getFloatDistance(intensity: string): number {
    const values = { subtle: 2, normal: 4, strong: 8 };
    return values[intensity as keyof typeof values] || values.normal;
  }

  private static getGlowIntensity(intensity: string): number {
    const values = { subtle: 5, normal: 10, strong: 20 };
    return values[intensity as keyof typeof values] || values.normal;
  }

  private static getShadowIntensity(intensity: string): number {
    const values = { subtle: 2, normal: 4, strong: 8 };
    return values[intensity as keyof typeof values] || values.normal;
  }

  private static getRotateDegrees(intensity: string): number {
    const values = { subtle: 2, normal: 5, strong: 10 };
    return values[intensity as keyof typeof values] || values.normal;
  }

  private static getSkewValue(intensity: string): number {
    const values = { subtle: 1, normal: 2, strong: 4 };
    return values[intensity as keyof typeof values] || values.normal;
  }

  private static getFadeOpacity(intensity: string): number {
    const values = { subtle: 0.8, normal: 0.6, strong: 0.4 };
    return values[intensity as keyof typeof values] || values.normal;
  }

  // Keyframe generation methods
  private static generatePulseKeyframes(className: string, intensity: string): string {
    const scaleValue = this.getScaleValue('grow', intensity);
    return `
      @keyframes ${className} {
        0% { transform: scale(1); }
        50% { transform: scale(${scaleValue}); }
        100% { transform: scale(1); }
      }
    `;
  }

  private static generateBounceKeyframes(className: string, intensity: string): string {
    const bounceDistance = this.getBounceDistance(intensity);
    return `
      @keyframes ${className} {
        0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
        40%, 43% { transform: translateY(-${bounceDistance}px); }
        70% { transform: translateY(-${bounceDistance / 2}px); }
        90% { transform: translateY(-${bounceDistance / 4}px); }
      }
    `;
  }

  private static generateWobbleKeyframes(className: string, intensity: string): string {
    const skewValue = this.getSkewValue(intensity);
    return `
      @keyframes ${className} {
        16.65% { transform: translateX(-${skewValue}px) rotate(-${skewValue}deg); }
        33.3% { transform: translateX(${skewValue / 2}px) rotate(${skewValue / 2}deg); }
        49.95% { transform: translateX(-${skewValue / 3}px) rotate(-${skewValue / 3}deg); }
        66.6% { transform: translateX(${skewValue / 4}px) rotate(${skewValue / 4}deg); }
        83.25% { transform: translateX(-${skewValue / 5}px) rotate(-${skewValue / 5}deg); }
        100% { transform: translateX(0) rotate(0); }
      }
    `;
  }

  private static generateBuzzKeyframes(className: string, intensity: string): string {
    const buzzValue = this.getSkewValue(intensity);
    return `
      @keyframes ${className} {
        10% { transform: translateX(-${buzzValue}px) rotate(-${buzzValue}deg); }
        20% { transform: translateX(${buzzValue}px) rotate(${buzzValue}deg); }
        30% { transform: translateX(-${buzzValue}px) rotate(-${buzzValue}deg); }
        40% { transform: translateX(${buzzValue}px) rotate(${buzzValue}deg); }
        50% { transform: translateX(-${buzzValue}px) rotate(-${buzzValue}deg); }
        60% { transform: translateX(${buzzValue}px) rotate(${buzzValue}deg); }
        70% { transform: translateX(-${buzzValue}px) rotate(-${buzzValue}deg); }
        80% { transform: translateX(${buzzValue}px) rotate(${buzzValue}deg); }
        90% { transform: translateX(-${buzzValue}px) rotate(-${buzzValue}deg); }
        100% { transform: translateX(0) rotate(0); }
      }
    `;
  }

  /**
   * Inject hover effect styles into a shadow root or document head
   */
  static injectHoverEffectStyles(shadowRoot?: ShadowRoot, configs?: HoverEffectConfig[]): void {
    const styleId = 'uc-hover-effects-styles';

    if (shadowRoot) {
      // Inject into shadow root
      let styleElement = shadowRoot.querySelector(`#${styleId}`) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        shadowRoot.appendChild(styleElement);
      }

      // Generate styles based on provided configs or use defaults
      if (configs && configs.length > 0) {
        styleElement.textContent = this.generateDynamicHoverEffectStyles(configs);
      } else {
        styleElement.textContent = this.generateAllHoverEffectStyles();
      }
    } else {
      // Fallback to document head
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      // Generate styles based on provided configs or use defaults
      if (configs && configs.length > 0) {
        styleElement.textContent = this.generateDynamicHoverEffectStyles(configs);
      } else {
        styleElement.textContent = this.generateAllHoverEffectStyles();
      }
    }
  }

  /**
   * Generate hover effect styles for specific configurations
   */
  static generateDynamicHoverEffectStyles(configs: HoverEffectConfig[]): string {
    let allStyles = '';

    // First, generate all keyframes (always needed)
    allStyles += this.generateAllKeyframes();

    // Then generate styles for each specific configuration
    configs.forEach(config => {
      if (config && config.effect && config.effect !== 'none') {
        allStyles += this.generateHoverEffectStyles(config);
      }
    });

    // Also include default styles for basic effects
    allStyles += this.generateAllHoverEffectStyles();

    return allStyles;
  }

  /**
   * Update hover effect styles in existing shadow root with new configurations
   */
  static updateHoverEffectStyles(shadowRoot: ShadowRoot, configs: HoverEffectConfig[]): void {
    const styleId = 'uc-hover-effects-styles';
    let styleElement = shadowRoot.querySelector(`#${styleId}`) as HTMLStyleElement;

    if (!styleElement) {
      // Create if doesn't exist
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      shadowRoot.appendChild(styleElement);
    }

    // Generate dynamic styles based on current configurations
    styleElement.textContent = this.generateDynamicHoverEffectStyles(configs);
  }

  /**
   * Remove hover effect styles from shadow root or document
   */
  static removeHoverEffectStyles(shadowRoot?: ShadowRoot): void {
    const styleId = 'uc-hover-effects-styles';

    if (shadowRoot) {
      const styleElement = shadowRoot.querySelector(`#${styleId}`);
      if (styleElement) {
        styleElement.remove();
      }
    } else {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    }
  }
}
