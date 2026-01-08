import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../../types';
import '../../components/ultra-color-picker';
import '../global-design-tab';
import '../../components/uc-favorite-dialog';
import '../../components/uc-variable-mapping-dialog';
import '../../components/uc-import-dialog';
export declare class LayoutTab extends LitElement {
    hass: HomeAssistant;
    config: UltraCardConfig;
    cloudUser?: any | null;
    private _showModuleSelector;
    private _selectedRowIndex;
    private _selectedColumnIndex;
    private _showModuleSettings;
    private _selectedModule;
    private _activeModuleTab;
    private _activeDesignSubtab;
    private _showRowSettings;
    private _selectedRowForSettings;
    private _activeRowTab;
    private _showColumnSettings;
    private _selectedColumnForSettings;
    private _activeColumnTab;
    private _showTabsSectionChildSettings;
    private _selectedTabsSectionChild;
    private _activeTabsChildTab;
    private _showColumnLayoutSelector;
    private _selectedRowForLayout;
    private _customSizingInput;
    private _customSizingValid;
    private _customSizingError;
    private _collapsedPreviewModules;
    private _isRowColumnPreviewCollapsed;
    private _collapsedConditionIds;
    private _collapsedRows;
    private _collapsedColumns;
    private _isPreviewPinned;
    private _draggingCondition;
    private _globalExternalCardCount;
    private _activeModuleSelectorTab;
    private _activeModuleCategoryTab;
    private _selectedPresetSource;
    private _showFavoriteDialog;
    private _favoriteRowToSave;
    private _showImportDialog;
    private _showImagePopup;
    private _imagePopupUrl;
    private _imagePopupTitle;
    private _openMoreMenuRowIndex;
    private _hasModuleClipboard;
    private _hasColumnClipboard;
    private _hasCardClipboard;
    private _showVariableMappingDialog;
    private _missingVariables;
    private _moduleSearchQuery;
    private _cardSearchQuery;
    private _presetSearchQuery;
    private _presetSortBy;
    private _presetSortDirection;
    private _tabsSectionDropHandled;
    private _undoStack;
    private _redoStack;
    private _maxHistorySize;
    private _isUndoRedoAction;
    /** Listen for template updates from modules to refresh live previews */
    private _templateUpdateListener?;
    private _tabSwitchListener?;
    private _documentClickListener?;
    private _keydownListener?;
    private _templateUpdateTimer?;
    private _lastTemplateUpdate;
    private _savedScrollPosition;
    private _shouldRestoreScroll;
    private _entityMappingOpen;
    connectedCallback(): void;
    /** Detect Safari browser and add class for Safari-specific CSS fixes */
    private _detectSafari;
    /** Determine if current device/viewport should be treated as mobile */
    private _isMobileDevice;
    private _handleWindowResize;
    private _repositionPopup;
    private _initializePopupPosition;
    private _togglePreviewCollapsed;
    private _getSelectedModuleKey;
    private _isCurrentModulePreviewCollapsed;
    private _toggleRowColumnPreviewCollapsed;
    private _toggleConditionExpanded;
    private _toggleRowCollapsed;
    private _toggleColumnCollapsed;
    private _reorderArray;
    private _onConditionDragStart;
    private _onConditionDragOver;
    private _onConditionDrop;
    private _resolvePreviewBackgroundImageCSS;
    private _draggedItem;
    private _dropTarget;
    private _intendedDragTarget;
    private _selectedLayoutModuleIndex;
    private _selectedNestedChildIndex;
    private _selectedNestedNestedChildIndex;
    private _showLayoutChildSettings;
    private _selectedLayoutChild;
    private _popupDragState;
    private _popupResizeState;
    private _windowResizeListener;
    private _resizeTimeout;
    private _visibilityChangeListener;
    private _windowFocusListener;
    disconnectedCallback(): void;
    /**
     * Perform template update with single requestUpdate() call
     * This prevents animation loops caused by redundant re-renders
     */
    private _performTemplateUpdate;
    /**
     * Add fixedmenuposition attribute to all ha-select elements
     * This makes dropdowns use fixed positioning like HA's tile-card
     * Fixed positioning allows dropdowns to escape stacking contexts and appear above tabs
     */
    private _addFixedMenuPositionToSelects;
    private _startPopupDrag;
    private _handlePopupDrag;
    private _endPopupDrag;
    private _startPopupResize;
    private _handlePopupResize;
    private _endPopupResize;
    private _createColumnIconHTML;
    private _createSimpleIcon;
    private readonly COLUMN_LAYOUTS;
    private _getLayoutsForColumnCount;
    private _migrateLegacyLayoutId;
    private _validateCustomColumnSizing;
    private _parseGridTemplateColumns;
    private _isValidGridSizing;
    private _getCustomSizingPlaceholder;
    private _ensureLayout;
    private _updateConfig;
    private _updateLayout;
    private _saveStateToUndoStack;
    private _canUndo;
    private _canRedo;
    private _undo;
    private _redo;
    private _addRow;
    private _deleteRow;
    private _duplicateRow;
    private _addColumn;
    private _addColumnAfter;
    private _duplicateColumn;
    private _deleteColumn;
    private _openColumnLayoutSelector;
    private _changeColumnLayout;
    private _getCurrentLayoutText;
    private _getCurrentLayoutDisplay;
    private _openModuleSelector;
    private _addModule;
    private _addPageBreakToSlider;
    private _addPageBreakToColumnSlider;
    private _addPreset;
    private _showEntityMappingDialog;
    private _applyPresetToLayout;
    private _remapRowEntities;
    private _applyMappingsToRow;
    private _addFavorite;
    private _saveRowAsFavorite;
    private _exportRow;
    private _pasteRowFromClipboard;
    private _exportFavorite;
    private _deleteFavorite;
    private _cloneRowWithNewIds;
    private _toggleMoreMenu;
    private _copyModule;
    private _pasteModule;
    private _copyColumn;
    private _pasteColumn;
    /**
     * Check if there's Ultra Card export data available in clipboard
     */
    private _checkCardClipboard;
    /**
     * Export entire card configuration to clipboard
     */
    private _exportCard;
    /**
     * Import card configuration from clipboard
     */
    private _importCard;
    private _showToast;
    private _countExternalCardModules;
    /**
     * Count all external card modules across ALL Ultra Card instances in ALL dashboards
     * This provides a global count for Pro feature limiting
     */
    private _countAllExternalCardModulesGlobally;
    /**
     * Get list of external card IDs that are allowed (first 5 by timestamp)
     * Returns a Set of allowed external card IDs for non-Pro users
     */
    private _getAllowedExternalCardIds;
    /**
     * Refresh the global external card count
     * This is called when the 3rd party tab is rendered
     */
    private _refreshGlobalExternalCardCount;
    /**
     * Handle refresh button click in 3rd party tab
     */
    private _handleRefresh3rdPartyTab;
    /**
     * Handle refresh button click in Cards tab
     */
    private _handleRefreshCardsTab;
    /**
     * Add a native HA card from the Cards tab
     * Creates a native_card module (not external_card)
     */
    private _addNativeCard;
    /**
     * Open Ultra Card Pro purchase page
     */
    private _openProPage;
    private _isRefreshingGlobalCount;
    private _duplicateModule;
    private _deleteModule;
    private _openModuleSettings;
    private _updateModule;
    private _updateLayoutChildModule;
    /**
     * Helper method to get the correct module for design updates.
     * Handles both regular module edits and nested layout child module edits.
     */
    private _getModuleForDesignUpdate;
    private _updateModuleDesign;
    private _closeModuleSettings;
    private _navigateToPro;
    private _closeLayoutChildSettings;
    private _closeTabsSectionChildSettings;
    private _onDragStart;
    private _onDragEnd;
    private _onDragOver;
    private _onDragEnter;
    private _onDragLeave;
    private _onDrop;
    private _isValidDropTarget;
    private _performMove;
    private _moveModule;
    private _relocateLayoutModule;
    private _moveColumn;
    private _moveRow;
    private _moveNestedChild;
    private _moveDeepNestedChild;
    /**
     * Move a module from inside a tabs section to another location in the layout
     */
    private _moveTabsSectionChild;
    private _openRowSettings;
    private _updateRow;
    private _openColumnSettings;
    private _updateColumn;
    private _loadGoogleFont;
    private _renderModulePreview;
    private _togglePreviewPin;
    private _renderSingleModule;
    private _renderSimplifiedModule;
    private _renderLayoutModuleAsColumn;
    private _getJustifyContent;
    private _renderLayoutChildModule;
    private _renderNestedLayoutModule;
    /**
     * Renders a deeply nested layout module (3rd level: e.g., popup inside horizontal inside slider)
     */
    private _renderDeepNestedLayoutModule;
    /**
     * Renders a child module inside a deeply nested layout (4th level)
     * These are rendered as simplified module cards without further nesting capability
     */
    private _renderDeepNestedChildModule;
    /**
     * Renders a Tabs layout module at the top level (in a column)
     */
    private _renderTabsLayoutModule;
    /**
     * Renders a Tabs layout module when nested inside another layout
     */
    private _renderNestedTabsLayoutModule;
    /**
     * Renders a single section of a Tabs module with its own drop zone
     */
    private _renderTabsSection;
    /**
     * Renders a child module inside a tabs section
     */
    private _renderTabsSectionChild;
    /**
     * Renders a nested layout module inside a tabs section (horizontal, vertical, slider, etc.)
     */
    private _renderTabsSectionNestedLayout;
    /**
     * Renders a child module inside a nested layout that's inside a tabs section
     */
    private _renderTabsSectionNestedLayoutChild;
    /**
     * Renders a deeply nested layout module (layout inside a layout inside a tabs section)
     */
    private _renderTabsSectionDeeplyNestedLayout;
    /**
     * Renders a child module inside a deeply nested layout (layout inside layout inside tabs)
     */
    private _renderTabsSectionDeeplyNestedLayoutChild;
    /**
     * Opens module selector for nested layout inside a tabs section
     */
    private _openTabsSectionNestedLayoutModuleSelector;
    /**
     * Opens settings for a child module inside a nested layout that's inside a tabs section
     */
    private _openTabsSectionNestedLayoutChildSettings;
    /**
     * Duplicates a child module inside a nested layout that's inside a tabs section
     */
    private _duplicateTabsSectionNestedLayoutChild;
    /**
     * Deletes a child module inside a nested layout that's inside a tabs section
     */
    private _deleteTabsSectionNestedLayoutChild;
    /**
     * Opens the module selector for adding a module to a tabs section
     */
    private _openTabsSectionModuleSelector;
    private _tabsSectionContext;
    private _tabsSectionNestedLayoutContext;
    private _tabsSectionDeeplyNestedLayoutContext;
    /**
     * Adds a module to a specific tabs section
     */
    private _addModuleToTabsSection;
    /**
     * Adds a module to a nested layout inside a tabs section
     */
    private _addModuleToTabsSectionNestedLayout;
    /**
     * Opens module selector for a deeply nested layout (layout inside layout inside tabs)
     */
    private _openTabsSectionDeeplyNestedLayoutModuleSelector;
    /**
     * Adds a module to a deeply nested layout (layout inside layout inside tabs)
     */
    private _addModuleToTabsSectionDeeplyNestedLayout;
    /**
     * Opens settings for a child module inside a deeply nested layout
     */
    private _openTabsSectionDeeplyNestedLayoutChildSettings;
    /**
     * Duplicates a child module inside a deeply nested layout
     */
    private _duplicateTabsSectionDeeplyNestedLayoutChild;
    /**
     * Deletes a child module from a deeply nested layout
     */
    private _deleteTabsSectionDeeplyNestedLayoutChild;
    /**
     * Opens settings for a child module in a tabs section
     * Uses a custom event to trigger the module popup in the parent editor
     */
    private _openTabsSectionChildSettings;
    /**
     * Updates a child module in a tabs section
     */
    private _updateTabsSectionChild;
    /**
     * Copies a child module from a tabs section to clipboard
     */
    private _copyTabsSectionChild;
    /**
     * Handles drag start for modules inside tabs sections
     */
    private _onTabsSectionChildDragStart;
    /**
     * Handles drop on a specific child module within a tabs section (for reordering)
     */
    private _handleTabsSectionChildDrop;
    /**
     * Handles drop on a tabs section (empty area or at the end)
     * This should only be called when dropping on empty space, not on a specific child module
     */
    private _handleTabsSectionDrop;
    private _renderNestedChildModule;
    private _onLayoutModuleDragOver;
    private _onLayoutModuleDragEnter;
    private _onLayoutModuleDragLeave;
    private _onLayoutModuleDrop;
    private _onLayoutChildDragStart;
    private _onLayoutChildDragEnd;
    private _onNestedChildDragStart;
    private _onNestedChildDragEnd;
    /**
     * Handles drag start for child modules inside deeply nested layouts (4th level)
     * e.g., icon module inside popup inside horizontal inside slider
     */
    private _onDeepNestedChildDragStart;
    private _onDeepNestedChildDragEnd;
    /**
     * Handles drag start for deep nested layout modules (3rd level nesting)
     * e.g., popup inside horizontal inside slider
     */
    private _onDeepNestedLayoutDragStart;
    private _onNestedChildDragOver;
    private _onNestedChildDragEnter;
    private _onNestedChildDragLeave;
    private _onNestedChildDrop;
    /**
     * Handle dropping a module into a deeply nested layout (3rd level, e.g., Popup inside Horizontal inside Slider)
     */
    private _handleDropToDeepNestedLayout;
    private _onLayoutChildDragEnter;
    private _onLayoutChildDrop;
    private _onLayoutAppendDragEnter;
    private _onLayoutAppendDrop;
    private _openLayoutModuleSelector;
    private _openNestedLayoutModuleSelector;
    private _openDeepNestedLayoutModuleSelector;
    private _openLayoutChildSettings;
    private _duplicateLayoutChildModule;
    private _copyLayoutChildModule;
    private _duplicateNestedChildModule;
    private _deleteNestedChildModule;
    private _openNestedChildSettings;
    /**
     * Opens settings for a child module inside a deeply nested layout (4th level)
     */
    private _openDeepNestedChildSettings;
    /**
     * Duplicates a child module inside a deeply nested layout (4th level)
     */
    private _duplicateDeepNestedChildModule;
    /**
     * Deletes a child module inside a deeply nested layout (4th level)
     */
    private _deleteDeepNestedChildModule;
    private _regenerateModuleIds;
    private _deleteLayoutChildModule;
    /**
     * Converts module type names to friendly display titles
     * Example: "animated_clock" -> "Animated Clock"
     */
    private _formatModuleTypeName;
    private _getModuleSettingsTitle;
    private _getModuleDisplayName;
    private _generateModuleInfo;
    private _renderSingleModuleWithAnimation;
    private _getRowPreviewAnimationData;
    private _getColumnPreviewAnimationData;
    private _renderRowPreview;
    private _renderColumnPreview;
    private _renderTabsSectionChildSettings;
    private _renderTabsSectionChildPreview;
    private _renderTabsSectionChildGeneralTab;
    private _renderTabsSectionChildYamlTab;
    private _renderTabsSectionChildActionsTab;
    private _renderTabsSectionChildOtherTab;
    private _renderTabsSectionChildLogicTab;
    private _renderTabsSectionChildDesignTab;
    private _duplicateTabsSectionChild;
    private _duplicateTabsSectionChildFromPopup;
    private _deleteTabsSectionChild;
    private _deleteTabsSectionChildFromPopup;
    private _renderModuleSettings;
    private _renderLayoutChildSettings;
    private _renderLayoutChildGeneralTab;
    private _renderLayoutChildActionsTab;
    private _renderLayoutChildYamlTab;
    private _renderLayoutChildOtherTab;
    private _renderModuleLogicTab;
    private _renderLayoutChildLogicTab;
    private _renderLayoutChildDesignTab;
    private _renderRowSettings;
    private _renderColumnSettings;
    private _renderRowGeneralTab;
    /**
     * Get the column vertical alignment value for display in row settings
     * Returns the first column's alignment if all columns have the same, otherwise returns undefined
     */
    private _getColumnVerticalAlignment;
    /**
     * Update vertical alignment for all columns in a row
     */
    private _updateAllColumnsVerticalAlignment;
    private _renderRowActionsTab;
    private _renderRowLogicTab;
    private _renderRowDesignTab;
    private _renderColumnGeneralTab;
    private _renderColumnActionsTab;
    private _renderColumnLogicTab;
    private _renderColumnDesignTab;
    private _renderGeneralTab;
    private _renderActionsTab;
    private _renderOtherTab;
    private _renderYamlTab;
    private _addCondition;
    private _addRowCondition;
    private _addColumnCondition;
    private _removeCondition;
    private _updateCondition;
    private _duplicateCondition;
    private _renderRowCondition;
    private _renderColumnCondition;
    private _renderConditionGeneric;
    private _renderEntityConditionGeneric;
    private _renderEntityAttributeConditionGeneric;
    private _renderCondition;
    private _renderEntityCondition;
    private _renderEntityAttributeCondition;
    private _renderTimeCondition;
    private _renderTemplateCondition;
    private _renderLogicTab;
    private _renderDesignTab;
    private _renderTextDesignTab;
    private _renderBackgroundDesignTab;
    private _renderSpacingDesignTab;
    protected firstUpdated(changedProperties: Map<string, any>): void;
    protected updated(changedProperties: Map<string, any>): void;
    private _renderBorderDesignTab;
    protected render(): TemplateResult;
    private _renderModuleSelector;
    private _formatCategoryTitle;
    /**
     * Focus the search input based on the active tab
     */
    private _focusSearchInput;
    /**
     * Filter modules based on search query
     */
    private _filterModulesBySearch;
    /**
     * Filter cards based on search query
     */
    private _filterCardsBySearch;
    /**
     * Filter presets based on search query
     */
    private _filterPresetsBySearch;
    /**
     * Sort presets by name, date, or rating
     */
    private _sortPresets;
    /**
     * Render module search bar
     */
    private _renderModuleSearchBar;
    /**
     * Render card search bar
     */
    private _renderCardSearchBar;
    /**
     * Render preset search bar
     */
    private _renderPresetSearchBar;
    private _renderModulesTab;
    /**
     * Render module search results in a single column list view
     */
    private _renderModuleSearchResults;
    /**
     * Render PRO upgrade prompt for non-Pro users
     */
    private _renderProUpgradePrompt;
    /**
     * Handle upgrade button click - navigate to PRO tab
     */
    private _handleUpgradeClick;
    private _renderPresetImages;
    private _navigateSlider;
    private _goToSlide;
    private _handleSliderMouseDown;
    private _handleSliderTouchStart;
    private _renderPresetsTab;
    private _renderFavoritesTab;
    private _render3rdPartyTab;
    /**
     * Render the new Cards tab with both native and 3rd party cards
     */
    private _renderCardsTab;
    /**
     * Render card search results in a single column list view
     */
    private _renderCardSearchResults;
    private _addCardFromTab;
    private _openImagePopup;
    private _renderImagePopup;
    private _renderFavoriteDialog;
    private _renderVariableMappingDialog;
    private _renderImportDialog;
    private _handleImport;
    private _showRowImportMappingDialog;
    private _addImportedRow;
    private _addImportedRowWithMappings;
    private _getDefaultCardConfig;
    private _tryHACardHelper;
    private _getHardcodedDefault;
    private _tryGetStubConfig;
    private _add3rdPartyCard;
    private _isLayoutModule;
    private _shouldAutoOpenSettings;
    private _getLayoutModuleColor;
    private _renderColumnLayoutSelector;
    private _onCustomSizingInput;
    private _applyCustomSizing;
    static get styles(): import("lit").CSSResult;
    private _handleBackgroundImageUpload;
    private _truncatePath;
    private _getBackgroundSizeDropdownValue;
    private _getCustomSizeValue;
    /**
     * Collect all hover effect configurations from the current card config
     */
    private _collectHoverEffectConfigs;
    /**
     * Update hover effect styles based on current configuration
     */
    private _updateHoverEffectStyles;
}
