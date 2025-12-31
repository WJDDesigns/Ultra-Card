import { HomeAssistant } from 'custom-card-helpers';
import { DisplayCondition } from '../types';
import { TemplateService } from './template-service';

/**
 * Service for evaluating display conditions and controlling element visibility
 */
export class LogicService {
  private static instance: LogicService;
  private hass: HomeAssistant | null = null;
  private templateService: TemplateService | null = null;
  // Removed API fallback tracking - relying entirely on WebSocket subscriptions
  // Track logged entity errors to prevent console flooding
  private loggedEntityErrors: Set<string> = new Set();
  private loggedAttributeErrors: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): LogicService {
    if (!LogicService.instance) {
      LogicService.instance = new LogicService();
    }
    return LogicService.instance;
  }

  public setHass(hass: HomeAssistant): void {
    this.hass = hass;
    // Clean up old template service before creating a new one to prevent WebSocket subscription leaks
    if (this.templateService) {
      this.templateService.unsubscribeAllTemplates();
    }
    // Initialize template service when hass is available
    if (hass) {
      this.templateService = new TemplateService(hass);
    }
    // Note: We do NOT clear logged errors here because setHass is called frequently
    // on every hass state update. Clearing would reset throttling and cause console flooding.
    // Errors are only cleared on cleanup() when the service is fully reset.
  }

  /**
   * Clean up all active subscriptions
   */
  public cleanup(): void {
    if (this.templateService) {
      this.templateService.unsubscribeAllTemplates();
      this.templateService = null;
    }
    this.hass = null;
    // Clear logged errors on cleanup
    this.loggedEntityErrors.clear();
    this.loggedAttributeErrors.clear();
  }

  /**
   * Evaluate display conditions to determine if an element should be visible
   * @param conditions Array of display conditions
   * @param displayMode 'always' | 'every' | 'any' - how to combine conditions
   * @returns true if element should be visible, false otherwise
   */
  public evaluateDisplayConditions(
    conditions: DisplayCondition[],
    displayMode: 'always' | 'every' | 'any' = 'always'
  ): boolean {
    if (!this.hass) {
      console.warn('[LogicService] HomeAssistant instance not available');
      return true; // Show by default if hass not available
    }

    // Always show if mode is 'always' or no conditions
    if (displayMode === 'always' || !conditions || conditions.length === 0) {
      return true;
    }

    // Evaluate each condition (conditions are always active)
    const conditionResults = conditions.map(condition => this.evaluateSingleCondition(condition));

    // Apply display mode logic
    switch (displayMode) {
      case 'every':
        return conditionResults.every(result => result);
      case 'any':
        return conditionResults.some(result => result);
      default:
        return true;
    }
  }

  /**
   * Evaluate display for a module that may have template_mode enabled
   * @param module The module to evaluate
   * @returns true if element should be visible, false otherwise
   */
  public evaluateModuleVisibility(module: any): boolean {
    if (!this.hass) {
      console.warn('[LogicService] HomeAssistant instance not available');
      return true; // Show by default if hass not available
    }

    const displayMode = module.display_mode || 'always';

    // If display mode is "always", show the module regardless of template content
    if (displayMode === 'always') {
      return true;
    }

    // For "every" or "any" modes, ONLY evaluate conditions from the Logic tab
    // The value template (module.template) is for rendering the value, NOT for visibility
    const conditions: DisplayCondition[] = [...(module.display_conditions || [])];

    // REMOVED: Do NOT add the value template as a display condition
    // The value template should only control what text is displayed, not visibility
    // Users add visibility conditions explicitly in the Logic tab via display_conditions

    return this.evaluateDisplayConditions(conditions, displayMode);
  }

  /**
   * Evaluate display for a row that may have template_mode enabled
   * @param row The row to evaluate
   * @returns true if element should be visible, false otherwise
   */
  public evaluateRowVisibility(row: any): boolean {
    if (!this.hass) {
      console.warn('[LogicService] HomeAssistant instance not available');
      return true; // Show by default if hass not available
    }

    // Check if template mode is enabled
    if (row.template_mode && row.template) {
      // Use template evaluation directly
      const condition: DisplayCondition = {
        id: `template_${row.id}`,
        type: 'template',
        template: row.template,
      };
      return this.evaluateTemplateCondition(condition);
    }

    // Fall back to normal condition evaluation
    return this.evaluateDisplayConditions(
      row.display_conditions || [],
      row.display_mode || 'always'
    );
  }

  /**
   * Evaluate display for a column that may have template_mode enabled
   * @param column The column to evaluate
   * @returns true if element should be visible, false otherwise
   */
  public evaluateColumnVisibility(column: any): boolean {
    if (!this.hass) {
      console.warn('[LogicService] HomeAssistant instance not available');
      return true; // Show by default if hass not available
    }

    // Check if template mode is enabled
    if (column.template_mode && column.template) {
      // Use template evaluation directly
      const condition: DisplayCondition = {
        id: `template_${column.id}`,
        type: 'template',
        template: column.template,
      };
      return this.evaluateTemplateCondition(condition);
    }

    // Fall back to normal condition evaluation
    return this.evaluateDisplayConditions(
      column.display_conditions || [],
      column.display_mode || 'always'
    );
  }

  /**
   * Evaluate a single display condition
   */
  private evaluateSingleCondition(condition: DisplayCondition): boolean {
    // Treat undefined enabled as true; only skip when explicitly false
    if (condition.enabled === false) {
      return true; // Disabled conditions are considered "passed"
    }

    switch (condition.type) {
      case 'entity_state':
        return this.evaluateEntityStateCondition(condition);
      case 'entity_attribute':
        return this.evaluateEntityAttributeCondition(condition);
      case 'time':
        return this.evaluateTimeCondition(condition);
      case 'template':
        return this.evaluateTemplateCondition(condition);
      // Legacy support for old 'entity' type - treat as entity_state
      case 'entity' as any:
        return this.evaluateEntityStateCondition(condition);
      default:
        console.warn('[LogicService] Unknown condition type:', condition.type);
        return true; // Unknown conditions default to true
    }
  }

  /**
   * Evaluate entity state condition (similar to entity but explicitly for state)
   */
  private evaluateEntityStateCondition(condition: DisplayCondition): boolean {
    if (!condition.entity || !this.hass) {
      return true; // Show by default if no entity or hass available
    }

    const entity = this.hass.states[condition.entity];
    if (!entity) {
      // Track logged errors to prevent console flooding
      this.loggedEntityErrors.add(condition.entity);
      return true; // Show by default if entity not found
    }

    const operator = condition.operator || '=';
    const targetValue = condition.value;
    const currentValue = entity.state;

    switch (operator) {
      case '=':
        return currentValue === String(targetValue);
      case '!=':
        return currentValue !== String(targetValue);
      case '>':
        const numCurrent = this.tryParseNumber(currentValue);
        const numTarget = this.tryParseNumber(targetValue);
        return numCurrent !== null && numTarget !== null && numCurrent > numTarget;
      case '>=':
        const numCurrentGte = this.tryParseNumber(currentValue);
        const numTargetGte = this.tryParseNumber(targetValue);
        return numCurrentGte !== null && numTargetGte !== null && numCurrentGte >= numTargetGte;
      case '<':
        const numCurrentLt = this.tryParseNumber(currentValue);
        const numTargetLt = this.tryParseNumber(targetValue);
        return numCurrentLt !== null && numTargetLt !== null && numCurrentLt < numTargetLt;
      case '<=':
        const numCurrentLte = this.tryParseNumber(currentValue);
        const numTargetLte = this.tryParseNumber(targetValue);
        return numCurrentLte !== null && numTargetLte !== null && numCurrentLte <= numTargetLte;
      case 'contains':
        return String(currentValue).toLowerCase().includes(String(targetValue).toLowerCase());
      case 'not_contains':
        return !String(currentValue).toLowerCase().includes(String(targetValue).toLowerCase());
      case 'has_value':
        return currentValue !== null && currentValue !== undefined && currentValue !== '';
      case 'no_value':
        return currentValue === null || currentValue === undefined || currentValue === '';
      default:
        console.warn(`[LogicService] Unknown operator: ${operator}`);
        return true;
    }
  }

  /**
   * Evaluate entity attribute condition
   */
  private evaluateEntityAttributeCondition(condition: DisplayCondition): boolean {
    if (!condition.entity || !condition.attribute || !this.hass) {
      return true; // Show by default if no entity, attribute, or hass available
    }

    const entity = this.hass.states[condition.entity];
    if (!entity) {
      // Track logged errors to prevent console flooding
      this.loggedEntityErrors.add(condition.entity);
      return true; // Show by default if entity not found
    }

    const attributeValue = entity.attributes[condition.attribute];
    if (attributeValue === undefined) {
      // Only log each attribute error once to prevent console flooding
      const attributeKey = `${condition.entity}.${condition.attribute}`;
      if (!this.loggedAttributeErrors.has(attributeKey)) {
        console.warn(
          `[LogicService] Attribute '${condition.attribute}' not found on entity '${condition.entity}'`
        );
        this.loggedAttributeErrors.add(attributeKey);
      }
      return true; // Show by default if attribute not found
    }

    const operator = condition.operator || '=';
    const targetValue = condition.value;
    const currentValue = attributeValue;

    switch (operator) {
      case '=':
        return String(currentValue) === String(targetValue);
      case '!=':
        return String(currentValue) !== String(targetValue);
      case '>':
        const numCurrent = this.tryParseNumber(currentValue);
        const numTarget = this.tryParseNumber(targetValue);
        return numCurrent !== null && numTarget !== null && numCurrent > numTarget;
      case '>=':
        const numCurrentGte = this.tryParseNumber(currentValue);
        const numTargetGte = this.tryParseNumber(targetValue);
        return numCurrentGte !== null && numTargetGte !== null && numCurrentGte >= numTargetGte;
      case '<':
        const numCurrentLt = this.tryParseNumber(currentValue);
        const numTargetLt = this.tryParseNumber(targetValue);
        return numCurrentLt !== null && numTargetLt !== null && numCurrentLt < numTargetLt;
      case '<=':
        const numCurrentLte = this.tryParseNumber(currentValue);
        const numTargetLte = this.tryParseNumber(targetValue);
        return numCurrentLte !== null && numTargetLte !== null && numCurrentLte <= numTargetLte;
      case 'contains':
        return String(currentValue).toLowerCase().includes(String(targetValue).toLowerCase());
      case 'not_contains':
        return !String(currentValue).toLowerCase().includes(String(targetValue).toLowerCase());
      case 'has_value':
        return currentValue !== null && currentValue !== undefined && currentValue !== '';
      case 'no_value':
        return currentValue === null || currentValue === undefined || currentValue === '';
      default:
        console.warn(`[LogicService] Unknown operator: ${operator}`);
        return true;
    }
  }

  /**
   * Evaluate time-based condition
   */
  private evaluateTimeCondition(condition: DisplayCondition): boolean {
    if (!condition.time_from || !condition.time_to) {
      return true;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [fromHour, fromMinute] = condition.time_from.split(':').map(Number);
    const [toHour, toMinute] = condition.time_to.split(':').map(Number);

    const fromTime = fromHour * 60 + fromMinute;
    const toTime = toHour * 60 + toMinute;

    // Handle time ranges that cross midnight
    if (fromTime <= toTime) {
      return currentTime >= fromTime && currentTime <= toTime;
    } else {
      return currentTime >= fromTime || currentTime <= toTime;
    }
  }

  /**
   * Evaluate template-based condition
   */
  private evaluateTemplateCondition(condition: DisplayCondition): boolean {
    if (!condition.template || !this.hass) {
      return true;
    }

    try {
      // Create a unique key for this template (use only template hash to prevent subscription leaks)
      const templateHash = this._hashString(condition.template);
      const templateKey = `logic_condition_${templateHash}`;

      // If we have a template service, try to get cached result
      if (this.templateService) {
        // Check if we already have a subscription for this template
        if (this.templateService.hasTemplateSubscription(templateKey)) {
          const cachedResult = this.templateService.getTemplateResult(templateKey);
          if (cachedResult !== undefined) {
            return cachedResult;
          }
        } else {
          // Subscribe to the template for future updates
          this.templateService.subscribeToTemplate(condition.template, templateKey, () => {
            // Template result changed, but we can't trigger a re-render from here
            // The parent component should handle this by re-evaluating conditions periodically
          });
        }
      }

      // NOTE: API fallback completely removed to prevent resource exhaustion
      // Template conditions rely entirely on WebSocket subscriptions
      // which are initialized above and update the cache automatically

      // For immediate evaluation, try basic pattern matching
      const template = condition.template;

      // Handle simple {% if %} conditions
      if (template.includes('{% if ') && template.includes(' %}')) {
        // Extract the condition from {% if condition %}
        const ifMatch = template.match(/\{\%\s*if\s+(.+?)\s*\%\}/);
        if (ifMatch) {
          const conditionStr = ifMatch[1];

          // Handle states('entity') == 'value' patterns
          const stateCompareMatch = conditionStr.match(
            /states\(['"]([^'"]+)['"]\)\s*(==|!=)\s*['"]([^'"]+)['"]/
          );
          if (stateCompareMatch) {
            const entityId = stateCompareMatch[1];
            const operator = stateCompareMatch[2];
            const compareValue = stateCompareMatch[3];

            const entity = this.hass.states[entityId];
            if (entity) {
              const entityState = entity.state;
              if (operator === '==') {
                return entityState === compareValue;
              } else if (operator === '!=') {
                return entityState !== compareValue;
              }
            }
          }
        }
      }

      // Handle {{ states('entity') == 'value' }} pattern matching
      const stateComparePattern =
        /\{\{\s*states\(['"]([^'"]+)['"]\)\s*(==|!=)\s*['"]([^'"]+)['"]\s*\}\}/g;
      let match;
      while ((match = stateComparePattern.exec(template)) !== null) {
        const entityId = match[1];
        const operator = match[2];
        const compareValue = match[3];

        const entity = this.hass.states[entityId];
        if (entity) {
          const entityState = entity.state;
          let result = false;

          if (operator === '==') {
            result = entityState === compareValue;
          } else if (operator === '!=') {
            result = entityState !== compareValue;
          }

          // If this is the only pattern in the template, return the result directly
          if (template.trim() === match[0].trim()) {
            return result;
          }
        }
      }

      // Simple {{ states('entity.id') }} pattern matching for basic conditions
      const statePattern = /\{\{\s*states\(['"]([^'"]+)['"]\)\s*\}\}/g;
      let evaluatedTemplate = template;
      while ((match = statePattern.exec(template)) !== null) {
        const entityId = match[1];
        const entity = this.hass.states[entityId];
        const value = entity ? entity.state : 'unknown';
        evaluatedTemplate = evaluatedTemplate.replace(match[0], value);
      }

      // If the template was simple substitution, try to evaluate the result
      if (evaluatedTemplate !== template) {
        const trimmed = evaluatedTemplate.toLowerCase().trim();
        if (['true', 'on', 'yes', '1'].includes(trimmed)) {
          return true;
        } else if (
          ['false', 'off', 'no', '0', 'unavailable', 'unknown', 'none', ''].includes(trimmed)
        ) {
          return false;
        }
      }

      return true; // Default to true for unrecognized patterns
    } catch (error) {
      return true; // Show by default on error
    }
  }

  /**
   * Try to parse a value as a number
   */
  private tryParseNumber(value: any): number | null {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return !isNaN(parsed) ? parsed : null;
    }

    return null;
  }

  /**
   * Evaluate logic properties from the global design tab
   */
  public evaluateLogicProperties(properties: {
    logic_entity?: string;
    logic_attribute?: string;
    logic_operator?: string;
    logic_value?: string;
  }): boolean {
    if (!properties.logic_entity || !this.hass) {
      return true;
    }

    // Convert to DisplayCondition format
    const condition: DisplayCondition = {
      id: 'logic-property',
      type: properties.logic_attribute ? 'entity_attribute' : 'entity_state',
      entity: properties.logic_entity,
      attribute: properties.logic_attribute,
      operator: (properties.logic_operator as any) || '=',
      value: properties.logic_value,
    };

    return this.evaluateSingleCondition(condition);
  }

  /**
   * Simple, stable string hash for template keys
   */
  private _hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      const chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const logicService = LogicService.getInstance();
