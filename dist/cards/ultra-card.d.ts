import { LitElement, TemplateResult, PropertyValues } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';
import '../editor/ultra-card-editor';
export declare class UltraCard extends LitElement {
    private _hass?;
    get hass(): HomeAssistant | undefined;
    set hass(value: HomeAssistant | undefined);
    config?: UltraCardConfig;
    private _moduleVisibilityState;
    private _animatingModules;
    private _rowVisibilityState;
    private _columnVisibilityState;
    private _animatingRows;
    private _animatingColumns;
    private _cloudUser;
    private _lastHassChangeTime;
    private _templateUpdateListener?;
    private _authListener?;
    /**
     * Flag to ensure module CSS is injected only once per card instance.
     */
    private _moduleStylesInjected;
    private _instanceId;
    private _limitUnsub?;
    private _isEditorPreviewCard;
    private _globalTransparencyListener?;
    private _globalTransparencyApplied;
    private _variablesBackupUnsub?;
    private _variablesBackupVersion;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * Returns grid options for Home Assistant sections view resizing.
     * Ultra Card uses full width by default and lets content determine height naturally.
     */
    getGridOptions(): {
        columns: string;
        min_columns: number;
    };
    /**
     * Setup custom variables backup/restore system
     * This ensures global variables survive browser cache clears by backing up to card config
     */
    private _setupVariablesBackup;
    protected willUpdate(changedProps: PropertyValues): void;
    setConfig(config: UltraCardConfig): void;
    /**
     * True if this Ultra Card is hosted inside HA's preview dialog (not the dashboard).
     * This traverses up the DOM to detect if we're inside hui-card-preview or hui-dialog-edit-card.
     * NOTE: We do NOT check hass.editMode because that's true for the entire dashboard when editing.
     */
    private _detectEditorPreviewContext;
    private _syncConfigMetadata;
    private _applyInstanceIdToDataset;
    private _generatePreviewInstanceId;
    static getConfigElement(): HTMLElement;
    static getStubConfig(): UltraCardConfig;
    protected render(): TemplateResult;
    updated(changedProperties: Map<string, any>): void;
    private _setupResponsiveScaling;
    private _resizeObserver?;
    private _scaleDebounceTimer?;
    private _currentScale;
    private _lastMeasuredWidth;
    private _lastContentWidth;
    private _lastContentWidthCheck;
    private _lastScaleTime;
    private _visibilityChangeHandler?;
    private _windowResizeHandler?;
    private _isScalingInProgress;
    private _scheduleScaleCheck;
    private _forceResetScale;
    private _isScalingEnabled;
    private _checkAndScaleContent;
    /**
     * Apply global transparency directly to the card-container element
     */
    private _applyGlobalTransparency;
    private _getCardStyle;
    /**
     * Get the card background image URL based on the configured type
     */
    private _getCardBackgroundImageUrl;
    private _renderRow;
    private _renderColumn;
    private _renderModule;
    private _parseAnimationDuration;
    /**
     * Collect all hover effect configurations from the current card config
     */
    private _collectHoverEffectConfigs;
    /**
     * Update hover effect styles based on current configuration
     */
    private _updateHoverEffectStyles;
    /**
     * Helper method to evaluate state-based animation conditions
     */
    private _getStateBasedAnimationClass;
    /**
     * Counts total modules in a config (useful for logging)
     */
    private _countTotalModules;
    /**
     * Convert column layout ID to CSS grid template columns
     */
    private _getGridTemplateColumns;
    /**
     * Helper method to ensure border radius values have proper units
     */
    private _addPixelUnit;
    /**
     * Generate CSS styles for a row based on design properties
     */
    private _generateRowStyles;
    /**
     * Generate CSS styles for a column based on design properties
     */
    private _generateColumnStyles;
    /**
     * Build a CSS background-image value from design properties for rows/columns.
     * Mirrors module background image behavior (upload/url/entity/legacy path).
     */
    private _resolveBackgroundImageCSS;
    /**
     * Convert style object to CSS string
     */
    private _styleObjectToCss;
    /**
     * Check if a module is a pro module by checking its metadata tags
     */
    private _isProModule;
    /**
     * Load cloud user from integration or card auth
     */
    private _loadCloudUser;
    /**
     * Check if the current user has pro access
     * ONLY checks integration auth (no card-based auth)
     */
    private _hasProAccess;
    /**
     * Register all video background modules with the video background service
     */
    private _registerVideoBgModules;
    /**
     * Unregister all video background modules from the video background service
     */
    private _unregisterVideoBgModules;
    /**
     * Register all dynamic weather modules with the dynamic weather service
     */
    private _registerDynamicWeatherModules;
    /**
     * Unregister all dynamic weather modules from the dynamic weather service
     */
    private _unregisterDynamicWeatherModules;
    /**
     * Register all background modules with the background service
     */
    private _registerBackgroundModules;
    /**
     * Unregister all background modules from the background service
     */
    private _unregisterBackgroundModules;
    /**
     * Inject a <style> block containing the combined styles from every registered
     * module into the card's shadow-root. This is required for features such as
     * the icon animation classes (e.g. `.icon-animation-pulse`) defined within
     * individual modules to take effect when the card is rendered in Lovelace.
     */
    private _injectModuleStyles;
    static get styles(): import("lit").CSSResult;
}
