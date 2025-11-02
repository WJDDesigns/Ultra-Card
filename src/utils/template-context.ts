import { HomeAssistant } from 'custom-card-helpers';

/**
 * Builds entity context variables for unified templates
 * Provides access to entity data, attributes, and helper functions
 * Similar to Mushroom Card's template system
 */

/**
 * Build complete entity context for template evaluation
 * @param entityId The entity ID to build context for
 * @param hass Home Assistant instance
 * @param config Optional config object (icon config, entity config, etc.)
 * @returns Context object with entity data and helper functions
 */
export function buildEntityContext(
  entityId: string,
  hass: HomeAssistant,
  config?: any
): Record<string, any> {
  const entityState = hass?.states?.[entityId];

  if (!entityState) {
    // Entity doesn't exist - return minimal context
    return {
      entity: entityId,
      state: 'unavailable',
      name: config?.name || entityId,
      attributes: {},
      unit: '',
      domain: entityId.split('.')[0] || 'unknown',
      device_class: '',
      friendly_name: config?.name || entityId,
      config: config || {},
    };
  }

  const domain = entityId.split('.')[0];
  const attributes = entityState.attributes || {};

  // Build context object
  const context: Record<string, any> = {
    // Primary entity reference (like Mushroom Card)
    entity: entityId,

    // Current state value
    state: entityState.state,

    // Name (custom name or friendly name)
    name: config?.name || attributes.friendly_name || entityId,

    // All entity attributes
    attributes: attributes,

    // Convenience accessors
    unit: attributes.unit_of_measurement || '',
    domain: domain,
    device_class: attributes.device_class || '',
    friendly_name: attributes.friendly_name || '',

    // Config access (icon config, entity config, etc.)
    config: config || {},

    // Computed helpers
    state_number: parseFloat(entityState.state),
    state_boolean: entityState.state === 'on' || entityState.state === 'true' || entityState.state === 'yes',
  };

  return context;
}

/**
 * Build context for multiple entities (for modules with multiple entity configs)
 * @param entities Array of entity IDs
 * @param hass Home Assistant instance
 * @param configs Optional array of config objects matching entity array
 * @returns Context object with array of entity contexts
 */
export function buildMultiEntityContext(
  entities: string[],
  hass: HomeAssistant,
  configs?: any[]
): Record<string, any> {
  const entityContexts = entities.map((entityId, index) => {
    const config = configs?.[index];
    return buildEntityContext(entityId, hass, config);
  });

  // Return first entity as primary context + entities array
  const primaryContext = entityContexts[0] || {
    entity: '',
    state: 'unavailable',
    name: '',
    attributes: {},
    unit: '',
    domain: 'unknown',
    device_class: '',
    friendly_name: '',
    config: {},
  };

  return {
    ...primaryContext,
    entities: entityContexts, // Access other entities via entities[0], entities[1], etc.
  };
}

/**
 * Check if a template result is valid JSON
 * @param result Template result string
 * @returns True if valid JSON
 */
export function isJsonResult(result: string): boolean {
  if (!result || typeof result !== 'string') return false;
  const trimmed = result.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) || 
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
}

/**
 * Safely parse JSON template result
 * @param result Template result string
 * @returns Parsed object or null if invalid
 */
export function parseJsonResult(result: string): Record<string, any> | null {
  if (!isJsonResult(result)) return null;
  
  try {
    return JSON.parse(result.trim());
  } catch (error) {
    console.warn('[UltraCard] Failed to parse JSON template result:', error);
    return null;
  }
}

