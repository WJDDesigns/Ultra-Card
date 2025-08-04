import { HomeAssistant } from 'custom-card-helpers';
import { LinkAction } from './services/link-service';
export type ActionType = 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
export interface ModuleActionConfig {
    action: ActionType;
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
}
export interface DisplayCondition {
    id: string;
    type: 'entity_state' | 'entity_attribute' | 'template' | 'time';
    entity?: string;
    attribute?: string;
    operator?: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'has_value' | 'no_value' | 'contains' | 'not_contains';
    value?: string | number;
    template?: string;
    time_from?: string;
    time_to?: string;
    enabled?: boolean;
}
export interface BaseModule {
    id: string;
    type: 'image' | 'info' | 'bar' | 'icon' | 'text' | 'separator' | 'horizontal' | 'vertical' | 'button' | 'markdown' | 'camera';
    name?: string;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
    background_color?: string;
    background_image?: string;
    background_image_type?: 'none' | 'upload' | 'entity' | 'url';
    background_image_entity?: string;
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
    intro_animation?: 'none' | 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'bounceIn' | 'flipInX' | 'flipInY' | 'rotateIn';
    outro_animation?: 'none' | 'fadeOut' | 'slideOutUp' | 'slideOutDown' | 'slideOutLeft' | 'slideOutRight' | 'zoomOut' | 'bounceOut' | 'flipOutX' | 'flipOutY' | 'rotateOut';
    animation_duration?: string;
    animation_delay?: string;
    animation_timing?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier(0.25,0.1,0.25,1)';
    design?: SharedDesignProperties;
}
export interface TextModule extends BaseModule {
    type: 'text';
    text: string;
    link?: string;
    hide_if_no_link?: boolean;
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    icon?: string;
    icon_position?: 'before' | 'after' | 'none';
    font_size?: number;
    font_family?: string;
    color?: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    uppercase?: boolean;
    strikethrough?: boolean;
    font_weight?: string;
    line_height?: number;
    letter_spacing?: string;
    text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    font_style?: 'normal' | 'italic' | 'oblique';
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
    title_underline?: boolean;
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
}
export interface ImageModule extends BaseModule {
    type: 'image';
    image_type?: 'upload' | 'url' | 'entity' | 'attribute' | 'none' | 'default';
    image?: string;
    image_entity?: string;
    image_width?: number;
    image_height?: number;
    image_fit?: 'cover' | 'contain' | 'fill' | 'none';
    single_click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service';
    single_entity?: string;
    single_navigation_path?: string;
    single_url?: string;
    single_service?: string;
    single_service_data?: Record<string, any>;
    image_url?: string;
    entity?: string;
    image_attribute?: string;
    width?: number;
    height?: number;
    aspect_ratio?: 'auto' | '1:1' | '16:9' | '4:3' | '3:2';
    object_fit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
    border_radius?: number;
    border_width?: number;
    border_color?: string;
    box_shadow?: string;
    link_enabled?: boolean;
    link_url?: string;
    link_target?: '_self' | '_blank';
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    alignment?: 'left' | 'center' | 'right';
    filter_blur?: number;
    filter_brightness?: number;
    filter_contrast?: number;
    filter_saturate?: number;
    filter_hue_rotate?: number;
    filter_opacity?: number;
    hover_enabled?: boolean;
    hover_effect?: 'scale' | 'rotate' | 'fade' | 'blur' | 'brightness' | 'glow' | 'slide';
    hover_scale?: number;
    hover_rotate?: number;
    hover_opacity?: number;
    hover_blur?: number;
    hover_brightness?: number;
    hover_shadow?: string;
    hover_translate_x?: number;
    hover_translate_y?: number;
    hover_transition?: number;
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
    icon_position?: 'left' | 'right' | 'top' | 'bottom';
    icon_alignment?: 'start' | 'center' | 'end';
    content_alignment?: 'start' | 'center' | 'end';
    overall_alignment?: 'left' | 'center' | 'right';
    icon_gap?: number;
}
export interface InfoModule extends BaseModule {
    type: 'info';
    info_entities: InfoEntityConfig[];
    alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
    vertical_alignment?: 'top' | 'center' | 'bottom';
    columns?: number;
    gap?: number;
    allow_wrap?: boolean;
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
}
export interface BarModule extends BaseModule {
    type: 'bar';
    entity: string;
    name?: string;
    percentage_type?: 'entity' | 'attribute' | 'difference' | 'template';
    percentage_entity?: string;
    percentage_attribute_entity?: string;
    percentage_attribute_name?: string;
    percentage_current_entity?: string;
    percentage_total_entity?: string;
    percentage_template?: string;
    bar_size?: 'extra-thick' | 'thick' | 'medium' | 'thin';
    bar_radius?: 'square' | 'round' | 'pill';
    bar_style?: 'flat' | 'glossy' | 'embossed' | 'inset' | 'gradient-overlay' | 'neon-glow' | 'outline' | 'glass' | 'metallic' | 'neumorphic' | 'dashed';
    bar_width?: number;
    bar_alignment?: 'left' | 'center' | 'right';
    height?: number;
    border_radius?: number;
    label_alignment?: 'left' | 'center' | 'right' | 'space-between';
    show_percentage?: boolean;
    percentage_text_size?: number;
    show_value?: boolean;
    value_position?: 'inside' | 'outside' | 'none';
    left_enabled?: boolean;
    left_title?: string;
    left_entity?: string;
    left_condition_type?: 'none' | 'entity' | 'template';
    left_condition_entity?: string;
    left_condition_state?: string;
    left_template_mode?: boolean;
    left_template?: string;
    left_title_size?: number;
    left_value_size?: number;
    left_title_color?: string;
    left_value_color?: string;
    right_enabled?: boolean;
    right_title?: string;
    right_entity?: string;
    right_condition_type?: 'none' | 'entity' | 'template';
    right_condition_entity?: string;
    right_condition_state?: string;
    right_template_mode?: boolean;
    right_template?: string;
    right_title_size?: number;
    right_value_size?: number;
    right_title_color?: string;
    right_value_color?: string;
    bar_color?: string;
    bar_background_color?: string;
    bar_border_color?: string;
    percentage_text_color?: string;
    use_gradient?: boolean;
    gradient_display_mode?: 'full' | 'cropped' | 'value-based';
    gradient_stops?: Array<{
        id: string;
        position: number;
        color: string;
    }>;
    limit_entity?: string;
    limit_color?: string;
    animation?: boolean;
    template_mode?: boolean;
    template?: string;
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
}
export interface IconConfig {
    id: string;
    entity: string;
    name?: string;
    icon_inactive?: string;
    icon_active?: string;
    inactive_state?: string;
    active_state?: string;
    custom_inactive_state_text?: string;
    custom_active_state_text?: string;
    custom_inactive_name_text?: string;
    custom_active_name_text?: string;
    inactive_template_mode?: boolean;
    inactive_template?: string;
    active_template_mode?: boolean;
    active_template?: string;
    use_entity_color_for_icon?: boolean;
    color_inactive?: string;
    color_active?: string;
    inactive_icon_color?: string;
    active_icon_color?: string;
    inactive_name_color?: string;
    active_name_color?: string;
    inactive_state_color?: string;
    active_state_color?: string;
    show_name_when_inactive?: boolean;
    show_state_when_inactive?: boolean;
    show_icon_when_inactive?: boolean;
    show_name_when_active?: boolean;
    show_state_when_active?: boolean;
    show_icon_when_active?: boolean;
    show_state?: boolean;
    show_name?: boolean;
    show_units?: boolean;
    enable_hover_effect?: boolean;
    icon_size?: number;
    text_size?: number;
    name_icon_gap?: number;
    name_state_gap?: number;
    icon_state_gap?: number;
    active_icon_size?: number;
    inactive_icon_size?: number;
    active_text_size?: number;
    inactive_text_size?: number;
    state_size?: number;
    active_state_size?: number;
    inactive_state_size?: number;
    icon_size_locked?: boolean;
    text_size_locked?: boolean;
    state_size_locked?: boolean;
    active_icon_locked?: boolean;
    active_icon_color_locked?: boolean;
    active_icon_background_locked?: boolean;
    active_icon_background_color_locked?: boolean;
    active_name_locked?: boolean;
    active_name_color_locked?: boolean;
    active_state_locked?: boolean;
    active_state_color_locked?: boolean;
    icon_background?: 'none' | 'rounded-square' | 'circle';
    use_entity_color_for_icon_background?: boolean;
    icon_background_color?: string;
    active_icon_background?: 'none' | 'rounded-square' | 'circle';
    inactive_icon_background?: 'none' | 'rounded-square' | 'circle';
    active_icon_background_color?: string;
    inactive_icon_background_color?: string;
    inactive_icon_animation?: 'none' | 'pulse' | 'spin' | 'bounce' | 'flash' | 'shake' | 'vibrate' | 'rotate-left' | 'rotate-right' | 'fade' | 'scale' | 'tada';
    active_icon_animation?: 'none' | 'pulse' | 'spin' | 'bounce' | 'flash' | 'shake' | 'vibrate' | 'rotate-left' | 'rotate-right' | 'fade' | 'scale' | 'tada';
    vertical_alignment?: 'top' | 'center' | 'bottom';
    container_width?: number;
    container_background_shape?: 'none' | 'rounded' | 'square' | 'circle';
    container_background_color?: string;
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service';
    double_click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service';
    hold_action_legacy?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service';
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
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
}
export interface HorizontalModule extends BaseModule {
    type: 'horizontal';
    modules: CardModule[];
    alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around' | 'justify';
    vertical_alignment?: 'top' | 'center' | 'bottom' | 'stretch' | 'baseline';
    gap?: number;
    wrap?: boolean;
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
}
export interface VerticalModule extends BaseModule {
    type: 'vertical';
    modules: CardModule[];
    alignment?: 'top' | 'center' | 'bottom' | 'space-between' | 'space-around';
    gap?: number;
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
}
export interface ButtonModule extends BaseModule {
    type: 'button';
    label: string;
    action?: LinkAction;
    style?: 'flat' | 'glossy' | 'embossed' | 'inset' | 'gradient-overlay' | 'neon-glow' | 'outline' | 'glass' | 'metallic' | 'neumorphic' | 'dashed';
    alignment?: 'left' | 'center' | 'right' | 'justify';
    show_icon?: boolean;
    icon?: string;
    icon_position?: 'before' | 'after';
    background_color?: string;
    text_color?: string;
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
}
export interface MarkdownModule extends BaseModule {
    type: 'markdown';
    markdown_content: string;
    link?: string;
    hide_if_no_link?: boolean;
    template_mode?: boolean;
    template?: string;
    font_size?: number;
    font_family?: string;
    color?: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    line_height?: number;
    letter_spacing?: string;
    enable_html?: boolean;
    enable_tables?: boolean;
    enable_code_highlighting?: boolean;
    max_height?: string;
    overflow_behavior?: 'scroll' | 'hidden' | 'visible';
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
}
export interface CameraModule extends BaseModule {
    type: 'camera';
    entity: string;
    camera_name?: string;
    show_name?: boolean;
    name_position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    width?: number;
    height?: number;
    aspect_ratio_linked?: boolean;
    aspect_ratio_value?: number;
    image_fit?: 'cover' | 'contain' | 'fill' | 'scale-down';
    border_radius?: string;
    crop_left?: number;
    crop_top?: number;
    crop_right?: number;
    crop_bottom?: number;
    show_controls?: boolean;
    auto_refresh?: boolean;
    refresh_interval?: number;
    image_quality?: 'high' | 'medium' | 'low';
    live_view?: boolean;
    show_unavailable?: boolean;
    fallback_image?: string;
    tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    hold_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    double_tap_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
    };
    template_mode?: boolean;
    template?: string;
}
export type CardModule = TextModule | SeparatorModule | ImageModule | InfoModule | BarModule | IconModule | HorizontalModule | VerticalModule | ButtonModule | MarkdownModule | CameraModule;
export interface SharedDesignProperties {
    color?: string;
    text_align?: 'left' | 'center' | 'right' | 'justify';
    font_size?: string;
    line_height?: string;
    letter_spacing?: string;
    font_family?: string;
    font_weight?: string;
    text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    font_style?: 'normal' | 'italic' | 'oblique';
    background_color?: string;
    background_image?: string;
    backdrop_filter?: string;
    width?: string;
    height?: string;
    max_width?: string;
    max_height?: string;
    min_width?: string;
    min_height?: string;
    margin_top?: string;
    margin_bottom?: string;
    margin_left?: string;
    margin_right?: string;
    padding_top?: string;
    padding_bottom?: string;
    padding_left?: string;
    padding_right?: string;
    border_radius?: string;
    border_style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
    border_width?: string;
    border_color?: string;
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    z_index?: string;
    text_shadow_h?: string;
    text_shadow_v?: string;
    text_shadow_blur?: string;
    text_shadow_color?: string;
    box_shadow_h?: string;
    box_shadow_v?: string;
    box_shadow_blur?: string;
    box_shadow_spread?: string;
    box_shadow_color?: string;
    overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
    clip_path?: string;
    animation_type?: 'none' | 'pulse' | 'vibrate' | 'rotate-left' | 'rotate-right' | 'hover' | 'fade' | 'scale' | 'bounce' | 'shake' | 'tada';
    animation_entity?: string;
    animation_trigger_type?: 'state' | 'attribute';
    animation_attribute?: string;
    animation_state?: string;
    intro_animation?: 'none' | 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'bounceIn' | 'flipInX' | 'flipInY' | 'rotateIn';
    outro_animation?: 'none' | 'fadeOut' | 'slideOutUp' | 'slideOutDown' | 'slideOutLeft' | 'slideOutRight' | 'zoomOut' | 'bounceOut' | 'flipOutX' | 'flipOutY' | 'rotateOut';
    animation_duration?: string;
    animation_delay?: string;
    animation_timing?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier(0.25,0.1,0.25,1)';
    logic_entity?: string;
    logic_attribute?: string;
    logic_operator?: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'not_contains' | 'has_value' | 'no_value';
    logic_value?: string;
}
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
    template_mode?: boolean;
    template?: string;
    design?: SharedDesignProperties;
}
export interface CardRow {
    id: string;
    name?: string;
    columns: CardColumn[];
    column_layout?: '1-col' | '1-2-1-2' | '1-3-2-3' | '2-3-1-3' | '2-5-3-5' | '3-5-2-5' | '1-3-1-3-1-3' | '1-4-1-2-1-4' | '1-5-3-5-1-5' | '1-6-2-3-1-6' | '1-4-1-4-1-4-1-4' | '1-5-1-5-1-5-1-5' | '1-6-1-6-1-6-1-6' | '1-8-1-4-1-4-1-8' | '1-5-1-5-1-5-1-5-1-5' | '1-6-1-6-1-3-1-6-1-6' | '1-8-1-4-1-4-1-4-1-8' | '1-6-1-6-1-6-1-6-1-6-1-6' | '50-50' | '30-70' | '70-30' | '40-60' | '60-40' | '33-33-33' | '25-50-25' | '20-60-20' | '25-25-25-25';
    gap?: number;
    column_alignment?: 'top' | 'middle' | 'bottom';
    content_alignment?: 'start' | 'end' | 'center' | 'stretch';
    background_color?: string;
    padding?: number;
    margin?: number;
    border_radius?: number;
    border_color?: string;
    border_width?: number;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
    template_mode?: boolean;
    template?: string;
    design?: SharedDesignProperties;
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
