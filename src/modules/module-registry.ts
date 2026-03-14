import { UltraModule, ModuleMetadata } from './base-module';
import { CORE_MANIFESTS } from './module-manifest-data';
import { coreLoaders } from './module-loaders';
import { CardModule } from '../types';

/** Sync metadata-only view for selector/editor; supports future async implementation loading. */
export type ModuleManifest = import('./module-manifest-data').ModuleManifest;

// Module registry class for managing all available modules (manifest-first, lazy implementation loading)
export class ModuleRegistry {
  private static instance: ModuleRegistry;
  /** Loaded module implementations only. */
  private modules = new Map<string, UltraModule>();
  /** In-flight lazy loads keyed by module type so concurrent callers share one import. */
  private pendingLoads = new Map<string, Promise<void>>();
  /** Manifest: type -> metadata. Populated from static manifest; kept in sync when modules are loaded or third-party registered. */
  private manifest = new Map<string, ModuleManifest>();
  /** Category -> type[]. Built from manifest for sync category APIs. */
  private categoryToTypes = new Map<string, string[]>();
  /** Combined styles cache for loaded modules; invalidated when a module is registered. */
  private _stylesCache: string | null = null;
  /** Core types from static manifest; cannot be unregistered from manifest. */
  private _coreTypes = new Set(CORE_MANIFESTS.map(m => m.type));

  private constructor() {
    for (const m of CORE_MANIFESTS) {
      this.manifest.set(m.type, m);
      this._addToCategoryMap(m.type, m.category);
    }
  }

  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  private _addToCategoryMap(type: string, category: string): void {
    if (!this.categoryToTypes.has(category)) {
      this.categoryToTypes.set(category, []);
    }
    const list = this.categoryToTypes.get(category)!;
    if (!list.includes(type)) list.push(type);
  }

  private _rebuildCategoryMap(): void {
    this.categoryToTypes.clear();
    for (const m of this.manifest.values()) {
      this._addToCategoryMap(m.type, m.category);
    }
  }

  // Register a new module (after lazy load or for third-party modules)
  public registerModule(module: UltraModule): void {
    const type = module.metadata.type;
    this.modules.set(type, module);
    this.pendingLoads.delete(type);
    this.manifest.set(type, module.metadata);
    this._addToCategoryMap(type, module.metadata.category);
    this._stylesCache = null;
  }

  // Unregister a module (manifest entry removed only for non-core types)
  public unregisterModule(type: string): boolean {
    if (!this.modules.has(type) && !this.manifest.has(type)) {
      return false;
    }

    this.modules.delete(type);
    if (!this._coreTypes.has(type)) {
      this.manifest.delete(type);
      this._rebuildCategoryMap();
    }
    this._stylesCache = null;
    return true;
  }

  // Get a specific module by type (sync; undefined if not yet loaded)
  public getModule(type: string): UltraModule | undefined {
    return this.modules.get(type);
  }

  /**
   * Sync metadata-only lookup (manifest). Use for selector/editor lists and icons
   * without requiring the full implementation to be loaded.
   */
  public getModuleMetadata(type: string): ModuleManifest | undefined {
    return this.manifest.get(type);
  }

  /**
   * Ensure the module implementation for type is loaded. Resolves when the module is registered.
   * Real implementation boundary: triggers dynamic import and register.
   */
  public ensureModuleLoaded(type: string): Promise<void> {
    if (this.modules.has(type)) return Promise.resolve();
    const pending = this.pendingLoads.get(type);
    if (pending) return pending;

    const loader = coreLoaders[type];
    if (!loader) {
      return Promise.reject(new Error(`No loader for module type "${type}"`));
    }

    const loadPromise = loader()
      .then(module => {
        this.registerModule(module);
      })
      .finally(() => {
        this.pendingLoads.delete(type);
      });
    this.pendingLoads.set(type, loadPromise);
    return loadPromise;
  }

  // Get all loaded modules
  public getAllModules(): UltraModule[] {
    return Array.from(this.modules.values());
  }

  // Get loaded modules by category
  public getModulesByCategory(category: string): UltraModule[] {
    const types = this.categoryToTypes.get(category);
    if (!types) return [];
    return types.map(t => this.modules.get(t)).filter((m): m is UltraModule => m !== undefined);
  }

  // Get all available categories (from manifest)
  public getCategories(): string[] {
    return Array.from(this.categoryToTypes.keys());
  }

  /** Manifest-only: all metadata for selector/editor without loading implementations. */
  public getAllModuleMetadata(): ModuleManifest[] {
    return Array.from(this.manifest.values());
  }

  /** Manifest-only: metadata for a category. */
  public getManifestByCategory(category: string): ModuleManifest[] {
    return Array.from(this.manifest.values()).filter(m => m.category === category);
  }

  /** Manifest-only: search by title, description, tags, type. */
  public searchModuleMetadata(query: string): ModuleManifest[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.manifest.values()).filter(m => {
      return (
        m.title.toLowerCase().includes(searchTerm) ||
        m.description.toLowerCase().includes(searchTerm) ||
        m.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        m.type.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Search modules by tags or text (implementation-backed; prefer searchModuleMetadata for selector)
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

  // Create a default instance of a module (requires module to be loaded; call ensureModuleLoaded first if needed)
  public createDefaultModule(type: string, id?: string, hass?: any): CardModule | null {
    const module = this.getModule(type);
    if (!module) {
      console.error(`Module type "${type}" not found or not yet loaded in registry`);
      return null;
    }

    try {
      const defaultModule = (module as any).createDefault(id, hass);
      return defaultModule;
    } catch (error) {
      console.error(`Error creating default module for type "${type}":`, error);
      return null;
    }
  }

  // Validate a module configuration (requires module to be loaded)
  public validateModule(moduleConfig: CardModule): { valid: boolean; errors: string[] } {
    const module = this.getModule(moduleConfig.type);
    if (!module) {
      return {
        valid: false,
        errors: [`Unknown or not yet loaded module type: ${moduleConfig.type}`],
      };
    }

    return module.validate(moduleConfig);
  }

  // Get combined CSS for all loaded modules (cached; invalidated when a module is registered)
  public getAllModuleStyles(): string {
    if (this._stylesCache !== null) return this._stylesCache;

    let combinedStyles = '';

    for (const module of this.getAllModules()) {
      if (module.getStyles) {
        combinedStyles += `\n/* Styles for ${module.metadata.title} */\n`;
        combinedStyles += module.getStyles();
        combinedStyles += '\n';
      }
    }

    combinedStyles += this.getCommonFormStyles();
    this._stylesCache = combinedStyles;
    return combinedStyles;
  }

  // Check if a module type is registered (in manifest or loaded)
  public isModuleRegistered(type: string): boolean {
    return this.manifest.has(type);
  }

  // Get module statistics (manifest-based so sync without loading all implementations)
  public getRegistryStats(): {
    totalModules: number;
    modulesByCategory: Record<string, number>;
    authors: string[];
  } {
    const modulesByCategory: Record<string, number> = {};
    const authors = new Set<string>();

    for (const m of this.manifest.values()) {
      modulesByCategory[m.category] = (modulesByCategory[m.category] || 0) + 1;
      authors.add(m.author);
    }

    return {
      totalModules: this.manifest.size,
      modulesByCategory,
      authors: Array.from(authors),
    };
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
