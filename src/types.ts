import { HomeAssistant } from 'custom-card-helpers';
import { LinkAction } from './services/link-service';

// Global window interface extensions
declare global {
  interface Window {
    _ultraCardUpdateTimer?: ReturnType<typeof setTimeout> | null;
  }
}

// Action type definition (includes 'default' for smart resolution)
export type ActionType =
  | 'default'
  | 'more-info'
  | 'toggle'
  | 'navigate'
  | 'url'
  | 'perform-action'
  | 'assist'
  | 'nothing';

// Unified Template Response (parsed from JSON template results)
export interface UnifiedTemplateResponse {
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
}

export interface ModuleActionConfig {
  action: ActionType;
  entity?: string;
  navigation_path?: string;
  url_path?: string;
  service?: string;
  perform_action?: string;
  service_data?: Record<string, any>;
  target?: {
    entity_id?: string | string[];
    device_id?: string | string[];
    area_id?: string | string[];
  };
  data?: Record<string, any>;
}

// MODULAR LAYOUT SYSTEM TYPES
// ============================

// Display conditions for modules and sections
export interface DisplayCondition {
  id: string;
  type: 'entity_state' | 'entity_attribute' | 'template' | 'time';
  entity?: string;
  attribute?: string; // For entity attributes
  operator?:
    | '='
    | '!='
    | '>'
    | '>='
    | '<'
    | '<='
    | 'has_value'
    | 'no_value'
    | 'contains'
    | 'not_contains';
  value?: string | number;
  template?: string;
  time_from?: string;
  time_to?: string;
  enabled?: boolean; // Whether this condition is active
}

// Base module interface that all modules extend
export interface BaseModule {
  id: string;
  type:
    | 'image'
    | 'info'
    | 'bar'
    | 'icon'
    | 'text'
    | 'separator'
    | 'horizontal'
    | 'vertical'
    | 'accordion'
    | 'popup'
    | 'slider'
    | 'slider_control'
    | 'pagebreak'
    | 'button'
    | 'markdown'
    | 'climate'
    | 'camera'
    | 'graphs'
    | 'dropdown'
    | 'light'
    | 'gauge'
    | 'spinbox'
    | 'animated_clock'
    | 'animated_weather'
    | 'animated_forecast'
    | 'external_card'
    | 'native_card'
    | 'video_bg'
    | 'dynamic_weather'
    | 'background'
    | 'map'
    | 'status_summary'
    | 'toggle'
    | 'tabs'
    | 'calendar'
    | 'sports_score'
    | 'grid'
    | 'badge_of_honor';
  name?: string;
  // Display conditions - when to show/hide this module
  display_mode?: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[];
  // Legacy design properties (for backward compatibility)
  background_color?: string;
  background_image?: string;
  background_image_type?: 'none' | 'upload' | 'entity' | 'url';
  background_image_entity?: string;
  background_size?: 'cover' | 'contain' | 'auto' | string; // string to allow custom values like '100px 200px'
  background_position?:
    | 'left top'
    | 'left center'
    | 'left bottom'
    | 'center top'
    | 'center center'
    | 'center bottom'
    | 'right top'
    | 'right center'
    | 'right bottom'
    | string; // string to allow custom values
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
  custom_css?: string;
  // Animation properties (for easy access)
  intro_animation?:
    | 'none'
    | 'fadeIn'
    | 'slideInUp'
    | 'slideInDown'
    | 'slideInLeft'
    | 'slideInRight'
    | 'zoomIn'
    | 'bounceIn'
    | 'flipInX'
    | 'flipInY'
    | 'rotateIn';
  outro_animation?:
    | 'none'
    | 'fadeOut'
    | 'slideOutUp'
    | 'slideOutDown'
    | 'slideOutLeft'
    | 'slideOutRight'
    | 'zoomOut'
    | 'bounceOut'
    | 'flipOutX'
    | 'flipOutY'
    | 'rotateOut';
  animation_duration?: string;
  animation_delay?: string;
  animation_timing?:
    | 'ease'
    | 'linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'cubic-bezier(0.25,0.1,0.25,1)';
  // New design properties with priority system
  design?: SharedDesignProperties;
  // Action confirmation - when enabled, shows a confirmation dialog before executing actions
  confirm_action?: boolean;
}

// Text Module
export interface TextModule extends BaseModule {
  type: 'text';
  text: string;
  // Legacy link support (for backward compatibility)
  link?: string;
  hide_if_no_link?: boolean;
  // Global link configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
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
  // Advanced typography options
  font_weight?: string;
  line_height?: number;
  letter_spacing?: string;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  font_style?: 'normal' | 'italic' | 'oblique';
  template_mode?: boolean;
  template?: string;
  // Unified template system
  unified_template_mode?: boolean;
  unified_template?: string;
  ignore_entity_state_config?: boolean;
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
  hover_effect?: 'none' | 'color' | 'scale' | 'glow' | 'lift';
  hover_glow_color?: string;
}

// Separator Module
export interface SeparatorModule extends BaseModule {
  type: 'separator';
  separator_style?: 'line' | 'double_line' | 'dotted' | 'double_dotted' | 'shadow' | 'blank';
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  width_percent?: number | string; // Percentage (e.g., "100%") or pixels (e.g., "200px")
  height_px?: number | string; // Pixels (e.g., "300px") or percentage (e.g., "50%")
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
  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Image Module
export interface ImageModule extends BaseModule {
  type: 'image';
  // Legacy properties (for backward compatibility)
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
  // New enhanced properties
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
  // Link configuration (legacy)
  link_enabled?: boolean;
  link_url?: string;
  link_target?: '_self' | '_blank';
  // Ultra Link Configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  // Alignment
  alignment?: 'left' | 'center' | 'right';
  // CSS Filters
  filter_blur?: number;
  filter_brightness?: number;
  filter_contrast?: number;
  filter_saturate?: number;
  filter_hue_rotate?: number;
  filter_opacity?: number;
  // Rotation
  rotation?: number;
  // Hover effects
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
  // Template support
  template_mode?: boolean;
  template?: string;
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Info Entity Configuration
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
  // Unified template system (replaces multiple template boxes)
  unified_template_mode?: boolean;
  unified_template?: string;
  ignore_entity_state_config?: boolean;
  // Icon positioning and alignment
  icon_position?: 'left' | 'right' | 'top' | 'bottom';
  icon_alignment?: 'start' | 'center' | 'end';
  name_alignment?: 'start' | 'center' | 'end';
  state_alignment?: 'start' | 'center' | 'end';
  overall_alignment?: 'left' | 'center' | 'right';
  icon_gap?: number;
  // Name/Value layout direction (works with any icon position or when icon is disabled)
  name_value_layout?: 'vertical' | 'horizontal';
  name_value_gap?: number;
  // Content distribution control
  content_distribution?: 'normal' | 'space-between' | 'space-around' | 'space-evenly';
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Info Module
export interface InfoModule extends BaseModule {
  type: 'info';
  info_entities: InfoEntityConfig[];
  alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
  vertical_alignment?: 'top' | 'center' | 'bottom';
  columns?: number;
  gap?: number;
  allow_wrap?: boolean;
  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Bar Module
export interface BarModule extends BaseModule {
  type: 'bar';
  // Basic Configuration
  entity: string;
  name?: string;

  // Percentage Calculation
  percentage_type?: 'entity' | 'attribute' | 'difference' | 'template';
  percentage_entity?: string;

  // Entity Attribute mode
  percentage_attribute_entity?: string;
  percentage_attribute_name?: string;

  // Difference mode
  percentage_current_entity?: string;
  percentage_total_entity?: string;

  // Template mode
  percentage_template?: string;

  // Manual Min/Max Range (overrides auto-detection)
  percentage_min?: number;
  percentage_max?: number;
  percentage_min_template_mode?: boolean;
  percentage_min_template?: string;
  percentage_max_template_mode?: boolean;
  percentage_max_template?: string;

  // Bar Appearance
  bar_direction?: 'left-to-right' | 'right-to-left';
  bar_size?: 'extra-thick' | 'thick' | 'medium' | 'thin';
  bar_radius?: 'square' | 'round' | 'pill';
  bar_style?:
    | 'flat'
    | 'glossy'
    | 'embossed'
    | 'inset'
    | 'gradient-overlay'
    | 'neon-glow'
    | 'outline'
    | 'glass'
    | 'metallic'
    | 'neumorphic'
    | 'dashed'
    | 'dots'
    | 'minimal';
  bar_width?: number; // Now a percentage number instead of string
  bar_alignment?: 'left' | 'center' | 'right';
  height?: number;
  border_radius?: number;
  glass_blur_amount?: number; // Glass blur amount (0-20px) for glass style

  // Text Display
  label_alignment?: 'left' | 'center' | 'right' | 'space-between';
  show_percentage?: boolean;
  percentage_text_size?: number;
  percentage_text_alignment?: 'left' | 'center' | 'right' | 'follow-fill';
  percentage_text_bold?: boolean;
  percentage_text_italic?: boolean;
  percentage_text_strikethrough?: boolean;
  show_value?: boolean;
  value_position?: 'inside' | 'outside' | 'none';

  // Left Side Configuration
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

  // Right Side Configuration
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

  // Left Side Actions
  left_tap_action?: ModuleActionConfig;
  left_hold_action?: ModuleActionConfig;
  left_double_tap_action?: ModuleActionConfig;

  // Right Side Actions
  right_tap_action?: ModuleActionConfig;
  right_hold_action?: ModuleActionConfig;
  right_double_tap_action?: ModuleActionConfig;

  // Colors
  bar_color?: string;
  bar_background_color?: string;
  bar_border_color?: string;
  percentage_text_color?: string;
  dot_color?: string; // Color for minimal style dot indicator

  // Minimal style icon configuration
  minimal_icon_enabled?: boolean; // Enable icon display
  minimal_icon?: string; // Icon to display (e.g., mdi:battery)
  minimal_icon_mode?: 'dot-only' | 'icon-only' | 'icon-in-dot'; // Display mode
  minimal_icon_size?: number; // Icon size in pixels
  minimal_icon_size_auto?: boolean; // Auto-scale with bar height (default: true)
  minimal_icon_color?: string; // Icon color (if empty, uses dot color)
  minimal_icon_use_dot_color?: boolean; // Use dot color for icon (default: true)

  // Gradient Configuration
  use_gradient?: boolean;
  gradient_display_mode?: 'full' | 'cropped' | 'value-based';
  gradient_stops?: Array<{
    id: string;
    position: number;
    color: string;
  }>;

  // Limit Indicator
  limit_entity?: string;
  limit_color?: string;

  // Animation & Templates
  animation?: boolean;
  template_mode?: boolean;
  template?: string;
  // Unified template system
  unified_template_mode?: boolean;
  unified_template?: string;
  ignore_entity_state_config?: boolean;

  // Bar Animation (state/attribute triggered)
  bar_animation_enabled?: boolean;
  bar_animation_entity?: string;
  bar_animation_trigger_type?: 'state' | 'attribute';
  bar_animation_attribute?: string;
  bar_animation_value?: string;
  bar_animation_type?:
    | 'none'
    | 'charging'
    | 'pulse'
    | 'blinking'
    | 'bouncing'
    | 'glow'
    | 'rainbow'
    | 'bubbles'
    | 'fill'
    | 'ripple'
    | 'traffic'
    | 'traffic_flow'
    | 'heartbeat'
    | 'flicker'
    | 'shimmer'
    | 'vibrate';

  // Bar Animation Override (takes precedence over the regular animation)
  bar_animation_override_entity?: string;
  bar_animation_override_trigger_type?: 'state' | 'attribute';
  bar_animation_override_attribute?: string;
  bar_animation_override_value?: string;
  bar_animation_override_type?:
    | 'none'
    | 'charging'
    | 'pulse'
    | 'blinking'
    | 'bouncing'
    | 'glow'
    | 'rainbow'
    | 'bubbles'
    | 'fill'
    | 'ripple'
    | 'traffic'
    | 'traffic_flow'
    | 'heartbeat'
    | 'flicker'
    | 'shimmer'
    | 'vibrate';

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Gauge Module
export interface GaugeModule extends BaseModule {
  type: 'gauge';
  // Basic Configuration
  entity: string;
  name?: string;

  // Value Calculation
  value_type?: 'entity' | 'attribute' | 'template';
  value_entity?: string;
  value_attribute_entity?: string;
  value_attribute_name?: string;
  value_template?: string;

  // Range Configuration
  min_value?: number;
  max_value?: number;

  // Gauge Style
  gauge_style?:
    | 'basic'
    | 'speedometer'
    | 'block'
    | 'lines'
    | 'modern'
    | 'inset'
    | '3d'
    | 'neon'
    | 'digital'
    | 'minimal'
    | 'arc'
    | 'radial';
  gauge_size?: number; // Gauge diameter/size in pixels
  gauge_thickness?: number; // Thickness of gauge track (1-50)
  flip_horizontal?: boolean; // Flip gauge horizontally (Arc and Speedometer styles only)

  // Pointer Configuration
  pointer_enabled?: boolean;
  pointer_style?:
    | 'triangle'
    | 'line'
    | 'needle'
    | 'arrow'
    | 'circle'
    | 'highlight'
    | 'cap'
    | 'icon'
    | 'custom';
  pointer_color?: string;
  pointer_length?: number; // Percentage of gauge radius (1-100)
  pointer_width?: number; // Width in pixels
  pointer_icon?: string; // Icon name (e.g., 'mdi:gauge') for icon pointer style
  pointer_icon_color?: string; // Color for icon pointer style
  pointer_icon_size?: number; // Size of icon in pixels for icon pointer style

  // Color Configuration
  gauge_color_mode?: 'solid' | 'gradient' | 'segments';

  // Solid color mode
  gauge_color?: string;
  gauge_background_color?: string;

  // Gradient mode
  use_gradient?: boolean;
  gradient_display_mode?: 'full' | 'cropped' | 'value-based';
  gradient_stops?: Array<{
    id: string;
    position: number; // 0-100
    color: string;
  }>;

  // Segments mode (for discrete color sections)
  use_segments?: boolean;
  segments?: Array<{
    id: string;
    from: number;
    to: number;
    color: string;
    label?: string;
  }>;

  // Display Configuration
  show_value?: boolean;
  value_position?: 'center' | 'top' | 'bottom' | 'none';
  value_font_size?: number;
  value_color?: string;
  value_format?: string; // Format string for value display (e.g., "%.1f°C")
  value_x_offset?: number; // X offset for value positioning
  value_y_offset?: number; // Y offset for value positioning

  // Value formatting
  value_bold?: boolean;
  value_italic?: boolean;
  value_underline?: boolean;
  value_uppercase?: boolean;
  value_strikethrough?: boolean;

  show_name?: boolean;
  name_position?: 'top' | 'bottom' | 'center' | 'none';
  name_font_size?: number;
  name_color?: string;
  name_x_offset?: number; // X offset for name positioning
  name_y_offset?: number; // Y offset for name positioning

  // Name formatting
  name_bold?: boolean;
  name_italic?: boolean;
  name_underline?: boolean;
  name_uppercase?: boolean;
  name_strikethrough?: boolean;

  show_min_max?: boolean;
  min_max_font_size?: number;
  min_max_color?: string;

  // Tick Marks
  show_ticks?: boolean;
  tick_count?: number; // Number of major tick marks
  tick_color?: string;
  show_tick_labels?: boolean;
  tick_label_font_size?: number;

  // Gauge Animation (needle/value animation - named to avoid Design tab conflict)
  gauge_animation_enabled?: boolean;
  gauge_animation_duration?: string; // Duration in milliseconds
  gauge_animation_easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';

  // Zones/Ranges (visual indicators on gauge)
  zones?: Array<{
    id: string;
    from: number;
    to: number;
    color: string;
    opacity?: number;
  }>;

  // Template support
  template_mode?: boolean;
  template?: string;
  // Unified template system
  unified_template_mode?: boolean;
  unified_template?: string;
  ignore_entity_state_config?: boolean;

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };

  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Icon Configuration
export interface IconConfig {
  id: string;
  icon_mode?: 'entity' | 'static'; // 'entity' = connected to HA entity, 'static' = standalone icon
  entity: string;
  name?: string;

  // Icon states
  icon_inactive?: string;
  icon_active?: string;
  inactive_state?: string;
  active_state?: string;
  inactive_attribute?: string;
  active_attribute?: string;
  custom_inactive_state_text?: string;
  custom_active_state_text?: string;
  custom_inactive_name_text?: string;
  custom_active_name_text?: string;

  // Template modes for state evaluation
  inactive_template_mode?: boolean;
  inactive_template?: string;
  active_template_mode?: boolean;
  active_template?: string;

  // Entity color options
  use_entity_color_for_icon?: boolean;
  use_state_color_for_inactive_icon?: boolean;
  use_state_color_for_active_icon?: boolean;

  // Color configuration
  color_inactive?: string;
  color_active?: string;
  inactive_icon_color?: string;
  active_icon_color?: string;
  inactive_name_color?: string;
  active_name_color?: string;
  inactive_state_color?: string;
  active_state_color?: string;

  // Display toggles for inactive state
  show_name_when_inactive?: boolean;
  show_state_when_inactive?: boolean;
  show_icon_when_inactive?: boolean;

  // Display toggles for active state
  show_name_when_active?: boolean;
  show_state_when_active?: boolean;
  show_icon_when_active?: boolean;

  // Legacy show options (for backward compatibility)
  show_state?: boolean;
  show_name?: boolean;

  // Other display options
  show_units?: boolean;

  // Hover effects
  enable_hover_effect?: boolean;

  // Sizing
  icon_size?: number;
  text_size?: number;
  name_icon_gap?: number;
  name_state_gap?: number;
  icon_state_gap?: number;

  // Active/Inactive specific sizing
  active_icon_size?: number;
  inactive_icon_size?: number;
  active_text_size?: number;
  inactive_text_size?: number;
  state_size?: number;
  active_state_size?: number;
  inactive_state_size?: number;

  // Size lock mechanism (individual locks for each size)
  icon_size_locked?: boolean;
  text_size_locked?: boolean;
  state_size_locked?: boolean;

  // Field lock mechanism (locks for active fields to inherit from inactive)
  active_icon_locked?: boolean;
  active_icon_color_locked?: boolean;
  active_icon_background_locked?: boolean;
  active_icon_background_color_locked?: boolean;
  active_name_locked?: boolean;
  active_name_color_locked?: boolean;
  active_state_locked?: boolean;
  active_state_color_locked?: boolean;

  // Icon background
  icon_background?: 'none' | 'rounded-square' | 'circle';
  use_entity_color_for_icon_background?: boolean;
  icon_background_color?: string;

  // Container background image controls (optional per-icon override)
  background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  background_position?:
    | 'left top'
    | 'left center'
    | 'left bottom'
    | 'center top'
    | 'center center'
    | 'center bottom'
    | 'right top'
    | 'right center'
    | 'right bottom';
  background_size?: 'cover' | 'contain' | 'auto' | string;

  // Active/Inactive specific icon backgrounds
  active_icon_background?: 'none' | 'rounded-square' | 'circle';
  inactive_icon_background?: 'none' | 'rounded-square' | 'circle';
  active_icon_background_color?: string;
  inactive_icon_background_color?: string;

  // Icon background padding (distance from icon to background edge)
  icon_background_padding?: number;
  active_icon_background_padding?: number;
  inactive_icon_background_padding?: number;
  active_icon_background_padding_locked?: boolean;

  // Animations (extended with design tab animations)
  inactive_icon_animation?:
    | 'none'
    | 'pulse'
    | 'spin'
    | 'bounce'
    | 'flash'
    | 'shake'
    | 'vibrate'
    | 'rotate-left'
    | 'rotate-right'
    | 'fade'
    | 'scale'
    | 'tada';
  active_icon_animation?:
    | 'none'
    | 'pulse'
    | 'spin'
    | 'bounce'
    | 'flash'
    | 'shake'
    | 'vibrate'
    | 'rotate-left'
    | 'rotate-right'
    | 'fade'
    | 'scale'
    | 'tada';

  // Container appearance
  vertical_alignment?: 'top' | 'center' | 'bottom';
  container_width?: number; // Changed from string to number for slider
  container_background_shape?: 'none' | 'rounded' | 'square' | 'circle';
  container_background_color?: string;

  // Link/Action Configuration (using UltraLink pattern)
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };

  // Legacy actions (for backward compatibility)
  click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service';
  double_click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service';
  hold_action_legacy?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service';
  navigation_path?: string;
  url?: string;
  service?: string;
  service_data?: Record<string, any>;

  // Template support (legacy)
  template_mode?: boolean;
  template?: string;

  // Dynamic templates
  dynamic_icon_template_mode?: boolean;
  dynamic_icon_template?: string;
  dynamic_color_template_mode?: boolean;
  dynamic_color_template?: string;

  // Unified template system (replaces multiple template boxes)
  unified_template_mode?: boolean;
  unified_template?: string;
  ignore_entity_state_config?: boolean; // When true, template controls state logic too
}

// Icon Module
export interface IconModule extends BaseModule {
  type: 'icon';
  icons: IconConfig[];
  alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
  vertical_alignment?: 'top' | 'center' | 'bottom';
  columns?: number;
  gap?: number;
  allow_wrap?: boolean; // Allow grid items to wrap to new rows
  // Global action configuration (for the module container)
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  // Hover effects
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Horizontal Layout Module
export interface HorizontalModule extends BaseModule {
  type: 'horizontal';
  modules: CardModule[];
  alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around' | 'justify';
  vertical_alignment?: 'top' | 'center' | 'bottom' | 'stretch' | 'baseline';
  gap?: number;
  wrap?: boolean;
  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
}

// Vertical Layout Module
export interface VerticalModule extends BaseModule {
  type: 'vertical';
  modules: CardModule[];
  alignment?: 'top' | 'center' | 'bottom' | 'space-between' | 'space-around';
  // New: Horizontal alignment controls how items are aligned in the single column
  // Backward-compatible addition; UI will prefer this over legacy vertical alignment for cross-axis
  horizontal_alignment?: 'left' | 'center' | 'right' | 'stretch';
  gap?: number;
  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
}

// Accordion Layout Module
export interface AccordionModule extends BaseModule {
  type: 'accordion';
  modules: CardModule[];

  // Header configuration
  title_mode?: 'custom' | 'entity';
  title_text?: string;
  title_entity?: string;
  show_entity_name?: boolean; // Show entity name when using entity title mode
  icon?: string; // Main chevron/control icon (defaults to mdi:chevron-down)
  header_alignment?: 'center' | 'apart'; // How title and icon are aligned
  icon_side?: 'left' | 'right'; // Which side the icon appears on

  // State configuration
  default_open?: boolean;

  // Open/Close Logic
  open_mode?: 'always' | 'every' | 'any' | 'manual';
  open_conditions?: DisplayCondition[];

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
}

// Tab Section for Tabs Module
export interface TabSection {
  id: string;
  title: string;
  icon?: string;
  modules: CardModule[];
}

// Tabs Layout Module
export interface TabsModule extends BaseModule {
  type: 'tabs';
  sections: TabSection[];

  // Orientation and style
  orientation?: 'horizontal' | 'vertical';
  style?: 'default' | 'simple' | 'simple_2' | 'simple_3' | 'switch_1' | 'switch_2' | 'switch_3' | 'modern' | 'trendy';
  alignment?: 'left' | 'center' | 'right' | 'stretch';
  tab_position?: 'top' | 'bottom' | 'left' | 'right';

  // Behavior
  switch_on_hover?: boolean;
  default_tab?: string; // ID of the default active tab

  // Responsive options
  wrap_tabs?: boolean; // Allow tabs to wrap to multiple lines
  mobile_icons_only?: boolean; // Show only icons on mobile/narrow screens
  mobile_breakpoint?: number; // Breakpoint in pixels for mobile mode (default 600)

  // Typography
  font_size?: string;
  font_weight?: string;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

  // Tab Design
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

  // Content area design
  content_background?: string;
  content_padding?: string;
  content_border_radius?: string;
  content_border_color?: string;
  content_border_width?: number;

  // Animation
  transition_duration?: string;

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
}

// Popup Layout Module
export interface PopupModule extends BaseModule {
  type: 'popup';
  modules: CardModule[];

  // Title configuration
  show_title?: boolean;
  title_mode?: 'custom' | 'entity';
  title_text?: string;
  title_entity?: string;
  show_entity_name?: boolean;

  // Trigger configuration
  trigger_type?: 'button' | 'image' | 'icon' | 'page_load' | 'logic' | 'module';
  trigger_module_id?: string; // ID of the module that triggers this popup
  trigger_button_text?: string;
  trigger_button_icon?: string;
  trigger_image_type?: 'upload' | 'entity' | 'url';
  trigger_image_url?: string;
  trigger_image_entity?: string;
  trigger_icon?: string;

  // Trigger styling
  trigger_alignment?: 'left' | 'center' | 'right';
  trigger_button_full_width?: boolean;
  trigger_image_full_width?: boolean;

  // Layout settings
  layout?: 'default' | 'full_screen' | 'left_panel' | 'right_panel' | 'top_panel' | 'bottom_panel';
  animation?:
    | 'fade'
    | 'scale_up'
    | 'scale_down'
    | 'slide_top'
    | 'slide_left'
    | 'slide_right'
    | 'slide_bottom';

  // Popup styling
  popup_width?: string; // '600px', '100%', '14rem', '10vw'
  popup_padding?: string; // '5%', '20px', '1rem', '2vw'
  popup_border_radius?: string; // '5px', '50%', '0.3em', '12px 0'

  // Close button configuration
  close_button_position?: 'inside' | 'none';
  close_button_color?: string;
  close_button_size?: number;
  close_button_icon?: string;
  close_button_offset_x?: string;
  close_button_offset_y?: string;

  // Auto-close timer
  auto_close_timer_enabled?: boolean;
  auto_close_timer_seconds?: number;

  // Colors
  title_background_color?: string;
  title_text_color?: string;
  popup_background_color?: string;
  popup_text_color?: string;
  show_overlay?: boolean;
  overlay_background?: string;

  // Trigger Logic (for logic-based popup triggering)
  trigger_mode?: 'every' | 'any' | 'manual';
  trigger_conditions?: DisplayCondition[];
  auto_close?: boolean; // For logic triggers: auto-hide when conditions become false

  // Default state
  default_open?: boolean;
}

// Page Break Module (used in sliders to separate pages)
export interface PageBreakModule extends BaseModule {
  type: 'pagebreak';
  // No additional properties - just a separator
}

// Slider Layout Module
export interface SliderModule extends BaseModule {
  type: 'slider';
  modules: CardModule[]; // Flat array of modules with pagebreak modules as separators

  // Pagination Configuration
  show_pagination?: boolean;
  pagination_style?:
    | 'dots'
    | 'dots-and-dash'
    | 'dash-lines'
    | 'numbers'
    | 'thumbnails'
    | 'fraction'
    | 'progressbar'
    | 'scrollbar'
    | 'dynamic';
  pagination_position?: 'top' | 'bottom' | 'left' | 'right';
  pagination_color?: string;
  pagination_active_color?: string;
  pagination_size?: number;
  pagination_overlay?: boolean; // Whether pagination overlays content or gets its own space

  // Navigation Arrows Configuration
  show_arrows?: boolean;
  arrow_position_offset?: number; // Offset for arrow position (positive = more inside, negative = more outside)
  arrow_style?: 'default' | 'circle' | 'square' | 'minimal';
  arrow_size?: number;
  arrow_color?: string;
  arrow_background_color?: string;
  prev_arrow_icon?: string;
  next_arrow_icon?: string;
  arrows_always_visible?: boolean;

  // Transition Configuration
  transition_effect?:
    | 'slide'
    | 'fade'
    | 'cube'
    | 'coverflow'
    | 'flip'
    | 'zoom'
    // Legacy options for backward compatibility
    | 'slide-left'
    | 'slide-right'
    | 'slide-top'
    | 'slide-bottom'
    | 'zoom-in'
    | 'zoom-out'
    | 'circle';
  transition_speed?: number;

  // Auto-play Configuration
  auto_play?: boolean;
  auto_play_delay?: number;
  pause_on_hover?: boolean;
  loop?: boolean;

  // Interaction Configuration
  allow_swipe?: boolean;
  allow_keyboard?: boolean;
  allow_mousewheel?: boolean;

  // Layout Configuration
  slider_direction?: 'horizontal' | 'vertical';
  centered_slides?: boolean;
  slider_height?: number;
  auto_height?: boolean; // When true, slider adjusts to content height (default: true)
  slider_width?: string;
  gap?: number;
  slides_per_view?: number;
  space_between?: number;
  vertical_alignment?: 'top' | 'center' | 'bottom' | 'stretch';

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
}

// Slider Control Module (Entity Control)
// Slider Bar Configuration
export interface SliderBar {
  id: string;
  type: 'numeric' | 'brightness' | 'rgb' | 'color_temp' | 'red' | 'green' | 'blue' | 'attribute';
  entity: string;
  attribute?: string; // For attribute type
  name?: string; // Override label
  min_value?: number;
  max_value?: number;
  step?: number;

  // Individual bar visibility controls (optional, falls back to global)
  show_icon?: boolean;
  show_name?: boolean;
  show_value?: boolean;

  // Individual bar positioning controls (optional, falls back to global)
  outside_text_position?: 'left' | 'right';
  outside_name_position?:
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right'
    | 'top'
    | 'middle'
    | 'bottom';
  outside_value_position?:
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right'
    | 'top'
    | 'middle'
    | 'bottom';
  split_bar_position?: 'left' | 'right';
  split_bar_length?: number; // Percentage 0-100, default 60
  overlay_name_position?: 'top' | 'middle' | 'bottom';
  overlay_value_position?: 'top' | 'middle' | 'bottom';
  overlay_icon_position?: 'top' | 'middle' | 'bottom';

  // Unified content positioning for all layout modes (deprecated, use individual positions below)
  content_position?: // Horizontal Overlay: Left, Center, Right
  | 'left'
    | 'center'
    | 'right'
    // Vertical Overlay: Bottom, Center, Top
    | 'bottom'
    | 'top'
    // Horizontal Split: Left, Right (position of content relative to bar)
    // Vertical Split: Top, Bottom (position of content relative to bar)
    // Horizontal Outside: Top Left, Top Center, Top Right, Bottom Left, Bottom Center, Bottom Right
    | 'top_left'
    | 'top_center'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_center'
    | 'bottom_right'
    // Vertical Outside: Left Top, Left Center, Left Bottom, Right Top, Right Center, Right Bottom
    | 'left_top'
    | 'left_center'
    | 'left_bottom'
    | 'right_top'
    | 'right_center'
    | 'right_bottom';

  // Individual element positioning (overrides content_position if set)
  icon_position?:
    | 'left'
    | 'center'
    | 'right' // Horizontal Overlay
    | 'top'
    | 'bottom' // Vertical Overlay
    | 'top_left'
    | 'top_center'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_center'
    | 'bottom_right' // Horizontal Outside
    | 'left_top'
    | 'left_center'
    | 'left_bottom'
    | 'right_top'
    | 'right_center'
    | 'right_bottom'; // Vertical Outside

  name_position?:
    | 'left'
    | 'center'
    | 'right' // Horizontal Overlay
    | 'top'
    | 'bottom' // Vertical Overlay
    | 'top_left'
    | 'top_center'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_center'
    | 'bottom_right' // Horizontal Outside
    | 'left_top'
    | 'left_center'
    | 'left_bottom'
    | 'right_top'
    | 'right_center'
    | 'right_bottom'; // Vertical Outside

  value_position?:
    | 'left'
    | 'center'
    | 'right' // Horizontal Overlay
    | 'top'
    | 'bottom' // Vertical Overlay
    | 'top_left'
    | 'top_center'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_center'
    | 'bottom_right' // Horizontal Outside
    | 'left_top'
    | 'left_center'
    | 'left_bottom'
    | 'right_top'
    | 'right_center'
    | 'right_bottom'; // Vertical Outside

  // For split mode - where content section is positioned relative to bar
  info_section_position?: 'left' | 'right' | 'top' | 'bottom';

  // Per-bar styling overrides (optional, falls back to global)
  slider_height?: number;
  slider_track_color?: string;
  slider_fill_color?: string;
  dynamic_fill_color?: boolean;

  // Slider Style properties (optional, falls back to global)
  slider_style?:
    | 'flat'
    | 'glossy'
    | 'embossed'
    | 'inset'
    | 'gradient-overlay'
    | 'neon-glow'
    | 'outline'
    | 'glass'
    | 'metallic'
    | 'neumorphic'
    | 'minimal';
  glass_blur_amount?: number;
  slider_radius?: 'square' | 'round' | 'pill';
  border_radius?: number;

  // Additional Color properties (optional, falls back to global)
  use_gradient?: boolean;
  gradient_stops?: Array<{
    id: string;
    position: number;
    color: string;
  }>;
  auto_contrast?: boolean;

  // Display Element properties (optional, falls back to global)
  icon?: string;
  icon_size?: number;
  icon_color?: string;
  dynamic_icon?: boolean;
  icon_as_toggle?: boolean;

  // Name display properties (optional, falls back to global)
  name_size?: number;
  name_color?: string;
  name_bold?: boolean;

  // Value display properties (optional, falls back to global)
  value_size?: number;
  value_color?: string;
  value_suffix?: string;
  show_bar_label?: boolean;

  // Animation properties (optional, falls back to global)
  animate_on_change?: boolean;
  transition_duration?: number;
  haptic_feedback?: boolean;

  // Direction control
  invert_direction?: boolean; // Reverse min/max positions (useful for curtains)
}

export interface SliderControlModule extends BaseModule {
  type: 'slider_control';

  // Multi-bar Configuration
  bars: SliderBar[];

  // Orientation
  orientation?: 'horizontal' | 'vertical';

  // Layout Mode
  layout_mode?: 'overlay' | 'split' | 'outside';

  // Overlay Mode Settings (when bar has info overlaid on top)
  overlay_position?: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
  overlay_name_position?: 'top' | 'middle' | 'bottom';
  overlay_value_position?: 'top' | 'middle' | 'bottom';
  overlay_icon_position?: 'top' | 'middle' | 'bottom';

  // Outside Mode Settings (when info is positioned outside the slider vertically)
  outside_text_position?: 'left' | 'right';
  outside_name_position?:
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right'
    | 'top'
    | 'middle'
    | 'bottom';
  outside_value_position?:
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right'
    | 'top'
    | 'middle'
    | 'bottom';

  // Split Mode Settings (bar and info are separate horizontally)
  split_bar_position?: 'left' | 'right';
  split_info_position?: 'left' | 'center' | 'right';
  split_bar_length?: number; // Percentage 0-100, default 60

  // Slider Visual Style
  slider_style?:
    | 'flat'
    | 'glossy'
    | 'embossed'
    | 'inset'
    | 'gradient-overlay'
    | 'neon-glow'
    | 'outline'
    | 'glass'
    | 'metallic'
    | 'neumorphic'
    | 'minimal';

  // Slider Appearance
  slider_height?: number; // Height for horizontal, width for vertical
  bar_spacing?: number; // Spacing between multiple bars
  slider_radius?: 'square' | 'round' | 'pill';
  border_radius?: number;
  slider_track_color?: string;
  slider_fill_color?: string;
  dynamic_fill_color?: boolean; // Use entity color (for RGB lights, etc.)
  glass_blur_amount?: number; // For glass style

  // Gradient Fill Support
  use_gradient?: boolean;
  gradient_stops?: Array<{
    id: string;
    position: number;
    color: string;
  }>;

  // Display Elements
  show_icon?: boolean;
  icon?: string;
  icon_size?: number;
  icon_color?: string;
  dynamic_icon?: boolean; // Use entity's default icon
  icon_as_toggle?: boolean; // Make icon clickable to toggle entity on/off
  auto_contrast?: boolean; // Automatically adjust text/icon color based on fill color

  show_name?: boolean;
  name_size?: number;
  name_color?: string;
  name_bold?: boolean;

  show_state?: boolean;
  state_size?: number;
  state_color?: string;
  state_bold?: boolean;
  state_format?: string; // Format string for state display

  show_value?: boolean; // Show numeric value
  value_size?: number;
  value_color?: string;
  value_suffix?: string; // e.g., '%', '°C'
  show_bar_label?: boolean; // Show bar label (e.g., "Brightness", "RGB Color")

  // Toggle Integration
  show_toggle?: boolean;
  toggle_position?: 'left' | 'right' | 'top' | 'bottom';
  toggle_size?: number;
  toggle_color_on?: string;
  toggle_color_off?: string;

  // Light-specific Color Control
  show_color_picker?: boolean; // For lights - show RGB color picker
  color_picker_position?: 'below' | 'right';
  color_picker_size?: 'small' | 'medium' | 'large';

  // Animation & Interaction
  animate_on_change?: boolean;
  transition_duration?: number; // Renamed to avoid conflict with BaseModule's animation_duration
  haptic_feedback?: boolean;

  // Direction control
  invert_direction?: boolean; // Global default for slider direction inversion

  // Legacy support for backward compatibility
  entity?: string; // Deprecated - use bars array instead
  name?: string; // Deprecated - use bars array instead
  attribute?: string; // Deprecated - use bars array instead
  min_value?: number; // Deprecated - use bars array instead
  max_value?: number; // Deprecated - use bars array instead
  step?: number; // Deprecated - use bars array instead
  light_control_mode?: 'brightness' | 'color_temp' | 'rgb' | 'both' | 'all'; // Deprecated
  light_slider_order?: string[]; // Deprecated
  cover_invert?: boolean; // Deprecated
  control_attribute?: string; // Deprecated

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Button Module
export interface ButtonModule extends BaseModule {
  type: 'button';
  label: string;
  action?: LinkAction; // Legacy support
  style?:
    | 'flat'
    | 'glossy'
    | 'embossed'
    | 'inset'
    | 'gradient-overlay'
    | 'neon-glow'
    | 'outline'
    | 'glass'
    | 'metallic'
    | 'neumorphic'
    | 'dashed'
    | 'dots';
  alignment?: 'left' | 'center' | 'right' | 'justify';
  show_icon?: boolean;
  icon?: string;
  icon_position?: 'before' | 'after';
  icon_size?: string | number;
  background_color?: string;
  text_color?: string;
  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
  // Entity-based background color
  use_entity_color?: boolean;
  background_color_entity?: string;
  background_state_colors?: { [state: string]: string }; // e.g., { "on": "#4CAF50", "off": "#666666" }
}

// Spinbox Module (number input with +/- buttons)
export interface SpinboxModule extends BaseModule {
  type: 'spinbox';
  // Entity configuration
  entity?: string;
  // Value configuration
  value?: number;
  min_value: number;
  max_value: number;
  step: number;
  // Display configuration
  unit?: string;
  show_unit?: boolean;
  layout?: 'horizontal' | 'vertical';
  show_value?: boolean;
  value_position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  // Button configuration
  button_style?:
    | 'flat'
    | 'glossy'
    | 'embossed'
    | 'inset'
    | 'gradient-overlay'
    | 'neon-glow'
    | 'outline'
    | 'glass'
    | 'metallic';
  button_shape?: 'rounded' | 'square' | 'circle';
  button_size?: number;
  button_spacing?: number;
  button_gap?: number;
  increment_icon?: string;
  decrement_icon?: string;
  button_background_color?: string;
  button_text_color?: string;
  // Value display configuration
  value_color?: string;
  value_font_size?: number;
  // Template support
  template_mode?: boolean;
  template?: string;
  // Unified template system
  unified_template_mode?: boolean;
  unified_template?: string;
  ignore_entity_state_config?: boolean;
  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
}

// Markdown Module
export interface MarkdownModule extends BaseModule {
  type: 'markdown';
  markdown_content: string;
  link?: string; // Legacy support
  hide_if_no_link?: boolean;
  template_mode?: boolean;
  template?: string;
  // Unified template system
  unified_template_mode?: boolean;
  unified_template?: string;
  ignore_entity_state_config?: boolean;
  // Styling options
  font_size?: number;
  font_family?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  line_height?: number;
  letter_spacing?: string;
  // Markdown specific options
  enable_html?: boolean;
  enable_tables?: boolean;
  enable_code_highlighting?: boolean;
  max_height?: string;
  overflow_behavior?: 'scroll' | 'hidden' | 'visible';
  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Camera Module
export interface CameraModule extends BaseModule {
  type: 'camera';

  // Core camera properties
  entity: string;
  camera_name?: string;
  show_name?: boolean;
  name_position?:
    | 'top-left'
    | 'top-middle'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-middle'
    | 'bottom-right'
    | 'center';

  // Fullscreen controls
  tap_opens_fullscreen?: boolean;

  // Display settings
  width?: number;
  height?: number;
  aspect_ratio_linked?: boolean;
  aspect_ratio_value?: number; // Stored as width/height ratio
  image_fit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  border_radius?: string;

  // Crop settings (percentage values)
  crop_left?: number;
  crop_top?: number;
  crop_right?: number;
  crop_bottom?: number;

  // Camera controls
  show_controls?: boolean;

  // Stream mode - controls how camera feed is displayed
  view_mode?: 'auto' | 'live' | 'snapshot';

  // Snapshot refresh settings (only used when view_mode === 'snapshot')
  refresh_interval?: number; // 1-300 seconds

  // Legacy properties (deprecated, migrated to view_mode)
  auto_refresh?: boolean;
  live_view?: boolean;

  // Image quality
  image_quality?: 'high' | 'medium' | 'low';

  // Rotation
  rotation?: number;

  // Audio settings (only used when view_mode === 'live' or auto upgrades to live)
  audio_enabled?: boolean;

  // Error handling
  show_unavailable?: boolean;
  fallback_image?: string;

  // Link actions
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };

  // Template support
  template_mode?: boolean;
  template?: string;
  // Unified template system
  unified_template_mode?: boolean;
  unified_template?: string;
  ignore_entity_state_config?: boolean;
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Graph Entity Configuration
export interface GraphEntityConfig {
  id: string;
  entity: string;
  name?: string;
  attribute?: string;
  // Forecast-specific attribute mapping
  forecast_attribute?:
    | 'temperature'
    | 'precipitation'
    | 'wind_speed'
    | 'humidity'
    | 'pressure'
    | 'cloud_coverage'
    | string;
  color?: string;
  chart_type_override?: string;
  show_points?: boolean;
  fill_area?: boolean;
  line_width?: number;
  line_style?: 'solid' | 'dashed' | 'dotted';
  // When true, this entity provides the header/icon/value for the card
  is_primary?: boolean;
  // Pie/Donut: whether to show the entity name inside its slice
  label_show_name?: boolean;
  // Pie/Donut: whether to show the entity value inside its slice
  label_show_value?: boolean;
}

// Graphs Module
export interface GraphsModule extends BaseModule {
  type: 'graphs';

  // Data source selection
  data_source?: 'history' | 'forecast'; // defaults to 'history' for backward compatibility

  // Forecast configuration
  forecast_type?: 'hourly' | 'daily'; // for weather.get_forecasts
  forecast_entity?: string; // weather entity for forecasts

  // Chart configuration
  chart_type:
    | 'line'
    | 'bar'
    | 'area'
    | 'scatter'
    | 'bubble'
    | 'pie'
    | 'donut'
    | 'radar'
    | 'histogram'
    | 'heatmap'
    | 'waterfall'
    | 'combo';
  entities: GraphEntityConfig[];

  // Time period
  time_period: '1h' | '3h' | '6h' | '12h' | '24h' | '2d' | '7d' | '30d' | '90d' | '365d' | 'custom';
  custom_time_start?: string;
  custom_time_end?: string;

  // Chart appearance
  show_title?: boolean;
  title?: string;
  title_size?: number;
  title_color?: string;
  // Alignment of chart within its container
  chart_alignment?: 'left' | 'center' | 'right';

  show_legend?: boolean;

  // Scale options
  normalize_values?: boolean;
  use_fixed_y_axis?: boolean;
  legend_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';

  show_grid?: boolean;
  show_grid_values?: boolean;
  grid_color?: string;

  background_color?: string;
  // Width can be CSS length or percentage (e.g., '100%', 'auto', '320px')
  chart_width?: string;
  chart_height?: number;

  // Header/info overlay position
  info_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'middle';
  // Toggle whether to render info overlay at all
  show_info_overlay?: boolean;
  // Control individual parts of the overlay
  show_display_name?: boolean;
  show_entity_value?: boolean;

  // Axis configuration
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

  // Data configuration
  data_aggregation?:
    | 'mean'
    | 'sum'
    | 'min'
    | 'max'
    | 'median'
    | 'first'
    | 'last'
    | 'count'
    | 'delta';
  data_points_limit?: number;
  smooth_curves?: boolean;

  // Animation
  enable_animation?: boolean;
  animation_duration?: string;

  // Interactivity
  enable_zoom?: boolean;
  enable_pan?: boolean;
  show_tooltips?: boolean;
  // Control labels inside slices globally is deprecated in favor of per-entity
  // show_slice_labels?: boolean;

  // Chart-specific options
  // Line/Area
  line_tension?: number;
  fill_opacity?: number;
  show_points?: boolean;
  point_radius?: number;

  // Bar/Histogram
  bar_width?: number;
  bar_spacing?: number;
  bar_display_limit?: number; // Max bars to display (0 = unlimited, default)
  stacked?: boolean;
  horizontal?: boolean;

  // Pie/Donut
  inner_radius?: number;
  start_angle?: number;
  show_percentages?: boolean;
  explode_slices?: boolean;
  // Gap between slices (in degrees or px-equivalent)
  slice_gap?: number;
  // Show labels inside slices (name and value)
  show_slice_labels?: boolean;

  // Scatter/Bubble
  point_size?: number;
  point_opacity?: number;
  show_regression?: boolean;
  bubble_scale?: number;

  // Radar
  scale_min?: number;
  scale_max?: number;
  grid_levels?: number;
  point_style?: 'circle' | 'triangle' | 'rect' | 'star';

  // Heatmap
  cell_padding?: number;
  color_scheme?: 'viridis' | 'plasma' | 'inferno' | 'magma' | 'blues' | 'reds' | 'greens' | 'greys';
  show_values?: boolean;
  value_format?: string;

  // Waterfall
  positive_color?: string;
  negative_color?: string;
  total_color?: string;
  connector_color?: string;

  // Combo
  primary_axis?: 'left' | 'right';
  secondary_axis?: 'left' | 'right' | 'none';
  sync_axes?: boolean;

  // Auto-refresh
  auto_refresh?: boolean;
  refresh_interval?: number;

  // Templates
  template_mode?: boolean;
  template?: string;

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };

  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Dropdown Module
export interface DropdownModule extends BaseModule {
  type: 'dropdown';

  // Source Mode
  source_mode?: 'manual' | 'entity'; // 'manual' = user-defined options, 'entity' = from select/input_select entity
  source_entity?: string; // Entity ID for select or input_select (when source_mode is 'entity')

  // Basic Configuration
  placeholder?: string;

  // Dropdown Options
  options: DropdownOption[]; // Used when source_mode is 'manual'

  // Entity Option Customization (optional customization when using entity source)
  entity_option_customization?: Record<
    string,
    {
      icon?: string;
      icon_color?: string;
      use_state_color?: boolean;
    }
  >;

  // State Tracking
  current_selection?: string; // Tracks the currently selected option label
  track_state?: boolean; // Whether to track and display current selection

  // Closed Dropdown Title Configuration
  closed_title_mode?: 'last_chosen' | 'entity_state' | 'custom' | 'first_option'; // How to display closed dropdown title
  closed_title_entity?: string; // Entity to use for entity_state mode
  closed_title_custom?: string; // Custom text for custom mode

  // Dynamic templates
  unified_template_mode?: boolean;
  unified_template?: string;

  // Control icon customization
  control_icon?: string;
  control_alignment?: 'center' | 'apart';
  control_icon_side?: 'left' | 'right';

  // Dropdown display options
  visible_items?: number; // Number of items visible in dropdown before scrolling (1-20)

  // Visual Configuration (label removed)

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };

  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Light Module
export interface LightModule extends BaseModule {
  type: 'light';

  // Presets Configuration
  presets: Array<{
    id: string;
    name: string; // Display name/label for the preset
    action?: 'turn_on' | 'turn_off' | 'toggle'; // Action type for this preset
    icon?: string; // Optional icon for button/icon display
    entities: string[]; // Entities this preset applies to
    brightness?: number; // 0-255
    color_temp?: number; // Mired value
    rgb_color?: number[]; // [r, g, b]
    hs_color?: number[]; // [hue, saturation]
    xy_color?: number[]; // [x, y]
    rgbw_color?: number[]; // [r, g, b, w]
    rgbww_color?: number[]; // [r, g, b, ww, cw]
    white?: number; // White value 0-255
    effect?: string; // Effect name
    effect_speed?: number; // Effect speed (WLED: 0-255)
    effect_intensity?: number; // Effect intensity (WLED: 0-255)
    effect_reverse?: boolean; // Reverse effect direction (WLED)
    transition_time?: number; // Override transition time for this preset
    // Visual customization
    text_color?: string; // Custom text color
    icon_color?: string; // Custom icon color
    button_color?: string; // Custom button background color
    use_light_color_for_icon?: boolean; // Use current light color for icon
    use_light_color_for_button?: boolean; // Use current light color for button
    use_icon_color_for_text?: boolean; // Use icon color for text
    smart_color?: boolean; // Auto-contrast text based on button background
    // Per-preset styling
    button_style?: 'filled' | 'outlined' | 'text'; // Button visual style for this preset
    show_label?: boolean; // Show preset name for this preset
    border_radius?: number; // Button border radius (0-50)
  }>;

  // Display Configuration
  layout?: 'buttons' | 'grid'; // How to display presets
  button_alignment?:
    | 'left'
    | 'center'
    | 'right'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'; // Button alignment
  allow_wrapping?: boolean; // Allow buttons to wrap to next line
  button_gap?: number; // Gap between buttons in rem
  columns?: number; // Number of columns for grid layout
  show_labels?: boolean; // Show preset names (global fallback)
  button_style?: 'filled' | 'outlined' | 'text'; // Button visual style (global fallback)

  // Global Settings
  default_transition_time?: number; // Default transition time for all presets

  // Advanced Options
  confirm_actions?: boolean; // Show confirmation before applying presets
  show_feedback?: boolean; // Show visual feedback when presets are applied

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };

  // Hover effects
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// Map marker type for individual pins
export interface MapMarker {
  id: string;
  name: string;
  type: 'manual' | 'entity'; // Manual coordinates or entity-based

  // Manual marker properties
  latitude?: number;
  longitude?: number;

  // Entity marker properties
  entity?: string;

  // Visual customization
  icon?: string;
  icon_color?: string;
  icon_size?: number; // Size in pixels for icon markers
  marker_image_type?: 'icon' | 'custom_image' | 'entity_image';
  marker_image?: string; // Custom image URL or upload
  use_entity_picture?: boolean; // Use entity's entity_picture attribute
}

// Map Module
export interface MapModule extends BaseModule {
  type: 'map';

  // Map provider
  map_provider: 'openstreetmap' | 'google';
  google_api_key?: string; // Optional API key for Google Maps JavaScript API

  // Map appearance
  map_type: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  zoom: number; // 1-20

  // Map controls
  show_map_controls: boolean;
  disable_zoom_scroll: boolean;
  disable_touch_drag: boolean;

  // Auto-zoom for entity markers
  auto_zoom_entities: boolean; // Auto-calculate zoom to fit all entity markers

  // Manual center coordinates (overrides auto-zoom and default centering)
  manual_center_latitude?: number;
  manual_center_longitude?: number;

  // Markers list
  markers: MapMarker[];

  // Map dimensions
  map_height?: number; // Height in pixels
  aspect_ratio?: '16:9' | '4:3' | '1:1' | 'custom';

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
}

// Animated Clock Module (PRO)
export interface AnimatedClockModule extends BaseModule {
  type: 'animated_clock';

  // Configuration
  time_format?: '12' | '24'; // 12 or 24 hour format (default: 12)
  clock_style?:
    | 'flip'
    | 'digital'
    | 'analog'
    | 'binary'
    | 'minimal'
    | 'retro'
    | 'word'
    | 'neon'
    | 'material'
    | 'terminal'; // Clock display style (default: flip)
  update_frequency?: '1' | '60'; // Update frequency in seconds (default: 1 = every second)

  // Analog Clock Options (only for analog style)
  analog_show_seconds?: boolean; // Show seconds hand on analog clock (default: true)
  analog_smooth_seconds?: boolean; // Smooth sweeping seconds hand vs ticking (default: true)
  analog_show_hour_hand?: boolean; // Show hour hand (default: true)
  analog_show_minute_hand?: boolean; // Show minute hand (default: true)
  analog_show_hour_markers?: boolean; // Show hour markers (default: true)
  analog_show_center_dot?: boolean; // Show center dot (default: true)
  analog_show_numbers?: boolean; // Show clock numbers 1-12 (default: false)
  analog_show_hour_ticks?: boolean; // Show hour tick marks (12 major ticks) (default: false)
  analog_show_minute_ticks?: boolean; // Show minute tick marks (48 minor ticks) (default: false)
  analog_hour_hand_color?: string; // Hour hand color (default: clock_color)
  analog_minute_hand_color?: string; // Minute hand color (default: clock_color)
  analog_second_hand_color?: string; // Second hand color (default: #ff4444)
  analog_hour_marker_color?: string; // Hour marker color (default: clock_color)
  analog_center_dot_color?: string; // Center dot color (default: clock_color)
  analog_numbers_color?: string; // Clock numbers color (default: clock_color)
  analog_hour_ticks_color?: string; // Hour tick marks color (default: clock_color)
  analog_minute_ticks_color?: string; // Minute tick marks color (default: clock_color)
  analog_face_outline_color?: string; // Clock face outline color (default: clock_color)
  analog_face_background_color?: string; // Clock face background color (default: clock_background)
  analog_face_background_type?: 'color' | 'entity' | 'upload' | 'url'; // Background type (default: color)
  analog_face_background_image_entity?: string; // Entity ID for entity image background
  analog_face_background_image_upload?: string; // Uploaded image path
  analog_face_background_image_url?: string; // Image URL for background
  analog_face_background_size?: string; // Background size (default: cover)
  analog_face_background_position?: string; // Background position (default: center)
  analog_face_background_repeat?: string; // Background repeat (default: no-repeat)

  // Element Visibility Toggles (universal)
  show_hours?: boolean; // Show hours (default: true)
  show_minutes?: boolean; // Show minutes (default: true)
  show_seconds?: boolean; // Show seconds (default: true)
  show_ampm?: boolean; // Show AM/PM (default: true)
  show_separators?: boolean; // Show time separators like : (default: true)

  // Style-specific Visibility Toggles
  show_labels?: boolean; // Show labels (e.g., H M S in binary) (default: true)
  show_prefix?: boolean; // Show prefix text (e.g., "It is" in text clock) (default: true)
  show_prompt?: boolean; // Show terminal prompt (default: true)
  show_command?: boolean; // Show terminal command (default: true)
  show_cursor?: boolean; // Show terminal cursor (default: true)

  // Styling
  clock_size?: number; // Clock digit size in pixels (default: 48)
  clock_color?: string; // Clock digit color (default: primary-text-color)
  clock_background?: string; // Clock card background (default: card-background-color)

  // Flip Clock Options
  flip_tile_color?: string; // Flip tile background color (default: rgba(0, 0, 0, 0.5))
  flip_hours_color?: string; // Color for hours (default: clock_color)
  flip_minutes_color?: string; // Color for minutes (default: clock_color)
  flip_separator_color?: string; // Color for separators (default: clock_color)
  flip_ampm_color?: string; // Color for AM/PM (default: clock_color)

  // Digital LED Clock Options
  digital_background_color?: string; // Digital display background color (default: #000)
  digital_hours_color?: string; // Hours color (default: #ff3333)
  digital_minutes_color?: string; // Minutes color (default: #ff3333)
  digital_seconds_color?: string; // Seconds color (default: #ff3333)
  digital_separator_color?: string; // Separator color (default: #ff3333)
  digital_ampm_color?: string; // AM/PM color (default: #33ff33)
  digital_glow_color?: string; // Glow color (default: #ff0000)

  // Binary Clock Options
  binary_hours_empty_color?: string; // Empty hour dots color (default: rgba(128, 128, 128, 0.2))
  binary_hours_filled_color?: string; // Filled hour dots color (default: clock_color)
  binary_minutes_empty_color?: string; // Empty minute dots color (default: rgba(128, 128, 128, 0.2))
  binary_minutes_filled_color?: string; // Filled minute dots color (default: clock_color)
  binary_seconds_empty_color?: string; // Empty second dots color (default: rgba(128, 128, 128, 0.2))
  binary_seconds_filled_color?: string; // Filled second dots color (default: clock_color)
  binary_separator_color?: string; // Separator color (default: clock_color)
  binary_hours_label_color?: string; // HH label color (default: clock_color)
  binary_minutes_label_color?: string; // MM label color (default: clock_color)
  binary_seconds_label_color?: string; // SS label color (default: clock_color)

  // Minimal Clock Options
  minimal_hours_color?: string; // Hours color (default: clock_color)
  minimal_minutes_color?: string; // Minutes color (default: clock_color)
  minimal_seconds_color?: string; // Seconds color (default: clock_color)
  minimal_separator_color?: string; // Separator color (default: clock_color)
  minimal_ampm_color?: string; // AM/PM color (default: clock_color)

  // Retro 7-Segment Clock Options
  retro_background_color?: string; // Display background color (default: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%))
  retro_hours_tile_color?: string; // Hours tile background (default: rgba(0, 0, 0, 0.3))
  retro_minutes_tile_color?: string; // Minutes tile background (default: rgba(0, 0, 0, 0.3))
  retro_seconds_tile_color?: string; // Seconds tile background (default: rgba(0, 0, 0, 0.3))
  retro_separator_tile_color?: string; // Separator tile background (default: rgba(0, 0, 0, 0.3))
  retro_hours_color?: string; // Hours digit color (default: #ffa500)
  retro_minutes_color?: string; // Minutes digit color (default: #ffa500)
  retro_seconds_color?: string; // Seconds digit color (default: #ffa500)
  retro_separator_color?: string; // Separator color (default: #ffa500)
  retro_ampm_color?: string; // AM/PM color (default: #00ff00)

  // Text Clock (word) Options
  text_orientation?: 'horizontal' | 'vertical'; // Text layout orientation (default: horizontal)
  text_word_gap?: number; // Gap between words in pixels (default: 8)
  text_prefix_color?: string; // Color for prefix text (e.g., "It is")
  text_prefix_size?: number; // Font size for prefix (default: 38)
  text_hours_color?: string; // Color for hours text
  text_hours_size?: number; // Font size for hours (default: 48)
  text_minutes_color?: string; // Color for minutes text
  text_minutes_size?: number; // Font size for minutes (default: 48)
  text_ampm_color?: string; // Color for AM/PM text
  text_ampm_size?: number; // Font size for AM/PM (default: 24)

  // Neon Clock Options
  neon_padding?: number; // Padding around neon display in em (default: 4)
  neon_hours_color?: string; // Color for hours (default: #00ffff)
  neon_minutes_color?: string; // Color for minutes (default: #00ffff)
  neon_seconds_color?: string; // Color for seconds (default: #00ffff)
  neon_separator_color?: string; // Color for separators (default: #ff00ff)
  neon_ampm_color?: string; // Color for AM/PM (default: #00ff00)

  // Material Design Options
  material_vertical_gap?: number; // Vertical gap between time and seconds in pixels (default: 8)
  material_background_color?: string; // Card background color (default: clock_background)
  material_hours_color?: string; // Hours color (default: clock_color)
  material_minutes_color?: string; // Minutes color (default: clock_color)
  material_seconds_color?: string; // Seconds color (default: clock_color)
  material_separator_color?: string; // Separator color (default: clock_color)
  material_ampm_color?: string; // AM/PM color (default: clock_color)

  // Terminal Clock Options
  terminal_background_color?: string; // Terminal background color (default: #1e1e1e)
  terminal_line1_color?: string; // Color for line 1 (prompt) (default: #4ec9b0)
  terminal_line2_color?: string; // Color for line 2 (command) (default: #ce9178)
  terminal_cursor_color?: string; // Color for cursor (default: #4ec9b0)
  terminal_hours_color?: string; // Color for hours (default: #d4d4d4)
  terminal_minutes_color?: string; // Color for minutes (default: #d4d4d4)
  terminal_seconds_color?: string; // Color for seconds (default: #d4d4d4)
  terminal_separator_color?: string; // Color for separators (default: #d4d4d4)
  terminal_ampm_color?: string; // Color for AM/PM (default: #d4d4d4)
  terminal_vertical_spacing?: number; // Vertical spacing between lines in pixels (default: 8)
  terminal_line1_size?: number; // Font size for line 1 in pixels (default: 17)
  terminal_line2_size?: number; // Font size for line 2 in pixels (default: 17)
  terminal_output_size?: number; // Font size for output in pixels (default: 38)

  // Global action configuration
  tap_action?: ModuleActionConfig;
  hold_action?: ModuleActionConfig;
  double_tap_action?: ModuleActionConfig;
}

// Animated Weather Module (PRO)
export interface AnimatedWeatherModule extends BaseModule {
  type: 'animated_weather';

  // Entity Configuration
  weather_entity?: string; // weather.* entity (primary)
  temperature_entity?: string; // Individual sensor fallback
  condition_entity?: string; // Individual sensor fallback
  custom_entity?: string; // Optional custom entity to display (shows as "name: state")
  custom_entity_name?: string; // Custom name override for custom entity display

  // Column Display Toggles
  show_left_column?: boolean; // Show left column (location/condition/custom) (default: true)
  show_center_column?: boolean; // Show center column (weather icon) (default: true)
  show_right_column?: boolean; // Show right column (date/temp/range) (default: true)

  // Layout Configuration
  column_gap?: number; // Gap between columns in pixels (default: 12)
  left_column_gap?: number; // Vertical gap within left column (default: 8)
  right_column_gap?: number; // Vertical gap within right column (default: 8)
  temperature_unit?: 'F' | 'C'; // Temperature unit (default: F)

  // Location Configuration
  location_override_mode?: 'text' | 'entity'; // How to override location (default: text)
  location_name?: string; // Text override for location name
  location_entity?: string; // Entity to use for location (e.g., tracker)

  // Column Order Configuration (for drag-and-drop editor)
  left_column_order?: string[]; // Custom order of items in left column
  right_column_order?: string[]; // Custom order of items in right column

  // Left Column Display Toggles
  show_location?: boolean; // Show location name (default: true)
  show_condition?: boolean; // Show weather condition (default: true)
  show_custom_entity?: boolean; // Show custom entity (default: true if entity set)
  show_precipitation?: boolean; // Show precipitation amount (default: false)
  show_precipitation_probability?: boolean; // Show precipitation probability (default: false)
  show_wind?: boolean; // Show wind speed and direction (default: false)
  show_pressure?: boolean; // Show air pressure (default: false)
  show_visibility?: boolean; // Show visibility (default: false)

  // Right Column Display Toggles
  show_date?: boolean; // Show date (default: true)
  show_temperature?: boolean; // Show main temperature (default: true)
  show_temp_range?: boolean; // Show high/low range (default: true)

  // Left Column - Text Sizes
  location_size?: number; // Location text size (default: 16)
  condition_size?: number; // Weather condition size (default: 24)
  custom_entity_size?: number; // Custom entity size (default: 18)
  precipitation_size?: number; // Precipitation text size (default: 14)
  wind_size?: number; // Wind text size (default: 14)
  pressure_size?: number; // Pressure text size (default: 14)
  visibility_size?: number; // Visibility text size (default: 14)

  // Left Column - Colors
  location_color?: string; // Location text color (default: primary-text-color)
  condition_color?: string; // Condition text color (default: primary-text-color)
  custom_entity_color?: string; // Custom entity color (default: primary-text-color)
  precipitation_color?: string; // Precipitation text color (default: primary-text-color)
  wind_color?: string; // Wind text color (default: primary-text-color)
  pressure_color?: string; // Pressure text color (default: primary-text-color)
  visibility_color?: string; // Visibility text color (default: primary-text-color)

  // Center Column - Icon Styling
  main_icon_size?: number; // Main weather icon size (default: 120)
  icon_style?: 'fill' | 'line'; // Icon style: filled or outlined (default: fill)

  // Right Column - Text Sizes
  date_size?: number; // Date text size (default: 16)
  temperature_size?: number; // Main temperature size (default: 64)
  temp_range_size?: number; // High/low range size (default: 18)

  // Right Column - Colors
  date_color?: string; // Date text color (default: primary-text-color)
  temperature_color?: string; // Main temperature color (default: primary-text-color)
  temp_range_color?: string; // High/low temperature color (default: primary-text-color)

  // Styling - Backgrounds
  module_background?: string; // Overall module background (default: transparent)
  module_border?: string; // Module border color (default: transparent)

  // Global action configuration
  tap_action?: ModuleActionConfig;
  hold_action?: ModuleActionConfig;
  double_tap_action?: ModuleActionConfig;
}

// Animated Forecast Module (PRO)
export interface AnimatedForecastModule extends BaseModule {
  type: 'animated_forecast';

  // Entity Configuration
  weather_entity?: string; // weather.* entity with forecast data
  forecast_entity?: string; // forecast.* entity for daily forecast

  // Configuration
  forecast_days?: number; // Number of forecast days (default: 5, range: 3-7)
  temperature_unit?: 'F' | 'C'; // Temperature unit (default: F)
  allow_wrap?: boolean; // Allow forecast days to wrap to new rows

  // Styling - Text Sizes
  forecast_day_size?: number; // Forecast day name size (default: 14)
  forecast_temp_size?: number; // Forecast temperature size (default: 14)

  // Styling - Icon
  forecast_icon_size?: number; // Forecast icon size (default: 48)
  icon_style?: 'fill' | 'line'; // Icon style: filled or outlined (default: fill)

  // Styling - Colors
  text_color?: string; // General text color (default: primary-text-color)
  accent_color?: string; // Accent color for highlights (default: primary-color)
  forecast_day_color?: string; // Forecast day name color (default: text_color)
  forecast_temp_color?: string; // Forecast temperature color (default: text_color)

  // Styling - Background
  forecast_background?: string; // Background for forecast section (default: theme-aware transparent)

  // Global action configuration
  tap_action?: ModuleActionConfig;
  hold_action?: ModuleActionConfig;
  double_tap_action?: ModuleActionConfig;
}

// Dropdown option configuration
export interface DropdownOption {
  id: string;
  label: string;
  icon?: string;
  icon_color?: string;
  use_state_color?: boolean; // Use entity state color for icon

  // Action configuration using Home Assistant's native action system
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

// External Card Module (PRO)
export interface ExternalCardModule extends BaseModule {
  type: 'external_card';
  card_type: string; // e.g., 'weather-card', 'mini-graph-card', 'mushroom-entity-card'
  card_config: Record<string, any>; // The card's native configuration
  // Note: No tap_action/hold_action - external cards handle their own actions
}

export interface NativeCardModule extends BaseModule {
  type: 'native_card';
  card_type: string; // e.g., 'hui-entities-card', 'hui-area-card'
  card_config: Record<string, any>; // The card's configuration with YAML type (e.g., {type: 'entities'})
  // Note: Native HA cards are unlimited for all users
}

// Video Background Conditional Rule
export interface VideoBackgroundRule {
  id: string;
  // Condition (when to apply this rule)
  condition_type: 'entity_state' | 'entity_attribute' | 'template' | 'time';
  entity?: string;
  attribute?: string;
  operator?:
    | '='
    | '!='
    | '>'
    | '>='
    | '<'
    | '<='
    | 'contains'
    | 'not_contains'
    | 'has_value'
    | 'no_value';
  value?: string | number;
  template?: string;
  time_from?: string;
  time_to?: string;
  // Video config (when condition is true)
  video_source: 'local' | 'url' | 'youtube' | 'vimeo';
  video_url: string;
  loop?: boolean;
  start_time?: number;
}

// Global Card Transparency Configuration
export interface GlobalCardTransparency {
  enabled: boolean;
  opacity: number; // 0-100
  blur_px: number; // 0-30
  color?: string;
}

// Video Background Module (PRO)
export interface VideoBackgroundModule extends BaseModule {
  type: 'video_bg';

  // Core Settings
  enabled: boolean;
  editor_only: boolean;
  controller_id?: string;
  pause_when_hidden: boolean;
  respect_reduced_motion: boolean;
  enable_on_mobile: boolean;

  // Visual Filters
  opacity: number; // 0-100
  blur: string; // e.g., '0px', '10px'
  brightness: string; // e.g., '100%', '150%'
  scale: number; // 0.5-2.0 for video scaling

  // Default Video Configuration
  default_source: 'local' | 'url' | 'youtube' | 'vimeo';
  default_video_url: string;
  default_loop: boolean;
  default_muted: boolean; // Always true
  default_start_time: number;

  // Conditional Rules (evaluated top to bottom)
  rules?: VideoBackgroundRule[];

  // Global Card Transparency
  global_card_transparency: GlobalCardTransparency;
}

// Weather Effect Types
export type WeatherEffectType =
  | 'none'
  | 'rain'
  | 'rain_storm'
  | 'rain_drizzle'
  | 'hail'
  | 'acid_rain'
  | 'matrix_rain'
  | 'lightning'
  | 'snow_gentle'
  | 'snow_storm'
  | 'fog_light'
  | 'fog_dense'
  | 'sun_beams'
  | 'clouds'
  | 'wind';

// Dynamic Weather Module (PRO)
export interface DynamicWeatherModule extends BaseModule {
  type: 'dynamic_weather';

  // Core Settings
  enabled: boolean;
  mode: 'automatic' | 'manual'; // automatic uses weather entity, manual uses dropdown
  weather_entity?: string; // For automatic mode
  manual_effect?: WeatherEffectType; // For manual mode

  // Display Settings
  position: 'foreground' | 'background';
  opacity: number; // 0-100

  // Effect-specific Settings
  matrix_rain_color?: string; // Custom color for matrix rain effect

  // Mobile Settings
  enable_on_mobile: boolean;
  respect_reduced_motion: boolean;
  enable_snow_accumulation?: boolean;

  // Logic (visibility) defaults
  display_mode: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[];
}

// Background Module - Apply custom backgrounds to dashboard view
export interface BackgroundModule extends BaseModule {
  type: 'background';

  // Background source
  background_type: 'none' | 'upload' | 'entity' | 'url';
  background_image?: string; // For upload/url types
  background_image_entity?: string; // For entity type

  // Background display settings
  background_size?: 'cover' | 'contain' | 'fill' | 'auto';
  background_position?: string; // e.g., 'center', 'top left', 'bottom right'
  background_repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';

  // Opacity
  opacity: number; // 0-100

  // Logic (visibility) defaults
  display_mode: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[];
}

// Status Summary Entity Configuration
export interface StatusSummaryEntity {
  id: string;
  entity: string;
  label?: string; // Override display name
  icon?: string; // Override icon
  show_icon?: boolean; // Override global show_icon (undefined = use global)
  show_state?: boolean; // Override global show_state (undefined = use global)
  is_auto_generated?: boolean; // Flag to indicate this was auto-generated from filters

  // Color coding rules
  color_mode: 'state' | 'time' | 'custom' | 'none';

  // State-based colors
  state_colors?: {
    [state: string]: string; // e.g., { "on": "yellow", "off": "gray" }
  };

  // Time-based colors (minutes since last change)
  time_colors?: {
    threshold: number; // minutes
    color: string;
  }[];

  // Custom template for color
  custom_color_template?: string;
}

// Status Summary Module - Display entity activity with timestamps and color coding
export interface StatusSummaryModule extends BaseModule {
  type: 'status_summary';

  // Entity Management
  entities: StatusSummaryEntity[];

  // Auto-filtering
  enable_auto_filter: boolean;
  include_filters?: string[]; // Domains or partial names to include (e.g., ['binary_sensor', 'light', 'garage'])
  exclude_filters?: string[]; // Domains or partial names to exclude (e.g., ['battery', 'update'])

  // Time Filtering
  max_time_since_change?: number; // In minutes, hide if older

  // Display Options
  title: string;
  show_title: boolean;
  show_last_change_header: boolean;
  show_time_header: boolean;
  sort_by: 'name' | 'last_change' | 'custom';
  sort_direction: 'asc' | 'desc';
  max_items_to_show?: number; // Maximum number of entities to display (0 = unlimited)

  // Global display settings
  global_show_icon: boolean; // Global setting for showing entity icons
  global_show_state: boolean; // Global setting for showing entity states

  // Layout
  row_height: number;
  row_gap: number;
  max_entity_name_length: number; // Max characters for entity name display
  show_separator_lines: boolean; // Show lines between entity rows

  // Global color mode (applies to all entities unless overridden per-entity)
  global_color_mode: 'state' | 'time' | 'custom' | 'none';

  // Global state-based colors
  global_state_colors?: {
    [state: string]: string;
  };

  // Global time-based colors
  global_time_colors?: {
    threshold: number;
    color: string;
  }[];

  // Global custom template
  global_custom_color_template?: string;

  // Default colors (when entity has no custom rules)
  default_text_color: string;
  default_icon_color: string;
  header_text_color: string;
  header_background_color: string;

  // Template support for entire module
  template_mode?: boolean;
  template?: string;
  unified_template_mode?: boolean;
  unified_template?: string;

  // Actions
  tap_action?: any;
  hold_action?: any;
  double_tap_action?: any;

  // Logic (visibility) defaults
  display_mode: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[];
}

// Toggle Point Configuration
export interface TogglePoint {
  id: string;
  label: string;
  icon?: string;
  
  // Action configuration (uses HA's native action system)
  tap_action?: ModuleActionConfig;
  
  // Entity state matching (for auto-selection)
  match_entity?: string;
  match_state?: string | string[]; // Can match multiple states
  
  // Template-based matching (for advanced conditions like ranges)
  match_template_mode?: boolean; // Enable template mode instead of simple entity/state matching
  match_template?: string; // Jinja2 template that evaluates to true/false
  
  // Styling
  background_color?: string;
  text_color?: string;
  active_background_color?: string;
  active_text_color?: string;
  border_color?: string;
  active_border_color?: string;
}

// Toggle Module - Interactive toggles and multi-state switchers
export interface ToggleModule extends BaseModule {
  type: 'toggle';
  // Toggle points
  toggle_points: TogglePoint[];
  // Visual style
  visual_style: 'ios_toggle' | 'segmented' | 'button_group' | 'slider_track' | 'minimal' | 'timeline';
  // Tracking
  tracking_entity?: string; // Entity to watch for state changes
  // Display
  title?: string;
  show_title?: boolean;
  orientation?: 'horizontal' | 'vertical';
  alignment?: 'left' | 'center' | 'right' | 'justify';
  size?: 'compact' | 'normal' | 'large';
  spacing?: number; // Gap between toggle points
  // Icon settings
  show_icons?: boolean;
  icon_size?: string;
  icon_position?: 'above' | 'left' | 'right' | 'below';
  // Default colors
  default_background_color?: string;
  default_text_color?: string;
  default_active_background_color?: string;
  default_active_text_color?: string;
  // Actions (for module-level tap, not toggle points)
  tap_action?: ModuleActionConfig;
  hold_action?: ModuleActionConfig;
  double_tap_action?: ModuleActionConfig;
  // Logic (visibility) defaults
  display_mode: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[];
}

// Union type for all module types
export type CardModule =
  | TextModule
  | SeparatorModule
  | ImageModule
  | InfoModule
  | BarModule
  | GaugeModule
  | IconModule
  | HorizontalModule
  | VerticalModule
  | AccordionModule
  | PopupModule
  | SliderModule
  | SliderControlModule
  | PageBreakModule
  | ButtonModule
  | SpinboxModule
  | MarkdownModule
  | CameraModule
  | GraphsModule
  | DropdownModule
  | LightModule
  | ClimateModule
  | MapModule
  | AnimatedClockModule
  | AnimatedWeatherModule
  | AnimatedForecastModule
  | ExternalCardModule
  | NativeCardModule
  | VideoBackgroundModule
  | DynamicWeatherModule
  | BackgroundModule
  | StatusSummaryModule
  | ToggleModule
  | TabsModule
  | CalendarModule
  | SportsScoreModule
  | GridModule
  | BadgeOfHonorModule;

// Hover effects configuration
export interface HoverEffectConfig {
  effect?:
    | 'none'
    | 'highlight'
    | 'outline'
    | 'grow'
    | 'shrink'
    | 'pulse'
    | 'bounce'
    | 'float'
    | 'glow'
    | 'shadow'
    | 'rotate'
    | 'skew'
    | 'wobble'
    | 'buzz'
    | 'fade';
  duration?: number; // Duration in milliseconds (default: 300)
  timing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number; // Delay before effect starts in milliseconds (default: 0)
  // Color settings for specific effects
  highlight_color?: string; // For 'highlight' effect
  outline_color?: string; // For 'outline' effect
  outline_width?: number; // For 'outline' effect (default: 2px)
  glow_color?: string; // For 'glow' effect
  shadow_color?: string; // For 'shadow' effect
  // Transform settings
  scale?: number; // For 'grow'/'shrink' effects (default: 1.05 for grow, 0.95 for shrink)
  translate_x?: number; // For 'float' effect
  translate_y?: number; // For 'float' effect
  rotate_degrees?: number; // For 'rotate' effect
  // Animation intensity
  intensity?: 'subtle' | 'normal' | 'strong'; // Affects magnitude of effects
}

// Design properties interface that can be shared
export interface SharedDesignProperties {
  // Text properties
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
  // Background properties
  background_color?: string;
  background_image?: string;
  background_image_type?: 'none' | 'upload' | 'entity' | 'url';
  background_image_entity?: string;
  // New: background image rendering controls
  background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  background_position?:
    | 'left top'
    | 'left center'
    | 'left bottom'
    | 'center top'
    | 'center center'
    | 'center bottom'
    | 'right top'
    | 'right center'
    | 'right bottom';
  background_size?: 'cover' | 'contain' | 'auto' | string; // string to allow custom values like '100% 100%'
  backdrop_filter?: string;
  background_filter?: string;
  // Size properties
  width?: string;
  height?: string;
  max_width?: string;
  max_height?: string;
  min_width?: string;
  min_height?: string;
  // Spacing properties
  margin_top?: string;
  margin_bottom?: string;
  margin_left?: string;
  margin_right?: string;
  padding_top?: string;
  padding_bottom?: string;
  padding_left?: string;
  padding_right?: string;
  // Border properties
  border_radius?: string;
  border_style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  border_width?: string;
  border_color?: string;
  // Position properties
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  z_index?: string;
  // Shadow properties
  text_shadow_h?: string;
  text_shadow_v?: string;
  text_shadow_blur?: string;
  text_shadow_color?: string;
  box_shadow_h?: string;
  box_shadow_v?: string;
  box_shadow_blur?: string;
  box_shadow_spread?: string;
  box_shadow_color?: string;
  // Other properties
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  clip_path?: string;
  // State-based animation
  animation_type?:
    | 'none'
    | 'pulse'
    | 'vibrate'
    | 'rotate-left'
    | 'rotate-right'
    | 'hover'
    | 'fade'
    | 'scale'
    | 'bounce'
    | 'shake'
    | 'tada';
  animation_entity?: string;
  animation_trigger_type?: 'state' | 'attribute';
  animation_attribute?: string;
  animation_state?: string;
  // Intro/Outro Animations
  intro_animation?:
    | 'none'
    | 'fadeIn'
    | 'slideInUp'
    | 'slideInDown'
    | 'slideInLeft'
    | 'slideInRight'
    | 'zoomIn'
    | 'bounceIn'
    | 'flipInX'
    | 'flipInY'
    | 'rotateIn';
  outro_animation?:
    | 'none'
    | 'fadeOut'
    | 'slideOutUp'
    | 'slideOutDown'
    | 'slideOutLeft'
    | 'slideOutRight'
    | 'zoomOut'
    | 'bounceOut'
    | 'flipOutX'
    | 'flipOutY'
    | 'rotateOut';
  animation_duration?: string;
  animation_delay?: string;
  animation_timing?:
    | 'ease'
    | 'linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'cubic-bezier(0.25,0.1,0.25,1)';
  // Hover effects
  hover_effect?: HoverEffectConfig;
  // Logic properties
  logic_entity?: string;
  logic_attribute?: string;
  logic_operator?:
    | '='
    | '!='
    | '>'
    | '>='
    | '<'
    | '<='
    | 'contains'
    | 'not_contains'
    | 'has_value'
    | 'no_value';
  logic_value?: string;
  // Custom targeting properties
  extra_class?: string;
  element_id?: string;
  css_variable_prefix?: string;
}

// Column interface that contains modules
export interface CardColumn {
  id: string;
  name?: string;
  modules: CardModule[];
  vertical_alignment?: 'top' | 'center' | 'bottom' | 'stretch';
  horizontal_alignment?:
    | 'left'
    | 'center'
    | 'right'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'justify';
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
  // Design properties with priority system
  design?: SharedDesignProperties;
}

// Row interface that contains columns
export interface CardRow {
  id: string;
  name?: string;
  columns: CardColumn[];
  column_layout?:
    | '1-col'
    | '1-2-1-2'
    | '1-3-2-3'
    | '2-3-1-3'
    | '2-5-3-5'
    | '3-5-2-5'
    | '1-3-1-3-1-3'
    | '1-4-1-2-1-4'
    | '1-5-3-5-1-5'
    | '1-6-2-3-1-6'
    | '1-4-1-4-1-4-1-4'
    | '1-5-1-5-1-5-1-5'
    | '1-6-1-6-1-6-1-6'
    | '1-8-1-4-1-4-1-8'
    | '1-5-1-5-1-5-1-5-1-5'
    | '1-6-1-6-1-3-1-6-1-6'
    | '1-8-1-4-1-4-1-4-1-8'
    | '1-6-1-6-1-6-1-6-1-6-1-6'
    // Legacy support
    | '50-50'
    | '30-70'
    | '70-30'
    | '40-60'
    | '60-40'
    | '33-33-33'
    | '25-50-25'
    | '20-60-20'
    | '25-25-25-25'
    // Custom sizing
    | 'custom';
  custom_column_sizing?: string; // Custom CSS grid template columns value (e.g., "1fr 1fr 100px")
  gap?: number;
  column_alignment?: 'top' | 'middle' | 'bottom';
  content_alignment?: 'start' | 'end' | 'center' | 'stretch';
  full_width?: boolean; // Default true for backwards compatibility
  width_percent?: number; // Default 100, only used when full_width is false
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
  // Design properties with priority system
  design?: SharedDesignProperties;
}

// Layout configuration
export interface LayoutConfig {
  rows: CardRow[];
  gap?: number;
}

// Favorite Color Configuration
export interface FavoriteColor {
  id: string;
  name: string;
  color: string;
  order: number;
}

// Custom Variables Configuration
export interface CustomVariable {
  id: string;
  name: string; // Variable name (used as $name in templates)
  entity: string; // Entity ID reference
  value_type: 'entity_id' | 'state' | 'attribute'; // What the variable resolves to
  attribute_name?: string; // For attribute mode - which attribute to return
  order: number;
  created?: string;
  isGlobal?: boolean; // true = syncs across all cards (default), false = card-specific
}

export interface CustomVariablesExportData {
  variables: CustomVariable[];
  version: string;
  exported: string;
}

// Preset system types

// Entity mapping types for preset import
export interface EntityReference {
  entityId: string;
  locations: string[]; // JSONPath-like strings indicating where entity is used
  moduleType: string; // Type of module (icon, info, bar, etc.)
  context?: string; // Additional context (preset name, label, etc.)
}

export interface EntityMapping {
  original: string; // Original entity ID from preset
  mapped: string; // User's mapped entity ID
  domain: string; // Entity domain (light, sensor, etc.)
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
  // Optional taxonomy for integrations (e.g., Tesla, MQTT, Mobile App)
  integrations?: string[];
  thumbnail?: string;
  layout: LayoutConfig; // The actual preset configuration
  metadata: {
    created: string;
    updated: string;
    downloads?: number;
    rating?: number;
    entityMappings?: EntityMapping[]; // Store original→mapped entity pairs
  };
}

// Favorites system types
export interface FavoriteRow {
  id: string;
  name: string;
  description?: string;
  row: CardRow;
  created: string;
  tags: string[];
}

// Export/Import system types
export interface ExportData {
  type: 'ultra-card-row' | 'ultra-card-layout' | 'ultra-card-module' | 'ultra-card-full';
  version: string;
  data: CardRow | LayoutConfig | CardModule | UltraCardConfig;
  metadata: {
    exported: string;
    name?: string;
    description?: string;
    privacyProtected?: boolean; // Flag indicating if data was sanitized for privacy
  };
  customVariables?: CustomVariable[]; // Optional: Custom variables to export/import with the card
}

// Main card configuration
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
  // Card shadow properties
  card_shadow_enabled?: boolean;
  card_shadow_color?: string;
  card_shadow_horizontal?: number; // X offset
  card_shadow_vertical?: number; // Y offset
  card_shadow_blur?: number;
  card_shadow_spread?: number;
  // Card background image properties
  card_background_image_type?: 'none' | 'upload' | 'entity' | 'url';
  card_background_image?: string;
  card_background_image_entity?: string;
  card_background_size?: string; // 'cover' | 'contain' | 'auto' | custom values
  card_background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  card_background_position?: string; // e.g., 'center center', 'left top', etc.
  // Card-level conditional display
  display_mode?: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[];
  // Favorite colors configuration
  favorite_colors?: FavoriteColor[];
  // Haptic feedback configuration
  haptic_feedback?: boolean;
  // Card identification for backups (Ultra Card Pro)
  card_name?: string;
  // Responsive scaling configuration
  responsive_scaling?: boolean;
  // Card-specific custom variables (non-global)
  _customVariables?: CustomVariable[];
  // Backup of global variables (survives browser cache clear)
  _globalVariablesBackup?: {
    variables: CustomVariable[];
    version: number;
  };
}

// Custom card interface for registration
export interface CustomCard {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
  version?: string;
}

// Home Assistant types
export interface LovelaceCard {
  hass?: HomeAssistant;
  config?: UltraCardConfig;
  requestUpdate?: () => void;
}

// Event types
export interface ConfigChangedEvent {
  detail: {
    config: UltraCardConfig;
  };
}

// Editor types
export interface EditorTarget extends EventTarget {
  value?: string | number | boolean;
  checked?: boolean;
  configValue?: string;
  configAttribute?: string;
}

// Climate Module
export interface ClimateModule extends BaseModule {
  type: 'climate';
  entity: string;
  name?: string;

  // Display toggles
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

  // Layout / info placement
  info_position?: 'top' | 'bottom';

  // Dial configuration
  dial_size?: number;
  dial_color_heating?: string;
  dial_color_cooling?: string;
  dial_color_idle?: string;
  dial_color_off?: string;

  // Dynamic colors (auto-set based on HVAC action)
  dynamic_colors?: boolean; // Enable automatic color changes based on heating/cooling

  // Temperature adjustment
  temp_step_override?: number;
  temperature_unit?: 'auto' | 'fahrenheit' | 'celsius';
  temp_control_size?: number; // Size of +/- buttons in pixels (24-60)

  // Control layout
  fan_layout?: 'chips' | 'dropdown';
  preset_layout?: 'chips' | 'dropdown';

  // Visual customization
  humidity_icon?: string;
  current_temp_color?: string;
  target_temp_color?: string;
  mode_text_color?: string;
  humidity_color?: string;

  // Global action configuration
  tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  hold_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };
  double_tap_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    service?: string;
    service_data?: Record<string, any>;
  };

  // Hover configuration (reuse standard flag)
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// ========================================
// CALENDAR MODULE TYPES (Pro Feature)
// ========================================

// Calendar view types
export type CalendarViewType =
  | 'compact_list'
  | 'month'
  | 'week'
  | 'day'
  | 'table'
  | 'grid';

// First day of week options
export type FirstDayOfWeek = 'sunday' | 'monday' | 'saturday';

// Week number format
export type WeekNumberFormat = 'none' | 'iso' | 'us';

// Calendar entity configuration
export interface CalendarEntityConfig {
  id: string;
  entity: string;
  name?: string;
  color?: string;
  visible?: boolean;
}

// Calendar event from Home Assistant
export interface CalendarEventData {
  uid?: string;
  summary: string;
  start: string | { dateTime?: string; date?: string };
  end: string | { dateTime?: string; date?: string };
  description?: string;
  location?: string;
  recurrence_id?: string;
  rrule?: string;
}

// Processed calendar event with additional metadata
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

// Calendar module interface
export interface CalendarModule extends BaseModule {
  type: 'calendar';

  // Calendar entities
  calendars: CalendarEntityConfig[];

  // View configuration
  view_type: CalendarViewType;
  days_to_show: number;
  start_date?: string;

  // Title configuration
  title?: string;
  show_title?: boolean;
  title_font_size?: string;
  title_color?: string;
  show_title_separator?: boolean;
  title_separator_color?: string;
  title_separator_width?: string;

  // View-specific options
  // Compact list view
  compact_events_to_show?: number;
  compact_show_all_day_events?: boolean;
  compact_hide_empty_days?: boolean;
  // Auto-fit to height options
  compact_auto_fit_height?: boolean;  // Enable height-based fitting instead of count
  compact_height?: string;            // Container height (e.g., "300px", "50vh")
  compact_overflow?: 'scroll' | 'hidden';  // Overflow behavior
  compact_show_nav_buttons?: boolean; // Show scroll navigation buttons when overflow is hidden

  // Month view
  show_week_numbers?: WeekNumberFormat;
  first_day_of_week?: FirstDayOfWeek;
  month_show_event_count?: boolean;

  // Week view
  week_start_hour?: number;
  week_end_hour?: number;
  week_time_interval?: number;

  // Day view
  day_start_hour?: number;
  day_end_hour?: number;
  day_time_interval?: number;

  // Table view
  table_show_date_column?: boolean;
  table_show_time_column?: boolean;
  table_show_calendar_column?: boolean;
  table_show_location_column?: boolean;
  table_show_duration_column?: boolean;

  // Grid view
  grid_columns?: number;
  grid_card_height?: string;

  // Event display options
  show_event_time?: boolean;
  show_end_time?: boolean;
  show_event_location?: boolean;
  show_event_description?: boolean;
  show_event_icon?: boolean;
  time_24h?: boolean;
  remove_location_country?: boolean;
  max_event_title_length?: number;
  show_past_events?: boolean;

  // Date column styling
  date_vertical_alignment?: 'top' | 'middle' | 'bottom';
  weekday_font_size?: string;
  weekday_color?: string;
  day_font_size?: string;
  day_color?: string;
  show_month?: boolean;
  month_font_size?: string;
  month_color?: string;

  // Event styling
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

  // Background and accent styling
  event_background_opacity?: number;
  vertical_line_width?: string;
  accent_color?: string;

  // Layout and spacing
  row_spacing?: string;
  event_spacing?: string;
  additional_card_spacing?: string;

  // Separators
  show_day_separator?: boolean;
  day_separator_width?: string;
  day_separator_color?: string;
  show_week_separator?: boolean;
  week_separator_width?: string;
  week_separator_color?: string;
  month_separator_width?: string;
  month_separator_color?: string;

  // Expand/collapse functionality
  tap_action_expand?: boolean;

  // Refresh interval (in minutes)
  refresh_interval?: number;

  // Event filtering
  filter_keywords?: string[];
  filter_mode?: 'include' | 'exclude';

  // Language override
  language?: string;

  // Actions
  tap_action?: ModuleActionConfig;
  hold_action?: ModuleActionConfig;
  double_tap_action?: ModuleActionConfig;
  event_tap_action?: ModuleActionConfig;

  // Template support
  template_mode?: boolean;
  template?: string;

  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// ============================================
// SPORTS SCORE MODULE TYPES
// ============================================

// Supported sports leagues
export type SportsLeague =
  | 'nfl'
  | 'nba'
  | 'mlb'
  | 'nhl'
  | 'mls'
  | 'premier_league'
  | 'ncaaf'
  | 'ncaab'
  | 'la_liga'
  | 'bundesliga'
  | 'serie_a'
  | 'ligue_1';

// Display style options
export type SportsDisplayStyle =
  | 'scorecard'
  | 'upcoming'
  | 'compact'
  | 'detailed'
  | 'mini'
  | 'logo_bg';

// Game status types
export type SportsGameStatus =
  | 'scheduled'
  | 'in_progress'
  | 'halftime'
  | 'final'
  | 'delayed'
  | 'postponed'
  | 'cancelled';

// Normalized game data interface (used by both HA sensor and ESPN API)
export interface SportsGameData {
  // Game identification
  gameId: string;
  league: SportsLeague;
  
  // Team information
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number | null;
    record?: string; // e.g., "10-5"
    color?: string; // Primary team color
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
  
  // Game status
  status: SportsGameStatus;
  statusDetail?: string; // e.g., "4th Quarter", "Top 7th"
  clock?: string; // e.g., "5:32", "3rd Period"
  period?: number | string;
  
  // Schedule information
  gameTime: Date | null;
  venue?: string;
  broadcast?: string; // e.g., "ESPN", "FOX"
  
  // Odds (if available)
  odds?: {
    spread?: string;
    overUnder?: string;
  };
  
  // Metadata
  lastUpdated: Date;
}

// Team data for team picker
export interface SportsTeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  league: SportsLeague;
  color?: string;
}

// Sports score module configuration
export interface SportsScoreModule extends BaseModule {
  type: 'sports_score';
  
  // Data source configuration
  data_source: 'ha_sensor' | 'espn_api';
  sensor_entity?: string; // For HA sensor mode
  league?: SportsLeague; // For ESPN API mode
  team_id?: string; // ESPN team ID for API mode
  team_name?: string; // Display name for reference
  
  // Display configuration
  display_style: SportsDisplayStyle;
  refresh_interval: number; // Minutes (1-60)
  
  // Element visibility
  show_team_logos: boolean;
  show_team_names: boolean;
  show_team_records: boolean;
  show_game_time: boolean;
  show_venue: boolean;
  show_broadcast: boolean;
  show_score: boolean;
  show_odds: boolean;
  show_status_detail: boolean;
  
  // Styling options
  home_team_color?: string;
  away_team_color?: string;
  use_team_colors?: boolean; // Auto-detect from logos
  win_color?: string;
  loss_color?: string;
  in_progress_color?: string;
  scheduled_color?: string;
  text_color?: string; // Custom text color override for better readability
  
  // Font sizes
  team_name_font_size?: string;
  score_font_size?: string;
  detail_font_size?: string;
  
  // Layout options
  logo_size?: string; // e.g., "48px"
  compact_mode?: boolean;
  
  // Logo BG style options
  show_logo_background?: boolean; // Show/hide watermark logos in Logo BG style
  logo_background_size?: string; // Size of background logo watermarks (e.g., "80px")
  logo_background_opacity?: number; // Opacity of background logos (0-100)
  
  // Actions
  tap_action?: ModuleActionConfig;
  hold_action?: ModuleActionConfig;
  double_tap_action?: ModuleActionConfig;
  
  // Hover configuration
  enable_hover_effect?: boolean;
  hover_background_color?: string;
}

// ============================================
// BADGE OF HONOR MODULE TYPES (Pro Feature)
// ============================================

/**
 * Badge of Honor Module - Pro Feature
 *
 * A beautiful animated badge that celebrates Ultra Card Pro membership.
 * Features rotating circular text, smooth gradient color transitions,
 * and customizable inner content (icon, text, or image).
 */
export interface BadgeOfHonorModule extends BaseModule {
  type: 'badge_of_honor';

  // Badge text is fixed to "Ultra Card Pro • " - not configurable
  badge_text?: string; // Reserved for future use
  badge_text_repeat?: number; // Reserved for future use

  // Visual settings
  badge_size?: number; // Overall badge size in pixels (60-300)
  inner_badge_ratio?: number; // Size of inner circle relative to outer (0.4-0.8)

  // Gradient colors for the ring
  gradient_color_1?: string; // Default: #4ecdc4 (Teal)
  gradient_color_2?: string; // Default: #44a8b3 (Blue-teal)
  gradient_color_3?: string; // Default: #7c5ce0 (Purple)
  gradient_color_4?: string; // Default: #6366f1 (Indigo)

  // Animation settings
  rotation_speed?: number; // Seconds for full rotation (3-30)
  rotation_direction?: 'clockwise' | 'counter-clockwise';
  enable_color_shift?: boolean; // Animate gradient colors shifting
  color_shift_speed?: number; // Seconds for color cycle (2-20)
  enable_glow?: boolean; // Add soft glow around badge
  glow_intensity?: number; // Glow strength (0.1-1)
  enable_pulse?: boolean; // Add subtle pulsing animation
  pulse_speed?: number; // Pulse duration in seconds (0.5-5)

  // Inner content configuration
  inner_content_type?: 'icon' | 'text' | 'image';
  inner_icon?: string; // MDI icon (default: mdi:crown)
  inner_text?: string; // Short text (e.g., "PRO")
  inner_image_url?: string; // URL to image

  // Inner styling
  inner_background_type?: 'solid' | 'gradient' | 'transparent';
  inner_background_color?: string; // For solid type
  inner_text_color?: string;
  inner_icon_color?: string;

  // Text styling (fixed - not user configurable)
  text_font_size?: number; // Reserved
  text_font_weight?: number; // Reserved
  text_letter_spacing?: number; // Reserved

  // Actions
  tap_action?: ModuleActionConfig;
  hold_action?: ModuleActionConfig;
  double_tap_action?: ModuleActionConfig;

  // Hover configuration
  enable_hover_effect?: boolean;
  hover_scale?: number; // Scale on hover (1.0-1.2)
  hover_background_color?: string;
}

// Grid Module Types
// =================

// Grid style preset identifiers
export type GridStylePreset =
  | 'style_1' // Modern: Name above icon above state
  | 'style_2' // Modern: Icon above state (minimalist)
  | 'style_3' // Modern: Icon left, name + state right
  | 'style_4' // Modern: Large icon with floating state badge
  | 'style_5' // Modern: Icon + name horizontal, state below
  | 'style_6' // Minimal: Icon only (hover shows name)
  | 'style_7' // Minimal: Icon + state (compact)
  | 'style_8' // Minimal: Text-only (name + state)
  | 'style_9' // Minimal: Circular icon with ring progress
  | 'style_10' // Minimal: Square tile with corner state
  | 'style_11' // Classic: Card-like with shadow
  | 'style_12' // Classic: Button-style with border
  | 'style_13' // Classic: List-style horizontal
  | 'style_14' // Classic: Badge-style rounded
  | 'style_15' // Classic: Panel with header bar
  | 'style_16' // Advanced: Glass morphism
  | 'style_17' // Advanced: Gradient background
  | 'style_18' // Advanced: Split-color design
  | 'style_19' // Advanced: Neumorphic
  | 'style_20'; // Advanced: Flat with accent border

// Grid display modes
export type GridDisplayMode = 'grid' | 'masonry' | 'metro';

// Grid sort options
export type GridSortBy = 'name' | 'last_updated' | 'state' | 'custom' | 'domain';

// Grid pagination style
export type GridPaginationStyle = 'numbers' | 'buttons' | 'both';

// Grid load animations
export type GridLoadAnimation = 'fadeIn' | 'slideUp' | 'zoomIn' | 'slideDown' | 'slideLeft' | 'slideRight' | 'none';

// Metro size options
export type MetroSize = 'small' | 'medium' | 'large';

// Individual entity in the grid
export interface GridEntity {
  id: string;
  entity: string;

  // Optional display overrides
  custom_name?: string;
  custom_icon?: string;
  custom_color?: string;
  custom_background?: string;

  // Per-item action overrides
  override_actions?: boolean;
  tap_action?: ModuleActionConfig;
  hold_action?: ModuleActionConfig;
  double_tap_action?: ModuleActionConfig;

  // Metro mode: custom tile size
  metro_size?: MetroSize;

  // State-based color overrides
  state_colors?: Record<string, string>;

  // Hidden flag for filtering
  hidden?: boolean;
}

// Grid Module configuration
export interface GridModule extends BaseModule {
  type: 'grid';

  // Entity Management
  entities: GridEntity[];
  enable_auto_filter?: boolean;
  include_domains?: string[];
  exclude_domains?: string[];
  exclude_entities?: string[];
  // Keyword filtering - matches against entity_id
  include_keywords?: string[];
  exclude_keywords?: string[];

  // Layout Configuration
  grid_style: GridStylePreset;
  grid_display_mode: GridDisplayMode;
  columns: number; // 1-12, default 4
  rows?: number; // auto (0 or undefined) or fixed number
  gap: number; // pixels between items, default 8

  // Sorting & Filtering
  sort_by: GridSortBy;
  sort_direction: 'asc' | 'desc';
  max_items: number; // 0 = show all

  // Pagination
  enable_pagination: boolean;
  items_per_page: number;
  pagination_style: GridPaginationStyle;

  // Animation
  enable_load_animation: boolean;
  load_animation: GridLoadAnimation;
  grid_animation_duration: number; // duration of each animation in ms
  animation_stagger: number; // delay between items in ms

  // Global Styling (applies to all items unless overridden)
  global_icon_size: number; // pixels
  global_font_size: number; // pixels
  global_name_color?: string;
  global_state_color?: string;
  global_icon_color?: string;
  global_background_color?: string;
  global_border_radius: string; // e.g., "8px" or "50%"
  global_padding: string; // e.g., "12px"
  global_border_width?: number;
  global_border_color?: string;

  // State-based styling
  global_on_color?: string;
  global_off_color?: string;
  global_unavailable_color?: string;

  // Style-specific colors
  // Glass style (style_16)
  glass_tint_color?: string;
  glass_blur_amount?: number;
  glass_border_color?: string;

  // Gradient style (style_17)
  gradient_start_color?: string;
  gradient_end_color?: string;
  gradient_direction?: 'to-bottom' | 'to-right' | 'to-bottom-right' | 'to-bottom-left';

  // Panel style (style_15)
  panel_header_color?: string;
  panel_header_text_color?: string;

  // Split style (style_18)
  split_left_color?: string;
  split_right_color?: string;

  // Neumorphic style (style_19)
  neumorphic_light_shadow?: string;
  neumorphic_dark_shadow?: string;

  // Accent Border style (style_20)
  accent_border_color?: string;

  // Card style (style_11)
  card_shadow_color?: string;

  // Global Actions (can be overridden per-item)
  tap_action: ModuleActionConfig;
  hold_action: ModuleActionConfig;
  double_tap_action: ModuleActionConfig;

  // Hover configuration
  enable_hover_effect?: boolean;
  hover_effect?: 'none' | 'scale' | 'glow' | 'lift' | 'color';
  hover_scale?: number; // e.g., 1.05
  hover_background_color?: string;
  hover_glow_color?: string;

  // Template support
  template_mode?: boolean;
  template?: string;
  unified_template_mode?: boolean;
  unified_template?: string;
}
