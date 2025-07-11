# Ultra Card Module Development Guidelines

## Overview

This document provides comprehensive guidelines for creating new modules for the Ultra Card system. All modules should follow these patterns for consistency, maintainability, and user experience.

## Module Structure

### 1. Base Class Extension

All modules must extend `BaseUltraModule`:

```typescript
import { BaseUltraModule, ModuleMetadata } from './base-module';

export class UltraYourModule extends BaseUltraModule {
  // Implementation
}
```

### 2. Metadata Definition

Every module must define metadata:

```typescript
metadata: ModuleMetadata = {
  type: 'your_module_type', // Unique identifier
  title: 'Your Module Name', // Display name
  description: 'Brief description', // What the module does
  author: 'WJD Designs', // Standard author
  version: '1.0.0', // Version number
  icon: 'mdi:icon-name', // MDI icon
  category: 'content', // Category for grouping
  tags: ['tag1', 'tag2'], // Search tags
};
```

### 3. Core Methods Implementation

#### createDefault Method

Define the default configuration structure:

```typescript
createDefault(id?: string): YourModuleType {
  return {
    id: id || this.generateId('your_type'),
    type: 'your_module_type',
    // Core properties
    property1: 'default_value',
    property2: false,
    // Global link configuration (standard pattern)
    tap_action: { action: 'default' },
    hold_action: { action: 'default' },
    double_tap_action: { action: 'default' },
    // Template support (if needed)
    template_mode: false,
    template: '',
  };
}
```

## UI Guidelines

### 1. Settings Section Structure

Use consistent section styling:

```typescript
<div
  class="settings-section"
  style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
>
  <div
    class="section-title"
    style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
  >
    SECTION NAME
  </div>

  <!-- Section content -->
</div>
```

### 2. Field Rendering Pattern

Use `FormUtils.renderField()` for consistency:

```typescript
${FormUtils.renderField(
  'Field Label',
  'Field description explaining what this does.',
  hass,
  { field_name: module.field_name || '' },
  [FormUtils.createSchemaItem('field_name', { text: {} })],
  (e: CustomEvent) => updateModule({ field_name: e.detail.value.field_name })
)}
```

### 3. Conditional Fields Grouping

For related fields that appear conditionally, use the grouping pattern:

```typescript
${condition ? html`
  <div style="margin-top: 24px;">
    ${this.renderConditionalFieldsGroup(
      'Group Title',
      html`
        <!-- Grouped fields content -->
      `
    )}
  </div>
` : ''}
```

### 4. Standard Section Order

Organize settings tabs in this order:

1. **Content Configuration** - Core module functionality
2. **Link Configuration** - Using UltraLinkComponent
3. **Additional Features** - Module-specific features
4. **Template Configuration** - Always last if supported

### 5. Link Configuration Pattern

Always include link configuration using UltraLinkComponent:

```typescript
<div class="settings-section" style="...">
  ${UltraLinkComponent.render(
    hass,
    {
      tap_action: module.tap_action || { action: 'default' },
      hold_action: module.hold_action || { action: 'default' },
      double_tap_action: module.double_tap_action || { action: 'default' },
    },
    (updates: Partial<UltraLinkConfig>) => {
      const moduleUpdates: Partial<YourModuleType> = {};
      if (updates.tap_action) moduleUpdates.tap_action = updates.tap_action;
      if (updates.hold_action) moduleUpdates.hold_action = updates.hold_action;
      if (updates.double_tap_action) moduleUpdates.double_tap_action = updates.double_tap_action;
      updateModule(moduleUpdates);
    },
    'Link Configuration'
  )}
</div>
```

### 6. Template Configuration Pattern

If your module supports templates:

```typescript
<div class="settings-section" style="...">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;">
    <div class="section-title" style="...">
      Template Configuration
    </div>
    ${FormUtils.renderCleanForm(
      hass,
      { template_mode: module.template_mode || false },
      [FormUtils.createSchemaItem('template_mode', { boolean: {} })],
      (e: CustomEvent) => updateModule({ template_mode: e.detail.value.template_mode })
    )}
  </div>

  ${module.template_mode
    ? this.renderConditionalFieldsGroup(
        'Template Settings',
        html`
          ${FormUtils.renderField(
            'Template Code',
            'Enter the Jinja2 template code. Example: {{ states(\'sensor.example\') }}',
            hass,
            { template: module.template || '' },
            [FormUtils.createSchemaItem('template', { text: { multiline: true } })],
            (e: CustomEvent) => updateModule({ template: e.detail.value.template })
          )}
        `
      )
    : html`
        <div style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;">
          Enable template mode to use dynamic content
        </div>
      `}
</div>
```

## Preview Rendering

### 1. Design Properties Integration

Always support design properties with fallbacks:

```typescript
renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
  const yourModule = module as YourModuleType;
  const moduleWithDesign = yourModule as any;

  // Text/content styles
  const contentStyles = {
    fontSize: moduleWithDesign.font_size ? `${moduleWithDesign.font_size}px` : '16px',
    fontFamily: moduleWithDesign.font_family || 'Roboto',
    color: moduleWithDesign.color || 'var(--primary-text-color)',
    textAlign: moduleWithDesign.text_align || 'center',
    // Add other text properties as needed
  };

  // Container styles for positioning and effects
  const containerStyles = {
    padding: this.getPaddingCSS(moduleWithDesign),
    margin: this.getMarginCSS(moduleWithDesign),
    background: this.getBackgroundCSS(moduleWithDesign),
    backgroundImage: this.getBackgroundImageCSS(moduleWithDesign, hass),
    border: this.getBorderCSS(moduleWithDesign),
    borderRadius: this.addPixelUnit(moduleWithDesign.border_radius) || '0',
    // Add positioning, effects, etc.
  };

  return html`
    <div class="your-module-container" style=${this.styleObjectToCss(containerStyles)}>
      <div class="your-module-content" style=${this.styleObjectToCss(contentStyles)}>
        <!-- Your module content -->
      </div>
    </div>
  `;
}
```

### 2. Link Handling Pattern

Implement consistent link/action handling:

```typescript
private hasActiveLink(module: YourModuleType): boolean {
  const hasTapAction = module.tap_action &&
    module.tap_action.action !== 'default' &&
    module.tap_action.action !== 'nothing';
  const hasHoldAction = module.hold_action &&
    module.hold_action.action !== 'default' &&
    module.hold_action.action !== 'nothing';
  const hasDoubleAction = module.double_tap_action &&
    module.double_tap_action.action !== 'default' &&
    module.double_tap_action.action !== 'nothing';

  return hasTapAction || hasHoldAction || hasDoubleAction;
}

// Include click handlers in preview if has active links
${this.hasActiveLink(yourModule)
  ? html`<div
      class="your-module-clickable"
      @click=${(e: Event) => this.handleClick(e, yourModule, hass)}
      @dblclick=${(e: Event) => this.handleDoubleClick(e, yourModule, hass)}
      @mousedown=${(e: Event) => this.handleMouseDown(e, yourModule, hass)}
      @mouseup=${(e: Event) => this.handleMouseUp(e, yourModule, hass)}
      @mouseleave=${(e: Event) => this.handleMouseLeave(e, yourModule, hass)}
      @touchstart=${(e: Event) => this.handleTouchStart(e, yourModule, hass)}
      @touchend=${(e: Event) => this.handleTouchEnd(e, yourModule, hass)}
    >
      ${content}
    </div>`
  : content}
```

## Validation

### 1. Validation Pattern

Implement thorough validation:

```typescript
validate(module: CardModule): { valid: boolean; errors: string[] } {
  const baseValidation = super.validate(module);
  const yourModule = module as YourModuleType;
  const errors = [...baseValidation.errors];

  // Required field validation
  if (!yourModule.required_field || yourModule.required_field.trim() === '') {
    errors.push('Required field is required');
  }

  // Format validation
  if (yourModule.optional_field && !this.isValidFormat(yourModule.optional_field)) {
    errors.push('Optional field must be in valid format');
  }

  // Action validation
  if (yourModule.tap_action && yourModule.tap_action.action !== 'default') {
    errors.push(...this.validateAction(yourModule.tap_action));
  }
  // Repeat for hold_action and double_tap_action

  // Template validation
  if (yourModule.template_mode && (!yourModule.template || yourModule.template.trim() === '')) {
    errors.push('Template code is required when template mode is enabled');
  }

  return { valid: errors.length === 0, errors };
}
```

## Event Handling

### 1. Click Handling with Timeouts

Implement proper click/double-click/hold detection:

```typescript
private clickTimeout: any = null;
private holdTimeout: any = null;
private isHolding = false;

private handleClick(event: Event, module: YourModuleType, hass: HomeAssistant): void {
  event.preventDefault();
  if (this.clickTimeout) clearTimeout(this.clickTimeout);

  this.clickTimeout = setTimeout(() => {
    this.handleTapAction(event, module, hass);
  }, 300);
}

private handleDoubleClick(event: Event, module: YourModuleType, hass: HomeAssistant): void {
  event.preventDefault();
  if (this.clickTimeout) {
    clearTimeout(this.clickTimeout);
    this.clickTimeout = null;
  }
  this.handleDoubleAction(event, module, hass);
}

// Implement hold detection methods following the text-module pattern
```

### 2. Action Execution

Use UltraLinkComponent for action execution:

```typescript
private handleTapAction(event: Event, module: YourModuleType, hass: HomeAssistant): void {
  if (this.isHolding) return;

  if (module.tap_action &&
      module.tap_action.action !== 'default' &&
      module.tap_action.action !== 'nothing') {
    UltraLinkComponent.handleAction(module.tap_action, hass, event.target as HTMLElement);
  }
}
```

## Styling Guidelines

### 1. Required CSS Classes

Include these standard CSS classes in getStyles():

```css
.your-module-container {
  /* Container-level styles */
}

.your-module-content {
  /* Content-level styles */
}

.your-module-clickable {
  cursor: pointer;
  color: inherit;
  text-decoration: inherit;
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
```

### 2. Color Variables

Use these standard CSS variables:

- `var(--primary-color)` - Primary theme color
- `var(--primary-text-color)` - Main text color
- `var(--secondary-text-color)` - Secondary text color
- `var(--secondary-background-color)` - Background color
- `var(--divider-color)` - Border/divider color

## Helper Methods

### 1. Required Helper Methods

Include these utility methods:

```typescript
// Style conversion
private styleObjectToCss(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
    .join('; ');
}

private camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

// Unit handling
private addPixelUnit(value: string | undefined): string | undefined {
  if (!value) return value;
  if (/^\d+$/.test(value)) return `${value}px`;
  if (/^[\d\s]+$/.test(value)) {
    return value.split(' ').map(v => v.trim() ? `${v}px` : v).join(' ');
  }
  return value;
}

// Design property helpers
private getPaddingCSS(moduleWithDesign: any): string {
  return moduleWithDesign.padding_top || moduleWithDesign.padding_bottom ||
         moduleWithDesign.padding_left || moduleWithDesign.padding_right
    ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '8px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '0px'}`
    : '8px 0';
}

// Add similar methods for margin, background, border, etc.
```

## Type Definitions

### 1. Module Interface

Define your module interface extending CardModule:

```typescript
export interface YourModuleType extends CardModule {
  type: 'your_module_type';

  // Core properties
  required_field: string;
  optional_field?: string;

  // Standard link actions
  tap_action?: any;
  hold_action?: any;
  double_tap_action?: any;

  // Template support (if applicable)
  template_mode?: boolean;
  template?: string;

  // Module-specific properties
  your_specific_property?: any;
}
```

## Testing Checklist

Before submitting a new module:

- [ ] Metadata is properly defined
- [ ] createDefault returns valid default configuration
- [ ] renderGeneralTab follows UI guidelines
- [ ] Settings sections use consistent styling
- [ ] Link configuration is included
- [ ] Template configuration is included (if applicable)
- [ ] Preview rendering handles design properties
- [ ] Click/touch events are properly handled
- [ ] Validation covers all required fields
- [ ] CSS follows naming conventions
- [ ] Helper methods are included
- [ ] Type definitions are complete

## Common Patterns

### 1. Icon Selection

```typescript
${FormUtils.renderField(
  'Icon',
  'Choose an icon to display. Leave empty for no icon.',
  hass,
  { icon: module.icon || '' },
  [FormUtils.createSchemaItem('icon', { icon: {} })],
  (e: CustomEvent) => updateModule({ icon: e.detail.value.icon })
)}
```

### 2. Entity Selection

```typescript
${FormUtils.renderField(
  'Entity',
  'Select an entity to monitor.',
  hass,
  { entity: module.entity || '' },
  [FormUtils.createSchemaItem('entity', { entity: {} })],
  (e: CustomEvent) => updateModule({ entity: e.detail.value.entity })
)}
```

### 3. Boolean Toggle

```typescript
${FormUtils.renderCleanForm(
  hass,
  { boolean_field: module.boolean_field || false },
  [FormUtils.createSchemaItem('boolean_field', { boolean: {} })],
  (e: CustomEvent) => updateModule({ boolean_field: e.detail.value.boolean_field })
)}
```

This guideline ensures consistency across all modules and provides a clear development path for new features.
