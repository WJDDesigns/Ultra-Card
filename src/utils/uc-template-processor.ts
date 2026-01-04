import { HomeAssistant } from 'custom-card-helpers';
import { ucCustomVariablesService } from '../services/uc-custom-variables-service';

/**
 * Template processor for Ultra Card custom variables
 * Preprocesses templates to replace $variable_name references with resolved values
 * Must be called BEFORE sending templates to Home Assistant for Jinja evaluation
 */

/**
 * Preprocess a template string, replacing all $variable references with their resolved values
 * @param template The template string containing $variable references
 * @param hass HomeAssistant instance for entity state lookup
 * @returns The processed template with variables replaced
 */
export function preprocessTemplateVariables(template: string, hass: HomeAssistant): string {
  if (!template || typeof template !== 'string') {
    return template;
  }

  // Find all $variable_name references in the template
  // Matches: $variable, $my_var, $sensor_1, etc.
  // Does NOT match: $$variable (escaped), $123 (must start with letter)
  const variablePattern = /(?<!\$)\$([a-zA-Z][a-zA-Z0-9_]*)/g;

  let processedTemplate = template;
  const matches = [...template.matchAll(variablePattern)];

  // Process matches in reverse order to preserve string positions
  const uniqueMatches = new Map<string, { fullMatch: string; variableName: string }>();
  for (const match of matches) {
    uniqueMatches.set(match[0], {
      fullMatch: match[0],
      variableName: match[1],
    });
  }

  for (const { fullMatch, variableName } of uniqueMatches.values()) {
    const resolvedValue = ucCustomVariablesService.resolveVariable(variableName, hass);

    if (resolvedValue !== null) {
      // Replace all occurrences of this variable
      processedTemplate = processedTemplate.split(fullMatch).join(resolvedValue);
    }
    // If variable not found, leave it unchanged (might be a Jinja variable)
  }

  // Handle escaped variables: $$ -> $
  processedTemplate = processedTemplate.replace(/\$\$/g, '$');

  return processedTemplate;
}

/**
 * Check if a template contains any custom variable references
 * @param template The template string to check
 * @returns True if the template contains $variable references
 */
export function hasCustomVariables(template: string): boolean {
  if (!template || typeof template !== 'string') {
    return false;
  }

  // Check for $variable pattern (not escaped $$)
  const variablePattern = /(?<!\$)\$([a-zA-Z][a-zA-Z0-9_]*)/;
  return variablePattern.test(template);
}

/**
 * Extract all variable names from a template
 * @param template The template string to parse
 * @returns Array of unique variable names found in the template
 */
export function extractVariableNames(template: string): string[] {
  if (!template || typeof template !== 'string') {
    return [];
  }

  const variablePattern = /(?<!\$)\$([a-zA-Z][a-zA-Z0-9_]*)/g;
  const matches = [...template.matchAll(variablePattern)];
  const uniqueNames = new Set(matches.map(m => m[1]));

  return Array.from(uniqueNames);
}

/**
 * Validate that all variables in a template are defined
 * @param template The template string to validate
 * @returns Object with valid flag and list of undefined variables
 */
export function validateTemplateVariables(template: string): {
  valid: boolean;
  undefinedVariables: string[];
  definedVariables: string[];
} {
  const variableNames = extractVariableNames(template);
  const definedVariables: string[] = [];
  const undefinedVariables: string[] = [];

  for (const name of variableNames) {
    if (ucCustomVariablesService.hasVariable(name)) {
      definedVariables.push(name);
    } else {
      undefinedVariables.push(name);
    }
  }

  return {
    valid: undefinedVariables.length === 0,
    undefinedVariables,
    definedVariables,
  };
}

/**
 * Get suggestions for variable autocomplete
 * @param partial Partial variable name to match
 * @returns Array of matching variable names
 */
export function getVariableSuggestions(partial: string): string[] {
  const allNames = ucCustomVariablesService.getVariableNames();

  if (!partial) {
    return allNames;
  }

  const lowerPartial = partial.toLowerCase();
  return allNames.filter(name => name.toLowerCase().startsWith(lowerPartial));
}

/**
 * Create a template preview with variables highlighted
 * @param template The template string
 * @param hass HomeAssistant instance
 * @returns HTML string with variables highlighted and resolved values shown
 */
export function createTemplatePreview(template: string, hass: HomeAssistant): string {
  if (!template || typeof template !== 'string') {
    return template;
  }

  const variablePattern = /(?<!\$)\$([a-zA-Z][a-zA-Z0-9_]*)/g;

  return template.replace(variablePattern, (match, variableName) => {
    const resolvedValue = ucCustomVariablesService.resolveVariable(variableName, hass);

    if (resolvedValue !== null) {
      return `<span class="uc-variable-resolved" title="$${variableName} → ${resolvedValue}">${resolvedValue}</span>`;
    } else {
      return `<span class="uc-variable-undefined" title="Variable '$${variableName}' is not defined">${match}</span>`;
    }
  });
}

/**
 * Recursively scan an object for all string values that contain $variable references
 * @param obj The object to scan (typically a card config)
 * @returns Array of unique variable names found in the config
 */
export function scanConfigForVariables(obj: any): string[] {
  const allVariables = new Set<string>();

  function scanValue(value: any): void {
    if (typeof value === 'string') {
      const vars = extractVariableNames(value);
      if (vars.length > 0) {
        console.log('[UC Variable Scan] Found variables in string:', value, '->', vars);
      }
      vars.forEach(v => allVariables.add(v));
    } else if (Array.isArray(value)) {
      value.forEach(item => scanValue(item));
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(v => scanValue(v));
    }
  }

  scanValue(obj);
  const result = Array.from(allVariables);
  console.log('[UC Variable Scan] Total variables found:', result);
  return result;
}

/**
 * Find variables used in a config that are not defined in the user's variables
 * @param config The card configuration to scan
 * @returns Array of variable names that are used but not defined
 */
export function findMissingVariables(config: any): string[] {
  console.log('[UC Variable Check] Scanning config for missing variables...');
  console.log('[UC Variable Check] Currently defined variables:', ucCustomVariablesService.getVariableNames());
  const usedVariables = scanConfigForVariables(config);
  const missingVariables: string[] = [];

  for (const varName of usedVariables) {
    const hasVar = ucCustomVariablesService.hasVariable(varName);
    console.log(`[UC Variable Check] Variable "${varName}" exists:`, hasVar);
    if (!hasVar) {
      missingVariables.push(varName);
    }
  }

  console.log('[UC Variable Check] Missing variables:', missingVariables);
  return missingVariables;
}
