import { HomeAssistant } from 'custom-card-helpers';
import { LinkAction } from './services/link-service';
declare global {
    interface Window {
        _ultraCardUpdateTimer?: ReturnType<typeof setTimeout> | null;
    }
}
export type ActionType = 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
export interface UnifiedTemplateResponse {
    icon?: string;
    icon_color?: string;
    name?: string;
    name_color?: string;
    state_text?: string;
    state_color?: string;
    content?: string;
    color?: string;
    value?: number | string;
    label?: string;
}
export interface ModuleActionConfig {
    action: ActionType;
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    perform_action?: string;
    service_data?: Record<string, any>;
    pipeline_id?: string;
    start_listening?: boolean;
    target?: {
        entity_id?: string | string[];
        device_id?: string | string[];
        area_id?: string | string[];
    };
    data?: Record<string, any>;
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
    type: 'image' | 'info' | 'bar' | 'icon' | 'text' | 'separator' | 'horizontal' | 'vertical' | 'accordion' | 'popup' | 'slider' | 'slider_control' | 'pagebreak' | 'button' | 'markdown' | 'climate' | 'camera' | 'graphs' | 'dropdown' | 'light' | 'gauge' | 'spinbox' | 'animated_clock' | 'animated_weather' | 'animated_forecast' | 'external_card' | 'native_card' | 'video_bg' | 'dynamic_weather' | 'background' | 'map' | 'status_summary' | 'toggle' | 'tabs' | 'calendar' | 'sports_score' | 'grid' | 'badge_of_honor' | 'vacuum' | 'media_player' | 'people' | 'navigation' | 'timer' | 'cover';
    name?: string;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
    hidden_on_devices?: DeviceBreakpoint[];
    background_color?: string;
    background_image?: string;
    background_image_type?: 'none' | 'upload' | 'entity' | 'url';
    background_image_entity?: string;
    background_size?: 'cover' | 'contain' | 'auto' | string;
    background_position?: 'left top' | 'left center' | 'left bottom' | 'center top' | 'center center' | 'center bottom' | 'right top' | 'right center' | 'right bottom' | string;
    background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
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
    border_radius?: string | number;
    custom_css?: string;
    intro_animation?: 'none' | 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'bounceIn' | 'flipInX' | 'flipInY' | 'rotateIn';
    outro_animation?: 'none' | 'fadeOut' | 'slideOutUp' | 'slideOutDown' | 'slideOutLeft' | 'slideOutRight' | 'zoomOut' | 'bounceOut' | 'flipOutX' | 'flipOutY' | 'rotateOut';
    animation_duration?: string;
    animation_delay?: string;
    animation_timing?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier(0.25,0.1,0.25,1)';
    design?: SharedDesignProperties;
    confirm_action?: boolean;
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
    icon_color?: string;
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
    unified_template_mode?: boolean;
    unified_template?: string;
    ignore_entity_state_config?: boolean;
    text_size?: number;
    icon_size?: number;
    enable_hover_effect?: boolean;
    hover_background_color?: string;
    hover_effect?: 'none' | 'color' | 'scale' | 'glow' | 'lift';
    hover_glow_color?: string;
}
export interface SeparatorModule extends BaseModule {
    type: 'separator';
    separator_style?: 'line' | 'double_line' | 'dotted' | 'double_dotted' | 'shadow' | 'blank';
    orientation?: 'horizontal' | 'vertical';
    thickness?: number;
    width_percent?: number | string;
    height_px?: number | string;
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
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
    width?: number | string;
    height?: number | string;
    aspect_ratio?: 'auto' | '1/1' | '4/3' | '3/2' | '16/9' | '21/9' | '2/3' | '9/16';
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
    rotation?: number;
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export interface InfoEntityConfig {
    id: string;
    entity: string;
    name?: string;
    icon?: string;
    show_icon?: boolean;
    show_name?: boolean;
    show_state?: boolean;
    show_units?: boolean;
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
    state_color?: string;
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
    unified_template_mode?: boolean;
    unified_template?: string;
    ignore_entity_state_config?: boolean;
    icon_position?: 'left' | 'right' | 'top' | 'bottom';
    icon_alignment?: 'start' | 'center' | 'end';
    name_alignment?: 'start' | 'center' | 'end';
    state_alignment?: 'start' | 'center' | 'end';
    overall_alignment?: 'left' | 'center' | 'right';
    icon_gap?: number;
    name_value_layout?: 'vertical' | 'horizontal';
    name_value_gap?: number;
    content_distribution?: 'normal' | 'space-between' | 'space-around' | 'space-evenly';
    enable_hover_effect?: boolean;
    hover_background_color?: string;
    /** Display an entity attribute instead of state */
    attribute?: string;
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
    text_size?: number;
    icon_size?: number;
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export interface BarModule extends BaseModule {
    type: 'bar';
    entity: string;
    name?: string;
    percentage_type?: 'entity' | 'attribute' | 'difference' | 'template' | 'time_progress' | 'range';
    percentage_entity?: string;
    percentage_attribute_entity?: string;
    percentage_attribute_name?: string;
    percentage_current_entity?: string;
    percentage_total_entity?: string;
    percentage_template?: string;
    time_progress_start_entity?: string;
    time_progress_end_entity?: string;
    time_progress_direction?: 'forward' | 'backward';
    time_progress_update_interval?: number;
    range_start_entity?: string;
    range_start_attribute?: string;
    range_end_entity?: string;
    range_end_attribute?: string;
    range_current_entity?: string;
    range_current_attribute?: string;
    range_current_color?: string;
    percentage_min?: number;
    percentage_max?: number;
    percentage_min_template_mode?: boolean;
    percentage_min_template?: string;
    percentage_max_template_mode?: boolean;
    percentage_max_template?: string;
    bar_direction?: 'left-to-right' | 'right-to-left';
    bar_size?: 'extra-thick' | 'thick' | 'medium' | 'thin';
    bar_radius?: 'square' | 'round' | 'pill';
    bar_style?: 'flat' | 'glossy' | 'embossed' | 'inset' | 'gradient-overlay' | 'neon-glow' | 'outline' | 'glass' | 'metallic' | 'neumorphic' | 'dashed' | 'dots' | 'minimal';
    bar_width?: number;
    bar_alignment?: 'left' | 'center' | 'right';
    height?: number;
    border_radius?: number;
    glass_blur_amount?: number;
    label_alignment?: 'left' | 'center' | 'right' | 'space-between';
    show_percentage?: boolean;
    percentage_text_size?: number;
    percentage_text_alignment?: 'left' | 'center' | 'right' | 'follow-fill';
    percentage_text_bold?: boolean;
    percentage_text_italic?: boolean;
    percentage_text_strikethrough?: boolean;
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
    left_tap_action?: ModuleActionConfig;
    left_hold_action?: ModuleActionConfig;
    left_double_tap_action?: ModuleActionConfig;
    right_tap_action?: ModuleActionConfig;
    right_hold_action?: ModuleActionConfig;
    right_double_tap_action?: ModuleActionConfig;
    bar_color?: string;
    bar_background_color?: string;
    bar_border_color?: string;
    percentage_text_color?: string;
    dot_color?: string;
    minimal_icon_enabled?: boolean;
    minimal_icon?: string;
    minimal_icon_mode?: 'dot-only' | 'icon-only' | 'icon-in-dot';
    minimal_icon_size?: number;
    minimal_icon_size_auto?: boolean;
    minimal_icon_color?: string;
    minimal_icon_use_dot_color?: boolean;
    use_gradient?: boolean;
    gradient_display_mode?: 'full' | 'cropped' | 'value-based';
    gradient_stops?: Array<{
        id: string;
        position: number;
        color: string;
    }>;
    limit_entity?: string;
    limit_color?: string;
    show_scale?: boolean;
    scale_divisions?: number;
    scale_show_labels?: boolean;
    scale_label_size?: number;
    scale_label_color?: string;
    scale_position?: 'above' | 'below';
    animation?: boolean;
    template_mode?: boolean;
    template?: string;
    unified_template_mode?: boolean;
    unified_template?: string;
    ignore_entity_state_config?: boolean;
    bar_animation_enabled?: boolean;
    bar_animation_entity?: string;
    bar_animation_trigger_type?: 'state' | 'attribute';
    bar_animation_attribute?: string;
    bar_animation_value?: string;
    bar_animation_type?: 'none' | 'charging' | 'pulse' | 'blinking' | 'bouncing' | 'glow' | 'rainbow' | 'bubbles' | 'fill' | 'ripple' | 'traffic' | 'traffic_flow' | 'heartbeat' | 'flicker' | 'shimmer' | 'vibrate';
    bar_animation_override_entity?: string;
    bar_animation_override_trigger_type?: 'state' | 'attribute';
    bar_animation_override_attribute?: string;
    bar_animation_override_value?: string;
    bar_animation_override_type?: 'none' | 'charging' | 'pulse' | 'blinking' | 'bouncing' | 'glow' | 'rainbow' | 'bubbles' | 'fill' | 'ripple' | 'traffic' | 'traffic_flow' | 'heartbeat' | 'flicker' | 'shimmer' | 'vibrate';
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export interface GaugeModule extends BaseModule {
    type: 'gauge';
    entity: string;
    name?: string;
    value_type?: 'entity' | 'attribute' | 'template';
    value_entity?: string;
    value_attribute_entity?: string;
    value_attribute_name?: string;
    value_template?: string;
    min_value?: number;
    max_value?: number;
    gauge_style?: 'basic' | 'speedometer' | 'block' | 'lines' | 'modern' | 'inset' | '3d' | 'neon' | 'digital' | 'minimal' | 'arc' | 'radial';
    gauge_size?: number;
    gauge_thickness?: number;
    flip_horizontal?: boolean;
    pointer_enabled?: boolean;
    pointer_style?: 'triangle' | 'line' | 'needle' | 'arrow' | 'circle' | 'highlight' | 'cap' | 'icon' | 'custom';
    pointer_color?: string;
    pointer_length?: number;
    pointer_width?: number;
    pointer_icon?: string;
    pointer_icon_color?: string;
    pointer_icon_size?: number;
    gauge_color_mode?: 'solid' | 'gradient' | 'segments';
    gauge_color?: string;
    gauge_background_color?: string;
    use_gradient?: boolean;
    gradient_display_mode?: 'full' | 'cropped' | 'value-based';
    gradient_stops?: Array<{
        id: string;
        position: number;
        color: string;
    }>;
    use_segments?: boolean;
    segments?: Array<{
        id: string;
        from: number;
        to: number;
        color: string;
        label?: string;
    }>;
    show_value?: boolean;
    value_position?: 'center' | 'top' | 'bottom' | 'none';
    value_font_size?: number;
    value_color?: string;
    value_format?: string;
    value_x_offset?: number;
    value_y_offset?: number;
    value_bold?: boolean;
    value_italic?: boolean;
    value_underline?: boolean;
    value_uppercase?: boolean;
    value_strikethrough?: boolean;
    show_name?: boolean;
    name_position?: 'top' | 'bottom' | 'center' | 'none';
    name_font_size?: number;
    name_color?: string;
    name_x_offset?: number;
    name_y_offset?: number;
    name_bold?: boolean;
    name_italic?: boolean;
    name_underline?: boolean;
    name_uppercase?: boolean;
    name_strikethrough?: boolean;
    show_min_max?: boolean;
    min_max_font_size?: number;
    min_max_color?: string;
    show_ticks?: boolean;
    tick_count?: number;
    tick_color?: string;
    show_tick_labels?: boolean;
    tick_label_font_size?: number;
    gauge_animation_enabled?: boolean;
    gauge_animation_duration?: string;
    gauge_animation_easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
    zones?: Array<{
        id: string;
        from: number;
        to: number;
        color: string;
        opacity?: number;
    }>;
    template_mode?: boolean;
    template?: string;
    unified_template_mode?: boolean;
    unified_template?: string;
    ignore_entity_state_config?: boolean;
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export interface IconConfig {
    id: string;
    icon_mode?: 'entity' | 'static';
    entity: string;
    name?: string;
    icon_inactive?: string;
    icon_active?: string;
    inactive_state?: string;
    active_state?: string;
    inactive_attribute?: string;
    active_attribute?: string;
    /** Simple attribute display override (shows same attribute for both active/inactive) */
    display_attribute?: string;
    custom_inactive_state_text?: string;
    custom_active_state_text?: string;
    custom_inactive_name_text?: string;
    custom_active_name_text?: string;
    inactive_template_mode?: boolean;
    inactive_template?: string;
    active_template_mode?: boolean;
    active_template?: string;
    use_entity_color_for_icon?: boolean;
    use_state_color_for_inactive_icon?: boolean;
    use_state_color_for_active_icon?: boolean;
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
    background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
    background_position?: 'left top' | 'left center' | 'left bottom' | 'center top' | 'center center' | 'center bottom' | 'right top' | 'right center' | 'right bottom';
    background_size?: 'cover' | 'contain' | 'auto' | string;
    active_icon_background?: 'none' | 'rounded-square' | 'circle';
    inactive_icon_background?: 'none' | 'rounded-square' | 'circle';
    active_icon_background_color?: string;
    inactive_icon_background_color?: string;
    icon_background_padding?: number;
    active_icon_background_padding?: number;
    inactive_icon_background_padding?: number;
    active_icon_background_padding_locked?: boolean;
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
    unified_template_mode?: boolean;
    unified_template?: string;
    ignore_entity_state_config?: boolean;
}
export interface IconModule extends BaseModule {
    type: 'icon';
    icons: IconConfig[];
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
    text_size?: number;
    icon_size?: number;
    enable_hover_effect?: boolean;
    hover_background_color?: string;
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
    horizontal_alignment?: 'left' | 'center' | 'right' | 'stretch';
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
export interface AccordionModule extends BaseModule {
    type: 'accordion';
    modules: CardModule[];
    title_mode?: 'custom' | 'entity';
    title_text?: string;
    title_entity?: string;
    show_entity_name?: boolean;
    icon?: string;
    header_alignment?: 'center' | 'apart';
    icon_side?: 'left' | 'right';
    default_open?: boolean;
    open_mode?: 'always' | 'every' | 'any' | 'manual';
    open_conditions?: DisplayCondition[];
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
export interface TabSection {
    id: string;
    title: string;
    icon?: string;
    modules: CardModule[];
}
export interface TabsModule extends BaseModule {
    type: 'tabs';
    sections: TabSection[];
    orientation?: 'horizontal' | 'vertical';
    style?: 'default' | 'simple' | 'simple_2' | 'simple_3' | 'switch_1' | 'switch_2' | 'switch_3' | 'modern' | 'trendy';
    alignment?: 'left' | 'center' | 'right' | 'stretch';
    tab_position?: 'top' | 'bottom' | 'left' | 'right';
    switch_on_hover?: boolean;
    default_tab?: string;
    wrap_tabs?: boolean;
    mobile_icons_only?: boolean;
    mobile_breakpoint?: number;
    font_size?: string;
    font_weight?: string;
    text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    tab_gap?: number;
    tab_padding?: string;
    active_tab_color?: string;
    active_tab_background?: string;
    active_tab_border_color?: string;
    inactive_tab_color?: string;
    inactive_tab_background?: string;
    inactive_tab_border_color?: string;
    hover_tab_color?: string;
    hover_tab_background?: string;
    tab_border_radius?: string;
    tab_border_width?: number;
    track_background?: string;
    icon_color?: string;
    content_background?: string;
    content_padding?: string;
    content_border_radius?: string;
    content_border_color?: string;
    content_border_width?: number;
    transition_duration?: string;
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
export interface PopupModule extends BaseModule {
    type: 'popup';
    modules: CardModule[];
    show_title?: boolean;
    title_mode?: 'custom' | 'entity';
    title_text?: string;
    title_entity?: string;
    show_entity_name?: boolean;
    trigger_type?: 'button' | 'image' | 'icon' | 'page_load' | 'logic' | 'module';
    trigger_module_id?: string;
    trigger_button_text?: string;
    trigger_button_icon?: string;
    trigger_image_type?: 'upload' | 'entity' | 'url';
    trigger_image_url?: string;
    trigger_image_entity?: string;
    trigger_icon?: string;
    trigger_alignment?: 'left' | 'center' | 'right';
    trigger_button_full_width?: boolean;
    trigger_image_full_width?: boolean;
    trigger_icon_size?: number;
    trigger_icon_color?: string;
    layout?: 'default' | 'full_screen' | 'left_panel' | 'right_panel' | 'top_panel' | 'bottom_panel';
    animation?: 'fade' | 'scale_up' | 'scale_down' | 'slide_top' | 'slide_left' | 'slide_right' | 'slide_bottom';
    popup_width?: string;
    popup_padding?: string;
    popup_border_radius?: string;
    close_button_position?: 'inside' | 'none';
    close_button_color?: string;
    close_button_size?: number;
    close_button_icon?: string;
    close_button_offset_x?: string;
    close_button_offset_y?: string;
    auto_close_timer_enabled?: boolean;
    auto_close_timer_seconds?: number;
    title_background_color?: string;
    title_text_color?: string;
    popup_background_color?: string;
    popup_text_color?: string;
    show_overlay?: boolean;
    overlay_background?: string;
    trigger_mode?: 'every' | 'any' | 'manual';
    trigger_conditions?: DisplayCondition[];
    auto_close?: boolean;
    default_open?: boolean;
}
export interface PageBreakModule extends BaseModule {
    type: 'pagebreak';
}
export interface SliderModule extends BaseModule {
    type: 'slider';
    modules: CardModule[];
    show_pagination?: boolean;
    pagination_style?: 'dots' | 'dots-and-dash' | 'dash-lines' | 'numbers' | 'thumbnails' | 'fraction' | 'progressbar' | 'scrollbar' | 'dynamic';
    pagination_position?: 'top' | 'bottom' | 'left' | 'right';
    pagination_color?: string;
    pagination_active_color?: string;
    pagination_size?: number;
    pagination_overlay?: boolean;
    show_arrows?: boolean;
    arrow_position_offset?: number;
    arrow_style?: 'default' | 'circle' | 'square' | 'minimal';
    arrow_size?: number;
    arrow_color?: string;
    arrow_background_color?: string;
    prev_arrow_icon?: string;
    next_arrow_icon?: string;
    arrows_always_visible?: boolean;
    transition_effect?: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | 'zoom' | 'slide-left' | 'slide-right' | 'slide-top' | 'slide-bottom' | 'zoom-in' | 'zoom-out' | 'circle';
    transition_speed?: number;
    auto_play?: boolean;
    auto_play_delay?: number;
    pause_on_hover?: boolean;
    loop?: boolean;
    allow_swipe?: boolean;
    allow_keyboard?: boolean;
    allow_mousewheel?: boolean;
    slider_direction?: 'horizontal' | 'vertical';
    centered_slides?: boolean;
    slider_height?: number;
    auto_height?: boolean;
    slider_width?: string;
    gap?: number;
    slides_per_view?: number;
    space_between?: number;
    vertical_alignment?: 'top' | 'center' | 'bottom' | 'stretch';
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
export interface SliderBar {
    id: string;
    type: 'numeric' | 'brightness' | 'rgb' | 'color_temp' | 'red' | 'green' | 'blue' | 'attribute';
    entity: string;
    attribute?: string;
    name?: string;
    min_value?: number;
    max_value?: number;
    step?: number;
    show_icon?: boolean;
    show_name?: boolean;
    show_value?: boolean;
    outside_text_position?: 'left' | 'right';
    outside_name_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'top' | 'middle' | 'bottom';
    outside_value_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'top' | 'middle' | 'bottom';
    split_bar_position?: 'left' | 'right';
    split_bar_length?: number;
    overlay_name_position?: 'top' | 'middle' | 'bottom';
    overlay_value_position?: 'top' | 'middle' | 'bottom';
    overlay_icon_position?: 'top' | 'middle' | 'bottom';
    content_position?: 'left' | 'center' | 'right' | 'bottom' | 'top' | 'top_left' | 'top_center' | 'top_right' | 'bottom_left' | 'bottom_center' | 'bottom_right' | 'left_top' | 'left_center' | 'left_bottom' | 'right_top' | 'right_center' | 'right_bottom';
    icon_position?: 'left' | 'center' | 'right' | 'top' | 'bottom' | 'top_left' | 'top_center' | 'top_right' | 'bottom_left' | 'bottom_center' | 'bottom_right' | 'left_top' | 'left_center' | 'left_bottom' | 'right_top' | 'right_center' | 'right_bottom';
    name_position?: 'left' | 'center' | 'right' | 'top' | 'bottom' | 'top_left' | 'top_center' | 'top_right' | 'bottom_left' | 'bottom_center' | 'bottom_right' | 'left_top' | 'left_center' | 'left_bottom' | 'right_top' | 'right_center' | 'right_bottom';
    value_position?: 'left' | 'center' | 'right' | 'top' | 'bottom' | 'top_left' | 'top_center' | 'top_right' | 'bottom_left' | 'bottom_center' | 'bottom_right' | 'left_top' | 'left_center' | 'left_bottom' | 'right_top' | 'right_center' | 'right_bottom';
    info_section_position?: 'left' | 'right' | 'top' | 'bottom';
    slider_height?: number;
    slider_track_color?: string;
    slider_fill_color?: string;
    dynamic_fill_color?: boolean;
    slider_style?: 'flat' | 'glossy' | 'embossed' | 'inset' | 'gradient-overlay' | 'neon-glow' | 'outline' | 'glass' | 'metallic' | 'neumorphic' | 'minimal';
    glass_blur_amount?: number;
    slider_radius?: 'square' | 'round' | 'pill';
    border_radius?: number;
    use_gradient?: boolean;
    gradient_stops?: Array<{
        id: string;
        position: number;
        color: string;
    }>;
    auto_contrast?: boolean;
    icon?: string;
    icon_size?: number;
    icon_color?: string;
    dynamic_icon?: boolean;
    icon_as_toggle?: boolean;
    name_size?: number;
    name_color?: string;
    name_bold?: boolean;
    value_size?: number;
    value_color?: string;
    value_suffix?: string;
    show_bar_label?: boolean;
    animate_on_change?: boolean;
    transition_duration?: number;
    haptic_feedback?: boolean;
    invert_direction?: boolean;
}
export interface SliderControlModule extends BaseModule {
    type: 'slider_control';
    bars: SliderBar[];
    orientation?: 'horizontal' | 'vertical';
    layout_mode?: 'overlay' | 'split' | 'outside';
    overlay_position?: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
    overlay_name_position?: 'top' | 'middle' | 'bottom';
    overlay_value_position?: 'top' | 'middle' | 'bottom';
    overlay_icon_position?: 'top' | 'middle' | 'bottom';
    outside_text_position?: 'left' | 'right';
    outside_name_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'top' | 'middle' | 'bottom';
    outside_value_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'top' | 'middle' | 'bottom';
    split_bar_position?: 'left' | 'right';
    split_info_position?: 'left' | 'center' | 'right';
    split_bar_length?: number;
    slider_style?: 'flat' | 'glossy' | 'embossed' | 'inset' | 'gradient-overlay' | 'neon-glow' | 'outline' | 'glass' | 'metallic' | 'neumorphic' | 'minimal';
    slider_height?: number;
    bar_spacing?: number;
    slider_radius?: 'square' | 'round' | 'pill';
    border_radius?: number;
    slider_track_color?: string;
    slider_fill_color?: string;
    dynamic_fill_color?: boolean;
    glass_blur_amount?: number;
    use_gradient?: boolean;
    gradient_stops?: Array<{
        id: string;
        position: number;
        color: string;
    }>;
    show_icon?: boolean;
    icon?: string;
    icon_size?: number;
    icon_color?: string;
    dynamic_icon?: boolean;
    icon_as_toggle?: boolean;
    auto_contrast?: boolean;
    show_name?: boolean;
    name_size?: number;
    name_color?: string;
    name_bold?: boolean;
    show_state?: boolean;
    state_size?: number;
    state_color?: string;
    state_bold?: boolean;
    state_format?: string;
    show_value?: boolean;
    value_size?: number;
    value_color?: string;
    value_suffix?: string;
    show_bar_label?: boolean;
    show_toggle?: boolean;
    toggle_position?: 'left' | 'right' | 'top' | 'bottom';
    toggle_size?: number;
    toggle_color_on?: string;
    toggle_color_off?: string;
    show_color_picker?: boolean;
    color_picker_position?: 'below' | 'right';
    color_picker_size?: 'small' | 'medium' | 'large';
    animate_on_change?: boolean;
    transition_duration?: number;
    haptic_feedback?: boolean;
    invert_direction?: boolean;
    entity?: string;
    name?: string;
    attribute?: string;
    min_value?: number;
    max_value?: number;
    step?: number;
    light_control_mode?: 'brightness' | 'color_temp' | 'rgb' | 'both' | 'all';
    light_slider_order?: string[];
    cover_invert?: boolean;
    control_attribute?: string;
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export interface ButtonModule extends BaseModule {
    type: 'button';
    label: string;
    action?: LinkAction;
    style?: 'flat' | 'glossy' | 'embossed' | 'inset' | 'gradient-overlay' | 'neon-glow' | 'outline' | 'glass' | 'metallic' | 'neumorphic' | 'dashed' | 'dots';
    alignment?: 'left' | 'center' | 'right' | 'justify';
    show_icon?: boolean;
    icon?: string;
    icon_position?: 'before' | 'after';
    icon_size?: string | number;
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
    use_entity_color?: boolean;
    background_color_entity?: string;
    background_state_colors?: {
        [state: string]: string;
    };
}
export interface SpinboxModule extends BaseModule {
    type: 'spinbox';
    entity?: string;
    value?: number;
    min_value: number;
    max_value: number;
    step: number;
    unit?: string;
    show_unit?: boolean;
    layout?: 'horizontal' | 'vertical';
    show_value?: boolean;
    value_position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    button_style?: 'flat' | 'glossy' | 'embossed' | 'inset' | 'gradient-overlay' | 'neon-glow' | 'outline' | 'glass' | 'metallic';
    button_shape?: 'rounded' | 'square' | 'circle';
    button_size?: number;
    button_spacing?: number;
    button_gap?: number;
    increment_icon?: string;
    decrement_icon?: string;
    button_background_color?: string;
    button_text_color?: string;
    value_color?: string;
    value_font_size?: number;
    template_mode?: boolean;
    template?: string;
    unified_template_mode?: boolean;
    unified_template?: string;
    ignore_entity_state_config?: boolean;
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
    unified_template_mode?: boolean;
    unified_template?: string;
    ignore_entity_state_config?: boolean;
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export interface CameraModule extends BaseModule {
    type: 'camera';
    entity: string;
    camera_name?: string;
    show_name?: boolean;
    name_position?: 'top-left' | 'top-middle' | 'top-right' | 'bottom-left' | 'bottom-middle' | 'bottom-right' | 'center';
    tap_opens_fullscreen?: boolean;
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
    view_mode?: 'auto' | 'live' | 'snapshot';
    refresh_interval?: number;
    auto_refresh?: boolean;
    live_view?: boolean;
    image_quality?: 'high' | 'medium' | 'low';
    rotation?: number;
    audio_enabled?: boolean;
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
    unified_template_mode?: boolean;
    unified_template?: string;
    ignore_entity_state_config?: boolean;
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export interface GraphEntityConfig {
    id: string;
    entity: string;
    name?: string;
    attribute?: string;
    forecast_attribute?: 'temperature' | 'precipitation' | 'wind_speed' | 'humidity' | 'pressure' | 'cloud_coverage' | string;
    color?: string;
    chart_type_override?: string;
    show_points?: boolean;
    fill_area?: boolean;
    line_width?: number;
    line_style?: 'solid' | 'dashed' | 'dotted';
    is_primary?: boolean;
    label_show_name?: boolean;
    label_show_value?: boolean;
}
export interface GraphsModule extends BaseModule {
    type: 'graphs';
    data_source?: 'history' | 'forecast';
    forecast_type?: 'hourly' | 'daily';
    forecast_entity?: string;
    forecast_display_hours?: number;
    forecast_display_days?: number;
    chart_type: 'line' | 'bar' | 'area' | 'scatter' | 'bubble' | 'pie' | 'donut' | 'radar' | 'histogram' | 'heatmap' | 'waterfall' | 'combo';
    entities: GraphEntityConfig[];
    time_period: '1h' | '3h' | '6h' | '12h' | '24h' | '2d' | '7d' | '30d' | '90d' | '365d' | 'custom';
    custom_time_start?: string;
    custom_time_end?: string;
    show_title?: boolean;
    title?: string;
    title_size?: number;
    title_color?: string;
    chart_alignment?: 'left' | 'center' | 'right';
    show_legend?: boolean;
    normalize_values?: boolean;
    use_fixed_y_axis?: boolean;
    legend_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
    show_grid?: boolean;
    show_grid_values?: boolean;
    show_time_intervals?: boolean;
    grid_color?: string;
    background_color?: string;
    chart_width?: string;
    chart_height?: number;
    info_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'middle';
    show_info_overlay?: boolean;
    show_display_name?: boolean;
    show_entity_value?: boolean;
    show_x_axis?: boolean;
    x_axis_label?: string;
    x_axis_color?: string;
    x_axis_grid?: boolean;
    show_y_axis?: boolean;
    y_axis_label?: string;
    y_axis_color?: string;
    y_axis_min?: number;
    y_axis_max?: number;
    y_axis_grid?: boolean;
    data_aggregation?: 'mean' | 'sum' | 'min' | 'max' | 'median' | 'first' | 'last' | 'count' | 'delta';
    data_points_limit?: number;
    smooth_curves?: boolean;
    enable_animation?: boolean;
    animation_duration?: string;
    enable_zoom?: boolean;
    enable_pan?: boolean;
    show_tooltips?: boolean;
    line_tension?: number;
    fill_opacity?: number;
    show_points?: boolean;
    point_radius?: number;
    bar_width?: number;
    bar_spacing?: number;
    bar_display_limit?: number;
    stacked?: boolean;
    horizontal?: boolean;
    inner_radius?: number;
    start_angle?: number;
    show_percentages?: boolean;
    explode_slices?: boolean;
    slice_gap?: number;
    show_slice_labels?: boolean;
    point_size?: number;
    point_opacity?: number;
    show_regression?: boolean;
    bubble_scale?: number;
    scale_min?: number;
    scale_max?: number;
    grid_levels?: number;
    point_style?: 'circle' | 'triangle' | 'rect' | 'star';
    cell_padding?: number;
    color_scheme?: 'viridis' | 'plasma' | 'inferno' | 'magma' | 'blues' | 'reds' | 'greens' | 'greys';
    show_values?: boolean;
    value_format?: string;
    positive_color?: string;
    negative_color?: string;
    total_color?: string;
    connector_color?: string;
    primary_axis?: 'left' | 'right';
    secondary_axis?: 'left' | 'right' | 'none';
    sync_axes?: boolean;
    auto_refresh?: boolean;
    refresh_interval?: number;
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export interface DropdownModule extends BaseModule {
    type: 'dropdown';
    source_mode?: 'manual' | 'entity';
    source_entity?: string;
    placeholder?: string;
    options: DropdownOption[];
    entity_option_customization?: Record<string, {
        icon?: string;
        icon_color?: string;
        use_state_color?: boolean;
    }>;
    current_selection?: string;
    track_state?: boolean;
    closed_title_mode?: 'last_chosen' | 'entity_state' | 'custom' | 'first_option';
    closed_title_entity?: string;
    closed_title_custom?: string;
    unified_template_mode?: boolean;
    unified_template?: string;
    control_icon?: string;
    control_alignment?: 'center' | 'apart';
    control_icon_side?: 'left' | 'right';
    visible_items?: number;
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export interface LightModule extends BaseModule {
    type: 'light';
    presets: Array<{
        id: string;
        name: string;
        action?: 'turn_on' | 'turn_off' | 'toggle';
        icon?: string;
        entities: string[];
        brightness?: number;
        color_temp?: number;
        rgb_color?: number[];
        hs_color?: number[];
        xy_color?: number[];
        rgbw_color?: number[];
        rgbww_color?: number[];
        white?: number;
        effect?: string;
        effect_speed?: number;
        effect_intensity?: number;
        effect_reverse?: boolean;
        transition_time?: number;
        text_color?: string;
        icon_color?: string;
        button_color?: string;
        use_light_color_for_icon?: boolean;
        use_light_color_for_button?: boolean;
        use_icon_color_for_text?: boolean;
        smart_color?: boolean;
        button_style?: 'filled' | 'outlined' | 'text';
        show_label?: boolean;
        border_radius?: number;
    }>;
    layout?: 'buttons' | 'grid';
    button_alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around' | 'space-evenly';
    allow_wrapping?: boolean;
    button_gap?: number;
    columns?: number;
    show_labels?: boolean;
    button_style?: 'filled' | 'outlined' | 'text';
    default_transition_time?: number;
    confirm_actions?: boolean;
    show_feedback?: boolean;
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export interface MapMarker {
    id: string;
    name: string;
    type: 'manual' | 'entity';
    latitude?: number;
    longitude?: number;
    entity?: string;
    icon?: string;
    icon_color?: string;
    icon_size?: number;
    marker_image_type?: 'icon' | 'custom_image' | 'entity_image';
    marker_image?: string;
    use_entity_picture?: boolean;
}
export interface MapModule extends BaseModule {
    type: 'map';
    map_provider: 'openstreetmap' | 'google';
    google_api_key?: string;
    map_type: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
    zoom: number;
    show_map_controls: boolean;
    disable_zoom_scroll: boolean;
    disable_touch_drag: boolean;
    auto_zoom_entities: boolean;
    manual_center_latitude?: number;
    manual_center_longitude?: number;
    markers: MapMarker[];
    map_height?: number;
    aspect_ratio?: '16:9' | '4:3' | '1:1' | 'custom';
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
export interface AnimatedClockModule extends BaseModule {
    type: 'animated_clock';
    time_format?: '12' | '24';
    clock_style?: 'flip' | 'digital' | 'analog' | 'binary' | 'minimal' | 'retro' | 'word' | 'neon' | 'material' | 'terminal';
    update_frequency?: '1' | '60';
    analog_show_seconds?: boolean;
    analog_smooth_seconds?: boolean;
    analog_show_hour_hand?: boolean;
    analog_show_minute_hand?: boolean;
    analog_show_hour_markers?: boolean;
    analog_show_center_dot?: boolean;
    analog_show_numbers?: boolean;
    analog_show_hour_ticks?: boolean;
    analog_show_minute_ticks?: boolean;
    analog_hour_hand_color?: string;
    analog_minute_hand_color?: string;
    analog_second_hand_color?: string;
    analog_hour_marker_color?: string;
    analog_center_dot_color?: string;
    analog_numbers_color?: string;
    analog_hour_ticks_color?: string;
    analog_minute_ticks_color?: string;
    analog_face_outline_color?: string;
    analog_face_background_color?: string;
    analog_face_background_type?: 'color' | 'entity' | 'upload' | 'url';
    analog_face_background_image_entity?: string;
    analog_face_background_image_upload?: string;
    analog_face_background_image_url?: string;
    analog_face_background_size?: string;
    analog_face_background_position?: string;
    analog_face_background_repeat?: string;
    show_hours?: boolean;
    show_minutes?: boolean;
    show_seconds?: boolean;
    show_ampm?: boolean;
    show_separators?: boolean;
    show_labels?: boolean;
    show_prefix?: boolean;
    show_prompt?: boolean;
    show_command?: boolean;
    show_cursor?: boolean;
    clock_size?: number;
    clock_color?: string;
    clock_background?: string;
    flip_tile_color?: string;
    flip_hours_color?: string;
    flip_minutes_color?: string;
    flip_separator_color?: string;
    flip_ampm_color?: string;
    digital_background_color?: string;
    digital_hours_color?: string;
    digital_minutes_color?: string;
    digital_seconds_color?: string;
    digital_separator_color?: string;
    digital_ampm_color?: string;
    digital_glow_color?: string;
    binary_hours_empty_color?: string;
    binary_hours_filled_color?: string;
    binary_minutes_empty_color?: string;
    binary_minutes_filled_color?: string;
    binary_seconds_empty_color?: string;
    binary_seconds_filled_color?: string;
    binary_separator_color?: string;
    binary_hours_label_color?: string;
    binary_minutes_label_color?: string;
    binary_seconds_label_color?: string;
    minimal_hours_color?: string;
    minimal_minutes_color?: string;
    minimal_seconds_color?: string;
    minimal_separator_color?: string;
    minimal_ampm_color?: string;
    retro_background_color?: string;
    retro_hours_tile_color?: string;
    retro_minutes_tile_color?: string;
    retro_seconds_tile_color?: string;
    retro_separator_tile_color?: string;
    retro_hours_color?: string;
    retro_minutes_color?: string;
    retro_seconds_color?: string;
    retro_separator_color?: string;
    retro_ampm_color?: string;
    text_orientation?: 'horizontal' | 'vertical';
    text_word_gap?: number;
    text_prefix_color?: string;
    text_prefix_size?: number;
    text_hours_color?: string;
    text_hours_size?: number;
    text_minutes_color?: string;
    text_minutes_size?: number;
    text_ampm_color?: string;
    text_ampm_size?: number;
    neon_padding?: number;
    neon_hours_color?: string;
    neon_minutes_color?: string;
    neon_seconds_color?: string;
    neon_separator_color?: string;
    neon_ampm_color?: string;
    material_vertical_gap?: number;
    material_background_color?: string;
    material_hours_color?: string;
    material_minutes_color?: string;
    material_seconds_color?: string;
    material_separator_color?: string;
    material_ampm_color?: string;
    terminal_background_color?: string;
    terminal_line1_color?: string;
    terminal_line2_color?: string;
    terminal_cursor_color?: string;
    terminal_hours_color?: string;
    terminal_minutes_color?: string;
    terminal_seconds_color?: string;
    terminal_separator_color?: string;
    terminal_ampm_color?: string;
    terminal_vertical_spacing?: number;
    terminal_line1_size?: number;
    terminal_line2_size?: number;
    terminal_output_size?: number;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
}
export interface AnimatedWeatherModule extends BaseModule {
    type: 'animated_weather';
    weather_entity?: string;
    temperature_entity?: string;
    condition_entity?: string;
    custom_entity?: string;
    custom_entity_name?: string;
    show_left_column?: boolean;
    show_center_column?: boolean;
    show_right_column?: boolean;
    layout_spread?: number;
    left_column_gap?: number;
    right_column_gap?: number;
    temperature_unit?: 'F' | 'C';
    location_override_mode?: 'text' | 'entity';
    location_name?: string;
    location_entity?: string;
    left_column_order?: string[];
    right_column_order?: string[];
    show_location?: boolean;
    show_condition?: boolean;
    show_custom_entity?: boolean;
    show_precipitation?: boolean;
    show_precipitation_probability?: boolean;
    show_wind?: boolean;
    show_pressure?: boolean;
    show_visibility?: boolean;
    show_date?: boolean;
    show_temperature?: boolean;
    show_temp_range?: boolean;
    location_size?: number;
    condition_size?: number;
    custom_entity_size?: number;
    precipitation_size?: number;
    wind_size?: number;
    pressure_size?: number;
    visibility_size?: number;
    location_color?: string;
    condition_color?: string;
    custom_entity_color?: string;
    precipitation_color?: string;
    wind_color?: string;
    pressure_color?: string;
    visibility_color?: string;
    main_icon_size?: number;
    icon_style?: 'fill' | 'line';
    date_size?: number;
    temperature_size?: number;
    temp_range_size?: number;
    date_color?: string;
    temperature_color?: string;
    temp_range_color?: string;
    module_background?: string;
    module_border?: string;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
}
export interface AnimatedForecastModule extends BaseModule {
    type: 'animated_forecast';
    weather_entity?: string;
    forecast_entity?: string;
    forecast_days?: number;
    temperature_unit?: 'F' | 'C';
    allow_wrap?: boolean;
    forecast_day_size?: number;
    forecast_temp_size?: number;
    forecast_icon_size?: number;
    icon_style?: 'fill' | 'line';
    text_color?: string;
    accent_color?: string;
    forecast_day_color?: string;
    forecast_temp_color?: string;
    forecast_background?: string;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
}
export interface DropdownOption {
    id: string;
    label: string;
    icon?: string;
    icon_color?: string;
    use_state_color?: boolean;
    action: {
        action: 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        perform_action?: string;
        service_data?: Record<string, any>;
        data?: Record<string, any>;
        target?: {
            entity_id?: string | string[];
            device_id?: string | string[];
            area_id?: string | string[];
        };
    };
}
export interface ExternalCardModule extends BaseModule {
    type: 'external_card';
    card_type: string;
    card_config: Record<string, any>;
}
export interface NativeCardModule extends BaseModule {
    type: 'native_card';
    card_type: string;
    card_config: Record<string, any>;
}
export interface VideoBackgroundRule {
    id: string;
    condition_type: 'entity_state' | 'entity_attribute' | 'template' | 'time';
    entity?: string;
    attribute?: string;
    operator?: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'not_contains' | 'has_value' | 'no_value';
    value?: string | number;
    template?: string;
    time_from?: string;
    time_to?: string;
    video_source: 'local' | 'url' | 'youtube' | 'vimeo';
    video_url: string;
    loop?: boolean;
    start_time?: number;
}
export interface GlobalCardTransparency {
    enabled: boolean;
    opacity: number;
    blur_px: number;
    color?: string;
}
export interface VideoBackgroundModule extends BaseModule {
    type: 'video_bg';
    enabled: boolean;
    editor_only: boolean;
    controller_id?: string;
    pause_when_hidden: boolean;
    respect_reduced_motion: boolean;
    enable_on_mobile: boolean;
    opacity: number;
    blur: string;
    brightness: string;
    scale: number;
    default_source: 'local' | 'url' | 'youtube' | 'vimeo';
    default_video_url: string;
    default_loop: boolean;
    default_muted: boolean;
    default_start_time: number;
    rules?: VideoBackgroundRule[];
    global_card_transparency: GlobalCardTransparency;
}
export type WeatherEffectType = 'none' | 'rain' | 'rain_storm' | 'rain_drizzle' | 'hail' | 'acid_rain' | 'matrix_rain' | 'lightning' | 'snow_gentle' | 'snow_storm' | 'fog_light' | 'fog_dense' | 'sun_beams' | 'clouds' | 'wind';
export interface DynamicWeatherModule extends BaseModule {
    type: 'dynamic_weather';
    enabled: boolean;
    mode: 'automatic' | 'manual';
    weather_entity?: string;
    manual_effect?: WeatherEffectType;
    position: 'foreground' | 'background';
    opacity: number;
    matrix_rain_color?: string;
    enable_on_mobile: boolean;
    respect_reduced_motion: boolean;
    enable_snow_accumulation?: boolean;
    display_mode: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
}
export interface BackgroundModule extends BaseModule {
    type: 'background';
    background_type: 'none' | 'upload' | 'entity' | 'url';
    background_image?: string;
    background_image_entity?: string;
    background_size?: 'cover' | 'contain' | 'fill' | 'auto';
    background_position?: string;
    background_repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    opacity: number;
    display_mode: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
}
export interface StatusSummaryEntity {
    id: string;
    entity: string;
    label?: string;
    icon?: string;
    show_icon?: boolean;
    show_state?: boolean;
    is_auto_generated?: boolean;
    color_mode: 'state' | 'time' | 'custom' | 'none';
    state_colors?: {
        [state: string]: string;
    };
    time_colors?: {
        threshold: number;
        color: string;
    }[];
    custom_color_template?: string;
}
export interface StatusSummaryModule extends BaseModule {
    type: 'status_summary';
    entities: StatusSummaryEntity[];
    enable_auto_filter: boolean;
    include_filters?: string[];
    exclude_filters?: string[];
    max_time_since_change?: number;
    title: string;
    show_title: boolean;
    show_last_change_header: boolean;
    show_time_header: boolean;
    sort_by: 'name' | 'last_change' | 'custom';
    sort_direction: 'asc' | 'desc';
    max_items_to_show?: number;
    global_show_icon: boolean;
    global_show_state: boolean;
    row_height: number;
    row_gap: number;
    max_entity_name_length: number;
    show_separator_lines: boolean;
    global_color_mode: 'state' | 'time' | 'custom' | 'none';
    global_state_colors?: {
        [state: string]: string;
    };
    global_time_colors?: {
        threshold: number;
        color: string;
    }[];
    global_custom_color_template?: string;
    default_text_color: string;
    default_icon_color: string;
    header_text_color: string;
    header_background_color: string;
    template_mode?: boolean;
    template?: string;
    unified_template_mode?: boolean;
    unified_template?: string;
    tap_action?: any;
    hold_action?: any;
    double_tap_action?: any;
    display_mode: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
}
export interface TogglePoint {
    id: string;
    label: string;
    icon?: string;
    tap_action?: ModuleActionConfig;
    match_entity?: string;
    match_state?: string | string[];
    match_template_mode?: boolean;
    match_template?: string;
    background_color?: string;
    text_color?: string;
    active_background_color?: string;
    active_text_color?: string;
    border_color?: string;
    active_border_color?: string;
}
export interface ToggleModule extends BaseModule {
    type: 'toggle';
    toggle_points: TogglePoint[];
    visual_style: 'ios_toggle' | 'segmented' | 'button_group' | 'slider_track' | 'minimal' | 'timeline';
    tracking_entity?: string;
    title?: string;
    show_title?: boolean;
    orientation?: 'horizontal' | 'vertical';
    alignment?: 'left' | 'center' | 'right' | 'justify';
    size?: 'compact' | 'normal' | 'large';
    spacing?: number;
    show_icons?: boolean;
    icon_size?: string;
    icon_position?: 'above' | 'left' | 'right' | 'below';
    default_background_color?: string;
    default_text_color?: string;
    default_active_background_color?: string;
    default_active_text_color?: string;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
    display_mode: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
}
export type NavShowLabels = boolean | 'text_only' | 'routes_only';
export type NavAlignment = 'start' | 'center' | 'end' | 'space-between' | 'space-around';
export type NavDeviceMode = 'docked' | 'floating';
export type NavDesktopPosition = 'top' | 'bottom' | 'left' | 'right';
export type NavMobilePosition = 'top' | 'bottom';
export type NavActionConfig = Omit<ModuleActionConfig, 'action'> & {
    action: ActionType | 'open-popup';
    /** Popup module ID to open when action is 'open-popup' */
    popup_id?: string;
    confirmation?: {
        text?: string;
    };
};
export interface NavBadgeConfig {
    mode?: 'static' | 'entity' | 'template';
    entity?: string;
    entity_attribute?: string;
    count_template?: string;
    count?: string;
    show?: boolean | string;
    hide_when_zero?: boolean;
    color?: string;
    text_color?: string;
    textColor?: string;
}
export interface NavRoute {
    id: string;
    url?: string;
    icon?: string;
    icon_selected?: string;
    icon_color?: string;
    image?: string;
    image_selected?: string;
    badge?: NavBadgeConfig;
    label?: string;
    selected?: boolean | string;
    selected_color?: string;
    tap_action?: NavActionConfig;
    hold_action?: NavActionConfig;
    double_tap_action?: NavActionConfig;
    hidden?: boolean | string;
}
/** A stack item that can contain child routes */
export interface NavStackItem {
    id: string;
    /** Icon for the stack button */
    icon?: string;
    icon_color?: string;
    /** Label for the stack (shown when labels are enabled) */
    label?: string;
    /** How the stack opens: 'hover' or 'click' (default: 'click') */
    open_mode?: 'hover' | 'click';
    /** Stack layout direction: 'auto' adapts to navbar orientation, or force 'horizontal'/'vertical' */
    orientation?: 'auto' | 'horizontal' | 'vertical';
    /** Child routes that appear when the stack is opened */
    children: NavRoute[];
    /** Badge configuration */
    badge?: NavBadgeConfig;
    hidden?: boolean | string;
}
export interface NavDesktopConfig {
    mode?: NavDeviceMode;
    show_labels?: NavShowLabels;
    min_width?: number;
    position?: NavDesktopPosition;
    hidden?: boolean | string;
    /** Offset from edge in pixels for floating mode (0-100, default 16) */
    offset?: number;
    /** Horizontal/vertical alignment of items within the dock */
    alignment?: NavAlignment;
}
export interface NavMobileConfig {
    mode?: NavDeviceMode;
    show_labels?: NavShowLabels;
    position?: NavMobilePosition;
    hidden?: boolean | string;
    /** Offset from edge in pixels for floating mode (0-100, default 16) */
    offset?: number;
    /** Horizontal/vertical alignment of items within the dock */
    alignment?: NavAlignment;
}
export interface NavAutoPaddingConfig {
    enabled?: boolean;
    desktop_px?: number;
    mobile_px?: number;
    media_player_px?: number;
}
export interface NavLayoutConfig {
    auto_padding?: NavAutoPaddingConfig;
    /** Gap between icons in the dock (px). Default 8. */
    icon_gap?: number;
}
export interface NavHapticConfig {
    url?: boolean;
    tap_action?: boolean;
    hold_action?: boolean;
    double_tap_action?: boolean;
}
export type NavHapticSetting = boolean | NavHapticConfig;
export interface NavMediaPlayerConfig {
    /** Enable media player in navbar */
    enabled?: boolean;
    entity?: string;
    show?: boolean | string;
    display_mode?: 'widget' | 'icon' | 'icon_hover' | 'icon_click';
    album_cover_background?: boolean;
    /** Position of the media player icon within the navbar routes. 'start' = first, 'end' = last, or a number for specific index */
    icon_position?: 'start' | 'end' | number;
    /** Where the expanded widget popup appears relative to the icon */
    widget_position?: 'above' | 'below';
    desktop_position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    tap_action?: NavActionConfig;
    hold_action?: NavActionConfig;
    double_tap_action?: NavActionConfig;
    /** When media is idle/off/unavailable, tap can do something else instead of play. Undefined = play (default). */
    inactive_tap_action?: NavActionConfig;
}
export interface NavigationTemplateConfig {
    nav_routes?: NavRoute[];
    nav_desktop?: NavDesktopConfig;
    nav_mobile?: NavMobileConfig;
    nav_layout?: NavLayoutConfig;
    nav_styles?: string;
    nav_haptic?: NavHapticSetting;
    nav_media_player?: NavMediaPlayerConfig;
}
export interface NavAutohideConfig {
    /** Enable macOS-style auto-hide: navbar slides off-screen after idle, reappears on edge hover */
    enabled?: boolean;
    /** Seconds of inactivity before hiding (default: 3) */
    delay?: number;
}
export interface NavigationModule extends BaseModule {
    type: 'navigation';
    nav_routes: NavRoute[];
    /** Stack items that contain child routes */
    nav_stacks?: NavStackItem[];
    /** Controls where the navbar is visible: 'current_view' = only on this view, 'all_views' = on all dashboard views */
    nav_scope?: 'current_view' | 'all_views';
    nav_style?: 'uc_modern' | 'uc_minimal' | 'uc_ios_glass' | 'uc_material' | 'uc_floating' | 'uc_docked' | 'uc_neumorphic' | 'uc_gradient' | 'uc_sidebar' | 'uc_compact';
    nav_desktop?: NavDesktopConfig;
    nav_mobile?: NavMobileConfig;
    nav_layout?: NavLayoutConfig;
    nav_styles?: string;
    nav_template?: string;
    nav_haptic?: NavHapticSetting;
    nav_media_player?: NavMediaPlayerConfig;
    /** macOS-style auto-hide configuration */
    nav_autohide?: NavAutohideConfig;
    /** Custom accent color for the dock background (tints styles) */
    nav_dock_color?: string;
    /** Custom accent color for icons */
    nav_icon_color?: string;
}
export type TimerDisplayStyle = 'circle' | 'progress_bar' | 'digital' | 'background_fill';
export interface TimerModule extends BaseModule {
    type: 'timer';
    /** Optional display title (e.g. "Kitchen", "Door close") */
    title?: string;
    /** Icon for the timer (e.g. mdi:timer, mdi:pot-steam) */
    icon?: string;
    /** Default duration in seconds when user hits Start */
    duration_seconds: number;
    /** Optional preset durations in seconds for quick buttons (e.g. [300, 600, 900, 3600]) */
    preset_durations?: number[];
    /** Display style: circle, progress_bar, digital, background_fill */
    style: TimerDisplayStyle;
    /** Optional HA timer entity to sync with */
    timer_entity?: string;
    /** Action to run when timer reaches zero (same shape as tap_action) */
    on_expire_action?: {
        action: 'default' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
        entity?: string;
        navigation_path?: string;
        url_path?: string;
        service?: string;
        service_data?: Record<string, any>;
        target?: Record<string, any>;
    };
    /** When expired, show Snooze / Dismiss buttons */
    show_snooze_dismiss?: boolean;
    /** Snooze duration in seconds when user taps Snooze */
    snooze_seconds?: number;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
}
export interface CoverModule extends BaseModule {
    type: 'cover';
    /** Cover entity (single-entity mode) */
    entity: string;
    /** Optional display name override */
    name?: string;
    /** Optional icon override */
    icon?: string;
    /** Display toggles */
    show_title?: boolean;
    show_icon?: boolean;
    show_state?: boolean;
    show_position?: boolean;
    show_stop?: boolean;
    show_position_control?: boolean;
    /** Layout: compact (icon + state + controls), standard (name + position bar + buttons), buttons (explicit open/close/stop) */
    layout?: 'compact' | 'standard' | 'buttons';
    /** Alignment of content within the module */
    alignment?: 'left' | 'center' | 'right';
    /** Tilt (advanced): show tilt state and controls when entity supports it */
    show_tilt?: boolean;
    show_tilt_control?: boolean;
    /** Multi-cover (advanced): when set, display these entities instead of single entity */
    entities?: string[];
    layout_multi?: 'stack' | 'grid';
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
}
export type CardModule = TextModule | SeparatorModule | ImageModule | InfoModule | BarModule | GaugeModule | IconModule | HorizontalModule | VerticalModule | AccordionModule | PopupModule | SliderModule | SliderControlModule | PageBreakModule | ButtonModule | SpinboxModule | MarkdownModule | CameraModule | GraphsModule | DropdownModule | LightModule | ClimateModule | VacuumModule | MapModule | AnimatedClockModule | AnimatedWeatherModule | AnimatedForecastModule | ExternalCardModule | NativeCardModule | VideoBackgroundModule | DynamicWeatherModule | BackgroundModule | StatusSummaryModule | ToggleModule | TabsModule | CalendarModule | SportsScoreModule | GridModule | BadgeOfHonorModule | MediaPlayerModule | PeopleModule | NavigationModule | TimerModule | CoverModule;
export interface HoverEffectConfig {
    effect?: 'none' | 'highlight' | 'outline' | 'grow' | 'shrink' | 'pulse' | 'bounce' | 'float' | 'glow' | 'shadow' | 'rotate' | 'skew' | 'wobble' | 'buzz' | 'fade';
    duration?: number;
    timing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    delay?: number;
    highlight_color?: string;
    outline_color?: string;
    outline_width?: number;
    glow_color?: string;
    shadow_color?: string;
    scale?: number;
    translate_x?: number;
    translate_y?: number;
    rotate_degrees?: number;
    intensity?: 'subtle' | 'normal' | 'strong';
}
export type DeviceBreakpoint = 'desktop' | 'laptop' | 'tablet' | 'mobile';
export declare const DEVICE_BREAKPOINTS: {
    readonly desktop: {
        readonly minWidth: 1381;
        readonly label: "Desktop";
        readonly icon: "mdi:monitor";
    };
    readonly laptop: {
        readonly minWidth: 1025;
        readonly maxWidth: 1380;
        readonly label: "Laptop";
        readonly icon: "mdi:laptop";
    };
    readonly tablet: {
        readonly minWidth: 601;
        readonly maxWidth: 1024;
        readonly label: "Tablet";
        readonly icon: "mdi:tablet";
    };
    readonly mobile: {
        readonly maxWidth: 600;
        readonly label: "Mobile";
        readonly icon: "mdi:cellphone";
    };
};
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
    white_space?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';
    background_color?: string;
    background_image?: string;
    background_image_type?: 'none' | 'upload' | 'entity' | 'url';
    background_image_entity?: string;
    background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
    background_position?: 'left top' | 'left center' | 'left bottom' | 'center top' | 'center center' | 'center bottom' | 'right top' | 'right center' | 'right bottom';
    background_size?: 'cover' | 'contain' | 'auto' | string;
    backdrop_filter?: string;
    background_filter?: string;
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
    hover_effect?: HoverEffectConfig;
    logic_entity?: string;
    logic_attribute?: string;
    logic_operator?: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'not_contains' | 'has_value' | 'no_value';
    logic_value?: string;
    extra_class?: string;
    element_id?: string;
    css_variable_prefix?: string;
}
export interface ResponsiveDesignProperties extends SharedDesignProperties {
    base?: Partial<SharedDesignProperties>;
    desktop?: Partial<SharedDesignProperties>;
    laptop?: Partial<SharedDesignProperties>;
    tablet?: Partial<SharedDesignProperties>;
    mobile?: Partial<SharedDesignProperties>;
}
export declare function isResponsiveDesign(design: SharedDesignProperties | ResponsiveDesignProperties | undefined): design is ResponsiveDesignProperties;
export interface CardColumn {
    id: string;
    name?: string;
    modules: CardModule[];
    modules_template?: string;
    vertical_alignment?: 'top' | 'center' | 'bottom' | 'stretch';
    horizontal_alignment?: 'left' | 'center' | 'right' | 'stretch' | 'space-between' | 'space-around' | 'justify';
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
    hidden_on_devices?: DeviceBreakpoint[];
    design?: ResponsiveDesignProperties;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
}
export type ColumnLayoutId = '1-col' | '1-2-1-2' | '1-3-2-3' | '2-3-1-3' | '2-5-3-5' | '3-5-2-5' | '1-3-1-3-1-3' | '1-4-1-2-1-4' | '1-5-3-5-1-5' | '1-6-2-3-1-6' | '1-4-1-4-1-4-1-4' | '1-5-1-5-1-5-1-5' | '1-6-1-6-1-6-1-6' | '1-8-1-4-1-4-1-8' | '1-5-1-5-1-5-1-5-1-5' | '1-6-1-6-1-3-1-6-1-6' | '1-8-1-4-1-4-1-4-1-8' | '1-6-1-6-1-6-1-6-1-6-1-6' | '50-50' | '30-70' | '70-30' | '40-60' | '60-40' | '33-33-33' | '25-50-25' | '20-60-20' | '25-25-25-25' | 'custom';
export interface ResponsiveColumnLayoutConfig {
    layout: ColumnLayoutId;
    custom_sizing?: string;
}
export interface ResponsiveColumnLayouts {
    laptop?: ResponsiveColumnLayoutConfig;
    tablet?: ResponsiveColumnLayoutConfig;
    mobile?: ResponsiveColumnLayoutConfig;
}
export interface CardRow {
    id: string;
    name?: string;
    columns: CardColumn[];
    columns_template?: string;
    column_layout?: ColumnLayoutId;
    custom_column_sizing?: string;
    responsive_column_layouts?: ResponsiveColumnLayouts;
    gap?: number;
    column_alignment?: 'top' | 'middle' | 'bottom';
    content_alignment?: 'start' | 'end' | 'center' | 'stretch';
    full_width?: boolean;
    width_percent?: number;
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
    hidden_on_devices?: DeviceBreakpoint[];
    design?: ResponsiveDesignProperties;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
}
export interface LayoutConfig {
    rows: CardRow[];
    gap?: number;
}
export interface FavoriteColor {
    id: string;
    name: string;
    color: string;
    order: number;
}
export interface CustomVariable {
    id: string;
    name: string;
    entity: string;
    value_type: 'entity_id' | 'state' | 'attribute';
    attribute_name?: string;
    order: number;
    created?: string;
    isGlobal?: boolean;
}
export interface CustomVariablesExportData {
    variables: CustomVariable[];
    version: string;
    exported: string;
}
export interface EntityReference {
    entityId: string;
    locations: string[];
    moduleType: string;
    context?: string;
}
export interface EntityMapping {
    original: string;
    mapped: string;
    domain: string;
}
export interface PresetDefinition {
    id: string;
    name: string;
    description: string;
    category: 'badges' | 'layouts' | 'widgets' | 'custom';
    icon: string;
    author: string;
    version: string;
    tags: string[];
    integrations?: string[];
    thumbnail?: string;
    layout: LayoutConfig;
    customVariables?: CustomVariable[];
    cardSettings?: {
        card_background?: string;
        card_border_radius?: number;
        card_border_color?: string;
        card_border_width?: number;
        card_padding?: number;
        card_margin?: number;
        card_overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
        card_shadow_enabled?: boolean;
        card_shadow_color?: string;
        card_shadow_horizontal?: number;
        card_shadow_vertical?: number;
        card_shadow_blur?: number;
        card_shadow_spread?: number;
        card_background_image_type?: 'none' | 'upload' | 'entity' | 'url';
        card_background_image?: string;
        card_background_size?: string;
        card_background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
        card_background_position?: string;
    };
    metadata: {
        created: string;
        updated: string;
        downloads?: number;
        rating?: number;
        entityMappings?: EntityMapping[];
    };
}
export interface FavoriteRow {
    id: string;
    name: string;
    description?: string;
    row: CardRow;
    created: string;
    tags: string[];
}
export interface ExportData {
    type: 'ultra-card-row' | 'ultra-card-layout' | 'ultra-card-module' | 'ultra-card-full';
    version: string;
    data: CardRow | LayoutConfig | CardModule | UltraCardConfig;
    metadata: {
        exported: string;
        name?: string;
        description?: string;
        privacyProtected?: boolean;
    };
    customVariables?: CustomVariable[];
}
export interface UltraCardConfig {
    type: string;
    layout: LayoutConfig;
    global_css?: string;
    card_background?: string;
    card_border_radius?: number;
    card_border_color?: string;
    card_border_width?: number;
    card_padding?: number;
    card_margin?: number;
    card_overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
    card_shadow_enabled?: boolean;
    card_shadow_color?: string;
    card_shadow_horizontal?: number;
    card_shadow_vertical?: number;
    card_shadow_blur?: number;
    card_shadow_spread?: number;
    card_background_image_type?: 'none' | 'upload' | 'entity' | 'url';
    card_background_image?: string;
    card_background_image_entity?: string;
    card_background_size?: string;
    card_background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
    card_background_position?: string;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
    favorite_colors?: FavoriteColor[];
    haptic_feedback?: boolean;
    nav_templates?: Record<string, NavigationTemplateConfig>;
    card_name?: string;
    responsive_scaling?: boolean;
    _customVariables?: CustomVariable[];
    _globalVariablesBackup?: {
        variables: CustomVariable[];
        version: number;
    };
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
export interface ClimateModule extends BaseModule {
    type: 'climate';
    entity: string;
    name?: string;
    show_current_temp?: boolean;
    show_target_temp?: boolean;
    show_humidity?: boolean;
    show_mode_switcher?: boolean;
    show_power_button?: boolean;
    show_fan_controls?: boolean;
    show_preset_modes?: boolean;
    show_equipment_status?: boolean;
    show_temp_controls?: boolean;
    show_dial?: boolean;
    enable_dial_interaction?: boolean;
    info_position?: 'top' | 'bottom';
    dial_size?: number;
    dial_color_heating?: string;
    dial_color_cooling?: string;
    dial_color_idle?: string;
    dial_color_off?: string;
    dynamic_colors?: boolean;
    temp_step_override?: number;
    temperature_unit?: 'auto' | 'fahrenheit' | 'celsius';
    temp_control_size?: number;
    fan_layout?: 'chips' | 'dropdown';
    preset_layout?: 'chips' | 'dropdown';
    humidity_icon?: string;
    current_temp_color?: string;
    target_temp_color?: string;
    mode_text_color?: string;
    humidity_color?: string;
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
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
/**
 * Vacuum Module - Pro Feature
 *
 * Provides a comprehensive interface for robot vacuum cleaners with:
 * - Multiple layout modes (compact, standard, detailed)
 * - Battery and status display
 * - Cleaning statistics
 * - Component wear indicators
 * - Control buttons
 * - State-based animations
 * - Map display with swipe gesture
 * - Integration-specific features for Xiaomi/Roborock/Valetudo
 */
export interface VacuumModule extends BaseModule {
    type: 'vacuum';
    entity: string;
    name?: string;
    map_entity?: string;
    map_card_config?: any;
    battery_entity?: string;
    status_entity?: string;
    cleaning_binary_entity?: string;
    charging_binary_entity?: string;
    cleaning_area_entity?: string;
    cleaning_time_entity?: string;
    current_room_entity?: string;
    last_clean_begin_entity?: string;
    last_clean_end_entity?: string;
    total_cleaning_area_entity?: string;
    total_cleaning_time_entity?: string;
    total_cleaning_count_entity?: string;
    vacuum_error_entity?: string;
    dock_error_entity?: string;
    volume_entity?: string;
    do_not_disturb_entity?: string;
    do_not_disturb_begin_entity?: string;
    do_not_disturb_end_entity?: string;
    selected_map_entity?: string;
    map_image_entity?: string;
    full_clean_button_entity?: string;
    layout_mode?: 'compact' | 'standard' | 'detailed';
    card_layout_style?: 'single_column' | 'double_column';
    show_name?: boolean;
    show_status?: boolean;
    show_battery?: boolean;
    show_cleaning_stats?: boolean;
    show_component_wear?: boolean;
    show_map?: boolean;
    show_controls?: boolean;
    show_current_room?: boolean;
    show_last_clean?: boolean;
    show_total_stats?: boolean;
    show_errors?: boolean;
    show_dnd?: boolean;
    show_volume?: boolean;
    show_filter_life?: boolean;
    show_main_brush_life?: boolean;
    show_side_brush_life?: boolean;
    show_sensor_life?: boolean;
    filter_entity?: string;
    main_brush_entity?: string;
    side_brush_entity?: string;
    sensor_entity?: string;
    control_layout?: 'row' | 'grid' | 'compact';
    show_start_button?: boolean;
    show_pause_button?: boolean;
    show_stop_button?: boolean;
    show_dock_button?: boolean;
    show_locate_button?: boolean;
    show_fan_speed?: boolean;
    show_room_selection?: boolean;
    show_zone_cleanup?: boolean;
    enable_animations?: boolean;
    animation_cleaning?: 'spin' | 'pulse' | 'rotate' | 'bounce' | 'none';
    animation_returning?: 'slide' | 'pulse' | 'blink' | 'none';
    animation_docking?: 'slide' | 'fade' | 'pulse' | 'none';
    animation_charging?: 'pulse' | 'glow' | 'breathe' | 'none';
    animation_speed?: 'slow' | 'normal' | 'fast';
    custom_vacuum_image?: string;
    custom_vacuum_image_cleaning?: string;
    map_display_mode?: 'swipe' | 'toggle' | 'always' | 'none';
    map_height?: number;
    map_border_radius?: number;
    map_refresh_rate?: number;
    vacuum_icon?: string;
    vacuum_image?: string;
    vacuum_size?: number;
    icon_size?: number;
    primary_color?: string;
    background_style?: 'transparent' | 'card' | 'gradient';
    status_color_cleaning?: string;
    status_color_returning?: string;
    status_color_docked?: string;
    status_color_idle?: string;
    status_color_error?: string;
    battery_color_high?: string;
    battery_color_medium?: string;
    battery_color_low?: string;
    battery_threshold_medium?: number;
    battery_threshold_low?: number;
    detected_integration?: 'generic' | 'xiaomi' | 'roborock' | 'valetudo' | 'ecovacs' | 'neato' | 'roomba' | 'eufy' | 'shark' | 'tuya';
    rooms?: VacuumRoom[];
    zones?: VacuumZone[];
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
    enable_hover_effect?: boolean;
    hover_background_color?: string;
    display_sections?: VacuumDisplaySection[];
    section_order?: string[];
}
export type VacuumSectionType = 'vacuum_image' | 'title_status' | 'battery' | 'current_room' | 'fan_speed' | 'current_stats' | 'last_clean' | 'total_stats' | 'component_life' | 'errors' | 'dnd' | 'volume' | 'quick_controls' | 'map';
export interface VacuumDisplaySection {
    id: string;
    type: VacuumSectionType;
    enabled: boolean;
    order?: number;
    column?: 'left' | 'right';
    settings?: {
        show_icon?: boolean;
        show_label?: boolean;
        show_value?: boolean;
        show_graph?: boolean;
        show_percentage?: boolean;
        show_title?: boolean;
        icon_size?: number;
        font_size?: number;
        bar_height?: number;
        margin_top?: number;
        margin_right?: number;
        margin_bottom?: number;
        margin_left?: number;
        icon_color?: string;
        label_color?: string;
        value_color?: string;
        bar_color?: string;
        background_color?: string;
        color?: string;
        error_color?: string;
        button_color?: string;
        entity_override?: string;
        show_filter?: boolean;
        show_main_brush?: boolean;
        show_side_brush?: boolean;
        show_sensor?: boolean;
        filter_entity_override?: string;
        main_brush_entity_override?: string;
        side_brush_entity_override?: string;
        sensor_entity_override?: string;
        show_start?: boolean;
        show_pause?: boolean;
        show_stop?: boolean;
        show_dock?: boolean;
        show_locate?: boolean;
        control_layout?: 'row' | 'grid' | 'compact';
        custom_image?: string;
        display_mode?: 'below_vacuum' | 'replace_vacuum' | 'swipe';
        style?: 'default' | 'speed_only' | 'compact';
    };
}
export interface VacuumRoom {
    id: string;
    name: string;
    icon?: string;
    segment_id?: string | number;
}
export interface VacuumZone {
    id: string;
    name: string;
    icon?: string;
    coordinates?: number[];
}
export type CalendarViewType = 'compact_list' | 'month' | 'week' | 'day' | 'table' | 'grid';
export type FirstDayOfWeek = 'sunday' | 'monday' | 'saturday';
export type WeekNumberFormat = 'none' | 'iso' | 'us';
export interface CalendarEntityConfig {
    id: string;
    entity: string;
    name?: string;
    color?: string;
    visible?: boolean;
}
export interface CalendarEventData {
    uid?: string;
    summary: string;
    start: string | {
        dateTime?: string;
        date?: string;
    };
    end: string | {
        dateTime?: string;
        date?: string;
    };
    description?: string;
    location?: string;
    recurrence_id?: string;
    rrule?: string;
}
export interface ProcessedCalendarEvent {
    id: string;
    calendarId: string;
    calendarColor: string;
    calendarName: string;
    summary: string;
    description?: string;
    location?: string;
    start: Date;
    end: Date;
    isAllDay: boolean;
    isMultiDay: boolean;
    raw: CalendarEventData;
}
export interface CalendarModule extends BaseModule {
    type: 'calendar';
    calendars: CalendarEntityConfig[];
    view_type: CalendarViewType;
    days_to_show: number;
    start_date?: string;
    title?: string;
    show_title?: boolean;
    title_font_size?: string;
    title_color?: string;
    show_title_separator?: boolean;
    title_separator_color?: string;
    title_separator_width?: string;
    compact_events_to_show?: number;
    compact_show_all_day_events?: boolean;
    compact_hide_empty_days?: boolean;
    compact_auto_fit_height?: boolean;
    compact_height?: string;
    compact_overflow?: 'scroll' | 'hidden';
    compact_show_nav_buttons?: boolean;
    show_week_numbers?: WeekNumberFormat;
    first_day_of_week?: FirstDayOfWeek;
    month_show_event_count?: boolean;
    week_start_hour?: number;
    week_end_hour?: number;
    week_time_interval?: number;
    day_start_hour?: number;
    day_end_hour?: number;
    day_time_interval?: number;
    table_show_date_column?: boolean;
    table_show_time_column?: boolean;
    table_show_calendar_column?: boolean;
    table_show_location_column?: boolean;
    table_show_duration_column?: boolean;
    grid_columns?: number;
    grid_card_height?: string;
    show_event_time?: boolean;
    show_end_time?: boolean;
    show_event_location?: boolean;
    show_event_description?: boolean;
    show_event_icon?: boolean;
    time_24h?: boolean;
    remove_location_country?: boolean;
    max_event_title_length?: number;
    show_past_events?: boolean;
    date_vertical_alignment?: 'top' | 'middle' | 'bottom';
    weekday_font_size?: string;
    weekday_color?: string;
    day_font_size?: string;
    day_color?: string;
    show_month?: boolean;
    month_font_size?: string;
    month_color?: string;
    event_font_size?: string;
    event_color?: string;
    time_font_size?: string;
    time_color?: string;
    time_icon_size?: string;
    location_font_size?: string;
    location_color?: string;
    location_icon_size?: string;
    description_font_size?: string;
    description_color?: string;
    event_background_opacity?: number;
    vertical_line_width?: string;
    accent_color?: string;
    row_spacing?: string;
    event_spacing?: string;
    additional_card_spacing?: string;
    show_day_separator?: boolean;
    day_separator_width?: string;
    day_separator_color?: string;
    show_week_separator?: boolean;
    week_separator_width?: string;
    week_separator_color?: string;
    month_separator_width?: string;
    month_separator_color?: string;
    tap_action_expand?: boolean;
    refresh_interval?: number;
    filter_keywords?: string[];
    filter_mode?: 'include' | 'exclude';
    language?: string;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
    event_tap_action?: ModuleActionConfig;
    template_mode?: boolean;
    template?: string;
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
export type SportsLeague = 'nfl' | 'nba' | 'mlb' | 'nhl' | 'mls' | 'premier_league' | 'ncaaf' | 'ncaab' | 'la_liga' | 'bundesliga' | 'serie_a' | 'ligue_1';
export type SportsDisplayStyle = 'scorecard' | 'upcoming' | 'compact' | 'detailed' | 'mini' | 'logo_bg';
export type SportsGameStatus = 'scheduled' | 'in_progress' | 'halftime' | 'final' | 'delayed' | 'postponed' | 'cancelled';
export interface SportsGameData {
    gameId: string;
    league: SportsLeague;
    homeTeam: {
        id: string;
        name: string;
        abbreviation: string;
        logo: string;
        score: number | null;
        record?: string;
        color?: string;
    };
    awayTeam: {
        id: string;
        name: string;
        abbreviation: string;
        logo: string;
        score: number | null;
        record?: string;
        color?: string;
    };
    status: SportsGameStatus;
    statusDetail?: string;
    clock?: string;
    period?: number | string;
    gameTime: Date | null;
    venue?: string;
    broadcast?: string;
    odds?: {
        spread?: string;
        overUnder?: string;
    };
    lastUpdated: Date;
}
export interface SportsTeamInfo {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    league: SportsLeague;
    color?: string;
}
export interface SportsScoreModule extends BaseModule {
    type: 'sports_score';
    data_source: 'ha_sensor' | 'espn_api';
    sensor_entity?: string;
    league?: SportsLeague;
    team_id?: string;
    team_name?: string;
    display_style: SportsDisplayStyle;
    refresh_interval: number;
    show_team_logos: boolean;
    show_team_names: boolean;
    show_team_records: boolean;
    show_game_time: boolean;
    show_venue: boolean;
    show_broadcast: boolean;
    show_score: boolean;
    show_odds: boolean;
    show_status_detail: boolean;
    home_team_color?: string;
    away_team_color?: string;
    use_team_colors?: boolean;
    win_color?: string;
    loss_color?: string;
    in_progress_color?: string;
    scheduled_color?: string;
    text_color?: string;
    team_name_font_size?: string;
    score_font_size?: string;
    detail_font_size?: string;
    logo_size?: string;
    compact_mode?: boolean;
    show_logo_background?: boolean;
    logo_background_size?: string;
    logo_background_opacity?: number;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
    enable_hover_effect?: boolean;
    hover_background_color?: string;
}
/**
 * Badge of Honor Module - Pro Feature
 *
 * A beautiful animated badge that celebrates Ultra Card Pro membership.
 * Features rotating circular text, smooth gradient color transitions,
 * and customizable inner content (icon, text, or image).
 */
export interface BadgeOfHonorModule extends BaseModule {
    type: 'badge_of_honor';
    badge_text?: string;
    badge_text_repeat?: number;
    badge_size?: number;
    inner_badge_ratio?: number;
    gradient_color_1?: string;
    gradient_color_2?: string;
    gradient_color_3?: string;
    gradient_color_4?: string;
    rotation_speed?: number;
    rotation_direction?: 'clockwise' | 'counter-clockwise';
    enable_color_shift?: boolean;
    color_shift_speed?: number;
    enable_glow?: boolean;
    glow_intensity?: number;
    enable_pulse?: boolean;
    pulse_speed?: number;
    inner_content_type?: 'icon' | 'text' | 'image';
    inner_icon?: string;
    inner_text?: string;
    inner_image_url?: string;
    inner_background_type?: 'solid' | 'gradient' | 'transparent';
    inner_background_color?: string;
    inner_text_color?: string;
    inner_icon_color?: string;
    text_font_size?: number;
    text_font_weight?: number;
    text_letter_spacing?: number;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
    enable_hover_effect?: boolean;
    hover_scale?: number;
    hover_background_color?: string;
}
export type GridStylePreset = 'style_1' | 'style_2' | 'style_3' | 'style_4' | 'style_5' | 'style_6' | 'style_7' | 'style_8' | 'style_9' | 'style_10' | 'style_11' | 'style_12' | 'style_13' | 'style_14' | 'style_15' | 'style_16' | 'style_17' | 'style_18' | 'style_19' | 'style_20';
export type GridDisplayMode = 'grid' | 'masonry' | 'metro';
export type GridSortBy = 'name' | 'last_updated' | 'state' | 'custom' | 'domain';
export type GridPaginationStyle = 'numbers' | 'buttons' | 'both';
export type GridLoadAnimation = 'fadeIn' | 'slideUp' | 'zoomIn' | 'slideDown' | 'slideLeft' | 'slideRight' | 'none';
export type MetroSize = 'small' | 'medium' | 'large';
export interface GridEntity {
    id: string;
    entity: string;
    custom_name?: string;
    custom_icon?: string;
    custom_color?: string;
    custom_background?: string;
    override_actions?: boolean;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
    metro_size?: MetroSize;
    state_colors?: Record<string, string>;
    hidden?: boolean;
    display_mode?: 'always' | 'every' | 'any';
    display_conditions?: DisplayCondition[];
}
export interface GridModule extends BaseModule {
    type: 'grid';
    entities: GridEntity[];
    enable_auto_filter?: boolean;
    include_domains?: string[];
    exclude_domains?: string[];
    exclude_entities?: string[];
    include_keywords?: string[];
    exclude_keywords?: string[];
    grid_style: GridStylePreset;
    grid_display_mode: GridDisplayMode;
    columns: number;
    columns_mobile?: number;
    rows?: number;
    gap: number;
    sort_by: GridSortBy;
    sort_direction: 'asc' | 'desc';
    max_items: number;
    enable_pagination: boolean;
    items_per_page: number;
    pagination_style: GridPaginationStyle;
    enable_load_animation: boolean;
    load_animation: GridLoadAnimation;
    grid_animation_duration: number;
    animation_stagger: number;
    global_icon_size: number;
    global_font_size: number;
    global_name_color?: string;
    global_state_color?: string;
    global_icon_color?: string;
    global_background_color?: string;
    global_border_radius: string;
    global_padding: string;
    global_border_width?: number;
    global_border_color?: string;
    global_on_color?: string;
    global_off_color?: string;
    global_unavailable_color?: string;
    glass_tint_color?: string;
    glass_blur_amount?: number;
    glass_border_color?: string;
    gradient_start_color?: string;
    gradient_end_color?: string;
    gradient_direction?: 'to-bottom' | 'to-right' | 'to-bottom-right' | 'to-bottom-left';
    panel_header_color?: string;
    panel_header_text_color?: string;
    split_left_color?: string;
    split_right_color?: string;
    neumorphic_light_shadow?: string;
    neumorphic_dark_shadow?: string;
    accent_border_color?: string;
    card_shadow_color?: string;
    tap_action: ModuleActionConfig;
    hold_action: ModuleActionConfig;
    double_tap_action: ModuleActionConfig;
    enable_hover_effect?: boolean;
    hover_effect?: 'none' | 'scale' | 'glow' | 'lift' | 'color';
    hover_scale?: number;
    hover_background_color?: string;
    hover_glow_color?: string;
    template_mode?: boolean;
    template?: string;
    unified_template_mode?: boolean;
    unified_template?: string;
}
export interface MediaPlayerModule extends BaseModule {
    type: 'media_player';
    entity: string;
    layout?: 'compact' | 'card' | 'mini';
    card_size?: number;
    show_name?: boolean;
    show_album_art?: boolean;
    show_track_info?: boolean;
    show_progress?: boolean;
    show_duration?: boolean;
    show_controls?: boolean;
    show_volume?: boolean;
    show_source?: boolean;
    show_shuffle?: boolean;
    show_repeat?: boolean;
    show_sound_mode?: boolean;
    show_stop_button?: boolean;
    show_album_name?: boolean;
    enable_seek?: boolean;
    auto_hide_when_off?: boolean;
    expandable?: boolean;
    dynamic_colors?: boolean;
    blurred_background?: boolean;
    blur_amount?: number;
    blur_opacity?: number;
    blur_expand?: boolean;
    animated_visuals?: boolean;
    visualizer_type?: 'rings' | 'bars' | 'wave' | 'dots' | 'spectrum' | 'pulse' | 'orbit' | 'spiral' | 'equalizer' | 'particles';
    fallback_icon?: string;
    play_icon?: string;
    pause_icon?: string;
    stop_icon?: string;
    previous_icon?: string;
    next_icon?: string;
    shuffle_icon?: string;
    repeat_icon?: string;
    repeat_one_icon?: string;
    volume_muted_icon?: string;
    volume_low_icon?: string;
    volume_medium_icon?: string;
    volume_high_icon?: string;
    background_color?: string;
    text_color?: string;
    progress_color?: string;
    progress_background?: string;
    button_color?: string;
    button_active_color?: string;
    album_art_border_radius?: string;
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
export type PeopleLayoutStyle = 'compact' | 'banner' | 'horizontal_compact' | 'horizontal_detailed' | 'header' | 'music_overlay';
export type StatusBadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type PeopleDataItemType = 'location' | 'battery' | 'time_info' | 'media' | 'sensor' | 'device_state' | 'attribute' | 'toggle';
export interface PeopleDataItem {
    id: string;
    type: PeopleDataItemType;
    label?: string;
    entity?: string;
    attribute?: string;
    icon?: string;
    show_icon: boolean;
    show_label: boolean;
    show_value: boolean;
    format?: string;
    icon_color?: string;
    label_color?: string;
    value_color?: string;
    icon_size?: number;
    font_size?: number;
    time_format?: 'relative' | 'absolute' | 'duration';
    toggle_on_color?: string;
    toggle_off_color?: string;
}
export interface PeopleAvatarSettings {
    size: number;
    border_color?: string;
    border_width: number;
    show_status_badge: boolean;
    status_badge_position: StatusBadgePosition;
    status_badge_home_color?: string;
    status_badge_away_color?: string;
    use_state_color: boolean;
    state_home_color?: string;
    state_away_color?: string;
    fallback_icon?: string;
    show_entity_picture: boolean;
    custom_image?: string;
    image_fit?: 'cover' | 'contain' | 'fill';
}
export interface PeopleBannerSettings {
    background_type: 'image' | 'gradient' | 'color' | 'entity';
    background_image?: string;
    background_entity?: string;
    background_color?: string;
    gradient_start?: string;
    gradient_end?: string;
    gradient_direction?: 'to-bottom' | 'to-right' | 'to-bottom-right' | 'to-bottom-left';
    background_blur: number;
    background_opacity: number;
    overlay_color?: string;
    overlay_opacity?: number;
    banner_height?: number;
    border_radius?: number;
    border_radius_top_left?: number;
    border_radius_top_right?: number;
    border_radius_bottom_left?: number;
    border_radius_bottom_right?: number;
    corners_linked?: boolean;
}
export interface PeopleNameSettings {
    show: boolean;
    use_friendly_name: boolean;
    custom_name?: string;
    font_size: number;
    font_weight: string;
    color?: string;
    alignment?: 'left' | 'center' | 'right';
}
export interface PeopleLocationSettings {
    show: boolean;
    show_icon: boolean;
    icon?: string;
    icon_color?: string;
    font_size: number;
    color?: string;
    show_duration: boolean;
    duration_format?: 'relative' | 'absolute';
}
export interface PeopleModule extends BaseModule {
    type: 'people';
    person_entity: string;
    layout_style: PeopleLayoutStyle;
    data_items: PeopleDataItem[];
    data_items_compact?: PeopleDataItem[];
    data_items_banner?: PeopleDataItem[];
    data_items_horizontal_compact?: PeopleDataItem[];
    data_items_horizontal_detailed?: PeopleDataItem[];
    data_items_header?: PeopleDataItem[];
    data_items_music_overlay?: PeopleDataItem[];
    avatar_settings: PeopleAvatarSettings;
    banner_settings?: PeopleBannerSettings;
    name_settings: PeopleNameSettings;
    location_settings: PeopleLocationSettings;
    battery_entity?: string;
    media_player_entity?: string;
    show_location_badge?: boolean;
    show_battery_badge?: boolean;
    show_avatar?: boolean;
    gap: number;
    data_items_gap: number;
    data_area_height?: number;
    data_items_direction: 'row' | 'column';
    alignment: 'left' | 'center' | 'right';
    vertical_alignment: 'top' | 'center' | 'bottom';
    header_show_badges: boolean;
    header_badges_position: 'top' | 'bottom';
    music_show_progress: boolean;
    music_show_album_art: boolean;
    music_blur_background: boolean;
    music_album_blur?: number;
    music_album_opacity?: number;
    tap_action?: ModuleActionConfig;
    hold_action?: ModuleActionConfig;
    double_tap_action?: ModuleActionConfig;
    enable_hover_effect?: boolean;
    hover_effect?: 'none' | 'scale' | 'glow' | 'lift' | 'color';
    hover_scale?: number;
    hover_background_color?: string;
    hover_glow_color?: string;
    template_mode?: boolean;
    template?: string;
    unified_template_mode?: boolean;
    unified_template?: string;
}
