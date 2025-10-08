import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';
import './tabs/about-tab';
import './tabs/layout-tab';
import '../components/ultra-color-picker';
import '../components/uc-favorite-colors-manager';
import '../components/uc-favorite-dialog';
import '../components/uc-import-dialog';
import '../components/uc-snapshot-history-modal';
import '../components/uc-snapshot-settings-dialog';
import '../components/uc-manual-backup-dialog';
export declare class UltraCardEditor extends LitElement {
    hass?: HomeAssistant;
    config: UltraCardConfig;
    private _activeTab;
    private _configDebounceTimeout?;
    private _isFullScreen;
    private _isMobile;
    private _cloudUser;
    private _syncStatus;
    private _backupStatus;
    private _showLoginForm;
    private _loginError;
    private _isLoggingIn;
    private _showBackupHistory;
    private _showCreateSnapshot;
    private _showManualBackup;
    private _showSnapshotSettings;
    private _snapshotSchedulerStatus;
    private _newerBackupAvailable;
    private _showSyncNotification;
    private _isCreatingManualSnapshot;
    /** Flag to ensure module CSS for animations is injected once */
    private _moduleStylesInjected;
    setConfig(config: UltraCardConfig): void;
    connectedCallback(): void;
    private _resizeListener?;
    disconnectedCallback(): void;
    private _checkMobileDevice;
    private _handleConfigChanged;
    private _handleKeyDown;
    private _updateConfig;
    private _toggleFullScreen;
    protected render(): TemplateResult<1>;
    private _renderSettingsTab;
    /**
     * Handle card background image upload
     */
    private _handleCardBackgroundImageUpload;
    /**
     * Truncate long file paths for display
     */
    private _truncatePath;
    /**
     * Get the dropdown value for background size
     */
    private _getBackgroundSizeDropdownValue;
    /**
     * Get custom size value (width or height) from background size string
     */
    private _getCustomSizeValue;
    /**
     * Inject a <style> element containing the combined CSS returned by the
     * ModuleRegistry so that module previews benefit from their specific styles
     * (especially animations) while editing.
     */
    private _injectModuleStyles;
    static get styles(): import("lit").CSSResult;
    /**
     * Collect all hover effect configurations from the current card config
     */
    private _collectHoverEffectConfigs;
    /**
     * Update hover effect styles based on current configuration
     */
    private _updateHoverEffectStyles;
    private _authListener?;
    private _syncListener?;
    private _backupListener?;
    private _hasInitializedAuth;
    /**
     * Setup cloud sync listeners
     */
    private _setupCloudSyncListeners;
    /**
     * Check for newer backup on server (smart sync)
     */
    private _checkForNewerBackup;
    /**
     * Cleanup cloud sync listeners
     */
    private _cleanupCloudSyncListeners;
    /**
     * Render PRO TAB (New dedicated tab for all Pro features)
     */
    private _renderProTab;
    /**
     * Render Ultra Card Pro section (DEPRECATED - kept for backward compatibility)
     */
    private _renderCloudSyncSection;
    /**
     * Render Pro Banner (Free or Pro variant)
     */
    private _renderProBanner;
    /**
     * Render Auth Section (Login or Logout)
     */
    private _renderAuthSection;
    /**
     * Render Card Name Setting
     */
    private _renderCardNameSetting;
    /**
     * Render Pro Actions (Export/Import/Backup)
     */
    private _renderProActions;
    /**
     * Render View Backups Button
     */
    private _renderViewBackupsButton;
    /**
     * Render Snapshot Status Section (Pro only)
     */
    private _renderSnapshotStatusSection;
    private _formatNextSnapshotTime;
    private _formatLastSnapshotTime;
    private _handleCardNameChange;
    private _handleExport;
    private _handleImport;
    private _handleSnapshotImport;
    private _handleCreateBackup;
    private _handleManualBackupCreated;
    private _handleBackupRestored;
    private _handleSnapshotCreated;
    private _handleSnapshotRestored;
    private _handleCardBackupRestored;
    private _handleSnapshotSettingsSaved;
    private _updateSnapshotSchedulerStatus;
    /**
     * Handle manual snapshot creation
     */
    private _handleManualSnapshot;
    private _handleLoadNewerBackup;
    private _handleDismissSyncNotification;
    /**
     * Render login section for unauthenticated users
     */
    private _renderLoginSection;
    /**
     * Render login form
     */
    private _renderLoginForm;
    /**
     * Render sync controls for authenticated users
     */
    private _renderSyncControls;
    /**
     * Render sync conflicts
     */
    private _renderConflicts;
    /**
     * Initialize Pro services after successful authentication
     * Called both on fresh login and when restoring session from storage
     */
    private _initializeProServices;
    /**
     * Handle login form submission
     */
    private _handleLogin;
    /**
     * Handle logout
     */
    private _handleLogout;
    /**
     * Handle sync now button
     */
    private _handleSyncNow;
    /**
     * Handle sync toggle
     */
    private _handleSyncToggle;
    /**
     * Resolve a sync conflict
     */
    private _resolveConflict;
    /**
     * Format relative time for last sync display
     */
    private _formatRelativeTime;
}
