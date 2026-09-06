import { UC_BUTTON_SURFACE_STYLES } from '../utils/uc-surface-styles';

/**
 * Option lists for every module style key a theme may default
 * (`UC_THEME_MODULE_STYLE_KEYS`). Used by the theme editor in the Hub so an
 * author picks from real values instead of typing enum strings.
 */

export interface UcThemeModuleOption {
  value: string;
  label: string;
}

export interface UcThemeModuleField {
  moduleType: string;
  moduleLabel: string;
  key: string;
  label: string;
  /** `select` with options, or `number` with a range. */
  kind: 'select' | 'number';
  options?: readonly UcThemeModuleOption[] | undefined;
  min?: number | undefined;
  max?: number | undefined;
}

const titleCase = (s: string) =>
  s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const surface = (extra: string[] = []): UcThemeModuleOption[] =>
  [...UC_BUTTON_SURFACE_STYLES, ...extra].map(v => ({ value: v, label: titleCase(v) }));

const GRID_STYLE_LABELS: Record<string, string> = {
  style_1: 'Name / icon / state',
  style_2: 'Icon above state',
  style_3: 'Icon left, text right',
  style_4: 'Large icon, state badge',
  style_5: 'Icon + name, state below',
  style_6: 'Icon only',
  style_7: 'Icon + state',
  style_8: 'Text only',
  style_9: 'Ring progress',
  style_10: 'Square tile',
  style_11: 'Card with shadow',
  style_12: 'Button with border',
  style_13: 'Horizontal list',
  style_14: 'Rounded badge',
  style_15: 'Panel with header',
  style_16: 'Glass morphism',
  style_17: 'Gradient',
  style_18: 'Split colour',
  style_19: 'Neumorphic',
  style_20: 'Flat, accent border',
};

export const UC_THEME_MODULE_FIELDS: readonly UcThemeModuleField[] = [
  { moduleType: 'button', moduleLabel: 'Button', key: 'style', label: 'Style', kind: 'select', options: surface() },
  {
    moduleType: 'bar',
    moduleLabel: 'Bar',
    key: 'bar_style',
    label: 'Bar style',
    kind: 'select',
    options: surface(['dashed', 'dots', 'minimal']),
  },
  { moduleType: 'bar', moduleLabel: 'Bar', key: 'glass_blur_amount', label: 'Glass blur (px)', kind: 'number', min: 0, max: 40 },
  {
    moduleType: 'slider_control',
    moduleLabel: 'Slider Control',
    key: 'slider_style',
    label: 'Slider style',
    kind: 'select',
    options: surface(['minimal']),
  },
  {
    moduleType: 'slider_control',
    moduleLabel: 'Slider Control',
    key: 'glass_blur_amount',
    label: 'Glass blur (px)',
    kind: 'number',
    min: 0,
    max: 40,
  },
  { moduleType: 'spinbox', moduleLabel: 'Spinbox', key: 'button_style', label: 'Button style', kind: 'select', options: surface() },
  {
    moduleType: 'spinbox',
    moduleLabel: 'Spinbox',
    key: 'button_shape',
    label: 'Button shape',
    kind: 'select',
    options: ['rounded', 'square', 'circle'].map(v => ({ value: v, label: titleCase(v) })),
  },
  {
    moduleType: 'popup',
    moduleLabel: 'Popup',
    key: 'trigger_button_style',
    label: 'Trigger button style',
    kind: 'select',
    options: surface(),
  },
  {
    moduleType: 'grid',
    moduleLabel: 'Grid',
    key: 'grid_style',
    label: 'Tile style',
    kind: 'select',
    options: Object.entries(GRID_STYLE_LABELS).map(([value, label]) => ({ value, label })),
  },
  {
    moduleType: 'navigation',
    moduleLabel: 'Navigation',
    key: 'nav_style',
    label: 'Navbar preset',
    kind: 'select',
    options: [
      'uc_modern',
      'uc_minimal',
      'uc_ios_glass',
      'uc_material',
      'uc_floating',
      'uc_docked',
      'uc_neumorphic',
      'uc_gradient',
      'uc_sidebar',
      'uc_compact',
    ].map(v => ({ value: v, label: titleCase(v.replace(/^uc_/, '')) })),
  },
  {
    moduleType: 'area_summary',
    moduleLabel: 'Area Summary',
    key: 'style_preset',
    label: 'Preset',
    kind: 'select',
    options: ['iconic_soft', 'graph_glow', 'compact_controls', 'photo_overlay'].map(v => ({
      value: v,
      label: titleCase(v),
    })),
  },
  {
    moduleType: 'area_summary',
    moduleLabel: 'Area Summary',
    key: 'tile_border_radius',
    label: 'Tile radius (px)',
    kind: 'number',
    min: 0,
    max: 60,
  },
  {
    moduleType: 'auto_entity_list',
    moduleLabel: 'Auto Entity List',
    key: 'row_style',
    label: 'Row style',
    kind: 'select',
    options: ['compact', 'detailed', 'slim', 'card'].map(v => ({ value: v, label: titleCase(v) })),
  },
  {
    moduleType: 'unifi',
    moduleLabel: 'UniFi',
    key: 'rack_style',
    label: 'Rack style',
    kind: 'select',
    options: ['dark', 'light', 'glass', 'blueprint', 'blank'].map(v => ({ value: v, label: titleCase(v) })),
  },
  {
    moduleType: 'tabs',
    moduleLabel: 'Tabs',
    key: 'style',
    label: 'Style',
    kind: 'select',
    options: ['default', 'simple', 'simple_2', 'simple_3', 'switch_1', 'switch_2', 'switch_3', 'modern', 'trendy'].map(
      v => ({ value: v, label: titleCase(v) })
    ),
  },
  {
    moduleType: 'activity_feed',
    moduleLabel: 'Activity Feed',
    key: 'feed_card_style',
    label: 'Card style',
    kind: 'select',
    options: ['flat', 'elevated', 'outlined'].map(v => ({ value: v, label: titleCase(v) })),
  },
];
