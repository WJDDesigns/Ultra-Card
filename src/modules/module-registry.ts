import { UltraModule, ModuleMetadata } from './base-module';
import { UltraTextModule } from './text-module';
import { UltraSeparatorModule } from './separator-module';
import { UltraImageModule } from './image-module';
import { UltraInfoModule } from './info-module';
import { UltraBarModule } from './bar-module';
import { UltraGaugeModule } from './gauge-module';
import { UltraIconModule } from './icon-module';
import { UltraButtonModule } from './button-module';
import { UltraSpinboxModule } from './spinbox-module';
import { UltraMarkdownModule } from './markdown-module';
import { UltraHorizontalModule } from './horizontal-module';
import { UltraVerticalModule } from './vertical-module';
import { UltraSliderModule } from './slider-module';
import { UltraPageBreakModule } from './pagebreak-module';
import { UltraCameraModule } from './camera-module';
import { UltraGraphsModule } from './graphs-module';
import { UltraDropdownModule } from './dropdown-module';
import { UltraLightModule } from './light-module';
import { UltraAnimatedClockModule } from './animated-clock-module';
import { UltraAnimatedWeatherModule } from './animated-weather-module';
import { UltraAnimatedForecastModule } from './animated-forecast-module';
import { UltraExternalCardModule } from './external-card-module';
import { CardModule } from '../types';

// Module registry class for managing all available modules
export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules = new Map<string, UltraModule>();
  private modulesByCategory = new Map<string, UltraModule[]>();

  private constructor() {
    this.registerCoreModules();
  }

  // Singleton pattern to ensure one registry instance
  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  // Register core modules that come with Ultra Card
  private registerCoreModules(): void {
    this.registerModule(new UltraTextModule());
    this.registerModule(new UltraSeparatorModule());
    this.registerModule(new UltraImageModule());
    this.registerModule(new UltraInfoModule());
    this.registerModule(new UltraBarModule());
    this.registerModule(new UltraGaugeModule());
    this.registerModule(new UltraIconModule());
    this.registerModule(new UltraButtonModule());
    this.registerModule(new UltraSpinboxModule());
    this.registerModule(new UltraMarkdownModule());
    this.registerModule(new UltraHorizontalModule());
    this.registerModule(new UltraVerticalModule());
    this.registerModule(new UltraSliderModule());
    this.registerModule(new UltraPageBreakModule());
    this.registerModule(new UltraCameraModule());
    this.registerModule(new UltraGraphsModule());
    this.registerModule(new UltraDropdownModule());
    this.registerModule(new UltraLightModule());
    this.registerModule(new UltraAnimatedClockModule());
    this.registerModule(new UltraAnimatedWeatherModule());
    this.registerModule(new UltraAnimatedForecastModule());
    this.registerModule(new UltraExternalCardModule());
  }

  // Register a new module (for core modules or third-party modules)
  public registerModule(module: UltraModule): void {
    const type = module.metadata.type;

    if (this.modules.has(type)) {
      console.warn(`Module with type "${type}" is already registered. Overriding...`);
    }

    this.modules.set(type, module);
    this.updateCategoryMap(module);

    // Module registered successfully
  }

  // Unregister a module
  public unregisterModule(type: string): boolean {
    const module = this.modules.get(type);
    if (!module) {
      return false;
    }

    this.modules.delete(type);
    this.updateCategoryMaps();

    return true;
  }

  // Get a specific module by type
  public getModule(type: string): UltraModule | undefined {
    return this.modules.get(type);
  }

  // Get all registered modules
  public getAllModules(): UltraModule[] {
    return Array.from(this.modules.values());
  }

  // Get modules by category
  public getModulesByCategory(category: string): UltraModule[] {
    return this.modulesByCategory.get(category) || [];
  }

  // Get all available categories
  public getCategories(): string[] {
    return Array.from(this.modulesByCategory.keys());
  }

  // Get module metadata for all modules
  public getAllModuleMetadata(): ModuleMetadata[] {
    return this.getAllModules().map(module => module.metadata);
  }

  // Search modules by tags or text
  public searchModules(query: string): UltraModule[] {
    const searchTerm = query.toLowerCase();
    return this.getAllModules().filter(module => {
      const metadata = module.metadata;
      return (
        metadata.title.toLowerCase().includes(searchTerm) ||
        metadata.description.toLowerCase().includes(searchTerm) ||
        metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        metadata.type.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Create a default instance of a module
  public createDefaultModule(type: string, id?: string, hass?: any): CardModule | null {
    const module = this.getModule(type);
    if (!module) {
      console.error(`Module type "${type}" not found in registry`);
      return null;
    }

    try {
      // Check if the module's createDefault method accepts hass parameter
      const defaultModule = (module as any).createDefault(id, hass);
      return defaultModule;
    } catch (error) {
      console.error(`Error creating default module for type "${type}":`, error);
      return null;
    }
  }

  // Validate a module configuration
  public validateModule(moduleConfig: CardModule): { valid: boolean; errors: string[] } {
    const module = this.getModule(moduleConfig.type);
    if (!module) {
      return {
        valid: false,
        errors: [`Unknown module type: ${moduleConfig.type}`],
      };
    }

    return module.validate(moduleConfig);
  }

  // Get combined CSS for all registered modules
  public getAllModuleStyles(): string {
    let combinedStyles = '';

    for (const module of this.getAllModules()) {
      if (module.getStyles) {
        combinedStyles += `\n/* Styles for ${module.metadata.title} */\n`;
        combinedStyles += module.getStyles();
        combinedStyles += '\n';
      }
    }

    // Add common form styles
    combinedStyles += this.getCommonFormStyles();

    return combinedStyles;
  }

  // Check if a module type is registered
  public isModuleRegistered(type: string): boolean {
    return this.modules.has(type);
  }

  // Get module statistics
  public getRegistryStats(): {
    totalModules: number;
    modulesByCategory: Record<string, number>;
    authors: string[];
  } {
    const modules = this.getAllModules();
    const modulesByCategory: Record<string, number> = {};
    const authors = new Set<string>();

    modules.forEach(module => {
      const category = module.metadata.category;
      modulesByCategory[category] = (modulesByCategory[category] || 0) + 1;
      authors.add(module.metadata.author);
    });

    return {
      totalModules: modules.length,
      modulesByCategory,
      authors: Array.from(authors),
    };
  }

  // Update the category map for a specific module
  private updateCategoryMap(module: UltraModule): void {
    const category = module.metadata.category;
    if (!this.modulesByCategory.has(category)) {
      this.modulesByCategory.set(category, []);
    }

    const categoryModules = this.modulesByCategory.get(category)!;
    const existingIndex = categoryModules.findIndex(m => m.metadata.type === module.metadata.type);

    if (existingIndex >= 0) {
      categoryModules[existingIndex] = module;
    } else {
      categoryModules.push(module);
    }
  }

  // Rebuild all category maps
  private updateCategoryMaps(): void {
    this.modulesByCategory.clear();
    this.getAllModules().forEach(module => this.updateCategoryMap(module));
  }

  // Common form styles for all modules
  private getCommonFormStyles(): string {
    return `
      /* Common form styles for all modules */
      .module-general-settings {
        padding: 0;
      }
      
      .form-field {
        margin-bottom: 16px;
      }
      
      .form-label {
        display: block;
        font-weight: 500;
        margin-bottom: 4px;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      
      .form-description {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
        line-height: 1.3;
      }

      /* Container Module Global Styles */
      .container-module {
        --container-drag-handle-opacity: 0.8;
        --container-badge-opacity: 0.9;
      }

      .container-module:hover {
        --container-drag-handle-opacity: 1;
        --container-badge-opacity: 1;
      }

      /* Container-specific colors that can be overridden by individual modules */
      .horizontal-module-preview.container-module {
        --container-primary-color: #9c27b0; /* Purple for horizontal */
        --container-secondary-color: #e1bee7;
        --container-accent-color: #7b1fa2;
        --container-border-color: #ba68c8;
      }

      .vertical-module-preview.container-module {
        --container-primary-color: #3f51b5; /* Indigo for vertical */
        --container-secondary-color: #c5cae9;
        --container-accent-color: #303f9f;
        --container-border-color: #7986cb;
      }

      .slider-module-preview.container-module {
        --container-primary-color: #00bcd4; /* Cyan for slider */
        --container-secondary-color: #b2ebf2;
        --container-accent-color: #0097a7;
        --container-border-color: #4dd0e1;
      }
      
      .form-field input[type="text"],
      .form-field input[type="number"],
      .form-field select,
      .form-field textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
      }
      
      .form-field input[type="color"] {
        width: 60px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        background: none;
      }
      
      .form-field input:focus,
      .form-field select:focus,
      .form-field textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }
      
      .form-field textarea {
        resize: vertical;
        min-height: 60px;
        font-family: monospace;
      }
      
      .checkbox-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
        color: var(--primary-text-color);
      }
      
      .checkbox-wrapper input[type="checkbox"] {
        margin: 0;
        cursor: pointer;
      }
      
      .checkbox-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;
        margin-top: 8px;
      }
    `;
  }
}

// Export a convenience function to get the registry instance
export const getModuleRegistry = () => ModuleRegistry.getInstance();

// Export types for external module developers
export type { UltraModule, ModuleMetadata } from './base-module';
export { BaseUltraModule } from './base-module';
