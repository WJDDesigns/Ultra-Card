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

### 0. Dropdowns and labels (required)

- All module editors must render dropdowns using our clean form utilities with labels/descriptions suppressed in the native control. Titles and help text must be provided outside the control via `UcFormUtils.renderFieldSection`/`renderSettingsSection` or `FormUtils.renderField`.
- When using `UcFormUtils.renderForm` (preferred), pass `showLabels = false` (default). This injects `.computeLabel` and `.computeDescription` to prevent floating labels or overlay text inside the input.
- Do not rely on HA’s floating labels inside `ha-form`. Always present human‑readable titles like “Time Period”, “Chart Width”, “Info Display”, etc., not underscored keys.

Example:

```ts
${this.renderFieldSection(
  'Time Period',
  'How much historical data to show.',
  hass,
  { time_period: module.time_period || '24h' },
  [this.selectField('time_period', [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
  ])],
  (e: CustomEvent) => updateModule(e.detail.value)
)}
```

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

### 6. Template Mode UI Pattern (standardized)

All modules that support templates must use the same UI structure and wording shown below. Section title must be "Template Mode" and the input label must be "Value Template". Use a boolean toggle and reveal a grouped area with a multiline editor and a compact examples block.

```typescript
<div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;">
  <div class="section-title" style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">
    Template Mode
  </div>

  <div class="field-group" style="margin-bottom: 16px;">
    <ha-form
      .hass=${hass}
      .data=${{ template_mode: module.template_mode || false }}
      .schema=${[{ name: 'template_mode', label: 'Template Mode', description: 'Use Home Assistant templating syntax to render content', selector: { boolean: {} } }]}
      .computeLabel=${(s: any) => s.label || s.name}
      .computeDescription=${(s: any) => s.description || ''}
      @value-changed=${(e: CustomEvent) => updateModule({ template_mode: e.detail.value.template_mode })}
    ></ha-form>
  </div>

  ${module.template_mode
    ? html`
        <div class="field-group" style="margin-bottom: 16px;">
          <ha-form
            .hass=${hass}
            .data=${{ template: module.template || '' }}
            .schema=${[{ name: 'template', label: 'Value Template', description: 'Template to render using Jinja2 syntax', selector: { text: { multiline: true } } }]}
            .computeLabel=${(s: any) => s.label || s.name}
            .computeDescription=${(s: any) => s.description || ''}
            @value-changed=${(e: CustomEvent) => updateModule({ template: e.detail.value.template })}
          ></ha-form>
        </div>

        <div class="template-examples">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Common Examples:</div>
          <div class="example-item" style="margin-bottom: 16px;">
            <div class="example-code" style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;">{{ states('sensor.example') }}</div>
            <div class="example-description" style="font-size: 12px; color: var(--secondary-text-color);">Basic value</div>
          </div>
          <div class="example-item" style="margin-bottom: 16px;">
            <div class="example-code" style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;">{{ states('sensor.example') | int(default=0) }}%</div>
            <div class="example-description" style="font-size: 12px; color: var(--secondary-text-color);">With percent</div>
          </div>
        </div>
      `
    : html`
        <div style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;">Enable template mode to use dynamic content</div>
      `}
</div>
```

Notes:

- The above structure must be used for all modules with `template_mode`/`template` fields (Text, Info, Camera, Graphs, etc.).
- Place the Template Mode section as the last group in the General/Other tab for that module.

### 7. Logic Tab vs Template Mode (must remain separate)

Purpose separation is mandatory:

- Template Mode (General/Other tab): Renders text/value or dynamically selects an entity for that specific module. It should never control visibility. It uses fields `template_mode` and `template` that are local to the module’s content rendering.
- Logic tab: Controls when the element is shown/hidden via `display_mode` and `display_conditions` (time, state, template condition). This must NOT reuse the content `template_mode` toggle or field. Logic template(s) appear in per-condition UI (e.g., “Template” condition returning true/false) and are stored under the logic data structure, not the module’s content template field.

Implementation rules:

- Do not read or mutate the General tab’s `template_mode` / `template` from the Logic tab. Keep separate properties for logic, e.g., `display_mode`, `display_conditions`, and per-condition `template` strings.
- In the Logic tab UI, never bind to `module.template_mode`. If a legacy binding exists, remove it and use the dedicated logic fields instead.
- Use wording that reinforces separation: Logic template inputs must include the hint “Template should return true/false (controls visibility)”. Content Template Mode uses “Value Template” and affects rendered text/value only.
- When both are configured, logic takes effect for visibility, while content template affects the module’s internal display when visible.

### 8. Hierarchy and cross-cutting tabs (Actions, Logic, Design)

All editor tabs for Rows, Columns and Modules MUST behave consistently and follow the same hierarchy. The DOM structure is always:

```
(Row)
  <div class="uc-row-container">        // Row-level Actions, Logic, Design attach here
    (Column)
      <div class="uc-column-container"> // Column-level Actions, Logic, Design attach here
        (Module)
          <div class="uc-module-container"> // Module-level Actions, Logic, Design attach here
            ...module content...
          </div>
      </div>
  </div>
```

Shared principles:

- Each level exposes three tabs: Actions, Logic, Design.
- A level’s settings apply to its outer container and everything inside it.
- Parent settings cascade down to children. Child settings NEVER modify the parent.

Actions (tap/hold/double-tap):

- Every level can have its own actions. The action handlers must be attached to the container of that level.
- Precedence is child-first. If a module has an active action, clicking the module executes the module action and MUST NOT bubble to the column/row. Use `stopPropagation()` and/or pointer event containment.
- If a child has no active actions, allow the event to bubble so the column action can fire; if no column action, the row action can fire.
- Hover effects (if enabled) apply to the container at that level only. Child hover effects take visual priority inside their own container, but must not leak to the parent.

Logic (show/hide):

- Visibility is evaluated top-down with AND semantics: `visible = rowVisible && columnVisible && moduleVisible`.
- A hidden parent hides all its descendants regardless of their individual logic.
- Logic uses `display_mode` and `display_conditions` with per-condition templates that RETURN TRUE/FALSE. These logic templates are distinct from content templates (see section 7).
- UI phrasing in Logic templates must state: “Template should return true/false (controls visibility)”.

Design (style cascade and overrides):

- Design settings on a level affect that container and all nested content inside that container.
- Parent Design overrides child General settings and also overrides child Design settings where specified. Cascading precedence:
  - Row Design (highest)
  - Column Design
  - Module Design
  - Module General (lowest)
- Practical rule: If the module has red text in General, setting white text in the row’s Design forces white in that module (because parent style wins).
- Implementation guidance:
  - Compute effective styles by merging in order (lowest to highest priority): `computed = { ...moduleGeneral, ...moduleDesign, ...columnDesign, ...rowDesign }` but remember parent design should overwrite child design where defined.
  - Apply Design styles to the container `style` attribute (inline) or as CSS variables set on the container, then reference those variables in child content.
  - All modules must expose a container element and use a helper (e.g., `styleObjectToCss`) so Design can apply uniformly.

Testing checklist (hierarchy):

- Clicking a module with its own action does NOT trigger column/row actions; clicking empty space inside a column triggers column or row action as configured.
- Setting Logic to hide a row hides its columns and modules even if their logic evaluates true.
- Row Design color/background/fonts propagate to columns and modules; a later change on Column Design should override Module General but be overridden by Row Design where both specify the same property.

### 9. Single-source global tabs (one file per tab)

To simplify future development and guarantee consistent behavior, the editor must use a single implementation file for each global tab. Modules/rows/columns only invoke these APIs and provide a thin glue layer.

- Actions: `src/services/actions-tab-service.ts` (already in use)

  - API: `ActionsTabService.render(scope, hass, config, update, injectStyles)` returns a complete Actions tab (including hover controls).
  - Helpers: `hasActiveActions`, `getHoverStyles`, `getClickableClass`, `getClickableStyle`.

- Logic: `src/services/logic-tab-service.ts` (centralize)

  - API: `LogicTabService.render(scope, hass, update)` renders display mode and conditions (time, state, template).
  - The template condition editor must say “Template should return true/false (controls visibility)”.
  - Emits updates for `display_mode` and `display_conditions` only (never touches content `template_mode`).
  - Provides `LogicTabService.evaluate(scope, hass)` for preview if needed (wraps `LogicService`).

- Design: `src/services/design-tab-service.ts` (centralize)
  - API: `DesignTabService.render(scope, hass, update)` renders all shared design controls (colors, fonts, sizes, spacing, borders, background, images, effects).
  - Exposes `DesignTabService.apply(containerStyles, parentDesign, childDesign, general)` that merges styles using precedence: Row > Column > Module Design > Module General.
  - All modules must render into a container and call the helper used by Design to convert the computed style object to inline CSS or CSS variables.

Usage example in a module file:

```ts
// Actions tab
renderActionsTab(module, hass, config, update) {
  return ActionsTabService.render(module, hass, config, update, () => this.injectUcFormStyles());
}

// Logic tab
renderLogicTab(module, hass, update) {
  return LogicTabService.render(module, hass, update);
}

// Design tab
renderDesignTab(module, hass, update) {
  return DesignTabService.render(module, hass, update);
}
```

Migration guidance:

- New modules must use the three services above; keep module files focused on module-specific tabs (General, Other).
- Existing modules should be updated incrementally to remove bespoke logic/actions/design tab code and delegate to the services.
- Rows and Columns must use the same services and pass their own config objects so behavior matches modules.

## Preview Rendering

### Centralized Preview System

Ultra Card uses a centralized preview service (`uc-module-preview-service.ts`) that ensures consistent rendering between the editor popup Live Preview and the Home Assistant preview window. This eliminates fragmentation and simplifies module development.

**Key Benefits:**

- Popup Live Preview automatically matches HA preview window
- Modules only need to implement their core content
- Animation and hover effect wrappers are handled automatically
- New modules get proper previews without extra work

**How it Works:**

The preview service provides two main methods:

1. **`renderModuleInCard()`** - Used by the editor popup

   - Wraps module in a card container
   - Shows "Hidden by Logic" overlay when logic conditions not met
   - Perfect for isolated module preview

2. **`renderModuleContent()`** - Used by the card at runtime
   - Wraps module content with animation/hover effects
   - Animation state tracking handled by calling component
   - Used for rendering modules within rows/columns

**Module Implementation:**

Modules call `moduleHandler.renderPreview(module, hass, config)` which returns the module's complete content including its own styling. The preview service then wraps this with:

- Card container (for popup preview)
- Animation wrappers (intro/outro/state-based)
- Hover effect wrappers
- Logic visibility indicators

**What Modules Should Do:**

Modules should implement `renderPreview()` to return their complete content with their own container styling. **Do NOT** try to handle animation wrappers or card container wrapping - the service handles this automatically.

**Triggering Preview Updates:**

When your module updates dynamically (e.g., template evaluation), call the base class helper:

```typescript
// Trigger preview update after template evaluation or dynamic content changes
this.triggerPreviewUpdate();
```

This dispatches a global event that both the editor popup and the actual card listen for.

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

### 3. Boolean Toggle (Inline Layout)

**All boolean toggles (switches) MUST use the inline layout pattern** where the title and toggle appear on the same line. This is automatically handled by `UcFormUtils.renderFieldSection()` when a boolean field is detected.

**Correct Pattern:**

```typescript
${this.renderSettingsSection(
  'Section Title',
  'Section description',
  [
    {
      title: 'Toggle Title',
      description: 'Toggle description explaining what this controls',
      hass,
      data: { boolean_field: module.boolean_field || false },
      schema: [this.booleanField('boolean_field')],
      onChange: (e: CustomEvent) => updateModule({ boolean_field: e.detail.value.boolean_field }),
    },
  ]
)}
```

**Visual Layout:**

- Title and description on the left (flexible width)
- Toggle switch on the right (fixed position)
- 16px gap between text and toggle
- Minimum 48px height for proper touch targets
- Description appears below title when both are present

**Implementation Notes:**

- `UcFormUtils.renderFieldSection()` automatically detects boolean fields and applies inline layout
- The CSS classes `.boolean-field` are applied automatically
- Title remains bold and primary text color
- Description uses secondary text color with 0.8 opacity
- Toggle uses `var(--primary-color)` for active state

**What NOT to do:**

- ❌ Don't use vertical layout for boolean fields (toggle below title)
- ❌ Don't manually create custom toggle layouts
- ❌ Don't use `FormUtils.renderCleanForm()` directly for boolean toggles in settings sections

This pattern ensures consistent, professional-looking toggles across all modules, matching modern UI/UX standards and Home Assistant conventions.

### 4. Number Range Control with Slider

For numeric fields that benefit from visual adjustment, use this optimized pattern with a dominant slider, compact number input, and reset button.

To ensure the control is styled correctly in the editor UI, you must include the required CSS within an inline `<style>` tag in your `renderGeneralTab` method. These styles should also be included in your module's `getStyles()` method to apply to the card preview.

```typescript
// In your renderGeneralTab method
<div class="field-container" style="margin-bottom: 24px;">
  <div class="field-title">Field Name</div>
  <div class="field-description">
    Field description explaining the range and purpose.
  </div>
  <style>
    .number-range-control {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .range-slider {
      flex: 0 0 65%;
      height: 6px;
      background: var(--divider-color);
      border-radius: 3px;
      outline: none;
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 0;
    }

    .range-slider::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: var(--primary-color);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .range-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: var(--primary-color);
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .range-slider:hover {
      background: var(--primary-color);
      opacity: 0.7;
    }

    .range-slider:hover::-webkit-slider-thumb {
      transform: scale(1.1);
    }

    .range-slider:hover::-moz-range-thumb {
      transform: scale(1.1);
    }

    .range-input {
      flex: 0 0 20%;
      padding: 6px 8px !important;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      text-align: center;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .range-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
    }

    .range-reset-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .range-reset-btn:hover {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .range-reset-btn ha-icon {
      font-size: 14px;
    }
  </style>
  <div class="number-range-control">
    <input
      type="range"
      class="range-slider"
      min="${MIN_VALUE}"
      max="${MAX_VALUE}"
      step="0.1"
      .value="${module.field_name || DEFAULT_VALUE}"
      @input=${(e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = parseFloat(target.value);
        updateModule({ field_name: value });
      }}
    />
    <input
      type="number"
      class="range-input"
      min="${MIN_VALUE}"
      max="${MAX_VALUE}"
      step="0.1"
      .value="${module.field_name || DEFAULT_VALUE}"
      @input=${(e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = parseFloat(target.value);
        if (!isNaN(value)) {
          updateModule({ field_name: value });
        }
      }}
      @keydown=${(e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          const target = e.target as HTMLInputElement;
          const currentValue = parseFloat(target.value) || DEFAULT_VALUE;
          const increment = e.key === 'ArrowUp' ? 0.1 : -0.1;
          const newValue = Math.max(MIN_VALUE, Math.min(MAX_VALUE, currentValue + increment));
          const roundedValue = Math.round(newValue * 10) / 10;
          updateModule({ field_name: roundedValue });
        }
      }}
    />
    <button
      class="range-reset-btn"
      @click=${() => updateModule({ field_name: DEFAULT_VALUE })}
      title="Reset to default (${DEFAULT_VALUE})"
    >
      <ha-icon icon="mdi:refresh"></ha-icon>
    </button>
  </div>
</div>
```

This pattern provides:

- Visual slider for intuitive adjustment
- Precise number input with arrow key support (±0.1 increments)
- Reset button with tooltip for default values
- Synchronized updates across all controls
- Responsive design that works on all screen sizes
- Support for negative values and decimal precision

This guideline ensures consistency across all modules and provides a clear development path for new features.

## Unified Template System

### Overview

The Unified Template System allows modules to use a single JSON-based template instead of multiple separate template boxes. This provides better UX, entity remapping support, and cleaner code.

### When to Use

Implement unified templates for modules that need dynamic display updates based on:

- Entity state changes
- Attribute values
- Time-based conditions
- Complex conditional logic

### Type Definition Requirements

Add these properties to your module's config interface:

```typescript
export interface YourModuleConfig {
  // ... other properties ...

  // Legacy template support
  template_mode?: boolean;
  template?: string;

  // Unified template system
  unified_template_mode?: boolean;
  unified_template?: string;
  ignore_entity_state_config?: boolean; // For modules with active/inactive states
}
```

### Implementation Steps

#### 1. Import Required Utilities

```typescript
import { buildEntityContext } from '../utils/template-context';
import { parseUnifiedTemplate, hasTemplateError } from '../utils/template-parser';
import {
  detectLegacyTemplates,
  migrateToUnified,
  shouldShowMigrationPrompt,
} from '../utils/template-migration';
```

#### 2. Update createDefault()

```typescript
createDefault(id?: string): YourModule {
  return {
    // ... other defaults ...

    template_mode: false,
    template: '',
    unified_template_mode: false,
    unified_template: '',
    ignore_entity_state_config: false,
  };
}
```

#### 3. Implement Template Rendering (Priority Cascade)

In your `renderPreview()` method:

```typescript
// Get base display values
let displayIcon = config.icon || 'mdi:help-circle';
let displayColor = config.color || 'var(--primary-color)';

// PRIORITY 1: Unified template (if enabled)
if (config.unified_template_mode && config.unified_template) {
  if (!this._templateService && hass) {
    this._templateService = new TemplateService(hass);
  }

  const templateHash = this._hashString(config.unified_template);
  const templateKey = `unified_${config.entity}_${config.id}_${templateHash}`;

  if (!this._templateService.hasTemplateSubscription(templateKey)) {
    const context = buildEntityContext(config.entity, hass, config);
    this._templateService.subscribeToTemplate(
      config.unified_template,
      templateKey,
      () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
        }
      },
      context // Pass entity context variables
    );
  }

  const unifiedResult = hass?.__uvc_template_strings?.[templateKey];
  if (unifiedResult && String(unifiedResult).trim() !== '') {
    const parsed = parseUnifiedTemplate(unifiedResult);
    if (!hasTemplateError(parsed)) {
      if (parsed.icon) displayIcon = parsed.icon;
      if (parsed.icon_color) displayColor = parsed.icon_color;
      // Apply other properties as needed
    }
  }
}
// PRIORITY 2: Legacy templates (existing behavior)
else if (config.template_mode && config.template) {
  // Legacy template logic
}
```

#### 4. Add Migration UI

In `renderGeneralTab()`, add migration banner before template sections:

```typescript
<!-- Migration Banner -->
${shouldShowMigrationPrompt(config)
  ? html`
      <div class="migration-banner" style="...styling...">
        <button @click=${() => {
          const migration = migrateToUnified(config);
          updateConfig({
            unified_template_mode: migration.unified_template_mode,
            unified_template: migration.unified_template,
            ignore_entity_state_config: migration.ignore_entity_state_config,
            // Disable legacy templates
            template_mode: false,
          });
        }}>
          Migrate to Unified Template
        </button>
      </div>
    `
  : ''}
```

#### 5. Add Unified Template UI Section

```typescript
<!-- Unified Template Section -->
<div class="template-section">
  <div class="switch-container">
    <label>Smart Display Template</label>
    <input type="checkbox"
           .checked=${config.unified_template_mode || false}
           @change=${(e) => updateConfig({ unified_template_mode: e.target.checked })} />
  </div>

  ${config.unified_template_mode
    ? html`
        <!-- Optional: ignore_entity_state_config toggle for modules with animations -->

        <ultra-template-editor
          .hass=${hass}
          .value=${config.unified_template || ''}
          .placeholder=${'{\n  "icon": "mdi:fire",\n  "icon_color": "red"\n}'}
          @value-changed=${(e) => updateConfig({ unified_template: e.detail.value })}
        ></ultra-template-editor>

        <div class="template-help">
          <!-- Context variable reference -->
          <!-- JSON syntax examples -->
        </div>
      `
    : ''}
</div>

<!-- Legacy Templates (Deprecated) -->
<details>
  <summary>Legacy Templates (Deprecated)</summary>
  <!-- Old template sections here -->
</details>
```

### Entity Context Variables

Templates automatically have access to these variables:

```typescript
{
  entity: 'sensor.temperature',    // Entity ID
  state: '23.5',                   // Current state
  name: 'Living Room Temp',        // Display name
  attributes: { /* all attrs */ }, // Full attributes
  unit: '°C',                      // Unit of measurement
  domain: 'sensor',                // Entity domain
  device_class: 'temperature',     // Device class
  friendly_name: '...',            // HA friendly name
  config: { /* module config */ }, // Module configuration
  state_number: 23.5,              // State as number
  state_boolean: false,            // State as boolean
}
```

### Template Response Structure

Modules can define which properties are supported in `UnifiedTemplateResponse`:

```typescript
// For icon-based modules
{
  icon?: string;           // Icon name
  icon_color?: string;     // Icon color
}

// For text-based modules
{
  content?: string;        // Text content
  color?: string;          // Text color
}

// For data modules
{
  value?: number | string; // Data value
  label?: string;          // Label text
}
```

### State Control vs Display Control

**Default Behavior (Display Only):**

- Templates control visual properties only
- Active/inactive state controlled by entity state config
- Clear separation of concerns

**Optional Override:**

- Add `ignore_entity_state_config` toggle
- When enabled, template controls both display AND state logic
- Useful for migrating from old `template_mode` behavior

### Best Practices

1. **Always use entity context variables** - Don't hardcode entity IDs
2. **Validate JSON responses** - Use `parseUnifiedTemplate()` and `hasTemplateError()`
3. **Provide migration path** - Auto-detect legacy templates, show migration banner
4. **Keep templates pure display** - Unless `ignore_entity_state_config` is enabled
5. **Show helpful examples** - Include context variable reference in template editor
6. **Support string fallback** - Simple string return for backward compatibility

### Example Implementation

See `src/modules/icon-module.ts` and `src/modules/info-module.ts` for complete reference implementations.

### Testing Checklist

- [ ] Legacy templates still work (backward compatibility)
- [ ] Migration preserves exact behavior
- [ ] Entity remapping works (change entity, template still works)
- [ ] JSON validation shows helpful errors
- [ ] Priority cascade works (unified > dynamic > legacy > static)
- [ ] Performance is acceptable (no lag with multiple templates)

### Documentation

Always document unified template support in:

1. Module type definition comments
2. Editor UI tooltips and help text
3. User-facing documentation
4. Example presets and templates

For complete user guide, see [UNIFIED_TEMPLATES.md](UNIFIED_TEMPLATES.md).
