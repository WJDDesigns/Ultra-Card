import { LitElement, html, css, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import '../components/ultra-color-picker';
import '../components/uc-device-selector';
import '../components/ultra-file-picker';
import { UcFormUtils } from '../utils/uc-form-utils';
import { localize } from '../localize/localize';
import { Z_INDEX } from '../utils/uc-z-index';
import { DeviceBreakpoint, DEVICE_BREAKPOINTS, ResponsiveDesignProperties } from '../types';
import { responsiveDesignService } from '../services/uc-responsive-design-service';
import { ucToastService } from '../services/uc-toast-service';
import { getDesignSelectOptions, type DesignSelectOption } from './design-select-options';

// Web-safe fonts that don't require loading
const WEB_SAFE_FONTS = [
  { value: 'Arial, sans-serif', label: 'Arial', category: 'websafe' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica', category: 'websafe' },
  { value: 'Times New Roman, serif', label: 'Times New Roman', category: 'websafe' },
  { value: 'Georgia, serif', label: 'Georgia', category: 'websafe' },
  { value: 'Verdana, sans-serif', label: 'Verdana', category: 'websafe' },
  { value: 'Courier New, monospace', label: 'Courier New', category: 'websafe' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS', category: 'websafe' },
  { value: 'Impact, sans-serif', label: 'Impact', category: 'websafe' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS', category: 'websafe' },
  { value: 'Palatino, serif', label: 'Palatino', category: 'websafe' },
];

// Popular Google Fonts (loaded dynamically from Google CDN)
const GOOGLE_FONTS = [
  { value: 'Roboto', label: 'Roboto', category: 'google' },
  { value: 'Open Sans', label: 'Open Sans', category: 'google' },
  { value: 'Lato', label: 'Lato', category: 'google' },
  { value: 'Montserrat', label: 'Montserrat', category: 'google' },
  { value: 'Oswald', label: 'Oswald', category: 'google' },
  { value: 'Raleway', label: 'Raleway', category: 'google' },
  { value: 'PT Sans', label: 'PT Sans', category: 'google' },
  { value: 'Merriweather', label: 'Merriweather', category: 'google' },
  { value: 'Ubuntu', label: 'Ubuntu', category: 'google' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'google' },
  { value: 'Poppins', label: 'Poppins', category: 'google' },
  { value: 'Nunito', label: 'Nunito', category: 'google' },
  { value: 'Rubik', label: 'Rubik', category: 'google' },
  { value: 'Work Sans', label: 'Work Sans', category: 'google' },
  { value: 'Inter', label: 'Inter', category: 'google' },
  { value: 'Noto Sans', label: 'Noto Sans', category: 'google' },
  { value: 'Fira Sans', label: 'Fira Sans', category: 'google' },
  { value: 'Mukta', label: 'Mukta', category: 'google' },
  { value: 'Quicksand', label: 'Quicksand', category: 'google' },
  { value: 'Karla', label: 'Karla', category: 'google' },
  { value: 'Barlow', label: 'Barlow', category: 'google' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'google' },
  { value: 'IBM Plex Sans', label: 'IBM Plex Sans', category: 'google' },
  { value: 'DM Sans', label: 'DM Sans', category: 'google' },
  { value: 'Titillium Web', label: 'Titillium Web', category: 'google' },
  { value: 'Hind', label: 'Hind', category: 'google' },
  { value: 'Oxygen', label: 'Oxygen', category: 'google' },
  { value: 'Cabin', label: 'Cabin', category: 'google' },
  { value: 'Bitter', label: 'Bitter', category: 'google' },
  { value: 'Crimson Text', label: 'Crimson Text', category: 'google' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', category: 'google' },
  { value: 'Libre Franklin', label: 'Libre Franklin', category: 'google' },
  { value: 'Noto Serif', label: 'Noto Serif', category: 'google' },
  { value: 'Arvo', label: 'Arvo', category: 'google' },
  { value: 'Josefin Sans', label: 'Josefin Sans', category: 'google' },
  { value: 'Anton', label: 'Anton', category: 'google' },
  { value: 'Bebas Neue', label: 'Bebas Neue', category: 'google' },
  { value: 'Dancing Script', label: 'Dancing Script', category: 'google' },
  { value: 'Pacifico', label: 'Pacifico', category: 'google' },
  { value: 'Lobster', label: 'Lobster', category: 'google' },
  { value: 'Caveat', label: 'Caveat', category: 'google' },
  { value: 'Shadows Into Light', label: 'Shadows Into Light', category: 'google' },
  { value: 'Indie Flower', label: 'Indie Flower', category: 'google' },
  { value: 'Cinzel', label: 'Cinzel', category: 'google' },
  { value: 'EB Garamond', label: 'EB Garamond', category: 'google' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond', category: 'google' },
  { value: 'Abril Fatface', label: 'Abril Fatface', category: 'google' },
  { value: 'Righteous', label: 'Righteous', category: 'google' },
  { value: 'Satisfy', label: 'Satisfy', category: 'google' },
  { value: 'Great Vibes', label: 'Great Vibes', category: 'google' },
  { value: 'Permanent Marker', label: 'Permanent Marker', category: 'google' },
  { value: 'Exo 2', label: 'Exo 2', category: 'google' },
  { value: 'Roboto Condensed', label: 'Roboto Condensed', category: 'google' },
  { value: 'Roboto Slab', label: 'Roboto Slab', category: 'google' },
  { value: 'Roboto Mono', label: 'Roboto Mono', category: 'google' },
  { value: 'PT Serif', label: 'PT Serif', category: 'google' },
  { value: 'Slabo 27px', label: 'Slabo 27px', category: 'google' },
  { value: 'Inconsolata', label: 'Inconsolata', category: 'google' },
  { value: 'Source Code Pro', label: 'Source Code Pro', category: 'google' },
  { value: 'Overpass', label: 'Overpass', category: 'google' },
  { value: 'Alegreya', label: 'Alegreya', category: 'google' },
  { value: 'Alegreya Sans', label: 'Alegreya Sans', category: 'google' },
  { value: 'Zilla Slab', label: 'Zilla Slab', category: 'google' },
  { value: 'Manrope', label: 'Manrope', category: 'google' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'google' },
  { value: 'Heebo', label: 'Heebo', category: 'google' },
  { value: 'Archivo', label: 'Archivo', category: 'google' },
  { value: 'Archivo Narrow', label: 'Archivo Narrow', category: 'google' },
  { value: 'Teko', label: 'Teko', category: 'google' },
  { value: 'Yanone Kaffeesatz', label: 'Yanone Kaffeesatz', category: 'google' },
  { value: 'Abel', label: 'Abel', category: 'google' },
  { value: 'Asap', label: 'Asap', category: 'google' },
  { value: 'Assistant', label: 'Assistant', category: 'google' },
  { value: 'Comfortaa', label: 'Comfortaa', category: 'google' },
  { value: 'Dosis', label: 'Dosis', category: 'google' },
  { value: 'Fjalla One', label: 'Fjalla One', category: 'google' },
  { value: 'Kanit', label: 'Kanit', category: 'google' },
  { value: 'Prompt', label: 'Prompt', category: 'google' },
  { value: 'Varela Round', label: 'Varela Round', category: 'google' },
  { value: 'Maven Pro', label: 'Maven Pro', category: 'google' },
  { value: 'Catamaran', label: 'Catamaran', category: 'google' },
  { value: 'Signika', label: 'Signika', category: 'google' },
  { value: 'ABeeZee', label: 'ABeeZee', category: 'google' },
  { value: 'Exo', label: 'Exo', category: 'google' },
  { value: 'Merriweather Sans', label: 'Merriweather Sans', category: 'google' },
  { value: 'Archivo Black', label: 'Archivo Black', category: 'google' },
  { value: 'Saira', label: 'Saira', category: 'google' },
  { value: 'Red Hat Display', label: 'Red Hat Display', category: 'google' },
  { value: 'Public Sans', label: 'Public Sans', category: 'google' },
  { value: 'Spectral', label: 'Spectral', category: 'google' },
  { value: 'Lora', label: 'Lora', category: 'google' },
  { value: 'Noticia Text', label: 'Noticia Text', category: 'google' },
  { value: 'Old Standard TT', label: 'Old Standard TT', category: 'google' },
  { value: 'Cardo', label: 'Cardo', category: 'google' },
  { value: 'Domine', label: 'Domine', category: 'google' },
  { value: 'Crete Round', label: 'Crete Round', category: 'google' },
  { value: 'Volkhov', label: 'Volkhov', category: 'google' },
];

export interface DesignProperties {
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
  background_color?: string | undefined;
  background_image?: string | undefined;
  background_image_type?: 'none' | 'upload' | 'entity' | 'url' | undefined;
  background_image_entity?: string | undefined;
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
  backdrop_filter?: string | undefined;
  background_filter?: string | undefined;
  width?: string | undefined;
  height?: string | undefined;
  max_width?: string | undefined;
  max_height?: string | undefined;
  min_width?: string | undefined;
  min_height?: string | undefined;
  margin_top?: string | undefined;
  margin_bottom?: string | undefined;
  margin_left?: string | undefined;
  margin_right?: string | undefined;
  padding_top?: string | undefined;
  padding_bottom?: string | undefined;
  padding_left?: string | undefined;
  padding_right?: string | undefined;
  border_radius?: string | undefined;
  border_style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | undefined;
  border_width?: string | undefined;
  border_color?: string | undefined;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky' | undefined;
  top?: string | undefined;
  bottom?: string | undefined;
  left?: string | undefined;
  right?: string | undefined;
  z_index?: string | undefined;
  text_shadow_h?: string | undefined;
  text_shadow_v?: string | undefined;
  text_shadow_blur?: string | undefined;
  text_shadow_color?: string | undefined;
  box_shadow_h?: string | undefined;
  box_shadow_v?: string | undefined;
  box_shadow_blur?: string | undefined;
  box_shadow_spread?: string | undefined;
  box_shadow_color?: string | undefined;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto' | undefined;
  clip_path?: string | undefined;
  // 3D Transform properties (perspective + rotateX/Y/Z)
  transform_perspective?: string | undefined;
  transform_rotate_x?: string | undefined;
  transform_rotate_y?: string | undefined;
  transform_rotate_z?: string | undefined;
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
  // Continuous animation timing
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
  // Intro/outro animation timing (separate from continuous animation)
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
  extra_class?: string | undefined;
  element_id?: string | undefined;
  css_variable_prefix?: string | undefined;
}

type DesignKey = keyof DesignProperties;
type GlobalDesignOnUpdate = (properties: Partial<DesignProperties>) => void;

/**
 * Single source of truth for which properties belong to which Design section.
 * Drives the "has edits" indicator, per-section reset, responsive override
 * badges and Reset All, so a property can never be editable but un-resettable.
 */
export const DESIGN_SECTION_PROPERTIES = {
  text: [
    'color',
    'text_align',
    'font_size',
    'line_height',
    'letter_spacing',
    'font_family',
    'font_weight',
    'text_transform',
    'font_style',
    'white_space',
  ],
  background: [
    'background_color',
    'background_image',
    'background_image_type',
    'background_image_entity',
    'background_size',
    'background_repeat',
    'background_position',
    'backdrop_filter',
    'background_filter',
  ],
  sizes: ['width', 'height', 'max_width', 'max_height', 'min_width', 'min_height'],
  spacing: [
    'margin_top',
    'margin_bottom',
    'margin_left',
    'margin_right',
    'padding_top',
    'padding_bottom',
    'padding_left',
    'padding_right',
  ],
  border: ['border_radius', 'border_style', 'border_width', 'border_color'],
  position: ['position', 'top', 'bottom', 'left', 'right', 'z_index'],
  'text-shadow': ['text_shadow_h', 'text_shadow_v', 'text_shadow_blur', 'text_shadow_color'],
  'box-shadow': [
    'box_shadow_h',
    'box_shadow_v',
    'box_shadow_blur',
    'box_shadow_spread',
    'box_shadow_color',
  ],
  overflow: ['overflow', 'clip_path'],
  'transform-3d': [
    'transform_perspective',
    'transform_rotate_x',
    'transform_rotate_y',
    'transform_rotate_z',
  ],
  animations: [
    'animation_type',
    'animation_entity',
    'animation_trigger_type',
    'animation_attribute',
    'animation_state',
    'animation_duration',
    'animation_delay',
    'animation_timing',
    'intro_animation',
    'outro_animation',
    'intro_animation_duration',
    'intro_animation_delay',
    'intro_animation_timing',
  ],
  custom_targeting: ['css_variable_prefix', 'extra_class', 'element_id'],
} as const satisfies Record<string, readonly DesignKey[]>;

export type DesignSectionId = keyof typeof DESIGN_SECTION_PROPERTIES;

/** Section order as rendered in the tab. */
const SECTION_ORDER: readonly DesignSectionId[] = [
  'text',
  'background',
  'sizes',
  'spacing',
  'border',
  'position',
  'text-shadow',
  'box-shadow',
  'overflow',
  'transform-3d',
  'animations',
  'custom_targeting',
];

/**
 * "Reset All" clears every visual section. Custom Targeting (ids / classes /
 * CSS variable prefix) is a hook for card-mod and themes, not a visual
 * setting, so it keeps its values and has its own section reset instead.
 */
const RESET_ALL_SECTIONS: readonly DesignSectionId[] = SECTION_ORDER.filter(
  s => s !== 'custom_targeting'
);

/** Surface chrome cleared by "Reset to Theme" so `--uc-*` theme fallbacks apply again. */
const THEME_SURFACE_PROPERTIES: readonly DesignKey[] = [
  'background_color',
  'background_image',
  'background_image_type',
  'background_image_entity',
  'background_size',
  'background_repeat',
  'background_position',
  'background_filter',
  'backdrop_filter',
  'border_radius',
  'border_style',
  'border_width',
  'border_color',
  'box_shadow_h',
  'box_shadow_v',
  'box_shadow_blur',
  'box_shadow_spread',
  'box_shadow_color',
];

/**
 * Values that mean "nothing set" for enum selects whose first option is not
 * an empty string. Stored as-is for compatibility, but not counted as an edit.
 */
const NEUTRAL_VALUES: Partial<Record<DesignKey, string>> = {
  background_image_type: 'none',
  animation_type: 'none',
  intro_animation: 'none',
  outro_animation: 'none',
};

/** Properties copied between elements. `element_id` must stay unique per page. */
const NON_COPYABLE_PROPERTIES: ReadonlySet<DesignKey> = new Set<DesignKey>(['element_id']);

const RESPONSIVE_KEYS: readonly (keyof ResponsiveDesignProperties)[] = [
  'base',
  'desktop',
  'laptop',
  'tablet',
  'mobile',
];

function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

function isSet(property: DesignKey, value: unknown): boolean {
  return hasValue(value) && value !== NEUTRAL_VALUES[property];
}

type SpacingType = 'margin' | 'padding';
type Side = 'top' | 'right' | 'bottom' | 'left';
const SIDES: readonly Side[] = ['top', 'right', 'bottom', 'left'];

/** Stand-in value for the "– Default –" select option (ha-select can't show ''). */
const DEFAULT_OPTION_SENTINEL = '__uc_default__';

interface TextFieldOptions {
  property: DesignKey;
  label: string;
  value: string | undefined;
  placeholder?: string;
  /** Enables arrow-key stepping for CSS lengths (px/rem/em/%). */
  numeric?: boolean;
  /** Unit appended when stepping an empty field (default px; '' for unitless). */
  unit?: string;
  hint?: string | TemplateResult;
  /** Hide the per-field reset button (for grouped inputs that share one). */
  compact?: boolean;
}

@customElement('ultra-global-design-tab')
export class GlobalDesignTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public designProperties: DesignProperties = {};
  @property({ type: Function }) public onUpdate: GlobalDesignOnUpdate | undefined;
  // Optional: Pass responsive design data for device-specific editing
  @property({ attribute: false }) public responsiveDesign: ResponsiveDesignProperties | undefined;

  @state() private _expandedSections: Set<string> = new Set();
  @state() private _marginLocked: boolean = false;
  @state() private _paddingLocked: boolean = false;
  @state() private _clipboardProperties: DesignProperties | null = null;
  @state() private _selectedDevice: DeviceBreakpoint = 'desktop';
  @state() private _responsiveEnabled: boolean = false;

  // localStorage key for cross-card clipboard functionality
  private static readonly CLIPBOARD_KEY = 'ultra-card-design-clipboard';

  private _storageEventListener: ((event: StorageEvent) => void) | undefined;

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    this._marginLocked = false;
    this._paddingLocked = false;

    this._loadClipboardFromStorage();
    const storageListener = this._handleStorageEvent.bind(this);
    this._storageEventListener = storageListener;
    window.addEventListener('storage', storageListener);

    this._checkAndEnableResponsiveMode();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._storageEventListener) {
      window.removeEventListener('storage', this._storageEventListener);
    }
  }

  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('responsiveDesign')) {
      this._checkAndEnableResponsiveMode();
    }
  }

  /** Auto-enable the responsive toggle when device overrides already exist. */
  private _checkAndEnableResponsiveMode(): void {
    if (
      !this._responsiveEnabled &&
      this.responsiveDesign &&
      responsiveDesignService.hasAnyResponsiveOverrides(this.responsiveDesign)
    ) {
      this._responsiveEnabled = true;
    }
  }

  private get _lang(): string {
    return this.hass?.locale?.language || 'en';
  }

  private _t(key: string, fallback: string, vars?: Record<string, string | number>): string {
    let text = localize(`editor.design.${key}`, this._lang, fallback);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  }

  // ---------------------------------------------------------------------------
  // Clipboard (cross-card, via localStorage)
  // ---------------------------------------------------------------------------

  private _handleStorageEvent(event: StorageEvent): void {
    if (event.key === GlobalDesignTab.CLIPBOARD_KEY) {
      this._loadClipboardFromStorage();
    }
  }

  private _loadClipboardFromStorage(): void {
    try {
      const stored = localStorage.getItem(GlobalDesignTab.CLIPBOARD_KEY);
      if (!stored) {
        this._clipboardProperties = null;
        return;
      }
      const parsed = JSON.parse(stored);
      this._clipboardProperties =
        parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0 ? parsed : null;
    } catch (error) {
      console.warn('Failed to load design clipboard from localStorage:', error);
      this._clipboardProperties = null;
    }
  }

  private _saveClipboardToStorage(properties: DesignProperties): void {
    try {
      localStorage.setItem(GlobalDesignTab.CLIPBOARD_KEY, JSON.stringify(properties));
    } catch (error) {
      console.warn('Failed to save design clipboard to localStorage:', error);
    }
  }

  private _copyDesign(): void {
    // Copy what the user is looking at (effective values for the selected device),
    // dropping empty values and per-element identifiers.
    const effective = this._getEffectiveDesign();
    const copy: DesignProperties = {};
    for (const [key, value] of Object.entries(effective)) {
      const k = key as DesignKey;
      if (NON_COPYABLE_PROPERTIES.has(k)) continue;
      if (isSet(k, value)) (copy as any)[k] = value;
    }

    const count = Object.keys(copy).length;
    if (count === 0) {
      ucToastService.info(this._t('copy_nothing', 'No design settings to copy'));
      return;
    }

    this._clipboardProperties = copy;
    this._saveClipboardToStorage(copy);
    ucToastService.success(this._t('copied', 'Design copied ({count} settings)', { count }));
  }

  private _pasteDesign(): void {
    if (!this._clipboardProperties) {
      this._loadClipboardFromStorage();
    }
    if (!this._clipboardProperties) {
      ucToastService.info(this._t('paste_tooltip_none', 'No design settings in cross-card clipboard'));
      return;
    }
    this._applyUpdates(this._clipboardProperties);
    ucToastService.success(this._t('pasted', 'Design pasted'));
  }

  // ---------------------------------------------------------------------------
  // Update pipeline
  //
  // Every change funnels through _applyUpdates so responsive routing, empty
  // value normalisation and the parent payload shape are identical whether the
  // change came from a text field, a select, a lock toggle or a reset button.
  //
  // Payload shapes (kept stable for layout-tab / bridge consumers):
  //   * responsive off ............ flat { prop: value | undefined }
  //   * responsive on, desktop .... flat props + { design: { ...design, base } }
  //   * responsive on, device ..... { design: { ...design, [device]: overrides } }
  // Keys being cleared are sent as explicit `undefined` so the parent's deep
  // merge deletes them instead of keeping the old value.
  // ---------------------------------------------------------------------------

  private _emit(payload: Record<string, unknown>): void {
    if (this.onUpdate) {
      try {
        this.onUpdate(payload as Partial<DesignProperties>);
      } catch (error) {
        console.error('GlobalDesignTab: onUpdate callback error', error);
      }
      return;
    }
    this.dispatchEvent(
      new CustomEvent('design-changed', { detail: payload, bubbles: true, composed: true })
    );
  }

  private _applyUpdates(updates: Partial<DesignProperties>): void {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates || {})) {
      if (key === 'design') continue;
      normalized[key] = hasValue(value) ? value : undefined;
    }
    if (Object.keys(normalized).length === 0) return;

    const asRecord = (obj: unknown): Record<string, unknown> =>
      (obj && typeof obj === 'object' ? obj : {}) as Record<string, unknown>;

    /** Apply `normalized` to a copy of `target`, deleting cleared keys. */
    const applyTo = (target: unknown): Record<string, unknown> => {
      const next = { ...asRecord(target) };
      for (const [key, value] of Object.entries(normalized)) {
        if (value === undefined) delete next[key];
        else next[key] = value;
      }
      return next;
    };

    /** Same as applyTo but keeps cleared keys as explicit `undefined` for the parent merge. */
    const withExplicitClears = (obj: Record<string, unknown>): Record<string, unknown> => {
      const out = { ...obj };
      for (const [key, value] of Object.entries(normalized)) {
        if (value === undefined) out[key] = undefined;
      }
      return out;
    };

    if (this._isDeviceMode) {
      const device = this._selectedDevice;
      const current: ResponsiveDesignProperties = this.responsiveDesign || {
        base: { ...this.designProperties },
      };
      const deviceDesign = applyTo(current[device]);

      // Local state: keep the object clean for effective-value computation.
      this.responsiveDesign = { ...current, [device]: deviceDesign } as ResponsiveDesignProperties;
      this._emit({ design: { ...current, [device]: withExplicitClears(deviceDesign) } });
      return;
    }

    // Base (desktop) update: reflect immediately in local state.
    this.designProperties = applyTo(this.designProperties) as DesignProperties;

    if (this._responsiveEnabled) {
      const current: ResponsiveDesignProperties = this.responsiveDesign || { base: {} };
      const base = applyTo(current.base);
      this.responsiveDesign = { ...current, base } as ResponsiveDesignProperties;
      this._emit({ ...normalized, design: { ...current, base: withExplicitClears(base) } });
      return;
    }

    this._emit(normalized);
  }

  private _updateProperty(property: DesignKey, value: unknown): void {
    this._applyUpdates({ [property]: value } as Partial<DesignProperties>);
  }

  private _clearProperties(properties: readonly DesignKey[]): void {
    const updates: Record<string, undefined> = {};
    for (const key of properties) updates[key] = undefined;
    this._applyUpdates(updates as Partial<DesignProperties>);
  }

  private _updateSpacing(type: SpacingType, side: Side, value: string): void {
    const locked = type === 'margin' ? this._marginLocked : this._paddingLocked;
    if (locked && side !== 'top') return; // other sides are disabled while locked

    const updates: Record<string, string> = {};
    if (locked) {
      for (const s of SIDES) updates[`${type}_${s}`] = value;
    } else {
      updates[`${type}_${side}`] = value;
    }
    this._applyUpdates(updates as Partial<DesignProperties>);
  }

  private _toggleSpacingLock(type: SpacingType): void {
    const wasLocked = type === 'margin' ? this._marginLocked : this._paddingLocked;
    const locked = !wasLocked;
    if (type === 'margin') this._marginLocked = locked;
    else this._paddingLocked = locked;

    // Locking mirrors the Top value onto the other sides in a single update.
    if (locked) {
      const effective = this._getEffectiveDesign();
      const topValue = (effective as any)[`${type}_top`] ?? '';
      const updates: Record<string, string> = {};
      for (const s of SIDES) updates[`${type}_${s}`] = topValue;
      this._applyUpdates(updates as Partial<DesignProperties>);
    }
  }

  private _resetSection(section: DesignSectionId): void {
    this._clearProperties(DESIGN_SECTION_PROPERTIES[section]);
  }

  private _resetToTheme(): void {
    this._clearProperties(THEME_SURFACE_PROPERTIES);
  }

  private _resetAllDesign(): void {
    const keys: DesignKey[] = [];
    for (const section of RESET_ALL_SECTIONS) keys.push(...DESIGN_SECTION_PROPERTIES[section]);
    this._clearProperties(keys);
  }

  // ---------------------------------------------------------------------------
  // Responsive mode
  // ---------------------------------------------------------------------------

  private _setResponsiveEnabled(enabled: boolean): void {
    if (enabled === this._responsiveEnabled) return;
    this._responsiveEnabled = enabled;
    if (enabled) this._selectedDevice = 'desktop';

    this.dispatchEvent(
      new CustomEvent('responsive-mode-changed', {
        detail: { enabled },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleDeviceChange(e: CustomEvent): void {
    this._selectedDevice = e.detail.device;
    this.dispatchEvent(
      new CustomEvent('device-changed', {
        detail: { device: this._selectedDevice },
        bubbles: true,
        composed: true,
      })
    );
  }

  /** Clear every override for the selected (non-desktop) device. */
  private _resetCurrentDeviceOverrides(): void {
    if (this._selectedDevice === 'desktop') return;

    const clearedDesign = responsiveDesignService.clearDeviceOverrides(
      this.responsiveDesign,
      this._selectedDevice
    );

    // Optimistic local update so the device selector badges refresh instantly.
    this.responsiveDesign = clearedDesign as ResponsiveDesignProperties;

    // The parent merges by key; the device key must be explicitly undefined to be removed.
    this._emit({
      design: { ...clearedDesign, [this._selectedDevice]: undefined },
    });

    this.dispatchEvent(
      new CustomEvent('device-changed', {
        detail: { device: this._selectedDevice, reset: true },
        bubbles: true,
        composed: true,
      })
    );
  }

  private get _isDeviceMode(): boolean {
    return this._responsiveEnabled && this._selectedDevice !== 'desktop';
  }

  private _deviceHasOverrides(device: DeviceBreakpoint, properties: readonly DesignKey[]): boolean {
    const deviceDesign = this.responsiveDesign?.[device];
    if (!deviceDesign) return false;
    return properties.some(prop => hasValue((deviceDesign as any)[prop]));
  }

  /** True when any non-desktop device overrides one of `properties`. */
  private _anyDeviceHasOverrides(properties: readonly DesignKey[]): boolean {
    return (['laptop', 'tablet', 'mobile'] as DeviceBreakpoint[]).some(device =>
      this._deviceHasOverrides(device, properties)
    );
  }

  /** Base (desktop) values merged with the selected device's overrides. */
  private _getEffectiveDesign(): DesignProperties {
    if (!this._responsiveEnabled) return this.designProperties;

    const base: Record<string, unknown> = { ...this.designProperties };
    if (this.responsiveDesign?.base) {
      for (const [key, value] of Object.entries(this.responsiveDesign.base)) {
        if (RESPONSIVE_KEYS.includes(key as any)) continue;
        if (value !== undefined) base[key] = value;
      }
    }
    if (this._selectedDevice === 'desktop') return base as DesignProperties;

    const overrides = this.responsiveDesign?.[this._selectedDevice];
    if (overrides) {
      for (const [key, value] of Object.entries(overrides)) {
        if (value !== undefined) base[key] = value;
      }
    }
    return base as DesignProperties;
  }

  private _deviceLabel(device: DeviceBreakpoint): string {
    return this._t(`device_${device}`, DEVICE_BREAKPOINTS[device].label);
  }

  private _getDeviceInfoText(): string {
    const device = this._selectedDevice;
    if (device === 'desktop') {
      return this._t(
        'device_desktop_info',
        'Desktop is the base. Changes here apply to all devices unless overridden.'
      );
    }
    const bp = DEVICE_BREAKPOINTS[device] as { minWidth?: number; maxWidth?: number };
    const range =
      bp.minWidth !== undefined && bp.maxWidth !== undefined
        ? `${bp.minWidth}–${bp.maxWidth}px`
        : bp.maxWidth !== undefined
          ? `≤${bp.maxWidth}px`
          : `≥${bp.minWidth}px`;
    return this._t('device_override_info', '{device} ({range}) overrides the desktop styles.', {
      device: this._deviceLabel(device),
      range,
    });
  }

  // ---------------------------------------------------------------------------
  // Section state helpers
  // ---------------------------------------------------------------------------

  /** Base design has at least one real value in this section. */
  private _hasModifiedProperties(section: DesignSectionId): boolean {
    const props = this.designProperties || {};
    return DESIGN_SECTION_PROPERTIES[section].some(key => isSet(key, (props as any)[key]));
  }

  private _toggleSection(section: string): void {
    const next = new Set<string>();
    // Exclusive accordion: opening a section closes the others.
    if (!this._expandedSections.has(section)) next.add(section);
    this._expandedSections = next;
  }

  private _loadGoogleFont(fontFamily?: string): void {
    if (!fontFamily) return;
    if (WEB_SAFE_FONTS.some(font => font.value === fontFamily)) return;

    const family = fontFamily.replace(/\s+/g, '+');
    if (document.querySelector(`link[href*="${family}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  // ---------------------------------------------------------------------------
  // Input helpers
  // ---------------------------------------------------------------------------

  /**
   * Text input handler that pushes the value through `apply` and keeps the
   * caret where the user left it across the re-render.
   */
  private _inputHandler(apply: (value: string) => void): (e: Event) => void {
    return (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = target.value;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      apply(value);

      requestAnimationFrame(() => {
        if (!target.isConnected) return;
        if (target.value !== value) target.value = value;
        if (typeof start === 'number') {
          target.setSelectionRange(start, end ?? start);
        }
      });
    };
  }

  /**
   * Arrow-key stepping for CSS values: Shift = ×10, Alt/Option = ÷10.
   * Keeps whatever unit the user typed; `fallbackUnit` is only used when the
   * field is empty (unitless values such as `line-height: 1.5` stay unitless).
   */
  private _handleNumericKeydown(
    event: KeyboardEvent,
    currentValue: string,
    updateCallback: (newValue: string) => void,
    fallbackUnit: string = 'px'
  ): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

    const match = (currentValue || '').trim().match(/^(-?\d*\.?\d*)(.*)$/);
    if (!match) return;
    event.preventDefault();

    const numStr = match[1];
    const unit = match[2].trim() || (numStr === '' ? fallbackUnit : '');
    let num = parseFloat(numStr) || 0;

    let step = 1;
    if (unit === 'rem' || unit === 'em') step = 0.1;
    else if (unit === '%') step = 5;

    if (event.shiftKey) step *= 10;
    else if (event.altKey) step /= 10;

    num += event.key === 'ArrowUp' ? step : -step;

    // Keep at least as many decimals as the user typed (e.g. line-height 1.5 -> 2.5)
    // and enough to represent the step itself (0.1, 0.01 ...).
    const typedDecimals = (numStr.split('.')[1] || '').length;
    const stepDecimals = (String(step).split('.')[1] || '').length;
    const decimalPlaces = Math.min(4, Math.max(typedDecimals, stepDecimals));

    updateCallback(`${parseFloat(num.toFixed(decimalPlaces))}${unit}`);
  }

  private _renderResetButton(
    onClick: () => void,
    title: string,
    enabled: boolean = true
  ): TemplateResult {
    return html`
      <button
        type="button"
        class="reset-btn"
        ?disabled=${!enabled}
        @click=${onClick}
        title=${title}
        aria-label=${title}
      >
        <ha-icon icon="mdi:refresh"></ha-icon>
      </button>
    `;
  }

  /** Label + text input + reset button. Used for every free-form CSS value. */
  private _renderTextField(opts: TextFieldOptions): TemplateResult {
    const { property, label, value, placeholder, numeric, unit, hint, compact } = opts;
    const current = value || '';
    const resetTitle = this._t('reset_field', 'Reset {field}', { field: label });

    return html`
      <div class="property-group">
        <label>${label}</label>
        <div class="input-with-reset">
          <input
            type="text"
            class="property-input"
            .value=${current}
            placeholder=${placeholder ?? ''}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            aria-label=${label}
            @input=${this._inputHandler(v => this._updateProperty(property, v))}
            @keydown=${numeric
              ? (e: KeyboardEvent) =>
                  this._handleNumericKeydown(
                    e,
                    current,
                    v => this._updateProperty(property, v),
                    unit
                  )
              : nothing}
          />
          ${compact
            ? nothing
            : this._renderResetButton(
                () => this._updateProperty(property, ''),
                resetTitle,
                current !== ''
              )}
        </div>
        ${hint ? html`<div class="property-hint">${hint}</div>` : nothing}
      </div>
    `;
  }

  /** HA-native select via UcFormUtils. */
  private _renderDesignSelect(
    property: DesignKey,
    value: string | undefined,
    options: readonly DesignSelectOption[],
    onAfterChange?: (value: string) => void
  ): TemplateResult {
    const key = String(property);
    // ha-select never displays an option whose value is '' as selected, so the
    // "– Default –" choice would render as a blank box. Swap '' for a sentinel
    // on the way in and back to '' on the way out.
    const haOptions = options.map(o =>
      o.value === '' || o.value === undefined ? { ...o, value: DEFAULT_OPTION_SENTINEL } : o
    );
    const haValue = value ? value : DEFAULT_OPTION_SENTINEL;
    return html`
      <div class="design-ha-select">
        ${UcFormUtils.renderForm(
          this.hass!,
          { [key]: haValue },
          // Every design select has a neutral first option (Default/None), so
          // mark it required to hide HA's redundant "clear" (X) button.
          [{ ...UcFormUtils.select(key, haOptions), required: true }],
          (e: CustomEvent) => {
            const raw = e.detail?.value?.[key] ?? '';
            const next = raw === DEFAULT_OPTION_SENTINEL ? '' : raw;
            if (onAfterChange) onAfterChange(next);
            else this._updateProperty(property, next);
          },
          false
        )}
      </div>
    `;
  }

  private _renderSelectField(
    property: DesignKey,
    label: string,
    value: string | undefined,
    options: readonly DesignSelectOption[],
    onAfterChange?: (value: string) => void
  ): TemplateResult {
    return html`
      <div class="property-group">
        <label>${label}</label>
        ${this._renderDesignSelect(property, value, options, onAfterChange)}
      </div>
    `;
  }

  private _renderColorField(
    property: DesignKey,
    label: string,
    value: string | undefined,
    defaultValue: string
  ): TemplateResult {
    return html`
      <div class="property-group">
        <ultra-color-picker
          .label=${label}
          .value=${value || ''}
          .defaultValue=${defaultValue}
          .hass=${this.hass}
          @value-changed=${(e: CustomEvent) => this._updateProperty(property, e.detail.value)}
        ></ultra-color-picker>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Accordion
  // ---------------------------------------------------------------------------

  private _renderAccordion(
    section: DesignSectionId,
    title: string,
    content: () => TemplateResult
  ): TemplateResult {
    const properties = DESIGN_SECTION_PROPERTIES[section];
    const isExpanded = this._expandedSections.has(section);
    const hasEdits = this._hasModifiedProperties(section);

    // Desktop / responsive off: flag if any device overrides this section.
    // Device selected: flag only if THIS device overrides it.
    let hasDeviceOverrides = false;
    if (this._responsiveEnabled) {
      hasDeviceOverrides =
        this._selectedDevice === 'desktop'
          ? this._anyDeviceHasOverrides(properties)
          : this._deviceHasOverrides(this._selectedDevice, properties);
    }

    // The reset button clears what the user is looking at: base values on
    // desktop, this device's overrides when a device is selected.
    const deviceMode = this._isDeviceMode;
    const showReset = deviceMode ? hasDeviceOverrides : hasEdits;
    const resetTitle = deviceMode
      ? this._t('clear_section_device_overrides', 'Clear {device} overrides for {section}', {
          device: this._deviceLabel(this._selectedDevice),
          section: title,
        })
      : this._t('reset_section', 'Reset {section} to default', { section: title });

    return html`
      <div class="accordion-section ${hasDeviceOverrides ? 'has-device-overrides' : ''}">
        <div class="accordion-header ${isExpanded ? 'expanded' : ''}">
          <button
            type="button"
            class="accordion-toggle"
            aria-expanded=${isExpanded ? 'true' : 'false'}
            @click=${() => this._toggleSection(section)}
          >
            <span class="accordion-title">
              ${title}
              ${hasEdits
                ? html`<span
                    class="edit-indicator"
                    title=${this._t('has_modifications', 'Has modifications')}
                  ></span>`
                : nothing}
              ${hasDeviceOverrides
                ? html`<span
                    class="device-override-indicator"
                    title=${this._t('has_responsive_overrides', 'Has responsive overrides')}
                    ><ha-icon icon="mdi:cellphone-link"></ha-icon
                  ></span>`
                : nothing}
            </span>
          </button>
          <div class="accordion-actions">
            ${showReset
              ? html`
                  <button
                    type="button"
                    class="reset-button"
                    title=${resetTitle}
                    aria-label=${resetTitle}
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._resetSection(section);
                    }}
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                `
              : nothing}
            <button
              type="button"
              class="expand-button"
              tabindex="-1"
              aria-hidden="true"
              @click=${() => this._toggleSection(section)}
            >
              <ha-icon icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"></ha-icon>
            </button>
          </div>
        </div>
        ${isExpanded ? html`<div class="accordion-content">${content()}</div>` : nothing}
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render(): TemplateResult {
    const d = this._getEffectiveDesign();
    const options = getDesignSelectOptions(this._lang);

    const sections: Record<DesignSectionId, { title: string; render: () => TemplateResult }> = {
      text: {
        title: this._t('text_section', 'Text'),
        render: () => this._renderTextSection(d, options),
      },
      background: {
        title: this._t('background_section', 'Background'),
        render: () => this._renderBackgroundSection(d, options),
      },
      sizes: {
        title: this._t('sizes_section', 'Sizes'),
        render: () => this._renderSizesSection(d),
      },
      spacing: {
        title: this._t('spacing_section', 'Spacing'),
        render: () => this._renderSpacingSection(d),
      },
      border: {
        title: this._t('border_section', 'Border'),
        render: () => this._renderBorderSection(d, options),
      },
      position: {
        title: this._t('position_section', 'Position'),
        render: () => this._renderPositionSection(d, options),
      },
      'text-shadow': {
        title: this._t('text_shadow_section', 'Text Shadow'),
        render: () => this._renderTextShadowSection(d),
      },
      'box-shadow': {
        title: this._t('box_shadow_section', 'Box Shadow'),
        render: () => this._renderBoxShadowSection(d),
      },
      overflow: {
        title: this._t('overflow_section', 'Overflow'),
        render: () => this._renderOverflowSection(d, options),
      },
      'transform-3d': {
        title: this._t('transform_3d_section', '3D Transform'),
        render: () => this._renderTransformSection(d),
      },
      animations: {
        title: this._t('animations_section', 'Animations'),
        render: () => this._renderAnimationsSection(d, options),
      },
      custom_targeting: {
        title: this._t('custom_targeting_section', 'Custom Targeting'),
        render: () => this._renderCustomTargetingSection(d),
      },
    };

    return html`
      <div class="global-design-tab">
        ${this._renderToolbar()} ${this._renderResponsiveSection()}
        ${SECTION_ORDER.map(id => this._renderAccordion(id, sections[id].title, sections[id].render))}
      </div>
    `;
  }

  private _renderToolbar(): TemplateResult {
    const hasClipboard = !!this._clipboardProperties;
    return html`
      <div class="design-toolbar" role="toolbar">
        <button
          type="button"
          class="toolbar-button copy-button"
          @click=${this._copyDesign}
          title=${this._t('copy_tooltip', 'Copy current design settings (works across all Ultra Cards)')}
        >
          <ha-icon icon="mdi:content-copy"></ha-icon>
          <span>${this._t('copy', 'Copy')}</span>
        </button>

        <button
          type="button"
          class="toolbar-button paste-button ${hasClipboard ? 'has-content' : ''}"
          @click=${this._pasteDesign}
          ?disabled=${!hasClipboard}
          title=${hasClipboard
            ? this._t('paste_tooltip_has', 'Paste copied design settings (from cross-card clipboard)')
            : this._t('paste_tooltip_none', 'No design settings in cross-card clipboard')}
        >
          <ha-icon icon="mdi:content-paste"></ha-icon>
          <span>${this._t('paste', 'Paste')}</span>
        </button>

        <button
          type="button"
          class="toolbar-button reset-theme-button"
          @click=${this._resetToTheme}
          title=${this._t(
            'reset_to_theme_tooltip',
            'Clear background, border, radius and shadow so this element follows the active Ultra Card theme'
          )}
        >
          <ha-icon icon="mdi:palette-swatch-outline"></ha-icon>
          <span>${this._t('reset_to_theme', 'Reset to Theme')}</span>
        </button>

        <button
          type="button"
          class="toolbar-button reset-all-button"
          @click=${this._resetAllDesign}
          title=${this._t(
            'reset_all_tooltip',
            'Reset all design settings to default (Custom Targeting is kept)'
          )}
        >
          <ha-icon icon="mdi:refresh"></ha-icon>
          <span>${this._t('reset_all', 'Reset All')}</span>
        </button>
      </div>
    `;
  }

  private _renderResponsiveSection(): TemplateResult {
    const hasAnyOverrides =
      !!this.responsiveDesign &&
      responsiveDesignService.hasAnyResponsiveOverrides(this.responsiveDesign);
    const hasCurrentDeviceOverrides =
      this._isDeviceMode &&
      !!this.responsiveDesign &&
      responsiveDesignService.hasDeviceOverrides(this.responsiveDesign, this._selectedDevice);

    return html`
      <div class="responsive-design-section ${this._responsiveEnabled ? 'enabled' : ''}">
        <div class="responsive-header">
          <div class="responsive-title">
            <ha-icon icon="mdi:responsive"></ha-icon>
            <span>${this._t('responsive_overrides', 'Responsive Overrides')}</span>
            ${hasAnyOverrides
              ? html`<span
                  class="has-overrides-badge"
                  title=${this._t('has_responsive_overrides', 'Has responsive overrides')}
                  >●</span
                >`
              : nothing}
          </div>
          <div class="responsive-toggle">
            ${UcFormUtils.renderForm(
              this.hass!,
              { _responsive_enabled: this._responsiveEnabled },
              [UcFormUtils.boolean('_responsive_enabled')],
              (e: CustomEvent) => this._setResponsiveEnabled(!!e.detail.value._responsive_enabled),
              false
            )}
          </div>
        </div>

        ${this._responsiveEnabled
          ? html`
              <div class="responsive-content">
                <uc-device-selector
                  .selectedDevice=${this._selectedDevice}
                  .design=${this.responsiveDesign}
                  .showBaseOption=${false}
                  @device-changed=${this._handleDeviceChange}
                ></uc-device-selector>
                <div class="responsive-info">${this._getDeviceInfoText()}</div>
                ${hasCurrentDeviceOverrides
                  ? html`
                      <button
                        type="button"
                        class="reset-device-button"
                        @click=${this._resetCurrentDeviceOverrides}
                      >
                        <ha-icon icon="mdi:delete-outline"></ha-icon>
                        ${this._t('clear_device_overrides', 'Clear {device} overrides', {
                          device: this._deviceLabel(this._selectedDevice),
                        })}
                      </button>
                    `
                  : nothing}
              </div>
            `
          : html`
              <div class="responsive-disabled-info">
                ${hasAnyOverrides
                  ? this._t(
                      'overrides_active_hidden',
                      'Device overrides exist and stay active while this is off.'
                    )
                  : this._t(
                      'responsive_hint',
                      'Enable to set different styles for laptop, tablet, and mobile devices.'
                    )}
              </div>
            `}
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Sections
  // ---------------------------------------------------------------------------

  private _renderTextSection(
    d: DesignProperties,
    options: ReturnType<typeof getDesignSelectOptions>
  ): TemplateResult {
    const alignments = [
      { value: 'inherit', icon: 'mdi:circle-off-outline' },
      { value: 'left', icon: 'mdi:format-align-left' },
      { value: 'center', icon: 'mdi:format-align-center' },
      { value: 'right', icon: 'mdi:format-align-right' },
      { value: 'justify', icon: 'mdi:format-align-justify' },
    ];
    const currentAlign = d.text_align || 'inherit';
    const currentFont = d.font_family || '';
    const isGoogleFont = GOOGLE_FONTS.some(font => font.value === currentFont);

    return html`
      ${this._renderColorField(
        'color',
        this._t('text_color', 'Text Color'),
        d.color,
        'var(--primary-text-color)'
      )}

      <div class="property-group">
        <label>${this._t('alignment', 'Alignment')}</label>
        <div class="button-group" role="group" aria-label=${this._t('alignment', 'Alignment')}>
          ${alignments.map(
            opt => html`
              <button
                type="button"
                class="property-btn ${currentAlign === opt.value ? 'active' : ''}"
                aria-pressed=${currentAlign === opt.value ? 'true' : 'false'}
                title=${opt.value === 'inherit'
                  ? this._t('inherit_alignment', 'Inherit (no alignment)')
                  : opt.value}
                @click=${() =>
                  this._updateProperty('text_align', opt.value === 'inherit' ? undefined : opt.value)}
              >
                <ha-icon icon=${opt.icon}></ha-icon>
              </button>
            `
          )}
        </div>
      </div>

      ${this._renderTextField({
        property: 'font_size',
        label: this._t('font_size', 'Font Size'),
        value: d.font_size,
        numeric: true,
        placeholder: this._t('font_size_placeholder', '16px (default), 1.2rem, max(1rem, 1.5vw)'),
      })}
      ${this._renderTextField({
        property: 'line_height',
        label: this._t('line_height', 'Line Height'),
        value: d.line_height,
        numeric: true,
        placeholder: this._t('line_height_placeholder', '0 (default), 28px, 1.7'),
      })}
      ${this._renderTextField({
        property: 'letter_spacing',
        label: this._t('letter_spacing', 'Letter Spacing'),
        value: d.letter_spacing,
        numeric: true,
        placeholder: this._t('letter_spacing_placeholder', 'auto (default), 1px, -0.04em'),
      })}

      <div class="property-group">
        <label>${this._t('font', 'Font')}</label>
        <select
          class="property-select"
          aria-label=${this._t('font', 'Font')}
          @change=${(e: Event) => {
            const value = (e.target as HTMLSelectElement).value;
            this._updateProperty('font_family', value);
            this._loadGoogleFont(value);
          }}
        >
          <option value="" ?selected=${currentFont === ''}>
            ${this._t('default_option', '– Default –')}
          </option>
          <optgroup label=${this._t('web_safe_fonts', 'Web-safe Fonts')}>
            ${WEB_SAFE_FONTS.map(
              font =>
                html`<option value=${font.value} ?selected=${font.value === currentFont}>
                  ${font.label}
                </option>`
            )}
          </optgroup>
          <optgroup label=${this._t('google_fonts', 'Google Fonts')}>
            ${GOOGLE_FONTS.map(
              font =>
                html`<option value=${font.value} ?selected=${font.value === currentFont}>
                  ${font.label}
                </option>`
            )}
          </optgroup>
        </select>
        ${isGoogleFont
          ? html`
              <div class="info-box">
                <ha-icon icon="mdi:information-outline"></ha-icon>
                <span>
                  ${this._t(
                    'google_fonts_warning',
                    "Google Fonts load dynamically from Google's CDN and require an internet connection. They will not be available on local/offline installations."
                  )}
                </span>
              </div>
            `
          : nothing}
      </div>

      ${this._renderSelectField(
        'font_weight',
        this._t('font_weight', 'Font Weight'),
        d.font_weight || '',
        options.fontWeight
      )}
      ${this._renderSelectField(
        'text_transform',
        this._t('text_transform', 'Text Transform'),
        d.text_transform || '',
        options.textTransform
      )}
      ${this._renderSelectField(
        'font_style',
        this._t('font_style', 'Font Style'),
        d.font_style || '',
        options.fontStyle
      )}
      ${this._renderSelectField(
        'white_space',
        this._t('white_space', 'White Space'),
        d.white_space || '',
        options.whiteSpace
      )}
    `;
  }

  private _renderBackgroundSection(
    d: DesignProperties,
    options: ReturnType<typeof getDesignSelectOptions>
  ): TemplateResult {
    const imageType = d.background_image_type || 'none';
    const hasImage = imageType !== 'none';
    const sizeMode = this._getBackgroundSizeDropdownValue(d.background_size);

    return html`
      ${this._renderColorField(
        'background_color',
        this._t('background_color', 'Background Color'),
        d.background_color,
        'transparent'
      )}

      ${this._renderSelectField(
        'background_image_type',
        this._t('background_image_type', 'Background Image Type'),
        imageType,
        options.backgroundImageType,
        (next: string) => {
          // Switching source clears the previous source's value so stale paths
          // never leak into the new input.
          this._applyUpdates({
            background_image_type: next === 'none' ? undefined : (next as any),
            background_image: undefined,
            background_image_entity: undefined,
          });
        }
      )}

      ${imageType === 'upload'
        ? html`
            <div class="property-group">
              <ultra-file-picker
                .hass=${this.hass}
                .accept=${'image/*'}
                .label=${this._t('upload_bg_image', 'Upload Background Image')}
                .value=${d.background_image || ''}
                .chooseFileLabel=${this._t('choose_file', 'Choose File')}
                .clearLabel=${this._t('remove_file', 'Remove file')}
                @value-changed=${(e: CustomEvent<{ value: string }>) =>
                  this._updateProperty('background_image', e.detail?.value ?? '')}
              ></ultra-file-picker>
            </div>
          `
        : nothing}
      ${imageType === 'entity'
        ? html`
            <div class="property-group">
              <label>${this._t('bg_image_entity', 'Background Image Entity')}</label>
              <ha-entity-picker
                .hass=${this.hass}
                .value=${d.background_image_entity || ''}
                .label=${this._t('bg_image_entity_hint', 'Entity with an image attribute')}
                allow-custom-entity
                @value-changed=${(e: CustomEvent) =>
                  this._updateProperty('background_image_entity', e.detail.value)}
              ></ha-entity-picker>
            </div>
          `
        : nothing}
      ${imageType === 'url'
        ? this._renderTextField({
            property: 'background_image',
            label: this._t('bg_image_url', 'Background Image URL'),
            value: d.background_image,
            placeholder: 'https://example.com/image.jpg',
          })
        : nothing}

      ${hasImage
        ? html`
            ${this._renderSelectField(
              'background_size',
              this._t('background_size', 'Background Size'),
              sizeMode,
              options.backgroundSize,
              (next: string) =>
                this._updateProperty('background_size', next === 'custom' ? 'auto auto' : next)
            )}
            ${sizeMode === 'custom'
              ? html`
                  <div class="two-column-grid">
                    ${this._renderCustomBackgroundSize(d, 'width')}
                    ${this._renderCustomBackgroundSize(d, 'height')}
                  </div>
                `
              : nothing}
            ${this._renderSelectField(
              'background_repeat',
              this._t('background_repeat', 'Background Repeat'),
              d.background_repeat || 'no-repeat',
              options.backgroundRepeat
            )}
            ${this._renderSelectField(
              'background_position',
              this._t('background_position', 'Background Position'),
              d.background_position || 'center center',
              options.backgroundPosition
            )}
          `
        : nothing}

      ${this._renderTextField({
        property: 'backdrop_filter',
        label: this._t('backdrop_filter', 'Backdrop Filter'),
        value: d.backdrop_filter,
        placeholder: 'blur(10px), grayscale(100%), invert(75%)',
        hint: this._t('backdrop_filter_desc', 'Filters what is behind this element (e.g. frosted glass).'),
      })}
      ${this._renderTextField({
        property: 'background_filter',
        label: this._t('background_filter', 'Background Filter'),
        value: d.background_filter,
        placeholder: 'grayscale(100%), blur(10px), brightness(0.5)',
        hint: this._t('background_filter_desc', 'Filters the background image only; content stays sharp.'),
      })}
    `;
  }

  private _renderCustomBackgroundSize(
    d: DesignProperties,
    dimension: 'width' | 'height'
  ): TemplateResult {
    const label =
      dimension === 'width'
        ? this._t('custom_width', 'Custom Width')
        : this._t('custom_height', 'Custom Height');
    const current = this._getCustomSizeValue(d.background_size, dimension);
    const apply = (value: string) => {
      const width = dimension === 'width' ? value : this._getCustomSizeValue(d.background_size, 'width');
      const height =
        dimension === 'height' ? value : this._getCustomSizeValue(d.background_size, 'height');
      this._updateProperty('background_size', `${width || 'auto'} ${height || 'auto'}`);
    };

    return html`
      <div class="property-group">
        <label>${label}</label>
        <input
          type="text"
          class="property-input"
          .value=${current}
          placeholder="auto, 100px, 50%"
          autocomplete="off"
          spellcheck="false"
          aria-label=${label}
          @input=${this._inputHandler(apply)}
          @keydown=${(e: KeyboardEvent) => this._handleNumericKeydown(e, current, apply)}
        />
      </div>
    `;
  }

  private _renderSizesSection(d: DesignProperties): TemplateResult {
    const fields: Array<{ key: DesignKey; label: string; placeholder: string }> = [
      { key: 'width', label: this._t('width', 'Width'), placeholder: 'auto, 200px, 100%' },
      { key: 'height', label: this._t('height', 'Height'), placeholder: 'auto, 200px, 15rem' },
      { key: 'max_width', label: this._t('max_width', 'Max Width'), placeholder: 'none, 600px, 100%' },
      { key: 'max_height', label: this._t('max_height', 'Max Height'), placeholder: 'none, 300px, 50vh' },
      { key: 'min_width', label: this._t('min_width', 'Min Width'), placeholder: '0, 200px, 50%' },
      { key: 'min_height', label: this._t('min_height', 'Min Height'), placeholder: '0, 120px, 10rem' },
    ];
    return html`
      <div class="two-column-grid">
        ${fields.map(f =>
          this._renderTextField({
            property: f.key,
            label: f.label,
            value: (d as any)[f.key],
            placeholder: f.placeholder,
            numeric: true,
          })
        )}
      </div>
    `;
  }

  private _renderSpacingSection(d: DesignProperties): TemplateResult {
    return html`
      ${this._renderSpacingGroup('margin', d)} ${this._renderSpacingGroup('padding', d)}
      <div class="property-hint">
        ${this._t(
          'spacing_units_hint',
          'Accepts any CSS length: 8 or 8px, 1rem, 0.5em, 5%, 2vw, auto, calc(). Bare numbers are treated as px.'
        )}
      </div>
    `;
  }

  private _renderSpacingGroup(type: SpacingType, d: DesignProperties): TemplateResult {
    const locked = type === 'margin' ? this._marginLocked : this._paddingLocked;
    const title = type === 'margin' ? this._t('margin', 'Margin') : this._t('padding', 'Padding');
    const topValue = (d as any)[`${type}_top`] || '';
    // Four narrow inputs: a long "0px, auto, 1rem" hint just gets clipped, so
    // show a neutral default and explain accepted units once under the section.
    const placeholder = '0';
    const sideLabel = (side: Side) => this._t(side, side.charAt(0).toUpperCase() + side.slice(1));

    return html`
      <div class="spacing-group">
        <div class="spacing-header">
          <h4>${title}</h4>
          <button
            type="button"
            class="lock-button ${locked ? 'locked' : ''}"
            aria-pressed=${locked ? 'true' : 'false'}
            title=${locked
              ? this._t('unlock_sides', 'Unlock to edit sides independently')
              : this._t('lock_sides', 'Lock to edit all sides together')}
            @click=${() => this._toggleSpacingLock(type)}
          >
            <ha-icon icon=${locked ? 'mdi:lock' : 'mdi:lock-open-variant-outline'}></ha-icon>
          </button>
        </div>
        <div class="spacing-fields">
          ${SIDES.map(side => {
            const isTop = side === 'top';
            const value = locked ? topValue : (d as any)[`${type}_${side}`] || '';
            const disabled = locked && !isTop;
            return html`
              <div class="spacing-field">
                <label>${sideLabel(side)}</label>
                <input
                  type="text"
                  class="spacing-input ${disabled ? 'locked' : ''}"
                  .value=${value}
                  .disabled=${disabled}
                  placeholder=${placeholder}
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  aria-label="${title} ${sideLabel(side)}"
                  @input=${this._inputHandler(v => this._updateSpacing(type, side, v))}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(e, value, v => this._updateSpacing(type, side, v))}
                />
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private _renderBorderSection(
    d: DesignProperties,
    options: ReturnType<typeof getDesignSelectOptions>
  ): TemplateResult {
    return html`
      ${this._renderSelectField(
        'border_style',
        this._t('border_style', 'Border Style'),
        d.border_style || '',
        options.borderStyle
      )}
      <div class="two-column-grid">
        ${this._renderTextField({
          property: 'border_width',
          label: this._t('border_width', 'Border Width'),
          value: d.border_width,
          numeric: true,
          placeholder: '0, 1px, 0.125rem',
        })}
        ${this._renderTextField({
          property: 'border_radius',
          label: this._t('border_radius', 'Border Radius'),
          value: d.border_radius,
          numeric: true,
          placeholder: '0, 8px, 50%',
        })}
      </div>
      ${this._renderColorField(
        'border_color',
        this._t('border_color', 'Border Color'),
        d.border_color,
        'var(--divider-color)'
      )}
    `;
  }

  private _renderPositionSection(
    d: DesignProperties,
    options: ReturnType<typeof getDesignSelectOptions>
  ): TemplateResult {
    const positioned = !!d.position && d.position !== 'static';
    const offset = (side: Side) => {
      const label = this._t(side, side.charAt(0).toUpperCase() + side.slice(1));
      const value = (d as any)[side] || '';
      return html`
        <input
          type="text"
          class="position-input"
          .value=${value}
          placeholder=${label}
          aria-label=${label}
          autocomplete="off"
          spellcheck="false"
          @input=${this._inputHandler(v => this._updateProperty(side, v))}
          @keydown=${(e: KeyboardEvent) =>
            this._handleNumericKeydown(e, value, v => this._updateProperty(side, v))}
        />
      `;
    };

    return html`
      ${this._renderSelectField(
        'position',
        this._t('position', 'Position'),
        d.position || '',
        options.position
      )}
      ${positioned
        ? html`
            <div class="property-group">
              <label>${this._t('offsets', 'Offsets')}</label>
              <div class="position-grid" role="group" aria-label=${this._t('offsets', 'Offsets')}>
                ${offset('top')}
                <div class="position-row">
                  ${offset('left')}
                  <div class="position-center" aria-hidden="true">
                    <ha-icon icon="mdi:arrow-all"></ha-icon>
                  </div>
                  ${offset('right')}
                </div>
                ${offset('bottom')}
              </div>
            </div>
            ${this._renderTextField({
              property: 'z_index',
              label: this._t('z_index', 'Z-Index'),
              value: d.z_index,
              numeric: true,
              unit: '',
              placeholder: '-1, 1, 3, 50',
            })}
          `
        : nothing}
    `;
  }

  private _renderTextShadowSection(d: DesignProperties): TemplateResult {
    return html`
      <div class="three-column-grid">
        ${this._renderTextField({
          property: 'text_shadow_h',
          label: this._t('horizontal_shift', 'Horizontal Shift'),
          value: d.text_shadow_h,
          numeric: true,
          placeholder: '0, 3px',
          compact: true,
        })}
        ${this._renderTextField({
          property: 'text_shadow_v',
          label: this._t('vertical_shift', 'Vertical Shift'),
          value: d.text_shadow_v,
          numeric: true,
          placeholder: '0, 3px',
          compact: true,
        })}
        ${this._renderTextField({
          property: 'text_shadow_blur',
          label: this._t('blur', 'Blur'),
          value: d.text_shadow_blur,
          numeric: true,
          placeholder: '0, 3px',
          compact: true,
        })}
      </div>
      ${this._renderColorField(
        'text_shadow_color',
        this._t('text_shadow_color', 'Text Shadow Color'),
        d.text_shadow_color,
        'rgba(0,0,0,0.5)'
      )}
      <div class="property-hint">
        ${this._t(
          'text_shadow_hint',
          'Both horizontal and vertical shift are required for the shadow to render.'
        )}
      </div>
    `;
  }

  private _renderBoxShadowSection(d: DesignProperties): TemplateResult {
    return html`
      <div class="two-column-grid">
        ${this._renderTextField({
          property: 'box_shadow_h',
          label: this._t('horizontal_shift', 'Horizontal Shift'),
          value: d.box_shadow_h,
          numeric: true,
          placeholder: '0, 3px',
          compact: true,
        })}
        ${this._renderTextField({
          property: 'box_shadow_v',
          label: this._t('vertical_shift', 'Vertical Shift'),
          value: d.box_shadow_v,
          numeric: true,
          placeholder: '0, 3px',
          compact: true,
        })}
        ${this._renderTextField({
          property: 'box_shadow_blur',
          label: this._t('blur', 'Blur'),
          value: d.box_shadow_blur,
          numeric: true,
          placeholder: '0, 8px',
          compact: true,
        })}
        ${this._renderTextField({
          property: 'box_shadow_spread',
          label: this._t('spread', 'Spread'),
          value: d.box_shadow_spread,
          numeric: true,
          placeholder: '0, -4px',
          compact: true,
        })}
      </div>
      ${this._renderColorField(
        'box_shadow_color',
        this._t('box_shadow_color', 'Box Shadow Color'),
        d.box_shadow_color,
        'rgba(0,0,0,0.1)'
      )}
    `;
  }

  private _renderOverflowSection(
    d: DesignProperties,
    options: ReturnType<typeof getDesignSelectOptions>
  ): TemplateResult {
    return html`
      ${this._renderSelectField(
        'overflow',
        this._t('overflow', 'Overflow'),
        d.overflow || 'visible',
        options.overflow
      )}
      ${this._renderTextField({
        property: 'clip_path',
        label: this._t('clip_path', 'Clip-path'),
        value: d.clip_path,
        placeholder: 'ellipse(75% 100% at bottom)',
        hint: html`${this._t('examples', 'Examples')}:
          <code>ellipse(75% 100% at bottom)</code>,
          <code>polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)</code>`,
      })}
    `;
  }

  private _renderTransformSection(d: DesignProperties): TemplateResult {
    // Three narrow inputs: keep the placeholder short, explain the range in the intro.
    const rotatePlaceholder = '0deg';
    return html`
      <div class="property-hint section-intro">
        ${this._t(
          'transform_3d_desc',
          'Tilt or rotate the module in 3D space. Set perspective for depth, then rotate on X (tilt forward/back), Y (turn left/right), or Z (spin).'
        )}
        ${this._t('transform_3d_rotate_hint', 'Rotation values are in degrees (-180 to 180).')}
      </div>
      ${this._renderTextField({
        property: 'transform_perspective',
        label: this._t('transform_3d_perspective', 'Perspective'),
        value: d.transform_perspective,
        numeric: true,
        placeholder: this._t('transform_3d_perspective_placeholder', 'none, 400px, 1000px'),
      })}
      <div class="three-column-grid">
        ${this._renderTextField({
          property: 'transform_rotate_x',
          label: this._t('transform_3d_rotate_x', 'Rotate X'),
          value: d.transform_rotate_x,
          numeric: true,
          unit: 'deg',
          placeholder: rotatePlaceholder,
          compact: true,
        })}
        ${this._renderTextField({
          property: 'transform_rotate_y',
          label: this._t('transform_3d_rotate_y', 'Rotate Y'),
          value: d.transform_rotate_y,
          numeric: true,
          unit: 'deg',
          placeholder: rotatePlaceholder,
          compact: true,
        })}
        ${this._renderTextField({
          property: 'transform_rotate_z',
          label: this._t('transform_3d_rotate_z', 'Rotate Z'),
          value: d.transform_rotate_z,
          numeric: true,
          unit: 'deg',
          placeholder: rotatePlaceholder,
          compact: true,
        })}
      </div>
    `;
  }

  private _renderAnimationsSection(
    d: DesignProperties,
    options: ReturnType<typeof getDesignSelectOptions>
  ): TemplateResult {
    const animationType = d.animation_type || 'none';
    const hasStateAnimation = animationType !== 'none';
    const hasIntroOutro =
      (d.intro_animation && d.intro_animation !== 'none') ||
      (d.outro_animation && d.outro_animation !== 'none');

    return html`
      <div class="property-section">
        <h5>${this._t('state_based_animation', 'State-based Animation')}</h5>
        ${this._renderSelectField(
          'animation_type',
          this._t('animation_type', 'Animation Type'),
          animationType,
          options.animationType,
          (next: string) =>
            this._updateProperty('animation_type', next === 'none' ? undefined : next)
        )}
        ${hasStateAnimation
          ? html`
              ${this._renderAnimationTrigger(d, options)}
              ${this._renderTimingRow(
                'animation_duration',
                'animation_delay',
                'animation_timing',
                d,
                options,
                '2s'
              )}
            `
          : nothing}
      </div>

      <div class="property-section">
        <h5>${this._t('intro_outro_animations', 'Intro & Outro Animations')}</h5>
        <div class="two-column-grid">
          ${this._renderSelectField(
            'intro_animation',
            this._t('intro_animation', 'Intro Animation'),
            d.intro_animation || 'none',
            options.introAnimation,
            (next: string) =>
              this._updateProperty('intro_animation', next === 'none' ? undefined : next)
          )}
          ${this._renderSelectField(
            'outro_animation',
            this._t('outro_animation', 'Outro Animation'),
            d.outro_animation || 'none',
            options.outroAnimation,
            (next: string) =>
              this._updateProperty('outro_animation', next === 'none' ? undefined : next)
          )}
        </div>
        ${hasIntroOutro
          ? this._renderTimingRow(
              'intro_animation_duration',
              'intro_animation_delay',
              'intro_animation_timing',
              d,
              options,
              '0.5s'
            )
          : nothing}
      </div>
    `;
  }

  private _renderTimingRow(
    durationKey: DesignKey,
    delayKey: DesignKey,
    timingKey: DesignKey,
    d: DesignProperties,
    options: ReturnType<typeof getDesignSelectOptions>,
    defaultDuration: string
  ): TemplateResult {
    return html`
      <div class="three-column-grid">
        ${this._renderTextField({
          property: durationKey,
          label: this._t('duration', 'Duration'),
          value: (d as any)[durationKey],
          placeholder: `${defaultDuration}, 500ms`,
          compact: true,
        })}
        ${this._renderTextField({
          property: delayKey,
          label: this._t('delay', 'Delay'),
          value: (d as any)[delayKey],
          placeholder: '0s, 100ms',
          compact: true,
        })}
        ${this._renderSelectField(
          timingKey,
          this._t('timing', 'Timing'),
          ((d as any)[timingKey] as string) || 'ease',
          options.animationTiming
        )}
      </div>
    `;
  }

  private _renderAnimationTrigger(
    d: DesignProperties,
    options: ReturnType<typeof getDesignSelectOptions>
  ): TemplateResult {
    const entity = d.animation_entity || '';
    const triggerType = d.animation_trigger_type || 'state';

    return html`
      <div class="property-group">
        <label>${this._t('entity_to_monitor', 'Entity to Monitor')}</label>
        <ha-form
          .hass=${this.hass}
          .data=${{ entity }}
          .schema=${[{ name: 'entity', selector: { entity: {} }, label: '' }]}
          .computeLabel=${() => ''}
          @value-changed=${(e: CustomEvent) =>
            this._updateProperty('animation_entity', e.detail.value?.entity)}
        ></ha-form>
        ${entity
          ? nothing
          : html`<div class="property-hint">
              ${this._t(
                'select_entity_first',
                'Choose an entity, then set the state or attribute that triggers the animation.'
              )}
            </div>`}
      </div>

      ${entity
        ? html`
            ${this._renderSelectField(
              'animation_trigger_type',
              this._t('animation_trigger_type', 'Trigger Type'),
              triggerType,
              options.animationTriggerType,
              (next: string) =>
                this._applyUpdates({
                  animation_trigger_type: next as 'state' | 'attribute',
                  animation_state: undefined,
                  animation_attribute: undefined,
                })
            )}
            ${triggerType === 'attribute'
              ? html`
                  <div class="two-column-grid">
                    ${this._renderTextField({
                      property: 'animation_attribute',
                      label: this._t('attribute_name', 'Attribute Name'),
                      value: d.animation_attribute,
                      placeholder: 'battery_level, hvac_action',
                      compact: true,
                      hint: this._getAttributeNameHint(entity),
                    })}
                    ${this._renderTextField({
                      property: 'animation_state',
                      label: this._t('attribute_value', 'Attribute Value'),
                      value: d.animation_state,
                      placeholder: 'heating, 20, on',
                      compact: true,
                      hint: this._getAttributeValueHint(entity, d.animation_attribute || ''),
                    })}
                  </div>
                `
              : this._renderTextField({
                  property: 'animation_state',
                  label: this._t('state_value', 'State Value'),
                  value: d.animation_state,
                  placeholder: 'on, off, playing, idle',
                  hint: this._getStateValueHint(entity),
                })}
          `
        : nothing}
    `;
  }

  private _renderCustomTargetingSection(d: DesignProperties): TemplateResult {
    return html`
      ${this._renderTextField({
        property: 'css_variable_prefix',
        label: this._t('css_var_prefix', 'CSS Variable Prefix'),
        value: d.css_variable_prefix,
        placeholder: 'my-row',
        hint: this._t(
          'css_var_prefix_desc',
          'Prefix for CSS variables (e.g., "my-row" creates --my-row-bg-color, --my-row-text-color). Override with card-mod: style: | :host { --my-row-bg-color: red; }'
        ),
      })}
      ${this._renderTextField({
        property: 'extra_class',
        label: this._t('extra_class', 'Extra CSS classes'),
        value: d.extra_class,
        placeholder: 'my-class another-class',
        hint: this._t(
          'extra_class_desc',
          'Space-separated class names applied to the module container (for card-mod or themes).'
        ),
      })}
      ${this._renderTextField({
        property: 'element_id',
        label: this._t('element_id', 'Element ID'),
        value: d.element_id,
        placeholder: 'my-unique-id',
        hint: this._t(
          'element_id_desc',
          'Optional HTML id on the module root (use sparingly; must be unique on the page).'
        ),
      })}
    `;
  }

  // ---------------------------------------------------------------------------
  // Entity hints for the animation trigger
  // ---------------------------------------------------------------------------

  private _getStateValueHint(entityId: string): string {
    const entity = this.hass?.states?.[entityId];
    if (!entity) return this._t('entity_not_found', 'Entity not found');
    if (entity.state && entity.state !== 'unknown' && entity.state !== 'unavailable') {
      return this._t('current_state', 'Current state: {state}', { state: entity.state });
    }
    return this._t('state_value_hint', 'Enter the exact state value that triggers the animation');
  }

  private _getAttributeNameHint(entityId: string): string {
    const entity = this.hass?.states?.[entityId];
    if (!entity?.attributes) return this._t('entity_not_found', 'Entity not found');
    const names = Object.keys(entity.attributes).filter(
      key => !key.startsWith('_') && typeof entity.attributes[key] !== 'object'
    );
    if (names.length === 0) {
      return this._t('attribute_name_hint', 'Enter the attribute name to monitor');
    }
    const shown = names.slice(0, 3).join(', ');
    return this._t('available_attributes', 'Available: {list}', {
      list: names.length > 3 ? `${shown}, …` : shown,
    });
  }

  private _getAttributeValueHint(entityId: string, attributeName: string): string {
    if (!attributeName) return this._t('select_attribute_first', 'Enter an attribute name first');
    const entity = this.hass?.states?.[entityId];
    if (!entity?.attributes) return this._t('entity_not_found', 'Entity not found');
    const value = entity.attributes[attributeName];
    if (value === null || value === undefined) {
      return this._t('attribute_not_found', 'Attribute not found on this entity');
    }
    const str = String(value);
    return this._t('current_value', 'Current value: {value}', {
      value: str.length > 30 ? `${str.slice(0, 27)}...` : str,
    });
  }

  // ---------------------------------------------------------------------------
  // Background size helpers
  // ---------------------------------------------------------------------------

  private _getBackgroundSizeDropdownValue(backgroundSize: string | undefined): string {
    if (!backgroundSize) return 'cover';
    if (['cover', 'contain', 'auto'].includes(backgroundSize)) return backgroundSize;
    return 'custom';
  }

  private _getCustomSizeValue(
    backgroundSize: string | undefined,
    dimension: 'width' | 'height'
  ): string {
    if (!backgroundSize || ['cover', 'contain', 'auto', 'custom'].includes(backgroundSize)) {
      return '';
    }
    const parts = backgroundSize.trim().split(/\s+/);
    const value = dimension === 'width' ? parts[0] : parts[1] ?? parts[0];
    return value === 'auto' ? '' : value || '';
  }

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  static override get styles() {
    return css`
      :host {
        display: block;
      }

      .global-design-tab {
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-sizing: border-box;
        min-width: 0;
      }

      /* ---- Toolbar ---------------------------------------------------- */

      .design-toolbar {
        display: grid;
        /* 2x2 keeps all four labels readable in the narrow HA editor pane */
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        padding: 12px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        box-sizing: border-box;
      }

      .toolbar-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-width: 0;
        min-height: 40px;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease,
          color 0.15s ease;
      }

      .toolbar-button:hover:not(:disabled) {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color, white);
      }

      .toolbar-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .toolbar-button ha-icon {
        --mdc-icon-size: 18px;
        flex-shrink: 0;
      }

      .toolbar-button span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .paste-button.has-content {
        border-color: var(--success-color, #4caf50);
      }

      .paste-button.has-content:hover:not(:disabled) {
        background: var(--success-color, #4caf50);
        border-color: var(--success-color, #4caf50);
        color: white;
      }

      .reset-all-button:hover:not(:disabled) {
        border-color: var(--error-color, #f44336);
        background: var(--error-color, #f44336);
        color: white;
      }

      /* ---- Responsive section ----------------------------------------- */

      .responsive-design-section {
        margin-bottom: 8px;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        box-sizing: border-box;
      }

      .responsive-design-section.enabled {
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.04);
      }

      .responsive-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .responsive-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        min-width: 0;
      }

      .responsive-design-section.enabled .responsive-title {
        color: var(--primary-color);
      }

      .responsive-title ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }

      .has-overrides-badge {
        color: var(--warning-color, #ff9800);
        font-size: 12px;
        line-height: 1;
      }

      .responsive-content {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color);
      }

      .responsive-disabled-info {
        margin-top: 6px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .responsive-info {
        margin-top: 8px;
        padding: 8px 12px;
        font-size: 12px;
        color: var(--secondary-text-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
        border-left: 3px solid var(--primary-color);
        border-radius: 6px;
      }

      .reset-device-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 12px;
        padding: 6px 12px;
        font: inherit;
        font-size: 12px;
        color: var(--error-color, #f44336);
        background: transparent;
        border: 1px solid var(--error-color, #f44336);
        border-radius: 4px;
        cursor: pointer;
        transition:
          background-color 0.15s ease,
          color 0.15s ease;
      }

      .reset-device-button:hover {
        background: var(--error-color, #f44336);
        color: white;
      }

      .reset-device-button ha-icon {
        --mdc-icon-size: 16px;
      }

      /* ---- Accordion --------------------------------------------------- */

      .accordion-section {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        box-sizing: border-box;
      }

      .accordion-section.has-device-overrides {
        border-left: 3px solid var(--warning-color, #ff9800);
      }

      .accordion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        padding: 10px 12px 10px 16px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-weight: 500;
        box-sizing: border-box;
        transition:
          background-color 0.15s ease,
          color 0.15s ease;
      }

      .accordion-header:hover,
      .accordion-header.expanded {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
      }

      .accordion-toggle {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        padding: 4px 0;
        background: none;
        border: none;
        border-radius: 4px;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .accordion-toggle:focus-visible,
      .toolbar-button:focus-visible,
      .reset-button:focus-visible,
      .reset-btn:focus-visible,
      .lock-button:focus-visible,
      .property-btn:focus-visible,
      .reset-device-button:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .accordion-header.expanded .accordion-toggle:focus-visible,
      .accordion-header.expanded .reset-button:focus-visible {
        outline-color: var(--text-primary-color, white);
      }

      .accordion-title {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .edit-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--primary-color);
        flex-shrink: 0;
      }

      .accordion-header:hover .edit-indicator,
      .accordion-header.expanded .edit-indicator {
        background: var(--text-primary-color, white);
      }

      .device-override-indicator {
        display: inline-flex;
        align-items: center;
        color: var(--warning-color, #ff9800);
      }

      .device-override-indicator ha-icon {
        --mdc-icon-size: 14px;
      }

      .accordion-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }

      .reset-button,
      .expand-button {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        padding: 4px;
        background: none;
        border: none;
        border-radius: 4px;
        color: inherit;
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .reset-button:hover,
      .expand-button:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .accordion-header:not(.expanded):not(:hover) .reset-button:hover,
      .accordion-header:not(.expanded):not(:hover) .expand-button:hover {
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.08);
      }

      .reset-button ha-icon,
      .expand-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .accordion-content {
        padding: 16px;
        background: var(--card-background-color, #fff);
        border-top: 1px solid var(--divider-color);
        box-sizing: border-box;
      }

      /* ---- Fields ------------------------------------------------------ */

      .property-group {
        margin-bottom: 14px;
        min-width: 0;
        box-sizing: border-box;
      }

      .property-group:last-child {
        margin-bottom: 0;
      }

      .property-group > label {
        display: block;
        margin-bottom: 4px;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .property-input,
      .property-select,
      .position-input {
        width: 100%;
        min-width: 0;
        padding: 8px 10px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font: inherit;
        font-size: 14px;
        box-sizing: border-box;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .property-input::placeholder,
      .spacing-input::placeholder,
      .position-input::placeholder {
        color: var(--secondary-text-color);
        opacity: 0.7;
      }

      .property-input:focus,
      .property-select:focus,
      .spacing-input:focus,
      .position-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .property-hint {
        display: block;
        margin-top: 4px;
        font-size: 11px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }

      .property-hint code {
        font-size: 11px;
        word-break: break-all;
      }

      .property-hint.section-intro {
        margin: 0 0 12px;
        font-size: 12px;
      }

      .info-box {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-top: 8px;
        padding: 10px 12px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border-left: 3px solid var(--primary-color);
        border-radius: 4px;
        font-size: 12px;
        line-height: 1.5;
        color: var(--primary-text-color);
      }

      .info-box ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
        flex-shrink: 0;
        margin-top: 1px;
      }

      .input-with-reset {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-width: 0;
      }

      .input-with-reset .property-input {
        flex: 1;
      }

      .design-ha-select {
        flex: 1;
        min-width: 0;
      }

      .design-ha-select ha-form {
        display: block;
      }

      .reset-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        min-width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        flex-shrink: 0;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease,
          color 0.15s ease;
      }

      .reset-btn:hover:not(:disabled) {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, white);
      }

      .reset-btn:disabled {
        opacity: 0.35;
        cursor: default;
      }

      .reset-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Alignment button group */
      .button-group {
        display: flex;
        gap: 4px;
      }

      .property-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 36px;
        padding: 6px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease,
          color 0.15s ease;
      }

      .property-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .property-btn.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, white);
      }

      /* Grids (container-friendly: wrap by available width, not viewport) */
      .two-column-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-bottom: 14px;
      }

      .three-column-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
        gap: 12px;
        margin-bottom: 14px;
      }

      .two-column-grid:last-child,
      .three-column-grid:last-child {
        margin-bottom: 0;
      }

      .two-column-grid .property-group,
      .three-column-grid .property-group {
        margin-bottom: 0;
        /* Mixed control heights (text input next to ha-select): keep labels
           on one line at the top and controls flush along the bottom. */
        display: flex;
        flex-direction: column;
      }

      .two-column-grid .property-group > label,
      .three-column-grid .property-group > label {
        margin-bottom: auto;
        padding-bottom: 4px;
      }

      /* ---- Spacing ----------------------------------------------------- */

      .spacing-group {
        margin-bottom: 20px;
      }

      .spacing-group:last-of-type {
        margin-bottom: 8px;
      }

      .spacing-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .spacing-group h4 {
        margin: 0;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .lock-button {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        padding: 6px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease,
          color 0.15s ease;
      }

      .lock-button ha-icon {
        --mdc-icon-size: 18px;
      }

      .lock-button:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .lock-button.locked {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, white);
      }

      .spacing-fields {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
        gap: 8px;
      }

      .spacing-field {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .spacing-field label {
        margin-bottom: 4px;
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-align: center;
      }

      .spacing-input {
        width: 100%;
        min-width: 0;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font: inherit;
        font-size: 13px;
        text-align: center;
        box-sizing: border-box;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .spacing-input.locked {
        opacity: 0.55;
        cursor: not-allowed;
      }

      /* ---- Position ---------------------------------------------------- */

      .position-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        align-items: center;
        max-width: 240px;
        margin: 0 auto;
      }

      .position-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 8px;
        align-items: center;
      }

      .position-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
      }

      .position-center ha-icon {
        --mdc-icon-size: 20px;
      }

      .position-input {
        text-align: center;
        font-size: 13px;
      }

      /* ---- Sub-sections (animations) ----------------------------------- */

      .property-section {
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .property-section:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .property-section h5 {
        margin: 0 0 12px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }

      /* Color picker popover must sit above the editor chrome */
      ultra-color-picker {
        position: relative;
        z-index: ${Z_INDEX.COLOR_PICKER_CONTAINER};
      }
    `;
  }
}
