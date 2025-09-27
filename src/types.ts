import { HomeAssistant } from 'custom-card-helpers';
import { LinkAction } from './services/link-service';

// Action type definition (without 'default')
export type ActionType =
  | 'more-info'
  | 'toggle'
  | 'navigate'
  | 'url'
  | 'perform-action'
  | 'assist'
  | 'nothing';

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
    | 'button'
    | 'markdown'
    | 'camera'
    | 'graphs'
    | 'dropdown'
    | 'light';
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
  width_percent?: number;
  height_px?: number; // For vertical separators
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
  // Icon positioning and alignment
  icon_position?: 'left' | 'right' | 'top' | 'bottom';
  icon_alignment?: 'start' | 'center' | 'end';
  content_alignment?: 'start' | 'center' | 'end';
  overall_alignment?: 'left' | 'center' | 'right';
  icon_gap?: number;
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

  // Text Display
  label_alignment?: 'left' | 'center' | 'right' | 'space-between';
  show_percentage?: boolean;
  percentage_text_size?: number;
  percentage_text_alignment?: 'left' | 'center' | 'right';
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

  // Colors
  bar_color?: string;
  bar_background_color?: string;
  bar_border_color?: string;
  percentage_text_color?: string;
  dot_color?: string; // Color for minimal style dot indicator

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

// Icon Configuration
export interface IconConfig {
  id: string;
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
}

// Icon Module
export interface IconModule extends BaseModule {
  type: 'icon';
  icons: IconConfig[];
  alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
  vertical_alignment?: 'top' | 'center' | 'bottom';
  columns?: number;
  gap?: number;
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
}

// Markdown Module
export interface MarkdownModule extends BaseModule {
  type: 'markdown';
  markdown_content: string;
  link?: string; // Legacy support
  hide_if_no_link?: boolean;
  template_mode?: boolean;
  template?: string;
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
  auto_refresh?: boolean;
  refresh_interval?: number;

  // Image quality
  image_quality?: 'high' | 'medium' | 'low';

  // Rotation
  rotation?: number;

  // Live view (streaming)
  live_view?: boolean;

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
  legend_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';

  show_grid?: boolean;
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

  // Basic Configuration
  placeholder?: string;

  // Dropdown Options
  options: DropdownOption[];

  // State Tracking
  current_selection?: string; // Tracks the currently selected option label
  track_state?: boolean; // Whether to track and display current selection

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

// Union type for all module types
export type CardModule =
  | TextModule
  | SeparatorModule
  | ImageModule
  | InfoModule
  | BarModule
  | IconModule
  | HorizontalModule
  | VerticalModule
  | ButtonModule
  | MarkdownModule
  | CameraModule
  | GraphsModule
  | DropdownModule
  | LightModule;

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
  // Background properties
  background_color?: string;
  background_image?: string;
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
}

// Column interface that contains modules
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
    | '25-25-25-25';
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

// Preset system types
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
  type: 'ultra-card-row' | 'ultra-card-layout' | 'ultra-card-module';
  version: string;
  data: CardRow | LayoutConfig | CardModule;
  metadata: {
    exported: string;
    name?: string;
    description?: string;
    privacyProtected?: boolean; // Flag indicating if data was sanitized for privacy
  };
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
  // Card-level conditional display
  display_mode?: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[];
  // Favorite colors configuration
  favorite_colors?: FavoriteColor[];
  // Haptic feedback configuration
  haptic_feedback?: boolean;
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
