import { HomeAssistant } from 'custom-card-helpers';
/**
 * Entity Icon Service
 *
 * Centralized service for determining the appropriate icon for Home Assistant entities.
 * This service attempts to use the same icon computation logic that Home Assistant's
 * entity picker uses, ensuring consistency across the Ultra Card.
 */
export declare class EntityIconService {
    /**
     * Get the icon for an entity, using Home Assistant's native computation when possible
     * @param entityId The entity ID or entity state object
     * @param hass The Home Assistant instance
     * @returns The computed icon string, or null if no icon could be determined
     */
    static getEntityIcon(entityId: string | any, hass: HomeAssistant): string | null;
    /**
     * Get the icon that Home Assistant would naturally compute for this entity
     * This attempts to use the same logic as the entity picker
     */
    private static _getHomeAssistantComputedIcon;
    /**
     * Enhanced icon detection based on entity patterns and characteristics
     */
    private static _getEnhancedIconForEntity;
    private static _isBatteryRelated;
    private static _isChargingRelated;
    private static _getBatteryIcon;
    private static _getChargingBatteryIcon;
    private static _isTemperatureRelated;
    private static _isHumidityRelated;
    private static _isPowerRelated;
    private static _isSignalRelated;
    private static _isDoorWindowRelated;
    private static _isMotionRelated;
    private static _isIlluminanceRelated;
    private static _isPressureRelated;
    private static _getDefaultIconForDomain;
}
