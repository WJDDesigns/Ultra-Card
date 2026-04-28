import { HomeAssistant } from 'custom-card-helpers';
import { LinkAction } from './services/link-service';

// Global window interface extensions
declare global {
  interface Window {
    _ultraCardUpdateTimer?: ReturnType<typeof setTimeout> | null | undefined;
    /**
     * Optional module chunk preload policy (see `uc-module-preload-scheduler.ts`).
     * `localStorage['ultra-card-module-preload']` accepts the same strings if this is unset.
     */
    __ultraCardModulePreload?: 'batched' | 'full' | 'minimal' | 'off' | 'none' | 'parallel' | 'default' | undefined;
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
  icon?: string | undefined;
  icon_color?: string | undefined;
  // Display properties (general)
  name?: string | undefined;
  name_color?: string | undefined;
  state_text?: string | undefined;
  state_color?: string | undefined;
  // Display properties (text/content modules)
  content?: string | undefined;
  color?: string | undefined;
  // Display properties (bar module)
  value?: number | string | undefined;
  label?: string | undefined;
}

export interface ModuleActionConfig {
  action: ActionType;
  entity?: string | undefined;
  navigation_path?: string | undefined;
  url_path?: string | undefined;
  service?: string | undefined;
  perform_action?: string | undefined;
  service_data?: Record<string, any> | undefined;
  pipeline_id?: string | undefined;
  start_listening?: boolean | undefined;
  target?: {
    entity_id?: string | string[] | undefined;
    device_id?: string | string[] | undefined;
    area_id?: string | string[] | undefined;
  };
  data?: Record<string, any> | undefined;
}

// MODULAR LAYOUT SYSTEM TYPES
// ============================

// Display conditions for modules and sections
export interface DisplayCondition {
  id: string;
  type: 'entity_state' | 'entity_attribute' | 'template' | 'time';
  entity?: string | undefined;
  attribute?: string | undefined; // For entity attributes
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
    | 'not_contains'
    | undefined;
  value?: string | number | undefined;
  template?: string | undefined;
  time_from?: string | undefined;
  time_to?: string | undefined;
  enabled?: boolean | undefined; // Whether this condition is active
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
    | 'badge_of_honor'
    | 'vacuum'
    | 'media_player'
    | 'people'
    | 'navigation'
    | 'timer'
    | 'cover'
    | 'fan'
    | 'lock'
    | 'dynamic-list'
    | 'qr_code'
    | 'energy_display'
    | 'living_canvas'
    | 'text_input'
    | 'datetime_input'
    | 'number_input'
    | 'slider_input'
    | 'select_input'
    | 'boolean_input'
    | 'button_input'
    | 'counter_input'
    | 'color_input'
    | 'activity_feed'
    | 'alert_center'
    | 'area_summary'
    | 'virtual_pet';
  name?: string | undefined;
  // Display conditions - when to show/hide this module
  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
  // Responsive visibility - hide on specific device breakpoints
  hidden_on_devices?: DeviceBreakpoint[] | undefined;
  // Legacy design properties (for backward compatibility)
  background_color?: string | undefined;
  background_image?: string | undefined;
  background_image_type?: 'none' | 'upload' | 'entity' | 'url' | undefined;
  background_image_entity?: string | undefined;
  background_size?: 'cover' | 'contain' | 'auto' | string | undefined; // string to allow custom values like '100px 200px'
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
    | string
    | undefined; // string to allow custom values
  background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | undefined;
  margin?: {
    top?: number | undefined;
    bottom?: number | undefined;
    left?: number | undefined;
    right?: number | undefined;
  };
  padding?: {
    top?: number | undefined;
    bottom?: number | undefined;
    left?: number | undefined;
    right?: number | undefined;
  };
  border?: {
    style?: 'none' | 'solid' | 'dashed' | 'dotted' | undefined;
    width?: number | undefined;
    color?: string | undefined;
    radius?: number | undefined;
  };
  // Direct border radius property (alternative to border.radius)
  border_radius?: string | number | undefined;
  custom_css?: string | undefined;
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
    | 'rotateIn'
    | undefined;
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
    | 'rotateOut'
    | undefined;
  animation_duration?: string | undefined;
  animation_delay?: string | undefined;
  animation_timing?:
    | 'ease'
    | 'linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'cubic-bezier(0.25,0.1,0.25,1)'
    | undefined;
  // New design properties with priority system
  design?: SharedDesignProperties | undefined;
  // Action confirmation - when enabled, shows a confirmation dialog before executing actions
  confirm_action?: boolean | undefined;
  // Confirmation dialog customization
  confirm_action_show_confirm_button?: boolean | undefined;
  confirm_action_show_cancel_button?: boolean | undefined;
  confirm_action_confirm_text?: string | undefined;
  confirm_action_cancel_text?: string | undefined;
}

// Text Module
export interface TextModule extends BaseModule {
  type: 'text';
  text: string;
  // Legacy link support (for backward compatibility)
  link?: string | undefined;
  hide_if_no_link?: boolean | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
  icon?: string | undefined;
  icon_color?: string | undefined;
  icon_position?: 'before' | 'after' | 'none' | undefined;
  font_size?: number | undefined;
  font_family?: string | undefined;
  color?: string | undefined;
  alignment?: 'left' | 'center' | 'right' | 'justify' | undefined;
  bold?: boolean | undefined;
  italic?: boolean | undefined;
  underline?: boolean | undefined;
  uppercase?: boolean | undefined;
  strikethrough?: boolean | undefined;
  // Advanced typography options
  font_weight?: string | undefined;
  line_height?: number | undefined;
  letter_spacing?: string | undefined;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | undefined;
  font_style?: 'normal' | 'italic' | 'oblique' | undefined;
  // Unified template system
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  ignore_entity_state_config?: boolean | undefined;
  // Size configuration (General tab controls)
  text_size?: number | undefined; // Text size in pixels
  icon_size?: number | undefined; // Icon size in pixels (when icon is used)
  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
  hover_effect?: 'none' | 'color' | 'scale' | 'glow' | 'lift' | undefined;
  hover_glow_color?: string | undefined;
  // Rich text (WYSIWYG) content — always active for non-template text modules.
  // Legacy `text` field is auto-migrated into this on first render.
  rich_text_content?: string | undefined;
}

// Separator Module
export interface SeparatorModule extends BaseModule {
  type: 'separator';
  separator_style?: 'line' | 'double_line' | 'dotted' | 'double_dotted' | 'shadow' | 'blank' | undefined;
  orientation?: 'horizontal' | 'vertical' | undefined;
  thickness?: number | undefined;
  width_percent?: number | string | undefined; // Percentage (e.g., "100%") or pixels (e.g., "200px")
  height_px?: number | string | undefined; // Pixels (e.g., "300px") or percentage (e.g., "50%")
  color?: string | undefined;
  show_title?: boolean | undefined;
  title?: string | undefined;
  title_size?: number | undefined;
  title_color?: string | undefined;
  title_bold?: boolean | undefined;
  title_italic?: boolean | undefined;
  title_uppercase?: boolean | undefined;
  title_strikethrough?: boolean | undefined;
  title_underline?: boolean | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Image Module
export interface ImageModule extends BaseModule {
  type: 'image';
  // Legacy properties (for backward compatibility)
  image_type?: 'upload' | 'url' | 'entity' | 'attribute' | 'none' | 'default' | undefined;
  image?: string | undefined;
  image_entity?: string | undefined;
  image_width?: number | undefined;
  image_height?: number | undefined;
  image_fit?: 'cover' | 'contain' | 'fill' | 'none' | undefined;
  single_click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service' | undefined;
  single_entity?: string | undefined;
  single_navigation_path?: string | undefined;
  single_url?: string | undefined;
  single_service?: string | undefined;
  single_service_data?: Record<string, any> | undefined;
  // New enhanced properties
  image_url?: string | undefined;
  entity?: string | undefined;
  image_attribute?: string | undefined;
  width?: number | string | undefined;
  height?: number | string | undefined;
  aspect_ratio?: 'auto' | '1/1' | '4/3' | '3/2' | '16/9' | '21/9' | '2/3' | '9/16' | undefined;
  object_fit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none' | undefined;
  border_radius?: number | undefined;
  border_width?: number | undefined;
  border_color?: string | undefined;
  box_shadow?: string | undefined;
  // Link configuration (legacy)
  link_enabled?: boolean | undefined;
  link_url?: string | undefined;
  link_target?: '_self' | '_blank' | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
  // Alignment
  alignment?: 'left' | 'center' | 'right' | undefined;
  // CSS Filters
  filter_blur?: number | undefined;
  filter_brightness?: number | undefined;
  filter_contrast?: number | undefined;
  filter_saturate?: number | undefined;
  filter_hue_rotate?: number | undefined;
  filter_opacity?: number | undefined;
  // Rotation
  rotation?: number | undefined;
  // Hover effects
  hover_enabled?: boolean | undefined;
  hover_effect?: 'scale' | 'rotate' | 'fade' | 'blur' | 'brightness' | 'glow' | 'slide' | undefined;
  hover_scale?: number | undefined;
  hover_rotate?: number | undefined;
  hover_opacity?: number | undefined;
  hover_blur?: number | undefined;
  hover_brightness?: number | undefined;
  hover_shadow?: string | undefined;
  hover_translate_x?: number | undefined;
  hover_translate_y?: number | undefined;
  hover_transition?: number | undefined;
  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Info Entity Configuration
export interface InfoEntityConfig {
  id: string;
  entity: string;
  name?: string | undefined;
  icon?: string | undefined;
  show_icon?: boolean | undefined;
  show_name?: boolean | undefined;
  show_state?: boolean | undefined;
  show_units?: boolean | undefined;
  text_size?: number | undefined;
  name_size?: number | undefined;
  icon_size?: number | undefined;
  text_bold?: boolean | undefined;
  text_italic?: boolean | undefined;
  text_uppercase?: boolean | undefined;
  text_strikethrough?: boolean | undefined;
  name_bold?: boolean | undefined;
  name_italic?: boolean | undefined;
  name_uppercase?: boolean | undefined;
  name_strikethrough?: boolean | undefined;
  icon_color?: string | undefined;
  name_color?: string | undefined;
  text_color?: string | undefined;
  state_color?: string | undefined;
  click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service' | undefined;
  navigation_path?: string | undefined;
  url?: string | undefined;
  service?: string | undefined;
  service_data?: Record<string, any> | undefined;
  // Unified template system (replaces multiple template boxes)
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  ignore_entity_state_config?: boolean | undefined;
  // Icon positioning and alignment
  icon_position?: 'left' | 'right' | 'top' | 'bottom' | undefined;
  icon_alignment?: 'start' | 'center' | 'end' | undefined;
  name_alignment?: 'start' | 'center' | 'end' | undefined;
  state_alignment?: 'start' | 'center' | 'end' | undefined;
  overall_alignment?: 'left' | 'center' | 'right' | undefined;
  icon_gap?: number | undefined;
  // Name/Value layout direction (works with any icon position or when icon is disabled)
  name_value_layout?: 'vertical' | 'horizontal' | undefined;
  name_value_gap?: number | undefined;
  // Content distribution control
  content_distribution?: 'normal' | 'space-between' | 'space-around' | 'space-evenly' | undefined;
  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
  /** Display an entity attribute instead of state */
  attribute?: string | undefined;
}

// Info Module
export interface InfoModule extends BaseModule {
  type: 'info';
  info_entities: InfoEntityConfig[];
  alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around' | undefined;
  vertical_alignment?: 'top' | 'center' | 'bottom' | undefined;
  columns?: number | undefined;
  gap?: number | undefined;
  allow_wrap?: boolean | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
  // Size configuration (General tab controls)
  text_size?: number | undefined; // Text size in pixels
  icon_size?: number | undefined; // Icon size in pixels
  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Bar Module
export interface BarModule extends BaseModule {
  type: 'bar';
  // Basic Configuration
  entity: string;
  name?: string | undefined;

  // Percentage Calculation
  percentage_type?: 'entity' | 'attribute' | 'difference' | 'template' | 'time_progress' | 'range' | undefined;
  percentage_entity?: string | undefined;

  // Entity Attribute mode
  percentage_attribute_entity?: string | undefined;
  percentage_attribute_name?: string | undefined;

  // Difference mode
  percentage_current_entity?: string | undefined;
  percentage_total_entity?: string | undefined;

  // Time Progress mode (real-time timestamp-based calculation)
  time_progress_start_entity?: string | undefined;
  time_progress_end_entity?: string | undefined;
  time_progress_direction?: 'forward' | 'backward' | undefined;
  time_progress_update_interval?: number | undefined;

  // Range mode (visualize a range between start and end values)
  range_start_entity?: string | undefined;
  range_start_attribute?: string | undefined;
  range_end_entity?: string | undefined;
  range_end_attribute?: string | undefined;
  range_current_entity?: string | undefined; // Optional: show current value marker
  range_current_attribute?: string | undefined;
  range_current_color?: string | undefined; // Color for current value marker

  // Manual Min/Max Range (overrides auto-detection)
  percentage_min?: number | undefined;
  percentage_max?: number | undefined;

  // Bar Appearance
  bar_direction?: 'left-to-right' | 'right-to-left' | undefined;
  bar_size?: 'extra-thick' | 'thick' | 'medium' | 'thin' | undefined;
  bar_radius?: 'square' | 'round' | 'pill' | undefined;
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
    | 'minimal'
    | undefined;
  bar_width?: number | undefined; // Now a percentage number instead of string
  bar_alignment?: 'left' | 'center' | 'right' | undefined;
  height?: number | undefined;
  border_radius?: number | undefined;
  glass_blur_amount?: number | undefined; // Glass blur amount (0-20px) for glass style

  // Text Display
  label_alignment?: 'left' | 'center' | 'right' | 'space-between' | undefined;
  show_percentage?: boolean | undefined;
  percentage_text_size?: number | undefined;
  percentage_text_alignment?: 'left' | 'center' | 'right' | 'follow-fill' | undefined;
  percentage_text_bold?: boolean | undefined;
  percentage_text_italic?: boolean | undefined;
  percentage_text_strikethrough?: boolean | undefined;
  show_value?: boolean | undefined;
  value_position?: 'inside' | 'outside' | 'none' | undefined;

  // Left Side Configuration
  left_enabled?: boolean | undefined;
  left_title?: string | undefined;
  left_entity?: string | undefined;
  left_condition_type?: 'none' | 'entity' | 'template' | undefined;
  left_condition_entity?: string | undefined;
  left_condition_state?: string | undefined;
  left_title_size?: number | undefined;
  left_value_size?: number | undefined;
  left_title_color?: string | undefined;
  left_value_color?: string | undefined;

  // Right Side Configuration
  right_enabled?: boolean | undefined;
  right_title?: string | undefined;
  right_entity?: string | undefined;
  right_condition_type?: 'none' | 'entity' | 'template' | undefined;
  right_condition_entity?: string | undefined;
  right_condition_state?: string | undefined;
  right_title_size?: number | undefined;
  right_value_size?: number | undefined;
  right_title_color?: string | undefined;
  right_value_color?: string | undefined;

  // Left Side Actions
  left_tap_action?: ModuleActionConfig | undefined;
  left_hold_action?: ModuleActionConfig | undefined;
  left_double_tap_action?: ModuleActionConfig | undefined;

  // Right Side Actions
  right_tap_action?: ModuleActionConfig | undefined;
  right_hold_action?: ModuleActionConfig | undefined;
  right_double_tap_action?: ModuleActionConfig | undefined;

  // Colors
  bar_color?: string | undefined;
  bar_background_color?: string | undefined;
  bar_border_color?: string | undefined;
  percentage_text_color?: string | undefined;
  dot_color?: string | undefined; // Color for minimal style dot indicator

  // Minimal style icon configuration
  minimal_icon_enabled?: boolean | undefined; // Enable icon display
  minimal_icon?: string | undefined; // Icon to display (e.g., mdi:battery)
  minimal_icon_mode?: 'dot-only' | 'icon-only' | 'icon-in-dot' | undefined; // Display mode
  minimal_icon_size?: number | undefined; // Icon size in pixels
  minimal_icon_size_auto?: boolean | undefined; // Auto-scale with bar height (default: true)
  minimal_icon_color?: string | undefined; // Icon color (if empty, uses dot color)
  minimal_icon_use_dot_color?: boolean | undefined; // Use dot color for icon (default: true)

  // Gradient Configuration
  use_gradient?: boolean | undefined;
  gradient_display_mode?: 'full' | 'cropped' | 'value-based' | undefined;
  gradient_stops?: Array<{
    id: string;
    position: number;
    color: string;
  }>;

  // Limit Indicator
  limit_entity?: string | undefined;
  limit_color?: string | undefined;

  // Scale/Tick Marks
  show_scale?: boolean | undefined;
  scale_divisions?: number | undefined; // Number of tick marks (e.g., 5 = marks at 0%, 25%, 50%, 75%, 100%)
  scale_show_labels?: boolean | undefined; // Show numeric labels on ticks
  scale_label_size?: number | undefined;
  scale_label_color?: string | undefined;
  scale_tick_color?: string | undefined; // Color of the tick mark lines (default: var(--divider-color))
  scale_position?: 'above' | 'below' | undefined; // Position relative to bar
  scale_custom_ticks?: string | undefined; // Comma-separated real-world values for custom tick positions (e.g. "10,20,30,40")
  scale_custom_labels?: string | undefined; // Comma-separated labels matching custom ticks (e.g. "Reserve,1/4,1/2,3/4")
  scale_clamp_edge_labels?: boolean | undefined; // Nudge first/last labels inward to avoid clipping
  scale_mobile_options_enabled?: boolean | undefined; // Enable mobile-specific scale label behavior
  scale_mobile_breakpoint?: number | undefined; // Viewport width threshold (px) for mobile options
  scale_mobile_reduce_label_density?: boolean | undefined; // Hide every second label on mobile
  scale_mobile_abbreviate_labels?: boolean | undefined; // Shorten numeric labels on mobile

  // Animation & Templates
  animation?: boolean | undefined;
  // Unified template system
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  ignore_entity_state_config?: boolean | undefined;

  // Bar Animation (state/attribute triggered)
  bar_animation_enabled?: boolean | undefined;
  bar_animation_entity?: string | undefined;
  bar_animation_trigger_type?: 'state' | 'attribute' | undefined;
  bar_animation_attribute?: string | undefined;
  bar_animation_value?: string | undefined;
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
    | 'vibrate'
    | undefined;

  // Bar Animation Override (takes precedence over the regular animation)
  bar_animation_override_entity?: string | undefined;
  bar_animation_override_trigger_type?: 'state' | 'attribute' | undefined;
  bar_animation_override_attribute?: string | undefined;
  bar_animation_override_value?: string | undefined;
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
    | 'vibrate'
    | undefined;

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Gauge Module
export interface GaugeModule extends BaseModule {
  type: 'gauge';
  // Basic Configuration
  entity: string;
  name?: string | undefined;

  // Value Calculation
  value_type?: 'entity' | 'attribute' | 'template' | undefined;
  value_entity?: string | undefined;
  value_attribute_entity?: string | undefined;
  value_attribute_name?: string | undefined;
  // Range Configuration
  min_value?: number | undefined;
  max_value?: number | undefined;

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
    | 'radial'
    | undefined;
  gauge_size?: number | undefined; // Gauge diameter/size in pixels
  gauge_thickness?: number | undefined; // Thickness of gauge track (1-50)
  flip_horizontal?: boolean | undefined; // Flip gauge horizontally (Arc and Speedometer styles only)

  // Pointer Configuration
  pointer_enabled?: boolean | undefined;
  pointer_style?:
    | 'triangle'
    | 'line'
    | 'needle'
    | 'arrow'
    | 'circle'
    | 'highlight'
    | 'cap'
    | 'icon'
    | 'custom'
    | undefined;
  pointer_color?: string | undefined;
  pointer_length?: number | undefined; // Percentage of gauge radius (1-100)
  pointer_width?: number | undefined; // Width in pixels
  pointer_icon?: string | undefined; // Icon name (e.g., 'mdi:gauge') for icon pointer style
  pointer_icon_color?: string | undefined; // Color for icon pointer style
  pointer_icon_size?: number | undefined; // Size of icon in pixels for icon pointer style

  // Color Configuration
  gauge_color_mode?: 'solid' | 'gradient' | 'segments' | undefined;

  // Solid color mode
  gauge_color?: string | undefined;
  gauge_background_color?: string | undefined;

  // Gradient mode
  use_gradient?: boolean | undefined;
  gradient_display_mode?: 'full' | 'cropped' | 'value-based' | undefined;
  gradient_stops?: Array<{
    id: string;
    position: number; // 0-100
    color: string;
  }>;

  // Segments mode (for discrete color sections)
  use_segments?: boolean | undefined;
  segments?: Array<{
    id: string;
    from: number;
    to: number;
    color: string;
    label?: string | undefined;
  }>;

  // Display Configuration
  show_value?: boolean | undefined;
  value_position?: 'center' | 'top' | 'bottom' | 'none' | undefined;
  value_font_size?: number | undefined;
  value_color?: string | undefined;
  value_format?: string | undefined; // Format string for value display (e.g., "%.1f°C")
  value_x_offset?: number | undefined; // X offset for value positioning
  value_y_offset?: number | undefined; // Y offset for value positioning

  // Value formatting
  value_bold?: boolean | undefined;
  value_italic?: boolean | undefined;
  value_underline?: boolean | undefined;
  value_uppercase?: boolean | undefined;
  value_strikethrough?: boolean | undefined;

  show_name?: boolean | undefined;
  name_position?: 'top' | 'bottom' | 'center' | 'none' | undefined;
  name_font_size?: number | undefined;
  name_color?: string | undefined;
  name_x_offset?: number | undefined; // X offset for name positioning
  name_y_offset?: number | undefined; // Y offset for name positioning

  // Name formatting
  name_bold?: boolean | undefined;
  name_italic?: boolean | undefined;
  name_underline?: boolean | undefined;
  name_uppercase?: boolean | undefined;
  name_strikethrough?: boolean | undefined;

  show_min_max?: boolean | undefined;
  min_max_font_size?: number | undefined;
  min_max_color?: string | undefined;

  // Tick Marks
  show_ticks?: boolean | undefined;
  tick_count?: number | undefined; // Number of major tick marks
  tick_color?: string | undefined;
  show_tick_labels?: boolean | undefined;
  tick_label_font_size?: number | undefined;

  // Gauge Animation (needle/value animation - named to avoid Design tab conflict)
  gauge_animation_enabled?: boolean | undefined;
  gauge_animation_duration?: string | undefined; // Duration in milliseconds
  gauge_animation_easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | undefined;

  // Zones/Ranges (visual indicators on gauge)
  zones?: Array<{
    id: string;
    from: number;
    to: number;
    color: string;
    opacity?: number | undefined;
  }>;

  // Unified template system
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  ignore_entity_state_config?: boolean | undefined;

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;

  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Icon Configuration
export interface IconConfig {
  id: string;
  icon_mode?: 'entity' | 'static' | undefined; // 'entity' = connected to HA entity, 'static' = standalone icon
  entity: string;
  name?: string | undefined;

  // Icon states
  icon_inactive?: string | undefined;
  icon_active?: string | undefined;
  inactive_state?: string | undefined;
  active_state?: string | undefined;
  inactive_attribute?: string | undefined;
  active_attribute?: string | undefined;
  /** Simple attribute display override (shows same attribute for both active/inactive) */
  display_attribute?: string | undefined;
  custom_inactive_state_text?: string | undefined;
  custom_active_state_text?: string | undefined;
  custom_inactive_name_text?: string | undefined;
  custom_active_name_text?: string | undefined;

  // Entity color options
  use_entity_color_for_icon?: boolean | undefined;
  use_state_color_for_inactive_icon?: boolean | undefined;
  use_state_color_for_active_icon?: boolean | undefined;

  // Color configuration
  color_inactive?: string | undefined;
  color_active?: string | undefined;
  inactive_icon_color?: string | undefined;
  active_icon_color?: string | undefined;
  inactive_name_color?: string | undefined;
  active_name_color?: string | undefined;
  inactive_state_color?: string | undefined;
  active_state_color?: string | undefined;

  // Display toggles for inactive state
  show_name_when_inactive?: boolean | undefined;
  show_state_when_inactive?: boolean | undefined;
  show_icon_when_inactive?: boolean | undefined;

  // Display toggles for active state
  show_name_when_active?: boolean | undefined;
  show_state_when_active?: boolean | undefined;
  show_icon_when_active?: boolean | undefined;

  // Legacy show options (for backward compatibility)
  show_state?: boolean | undefined;
  show_name?: boolean | undefined;

  // Other display options
  show_units?: boolean | undefined;

  // Hover effects
  enable_hover_effect?: boolean | undefined;

  // Sizing
  icon_size?: number | undefined;
  text_size?: number | undefined;
  name_icon_gap?: number | undefined;
  name_state_gap?: number | undefined;
  icon_state_gap?: number | undefined;

  // Active/Inactive specific sizing
  active_icon_size?: number | undefined;
  inactive_icon_size?: number | undefined;
  active_text_size?: number | undefined;
  inactive_text_size?: number | undefined;
  state_size?: number | undefined;
  active_state_size?: number | undefined;
  inactive_state_size?: number | undefined;

  // Size lock mechanism (individual locks for each size)
  icon_size_locked?: boolean | undefined;
  text_size_locked?: boolean | undefined;
  state_size_locked?: boolean | undefined;

  // Field lock mechanism (locks for active fields to inherit from inactive)
  active_icon_locked?: boolean | undefined;
  active_icon_color_locked?: boolean | undefined;
  active_icon_background_locked?: boolean | undefined;
  active_icon_background_color_locked?: boolean | undefined;
  active_name_locked?: boolean | undefined;
  active_name_color_locked?: boolean | undefined;
  active_state_locked?: boolean | undefined;
  active_state_color_locked?: boolean | undefined;

  // Icon background
  icon_background?: 'none' | 'rounded-square' | 'circle' | undefined;
  use_entity_color_for_icon_background?: boolean | undefined;
  icon_background_color?: string | undefined;

  // Container background image controls (optional per-icon override)
  background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | undefined;
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
    | undefined;
  background_size?: 'cover' | 'contain' | 'auto' | string | undefined;

  // Active/Inactive specific icon backgrounds
  active_icon_background?: 'none' | 'rounded-square' | 'circle' | undefined;
  inactive_icon_background?: 'none' | 'rounded-square' | 'circle' | undefined;
  active_icon_background_color?: string | undefined;
  inactive_icon_background_color?: string | undefined;

  // Icon background padding (distance from icon to background edge)
  icon_background_padding?: number | undefined;
  active_icon_background_padding?: number | undefined;
  inactive_icon_background_padding?: number | undefined;
  active_icon_background_padding_locked?: boolean | undefined;

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
    | 'tada'
    | undefined;
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
    | 'tada'
    | undefined;

  // Container appearance
  vertical_alignment?: 'top' | 'center' | 'bottom' | undefined;
  container_width?: number | undefined; // Changed from string to number for slider
  container_background_shape?: 'none' | 'rounded' | 'square' | 'circle' | undefined;
  container_background_color?: string | undefined;

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;

  // Legacy actions (for backward compatibility)
  click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service' | undefined;
  double_click_action?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service' | undefined;
  hold_action_legacy?: 'none' | 'more-info' | 'toggle' | 'navigate' | 'url' | 'service' | undefined;
  navigation_path?: string | undefined;
  url?: string | undefined;
  service?: string | undefined;
  service_data?: Record<string, any> | undefined;

  // Unified template system (replaces multiple template boxes)
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  ignore_entity_state_config?: boolean | undefined; // When true, template controls state logic too
}

// Icon Module
export interface IconModule extends BaseModule {
  type: 'icon';
  icons: IconConfig[];
  alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around' | undefined;
  vertical_alignment?: 'top' | 'center' | 'bottom' | undefined;
  columns?: number | undefined;
  gap?: number | undefined;
  allow_wrap?: boolean | undefined; // Allow grid items to wrap to new rows
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
  // Size configuration (General tab controls)
  text_size?: number | undefined; // Text size in pixels
  icon_size?: number | undefined; // Icon size in pixels
  // Hover effects
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Horizontal Layout Module
export interface HorizontalModule extends BaseModule {
  type: 'horizontal';
  modules: CardModule[];
  alignment?: 'left' | 'center' | 'right' | 'space-between' | 'space-around' | 'justify' | undefined;
  vertical_alignment?: 'top' | 'center' | 'bottom' | 'stretch' | 'baseline' | undefined;
  gap?: number | undefined;
  gap_unit?: 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh' | undefined;
  wrap?: boolean | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
}

// Vertical Layout Module
export interface VerticalModule extends BaseModule {
  type: 'vertical';
  modules: CardModule[];
  alignment?: 'top' | 'center' | 'bottom' | 'space-between' | 'space-around' | undefined;
  // New: Horizontal alignment controls how items are aligned in the single column
  // Backward-compatible addition; UI will prefer this over legacy vertical alignment for cross-axis
  horizontal_alignment?: 'left' | 'center' | 'right' | 'stretch' | undefined;
  gap?: number | undefined;
  gap_unit?: 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh' | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
}

// Accordion Layout Module
export interface AccordionModule extends BaseModule {
  type: 'accordion';
  modules: CardModule[];

  // Header configuration
  title_mode?: 'custom' | 'entity' | undefined;
  title_text?: string | undefined;
  title_entity?: string | undefined;
  show_entity_name?: boolean | undefined; // Show entity name when using entity title mode
  icon?: string | undefined; // Main chevron/control icon (defaults to mdi:chevron-down)
  header_alignment?: 'center' | 'apart' | undefined; // How title and icon are aligned
  icon_side?: 'left' | 'right' | undefined; // Which side the icon appears on

  // State configuration
  default_open?: boolean | undefined;

  // Open/Close Logic
  open_mode?: 'always' | 'every' | 'any' | 'manual' | undefined;
  open_conditions?: DisplayCondition[] | undefined;

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
}

// Tab Section for Tabs Module
export interface TabSection {
  id: string;
  title: string;
  icon?: string | undefined;
  modules: CardModule[];
}

// Tabs Layout Module
export interface TabsModule extends BaseModule {
  type: 'tabs';
  sections: TabSection[];

  // Orientation and style
  orientation?: 'horizontal' | 'vertical' | undefined;
  style?:
    | 'default'
    | 'simple'
    | 'simple_2'
    | 'simple_3'
    | 'switch_1'
    | 'switch_2'
    | 'switch_3'
    | 'modern'
    | 'trendy'
    | undefined;
  alignment?: 'left' | 'center' | 'right' | 'stretch' | undefined;
  tab_position?: 'top' | 'bottom' | 'left' | 'right' | undefined;

  // Behavior
  switch_on_hover?: boolean | undefined;
  default_tab?: string | undefined; // ID of the default active tab

  // Responsive options
  wrap_tabs?: boolean | undefined; // Allow tabs to wrap to multiple lines
  mobile_icons_only?: boolean | undefined; // Show only icons on mobile/narrow screens
  mobile_breakpoint?: number | undefined; // Breakpoint in pixels for mobile mode (default 600)

  // Typography
  font_size?: string | undefined;
  font_weight?: string | undefined;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | undefined;

  // Tab Design
  tab_gap?: number | undefined;
  tab_padding?: string | undefined;
  active_tab_color?: string | undefined;
  active_tab_background?: string | undefined;
  active_tab_border_color?: string | undefined;
  inactive_tab_color?: string | undefined;
  inactive_tab_background?: string | undefined;
  inactive_tab_border_color?: string | undefined;
  hover_tab_color?: string | undefined;
  hover_tab_background?: string | undefined;
  tab_border_radius?: string | undefined;
  tab_border_width?: number | undefined;
  track_background?: string | undefined;
  icon_color?: string | undefined;

  // Content area design
  content_background?: string | undefined;
  content_padding?: string | undefined;
  content_border_radius?: string | undefined;
  content_border_color?: string | undefined;
  content_border_width?: number | undefined;

  // Animation
  transition_duration?: string | undefined;

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
}

// Popup Layout Module
export interface PopupModule extends BaseModule {
  type: 'popup';
  modules: CardModule[];

  // Title configuration
  show_title?: boolean | undefined;
  title_mode?: 'custom' | 'entity' | undefined;
  title_text?: string | undefined;
  title_entity?: string | undefined;
  show_entity_name?: boolean | undefined;

  // Trigger configuration
  trigger_type?: 'button' | 'image' | 'icon' | 'page_load' | 'logic' | 'module' | undefined;
  trigger_module_id?: string | undefined; // ID of the module that triggers this popup
  trigger_button_text?: string | undefined;
  trigger_button_icon?: string | undefined;
  trigger_image_type?: 'upload' | 'entity' | 'url' | undefined;
  trigger_image_url?: string | undefined;
  trigger_image_entity?: string | undefined;
  trigger_icon?: string | undefined;

  // Trigger styling
  trigger_alignment?: 'left' | 'center' | 'right' | undefined;
  trigger_button_full_width?: boolean | undefined;
  trigger_image_full_width?: boolean | undefined;
  trigger_icon_size?: number | undefined;
  trigger_icon_color?: string | undefined;

  // Trigger button styling (mirrors ButtonModule styling options)
  trigger_button_style?:
    | 'flat'
    | 'glossy'
    | 'embossed'
    | 'inset'
    | 'gradient-overlay'
    | 'neon-glow'
    | 'outline'
    | 'glass'
    | 'metallic'
    | undefined;
  trigger_button_background_color?: string | undefined;
  trigger_button_text_color?: string | undefined;
  trigger_button_icon_position?: 'before' | 'after' | undefined;
  trigger_button_icon_size?: string | undefined;
  trigger_button_use_entity_color?: boolean | undefined;
  trigger_button_color_entity?: string | undefined;
  trigger_button_state_colors?: { [state: string]: string } | undefined;

  // Layout settings
  layout?: 'default' | 'full_screen' | 'left_panel' | 'right_panel' | 'top_panel' | 'bottom_panel' | undefined;
  animation?:
    | 'fade'
    | 'scale_up'
    | 'scale_down'
    | 'slide_top'
    | 'slide_left'
    | 'slide_right'
    | 'slide_bottom'
    | undefined;

  // Popup styling
  popup_width?: string | undefined; // '600px', '100%', '14rem', '10vw'
  popup_padding?: string | undefined; // '5%', '20px', '1rem', '2vw'
  popup_border_radius?: string | undefined; // '5px', '50%', '0.3em', '12px 0'

  // Close button configuration
  close_button_position?: 'inside' | 'none' | undefined;
  close_button_color?: string | undefined;
  close_button_size?: number | undefined;
  close_button_icon?: string | undefined;
  close_button_offset_x?: string | undefined;
  close_button_offset_y?: string | undefined;

  // Auto-close timer
  auto_close_timer_enabled?: boolean | undefined;
  auto_close_timer_seconds?: number | undefined;

  // Colors
  title_background_color?: string | undefined;
  title_text_color?: string | undefined;
  popup_background_color?: string | undefined;
  popup_text_color?: string | undefined;
  show_overlay?: boolean | undefined;
  overlay_background?: string | undefined;

  // Trigger Logic (for logic-based popup triggering)
  trigger_mode?: 'every' | 'any' | 'manual' | undefined;
  trigger_conditions?: DisplayCondition[] | undefined;
  auto_close?: boolean | undefined; // For logic triggers: auto-hide when conditions become false

  // Default state
  default_open?: boolean | undefined;
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
  show_pagination?: boolean | undefined;
  pagination_style?:
    | 'dots'
    | 'dots-and-dash'
    | 'dash-lines'
    | 'numbers'
    | 'thumbnails'
    | 'fraction'
    | 'progressbar'
    | 'scrollbar'
    | 'dynamic'
    | undefined;
  pagination_position?: 'top' | 'bottom' | 'left' | 'right' | undefined;
  pagination_color?: string | undefined;
  pagination_active_color?: string | undefined;
  pagination_size?: number | undefined;
  pagination_overlay?: boolean | undefined; // Whether pagination overlays content or gets its own space

  // Navigation Arrows Configuration
  show_arrows?: boolean | undefined;
  arrow_position_offset?: number | undefined; // Offset for arrow position (positive = more inside, negative = more outside)
  arrow_style?: 'default' | 'circle' | 'square' | 'minimal' | undefined;
  arrow_size?: number | undefined;
  arrow_color?: string | undefined;
  arrow_background_color?: string | undefined;
  prev_arrow_icon?: string | undefined;
  next_arrow_icon?: string | undefined;
  arrows_always_visible?: boolean | undefined;

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
  transition_speed?: number | undefined;

  // Auto-play Configuration
  auto_play?: boolean | undefined;
  auto_play_delay?: number | undefined;
  pause_on_hover?: boolean | undefined;
  loop?: boolean | undefined;

  // Interaction Configuration
  allow_swipe?: boolean | undefined;
  allow_keyboard?: boolean | undefined;
  allow_mousewheel?: boolean | undefined;

  // Layout Configuration
  slider_direction?: 'horizontal' | 'vertical' | undefined;
  centered_slides?: boolean | undefined;
  slider_height?: number | undefined;
  auto_height?: boolean | undefined; // When true, slider adjusts to content height (default: true)
  slider_width?: string | undefined;
  gap?: number | undefined;
  slides_per_view?: number | undefined;
  space_between?: number | undefined;
  vertical_alignment?: 'top' | 'center' | 'bottom' | 'stretch' | undefined;

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
}

// Slider Control Module (Entity Control)
// Slider Bar Configuration
export interface SliderBar {
  id: string;
  type: 'numeric' | 'brightness' | 'rgb' | 'color_temp' | 'red' | 'green' | 'blue' | 'attribute';
  entity: string;
  attribute?: string | undefined; // For attribute type
  name?: string | undefined; // Override label
  min_value?: number | undefined;
  max_value?: number | undefined;
  step?: number | undefined;

  // Individual bar visibility controls (optional, falls back to global)
  show_icon?: boolean | undefined;
  show_name?: boolean | undefined;
  show_value?: boolean | undefined;

  // Individual bar positioning controls (optional, falls back to global)
  outside_text_position?: 'left' | 'right' | undefined;
  outside_name_position?:
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right'
    | 'top'
    | 'middle'
    | 'bottom'
    | undefined;
  outside_value_position?:
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right'
    | 'top'
    | 'middle'
    | 'bottom'
    | undefined;
  split_bar_position?: 'left' | 'right' | undefined;
  split_bar_length?: number | undefined; // Percentage 0-100, default 60
  overlay_name_position?: 'top' | 'middle' | 'bottom' | undefined;
  overlay_value_position?: 'top' | 'middle' | 'bottom' | undefined;
  overlay_icon_position?: 'top' | 'middle' | 'bottom' | undefined;

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
    | 'right_bottom'
    | undefined; // Vertical Outside

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
    | 'right_bottom'
    | undefined; // Vertical Outside

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
    | 'right_bottom'
    | undefined; // Vertical Outside

  // For split mode - where content section is positioned relative to bar
  info_section_position?: 'left' | 'right' | 'top' | 'bottom' | undefined;

  // Per-bar styling overrides (optional, falls back to global)
  slider_height?: number | undefined;
  slider_track_color?: string | undefined;
  slider_fill_color?: string | undefined;
  dynamic_fill_color?: boolean | undefined;

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
    | 'minimal'
    | undefined;
  glass_blur_amount?: number | undefined;
  slider_radius?: 'square' | 'round' | 'pill' | undefined;
  border_radius?: number | undefined;

  // Additional Color properties (optional, falls back to global)
  use_gradient?: boolean | undefined;
  gradient_stops?: Array<{
    id: string;
    position: number;
    color: string;
  }>;
  auto_contrast?: boolean | undefined;

  // Display Element properties (optional, falls back to global)
  icon?: string | undefined;
  icon_size?: number | undefined;
  icon_color?: string | undefined;
  dynamic_icon?: boolean | undefined;
  icon_as_toggle?: boolean | undefined;

  // Name display properties (optional, falls back to global)
  name_size?: number | undefined;
  name_color?: string | undefined;
  name_bold?: boolean | undefined;

  // Value display properties (optional, falls back to global)
  value_size?: number | undefined;
  value_color?: string | undefined;
  value_suffix?: string | undefined;
  show_bar_label?: boolean | undefined;

  // Animation properties (optional, falls back to global)
  animate_on_change?: boolean | undefined;
  transition_duration?: number | undefined;
  haptic_feedback?: boolean | undefined;

  // Direction control
  invert_direction?: boolean | undefined; // Reverse min/max positions (useful for curtains)
}

export interface SliderControlModule extends BaseModule {
  type: 'slider_control';

  // Multi-bar Configuration
  bars: SliderBar[];

  // Orientation
  orientation?: 'horizontal' | 'vertical' | undefined;

  // Layout Mode
  layout_mode?: 'overlay' | 'split' | 'outside' | undefined;

  // Overlay Mode Settings (when bar has info overlaid on top)
  overlay_position?: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | undefined;
  overlay_name_position?: 'top' | 'middle' | 'bottom' | undefined;
  overlay_value_position?: 'top' | 'middle' | 'bottom' | undefined;
  overlay_icon_position?: 'top' | 'middle' | 'bottom' | undefined;

  // Outside Mode Settings (when info is positioned outside the slider vertically)
  outside_text_position?: 'left' | 'right' | undefined;
  outside_name_position?:
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right'
    | 'top'
    | 'middle'
    | 'bottom'
    | undefined;
  outside_value_position?:
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right'
    | 'top'
    | 'middle'
    | 'bottom'
    | undefined;

  // Split Mode Settings (bar and info are separate horizontally)
  split_bar_position?: 'left' | 'right' | undefined;
  split_info_position?: 'left' | 'center' | 'right' | undefined;
  split_bar_length?: number | undefined; // Percentage 0-100, default 60

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
    | 'minimal'
    | undefined;

  // Slider Appearance
  slider_height?: number | undefined; // Height for horizontal, width for vertical
  bar_spacing?: number | undefined; // Spacing between multiple bars
  slider_radius?: 'square' | 'round' | 'pill' | undefined;
  border_radius?: number | undefined;
  slider_track_color?: string | undefined;
  slider_fill_color?: string | undefined;
  dynamic_fill_color?: boolean | undefined; // Use entity color (for RGB lights, etc.)
  glass_blur_amount?: number | undefined; // For glass style

  // Gradient Fill Support
  use_gradient?: boolean | undefined;
  gradient_stops?: Array<{
    id: string;
    position: number;
    color: string;
  }>;

  // Display Elements
  show_icon?: boolean | undefined;
  icon?: string | undefined;
  icon_size?: number | undefined;
  icon_color?: string | undefined;
  dynamic_icon?: boolean | undefined; // Use entity's default icon
  icon_as_toggle?: boolean | undefined; // Make icon clickable to toggle entity on/off
  auto_contrast?: boolean | undefined; // Automatically adjust text/icon color based on fill color

  show_name?: boolean | undefined;
  name_size?: number | undefined;
  name_color?: string | undefined;
  name_bold?: boolean | undefined;

  show_state?: boolean | undefined;
  state_size?: number | undefined;
  state_color?: string | undefined;
  state_bold?: boolean | undefined;
  state_format?: string | undefined; // Format string for state display

  show_value?: boolean | undefined; // Show numeric value
  value_size?: number | undefined;
  value_color?: string | undefined;
  value_suffix?: string | undefined; // e.g., '%', '°C'
  show_bar_label?: boolean | undefined; // Show bar label (e.g., "Brightness", "RGB Color")

  // Toggle Integration
  show_toggle?: boolean | undefined;
  toggle_position?: 'left' | 'right' | 'top' | 'bottom' | undefined;
  toggle_size?: number | undefined;
  toggle_color_on?: string | undefined;
  toggle_color_off?: string | undefined;

  // Light-specific Color Control
  show_color_picker?: boolean | undefined; // For lights - show RGB color picker
  color_picker_position?: 'below' | 'right' | undefined;
  color_picker_size?: 'small' | 'medium' | 'large' | undefined;

  // Animation & Interaction
  animate_on_change?: boolean | undefined;
  transition_duration?: number | undefined; // Renamed to avoid conflict with BaseModule's animation_duration
  haptic_feedback?: boolean | undefined;

  // Direction control
  invert_direction?: boolean | undefined; // Global default for slider direction inversion

  // Legacy support for backward compatibility
  entity?: string | undefined; // Deprecated - use bars array instead
  name?: string | undefined; // Deprecated - use bars array instead
  attribute?: string | undefined; // Deprecated - use bars array instead
  min_value?: number | undefined; // Deprecated - use bars array instead
  max_value?: number | undefined; // Deprecated - use bars array instead
  step?: number | undefined; // Deprecated - use bars array instead
  light_control_mode?: 'brightness' | 'color_temp' | 'rgb' | 'both' | 'all' | undefined; // Deprecated
  light_slider_order?: string[] | undefined; // Deprecated
  cover_invert?: boolean | undefined; // Deprecated
  control_attribute?: string | undefined; // Deprecated

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Button Module
export interface ButtonModule extends BaseModule {
  type: 'button';
  label: string;
  action?: LinkAction | undefined; // Legacy support
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
    | 'dots'
    | undefined;
  alignment?: 'left' | 'center' | 'right' | 'justify' | undefined;
  show_icon?: boolean | undefined;
  icon?: string | undefined;
  icon_position?: 'before' | 'after' | undefined;
  icon_size?: string | number | undefined;
  background_color?: string | undefined;
  text_color?: string | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
  // Entity-based background color
  use_entity_color?: boolean | undefined;
  background_color_entity?: string | undefined;
  background_state_colors?: { [state: string]: string } | undefined; // e.g., { "on": "#4CAF50", "off": "#666666" }
}

// Spinbox Module (number input with +/- buttons)
export interface SpinboxModule extends BaseModule {
  type: 'spinbox';
  // Entity configuration
  entity?: string | undefined;
  // Value configuration
  value?: number | undefined;
  min_value: number;
  max_value: number;
  step: number;
  // Display configuration
  unit?: string | undefined;
  show_unit?: boolean | undefined;
  layout?: 'horizontal' | 'vertical' | undefined;
  show_value?: boolean | undefined;
  value_position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | undefined;
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
    | 'metallic'
    | undefined;
  button_shape?: 'rounded' | 'square' | 'circle' | undefined;
  button_size?: number | undefined;
  button_spacing?: number | undefined;
  button_gap?: number | undefined;
  increment_icon?: string | undefined;
  decrement_icon?: string | undefined;
  button_background_color?: string | undefined;
  button_text_color?: string | undefined;
  // Value display configuration
  value_color?: string | undefined;
  value_font_size?: number | undefined;
  // Unified template system
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  ignore_entity_state_config?: boolean | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
}

// Markdown Module
export interface MarkdownModule extends BaseModule {
  type: 'markdown';
  markdown_content: string;
  link?: string | undefined; // Legacy support
  hide_if_no_link?: boolean | undefined;
  // Unified template system
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  ignore_entity_state_config?: boolean | undefined;
  // Styling options
  font_size?: number | undefined;
  font_family?: string | undefined;
  color?: string | undefined;
  alignment?: 'left' | 'center' | 'right' | 'justify' | undefined;
  line_height?: number | undefined;
  letter_spacing?: string | undefined;
  // Markdown specific options
  enable_html?: boolean | undefined;
  enable_tables?: boolean | undefined;
  enable_code_highlighting?: boolean | undefined;
  max_height?: string | undefined;
  overflow_behavior?: 'scroll' | 'hidden' | 'visible' | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Camera Module
export interface CameraModule extends BaseModule {
  type: 'camera';

  // Core camera properties
  entity: string;
  camera_name?: string | undefined;
  show_name?: boolean | undefined;
  name_position?:
    | 'top-left'
    | 'top-middle'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-middle'
    | 'bottom-right'
    | 'center'
    | undefined;

  // Fullscreen controls
  tap_opens_fullscreen?: boolean | undefined;

  // Display settings
  width?: number | undefined;
  height?: number | undefined;
  aspect_ratio_linked?: boolean | undefined;
  aspect_ratio_value?: number | undefined; // Stored as width/height ratio
  image_fit?: 'cover' | 'contain' | 'fill' | 'scale-down' | undefined;
  border_radius?: string | undefined;

  // Crop settings (percentage values)
  crop_left?: number | undefined;
  crop_top?: number | undefined;
  crop_right?: number | undefined;
  crop_bottom?: number | undefined;

  // Camera controls
  show_controls?: boolean | undefined;

  // Stream mode - controls how camera feed is displayed
  view_mode?: 'auto' | 'live' | 'snapshot' | undefined;

  // Snapshot refresh settings (only used when view_mode === 'snapshot')
  refresh_interval?: number | undefined; // 1-300 seconds

  // Legacy properties (deprecated, migrated to view_mode)
  auto_refresh?: boolean | undefined;
  live_view?: boolean | undefined;

  // Image quality
  image_quality?: 'high' | 'medium' | 'low' | undefined;

  // Rotation
  rotation?: number | undefined;

  // Audio settings (only used when view_mode === 'live' or auto upgrades to live)
  audio_enabled?: boolean | undefined;

  // Error handling
  show_unavailable?: boolean | undefined;
  fallback_image?: string | undefined;

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;

  // Unified template system
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  ignore_entity_state_config?: boolean | undefined;
  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Graph Entity Configuration
export interface GraphEntityConfig {
  id: string;
  entity: string;
  name?: string | undefined;
  attribute?: string | undefined;
  // Forecast-specific attribute mapping
  forecast_attribute?:
    | 'temperature'
    | 'precipitation'
    | 'wind_speed'
    | 'humidity'
    | 'pressure'
    | 'cloud_coverage'
    | string
    | undefined;
  color?: string | undefined;
  chart_type_override?: string | undefined;
  show_points?: boolean | undefined;
  fill_area?: boolean | undefined;
  line_width?: number | undefined;
  line_style?: 'solid' | 'dashed' | 'dotted' | undefined;
  // When true, this entity provides the header/icon/value for the card
  is_primary?: boolean | undefined;
  // Pie/Donut: whether to show the entity name inside its slice
  label_show_name?: boolean | undefined;
  // Pie/Donut: whether to show the entity value inside its slice
  label_show_value?: boolean | undefined;
}

// Graphs Module
export interface GraphsModule extends BaseModule {
  type: 'graphs';

  // Data source selection
  data_source?: 'history' | 'forecast' | undefined; // defaults to 'history' for backward compatibility

  // Forecast configuration
  forecast_type?: 'hourly' | 'daily' | undefined; // for weather.get_forecasts
  forecast_entity?: string | undefined; // weather entity for forecasts
  forecast_display_hours?: number | undefined; // Limit forecast x-axis to N hours (0 = unlimited, default)
  forecast_display_days?: number | undefined; // Limit forecast x-axis to N days (0 = unlimited, default)

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
  custom_time_start?: string | undefined;
  custom_time_end?: string | undefined;

  // Chart appearance
  show_title?: boolean | undefined;
  title?: string | undefined;
  title_size?: number | undefined;
  title_color?: string | undefined;
  // Alignment of chart within its container
  chart_alignment?: 'left' | 'center' | 'right' | undefined;

  show_legend?: boolean | undefined;

  // Scale options
  normalize_values?: boolean | undefined;
  use_fixed_y_axis?: boolean | undefined;
  legend_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | undefined;

  show_grid?: boolean | undefined;
  show_grid_values?: boolean | undefined;
  show_time_intervals?: boolean | undefined;
  grid_color?: string | undefined;
  chart_layout?: 'default' | 'full' | undefined;

  background_color?: string | undefined;
  // Width can be CSS length or percentage (e.g., '100%', 'auto', '320px')
  chart_width?: string | undefined;
  chart_height?: number | undefined;

  // Header/info overlay position
  info_position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'middle' | undefined;
  // Toggle whether to render info overlay at all
  show_info_overlay?: boolean | undefined;
  // Control individual parts of the overlay
  show_display_name?: boolean | undefined;
  show_entity_value?: boolean | undefined;

  // Axis configuration
  show_x_axis?: boolean | undefined;
  x_axis_label?: string | undefined;
  x_axis_color?: string | undefined;
  x_axis_grid?: boolean | undefined;

  show_y_axis?: boolean | undefined;
  y_axis_label?: string | undefined;
  y_axis_color?: string | undefined;
  y_axis_min?: number | undefined;
  y_axis_max?: number | undefined;
  y_axis_grid?: boolean | undefined;

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
    | 'delta'
    | undefined;
  data_points_limit?: number | undefined;
  smooth_curves?: boolean | undefined;

  // Animation
  enable_animation?: boolean | undefined;
  animation_duration?: string | undefined;

  // Interactivity
  enable_zoom?: boolean | undefined;
  enable_pan?: boolean | undefined;
  show_tooltips?: boolean | undefined;
  // Control labels inside slices globally is deprecated in favor of per-entity
  // show_slice_labels?: boolean;

  // Chart-specific options
  // Line/Area
  line_tension?: number | undefined;
  fill_opacity?: number | undefined;
  show_points?: boolean | undefined;
  point_radius?: number | undefined;

  // Bar/Histogram
  bar_width?: number | undefined;
  bar_spacing?: number | undefined;
  bar_display_limit?: number | undefined; // Max bars to display (0 = unlimited, default)
  stacked?: boolean | undefined;
  horizontal?: boolean | undefined;

  // Pie/Donut
  inner_radius?: number | undefined;
  start_angle?: number | undefined;
  show_percentages?: boolean | undefined;
  explode_slices?: boolean | undefined;
  // Gap between slices (in degrees or px-equivalent)
  slice_gap?: number | undefined;
  // Show labels inside slices (name and value)
  show_slice_labels?: boolean | undefined;

  // Scatter/Bubble
  point_size?: number | undefined;
  point_opacity?: number | undefined;
  show_regression?: boolean | undefined;
  bubble_scale?: number | undefined;

  // Radar
  scale_min?: number | undefined;
  scale_max?: number | undefined;
  grid_levels?: number | undefined;
  point_style?: 'circle' | 'triangle' | 'rect' | 'star' | undefined;

  // Heatmap
  cell_padding?: number | undefined;
  color_scheme?: 'viridis' | 'plasma' | 'inferno' | 'magma' | 'blues' | 'reds' | 'greens' | 'greys' | undefined;
  show_values?: boolean | undefined;
  value_format?: string | undefined;

  // Waterfall
  positive_color?: string | undefined;
  negative_color?: string | undefined;
  total_color?: string | undefined;
  connector_color?: string | undefined;

  // Combo
  primary_axis?: 'left' | 'right' | undefined;
  secondary_axis?: 'left' | 'right' | 'none' | undefined;
  sync_axes?: boolean | undefined;

  // Auto-refresh
  auto_refresh?: boolean | undefined;
  refresh_interval?: number | undefined;

  // Unified template system
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  ignore_entity_state_config?: boolean | undefined;

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;

  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Dropdown Module
export interface DropdownModule extends BaseModule {
  type: 'dropdown';

  // Source Mode
  source_mode?: 'manual' | 'entity' | undefined; // 'manual' = user-defined options, 'entity' = from select/input_select entity
  source_entity?: string | undefined; // Entity ID for select or input_select (when source_mode is 'entity')

  // Basic Configuration
  placeholder?: string | undefined;

  // Dropdown Options
  options: DropdownOption[]; // Used when source_mode is 'manual'

  // Entity Option Customization (optional customization when using entity source)
  entity_option_customization?: Record<
    string,
    {
      icon?: string | undefined;
      icon_color?: string | undefined;
      use_state_color?: boolean | undefined;
    }
  >;

  // State Tracking
  current_selection?: string | undefined; // Tracks the currently selected option label
  track_state?: boolean | undefined; // Whether to track and display current selection

  // Closed Dropdown Title Configuration
  closed_title_mode?: 'last_chosen' | 'entity_state' | 'custom' | 'first_option' | undefined; // How to display closed dropdown title
  closed_title_entity?: string | undefined; // Entity to use for entity_state mode
  closed_title_custom?: string | undefined; // Custom text for custom mode

  // Dynamic templates
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;

  // Control icon customization
  control_icon?: string | undefined;
  control_alignment?: 'center' | 'apart' | undefined;
  control_icon_side?: 'left' | 'right' | undefined;

  // Dropdown display options
  visible_items?: number | undefined; // Number of items visible in dropdown before scrolling (1-20)

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;

  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Light Module
export interface LightModule extends BaseModule {
  type: 'light';

  // Presets Configuration
  presets: Array<{
    id: string;
    name: string; // Display name/label for the preset
    action?: 'turn_on' | 'turn_off' | 'toggle' | undefined; // Action type for this preset
    icon?: string | undefined; // Optional icon for button/icon display
    entities: string[]; // Entities this preset applies to
    brightness?: number | undefined; // 0-255
    color_temp?: number | undefined; // Mired value
    rgb_color?: number[] | undefined; // [r, g, b]
    hs_color?: number[] | undefined; // [hue, saturation]
    xy_color?: number[] | undefined; // [x, y]
    rgbw_color?: number[] | undefined; // [r, g, b, w]
    rgbww_color?: number[] | undefined; // [r, g, b, ww, cw]
    white?: number | undefined; // White value 0-255
    effect?: string | undefined; // Effect name
    effect_speed?: number | undefined; // Effect speed (WLED: 0-255)
    effect_intensity?: number | undefined; // Effect intensity (WLED: 0-255)
    effect_reverse?: boolean | undefined; // Reverse effect direction (WLED)
    transition_time?: number | undefined; // Override transition time for this preset
    // Visual customization
    text_color?: string | undefined; // Custom text color
    icon_color?: string | undefined; // Custom icon color
    button_color?: string | undefined; // Custom button background color
    use_light_color_for_icon?: boolean | undefined; // Use current light color for icon
    use_light_color_for_button?: boolean | undefined; // Use current light color for button
    use_icon_color_for_text?: boolean | undefined; // Use icon color for text
    smart_color?: boolean | undefined; // Auto-contrast text based on button background
    // Per-preset styling
    button_style?: 'filled' | 'outlined' | 'text' | undefined; // Button visual style for this preset
    show_label?: boolean | undefined; // Show preset name for this preset
    border_radius?: number | undefined; // Button border radius (0-50)
  }>;

  // Display Configuration
  layout?: 'buttons' | 'grid' | undefined; // How to display presets
  button_alignment?:
    | 'left'
    | 'center'
    | 'right'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | undefined; // Button alignment
  allow_wrapping?: boolean | undefined; // Allow buttons to wrap to next line
  button_gap?: number | undefined; // Gap between buttons in rem
  columns?: number | undefined; // Number of columns for grid layout
  show_labels?: boolean | undefined; // Show preset names (global fallback)
  button_style?: 'filled' | 'outlined' | 'text' | undefined; // Button visual style (global fallback)

  // Global Settings
  default_transition_time?: number | undefined; // Default transition time for all presets

  // Advanced Options
  confirm_actions?: boolean | undefined; // Show confirmation before applying presets
  show_feedback?: boolean | undefined; // Show visual feedback when presets are applied

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;

  // Hover effects
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// Map marker type for individual pins
export interface MapMarker {
  id: string;
  name: string;
  type: 'manual' | 'entity'; // Manual coordinates or entity-based

  // Manual marker properties
  latitude?: number | undefined;
  longitude?: number | undefined;

  // Entity marker properties
  entity?: string | undefined;

  // Visual customization
  icon?: string | undefined;
  icon_color?: string | undefined;
  icon_size?: number | undefined; // Size in pixels for icon markers
  marker_image_type?: 'icon' | 'custom_image' | 'entity_image' | undefined;
  marker_image?: string | undefined; // Custom image URL or upload
  use_entity_picture?: boolean | undefined; // Use entity's entity_picture attribute
}

// Map Module
export interface MapModule extends BaseModule {
  type: 'map';

  // Map provider
  map_provider: 'openstreetmap' | 'google';
  google_api_key?: string | undefined; // Optional API key for Google Maps JavaScript API

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
  manual_center_latitude?: number | undefined;
  manual_center_longitude?: number | undefined;

  // Markers list
  markers: MapMarker[];

  // Map dimensions
  map_height?: number | undefined; // Height in pixels
  aspect_ratio?: '16:9' | '4:3' | '1:1' | 'custom' | undefined;

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
}

// Animated Clock Module (PRO)
export interface AnimatedClockModule extends BaseModule {
  type: 'animated_clock';

  // Configuration
  time_format?: '12' | '24' | undefined; // 12 or 24 hour format (default: 12)
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
    | 'terminal'
    | undefined; // Clock display style (default: flip)
  update_frequency?: '1' | '60' | undefined; // Update frequency in seconds (default: 1 = every second)

  // Analog Clock Options (only for analog style)
  analog_show_seconds?: boolean | undefined; // Show seconds hand on analog clock (default: true)
  analog_smooth_seconds?: boolean | undefined; // Smooth sweeping seconds hand vs ticking (default: true)
  analog_show_hour_hand?: boolean | undefined; // Show hour hand (default: true)
  analog_show_minute_hand?: boolean | undefined; // Show minute hand (default: true)
  analog_show_hour_markers?: boolean | undefined; // Show hour markers (default: true)
  analog_show_center_dot?: boolean | undefined; // Show center dot (default: true)
  analog_show_numbers?: boolean | undefined; // Show clock numbers 1-12 (default: false)
  analog_show_hour_ticks?: boolean | undefined; // Show hour tick marks (12 major ticks) (default: false)
  analog_show_minute_ticks?: boolean | undefined; // Show minute tick marks (48 minor ticks) (default: false)
  analog_hour_hand_color?: string | undefined; // Hour hand color (default: clock_color)
  analog_minute_hand_color?: string | undefined; // Minute hand color (default: clock_color)
  analog_second_hand_color?: string | undefined; // Second hand color (default: #ff4444)
  analog_hour_marker_color?: string | undefined; // Hour marker color (default: clock_color)
  analog_center_dot_color?: string | undefined; // Center dot color (default: clock_color)
  analog_numbers_color?: string | undefined; // Clock numbers color (default: clock_color)
  analog_hour_ticks_color?: string | undefined; // Hour tick marks color (default: clock_color)
  analog_minute_ticks_color?: string | undefined; // Minute tick marks color (default: clock_color)
  analog_face_outline_color?: string | undefined; // Clock face outline color (default: clock_color)
  analog_face_background_color?: string | undefined; // Clock face background color (default: clock_background)
  analog_face_background_type?: 'color' | 'entity' | 'upload' | 'url' | undefined; // Background type (default: color)
  analog_face_background_image_entity?: string | undefined; // Entity ID for entity image background
  analog_face_background_image_upload?: string | undefined; // Uploaded image path
  analog_face_background_image_url?: string | undefined; // Image URL for background
  analog_face_background_size?: string | undefined; // Background size (default: cover)
  analog_face_background_position?: string | undefined; // Background position (default: center)
  analog_face_background_repeat?: string | undefined; // Background repeat (default: no-repeat)

  // Element Visibility Toggles (universal)
  show_hours?: boolean | undefined; // Show hours (default: true)
  show_minutes?: boolean | undefined; // Show minutes (default: true)
  show_seconds?: boolean | undefined; // Show seconds (default: true)
  show_ampm?: boolean | undefined; // Show AM/PM (default: true)
  show_separators?: boolean | undefined; // Show time separators like : (default: true)

  // Style-specific Visibility Toggles
  show_labels?: boolean | undefined; // Show labels (e.g., H M S in binary) (default: true)
  show_prefix?: boolean | undefined; // Show prefix text (e.g., "It is" in text clock) (default: true)
  show_prompt?: boolean | undefined; // Show terminal prompt (default: true)
  show_command?: boolean | undefined; // Show terminal command (default: true)
  show_cursor?: boolean | undefined; // Show terminal cursor (default: true)

  // Styling
  clock_size?: number | undefined; // Clock digit size in pixels (default: 48)
  clock_color?: string | undefined; // Clock digit color (default: primary-text-color)
  clock_background?: string | undefined; // Clock card background (default: card-background-color)

  // Flip Clock Options
  flip_tile_color?: string | undefined; // Flip tile background color (default: rgba(0, 0, 0, 0.5))
  flip_hours_color?: string | undefined; // Color for hours (default: clock_color)
  flip_minutes_color?: string | undefined; // Color for minutes (default: clock_color)
  flip_separator_color?: string | undefined; // Color for separators (default: clock_color)
  flip_ampm_color?: string | undefined; // Color for AM/PM (default: clock_color)

  // Digital LED Clock Options
  digital_background_color?: string | undefined; // Digital display background color (default: #000)
  digital_hours_color?: string | undefined; // Hours color (default: #ff3333)
  digital_minutes_color?: string | undefined; // Minutes color (default: #ff3333)
  digital_seconds_color?: string | undefined; // Seconds color (default: #ff3333)
  digital_separator_color?: string | undefined; // Separator color (default: #ff3333)
  digital_ampm_color?: string | undefined; // AM/PM color (default: #33ff33)
  digital_glow_color?: string | undefined; // Glow color (default: #ff0000)

  // Binary Clock Options
  binary_hours_empty_color?: string | undefined; // Empty hour dots color (default: rgba(128, 128, 128, 0.2))
  binary_hours_filled_color?: string | undefined; // Filled hour dots color (default: clock_color)
  binary_minutes_empty_color?: string | undefined; // Empty minute dots color (default: rgba(128, 128, 128, 0.2))
  binary_minutes_filled_color?: string | undefined; // Filled minute dots color (default: clock_color)
  binary_seconds_empty_color?: string | undefined; // Empty second dots color (default: rgba(128, 128, 128, 0.2))
  binary_seconds_filled_color?: string | undefined; // Filled second dots color (default: clock_color)
  binary_separator_color?: string | undefined; // Separator color (default: clock_color)
  binary_hours_label_color?: string | undefined; // HH label color (default: clock_color)
  binary_minutes_label_color?: string | undefined; // MM label color (default: clock_color)
  binary_seconds_label_color?: string | undefined; // SS label color (default: clock_color)

  // Minimal Clock Options
  minimal_hours_color?: string | undefined; // Hours color (default: clock_color)
  minimal_minutes_color?: string | undefined; // Minutes color (default: clock_color)
  minimal_seconds_color?: string | undefined; // Seconds color (default: clock_color)
  minimal_separator_color?: string | undefined; // Separator color (default: clock_color)
  minimal_ampm_color?: string | undefined; // AM/PM color (default: clock_color)

  // Retro 7-Segment Clock Options
  retro_background_color?: string | undefined; // Display background color (default: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%))
  retro_hours_tile_color?: string | undefined; // Hours tile background (default: rgba(0, 0, 0, 0.3))
  retro_minutes_tile_color?: string | undefined; // Minutes tile background (default: rgba(0, 0, 0, 0.3))
  retro_seconds_tile_color?: string | undefined; // Seconds tile background (default: rgba(0, 0, 0, 0.3))
  retro_separator_tile_color?: string | undefined; // Separator tile background (default: rgba(0, 0, 0, 0.3))
  retro_hours_color?: string | undefined; // Hours digit color (default: #ffa500)
  retro_minutes_color?: string | undefined; // Minutes digit color (default: #ffa500)
  retro_seconds_color?: string | undefined; // Seconds digit color (default: #ffa500)
  retro_separator_color?: string | undefined; // Separator color (default: #ffa500)
  retro_ampm_color?: string | undefined; // AM/PM color (default: #00ff00)

  // Text Clock (word) Options
  text_orientation?: 'horizontal' | 'vertical' | undefined; // Text layout orientation (default: horizontal)
  text_word_gap?: number | undefined; // Gap between words in pixels (default: 8)
  text_prefix_color?: string | undefined; // Color for prefix text (e.g., "It is")
  text_prefix_size?: number | undefined; // Font size for prefix (default: 38)
  text_hours_color?: string | undefined; // Color for hours text
  text_hours_size?: number | undefined; // Font size for hours (default: 48)
  text_minutes_color?: string | undefined; // Color for minutes text
  text_minutes_size?: number | undefined; // Font size for minutes (default: 48)
  text_ampm_color?: string | undefined; // Color for AM/PM text
  text_ampm_size?: number | undefined; // Font size for AM/PM (default: 24)

  // Neon Clock Options
  neon_padding?: number | undefined; // Padding around neon display in em (default: 4)
  neon_hours_color?: string | undefined; // Color for hours (default: #00ffff)
  neon_minutes_color?: string | undefined; // Color for minutes (default: #00ffff)
  neon_seconds_color?: string | undefined; // Color for seconds (default: #00ffff)
  neon_separator_color?: string | undefined; // Color for separators (default: #ff00ff)
  neon_ampm_color?: string | undefined; // Color for AM/PM (default: #00ff00)

  // Material Design Options
  material_vertical_gap?: number | undefined; // Vertical gap between time and seconds in pixels (default: 8)
  material_background_color?: string | undefined; // Card background color (default: clock_background)
  material_hours_color?: string | undefined; // Hours color (default: clock_color)
  material_minutes_color?: string | undefined; // Minutes color (default: clock_color)
  material_seconds_color?: string | undefined; // Seconds color (default: clock_color)
  material_separator_color?: string | undefined; // Separator color (default: clock_color)
  material_ampm_color?: string | undefined; // AM/PM color (default: clock_color)

  // Terminal Clock Options
  terminal_background_color?: string | undefined; // Terminal background color (default: #1e1e1e)
  terminal_line1_color?: string | undefined; // Color for line 1 (prompt) (default: #4ec9b0)
  terminal_line2_color?: string | undefined; // Color for line 2 (command) (default: #ce9178)
  terminal_cursor_color?: string | undefined; // Color for cursor (default: #4ec9b0)
  terminal_hours_color?: string | undefined; // Color for hours (default: #d4d4d4)
  terminal_minutes_color?: string | undefined; // Color for minutes (default: #d4d4d4)
  terminal_seconds_color?: string | undefined; // Color for seconds (default: #d4d4d4)
  terminal_separator_color?: string | undefined; // Color for separators (default: #d4d4d4)
  terminal_ampm_color?: string | undefined; // Color for AM/PM (default: #d4d4d4)
  terminal_vertical_spacing?: number | undefined; // Vertical spacing between lines in pixels (default: 8)
  terminal_line1_size?: number | undefined; // Font size for line 1 in pixels (default: 17)
  terminal_line2_size?: number | undefined; // Font size for line 2 in pixels (default: 17)
  terminal_output_size?: number | undefined; // Font size for output in pixels (default: 38)

  // Global action configuration
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Animated Weather Module (PRO)
export interface AnimatedWeatherModule extends BaseModule {
  type: 'animated_weather';

  // Entity Configuration
  weather_entity?: string | undefined; // weather.* entity (primary)
  temperature_entity?: string | undefined; // Individual sensor fallback
  condition_entity?: string | undefined; // Individual sensor fallback
  custom_entity?: string | undefined; // Optional custom entity to display (shows as "name: state")
  custom_entity_name?: string | undefined; // Custom name override for custom entity display

  // Column Display Toggles
  show_left_column?: boolean | undefined; // Show left column (location/condition/custom) (default: true)
  show_center_column?: boolean | undefined; // Show center column (weather icon) (default: true)
  show_right_column?: boolean | undefined; // Show right column (date/temp/range) (default: true)

  // Layout Configuration
  layout_spread?: number | undefined; // Layout spread percentage 0-100 (0=compact centered, 100=full-width spread, default: 100)
  left_column_gap?: number | undefined; // Vertical gap within left column (default: 8)
  right_column_gap?: number | undefined; // Vertical gap within right column (default: 8)
  temperature_unit?: 'F' | 'C' | undefined; // Temperature unit (default: F)

  // Location Configuration
  location_override_mode?: 'text' | 'entity' | undefined; // How to override location (default: text)
  location_name?: string | undefined; // Text override for location name
  location_entity?: string | undefined; // Entity to use for location (e.g., tracker)

  // Column Order Configuration (for drag-and-drop editor)
  left_column_order?: string[] | undefined; // Custom order of items in left column
  right_column_order?: string[] | undefined; // Custom order of items in right column

  // Left Column Display Toggles
  show_location?: boolean | undefined; // Show location name (default: true)
  show_condition?: boolean | undefined; // Show weather condition (default: true)
  show_custom_entity?: boolean | undefined; // Show custom entity (default: true if entity set)
  show_precipitation?: boolean | undefined; // Show precipitation amount (default: false)
  show_precipitation_probability?: boolean | undefined; // Show precipitation probability (default: false)
  show_wind?: boolean | undefined; // Show wind speed and direction (default: false)
  show_pressure?: boolean | undefined; // Show air pressure (default: false)
  show_visibility?: boolean | undefined; // Show visibility (default: false)

  // Right Column Display Toggles
  show_date?: boolean | undefined; // Show date (default: true)
  show_temperature?: boolean | undefined; // Show main temperature (default: true)
  show_temp_range?: boolean | undefined; // Show high/low range (default: true)

  // Left Column - Text Sizes
  location_size?: number | undefined; // Location text size (default: 16)
  condition_size?: number | undefined; // Weather condition size (default: 24)
  custom_entity_size?: number | undefined; // Custom entity size (default: 18)
  precipitation_size?: number | undefined; // Precipitation text size (default: 14)
  wind_size?: number | undefined; // Wind text size (default: 14)
  pressure_size?: number | undefined; // Pressure text size (default: 14)
  visibility_size?: number | undefined; // Visibility text size (default: 14)

  // Left Column - Colors
  location_color?: string | undefined; // Location text color (default: primary-text-color)
  condition_color?: string | undefined; // Condition text color (default: primary-text-color)
  custom_entity_color?: string | undefined; // Custom entity color (default: primary-text-color)
  precipitation_color?: string | undefined; // Precipitation text color (default: primary-text-color)
  wind_color?: string | undefined; // Wind text color (default: primary-text-color)
  pressure_color?: string | undefined; // Pressure text color (default: primary-text-color)
  visibility_color?: string | undefined; // Visibility text color (default: primary-text-color)

  // Center Column - Icon Styling
  main_icon_size?: number | undefined; // Main weather icon size (default: 120)
  icon_style?: 'fill' | 'line' | undefined; // Icon style: filled or outlined (default: fill)

  // Right Column - Text Sizes
  date_size?: number | undefined; // Date text size (default: 16)
  temperature_size?: number | undefined; // Main temperature size (default: 64)
  temp_range_size?: number | undefined; // High/low range size (default: 18)

  // Right Column - Colors
  date_color?: string | undefined; // Date text color (default: primary-text-color)
  temperature_color?: string | undefined; // Main temperature color (default: primary-text-color)
  temp_range_color?: string | undefined; // High/low temperature color (default: primary-text-color)

  // Styling - Backgrounds
  module_background?: string | undefined; // Overall module background (default: transparent)
  module_border?: string | undefined; // Module border color (default: transparent)

  // Global action configuration
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Animated Forecast Module (PRO)
export interface AnimatedForecastModule extends BaseModule {
  type: 'animated_forecast';

  // Entity Configuration
  weather_entity?: string | undefined; // weather.* entity with forecast data
  forecast_entity?: string | undefined; // forecast.* entity for daily forecast

  // Configuration
  forecast_days?: number | undefined; // Number of forecast days (default: 5, range: 3-7)
  temperature_unit?: 'F' | 'C' | undefined; // Temperature unit (default: F)
  allow_wrap?: boolean | undefined; // Allow forecast days to wrap to new rows

  // Styling - Text Sizes
  forecast_day_size?: number | undefined; // Forecast day name size (default: 14)
  forecast_temp_size?: number | undefined; // Forecast temperature size (default: 14)

  // Styling - Icon
  forecast_icon_size?: number | undefined; // Forecast icon size (default: 48)
  icon_style?: 'fill' | 'line' | undefined; // Icon style: filled or outlined (default: fill)

  // Styling - Colors
  text_color?: string | undefined; // General text color (default: primary-text-color)
  accent_color?: string | undefined; // Accent color for highlights (default: primary-color)
  forecast_day_color?: string | undefined; // Forecast day name color (default: text_color)
  forecast_temp_color?: string | undefined; // Forecast temperature color (default: text_color)

  // Styling - Background
  forecast_background?: string | undefined; // Background for forecast section (default: theme-aware transparent)

  // Global action configuration
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Dropdown option configuration
export interface DropdownOption {
  id: string;
  label: string;
  icon?: string | undefined;
  icon_color?: string | undefined;
  use_state_color?: boolean | undefined; // Use entity state color for icon

  // Action configuration using Home Assistant's native action system
  action: {
    action: 'more-info' | 'toggle' | 'navigate' | 'url' | 'perform-action' | 'assist' | 'nothing';
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    perform_action?: string | undefined;
    service_data?: Record<string, any> | undefined;
    data?: Record<string, any> | undefined;
    target?: {
      entity_id?: string | string[] | undefined;
      device_id?: string | string[] | undefined;
      area_id?: string | string[] | undefined;
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
  entity?: string | undefined;
  attribute?: string | undefined;
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
    | 'no_value'
    | undefined;
  value?: string | number | undefined;
  template?: string | undefined;
  time_from?: string | undefined;
  time_to?: string | undefined;
  // Video config (when condition is true)
  video_source: 'local' | 'url' | 'youtube' | 'vimeo';
  video_url: string;
  loop?: boolean | undefined;
  start_time?: number | undefined;
}

// Global Card Transparency Configuration
export interface GlobalCardTransparency {
  enabled: boolean;
  opacity: number; // 0-100
  blur_px: number; // 0-30
  color?: string | undefined;
}

// Video Background Module (PRO)
export interface VideoBackgroundModule extends BaseModule {
  type: 'video_bg';

  // Core Settings
  enabled: boolean;
  editor_only: boolean;
  controller_id?: string | undefined;
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
  rules?: VideoBackgroundRule[] | undefined;

  // Global Card Transparency
  global_card_transparency: GlobalCardTransparency;
}

// QR Code Module (Pro) - content source and display options
export interface QrCodeModule extends BaseModule {
  type: 'qr_code';
  // Content source: static URL/text, unified template, or entity state/attribute
  content_mode: 'static' | 'entity' | 'unified';
  content_static?: string | undefined; // For static: URL or text to encode
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  content_entity?: string | undefined; // For entity: entity_id
  content_attribute?: string | undefined; // Optional attribute (when content_mode === 'entity')
  // Display
  size: number; // Pixel size (e.g. 128–400), default 200
  alignment?: 'left' | 'center' | 'right' | undefined;
  show_label?: boolean | undefined;
  label_text?: string | undefined;
  label_below?: boolean | undefined;
  // Colors
  fg_color?: string | undefined; // Foreground (default #000000)
  bg_color?: string | undefined; // Background (default #ffffff)
  error_correction?: 'L' | 'M' | 'Q' | 'H' | undefined; // Default 'M'
  qr_margin?: number | undefined; // Quiet zone in modules (0–10), default 1; named to avoid BaseModule.margin
  // Style (qr-code-styling)
  dot_style?: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded' | undefined;
  corner_square_style?: 'square' | 'extra-rounded' | 'dot' | undefined;
  corner_dot_style?: 'square' | 'dot' | undefined;
  // Logo overlay
  logo_enabled?: boolean | undefined;
  /** How the logo image is sourced: url (manual URL), upload (HA media upload), entity, attribute */
  logo_image_type?: 'url' | 'upload' | 'entity' | 'attribute' | undefined;
  logo_url?: string | undefined; // Resolved image URL (also used for upload path)
  logo_image_entity?: string | undefined; // Entity whose picture / state URL is used as logo
  logo_image_attribute?: string | undefined; // Attribute path on logo_image_entity that holds the image URL
  logo_size?: number | undefined; // 0.1–0.4, default 0.25 (fraction of QR size)
  logo_margin?: number | undefined; // Pixels around the logo, default 4
  logo_hide_bg_dots?: boolean | undefined; // Hide QR dots behind logo, default true
  // Actions and logic (standard)
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
  display_mode: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[] | undefined;
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
  weather_entity?: string | undefined; // For automatic mode
  manual_effect?: WeatherEffectType | undefined; // For manual mode

  // Display Settings
  position: 'foreground' | 'background';
  opacity: number; // 0-100

  // Effect-specific Settings
  matrix_rain_color?: string | undefined; // Custom color for matrix rain effect

  // Mobile Settings
  enable_on_mobile: boolean;
  respect_reduced_motion: boolean;
  enable_snow_accumulation?: boolean | undefined;

  // Logic (visibility) defaults
  display_mode: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[] | undefined;
}

// Background Module - Apply custom backgrounds to dashboard view
export interface BackgroundModule extends BaseModule {
  type: 'background';

  // Background source
  background_type: 'none' | 'upload' | 'entity' | 'url';
  background_image?: string | undefined; // For upload/url types
  background_image_entity?: string | undefined; // For entity type

  // Background display settings
  background_size?: 'cover' | 'contain' | 'fill' | 'auto' | undefined;
  background_position?: string | undefined; // e.g., 'center', 'top left', 'bottom right'
  background_repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | undefined;

  // Opacity
  opacity: number; // 0-100

  // Logic (visibility) defaults
  display_mode: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[] | undefined;
}

// Status Summary Entity Configuration
export interface StatusSummaryEntity {
  id: string;
  entity: string;
  label?: string | undefined; // Override display name
  icon?: string | undefined; // Override icon
  show_icon?: boolean | undefined; // Override global show_icon (undefined = use global)
  show_state?: boolean | undefined; // Override global show_state (undefined = use global)
  is_auto_generated?: boolean | undefined; // Flag to indicate this was auto-generated from filters

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

  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
}

// Status Summary Module - Display entity activity with timestamps and color coding
export interface StatusSummaryModule extends BaseModule {
  type: 'status_summary';

  // Entity Management
  entities: StatusSummaryEntity[];

  // Auto-filtering
  enable_auto_filter: boolean;
  include_filters?: string[] | undefined; // Domains or partial names to include (e.g., ['binary_sensor', 'light', 'garage'])
  exclude_filters?: string[] | undefined; // Domains or partial names to exclude (e.g., ['battery', 'update'])

  // Time Filtering
  max_time_since_change?: number | undefined; // In minutes, hide if older

  // Display Options
  title: string;
  show_title: boolean;
  show_last_change_header: boolean;
  show_time_header: boolean;
  sort_by: 'name' | 'last_change' | 'custom';
  sort_direction: 'asc' | 'desc';
  max_items_to_show?: number | undefined; // Maximum number of entities to display (0 = unlimited)

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

  // Default colors (when entity has no custom rules)
  default_text_color: string;
  default_icon_color: string;
  header_text_color: string;
  header_background_color: string;

  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;

  // Actions
  tap_action?: any | undefined;
  hold_action?: any | undefined;
  double_tap_action?: any | undefined;

  // Logic (visibility) defaults
  display_mode: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[] | undefined;
}

// Toggle Point Configuration
export interface TogglePoint {
  id: string;
  label: string;
  icon?: string | undefined;

  // Action configuration (uses HA's native action system)
  tap_action?: ModuleActionConfig | undefined;

  // Entity state matching (for auto-selection)
  match_entity?: string | undefined;
  match_state?: string | string[] | undefined; // Can match multiple states

  // Template-based matching (for advanced conditions like ranges)
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;

  // Styling
  background_color?: string | undefined;
  text_color?: string | undefined;
  active_background_color?: string | undefined;
  active_text_color?: string | undefined;
  border_color?: string | undefined;
  active_border_color?: string | undefined;
}

// Toggle Module - Interactive toggles and multi-state switchers
export interface ToggleModule extends BaseModule {
  type: 'toggle';
  // Toggle points
  toggle_points: TogglePoint[];
  // Visual style
  visual_style:
    | 'ios_toggle'
    | 'segmented'
    | 'button_group'
    | 'slider_track'
    | 'minimal'
    | 'timeline';
  // Tracking
  tracking_entity?: string | undefined; // Entity to watch for state changes
  // Display
  title?: string | undefined;
  show_title?: boolean | undefined;
  orientation?: 'horizontal' | 'vertical' | undefined;
  alignment?: 'left' | 'center' | 'right' | 'justify' | undefined;
  size?: 'compact' | 'normal' | 'large' | undefined;
  spacing?: number | undefined; // Gap between toggle points
  // Icon settings
  show_icons?: boolean | undefined;
  icon_size?: string | undefined;
  icon_position?: 'above' | 'left' | 'right' | 'below' | undefined;
  // Default colors
  default_background_color?: string | undefined;
  default_text_color?: string | undefined;
  default_active_background_color?: string | undefined;
  default_active_text_color?: string | undefined;
  // Actions (for module-level tap, not toggle points)
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
  // Logic (visibility) defaults
  display_mode: 'always' | 'every' | 'any';
  display_conditions?: DisplayCondition[] | undefined;
}

// ============================================
// NAVIGATION MODULE TYPES
// ============================================

export type NavShowLabels = boolean | 'text_only' | 'routes_only';
export type NavAlignment = 'start' | 'center' | 'end' | 'space-between' | 'space-around';
export type NavDeviceMode = 'docked' | 'floating';
export type NavDesktopPosition = 'top' | 'bottom' | 'left' | 'right';
export type NavMobilePosition = 'top' | 'bottom';

export type NavActionConfig = Omit<ModuleActionConfig, 'action'> & {
  action: ActionType | 'open-popup';
  /** Popup module ID to open when action is 'open-popup' */
  popup_id?: string | undefined;
  confirmation?: {
    text?: string | undefined;
  };
};

export interface NavBadgeConfig {
  // Notification source mode
  mode?: 'static' | 'entity' | 'template' | undefined;
  // Entity-based notification (mode: 'entity')
  entity?: string | undefined; // Entity to pull count/state from
  entity_attribute?: string | undefined; // Optional attribute to use instead of state
  // Template-based notification (mode: 'template')
  count_template?: string | undefined; // JS template for dynamic count [[[ return ...; ]]]
  // Static or fallback count (mode: 'static' or when entity/template returns nothing)
  count?: string | undefined;
  // Visibility control
  show?: boolean | string | undefined;
  hide_when_zero?: boolean | undefined; // Hide badge when count is 0 or empty
  // Styling
  color?: string | undefined;
  text_color?: string | undefined;
  // Legacy support
  textColor?: string | undefined;
}

export interface NavRoute {
  id: string;
  url?: string | undefined;
  icon?: string | undefined;
  icon_selected?: string | undefined;
  icon_color?: string | undefined;
  image?: string | undefined;
  image_selected?: string | undefined;
  badge?: NavBadgeConfig | undefined;
  label?: string | undefined;
  selected?: boolean | string | undefined;
  selected_color?: string | undefined;
  tap_action?: NavActionConfig | undefined;
  hold_action?: NavActionConfig | undefined;
  double_tap_action?: NavActionConfig | undefined;
  hidden?: boolean | string | undefined;
}

/** A stack item that can contain child routes */
export interface NavStackItem {
  id: string;
  /** Icon for the stack button */
  icon?: string | undefined;
  icon_color?: string | undefined;
  /** Label for the stack (shown when labels are enabled) */
  label?: string | undefined;
  /** How the stack opens: 'hover' or 'click' (default: 'click') */
  open_mode?: 'hover' | 'click' | undefined;
  /** Stack layout direction: 'auto' adapts to navbar orientation, or force 'horizontal'/'vertical' */
  orientation?: 'auto' | 'horizontal' | 'vertical' | undefined;
  /** Child routes that appear when the stack is opened */
  children: NavRoute[];
  /** Badge configuration */
  badge?: NavBadgeConfig | undefined;
  hidden?: boolean | string | undefined;
}

export interface NavDesktopConfig {
  mode?: NavDeviceMode | undefined;
  show_labels?: NavShowLabels | undefined;
  min_width?: number | undefined;
  position?: NavDesktopPosition | undefined;
  hidden?: boolean | string | undefined;
  /** Offset from edge in pixels for floating mode (0-100, default 16) */
  offset?: number | undefined;
  /** Horizontal/vertical alignment of items within the dock */
  alignment?: NavAlignment | undefined;
}

export interface NavMobileConfig {
  mode?: NavDeviceMode | undefined;
  show_labels?: NavShowLabels | undefined;
  position?: NavMobilePosition | undefined;
  hidden?: boolean | string | undefined;
  /** Offset from edge in pixels for floating mode (0-100, default 16) */
  offset?: number | undefined;
  /** Horizontal/vertical alignment of items within the dock */
  alignment?: NavAlignment | undefined;
}

export interface NavAutoPaddingConfig {
  enabled?: boolean | undefined;
  desktop_px?: number | undefined;
  mobile_px?: number | undefined;
  media_player_px?: number | undefined;
}

export interface NavLayoutConfig {
  auto_padding?: NavAutoPaddingConfig | undefined;
  /** Gap between icons in the dock (px). Default 8. */
  icon_gap?: number | undefined;
}

export interface NavHapticConfig {
  url?: boolean | undefined;
  tap_action?: boolean | undefined;
  hold_action?: boolean | undefined;
  double_tap_action?: boolean | undefined;
}

export type NavHapticSetting = boolean | NavHapticConfig;

export interface NavMediaPlayerConfig {
  /** Enable media player in navbar */
  enabled?: boolean | undefined;
  entity?: string | undefined;
  show?: boolean | string | undefined;
  display_mode?: 'widget' | 'icon' | 'icon_hover' | 'icon_click' | undefined;
  album_cover_background?: boolean | undefined;
  /** Position of the media player icon within the navbar routes. 'start' = first, 'end' = last, or a number for specific index */
  icon_position?: 'start' | 'end' | number | undefined;
  /** Where the expanded widget popup appears relative to the icon */
  widget_position?: 'above' | 'below' | undefined;
  desktop_position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | undefined;
  tap_action?: NavActionConfig | undefined;
  hold_action?: NavActionConfig | undefined;
  double_tap_action?: NavActionConfig | undefined;
  /** When media is idle/off/unavailable, tap can do something else instead of play. Undefined = play (default). */
  inactive_tap_action?: NavActionConfig | undefined;
}

export interface NavigationTemplateConfig {
  nav_routes?: NavRoute[] | undefined;
  nav_desktop?: NavDesktopConfig | undefined;
  nav_mobile?: NavMobileConfig | undefined;
  nav_layout?: NavLayoutConfig | undefined;
  nav_styles?: string | undefined;
  nav_haptic?: NavHapticSetting | undefined;
  nav_media_player?: NavMediaPlayerConfig | undefined;
}

export interface NavAutohideConfig {
  /** Enable macOS-style auto-hide: navbar slides off-screen after idle, reappears on edge hover */
  enabled?: boolean | undefined;
  /** Seconds of inactivity before hiding (default: 3) */
  delay?: number | undefined;
}

export interface NavigationModule extends BaseModule {
  type: 'navigation';
  nav_routes: NavRoute[];
  /** Stack items that contain child routes */
  nav_stacks?: NavStackItem[] | undefined;
  /** Controls where the navbar is visible: 'current_view' = only on this view, 'all_views' = on all dashboard views */
  nav_scope?: 'current_view' | 'all_views' | undefined;
  nav_style?:
    | 'uc_modern'
    | 'uc_minimal'
    | 'uc_ios_glass'
    | 'uc_material'
    | 'uc_floating'
    | 'uc_docked'
    | 'uc_neumorphic'
    | 'uc_gradient'
    | 'uc_sidebar'
    | 'uc_compact'
    | undefined;
  nav_desktop?: NavDesktopConfig | undefined;
  nav_mobile?: NavMobileConfig | undefined;
  nav_layout?: NavLayoutConfig | undefined;
  nav_styles?: string | undefined;
  nav_template?: string | undefined;
  nav_haptic?: NavHapticSetting | undefined;
  nav_media_player?: NavMediaPlayerConfig | undefined;
  /** macOS-style auto-hide configuration */
  nav_autohide?: NavAutohideConfig | undefined;
  /** Custom accent color for the dock background (tints styles) */
  nav_dock_color?: string | undefined;
  /** Custom accent color for icons */
  nav_icon_color?: string | undefined;
}

// ============================================
// TIMER MODULE TYPES
// ============================================

export type TimerDisplayStyle = 'circle' | 'progress_bar' | 'digital' | 'background_fill';

export interface TimerModule extends BaseModule {
  type: 'timer';

  /** Optional display title (e.g. "Kitchen", "Door close") */
  title?: string | undefined;
  /** Icon for the timer (e.g. mdi:timer, mdi:pot-steam) */
  icon?: string | undefined;
  /** Default duration in seconds when user hits Start */
  duration_seconds: number;
  /** Optional preset durations in seconds for quick buttons (e.g. [300, 600, 900, 3600]) */
  preset_durations?: number[] | undefined;
  /** Display style: circle, progress_bar, digital, background_fill */
  style: TimerDisplayStyle;
  /** Optional HA timer entity to sync with */
  timer_entity?: string | undefined;
  /** Action to run when timer reaches zero (same shape as tap_action) */
  on_expire_action?: {
    action:
      | 'default'
      | 'more-info'
      | 'toggle'
      | 'navigate'
      | 'url'
      | 'perform-action'
      | 'assist'
      | 'nothing';
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
    target?: Record<string, any> | undefined;
  };
  /** When expired, show Snooze / Dismiss buttons */
  show_snooze_dismiss?: boolean | undefined;
  /** Snooze duration in seconds when user taps Snooze */
  snooze_seconds?: number | undefined;

  // Global action configuration (tap on timer area when idle/running)
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
}

// ============================================
// COVER MODULE TYPES (Pro)
// ============================================

export interface CoverModule extends BaseModule {
  type: 'cover';

  /** Cover entity (single-entity mode) */
  entity: string;
  /** Optional display name override */
  name?: string | undefined;
  /** Optional icon override */
  icon?: string | undefined;

  /** Display toggles */
  show_title?: boolean | undefined;
  show_icon?: boolean | undefined;
  show_state?: boolean | undefined;
  show_position?: boolean | undefined;
  show_stop?: boolean | undefined;
  show_position_control?: boolean | undefined;

  /** Layout: compact (icon + state + controls), standard (name + position bar + buttons), buttons (explicit open/close/stop) */
  layout?: 'compact' | 'standard' | 'buttons' | undefined;
  /** Alignment of content within the module */
  alignment?: 'left' | 'center' | 'right' | undefined;

  /** Tilt (advanced): show tilt state and controls when entity supports it */
  show_tilt?: boolean | undefined;
  show_tilt_control?: boolean | undefined;

  /** Multi-cover (advanced): when set, display these entities instead of single entity */
  entities?: string[] | undefined;
  layout_multi?: 'stack' | 'grid' | undefined;

  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
}

// ============================================
// FAN MODULE TYPES
// ============================================

export interface FanModule extends BaseModule {
  type: 'fan';

  /** Fan entity */
  entity: string;
  name?: string | undefined;
  icon?: string | undefined;

  layout?: 'hero' | 'standard' | 'compact' | undefined;
  alignment?: 'left' | 'center' | 'right' | undefined;

  show_title?: boolean | undefined;
  show_icon?: boolean | undefined;
  show_state?: boolean | undefined;
  show_percentage?: boolean | undefined;
  show_percentage_control?: boolean | undefined;
  show_preset_modes?: boolean | undefined;
  show_oscillate?: boolean | undefined;
  show_direction?: boolean | undefined;
  show_speed_steppers?: boolean | undefined;

  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
}

// ============================================
// LOCK MODULE TYPES
// ============================================

export interface LockModule extends BaseModule {
  type: 'lock';

  /** Lock entity */
  entity: string;
  name?: string | undefined;
  icon?: string | undefined;

  layout?: 'hero' | 'standard' | 'compact' | undefined;
  alignment?: 'left' | 'center' | 'right' | undefined;

  show_title?: boolean | undefined;
  show_icon?: boolean | undefined;
  show_state?: boolean | undefined;
  /** Show Open / unlatch when entity supports LockEntityFeature.OPEN */
  show_open_button?: boolean | undefined;

  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
}

/** Field mapping for todo item → module (used when source_type is 'todo'). */
export interface TodoItemTemplate {
  /** Module type to render per item: text, icon, or bar */
  module_type: 'text' | 'icon' | 'bar';
  /** For text: primary line (e.g. summary). */
  primary_field?: 'summary' | 'description' | 'due' | 'status' | undefined;
  /** For text: secondary line. */
  secondary_field?: 'summary' | 'description' | 'due' | 'status' | 'none' | undefined;
  /** Icon when item is incomplete (needs_action). Fallback: icon. */
  icon?: string | undefined;
  /** Icon when item is completed. If not set, uses icon_completed from integration or icon. */
  icon_completed?: string | undefined;
  /** Icon when item is incomplete (needs_action). If not set, uses icon. */
  icon_incomplete?: string | undefined;
  /** Icon color when completed (e.g. from color picker). */
  icon_color_completed?: string | undefined;
  /** Icon color when incomplete (e.g. from color picker). */
  icon_color_incomplete?: string | undefined;
  /** Text alignment for item display. */
  alignment?: 'left' | 'center' | 'right' | 'justify' | undefined;
  /** Where to show the icon relative to text: before, after, or none. */
  icon_position?: 'before' | 'after' | 'none' | undefined;
  /** When true, tapping the row calls todo.update_item to mark item completed (or uncompleted). */
  allow_tap_to_complete?: boolean | undefined;
}

/** Action config for action-sourced dynamic lists. */
export interface DynamicListActionSource {
  /** HA service domain (e.g. "todo"). */
  domain: string;
  /** HA service name (e.g. "get_items"). */
  service: string;
  /** Service data / target to pass to the action. Supports $variable syntax. */
  service_data?: Record<string, unknown> | undefined;
  /** How often (in seconds) to re-call the action to refresh data. 0 = only on state_changed events. */
  refresh_interval?: number | undefined;
  /** Entity ids to watch for state_changed events that trigger a re-fetch. */
  watch_entities?: string[] | undefined;
}

export interface DynamicListModule extends BaseModule {
  type: 'dynamic-list';
  /**
   * Source of list items:
   *   'template'      — Jinja2 template that outputs a JSON array of module configs.
   *   'todo'          — HA todo entity with fixed field mapping (legacy simple mode).
   *   'todo-template' — HA todo entity(ies) fetched, then items injected into a Jinja2 template
   *                     as `{{ items }}` / `{{ items | tojson }}` so you can build any module structure.
   *   'action'        — Call any HA service action; response is injected into a Jinja2 template
   *                     as `{{ response }}` so you can build modules from arbitrary service data.
   */
  source_type?: 'template' | 'todo' | 'todo-template' | 'action' | undefined;
  /** Jinja2 template that must return a JSON array of CardModule config objects via | tojson (used when source_type is 'template'). */
  dynamic_template: string;
  /** Todo entity id (e.g. todo.shopping). Used when source_type is 'todo' or 'todo-template'. Empty = first available. */
  todo_entity?: string | undefined;
  /** Additional todo entity ids to include (e.g. M365 sub-lists). Items from all lists are combined. */
  todo_entities?: string[] | undefined;
  /** Which statuses to show when source_type is 'todo' or 'todo-template'. Empty or omitted = both. */
  todo_statuses?: ('needs_action' | 'completed')[] | undefined;
  /** How to map each todo item to a module when source_type is 'todo'. */
  todo_item_template?: TodoItemTemplate | undefined;
  /**
   * Jinja2 template used when source_type is 'todo-template'.
   * The fetched items are injected as `items` — a list of objects with keys:
   *   summary, status, due, description, uid, entity_id.
   * Must output a JSON array via | tojson.
   */
  todo_dynamic_template?: string | undefined;
  /** Action configuration used when source_type is 'action'. */
  action_source?: DynamicListActionSource | undefined;
  /**
   * Jinja2 template used when source_type is 'action'.
   * The action response object is injected as `response`.
   * Must output a JSON array via | tojson.
   */
  action_template?: string | undefined;
  /** Layout direction for the generated modules */
  direction: 'vertical' | 'horizontal';
  /** Gap between generated modules in px */
  gap: number;
  /** Allow items to wrap onto multiple rows/columns (default: true) */
  wrap: boolean;
  /** Number of columns in the grid (0 = auto/natural). Works for both horizontal and vertical. */
  columns: number;
  /** Maximum number of rows to show in a horizontal wrapping layout (0 = unlimited) */
  rows: number;
  /** Show only the first N items initially (0 = show all) */
  limit: number;
  /** What to show when limit is exceeded: show_more button or paginate controls */
  limit_behavior: 'show_more' | 'paginate';
  /** Horizontal alignment of items (justify-content / justify-items) */
  align_h: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'stretch';
  /** Vertical alignment of items (align-items) */
  align_v: 'start' | 'center' | 'end' | 'stretch';
  /** Sort list by this field (default = keep source order). For todo: summary, due, status. For template: summary = by module text/name. */
  sort_by?: 'default' | 'summary' | 'due' | 'status' | undefined;
  /** Sort direction when sort_by is set */
  sort_direction?: 'asc' | 'desc' | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
}

/** Energy node type for Energy Display module. */
export type EnergyNodeType = 'solar' | 'grid' | 'battery' | 'home' | 'device';

/** Single node in an energy flow display (core or custom device). */
export interface EnergyNode {
  id: string;
  node_type: EnergyNodeType;
  entity: string;
  secondary_entity?: string | undefined;
  icon?: string | undefined;
  color?: string | undefined;
  label: string;
  show_arrow?: boolean | undefined;
  /** Optional position override for circle_flow layout (e.g. 'top' | 'left' | 'right' | 'bottom' or angle). */
  position?: string | undefined;
  enabled?: boolean | undefined;
}

/** Display style for Energy Display module. */
export type EnergyDisplayStyle = 'circle_flow' | 'box_flow' | 'sankey';

export interface EnergyDisplayModule extends BaseModule {
  type: 'energy_display';
  display_style?: EnergyDisplayStyle | undefined;
  nodes: EnergyNode[];
  show_self_sufficiency?: boolean | undefined;
  self_sufficiency_entity?: string | undefined;
  animation_speed?: 'slow' | 'normal' | 'fast' | 'none' | undefined;
  flow_line_width?: number | undefined;
  show_values?: boolean | undefined;
  unit_display?: 'auto' | 'W' | 'kW' | undefined;
  show_labels?: boolean | undefined;
  show_icons?: boolean | undefined;
  /** Circle Flow: node circle size in px. */
  circle_size?: number | undefined;
  /** Box Flow: border width in px. */
  box_border_width?: number | undefined;
  /** Sankey: diagram width / height. */
  sankey_width?: number | undefined;
  sankey_curve_factor?: number | undefined;
  /** Circle Flow: spacing between nodes. */
  node_spacing?: number | undefined;
  /** Box Flow: corner radius. */
  box_border_radius?: number | undefined;
  /** Box Flow: central gauge size. */
  gauge_size?: number | undefined;
  /** Sankey: column spacing. */
  sankey_column_spacing?: number | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

/** Visual preset for Living Canvas (Pro) WebGL module. */
export type LivingCanvasPreset = 'aurora' | 'plasma' | 'particles' | 'mesh';

/** Performance / pixel ratio cap for Living Canvas. */
export type LivingCanvasQuality = 'low' | 'medium' | 'high';

export interface LivingCanvasModule extends BaseModule {
  type: 'living_canvas';
  /** When false, view effect is off. */
  enabled?: boolean | undefined;
  /** Behind cards (background) or above (foreground). */
  position?: 'background' | 'foreground' | undefined;
  /** Canvas opacity 0–100 (default 100). Applied in WebGL alpha, not the Lovelace card. */
  opacity?: number | undefined;
  /** When false, hide on narrow viewports (same idea as Dynamic Weather). */
  enable_on_mobile?: boolean | undefined;
  preset?: LivingCanvasPreset | undefined;
  /** Custom background / base color (CSS). Empty uses the preset default. */
  canvas_color_background?: string | undefined;
  /** Custom primary accent (CSS). Empty uses the preset default. */
  canvas_color_primary?: string | undefined;
  /** Custom secondary accent (CSS). Empty uses the preset default. */
  canvas_color_secondary?: string | undefined;
  /** Animation speed multiplier (0.25–3, default 1). */
  speed?: number | undefined;
  /** Visual intensity 0–100 (default 70). */
  intensity?: number | undefined;
  respect_reduced_motion?: boolean | undefined;
  quality?: LivingCanvasQuality | undefined;
  /** Optional entity whose numeric state maps to 0–1 as driver A. */
  driver_entity_a?: string | undefined;
  /** Optional entity whose numeric state maps to 0–1 as driver B. */
  driver_entity_b?: string | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Text Input Module (text input linked to input_text helpers)
export interface TextInputModule extends BaseModule {
  type: 'text_input';
  entity?: string | undefined;
  placeholder?: string | undefined;
  input_appearance?: 'outlined' | 'filled' | 'underlined' | undefined;
  multiline?: boolean | undefined;
  rows?: number | undefined;
  prefix_icon?: string | undefined;
  suffix_icon?: string | undefined;
  show_clear_button?: boolean | undefined;
  show_character_count?: boolean | undefined;
  label?: string | undefined;
  show_label?: boolean | undefined;
  font_size?: number | undefined;
  text_color?: string | undefined;
  focus_color?: string | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// DateTime Input Module (date/time picker linked to input_datetime helpers)
export interface DatetimeInputModule extends BaseModule {
  type: 'datetime_input';
  entity?: string | undefined;
  display_mode_datetime?: 'auto' | 'date' | 'time' | 'datetime' | undefined;
  label?: string | undefined;
  show_label?: boolean | undefined;
  font_size?: number | undefined;
  text_color?: string | undefined;
  focus_color?: string | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Number Input Module (number textbox linked to input_number helpers)
export interface NumberInputModule extends BaseModule {
  type: 'number_input';
  entity?: string | undefined;
  input_appearance?: 'outlined' | 'filled' | 'underlined' | undefined;
  show_stepper?: boolean | undefined;
  show_unit?: boolean | undefined;
  label?: string | undefined;
  show_label?: boolean | undefined;
  font_size?: number | undefined;
  text_color?: string | undefined;
  focus_color?: string | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Slider Input Module (range slider linked to input_number helpers)
export interface SliderInputModule extends BaseModule {
  type: 'slider_input';
  entity?: string | undefined;
  show_value?: boolean | undefined;
  show_min_max?: boolean | undefined;
  show_unit?: boolean | undefined;
  slider_height?: number | undefined;
  slider_color?: string | undefined;
  track_color?: string | undefined;
  thumb_size?: number | undefined;
  label?: string | undefined;
  show_label?: boolean | undefined;
  font_size?: number | undefined;
  text_color?: string | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Select Input Module (dropdown/chips linked to input_select helpers)
export interface SelectInputModule extends BaseModule {
  type: 'select_input';
  entity?: string | undefined;
  select_style?: 'dropdown' | 'segmented' | 'chips' | undefined;
  label?: string | undefined;
  show_label?: boolean | undefined;
  font_size?: number | undefined;
  text_color?: string | undefined;
  active_color?: string | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Boolean Input Module (toggle linked to input_boolean / switch entities)
export interface BooleanInputModule extends BaseModule {
  type: 'boolean_input';
  entity?: string | undefined;
  toggle_style?: 'switch' | 'checkbox' | 'pill' | undefined;
  show_state_text?: boolean | undefined;
  on_text?: string | undefined;
  off_text?: string | undefined;
  label?: string | undefined;
  show_label?: boolean | undefined;
  font_size?: number | undefined;
  text_color?: string | undefined;
  on_color?: string | undefined;
  off_color?: string | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Button Input Module (press button linked to input_button helpers)
export interface ButtonInputModule extends BaseModule {
  type: 'button_input';
  entity?: string | undefined;
  button_label?: string | undefined;
  button_icon?: string | undefined;
  button_style?: 'filled' | 'outlined' | 'text' | undefined;
  font_size?: number | undefined;
  text_color?: string | undefined;
  button_color?: string | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Counter Input Module (counter with +/- and reset linked to counter helpers)
export interface CounterInputModule extends BaseModule {
  type: 'counter_input';
  entity?: string | undefined;
  counter_style?: 'inline' | 'stacked' | 'compact' | undefined;
  show_reset?: boolean | undefined;
  label?: string | undefined;
  show_label?: boolean | undefined;
  font_size?: number | undefined;
  text_color?: string | undefined;
  button_color?: string | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Color Input Module (color picker linked to input_text or light entities)
export interface ColorInputModule extends BaseModule {
  type: 'color_input';
  entity?: string | undefined;
  color_mode?: 'hex' | 'light_rgb' | undefined;
  show_hex_input?: boolean | undefined;
  show_preview?: boolean | undefined;
  preview_size?: number | undefined;
  label?: string | undefined;
  show_label?: boolean | undefined;
  font_size?: number | undefined;
  text_color?: string | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
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
  | VacuumModule
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
  | BadgeOfHonorModule
  | MediaPlayerModule
  | PeopleModule
  | NavigationModule
  | TimerModule
  | CoverModule
  | FanModule
  | LockModule
  | DynamicListModule
  | QrCodeModule
  | EnergyDisplayModule
  | LivingCanvasModule
  | TextInputModule
  | DatetimeInputModule
  | NumberInputModule
  | SliderInputModule
  | SelectInputModule
  | BooleanInputModule
  | ButtonInputModule
  | CounterInputModule
  | ColorInputModule
  | ActivityFeedModule
  | AlertCenterModule
  | AreaSummaryModule
  | VirtualPetModule;

// Activity Feed Module - Pro module for displaying entity state change history
export interface ActivityFeedEntity {
  id: string;
  entity: string;
  label?: string | undefined;
  icon?: string | undefined;
  color?: string | undefined;
}

export interface ActivityFeedModule extends BaseModule {
  type: 'activity_feed';

  entities: ActivityFeedEntity[];

  // Auto-filtering
  enable_auto_filter?: boolean | undefined;
  include_domains?: string[] | undefined;
  exclude_domains?: string[] | undefined;
  exclude_patterns?: string[] | undefined;

  // View mode
  view_mode: 'timeline' | 'feed';

  // Display
  title?: string | undefined;
  show_title?: boolean | undefined;
  max_items?: number | undefined;
  show_entity_icon?: boolean | undefined;
  show_relative_time?: boolean | undefined;
  show_absolute_time?: boolean | undefined;
  show_state_change?: boolean | undefined;
  group_by_time?: boolean | undefined;

  // Timeline-specific
  timeline_line_color?: string | undefined;
  timeline_dot_color?: string | undefined;
  timeline_dot_size?: number | undefined;

  // Feed-specific
  feed_card_style?: 'flat' | 'elevated' | 'outlined' | undefined;
  show_avatar?: boolean | undefined;
  avatar_style?: 'circle' | 'rounded' | 'square' | undefined;

  // Sorting
  sort_direction?: 'newest_first' | 'oldest_first' | undefined;

  // Colors
  accent_color?: string | undefined;
  text_color?: string | undefined;
  secondary_text_color?: string | undefined;
  card_background_color?: string | undefined;

  // Actions
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  // Logic
  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
}

// Alert Center Module - Active issues/alerts rollup
export interface AlertCenterModule extends BaseModule {
  type: 'alert_center';

  title?: string | undefined;
  show_title?: boolean | undefined;
  max_alerts?: number | undefined;
  show_all_clear?: boolean | undefined;
  show_state?: boolean | undefined;

  // Auto-monitor domain toggles
  include_alert_domain?: boolean | undefined;
  include_binary_sensors?: boolean | undefined;
  include_lock_alerts?: boolean | undefined;
  include_alarm_panel_alerts?: boolean | undefined;

  // Manual include/exclude
  include_entities?: string[] | undefined;
  hidden_entities?: string[] | undefined;

  // Style
  accent_color?: string | undefined;
  tile_border_radius?: number | undefined;

  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
}

// Area / Room Summary — free module: area-scoped smart room tiles
export type AreaSummaryStylePreset =
  | 'iconic_soft'
  | 'graph_glow'
  | 'compact_controls'
  | 'photo_overlay';

export type AreaSummaryDiscoveryKey =
  | 'lights'
  | 'climate'
  | 'temperature'
  | 'humidity'
  | 'motion'
  | 'doors_windows'
  | 'media'
  | 'presence'
  | 'covers'
  | 'fans'
  | 'locks'
  | 'switches';

export interface AreaSummaryDiscoveryToggles {
  lights?: boolean | undefined;
  climate?: boolean | undefined;
  temperature?: boolean | undefined;
  humidity?: boolean | undefined;
  motion?: boolean | undefined;
  doors_windows?: boolean | undefined;
  media?: boolean | undefined;
  presence?: boolean | undefined;
  covers?: boolean | undefined;
  fans?: boolean | undefined;
  locks?: boolean | undefined;
  switches?: boolean | undefined;
}

export interface AreaSummaryModule extends BaseModule {
  type: 'area_summary';

  /** Home Assistant area_id from area registry */
  area_id: string;

  /** Optional title override (defaults to area name) */
  title?: string | undefined;

  /** Optional override for temperature summary source entity */
  temperature_entity?: string | undefined;

  /** Optional override for humidity summary source entity */
  humidity_entity?: string | undefined;

  /** Optional border radius (px) for the room tile container */
  tile_border_radius?: number | undefined;

  /** mdi icon for the room hero */
  room_icon?: string | undefined;

  /** Accent color for presets (CSS color) */
  accent_color?: string | undefined;

  /** Show friendly names under quick-action badges */
  show_quick_entity_names?: boolean | undefined;

  style_preset?: AreaSummaryStylePreset | undefined;

  /** Max number of quick-action bubbles (remaining entities still affect subtitle aggregates) */
  max_quick_actions?: number | undefined;

  /** Per-category inclusion for auto-discovery */
  discovery?: AreaSummaryDiscoveryToggles | undefined;

  /** Entity ids to exclude from quick actions and aggregates */
  hidden_entities?: string[] | undefined;

  /** Entity ids shown first in the quick-action row when present in the area */
  pinned_entities?: string[] | undefined;

  /** @deprecated Use room_background_type + room_background_image. Kept for older configs. */
  room_background_url?: string | undefined;

  /** Background for Photo overlay preset */
  room_background_type?: 'none' | 'upload' | 'entity' | 'url' | undefined;

  /** Image path (upload) or URL when type is upload or url */
  room_background_image?: string | undefined;

  /** Entity whose entity_picture is used when type is entity */
  room_background_image_entity?: string | undefined;

  /** 0–100 overlay darkness for background photo */
  room_background_overlay?: number | undefined;

  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
}

// Virtual Pet Module - Pro module with a digital pet driven by smart home data
export type PetSpecies = 'cat' | 'dog' | 'fox' | 'rabbit' | 'owl' | 'penguin' | 'robot' | 'shrimp' | 'snail' | 'snake' | 'turtle' | 'frog';
export type PetMood = 'ecstatic' | 'happy' | 'content' | 'neutral' | 'bored' | 'sad' | 'sleepy' | 'cold' | 'hot' | 'alert';

export interface PetEntityBinding {
  id: string;
  entity: string;
  role: 'happiness' | 'energy' | 'temperature' | 'activity' | 'security' | 'custom';
  label?: string | undefined;
  happy_state?: string | undefined;
  sad_state?: string | undefined;
  weight?: number | undefined;
  invert?: boolean | undefined;
  range_min?: number | undefined;
  range_max?: number | undefined;
  temp_preset?: string | undefined;
  cold_threshold?: number | undefined;
  hot_threshold?: number | undefined;
}

export interface VirtualPetModule extends BaseModule {
  type: 'virtual_pet';

  pet_name: string;
  species: PetSpecies;

  entity_bindings: PetEntityBinding[];

  show_name?: boolean | undefined;
  show_mood?: boolean | undefined;
  show_stats?: boolean | undefined;
  show_speech_bubble?: boolean | undefined;
  show_background_scene?: boolean | undefined;

  pet_size?: number | undefined;
  background_scene?: 'auto' | 'living_room' | 'garden' | 'night_sky' | 'cozy' | 'none' | undefined;
  enable_animations?: boolean | undefined;
  enable_particles?: boolean | undefined;
  enable_idle_animations?: boolean | undefined;
  lcd_filter?: boolean | undefined;

  accent_color?: string | undefined;
  pet_primary_color?: string | undefined;
  pet_secondary_color?: string | undefined;
  bubble_color?: string | undefined;
  stats_color?: string | undefined;

  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
}

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
    | 'fade'
    | undefined;
  duration?: number | undefined; // Duration in milliseconds (default: 300)
  timing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | undefined;
  delay?: number | undefined; // Delay before effect starts in milliseconds (default: 0)
  // Color settings for specific effects
  highlight_color?: string | undefined; // For 'highlight' effect
  outline_color?: string | undefined; // For 'outline' effect
  outline_width?: number | undefined; // For 'outline' effect (default: 2px)
  glow_color?: string | undefined; // For 'glow' effect
  shadow_color?: string | undefined; // For 'shadow' effect
  // Transform settings
  scale?: number | undefined; // For 'grow'/'shrink' effects (default: 1.05 for grow, 0.95 for shrink)
  translate_x?: number | undefined; // For 'float' effect
  translate_y?: number | undefined; // For 'float' effect
  rotate_degrees?: number | undefined; // For 'rotate' effect
  // Animation intensity
  intensity?: 'subtle' | 'normal' | 'strong' | undefined; // Affects magnitude of effects
}

// Device breakpoint type for responsive design
export type DeviceBreakpoint = 'desktop' | 'laptop' | 'tablet' | 'mobile';

// Breakpoint configuration with pixel values (WPBakery-style)
export const DEVICE_BREAKPOINTS = {
  desktop: { minWidth: 1381, label: 'Desktop', icon: 'mdi:monitor' },
  laptop: { minWidth: 1025, maxWidth: 1380, label: 'Laptop', icon: 'mdi:laptop' },
  tablet: { minWidth: 601, maxWidth: 1024, label: 'Tablet', icon: 'mdi:tablet' },
  mobile: { maxWidth: 600, label: 'Mobile', icon: 'mdi:cellphone' },
} as const;

// Design properties interface that can be shared
export interface SharedDesignProperties {
  // Text properties
  color?: string | undefined;
  text_align?: 'left' | 'center' | 'right' | 'justify' | undefined;
  font_size?: string | undefined;
  line_height?: string | undefined;
  letter_spacing?: string | undefined;
  font_family?: string | undefined;
  font_weight?: string | undefined;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | undefined;
  font_style?: 'normal' | 'italic' | 'oblique' | undefined;
  white_space?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line' | undefined;
  // Background properties
  background_color?: string | undefined;
  background_image?: string | undefined;
  background_image_type?: 'none' | 'upload' | 'entity' | 'url' | undefined;
  background_image_entity?: string | undefined;
  // New: background image rendering controls
  background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | undefined;
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
    | undefined;
  background_size?: 'cover' | 'contain' | 'auto' | string | undefined; // string to allow custom values like '100% 100%'
  backdrop_filter?: string | undefined;
  background_filter?: string | undefined;
  // Size properties
  width?: string | undefined;
  height?: string | undefined;
  max_width?: string | undefined;
  max_height?: string | undefined;
  min_width?: string | undefined;
  min_height?: string | undefined;
  // Spacing properties
  margin_top?: string | undefined;
  margin_bottom?: string | undefined;
  margin_left?: string | undefined;
  margin_right?: string | undefined;
  padding_top?: string | undefined;
  padding_bottom?: string | undefined;
  padding_left?: string | undefined;
  padding_right?: string | undefined;
  // Border properties
  border_radius?: string | undefined;
  border_style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | undefined;
  border_width?: string | undefined;
  border_color?: string | undefined;
  // Position properties
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky' | undefined;
  top?: string | undefined;
  bottom?: string | undefined;
  left?: string | undefined;
  right?: string | undefined;
  z_index?: string | undefined;
  // Shadow properties
  text_shadow_h?: string | undefined;
  text_shadow_v?: string | undefined;
  text_shadow_blur?: string | undefined;
  text_shadow_color?: string | undefined;
  box_shadow_h?: string | undefined;
  box_shadow_v?: string | undefined;
  box_shadow_blur?: string | undefined;
  box_shadow_spread?: string | undefined;
  box_shadow_color?: string | undefined;
  // Layout properties
  // gap: space between child items (e.g. between modules in a column, or items in a row)
  gap?: string | undefined;
  // Other properties
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto' | undefined;
  clip_path?: string | undefined;
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
    | 'tada'
    | undefined;
  animation_entity?: string | undefined;
  animation_trigger_type?: 'state' | 'attribute' | undefined;
  animation_attribute?: string | undefined;
  animation_state?: string | undefined;
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
    | 'rotateIn'
    | undefined;
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
    | 'rotateOut'
    | undefined;
  animation_duration?: string | undefined;
  animation_delay?: string | undefined;
  animation_timing?:
    | 'ease'
    | 'linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'cubic-bezier(0.25,0.1,0.25,1)'
    | undefined;
  intro_animation_duration?: string | undefined;
  intro_animation_delay?: string | undefined;
  intro_animation_timing?:
    | 'ease'
    | 'linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'cubic-bezier(0.25,0.1,0.25,1)'
    | undefined;
  // Hover effects
  hover_effect?: HoverEffectConfig | undefined;
  // Logic properties
  logic_entity?: string | undefined;
  logic_attribute?: string | undefined;
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
    | 'no_value'
    | undefined;
  logic_value?: string | undefined;
  // Custom targeting properties
  extra_class?: string | undefined;
  element_id?: string | undefined;
  css_variable_prefix?: string | undefined;
}

// Responsive design properties - extends SharedDesignProperties to allow
// both flat access (for backwards compatibility) and nested device-specific overrides
export interface ResponsiveDesignProperties extends SharedDesignProperties {
  // Base/default design properties (applied when no device-specific override exists)
  // In responsive mode, properties can be at the top level OR nested in base
  base?: Partial<SharedDesignProperties> | undefined;
  // Device-specific overrides (merged with base at runtime)
  desktop?: Partial<SharedDesignProperties> | undefined;
  laptop?: Partial<SharedDesignProperties> | undefined;
  tablet?: Partial<SharedDesignProperties> | undefined;
  mobile?: Partial<SharedDesignProperties> | undefined;
}

// Type guard to check if design has responsive overrides (has device-specific keys)
export function isResponsiveDesign(
  design: SharedDesignProperties | ResponsiveDesignProperties | undefined
): design is ResponsiveDesignProperties {
  if (!design) return false;
  return (
    'base' in design ||
    'desktop' in design ||
    'laptop' in design ||
    'tablet' in design ||
    'mobile' in design
  );
}

// Column interface that contains modules
export interface CardColumn {
  id: string;
  name?: string | undefined;
  modules: CardModule[];
  // Dynamic modules via Jinja2 template - must output a JSON array of CardModule objects
  // Takes priority over `modules` when set. Updates reactively via HA template subscription.
  modules_template?: string | undefined;
  vertical_alignment?: 'top' | 'center' | 'bottom' | 'stretch' | undefined;
  horizontal_alignment?:
    | 'left'
    | 'center'
    | 'right'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'justify'
    | undefined;
  background_color?: string | undefined;
  padding?: number | undefined;
  margin?: number | undefined;
  border_radius?: number | undefined;
  border_color?: string | undefined;
  border_width?: number | undefined;
  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
  /** @deprecated Prefer unified_template for visibility (JSON `visible` key). */
  template_mode?: boolean | undefined;
  /** @deprecated Prefer unified_template. */
  template?: string | undefined;
  /** Unified layout visibility: JSON with optional `visible` (and fallbacks per template-parser). */
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  // Responsive visibility - hide on specific device breakpoints
  hidden_on_devices?: DeviceBreakpoint[] | undefined;
  // Design properties with priority system
  // Can include device-specific overrides (base, desktop, laptop, tablet, mobile)
  design?: ResponsiveDesignProperties | undefined;
  // Column-level actions (override child module actions)
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Column layout ID type for reuse
export type ColumnLayoutId =
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

// Responsive column layout for a specific breakpoint
export interface ResponsiveColumnLayoutConfig {
  layout: ColumnLayoutId;
  custom_sizing?: string | undefined; // Only used when layout === 'custom'
}

// Responsive column layouts by device breakpoint
// Desktop layout uses the base column_layout property
// Other breakpoints can have different layouts (with <= columns than desktop)
export interface ResponsiveColumnLayouts {
  laptop?: ResponsiveColumnLayoutConfig | undefined;
  tablet?: ResponsiveColumnLayoutConfig | undefined;
  mobile?: ResponsiveColumnLayoutConfig | undefined;
}

// Row interface that contains columns
export interface CardRow {
  id: string;
  name?: string | undefined;
  columns: CardColumn[];
  // Dynamic columns via Jinja2 template - must output a JSON array of CardColumn objects
  // Takes priority over `columns` when set. Updates reactively via HA template subscription.
  columns_template?: string | undefined;
  column_layout?: ColumnLayoutId | undefined;
  custom_column_sizing?: string | undefined; // Custom CSS grid template columns value (e.g., "1fr 1fr 100px")
  // Responsive column layouts - allows different layouts per breakpoint
  // Desktop uses column_layout/custom_column_sizing; other breakpoints can override
  responsive_column_layouts?: ResponsiveColumnLayouts | undefined;
  gap?: number | undefined;
  column_alignment?: 'top' | 'middle' | 'bottom' | undefined;
  content_alignment?: 'start' | 'end' | 'center' | 'stretch' | undefined;
  full_width?: boolean | undefined; // Default true for backwards compatibility
  width_percent?: number | undefined; // Default 100, only used when full_width is false
  background_color?: string | undefined;
  padding?: number | undefined;
  margin?: number | undefined;
  border_radius?: number | undefined;
  border_color?: string | undefined;
  border_width?: number | undefined;
  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
  /** @deprecated Prefer unified_template for visibility (JSON `visible` key). */
  template_mode?: boolean | undefined;
  /** @deprecated Prefer unified_template. */
  template?: string | undefined;
  /** Unified layout visibility: JSON with optional `visible` (and fallbacks per template-parser). */
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
  // Responsive visibility - hide on specific device breakpoints
  hidden_on_devices?: DeviceBreakpoint[] | undefined;
  // Design properties with priority system
  // Can include device-specific overrides (base, desktop, laptop, tablet, mobile)
  design?: ResponsiveDesignProperties | undefined;
  // Row-level actions (override column and module actions)
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
}

// Layout configuration
export interface LayoutConfig {
  rows: CardRow[];
  gap?: number | undefined;
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
  attribute_name?: string | undefined; // For attribute mode - which attribute to return
  order: number;
  created?: string | undefined;
  isGlobal?: boolean | undefined; // true = syncs across all cards (default), false = card-specific
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
  context?: string | undefined; // Additional context (preset name, label, etc.)
}

export interface EntityMapping {
  original: string; // Original entity ID from preset
  mapped: string; // User's mapped entity ID
  domain: string; // Entity domain (light, sensor, etc.)
}

/** Optional guided setup when applying a preset (authored in preset export / ultracard.io). */
export interface PresetWizardConfig {
  steps: PresetWizardStep[];
  adaptations?: PresetWizardAdaptation[] | undefined;
}

export interface PresetWizardStep {
  id: string;
  title: string;
  description?: string | undefined;
  icon?: string | undefined;
  fields: PresetWizardField[];
}

export interface PresetWizardField {
  id: string;
  label: string;
  description: string;
  type: 'entity' | 'unit_system' | 'text' | 'number' | 'select';
  required?: boolean | undefined;
  /** For type `entity`: restrict picker to this domain */
  entityDomain?: string | undefined;
  /** For type `entity`: restrict to sensors with this device_class */
  entityDeviceClass?: string | undefined;
  options?: { value: string | undefined; label: string }[];
  default?: unknown | undefined;
  /** Original entity IDs in the preset layout this field maps to */
  targetEntityIds?: string[] | undefined;
  /** Another field id — user may reuse that field's entity (e.g. same climate for temp + humidity) */
  allowSameAs?: string | undefined;
}

export interface PresetWizardAdaptation {
  when: { fieldId: string; equals: string };
  apply: PresetWizardChange[];
}

export interface PresetWizardChange {
  targetModuleTypes?: string[] | undefined;
  targetEntityIds?: string[] | undefined;
  /** Module property to set (e.g. value_format, min_value) */
  property: string;
  value: unknown;
}

/** Result from the preset wizard dialog before applying to layout */
export interface PresetWizardApplyResult {
  mappings: EntityMapping[];
  fieldValues: Record<string, unknown>;
  skippedEntityIds?: string[] | undefined;
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
  integrations?: string[] | undefined;
  thumbnail?: string | undefined;
  layout: LayoutConfig; // The actual preset configuration
  // Optional custom variables included with the preset
  customVariables?: CustomVariable[] | undefined;
  /** Guided setup: when present, applying the preset opens the wizard instead of the flat entity mapper */
  wizard?: PresetWizardConfig | undefined;
  // Card-level settings from full card exports
  cardSettings?: {
    card_background?: string | undefined;
    card_border_radius?: number | undefined;
    card_border_color?: string | undefined;
    card_border_width?: number | undefined;
    card_padding?: number | undefined;
    card_margin?: number | undefined;
    card_overflow?: 'visible' | 'hidden' | 'scroll' | 'auto' | undefined;
    card_shadow_enabled?: boolean | undefined;
    card_shadow_color?: string | undefined;
    card_shadow_horizontal?: number | undefined;
    card_shadow_vertical?: number | undefined;
    card_shadow_blur?: number | undefined;
    card_shadow_spread?: number | undefined;
    card_background_image_type?: 'none' | 'upload' | 'entity' | 'url' | undefined;
    card_background_image?: string | undefined;
    card_background_size?: string | undefined;
    card_background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | undefined;
    card_background_position?: string | undefined;
  };
  metadata: {
    created: string;
    updated: string;
    downloads?: number | undefined;
    rating?: number | undefined;
    entityMappings?: EntityMapping[] | undefined; // Store original→mapped entity pairs
  };
}

// Favorites system types
export interface FavoriteRow {
  id: string;
  name: string;
  description?: string | undefined;
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
    name?: string | undefined;
    description?: string | undefined;
    privacyProtected?: boolean | undefined; // Flag indicating if data was sanitized for privacy
  };
  customVariables?: CustomVariable[] | undefined; // Optional: Custom variables to export/import with the card
}

// Main card configuration
export interface UltraCardConfig {
  type: string;
  layout: LayoutConfig;
  // Schema version — bumped when defaults change and a migration is needed.
  // v1 (or undefined): modules rely on implicit 8px top/bottom margin default
  // v2: default margin removed; modules carry explicit design.margin_* if they need spacing
  _config_version?: number | undefined;
  /** Trust/origin for navigation `[[[...]]]` JS and similar gates. @see docs/navigation-js-templates.md */
  _contentOrigin?: 'local' | 'imported' | 'preset_standard' | 'preset_community' | undefined;
  /**
   * When true, navigation `[[[...]]]` JavaScript is never executed (Jinja/`{{ }}` still works).
   * Set from YAML for high-assurance dashboards. @see docs/navigation-js-templates.md
   */
  disable_navigation_js_templates?: boolean | undefined;
  global_css?: string | undefined;
  card_background?: string | undefined;
  card_border_radius?: number | undefined;
  card_border_color?: string | undefined;
  card_border_width?: number | undefined;
  card_padding?: number | undefined;
  card_margin?: number | undefined;
  card_overflow?: 'visible' | 'hidden' | 'scroll' | 'auto' | undefined;
  // Card shadow properties
  card_shadow_enabled?: boolean | undefined;
  card_shadow_color?: string | undefined;
  card_shadow_horizontal?: number | undefined; // X offset
  card_shadow_vertical?: number | undefined; // Y offset
  card_shadow_blur?: number | undefined;
  card_shadow_spread?: number | undefined;
  // Card background image properties
  card_background_image_type?: 'none' | 'upload' | 'entity' | 'url' | undefined;
  card_background_image?: string | undefined;
  card_background_image_entity?: string | undefined;
  card_background_size?: string | undefined; // 'cover' | 'contain' | 'auto' | custom values
  card_background_repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | undefined;
  card_background_position?: string | undefined; // e.g., 'center center', 'left top', etc.
  // Card-level conditional display
  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
  // Favorite colors configuration
  favorite_colors?: FavoriteColor[] | undefined;
  // Haptic feedback configuration
  haptic_feedback?: boolean | undefined;
  // Navigation templates (used by Navigation module)
  nav_templates?: Record<string, NavigationTemplateConfig> | undefined;
  // Card identification for backups (Ultra Card Pro)
  card_name?: string | undefined;
  // Responsive scaling configuration
  responsive_scaling?: boolean | undefined;
  // Card-specific custom variables (non-global)
  _customVariables?: CustomVariable[] | undefined;
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
  preview?: boolean | undefined;
  documentationURL?: string | undefined;
  version?: string | undefined;
}

// Home Assistant types
export interface LovelaceCard {
  hass?: HomeAssistant | undefined;
  config?: UltraCardConfig | undefined;
  requestUpdate?: (() => void ) | undefined;
}

// Event types
export interface ConfigChangedEvent {
  detail: {
    config: UltraCardConfig;
  };
}

// Editor types
export interface EditorTarget extends EventTarget {
  value?: string | number | boolean | undefined;
  checked?: boolean | undefined;
  configValue?: string | undefined;
  configAttribute?: string | undefined;
}

// Climate Module
export interface ClimateModule extends BaseModule {
  type: 'climate';
  entity: string;
  name?: string | undefined;

  // Display toggles
  show_current_temp?: boolean | undefined;
  show_target_temp?: boolean | undefined;
  show_humidity?: boolean | undefined;
  show_mode_switcher?: boolean | undefined;
  show_power_button?: boolean | undefined;
  show_fan_controls?: boolean | undefined;
  show_preset_modes?: boolean | undefined;
  show_equipment_status?: boolean | undefined;
  show_temp_controls?: boolean | undefined;
  show_dial?: boolean | undefined;
  enable_dial_interaction?: boolean | undefined;

  // Layout / info placement
  info_position?: 'top' | 'bottom' | undefined;

  // Dial configuration
  dial_size?: number | undefined;
  dial_color_heating?: string | undefined;
  dial_color_cooling?: string | undefined;
  dial_color_idle?: string | undefined;
  dial_color_off?: string | undefined;

  // Dynamic colors (auto-set based on HVAC action)
  dynamic_colors?: boolean | undefined; // Enable automatic color changes based on heating/cooling

  // Temperature adjustment
  temp_step_override?: number | undefined;
  temperature_unit?: 'auto' | 'fahrenheit' | 'celsius' | undefined;
  temp_control_size?: number | undefined; // Size of +/- buttons in pixels (24-60)

  // Control layout
  fan_layout?: 'chips' | 'dropdown' | undefined;
  preset_layout?: 'chips' | 'dropdown' | undefined;

  // Visual customization
  humidity_icon?: string | undefined;
  current_temp_color?: string | undefined;
  target_temp_color?: string | undefined;
  mode_text_color?: string | undefined;
  humidity_color?: string | undefined;

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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;

  // Hover configuration (reuse standard flag)
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
}

// ========================================
// VACUUM MODULE TYPES (Pro Feature)
// ========================================

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

  // Entity Configuration
  entity: string;
  name?: string | undefined;
  map_entity?: string | undefined; // Optional camera entity for map
  map_card_config?: any | undefined; // Optional embedded map card config

  // Additional Entity Sensors (Roborock and other integrations)
  battery_entity?: string | undefined; // sensor.vacuum_battery
  status_entity?: string | undefined; // sensor.vacuum_status (enum with detailed states)
  cleaning_binary_entity?: string | undefined; // binary_sensor.vacuum_cleaning
  charging_binary_entity?: string | undefined; // binary_sensor.vacuum_charging
  cleaning_area_entity?: string | undefined; // sensor.vacuum_cleaning_area (m²)
  cleaning_time_entity?: string | undefined; // sensor.vacuum_cleaning_time (min)
  current_room_entity?: string | undefined; // sensor.vacuum_current_room
  last_clean_begin_entity?: string | undefined; // sensor.vacuum_last_clean_begin (timestamp)
  last_clean_end_entity?: string | undefined; // sensor.vacuum_last_clean_end (timestamp)
  total_cleaning_area_entity?: string | undefined; // sensor.vacuum_total_cleaning_area (m²)
  total_cleaning_time_entity?: string | undefined; // sensor.vacuum_total_cleaning_time (h)
  total_cleaning_count_entity?: string | undefined; // sensor.vacuum_total_cleaning_count
  vacuum_error_entity?: string | undefined; // sensor.vacuum_error (enum)
  dock_error_entity?: string | undefined; // sensor.vacuum_dock_error (enum)
  volume_entity?: string | undefined; // number.vacuum_volume
  do_not_disturb_entity?: string | undefined; // switch.vacuum_do_not_disturb
  do_not_disturb_begin_entity?: string | undefined; // time.vacuum_do_not_disturb_begin
  do_not_disturb_end_entity?: string | undefined; // time.vacuum_do_not_disturb_end
  selected_map_entity?: string | undefined; // select.vacuum_selected_map
  map_image_entity?: string | undefined; // image.vacuum_map (for floor maps)
  full_clean_button_entity?: string | undefined; // button.vacuum_full_cleaning

  // Layout Configuration
  layout_mode?: 'compact' | 'standard' | 'detailed' | undefined;
  card_layout_style?: 'single_column' | 'double_column' | undefined; // Card layout column style

  // Display Toggles
  show_name?: boolean | undefined;
  show_status?: boolean | undefined;
  show_battery?: boolean | undefined;
  show_cleaning_stats?: boolean | undefined;
  show_component_wear?: boolean | undefined;
  show_map?: boolean | undefined;
  show_controls?: boolean | undefined;
  show_current_room?: boolean | undefined;
  show_last_clean?: boolean | undefined;
  show_total_stats?: boolean | undefined;
  show_errors?: boolean | undefined;
  show_dnd?: boolean | undefined;
  show_volume?: boolean | undefined;

  // Component Wear Display
  show_filter_life?: boolean | undefined;
  show_main_brush_life?: boolean | undefined;
  show_side_brush_life?: boolean | undefined;
  show_sensor_life?: boolean | undefined;

  // Component Wear Entity Overrides (for custom sensors)
  filter_entity?: string | undefined;
  main_brush_entity?: string | undefined;
  side_brush_entity?: string | undefined;
  sensor_entity?: string | undefined;

  // Control Configuration
  control_layout?: 'row' | 'grid' | 'compact' | undefined;
  show_start_button?: boolean | undefined;
  show_pause_button?: boolean | undefined;
  show_stop_button?: boolean | undefined;
  show_dock_button?: boolean | undefined;
  show_locate_button?: boolean | undefined;
  show_fan_speed?: boolean | undefined;
  show_room_selection?: boolean | undefined;
  show_zone_cleanup?: boolean | undefined;

  // Animation Configuration
  enable_animations?: boolean | undefined;
  animation_cleaning?: 'spin' | 'pulse' | 'rotate' | 'bounce' | 'none' | undefined;
  animation_returning?: 'slide' | 'pulse' | 'blink' | 'none' | undefined;
  animation_docking?: 'slide' | 'fade' | 'pulse' | 'none' | undefined;
  animation_charging?: 'pulse' | 'glow' | 'breathe' | 'none' | undefined;
  animation_speed?: 'slow' | 'normal' | 'fast' | undefined;
  custom_vacuum_image?: string | undefined;
  custom_vacuum_image_cleaning?: string | undefined;

  // Map Display Configuration
  map_display_mode?: 'swipe' | 'toggle' | 'always' | 'none' | undefined;
  map_height?: number | undefined;
  map_border_radius?: number | undefined;
  map_refresh_rate?: number | undefined; // in seconds

  // Styling
  vacuum_icon?: string | undefined;
  vacuum_image?: string | undefined;
  vacuum_size?: number | undefined;
  icon_size?: number | undefined;
  primary_color?: string | undefined;
  background_style?: 'transparent' | 'card' | 'gradient' | undefined;
  status_color_cleaning?: string | undefined;
  status_color_returning?: string | undefined;
  status_color_docked?: string | undefined;
  status_color_idle?: string | undefined;
  status_color_error?: string | undefined;
  battery_color_high?: string | undefined;
  battery_color_medium?: string | undefined;
  battery_color_low?: string | undefined;
  battery_threshold_medium?: number | undefined; // Percentage threshold for medium (default: 50)
  battery_threshold_low?: number | undefined; // Percentage threshold for low (default: 20)

  // Integration Detection
  detected_integration?:
    | 'generic'
    | 'xiaomi'
    | 'roborock'
    | 'valetudo'
    | 'ecovacs'
    | 'neato'
    | 'roomba'
    | 'eufy'
    | 'shark'
    | 'tuya'
    | undefined;

  // Rooms/Segments Configuration (integration-specific)
  rooms?: VacuumRoom[] | undefined;
  zones?: VacuumZone[] | undefined;

  // Actions
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;

  // Card Layout Sections (drag-and-drop customization)
  display_sections?: VacuumDisplaySection[] | undefined;
  section_order?: string[] | undefined; // Array of section IDs in display order
}

// Vacuum display section types for drag-and-drop card layout
export type VacuumSectionType =
  | 'vacuum_image'
  | 'title_status'
  | 'battery'
  | 'current_room'
  | 'fan_speed'
  | 'current_stats'
  | 'last_clean'
  | 'total_stats'
  | 'component_life'
  | 'errors'
  | 'dnd'
  | 'volume'
  | 'quick_controls'
  | 'map';

// Vacuum display section configuration for customizable card layout
export interface VacuumDisplaySection {
  id: string; // Unique identifier
  type: VacuumSectionType; // Section type
  enabled: boolean; // Visibility toggle
  order?: number | undefined; // Display order (for drag-drop reordering)
  column?: 'left' | 'right' | undefined; // Column assignment for double-column layout
  settings?: {
    // Common visual settings
    show_icon?: boolean | undefined;
    show_label?: boolean | undefined;
    show_value?: boolean | undefined;
    show_graph?: boolean | undefined;
    show_percentage?: boolean | undefined;
    show_title?: boolean | undefined; // Section title visibility

    // Sizing
    icon_size?: number | undefined;
    font_size?: number | undefined;
    bar_height?: number | undefined;

    // Spacing/Margins
    margin_top?: number | undefined;
    margin_right?: number | undefined;
    margin_bottom?: number | undefined;
    margin_left?: number | undefined;

    // Colors
    icon_color?: string | undefined;
    label_color?: string | undefined;
    value_color?: string | undefined;
    bar_color?: string | undefined;
    background_color?: string | undefined;
    color?: string | undefined; // Generic color for icons/elements
    error_color?: string | undefined; // Error section color
    button_color?: string | undefined; // Button color for DND, quick controls

    // Entity override (allows manual entity selection)
    entity_override?: string | undefined;

    // Section-specific settings
    // Component life specific
    show_filter?: boolean | undefined;
    show_main_brush?: boolean | undefined;
    show_side_brush?: boolean | undefined;
    show_sensor?: boolean | undefined;
    filter_entity_override?: string | undefined;
    main_brush_entity_override?: string | undefined;
    side_brush_entity_override?: string | undefined;
    sensor_entity_override?: string | undefined;

    // Quick controls specific
    show_start?: boolean | undefined;
    show_pause?: boolean | undefined;
    show_stop?: boolean | undefined;
    show_dock?: boolean | undefined;
    show_locate?: boolean | undefined;
    control_layout?: 'row' | 'grid' | 'compact' | undefined;

    // Vacuum image specific
    custom_image?: string | undefined;

    // Map section specific
    display_mode?: 'below_vacuum' | 'replace_vacuum' | 'swipe' | undefined;

    // Fan speed specific
    style?: 'default' | 'speed_only' | 'compact' | undefined;
  };
}

// Vacuum room configuration for room selection
export interface VacuumRoom {
  id: string;
  name: string;
  icon?: string | undefined;
  segment_id?: string | number | undefined; // Integration-specific room/segment ID
}

// Vacuum zone configuration for zone cleanup
export interface VacuumZone {
  id: string;
  name: string;
  icon?: string | undefined;
  coordinates?: number[] | undefined; // [x1, y1, x2, y2] or integration-specific format
}

// ========================================
// CALENDAR MODULE TYPES (Pro Feature)
// ========================================

// Calendar view types
export type CalendarViewType = 'compact_list' | 'month' | 'week' | 'day' | 'table' | 'grid';

// First day of week options
export type FirstDayOfWeek = 'sunday' | 'monday' | 'saturday';

// Week number format
export type WeekNumberFormat = 'none' | 'iso' | 'us';

// Calendar entity configuration
export interface CalendarEntityConfig {
  id: string;
  entity: string;
  name?: string | undefined;
  color?: string | undefined;
  visible?: boolean | undefined;
}

// Calendar event from Home Assistant
export interface CalendarEventData {
  uid?: string | undefined;
  summary: string;
  start: string | { dateTime?: string | undefined; date?: string };
  end: string | { dateTime?: string | undefined; date?: string };
  description?: string | undefined;
  location?: string | undefined;
  recurrence_id?: string | undefined;
  rrule?: string | undefined;
}

// Processed calendar event with additional metadata
export interface ProcessedCalendarEvent {
  id: string;
  calendarId: string;
  calendarColor: string;
  calendarName: string;
  summary: string;
  description?: string | undefined;
  location?: string | undefined;
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
  start_date?: string | undefined;

  // Title configuration
  title?: string | undefined;
  show_title?: boolean | undefined;
  title_font_size?: string | undefined;
  title_color?: string | undefined;
  show_title_separator?: boolean | undefined;
  title_separator_color?: string | undefined;
  title_separator_width?: string | undefined;

  // View-specific options
  // Compact list view
  compact_events_to_show?: number | undefined;
  compact_show_all_day_events?: boolean | undefined;
  compact_hide_empty_days?: boolean | undefined;
  // Auto-fit to height options
  compact_auto_fit_height?: boolean | undefined; // Enable height-based fitting instead of count
  compact_height?: string | undefined; // Container height (e.g., "300px", "50vh")
  compact_overflow?: 'scroll' | 'hidden' | undefined; // Overflow behavior
  compact_show_nav_buttons?: boolean | undefined; // Show scroll navigation buttons when overflow is hidden

  // Month view
  show_week_numbers?: WeekNumberFormat | undefined;
  first_day_of_week?: FirstDayOfWeek | undefined;
  month_show_event_count?: boolean | undefined;

  // Week view
  week_start_hour?: number | undefined;
  week_end_hour?: number | undefined;
  week_time_interval?: number | undefined;

  // Day view
  day_start_hour?: number | undefined;
  day_end_hour?: number | undefined;
  day_time_interval?: number | undefined;

  // Table view
  table_show_date_column?: boolean | undefined;
  table_show_time_column?: boolean | undefined;
  table_show_calendar_column?: boolean | undefined;
  table_show_location_column?: boolean | undefined;
  table_show_duration_column?: boolean | undefined;

  // Grid view
  grid_columns?: number | undefined;
  grid_card_height?: string | undefined;

  // Event display options
  show_event_time?: boolean | undefined;
  show_end_time?: boolean | undefined;
  show_event_location?: boolean | undefined;
  show_event_description?: boolean | undefined;
  show_event_icon?: boolean | undefined;
  time_24h?: boolean | undefined;
  remove_location_country?: boolean | undefined;
  max_event_title_length?: number | undefined;
  show_past_events?: boolean | undefined;

  // Date column styling
  date_vertical_alignment?: 'top' | 'middle' | 'bottom' | undefined;
  weekday_font_size?: string | undefined;
  weekday_color?: string | undefined;
  day_font_size?: string | undefined;
  day_color?: string | undefined;
  show_month?: boolean | undefined;
  month_font_size?: string | undefined;
  month_color?: string | undefined;

  // Event styling
  event_font_size?: string | undefined;
  event_color?: string | undefined;
  time_font_size?: string | undefined;
  time_color?: string | undefined;
  time_icon_size?: string | undefined;
  location_font_size?: string | undefined;
  location_color?: string | undefined;
  location_icon_size?: string | undefined;
  description_font_size?: string | undefined;
  description_color?: string | undefined;

  // Background and accent styling
  event_background_opacity?: number | undefined;
  vertical_line_width?: string | undefined;
  accent_color?: string | undefined;

  // Layout and spacing
  row_spacing?: string | undefined;
  event_spacing?: string | undefined;
  additional_card_spacing?: string | undefined;

  // Separators
  show_day_separator?: boolean | undefined;
  day_separator_width?: string | undefined;
  day_separator_color?: string | undefined;
  show_week_separator?: boolean | undefined;
  week_separator_width?: string | undefined;
  week_separator_color?: string | undefined;
  month_separator_width?: string | undefined;
  month_separator_color?: string | undefined;

  // Expand/collapse functionality
  tap_action_expand?: boolean | undefined;

  // Refresh interval (in minutes)
  refresh_interval?: number | undefined;

  // Event filtering
  filter_keywords?: string[] | undefined;
  filter_mode?: 'include' | 'exclude' | undefined;

  // Language override
  language?: string | undefined;

  // Actions
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;
  event_tap_action?: ModuleActionConfig | undefined;

  // Template support
  template_mode?: boolean | undefined;
  template?: string | undefined;

  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
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
    record?: string | undefined; // e.g., "10-5"
    color?: string | undefined; // Primary team color
  };
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number | null;
    record?: string | undefined;
    color?: string | undefined;
  };

  // Game status
  status: SportsGameStatus;
  statusDetail?: string | undefined; // e.g., "4th Quarter", "Top 7th"
  clock?: string | undefined; // e.g., "5:32", "3rd Period"
  period?: number | string | undefined;

  // Schedule information
  gameTime: Date | null;
  venue?: string | undefined;
  broadcast?: string | undefined; // e.g., "ESPN", "FOX"

  // Odds (if available)
  odds?: {
    spread?: string | undefined;
    overUnder?: string | undefined;
  } | undefined;

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
  color?: string | undefined;
}

// Sports score module configuration
export interface SportsScoreModule extends BaseModule {
  type: 'sports_score';

  // Data source configuration
  data_source: 'ha_sensor' | 'espn_api';
  sensor_entity?: string | undefined; // For HA sensor mode
  league?: SportsLeague | undefined; // For ESPN API mode
  team_id?: string | undefined; // ESPN team ID for API mode
  team_name?: string | undefined; // Display name for reference

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
  home_team_color?: string | undefined;
  away_team_color?: string | undefined;
  use_team_colors?: boolean | undefined; // Auto-detect from logos
  win_color?: string | undefined;
  loss_color?: string | undefined;
  in_progress_color?: string | undefined;
  scheduled_color?: string | undefined;
  text_color?: string | undefined; // Custom text color override for better readability

  // Font sizes
  team_name_font_size?: string | undefined;
  score_font_size?: string | undefined;
  detail_font_size?: string | undefined;

  // Layout options
  logo_size?: string | undefined; // e.g., "48px"
  compact_mode?: boolean | undefined;

  // Logo BG style options
  show_logo_background?: boolean | undefined; // Show/hide watermark logos in Logo BG style
  logo_background_size?: string | undefined; // Size of background logo watermarks (e.g., "80px")
  logo_background_opacity?: number | undefined; // Opacity of background logos (0-100)

  // Actions
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_background_color?: string | undefined;
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
  badge_text?: string | undefined; // Reserved for future use
  badge_text_repeat?: number | undefined; // Reserved for future use

  // Visual settings
  badge_size?: number | undefined; // Overall badge size in pixels (60-300)
  inner_badge_ratio?: number | undefined; // Size of inner circle relative to outer (0.4-0.8)

  // Gradient colors for the ring
  gradient_color_1?: string | undefined; // Default: #4ecdc4 (Teal)
  gradient_color_2?: string | undefined; // Default: #44a8b3 (Blue-teal)
  gradient_color_3?: string | undefined; // Default: #7c5ce0 (Purple)
  gradient_color_4?: string | undefined; // Default: #6366f1 (Indigo)

  // Animation settings
  rotation_speed?: number | undefined; // Seconds for full rotation (3-30)
  rotation_direction?: 'clockwise' | 'counter-clockwise' | undefined;
  enable_color_shift?: boolean | undefined; // Animate gradient colors shifting
  color_shift_speed?: number | undefined; // Seconds for color cycle (2-20)
  enable_glow?: boolean | undefined; // Add soft glow around badge
  glow_intensity?: number | undefined; // Glow strength (0.1-1)
  enable_pulse?: boolean | undefined; // Add subtle pulsing animation
  pulse_speed?: number | undefined; // Pulse duration in seconds (0.5-5)

  // Inner content configuration
  inner_content_type?: 'icon' | 'text' | 'image' | undefined;
  inner_icon?: string | undefined; // MDI icon (default: mdi:crown)
  inner_text?: string | undefined; // Short text (e.g., "PRO")
  inner_image_url?: string | undefined; // URL to image

  // Inner styling
  inner_background_type?: 'solid' | 'gradient' | 'transparent' | undefined;
  inner_background_color?: string | undefined; // For solid type
  inner_text_color?: string | undefined;
  inner_icon_color?: string | undefined;

  // Text styling (fixed - not user configurable)
  text_font_size?: number | undefined; // Reserved
  text_font_weight?: number | undefined; // Reserved
  text_letter_spacing?: number | undefined; // Reserved

  // Actions
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_scale?: number | undefined; // Scale on hover (1.0-1.2)
  hover_background_color?: string | undefined;
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
export type GridLoadAnimation =
  | 'fadeIn'
  | 'slideUp'
  | 'zoomIn'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'none';

// Metro size options
export type MetroSize = 'small' | 'medium' | 'large';

// Individual entity in the grid
export interface GridEntity {
  id: string;
  entity: string;

  // Optional display overrides
  custom_name?: string | undefined;
  custom_icon?: string | undefined;
  custom_color?: string | undefined;
  custom_background?: string | undefined;

  // Per-item action overrides
  override_actions?: boolean | undefined;
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  // Metro mode: custom tile size
  metro_size?: MetroSize | undefined;

  // State-based color overrides
  state_colors?: Record<string, string> | undefined;

  // Hidden flag for filtering
  hidden?: boolean | undefined;

  // Individual entity display logic (conditional visibility)
  display_mode?: 'always' | 'every' | 'any' | undefined;
  display_conditions?: DisplayCondition[] | undefined;
}

// Grid Module configuration
export interface GridModule extends BaseModule {
  type: 'grid';

  // Entity Management
  entities: GridEntity[];
  enable_auto_filter?: boolean | undefined;
  include_domains?: string[] | undefined;
  exclude_domains?: string[] | undefined;
  exclude_entities?: string[] | undefined;
  // Keyword filtering - matches against entity_id
  include_keywords?: string[] | undefined;
  exclude_keywords?: string[] | undefined;

  // Layout Configuration
  grid_style: GridStylePreset;
  grid_display_mode: GridDisplayMode;
  columns: number; // 1-12, default 4
  columns_mobile?: number | undefined; // 1-12, optional; when set, used on viewports ≤600px; otherwise same as columns
  rows?: number | undefined; // auto (0 or undefined) or fixed number
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
  global_name_color?: string | undefined;
  global_state_color?: string | undefined;
  global_icon_color?: string | undefined;
  global_background_color?: string | undefined;
  global_border_radius: string; // e.g., "8px" or "50%"
  global_padding: string; // e.g., "12px"
  global_border_width?: number | undefined;
  global_border_color?: string | undefined;

  // State-based styling
  global_on_color?: string | undefined;
  global_off_color?: string | undefined;
  global_unavailable_color?: string | undefined;

  // Style-specific colors
  // Glass style (style_16)
  glass_tint_color?: string | undefined;
  glass_blur_amount?: number | undefined;
  glass_border_color?: string | undefined;

  // Gradient style (style_17)
  gradient_start_color?: string | undefined;
  gradient_end_color?: string | undefined;
  gradient_direction?: 'to-bottom' | 'to-right' | 'to-bottom-right' | 'to-bottom-left' | undefined;

  // Panel style (style_15)
  panel_header_color?: string | undefined;
  panel_header_text_color?: string | undefined;

  // Split style (style_18)
  split_left_color?: string | undefined;
  split_right_color?: string | undefined;

  // Neumorphic style (style_19)
  neumorphic_light_shadow?: string | undefined;
  neumorphic_dark_shadow?: string | undefined;

  // Accent Border style (style_20)
  accent_border_color?: string | undefined;

  // Card style (style_11)
  card_shadow_color?: string | undefined;

  // Global Actions (can be overridden per-item)
  tap_action: ModuleActionConfig;
  hold_action: ModuleActionConfig;
  double_tap_action: ModuleActionConfig;

  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_effect?: 'none' | 'scale' | 'glow' | 'lift' | 'color' | undefined;
  hover_scale?: number | undefined; // e.g., 1.05
  hover_background_color?: string | undefined;
  hover_glow_color?: string | undefined;

  // Template support
  template_mode?: boolean | undefined;
  template?: string | undefined;
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
}

// Media Player Module - Full-featured media player controls
export interface MediaPlayerModule extends BaseModule {
  type: 'media_player';

  // Entity
  entity: string;

  // Layout
  layout?: 'compact' | 'card' | 'mini' | undefined;
  card_size?: number | undefined; // For card layout album art size (default: 280)

  // Display Toggles
  show_name?: boolean | undefined;
  show_album_art?: boolean | undefined;
  show_track_info?: boolean | undefined;
  show_progress?: boolean | undefined;
  show_duration?: boolean | undefined;
  show_controls?: boolean | undefined;
  show_volume?: boolean | undefined;
  show_source?: boolean | undefined;
  show_shuffle?: boolean | undefined;
  show_repeat?: boolean | undefined;
  show_sound_mode?: boolean | undefined;
  show_stop_button?: boolean | undefined;
  show_album_name?: boolean | undefined;

  // Behavior
  enable_seek?: boolean | undefined;
  auto_hide_when_off?: boolean | undefined;
  expandable?: boolean | undefined;

  // Visual
  dynamic_colors?: boolean | undefined;
  blurred_background?: boolean | undefined;
  blur_amount?: number | undefined;
  blur_opacity?: number | undefined;
  blur_expand?: boolean | undefined;
  animated_visuals?: boolean | undefined;
  visualizer_type?:
    | 'rings'
    | 'bars'
    | 'wave'
    | 'dots'
    | 'spectrum'
    | 'pulse'
    | 'orbit'
    | 'spiral'
    | 'equalizer'
    | 'particles'
    | undefined;

  // Customization
  fallback_icon?: string | undefined;
  play_icon?: string | undefined;
  pause_icon?: string | undefined;
  stop_icon?: string | undefined;
  previous_icon?: string | undefined;
  next_icon?: string | undefined;
  shuffle_icon?: string | undefined;
  repeat_icon?: string | undefined;
  repeat_one_icon?: string | undefined;
  volume_muted_icon?: string | undefined;
  volume_low_icon?: string | undefined;
  volume_medium_icon?: string | undefined;
  volume_high_icon?: string | undefined;

  // Colors (when not using dynamic colors)
  background_color?: string | undefined;
  text_color?: string | undefined;
  progress_color?: string | undefined;
  progress_background?: string | undefined;
  button_color?: string | undefined;
  button_active_color?: string | undefined;
  album_art_border_radius?: string | undefined;

  // Standard Ultra Card properties
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
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
    entity?: string | undefined;
    navigation_path?: string | undefined;
    url_path?: string | undefined;
    service?: string | undefined;
    service_data?: Record<string, any> | undefined;
  } | undefined;
}

// ============================================
// PEOPLE MODULE TYPES
// ============================================

// Layout styles for the People module
export type PeopleLayoutStyle =
  | 'compact' // Centered avatar, name, location below
  | 'banner' // Background image with avatar overlay
  | 'horizontal_compact' // Avatar and info side-by-side
  | 'horizontal_detailed' // Avatar with multiple data rows
  | 'header' // Horizontal with icons and badges
  | 'music_overlay'; // Shows currently playing media

// Status badge positions
export type StatusBadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

// Data item types for the People module
export type PeopleDataItemType =
  | 'location' // Current zone/location
  | 'battery' // Phone battery level
  | 'time_info' // Time at location, ETA, duration
  | 'media' // Currently playing music/podcast
  | 'sensor' // Custom sensor entity
  | 'device_state' // Device connectivity (WiFi, VPN, Bluetooth)
  | 'attribute' // Person or device tracker attribute
  | 'toggle'; // Toggle switch for an entity

// Individual data item configuration
export interface PeopleDataItem {
  id: string;
  type: PeopleDataItemType;
  label?: string | undefined; // Custom label override
  entity?: string | undefined; // For sensor/device_state/toggle types
  attribute?: string | undefined; // For attribute type
  icon?: string | undefined; // Custom icon override
  show_icon: boolean;
  show_label: boolean;
  show_value: boolean;
  format?: string | undefined; // Template for custom formatting
  // Styling
  icon_color?: string | undefined;
  label_color?: string | undefined;
  value_color?: string | undefined;
  icon_size?: number | undefined;
  font_size?: number | undefined;
  // Time info specific
  time_format?: 'relative' | 'absolute' | 'duration' | undefined;
  // Toggle specific
  toggle_on_color?: string | undefined;
  toggle_off_color?: string | undefined;
}

// Avatar settings for the People module
export interface PeopleAvatarSettings {
  size: number; // Avatar size in pixels
  border_color?: string | undefined; // Border color (can use state-based colors)
  border_width: number; // Border width in pixels
  show_status_badge: boolean; // Show home/away status badge
  status_badge_position: StatusBadgePosition;
  status_badge_home_color?: string | undefined; // Color when home
  status_badge_away_color?: string | undefined; // Color when away
  use_state_color: boolean; // Use dynamic border color based on location
  state_home_color?: string | undefined; // Border color when home
  state_away_color?: string | undefined; // Border color when away
  fallback_icon?: string | undefined; // Icon when no avatar is available
  show_entity_picture: boolean; // Use entity_picture from person entity
  custom_image?: string | undefined; // URL to custom avatar image
  image_fit?: 'cover' | 'contain' | 'fill' | undefined;
}

// Banner settings for banner layout style
export interface PeopleBannerSettings {
  background_type: 'image' | 'gradient' | 'color' | 'entity';
  background_image?: string | undefined; // URL to background image
  background_entity?: string | undefined; // Entity with entity_picture attribute
  background_color?: string | undefined; // Solid color background
  gradient_start?: string | undefined; // Gradient start color
  gradient_end?: string | undefined; // Gradient end color
  gradient_direction?: 'to-bottom' | 'to-right' | 'to-bottom-right' | 'to-bottom-left' | undefined;
  background_blur: number; // Blur amount (0-20)
  background_opacity: number; // Opacity (0-100)
  overlay_color?: string | undefined; // Color overlay on background
  overlay_opacity?: number | undefined; // Overlay opacity (0-100)
  banner_height?: number | undefined; // Banner height in pixels
  border_radius?: number | undefined; // Border radius for all corners (in pixels) - used when corners are linked
  border_radius_top_left?: number | undefined; // Individual top-left corner radius
  border_radius_top_right?: number | undefined; // Individual top-right corner radius
  border_radius_bottom_left?: number | undefined; // Individual bottom-left corner radius
  border_radius_bottom_right?: number | undefined; // Individual bottom-right corner radius
  corners_linked?: boolean | undefined; // Whether all corners use the same radius
}

// Name settings for the People module
export interface PeopleNameSettings {
  show: boolean;
  use_friendly_name: boolean; // Use entity's friendly_name
  custom_name?: string | undefined; // Override name
  font_size: number;
  font_weight: string;
  color?: string | undefined;
  alignment?: 'left' | 'center' | 'right' | undefined;
}

// Location display settings
export interface PeopleLocationSettings {
  show: boolean;
  show_icon: boolean;
  icon?: string | undefined;
  icon_color?: string | undefined;
  font_size: number;
  color?: string | undefined;
  show_duration: boolean; // Show time at current location
  duration_format?: 'relative' | 'absolute' | undefined;
}

// People Module - Full configuration
export interface PeopleModule extends BaseModule {
  type: 'people';

  // Entity Configuration
  person_entity: string; // person.* entity

  // Layout Style
  layout_style: PeopleLayoutStyle;

  // Data Items (user-orderable) - per layout for independent customization
  data_items: PeopleDataItem[]; // Legacy/fallback
  data_items_compact?: PeopleDataItem[] | undefined;
  data_items_banner?: PeopleDataItem[] | undefined;
  data_items_horizontal_compact?: PeopleDataItem[] | undefined;
  data_items_horizontal_detailed?: PeopleDataItem[] | undefined;
  data_items_header?: PeopleDataItem[] | undefined;
  data_items_music_overlay?: PeopleDataItem[] | undefined;

  // Avatar Settings
  avatar_settings: PeopleAvatarSettings;

  // Banner Settings (for banner layout)
  banner_settings?: PeopleBannerSettings | undefined;

  // Name Settings
  name_settings: PeopleNameSettings;

  // Location Settings (for quick access, also available in data_items)
  location_settings: PeopleLocationSettings;

  // Associated Entities (for data items to reference)
  battery_entity?: string | undefined; // Device tracker or sensor with battery
  media_player_entity?: string | undefined; // Media player for music display

  // Element Visibility Toggles
  show_location_badge?: boolean | undefined; // Show location badge beside avatar
  show_battery_badge?: boolean | undefined; // Show battery badge beside avatar
  show_avatar?: boolean | undefined; // Show avatar image

  // Layout & Spacing
  gap: number; // Gap between elements
  data_items_gap: number; // Gap between data items
  data_area_height?: number | undefined; // Height of data items area (0 for auto)
  data_items_direction: 'row' | 'column'; // Layout direction for data items
  alignment: 'left' | 'center' | 'right';
  vertical_alignment: 'top' | 'center' | 'bottom';

  // Header style specific (compact info row)
  header_show_badges: boolean;
  header_badges_position: 'top' | 'bottom';

  // Music overlay specific
  music_show_progress: boolean;
  music_show_album_art: boolean;
  music_blur_background: boolean;
  music_album_blur?: number | undefined; // Blur amount for album art (0-20)
  music_album_opacity?: number | undefined; // Opacity for album art background (0-100)

  // Actions
  tap_action?: ModuleActionConfig | undefined;
  hold_action?: ModuleActionConfig | undefined;
  double_tap_action?: ModuleActionConfig | undefined;

  // Hover configuration
  enable_hover_effect?: boolean | undefined;
  hover_effect?: 'none' | 'scale' | 'glow' | 'lift' | 'color' | undefined;
  hover_scale?: number | undefined;
  hover_background_color?: string | undefined;
  hover_glow_color?: string | undefined;

  // Template support
  template_mode?: boolean | undefined;
  template?: string | undefined;
  unified_template_mode?: boolean | undefined;
  unified_template?: string | undefined;
}
