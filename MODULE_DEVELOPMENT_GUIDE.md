# Ultra Card Module Development Guide

Ultra Card features a powerful modular system that allows developers to create custom modules with ease. Each module is a self-contained component with its own settings, preview rendering, and metadata.

## 🏗️ Module Architecture

### Core Components

1. **BaseUltraModule** - Abstract base class with helper methods
2. **ModuleRegistry** - Central registry for all modules
3. **ModuleMetadata** - Metadata interface (title, author, version, etc.)
4. **UltraModule** - Main interface all modules must implement

### Module Structure

```
src/modules/
├── base-module.ts          # Base classes and interfaces
├── module-registry.ts      # Central module registry
├── your-module.ts          # Your custom module
└── index.ts               # Module exports
```

## 🚀 Creating a New Module

### Step 1: Create Your Module File

Create a new file `src/modules/your-module.ts`:

```typescript
import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig } from '../types';

// Define your module's data interface
interface YourModule extends CardModule {
  type: 'your-module';
  your_property: string;
  your_number: number;
  your_boolean: boolean;
}

export class UltraYourModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'your-module',
    title: 'Your Module',
    description: 'Description of what your module does',
    author: 'Your Name',
    version: '1.0.0',
    icon: 'mdi:your-icon',
    category: 'content', // content, layout, media, data, interactive
    tags: ['tag1', 'tag2', 'custom'],
  };

  createDefault(id?: string): YourModule {
    return {
      id: id || this.generateId('your-module'),
      type: 'your-module',
      your_property: 'default value',
      your_number: 42,
      your_boolean: false,
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const yourModule = module as YourModule;

    return html`
      <div class="module-general-settings">
        ${this.renderTextInput(
          'Your Property',
          yourModule.your_property,
          value => updateModule({ your_property: value }),
          'Enter value...',
          'Description of this property'
        )}
        ${this.renderNumberInput(
          'Your Number',
          yourModule.your_number,
          value => updateModule({ your_number: value }),
          { min: 0, max: 100, step: 1 },
          'A number setting'
        )}
        ${this.renderCheckbox(
          'Your Boolean',
          yourModule.your_boolean,
          checked => updateModule({ your_boolean: checked }),
          'Enable this feature'
        )}
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const yourModule = module as YourModule;

    return html`
      <div class="your-module-preview">
        <h4>${yourModule.your_property}</h4>
        <p>Number: ${yourModule.your_number}</p>
        <p>Boolean: ${yourModule.your_boolean ? 'Yes' : 'No'}</p>
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const yourModule = module as YourModule;
    const errors = [...baseValidation.errors];

    if (!yourModule.your_property || yourModule.your_property.trim() === '') {
      errors.push('Your property is required');
    }

    if (yourModule.your_number < 0 || yourModule.your_number > 100) {
      errors.push('Your number must be between 0 and 100');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getStyles(): string {
    return `
      .your-module-preview {
        padding: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--secondary-background-color);
      }
      
      .your-module-preview h4 {
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
      }
      
      .your-module-preview p {
        margin: 4px 0;
        color: var(--secondary-text-color);
        font-size: 14px;
      }
    `;
  }
}
```

### Step 2: Update Type Definitions

Add your module interface to `src/types.ts`:

```typescript
// Add to the CardModule union type
export type CardModule =
  | TextModule
  | SeparatorModule
  | YourModule  // Add this line
  | ... // other modules
```

### Step 3: Register Your Module

Update `src/modules/module-registry.ts`:

```typescript
import { UltraYourModule } from './your-module';

// In registerCoreModules method:
private registerCoreModules(): void {
  this.registerModule(new UltraTextModule());
  this.registerModule(new UltraSeparatorModule());
  this.registerModule(new UltraYourModule()); // Add this line
}
```

### Step 4: Export Your Module

Update `src/modules/index.ts`:

```typescript
export * from './your-module';
```

## 🎨 Helper Methods

The `BaseUltraModule` provides several helper methods for creating form elements:

### Form Fields

```typescript
// Text input
this.renderTextInput(label, value, onChange, placeholder?, description?)

// Number input
this.renderNumberInput(label, value, onChange, options?, description?)

// Text area
this.renderTextArea(label, value, onChange, placeholder?, description?)

// Select dropdown
this.renderSelect(label, value, options, onChange, description?)

// Color picker
this.renderColorPicker(label, value, onChange, description?)

// Checkbox
this.renderCheckbox(label, checked, onChange, description?)

// Generic form field
this.renderFormField(label, inputElement, description?)
```

### Utilities

```typescript
// Generate unique ID
this.generateId('prefix')

// Create form field wrapper
this.renderFormField(label, input, description?)
```

## 📋 Module Categories

Choose the appropriate category for your module:

- **content** - Text, rich content, media display
- **layout** - Separators, spacers, structure elements
- **media** - Images, videos, graphics
- **data** - Charts, sensors, entity information
- **interactive** - Buttons, controls, input elements

## ✅ Best Practices

### 1. Validation

Always implement proper validation:

```typescript
validate(module: CardModule): { valid: boolean; errors: string[] } {
  const baseValidation = super.validate(module);
  const errors = [...baseValidation.errors];

  // Add your validation logic
  if (/* invalid condition */) {
    errors.push('Error message');
  }

  return { valid: errors.length === 0, errors };
}
```

### 2. Error Handling

Handle errors gracefully in rendering:

```typescript
renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
  try {
    // Your rendering logic
    return html`<div>Content</div>`;
  } catch (error) {
    return html`
      <div class="error-message">
        <ha-icon icon="mdi:alert-circle"></ha-icon>
        <span>Error rendering module: ${error.message}</span>
      </div>
    `;
  }
}
```

### 3. Responsive Design

Ensure your module works on all screen sizes:

```css
.your-module-preview {
  /* Mobile first */
  width: 100%;

  /* Tablet and up */
  @media (min-width: 768px) {
    width: auto;
  }
}
```

### 4. Home Assistant Integration

Use Home Assistant design tokens and components:

```typescript
// Use HA variables
color: var(--primary-text-color);
background: var(--card-background-color);

// Use HA icons
<ha-icon icon="mdi:icon-name"></ha-icon>
```

## 🔧 Testing Your Module

1. **Build and Deploy**:

   ```bash
   npm run build:deploy
   ```

2. **Test in Home Assistant**:

   - Add Ultra Card to dashboard
   - Open editor
   - Look for your module in the appropriate category
   - Test all settings and preview rendering

3. **Validation Testing**:
   - Test with invalid inputs
   - Verify error messages display correctly
   - Check edge cases

## 📦 Third-Party Modules

To create a third-party module that can be loaded externally:

### 1. Create Standalone Module

```typescript
// Create your module following the same pattern
import { BaseUltraModule, getModuleRegistry } from 'ultra-card';

export class MyThirdPartyModule extends BaseUltraModule {
  // Implementation
}

// Auto-register when imported
const registry = getModuleRegistry();
registry.registerModule(new MyThirdPartyModule());
```

### 2. Distribution

Package as NPM module or standalone JS file that users can import.

### 3. Loading

Users can load your module by importing it after Ultra Card:

```yaml
resources:
  - url: /local/ultra-card/ultra-card.js
    type: module
  - url: /local/my-custom-module.js
    type: module
```

## 🐛 Debugging

### Console Logging

The registry logs module registration:

```
✅ Registered module: Your Module v1.0.0 by Your Name
```

### Registry Inspection

Access registry in browser console:

```javascript
// Get registry instance
const registry = window.ultraCard?.getModuleRegistry();

// View all modules
registry.getAllModules();

// Search modules
registry.searchModules('text');

// Get stats
registry.getRegistryStats();
```

## 📚 Examples

Check out the built-in modules for examples:

- `src/modules/text-module.ts` - Simple content module
- `src/modules/separator-module.ts` - Layout module with multiple styles

## 🤝 Contributing

To contribute your module to the core Ultra Card:

1. Fork the repository
2. Create your module following this guide
3. Add tests and documentation
4. Submit a pull request

---

**Happy module development!** 🚀
