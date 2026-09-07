/** @vitest-environment node */
/**
 * Gate: every module style key the theme engine may default must have a Hub
 * editor field, and every surface-cascading field must be registered in
 * UC_SURFACE_FIELD_ROLES. Prevents allow-list drift (KEYS without FIELDS,
 * or control modules that cannot inherit recipes.control).
 */
import { describe, it, expect } from 'vitest';
import { UC_THEME_MODULE_STYLE_KEYS } from '../uc-theme-types';
import { UC_THEME_MODULE_FIELDS } from '../uc-theme-module-options';
import { UC_SURFACE_FIELD_ROLES, surfaceRoleFor } from '../../utils/uc-surface-recipes';

describe('theme module style coverage (100%)', () => {
  const fieldMap = new Map<string, Set<string>>();
  for (const f of UC_THEME_MODULE_FIELDS) {
    const set = fieldMap.get(f.moduleType) ?? new Set<string>();
    set.add(f.key);
    fieldMap.set(f.moduleType, set);
  }

  it('every STYLE_KEYS entry has a matching Hub FIELD', () => {
    const missing: string[] = [];
    for (const [moduleType, keys] of Object.entries(UC_THEME_MODULE_STYLE_KEYS)) {
      for (const key of keys) {
        if (!fieldMap.get(moduleType)?.has(key)) {
          missing.push(`${moduleType}.${key}`);
        }
      }
    }
    expect(missing, `Missing FIELDS for: ${missing.join(', ')}`).toEqual([]);
  });

  it('every FIELD is allow-listed in STYLE_KEYS', () => {
    const orphans: string[] = [];
    for (const f of UC_THEME_MODULE_FIELDS) {
      const allowed = UC_THEME_MODULE_STYLE_KEYS[f.moduleType];
      if (!allowed || !allowed.includes(f.key)) {
        orphans.push(`${f.moduleType}.${f.key}`);
      }
    }
    expect(orphans, `Orphan FIELDS: ${orphans.join(', ')}`).toEqual([]);
  });

  it('control surface modules cascade from recipes.control', () => {
    // These must resolve via tokens.recipes so a theme can restyle them once.
    expect(surfaceRoleFor('button', 'style')).toBe('control');
    expect(surfaceRoleFor('popup', 'trigger_button_style')).toBe('control');
    expect(surfaceRoleFor('spinbox', 'button_style')).toBe('control');
    expect(surfaceRoleFor('button_input', 'button_style')).toBe('control');
    expect(surfaceRoleFor('light', 'button_style')).toBe('control');
    expect(surfaceRoleFor('bar', 'bar_style')).toBe('track');
    expect(surfaceRoleFor('slider_control', 'slider_style')).toBe('track');
  });

  it('layout-only style keys are NOT surface-cascaded', () => {
    // Layout/preset vocabularies stay on theme.modules — a glass theme must
    // not silently rewrite grid_style or nav_style via recipes.
    expect(surfaceRoleFor('grid', 'grid_style')).toBeUndefined();
    expect(surfaceRoleFor('navigation', 'nav_style')).toBeUndefined();
    expect(surfaceRoleFor('area_summary', 'style_preset')).toBeUndefined();
    expect(surfaceRoleFor('tabs', 'style')).toBeUndefined();
    expect(surfaceRoleFor('unifi', 'rack_style')).toBeUndefined();
    expect(surfaceRoleFor('activity_feed', 'feed_card_style')).toBeUndefined();
    expect(surfaceRoleFor('auto_entity_list', 'row_style')).toBeUndefined();
  });

  it('STYLE_KEYS includes every surface-cascaded module', () => {
    for (const moduleType of Object.keys(UC_SURFACE_FIELD_ROLES)) {
      expect(
        UC_THEME_MODULE_STYLE_KEYS[moduleType],
        `${moduleType} is in SURFACE_FIELD_ROLES but missing from STYLE_KEYS`
      ).toBeTruthy();
    }
  });
});
