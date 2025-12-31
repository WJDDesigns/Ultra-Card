import { HomeAssistant } from 'custom-card-helpers';
import { DisplayCondition } from '../types';
/**
 * Service for evaluating display conditions and controlling element visibility
 */
export declare class LogicService {
    private static instance;
    private hass;
    private templateService;
    private loggedEntityErrors;
    private loggedAttributeErrors;
    private constructor();
    static getInstance(): LogicService;
    setHass(hass: HomeAssistant): void;
    /**
     * Clean up all active subscriptions
     */
    cleanup(): void;
    /**
     * Evaluate display conditions to determine if an element should be visible
     * @param conditions Array of display conditions
     * @param displayMode 'always' | 'every' | 'any' - how to combine conditions
     * @returns true if element should be visible, false otherwise
     */
    evaluateDisplayConditions(conditions: DisplayCondition[], displayMode?: 'always' | 'every' | 'any'): boolean;
    /**
     * Evaluate display for a module that may have template_mode enabled
     * @param module The module to evaluate
     * @returns true if element should be visible, false otherwise
     */
    evaluateModuleVisibility(module: any): boolean;
    /**
     * Evaluate display for a row that may have template_mode enabled
     * @param row The row to evaluate
     * @returns true if element should be visible, false otherwise
     */
    evaluateRowVisibility(row: any): boolean;
    /**
     * Evaluate display for a column that may have template_mode enabled
     * @param column The column to evaluate
     * @returns true if element should be visible, false otherwise
     */
    evaluateColumnVisibility(column: any): boolean;
    /**
     * Evaluate a single display condition
     */
    private evaluateSingleCondition;
    /**
     * Evaluate entity state condition (similar to entity but explicitly for state)
     */
    private evaluateEntityStateCondition;
    /**
     * Evaluate entity attribute condition
     */
    private evaluateEntityAttributeCondition;
    /**
     * Evaluate time-based condition
     */
    private evaluateTimeCondition;
    /**
     * Evaluate template-based condition
     */
    private evaluateTemplateCondition;
    /**
     * Try to parse a value as a number
     */
    private tryParseNumber;
    /**
     * Evaluate logic properties from the global design tab
     */
    evaluateLogicProperties(properties: {
        logic_entity?: string;
        logic_attribute?: string;
        logic_operator?: string;
        logic_value?: string;
    }): boolean;
    /**
     * Simple, stable string hash for template keys
     */
    private _hashString;
}
export declare const logicService: LogicService;
