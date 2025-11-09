/**
 * Unified Template Parser
 * Handles parsing of unified template results (string or JSON)
 * Validates JSON structure and provides helpful error messages
 */

export interface UnifiedTemplateResult {
  // Display properties (icon module)
  icon?: string;
  icon_color?: string;

  // Display properties (general)
  name?: string;
  name_color?: string;
  state_text?: string;
  state_color?: string;

  // Display properties (text/content modules)
  content?: string;
  color?: string;

  // Display properties (bar module)
  value?: number | string;
  label?: string;

  // Display properties (graphs module)
  colors?: string[]; // Array of colors for per-entity coloring
  global_color?: string; // Single color applied to all entities
  fill_area?: boolean; // Control line chart area fill
  pie_fill?: number | string; // Control pie/donut slice fill percentage

  // Display properties (spinbox module)
  button_background_color?: string;
  button_text_color?: string;
  value_color?: string;

  // Display properties (camera module)
  entity?: string; // Camera entity ID
  visible?: boolean; // Visibility control
  overlay_text?: string; // Overlay text to display
  overlay_color?: string; // Overlay text color

  // Error information
  _error?: string;
  _isString?: boolean; // True if result was a simple string (not JSON)
}

/**
 * Parse unified template result
 * Supports both simple string returns and JSON object returns
 * @param templateResult The raw template result from HA
 * @returns Parsed result object with display properties
 */
export function parseUnifiedTemplate(templateResult: any): UnifiedTemplateResult {
  if (templateResult === undefined || templateResult === null) {
    return { _error: 'Template returned undefined or null' };
  }

  // If Home Assistant returns an object directly (not a string), use it as-is
  if (typeof templateResult === 'object' && !Array.isArray(templateResult)) {
    // Sanitize and validate properties
    const result: UnifiedTemplateResult = {};

    // Icon module properties
    if (templateResult.icon !== undefined) result.icon = String(templateResult.icon);
    if (templateResult.icon_color !== undefined)
      result.icon_color = String(templateResult.icon_color);
    if (templateResult.name !== undefined) result.name = String(templateResult.name);
    if (templateResult.name_color !== undefined)
      result.name_color = String(templateResult.name_color);
    if (templateResult.state_text !== undefined)
      result.state_text = String(templateResult.state_text);
    if (templateResult.state_color !== undefined)
      result.state_color = String(templateResult.state_color);

    // Text/content module properties
    if (templateResult.content !== undefined) result.content = String(templateResult.content);
    if (templateResult.color !== undefined) result.color = String(templateResult.color);

    // Bar module properties
    if (templateResult.value !== undefined) result.value = templateResult.value;
    if (templateResult.label !== undefined) result.label = String(templateResult.label);

    // Graphs module properties
    if (templateResult.colors !== undefined && Array.isArray(templateResult.colors)) {
      result.colors = templateResult.colors.map(c => String(c));
    }
    if (templateResult.global_color !== undefined)
      result.global_color = String(templateResult.global_color);
    if (templateResult.fill_area !== undefined)
      result.fill_area = Boolean(templateResult.fill_area);
    if (templateResult.pie_fill !== undefined) {
      const pieFill = typeof templateResult.pie_fill === 'number' 
        ? templateResult.pie_fill 
        : parseFloat(String(templateResult.pie_fill));
      if (!isNaN(pieFill)) result.pie_fill = pieFill;
    }

    // Spinbox module properties
    if (templateResult.button_background_color !== undefined)
      result.button_background_color = String(templateResult.button_background_color);
    if (templateResult.button_text_color !== undefined)
      result.button_text_color = String(templateResult.button_text_color);
    if (templateResult.value_color !== undefined)
      result.value_color = String(templateResult.value_color);

    // Camera module properties
    if (templateResult.entity !== undefined) result.entity = String(templateResult.entity);
    if (templateResult.visible !== undefined) result.visible = Boolean(templateResult.visible);
    if (templateResult.overlay_text !== undefined)
      result.overlay_text = String(templateResult.overlay_text);
    if (templateResult.overlay_color !== undefined)
      result.overlay_color = String(templateResult.overlay_color);

    return result;
  }

  const resultStr = String(templateResult).trim();

  if (resultStr === '') {
    return { _error: 'Template returned empty string' };
  }

  // Check if result is JSON string
  if (
    (resultStr.startsWith('{') && resultStr.endsWith('}')) ||
    (resultStr.startsWith('[') && resultStr.endsWith(']'))
  ) {
    try {
      const parsed = JSON.parse(resultStr);

      // Validate it's an object (not array)
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {
          _error: 'Template must return an object, not an array',
        };
      }

      // Sanitize and validate properties
      const result: UnifiedTemplateResult = {};

      // Icon module properties
      if (parsed.icon !== undefined) result.icon = String(parsed.icon);
      if (parsed.icon_color !== undefined) result.icon_color = String(parsed.icon_color);
      if (parsed.name !== undefined) result.name = String(parsed.name);
      if (parsed.name_color !== undefined) result.name_color = String(parsed.name_color);
      if (parsed.state_text !== undefined) result.state_text = String(parsed.state_text);
      if (parsed.state_color !== undefined) result.state_color = String(parsed.state_color);

      // Text/content module properties
      if (parsed.content !== undefined) result.content = String(parsed.content);
      if (parsed.color !== undefined) result.color = String(parsed.color);

      // Bar module properties
      if (parsed.value !== undefined) result.value = parsed.value;
      if (parsed.label !== undefined) result.label = String(parsed.label);

      // Graphs module properties
      if (parsed.colors !== undefined && Array.isArray(parsed.colors)) {
        result.colors = parsed.colors.map(c => String(c));
      }
      if (parsed.global_color !== undefined)
        result.global_color = String(parsed.global_color);
      if (parsed.fill_area !== undefined)
        result.fill_area = Boolean(parsed.fill_area);
      if (parsed.pie_fill !== undefined) {
        const pieFill = typeof parsed.pie_fill === 'number' 
          ? parsed.pie_fill 
          : parseFloat(String(parsed.pie_fill));
        if (!isNaN(pieFill)) result.pie_fill = pieFill;
      }

      // Spinbox module properties
      if (parsed.button_background_color !== undefined)
        result.button_background_color = String(parsed.button_background_color);
      if (parsed.button_text_color !== undefined)
        result.button_text_color = String(parsed.button_text_color);
      if (parsed.value_color !== undefined)
        result.value_color = String(parsed.value_color);

      // Camera module properties
      if (parsed.entity !== undefined) result.entity = String(parsed.entity);
      if (parsed.visible !== undefined) result.visible = Boolean(parsed.visible);
      if (parsed.overlay_text !== undefined)
        result.overlay_text = String(parsed.overlay_text);
      if (parsed.overlay_color !== undefined)
        result.overlay_color = String(parsed.overlay_color);

      return result;
    } catch (error) {
      return {
        _error: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Simple string return - treat as icon name (backward compatible)
  return {
    icon: resultStr,
    _isString: true,
  };
}

/**
 * Check if a template result has errors
 * @param result Parsed template result
 * @returns True if result has errors
 */
export function hasTemplateError(result: UnifiedTemplateResult): boolean {
  return result._error !== undefined;
}

/**
 * Get error message from template result
 * @param result Parsed template result
 * @returns Error message or null
 */
export function getTemplateError(result: UnifiedTemplateResult): string | null {
  return result._error || null;
}

/**
 * Check if result was a simple string (not JSON)
 * @param result Parsed template result
 * @returns True if original result was a string
 */
export function isStringResult(result: UnifiedTemplateResult): boolean {
  return result._isString === true;
}

/**
 * Validate unified template syntax (basic checks before evaluation)
 * @param template Template string
 * @returns Validation result with errors if any
 */
export function validateUnifiedTemplate(template: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template || template.trim() === '') {
    errors.push('Template is empty');
    return { valid: false, errors };
  }

  const trimmed = template.trim();

  // Check for unclosed Jinja2 tags
  const openBraces = (trimmed.match(/\{\{/g) || []).length;
  const closeBraces = (trimmed.match(/\}\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unclosed {{ }} template expression');
  }

  const openStatements = (trimmed.match(/\{%/g) || []).length;
  const closeStatements = (trimmed.match(/%\}/g) || []).length;
  if (openStatements !== closeStatements) {
    errors.push('Unclosed {% %} template statement');
  }

  // Check for common mistakes
  if (trimmed.includes('{{states.') && !trimmed.includes('}}')) {
    errors.push('Incomplete states access - missing }}');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
