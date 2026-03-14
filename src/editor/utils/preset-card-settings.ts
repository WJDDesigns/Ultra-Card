import type { PresetDefinition, UltraCardConfig } from '../../types';

export function getPresetCardSettingsUpdates(
  cardSettings: PresetDefinition['cardSettings']
): Partial<UltraCardConfig> {
  if (!cardSettings) {
    return {};
  }

  const updates: Partial<UltraCardConfig> = {};

  if (cardSettings.card_background !== undefined) {
    updates.card_background = cardSettings.card_background;
  }
  if (cardSettings.card_border_radius !== undefined) {
    updates.card_border_radius = cardSettings.card_border_radius;
  }
  if (cardSettings.card_border_color !== undefined) {
    updates.card_border_color = cardSettings.card_border_color;
  }
  if (cardSettings.card_border_width !== undefined) {
    updates.card_border_width = cardSettings.card_border_width;
  }
  if (cardSettings.card_padding !== undefined) {
    updates.card_padding = cardSettings.card_padding;
  }
  if (cardSettings.card_margin !== undefined) {
    updates.card_margin = cardSettings.card_margin;
  }
  if (cardSettings.card_overflow !== undefined) {
    updates.card_overflow = cardSettings.card_overflow;
  }
  if (cardSettings.card_shadow_enabled !== undefined) {
    updates.card_shadow_enabled = cardSettings.card_shadow_enabled;
  }
  if (cardSettings.card_shadow_color !== undefined) {
    updates.card_shadow_color = cardSettings.card_shadow_color;
  }
  if (cardSettings.card_shadow_horizontal !== undefined) {
    updates.card_shadow_horizontal = cardSettings.card_shadow_horizontal;
  }
  if (cardSettings.card_shadow_vertical !== undefined) {
    updates.card_shadow_vertical = cardSettings.card_shadow_vertical;
  }
  if (cardSettings.card_shadow_blur !== undefined) {
    updates.card_shadow_blur = cardSettings.card_shadow_blur;
  }
  if (cardSettings.card_shadow_spread !== undefined) {
    updates.card_shadow_spread = cardSettings.card_shadow_spread;
  }
  if (cardSettings.card_background_image_type !== undefined) {
    updates.card_background_image_type = cardSettings.card_background_image_type;
  }
  if (cardSettings.card_background_image !== undefined) {
    updates.card_background_image = cardSettings.card_background_image;
  }
  if (cardSettings.card_background_size !== undefined) {
    updates.card_background_size = cardSettings.card_background_size;
  }
  if (cardSettings.card_background_repeat !== undefined) {
    updates.card_background_repeat = cardSettings.card_background_repeat;
  }
  if (cardSettings.card_background_position !== undefined) {
    updates.card_background_position = cardSettings.card_background_position;
  }

  return updates;
}
