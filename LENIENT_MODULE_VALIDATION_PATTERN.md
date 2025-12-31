# Lenient Module Validation Pattern

## Overview

This document describes the pattern for implementing **graceful error handling** in Ultra Card modules. The goal is to prevent incomplete module configurations from breaking the entire card, while still providing helpful feedback to users.

## Problem Statement

Previously, when a module had incomplete configuration (e.g., Light Module with no entities selected), the validation would fail and throw an error that broke the **entire card**. This resulted in:
- Poor user experience during initial configuration
- Dead cards that showed no helpful information
- Error messages in the console rather than in the UI

## Solution Pattern

The solution involves two key changes:

### 1. **Lenient Validation** - Only Fail on Critical Errors

Modules should only fail validation for **truly breaking issues** that would cause rendering crashes, not for **incomplete configuration** that can be handled gracefully in the UI.

#### Before (Strict):
```typescript
validate(module: CardModule): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // This breaks the entire card!
  if (!module.entities || module.entities.length === 0) {
    errors.push('At least one entity must be selected');
  }
  
  return { valid: errors.length === 0, errors };
}
```

#### After (Lenient):
```typescript
validate(module: CardModule): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Only validate for truly breaking issues
  // Missing entities can be shown as a placeholder in the UI
  
  // Check for malformed data that would crash rendering
  if (module.someNumericValue && isNaN(module.someNumericValue)) {
    errors.push('Value must be a valid number');
  }
  
  // Allow incomplete config - UI will handle it gracefully
  return { valid: errors.length === 0, errors };
}
```

### 2. **Graceful Rendering** - Show Helpful Placeholders

The `renderPreview()` method should handle all states of configuration:
- **Empty**: No configuration started
- **Incomplete**: Configuration started but missing required fields
- **Partial**: Some items valid, some incomplete
- **Complete**: Fully configured

#### Implementation Example (Light Module):

```typescript
renderPreview(
  module: CardModule,
  hass: HomeAssistant,
  config?: UltraCardConfig,
  previewContext?: 'live' | 'ha-preview' | 'dashboard'
): TemplateResult {
  const myModule = module as MyModuleType;
  const items = myModule.items || [];

  // State 1: Empty - No configuration started
  if (items.length === 0) {
    return html`
      <div class="module-placeholder">
        <ha-icon icon="mdi:package-variant"></ha-icon>
        <div>No items configured</div>
        <div class="config-hint">Add items in the General tab</div>
      </div>
    `;
  }

  // State 2: Incomplete - All items missing required data
  const validItems = items.filter(item => item.entity && item.entity !== '');
  const incompleteItems = items.filter(item => !item.entity || item.entity === '');

  if (validItems.length === 0 && items.length > 0) {
    return html`
      <div class="module-placeholder">
        <ha-icon icon="mdi:alert-circle" style="color: var(--warning-color);"></ha-icon>
        <div style="font-weight: 600;">Items Need Configuration</div>
        <div class="config-hint">
          ${incompleteItems.map((item, i) => {
            const itemName = item.name || `Item ${i + 1}`;
            return html`<div>• ${itemName}: No entity selected</div>`;
          })}
        </div>
        <div class="config-hint">Configure entities in the General tab</div>
      </div>
    `;
  }

  // State 3: Partial - Some valid, some incomplete
  // Show warning banner but render valid items
  const warningBanner = incompleteItems.length > 0 ? html`
    <div class="warning-banner">
      <ha-icon icon="mdi:alert"></ha-icon>
      <div>
        ${incompleteItems.length} item${incompleteItems.length > 1 ? 's' : ''} 
        need${incompleteItems.length === 1 ? 's' : ''} configuration
      </div>
    </div>
  ` : '';

  // State 4: Complete - Render normally
  return html`
    <div class="module-container">
      ${warningBanner}
      ${validItems.map(item => this.renderItem(item, hass, config))}
    </div>
  `;
}
```

## Validation Filtering Pattern

For modules that need to validate multiple items (presets, entities, bars, etc.), use this filtering pattern:

```typescript
validate(module: CardModule): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const items = module.items || [];
  
  items.forEach((item, index) => {
    // Only validate items that have been started
    const hasContent = 
      (item.name && item.name.trim() !== '') || 
      (item.entity && item.entity !== '');
    
    if (hasContent) {
      // Get validation errors
      const itemErrors = this.validateItem(item);
      
      // Filter out non-critical errors that can be shown in UI
      const criticalErrors = itemErrors.filter(err => {
        // Allow missing entities - UI will show placeholder
        if (err.includes('entity must be selected')) return false;
        // Allow missing optional fields
        if (err.includes('optional field')) return false;
        return true;
      });
      
      criticalErrors.forEach(error => {
        errors.push(`Item ${index + 1}: ${error}`);
      });
    }
  });
  
  return { valid: errors.length === 0, errors };
}
```

## CSS for Error States

Add these styles to your module's `getStyles()` method:

### Modern Gradient Style (Recommended)

```css
/* Ultra Card Modern Gradient Error State */
.ultra-config-needed {
  position: relative;
  padding: 16px;
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ultra-config-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(168, 85, 247, 0.15) 0%, 
    rgba(236, 72, 153, 0.15) 50%, 
    rgba(59, 130, 246, 0.15) 100%);
  z-index: 0;
}

.ultra-config-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ultra-config-content ha-icon {
  flex-shrink: 0;
  color: var(--primary-color);
  --mdc-icon-size: 24px;
}

.ultra-config-text {
  flex: 1;
  min-width: 0;
}

.ultra-config-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 2px;
}

.ultra-config-subtitle {
  font-size: 12px;
  color: var(--secondary-text-color);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Compact Warning Banner */
.ultra-config-banner {
  position: relative;
  padding: 10px 14px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  backdrop-filter: blur(10px);
}

.ultra-config-banner-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(168, 85, 247, 0.12) 0%, 
    rgba(236, 72, 153, 0.12) 100%);
  z-index: 0;
}

.ultra-config-banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--primary-text-color);
}

.ultra-config-banner-content ha-icon {
  flex-shrink: 0;
  color: var(--primary-color);
  --mdc-icon-size: 18px;
}
```

### Simple Style (Alternative)

```css
.module-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  color: var(--secondary-text-color);
  text-align: center;
}

.module-placeholder ha-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.config-hint {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 8px;
}
```

## Benefits

1. **Better UX**: Users see helpful messages instead of broken cards
2. **Guided Configuration**: Clear instructions on what's missing
3. **Progressive Enhancement**: Valid items render even when some are incomplete
4. **Per-Module Errors**: Issues don't cascade to break the entire card
5. **Editor-Friendly**: Configuration can be done step-by-step without errors

## Modules That Use This Pattern

All Ultra Card modules now implement this pattern:

### Fully Implemented (v2.1.0-beta7)
- ✅ **Light Module** - Lenient preset validation + gradient error states
- ✅ **Info Module** - Lenient entity validation + gradient error states  
- ✅ **Gauge Module** - Lenient entity validation + gradient error state
- ✅ **Bar Module** - Lenient entity validation + gradient error state
- ✅ **Dropdown Module** - Lenient validation for both entity and manual modes + gradient error states
- ✅ **Slider Control Module** - Lenient bar validation + gradient error states + warning banners
- ✅ **Graphs Module** - Lenient entity/chart validation + gradient error states
- ✅ **Camera Module** - Lenient entity/template validation + gradient error states
- ✅ **Text Module** - Lenient text/template validation + gradient error states
- ✅ **Icon Module** - Lenient icon validation + gradient error states + warning banners
- ✅ **Image Module** - Lenient image source validation + gradient error states
- ✅ **Markdown Module** - Lenient content validation + gradient error state
- ✅ **Map Module** - Lenient marker validation (already was lenient)

### Already Handled Gracefully
- ✅ **External Card Module** - Has custom placeholder system
- ✅ **Vertical/Horizontal Modules** - Layout containers, no entity requirements
- ✅ **Separator/Pagebreak Modules** - No entity requirements
- ✅ **Animated Weather/Forecast/Clock Modules** - Check validation as needed

## Implementation Checklist

When applying this pattern to a module:

- [ ] Update `validate()` method to be lenient
  - [ ] Only fail on truly breaking errors (malformed data, invalid types)
  - [ ] Allow missing optional fields
  - [ ] Filter out non-critical validation errors
- [ ] Update `renderPreview()` method with graceful states
  - [ ] Handle empty state (no configuration)
  - [ ] Handle incomplete state (all items missing required data)
  - [ ] Handle partial state (some valid, some incomplete)
  - [ ] Handle complete state (fully configured)
- [ ] Add helpful error messages in UI
  - [ ] Use clear, actionable language
  - [ ] Include icons for visual cues
  - [ ] Point users to where they can fix issues
- [ ] Add CSS for error states
  - [ ] Placeholder styles
  - [ ] Warning banner styles
  - [ ] Icon styles
- [ ] Test all configuration states
  - [ ] Empty module (no items)
  - [ ] Incomplete items (no entities)
  - [ ] Partial configuration (mix of valid/invalid)
  - [ ] Full configuration (all valid)

## Migration Notes

When migrating existing modules:

1. **Backward Compatible**: These changes are backward compatible - existing valid configurations work unchanged
2. **No Breaking Changes**: Only affects how invalid/incomplete configs are handled
3. **Gradual Rollout**: Can be applied module-by-module without affecting others
4. **User Impact**: Positive only - removes frustrating errors during configuration

## Example: Applying to Bar Module

```typescript
// In bar-module.ts

validate(module: CardModule): { valid: boolean; errors: string[] } {
  const barModule = module as BarModule;
  const errors: string[] = [];
  
  // Only check for critical errors
  if (barModule.max_value && barModule.max_value < barModule.min_value) {
    errors.push('Maximum value must be greater than minimum value');
  }
  
  // Don't fail on missing entity - UI will show placeholder
  
  return { valid: errors.length === 0, errors };
}

renderPreview(...): TemplateResult {
  const barModule = module as BarModule;
  
  if (!barModule.entity || barModule.entity === '') {
    return html`
      <div class="bar-module-placeholder">
        <ha-icon icon="mdi:chart-box"></ha-icon>
        <div>No entity configured</div>
        <div class="config-hint">Select an entity in the General tab</div>
      </div>
    `;
  }
  
  // Render normally
  return html`...`;
}
```

## Testing Recommendations

Test these scenarios for each module:

1. **Fresh Module**: Add module, don't configure anything → Should show helpful placeholder
2. **Partial Config**: Start configuring but don't complete → Should show what's missing
3. **Invalid Data**: Enter invalid values → Should show specific error about what's wrong
4. **Mixed State**: Some items valid, some not → Should render valid ones + warning
5. **Complete Config**: Fully configured → Should work normally

## Related Files

- Implementation: `/src/modules/light-module.ts` (lines 2687-2744, 2238-2356)
- Config Validation: `/src/services/config-validation-service.ts`
- Base Module: `/src/modules/base-module.ts`

## Questions or Issues?

If you encounter issues applying this pattern:
1. Check the Light Module implementation as a reference
2. Ensure all validation errors are truly critical
3. Test all configuration states
4. Use the CSS classes provided for consistent styling

---

**Status**: ✅ Pattern established and documented  
**First Implementation**: Light Module (v2.1.0-beta7)  
**Author**: WJD Designs

