import type { HoverEffectConfig } from '../types';
/**
 * Service for generating CSS hover effects based on configuration
 * Inspired by Hover.css library with custom implementations
 */
export declare class UcHoverEffectsService {
    /**
     * Generate CSS class name for hover effect
     */
    static getHoverEffectClass(config?: HoverEffectConfig): string;
    /**
     * Generate CSS styles for hover effects
     */
    static generateHoverEffectStyles(config?: HoverEffectConfig): string;
    /**
     * Generate all hover effect styles for injection into the document
     */
    static generateAllHoverEffectStyles(): string;
    /**
     * Generate all keyframes needed for animated effects
     */
    private static generateAllKeyframes;
    private static getScaleValue;
    private static getBounceDistance;
    private static getFloatDistance;
    private static getGlowIntensity;
    private static getShadowIntensity;
    private static getRotateDegrees;
    private static getSkewValue;
    private static getFadeOpacity;
    private static generatePulseKeyframes;
    private static generateBounceKeyframes;
    private static generateWobbleKeyframes;
    private static generateBuzzKeyframes;
    /**
     * Inject hover effect styles into a shadow root or document head
     */
    static injectHoverEffectStyles(shadowRoot?: ShadowRoot): void;
    /**
     * Remove hover effect styles from shadow root or document
     */
    static removeHoverEffectStyles(shadowRoot?: ShadowRoot): void;
}
