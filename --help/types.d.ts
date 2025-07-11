import { HomeAssistant } from 'custom-card-helpers';
export interface DisplayCondition {
    type: 'entity' | 'template' | 'time' | 'numeric' | 'device_tracker';
    entity?: string;
    state?: string;
    operator?: 'equals' | 'not_equals' | 'above' | 'below' | 'contains' | 'not_contains' | 'is_state' | 'not_state';
    value?: string | number;
    template?: string;
    time_from?: string;
    time_to?: string;
    numeric_value?: number;
    device_entity?: string;
    device_states?: string[];
}
export interface BaseModule {
    id: string;
    type: 'image' | 'info' | 'bar' | 'icon' | 'text' | 'separator' | 'horizontal' | 'vertical';
    name?: string;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
    background_color?: string;
    margin?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };
    padding?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };
    border?: {
        style?: 'none' | 'solid' | 'dashed' | 'dotted';
        width?: number;
        color?: string;
        radius?: number;
    };
    custom_css?: string;
}
export interface TextModule extends BaseModule {
    type: 'text';
    text: string;
    font_size?: number;
    font_family?: string;
    color?: string;
    alignment?: 'left' | 'center' | 'right';
    bold?: boolean;
    italic?: boolean;
    uppercase?: boolean;
    strikethrough?: boolean;
    template_mode?: boolean;
    template?: string;
}
export interface SeparatorModule extends BaseModule {
    type: 'separator';
    separator_style?: 'line' | 'double_line' | 'dotted' | 'double_dotted' | 'shadow' | 'blank';
    thickness?: number;
    width_percent?: number;
    color?: string;
    show_title?: boolean;
    title?: string;
    title_size?: number;
    title_color?: string;
    title_bold?: boolean;
    title_italic?: boolean;
    title_uppercase?: boolean;
    title_strikethrough?: boolean;
}
export interface ImageModule extends BaseModule {
    type: 'image';
    image_type: 'upload' | 'url' | 'entity' | 'none' | 'default';
    image?: string;
    image_entity?: string;
    image_width?: number;
    image_height?: number;
    image_fit?: 'cover' | 'contain' | 'fill' | 'none';
    border_radius?: number;
    single_click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service';
    single_entity?: string;
    single_navigation_path?: string;
    single_url?: string;
    single_service?: string;
    single_service_data?: Record<string, any>;
    template_mode?: boolean;
    template?: string;
}
export interface InfoEntityConfig {
    id: string;
    entity: string;
    name?: string;
    icon?: string;
    show_icon?: boolean;
    show_name?: boolean;
    text_size?: number;
    name_size?: number;
    icon_size?: number;
    text_bold?: boolean;
    text_italic?: boolean;
    text_uppercase?: boolean;
    text_strikethrough?: boolean;
    name_bold?: boolean;
    name_italic?: boolean;
    name_uppercase?: boolean;
    name_strikethrough?: boolean;
    icon_color?: string;
    name_color?: string;
    text_color?: string;
    click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service';
    navigation_path?: string;
    url?: string;
    service?: string;
    service_data?: Record<string, any>;
    template_mode?: boolean;
    template?: string;
    dynamic_icon_template_mode?: boolean;
    dynamic_icon_template?: string;
    dynamic_color_template_mode?: boolean;
    dynamic_color_template?: string;
}
export interface InfoModule extends BaseModule {
    type: 'info';
    info_entities: InfoEntityConfig[];
    alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
    vertical_alignment?: 'top' | 'center' | 'bottom';
    columns?: number;
    gap?: number;
    allow_wrap?: boolean;
}
export interface BarModule extends BaseModule {
    type: 'bar';
    entity: string;
    name?: string;
    show_percentage?: boolean;
    bar_color?: string;
    background_color?: string;
    height?: number;
    border_radius?: number;
    show_value?: boolean;
    value_position?: 'inside' | 'outside' | 'none';
    animation?: boolean;
    template_mode?: boolean;
    template?: string;
}
export interface IconConfig {
    id: string;
    entity: string;
    name?: string;
    icon_inactive?: string;
    icon_active?: string;
    color_inactive?: string;
    color_active?: string;
    inactive_state?: string;
    active_state?: string;
    show_state?: boolean;
    show_name?: boolean;
    icon_size?: number;
    text_size?: number;
    click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service';
    navigation_path?: string;
    url?: string;
    service?: string;
    service_data?: Record<string, any>;
    template_mode?: boolean;
    template?: string;
    dynamic_icon_template_mode?: boolean;
    dynamic_icon_template?: string;
    dynamic_color_template_mode?: boolean;
    dynamic_color_template?: string;
}
export interface IconModule extends BaseModule {
    type: 'icon';
    icons: IconConfig[];
    alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
    vertical_alignment?: 'top' | 'center' | 'bottom';
    columns?: number;
    gap?: number;
}
export interface HorizontalModule extends BaseModule {
    type: 'horizontal';
    modules: CardModule[];
    alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around' | 'justify';
    gap?: number;
    wrap?: boolean;
    mobile_single_column?: boolean;
}
export interface VerticalModule extends BaseModule {
    type: 'vertical';
    modules: CardModule[];
    alignment?: 'top' | 'center' | 'bottom' | 'space-between' | 'space-around';
    gap?: number;
}
export type CardModule = TextModule | SeparatorModule | ImageModule | InfoModule | BarModule | IconModule | HorizontalModule | VerticalModule;
export interface CardColumn {
    id: string;
    name?: string;
    modules: CardModule[];
    vertical_alignment?: 'top' | 'center' | 'bottom' | 'stretch';
    horizontal_alignment?: 'left' | 'center' | 'right' | 'stretch';
    background_color?: string;
    padding?: number;
    margin?: number;
    border_radius?: number;
    border_color?: string;
    border_width?: number;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
}
export interface CardRow {
    id: string;
    name?: string;
    columns: CardColumn[];
    column_layout?: '1-col' | '50-50' | '30-70' | '70-30' | '40-60' | '60-40' | '33-33-33' | '25-50-25' | '20-60-20' | '25-25-25-25';
    gap?: number;
    background_color?: string;
    padding?: number;
    margin?: number;
    border_radius?: number;
    border_color?: string;
    border_width?: number;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
}
export interface LayoutConfig {
    rows: CardRow[];
    gap?: number;
}
export interface UltraCardConfig {
    type: string;
    layout: LayoutConfig;
    global_css?: string;
    card_background?: string;
    card_border_radius?: number;
    card_padding?: number;
    card_margin?: number;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
}
export interface CustomCard {
    type: string;
    name: string;
    description: string;
    preview?: boolean;
    documentationURL?: string;
    version?: string;
}
export interface LovelaceCard {
    hass?: HomeAssistant;
    config?: UltraCardConfig;
    requestUpdate?: () => void;
}
export interface ConfigChangedEvent {
    detail: {
        config: UltraCardConfig;
    };
}
export interface EditorTarget extends EventTarget {
    value?: string | number | boolean;
    checked?: boolean;
    configValue?: string;
    configAttribute?: string;
}
