/**
 * Bridge helpers so module Design tabs can mount the canonical
 * `<ultra-global-design-tab>` with the same property extract/apply shape
 * used by layout-tab.
 */
import type { CardModule } from '../types';
import type { DesignProperties } from './global-design-tab';

/** Extract flat DesignProperties from a module for ultra-global-design-tab. */
export function extractModuleDesignProperties(module: CardModule): DesignProperties {
  const m = module as any;
  const design = m.design || {};
  return {
    color: design.color ?? m.color,
    text_align: design.text_align ?? m.text_align,
    font_size: design.font_size ?? m.font_size,
    line_height: design.line_height ?? m.line_height,
    letter_spacing: design.letter_spacing ?? m.letter_spacing,
    font_family: design.font_family ?? m.font_family,
    font_weight: design.font_weight ?? m.font_weight,
    text_transform: design.text_transform ?? m.text_transform,
    font_style: design.font_style ?? m.font_style,
    white_space: design.white_space ?? m.white_space,
    background_color: design.background_color ?? m.background_color,
    background_image: design.background_image ?? m.background_image,
    background_image_type: design.background_image_type ?? m.background_image_type,
    background_image_entity: design.background_image_entity ?? m.background_image_entity,
    background_repeat: design.background_repeat ?? m.background_repeat,
    background_position: design.background_position ?? m.background_position,
    background_size: design.background_size ?? m.background_size,
    backdrop_filter: design.backdrop_filter ?? m.backdrop_filter,
    background_filter: design.background_filter ?? m.background_filter,
    width: design.width ?? m.width,
    height: design.height ?? m.height,
    max_width: design.max_width ?? m.max_width,
    max_height: design.max_height ?? m.max_height,
    min_width: design.min_width ?? m.min_width,
    min_height: design.min_height ?? m.min_height,
    margin_top: design.margin_top ?? m.margin?.top ?? m.margin_top,
    margin_bottom: design.margin_bottom ?? m.margin?.bottom ?? m.margin_bottom,
    margin_left: design.margin_left ?? m.margin?.left ?? m.margin_left,
    margin_right: design.margin_right ?? m.margin?.right ?? m.margin_right,
    padding_top: design.padding_top ?? m.padding?.top ?? m.padding_top,
    padding_bottom: design.padding_bottom ?? m.padding?.bottom ?? m.padding_bottom,
    padding_left: design.padding_left ?? m.padding?.left ?? m.padding_left,
    padding_right: design.padding_right ?? m.padding?.right ?? m.padding_right,
    border_radius: design.border_radius ?? m.border?.radius ?? m.border_radius,
    border_style: design.border_style ?? m.border?.style ?? m.border_style,
    border_width: design.border_width ?? m.border?.width ?? m.border_width,
    border_color: design.border_color ?? m.border?.color ?? m.border_color,
    position: design.position ?? m.position,
    top: design.top ?? m.top,
    bottom: design.bottom ?? m.bottom,
    left: design.left ?? m.left,
    right: design.right ?? m.right,
    z_index: design.z_index ?? m.z_index,
    overflow: design.overflow ?? m.overflow,
    clip_path: design.clip_path ?? m.clip_path,
    box_shadow_h: design.box_shadow_h ?? m.box_shadow_h,
    box_shadow_v: design.box_shadow_v ?? m.box_shadow_v,
    box_shadow_blur: design.box_shadow_blur ?? m.box_shadow_blur,
    box_shadow_spread: design.box_shadow_spread ?? m.box_shadow_spread,
    box_shadow_color: design.box_shadow_color ?? m.box_shadow_color,
    animation_type: design.animation_type ?? m.animation_type,
    animation_entity: design.animation_entity ?? m.animation_entity,
    animation_trigger_type: design.animation_trigger_type ?? m.animation_trigger_type,
    animation_attribute: design.animation_attribute ?? m.animation_attribute,
    animation_state: design.animation_state ?? m.animation_state,
    animation_duration: design.animation_duration ?? m.animation_duration,
    animation_delay: design.animation_delay ?? m.animation_delay,
    animation_timing: design.animation_timing ?? m.animation_timing,
    intro_animation: design.intro_animation ?? m.intro_animation,
    outro_animation: design.outro_animation ?? m.outro_animation,
    intro_animation_duration: design.intro_animation_duration ?? m.intro_animation_duration,
    intro_animation_delay: design.intro_animation_delay ?? m.intro_animation_delay,
    intro_animation_timing: design.intro_animation_timing ?? m.intro_animation_timing,
    css_variable_prefix: design.css_variable_prefix ?? m.css_variable_prefix,
    extra_class: design.extra_class ?? m.extra_class,
    element_id: design.element_id ?? m.element_id,
  };
}

/**
 * Convert ultra-global-design-tab onUpdate payloads into module updates.
 * Flat props merge into `design`; `{ design: ... }` passes through / merges.
 */
export function applyModuleDesignUpdates(
  module: CardModule,
  updates: Partial<DesignProperties> & { design?: any }
): Record<string, any> {
  if (updates && Object.prototype.hasOwnProperty.call(updates, 'design') && updates.design) {
    return { design: updates.design };
  }

  const existing = { ...((module as any).design || {}) };
  const nextDesign = { ...existing };
  for (const [key, value] of Object.entries(updates || {})) {
    if (key === 'design') continue;
    if (value === undefined || value === '') {
      delete nextDesign[key];
    } else {
      nextDesign[key] = value;
    }
  }

  const combined: Record<string, any> = {
    design: Object.keys(nextDesign).length ? nextDesign : undefined,
  };

  // Mirror common top-level props for backward compatibility
  const mirrorKeys = [
    'color',
    'font_size',
    'font_family',
    'font_weight',
    'text_align',
    'background_color',
    'background_image',
    'background_image_type',
    'background_image_entity',
    'width',
    'height',
  ];
  for (const key of mirrorKeys) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      combined[key] = (updates as any)[key] || undefined;
    }
  }

  return combined;
}
