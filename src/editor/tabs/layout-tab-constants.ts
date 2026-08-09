/**
 * Constants and static data for the Layout tab (module palette, fonts, native cards).
 * Extracted from layout-tab.ts to support future splitting of the layout editor.
 */

import { CURATED_NATIVE_CARDS } from '../../services/uc-native-card-catalog';

export interface FontOption {
  value: string;
  label: string;
  category: string;
}

export interface NativeCardEntry {
  type: string;
  name: string;
  icon?: string | undefined;
  description?: string | undefined;
}

// Typography and font definitions matching the professional interface
export const DEFAULT_FONTS: FontOption[] = [{ value: 'default', label: '– Default –', category: 'default' }];

export const TYPOGRAPHY_FONTS: FontOption[] = [
  { value: 'Montserrat', label: 'Montserrat (used as default font)', category: 'typography' },
];

// Native Home Assistant cards (hui-* elements)
// Special entry for Custom YAML Card - allows pasting any card YAML configuration
export const CUSTOM_YAML_CARD_TYPE = 'custom-yaml-card';

/** Always first in the palette, ahead of the native cards, discovered or not. */
export const CUSTOM_YAML_CARD_ENTRY: NativeCardEntry = {
  type: CUSTOM_YAML_CARD_TYPE,
  name: 'Custom YAML Card',
  icon: 'mdi:code-braces',
  description: 'Paste any card configuration',
};

/**
 * Static baseline for the card palette, used until runtime discovery resolves
 * and whenever it cannot. Descriptions are dropped so the palette keeps showing
 * the element name, which is what it has always shown.
 */
export const NATIVE_HA_CARDS: NativeCardEntry[] = [
  CUSTOM_YAML_CARD_ENTRY,
  ...CURATED_NATIVE_CARDS.map(card => ({ type: card.type, name: card.name })),
];

export const WEB_SAFE_FONTS: FontOption[] = [
  { value: 'Georgia, serif', label: 'Georgia, serif', category: 'websafe' },
  {
    value: 'Palatino Linotype, Book Antiqua, Palatino, serif',
    label: 'Palatino Linotype, Book Antiqua, Palatino, serif',
    category: 'websafe',
  },
  {
    value: 'Times New Roman, Times, serif',
    label: 'Times New Roman, Times, serif',
    category: 'websafe',
  },
  {
    value: 'Arial, Helvetica, sans-serif',
    label: 'Arial, Helvetica, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Impact, Charcoal, sans-serif',
    label: 'Impact, Charcoal, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Lucida Sans Unicode, Lucida Grande, sans-serif',
    label: 'Lucida Sans Unicode, Lucida Grande, sans-serif',
    category: 'websafe',
  },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma, Geneva, sans-serif', category: 'websafe' },
  {
    value: 'Trebuchet MS, Helvetica, sans-serif',
    label: 'Trebuchet MS, Helvetica, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Verdana, Geneva, sans-serif',
    label: 'Verdana, Geneva, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Courier New, Courier, monospace',
    label: 'Courier New, Courier, monospace',
    category: 'websafe',
  },
  {
    value: 'Lucida Console, Monaco, monospace',
    label: 'Lucida Console, Monaco, monospace',
    category: 'websafe',
  },
];
