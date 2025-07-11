import { HomeAssistant, ActionConfig } from 'custom-card-helpers';
export interface LinkAction {
    action_type?: 'none' | 'toggle' | 'show_more_info' | 'navigate' | 'url' | 'call_service' | 'perform_action' | 'show_map' | 'voice_assistant' | 'trigger';
    navigation_path?: string;
    url?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
    target?: {
        entity_id?: string | string[];
        device_id?: string | string[];
        area_id?: string | string[];
    };
    entity?: string;
    latitude?: number;
    longitude?: number;
    start_listening?: boolean;
    custom_action?: ActionConfig;
    confirmation?: {
        text?: string;
        exemptions?: {
            user: string;
        }[];
    };
}
export declare class LinkService {
    private static instance;
    private hass?;
    static getInstance(): LinkService;
    setHass(hass: HomeAssistant): void;
    executeAction(action: LinkAction): Promise<void>;
    getActionTypeOptions(): Array<{
        value: string;
        label: string;
    }>;
    validateAction(action: LinkAction): {
        valid: boolean;
        errors: string[];
    };
    renderActionForm(hass: HomeAssistant, action: LinkAction, onUpdate: (updates: Partial<LinkAction>) => void): any;
}
export declare const linkService: LinkService;
