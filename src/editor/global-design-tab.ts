import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import '../components/ultra-color-picker';
import { uploadImage } from '../utils/image-upload';
import { localize } from '../localize/localize';
import { Z_INDEX } from '../utils/uc-z-index';

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
  extra_class?: string;
  element_id?: string;
  css_variable_prefix?: string;
}

@customElement('ultra-global-design-tab')
export class GlobalDesignTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public designProperties: DesignProperties = {};
  @property({ type: Function }) public onUpdate?: (properties: Partial<DesignProperties>) => void;

  @state() private _expandedSections: Set<string> = new Set();
  @state() private _marginLocked: boolean = false;
  @state() private _paddingLocked: boolean = false;
  @state() private _clipboardProperties: DesignProperties | null = null;

  // localStorage key for cross-card clipboard functionality
  private static readonly CLIPBOARD_KEY = 'ultra-card-design-clipboard';

  // Static property to track animation trigger type across renders
  private static _lastAnimationTriggerType: 'state' | 'attribute' | null = null;

  connectedCallback(): void {
    super.connectedCallback();

    // Ensure lock states are always false by default (prevent auto-fill behavior)
    this._marginLocked = false;
    this._paddingLocked = false;

    // Ensure proper initialization
    // Lock states are now properly managed

    // Load clipboard state from localStorage when component initializes
    this._loadClipboardFromStorage();

    // Listen for storage events to sync clipboard across different card instances
    this._storageEventListener = this._handleStorageEvent.bind(this);
    window.addEventListener('storage', this._storageEventListener);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    // Clean up storage event listener
    if (this._storageEventListener) {
      window.removeEventListener('storage', this._storageEventListener);
    }

    // Clean up any session storage if needed
    // Uncomment this if you want to clear on component removal
    // try {
    //   sessionStorage.removeItem(GlobalDesignTab.ANIMATION_TRIGGER_TYPE_KEY);
    // } catch (e) {
    //   console.warn('Failed to clear animation trigger type from session storage:', e);
    // }
  }

  private _storageEventListener?: (event: StorageEvent) => void;

  private _handleStorageEvent(event: StorageEvent): void {
    // Only react to changes to our specific clipboard key
    if (event.key === GlobalDesignTab.CLIPBOARD_KEY) {
      // Reload clipboard state when another card instance updates it
      this._loadClipboardFromStorage();
    }
  }

  private _loadClipboardFromStorage(): void {
    try {
      const stored = localStorage.getItem(GlobalDesignTab.CLIPBOARD_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that it's a valid DesignProperties object
        if (parsed && typeof parsed === 'object') {
          this._clipboardProperties = parsed;
          this.requestUpdate();
        }
      }
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

  private _clearClipboardFromStorage(): void {
    try {
      localStorage.removeItem(GlobalDesignTab.CLIPBOARD_KEY);
    } catch (error) {
      console.warn('Failed to clear design clipboard from localStorage:', error);
    }
  }

  private _toggleSection(section: string): void {
    if (this._expandedSections.has(section)) {
      this._expandedSections.delete(section);
    } else {
      // Close all other sections and open this one (exclusive behavior)
      this._expandedSections.clear();
      this._expandedSections.add(section);
    }
    this.requestUpdate();
  }

  private _updateProperty(property: keyof DesignProperties, value: any): void {
    // Handle empty strings as property deletion for proper reset behavior
    const processedValue =
      value === '' || value === null || (typeof value === 'string' && value.trim() === '')
        ? undefined
        : value;
    const updates: Partial<DesignProperties> = { [property]: processedValue } as any;

    // Update local state immediately so UI reflects the change
    const newDesignProperties = { ...(this.designProperties || {}) };
    if (processedValue === undefined) {
      delete (newDesignProperties as any)[property];
    } else {
      (newDesignProperties as any)[property] = processedValue;
    }
    this.designProperties = newDesignProperties as any;
    this.requestUpdate();

    // Debug logging for font_size updates
    if (property === 'font_size') {
      console.log('🔧 EditorGlobalDesignTab: Font size update', {
        property,
        originalValue: value,
        processedValue,
        updates,
        newDesignProperties: this.designProperties,
      });
    }

    // Use callback if provided (module integration), otherwise use event (row/column integration)
    if (this.onUpdate) {
      this.onUpdate(updates);
    } else {
      // Dispatch event for event-listener based integrations
      const event = new CustomEvent('design-changed', {
        detail: updates,
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  private _updateSpacing(
    type: 'margin' | 'padding',
    side: 'top' | 'bottom' | 'left' | 'right',
    value: string
  ): void {
    console.log('📏 [UPDATE SPACING]', {
      type,
      side,
      value,
      currentDesignProperties: { ...this.designProperties },
      hasOnUpdate: !!this.onUpdate,
    });
    // Get current lock state and ensure it's boolean
    const isSpacingLocked =
      type === 'margin' ? Boolean(this._marginLocked) : Boolean(this._paddingLocked);

    // Spacing update logic with proper lock handling

    // When locked, only allow updates from the top field (prevent disabled field updates)
    if (isSpacingLocked && side !== 'top') {
      return;
    }

    // Normalize empty strings to undefined for proper deletion
    const normalizeValue = (val: string): any => {
      if (val === '' || val === null || (typeof val === 'string' && val.trim() === '')) {
        return undefined;
      }
      return val;
    };

    const normalizedValue = normalizeValue(value);

    let updates: Partial<DesignProperties>;

    if (isSpacingLocked) {
      // When locked, apply to all sides (user expects mirrored behavior)
      // This should only happen when updating from the top field
      updates = {
        [`${type}_top`]: normalizedValue,
        [`${type}_bottom`]: normalizedValue,
        [`${type}_left`]: normalizedValue,
        [`${type}_right`]: normalizedValue,
      };
    } else {
      // When unlocked, apply to specific side only (default behavior)
      updates = { [`${type}_${side}`]: normalizedValue };
    }

    // Update local designProperties immediately, removing properties set to undefined
    const newDesignProperties = { ...(this.designProperties || {}) };
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined) {
        delete (newDesignProperties as any)[key];
      } else {
        (newDesignProperties as any)[key] = val;
      }
    }
    this.designProperties = newDesignProperties as any;

    // For locked spacing fields, force immediate UI update to sync all fields
    const isSpacingUpdate = Object.keys(updates).some(
      key => key.startsWith('margin_') || key.startsWith('padding_')
    );
    const isCurrentlyLocked =
      (type === 'margin' && this._marginLocked) || (type === 'padding' && this._paddingLocked);

    if (isSpacingUpdate && isCurrentlyLocked) {
      // Immediate update for locked fields to ensure synchronization
      this.requestUpdate();
    } else {
      // Delay the UI update to prevent input value override for unlocked fields
      setTimeout(() => {
        this.requestUpdate();
      }, 0);
    }

    // Use callback if provided (module integration), otherwise use event (row/column integration)
    if (this.onUpdate) {
      this.onUpdate(updates);
    } else {
      // Dispatch event for event-listener based integrations
      const event = new CustomEvent('design-changed', {
        detail: updates,
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  private _createSpacingInputHandler(
    type: 'margin' | 'padding',
    side: 'top' | 'bottom' | 'left' | 'right'
  ): (e: Event) => void {
    return (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = target.value;
      // Store cursor position
      const cursorPosition = target.selectionStart;
      const cursorEnd = target.selectionEnd;

      // Update property
      this._updateSpacing(type, side, value);

      // Preserve user input and cursor position - use multiple attempts to ensure it works
      const preserveValueAndCursor = () => {
        if (target) {
          // If the input value was reset by reactive update, restore user input
          if (target.value !== value) {
            target.value = value;
          }
          // Restore cursor position
          if (typeof cursorPosition === 'number') {
            target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
          }
        }
      };

      // Try multiple times to catch delayed re-renders
      requestAnimationFrame(preserveValueAndCursor);
      setTimeout(preserveValueAndCursor, 0);
      setTimeout(preserveValueAndCursor, 10);
    };
  }

  private _createRobustInputHandler(
    property: string,
    updateCallback: (value: string) => void
  ): (e: Event) => void {
    return (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = target.value;

      // Store cursor position before any processing
      const cursorPosition = target.selectionStart;
      const cursorEnd = target.selectionEnd;

      // Prevent event bubbling but allow normal input behavior
      e.stopPropagation();

      // Update the value first
      updateCallback(value);

      // For locked fields, don't fight the reactive updates - let them sync naturally
      const isSpacingField = property.includes('margin_') || property.includes('padding_');
      const isFieldLocked =
        isSpacingField &&
        ((property.includes('margin_') && this._marginLocked) ||
          (property.includes('padding_') && this._paddingLocked));

      if (!isFieldLocked) {
        // Only preserve values for unlocked fields to avoid fighting reactive updates
        const preserveValue = () => {
          if (target && target.value !== value) {
            // Value was reset by reactive update, restore user input
            target.value = value;
            if (typeof cursorPosition === 'number') {
              target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
            }
          }
        };

        // Try multiple times to preserve the value
        requestAnimationFrame(preserveValue);
        setTimeout(preserveValue, 0);
        setTimeout(preserveValue, 10);
      } else {
        // For locked fields, just restore cursor position
        requestAnimationFrame(() => {
          if (target && typeof cursorPosition === 'number') {
            target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
          }
        });
      }
    };
  }

  private _createProtectedKeydownHandler(
    property: string,
    getCurrentValue: () => string,
    updateCallback: (newValue: string) => void
  ): (e: KeyboardEvent) => void {
    return (e: KeyboardEvent) => {
      const target = e.target as HTMLInputElement;

      // Only handle arrow keys for numeric stepping, let everything else pass through
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        this._handleNumericKeydown(e, getCurrentValue(), updateCallback);
        return;
      }

      // For any other key, just let it pass through naturally
      // This prevents interference with normal typing, including adding negative signs
    };
  }

  private _handleNumericKeydown(
    event: KeyboardEvent,
    currentValue: string,
    updateCallback: (newValue: string) => void
  ): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

    event.preventDefault();

    // Parse current value to extract number and unit
    const match = currentValue.match(/^(-?\d*\.?\d*)(.*)$/);
    if (!match) return;

    const numStr = match[1];
    const unit = match[2].trim() || 'px';
    let num = parseFloat(numStr) || 0;

    // Determine step size based on unit
    let step = 1;
    if (unit === 'rem' || unit === 'em') {
      step = 0.1;
    } else if (unit === '%') {
      step = 5;
    } else if (unit === 'px') {
      step = 1;
    }

    // Hold Shift for larger steps, Hold Alt/Option for smaller steps
    if (event.shiftKey) {
      step *= 10;
    } else if (event.altKey) {
      step /= 10;
    }

    // Increment or decrement
    if (event.key === 'ArrowUp') {
      num += step;
    } else {
      num -= step;
    }

    // Round to appropriate decimal places
    let decimalPlaces = 0;
    if (unit === 'rem' || unit === 'em') {
      decimalPlaces = event.altKey ? 3 : 1;
    } else if (unit === '%' && event.altKey) {
      decimalPlaces = 1;
    }

    const roundedNum = parseFloat(num.toFixed(decimalPlaces));
    const newValue = `${roundedNum}${unit}`;

    updateCallback(newValue);
  }

  private _toggleSpacingLock(type: 'margin' | 'padding'): void {
    if (type === 'margin') {
      const wasLocked = this._marginLocked;
      this._marginLocked = !this._marginLocked;

      // When locking (only when explicitly toggled by user), sync all sides to the top value
      if (!wasLocked && this._marginLocked === true) {
        const topValue = this.designProperties.margin_top || '';
        this._updateProperty('margin_right', topValue);
        this._updateProperty('margin_bottom', topValue);
        this._updateProperty('margin_left', topValue);
      }
    } else {
      const wasLocked = this._paddingLocked;
      this._paddingLocked = !this._paddingLocked;

      // When locking (only when explicitly toggled by user), sync all sides to the top value
      if (!wasLocked && this._paddingLocked === true) {
        const topValue = this.designProperties.padding_top || '';
        this._updateProperty('padding_right', topValue);
        this._updateProperty('padding_bottom', topValue);
        this._updateProperty('padding_left', topValue);
      }
    }
    this.requestUpdate();
  }

  private _resetSection(section: string): void {
    // Create a reset object that explicitly removes properties
    const resetProperties: Record<string, undefined> = {};

    switch (section) {
      case 'text':
        resetProperties.color = undefined;
        resetProperties.text_align = undefined;
        resetProperties.font_size = undefined;
        resetProperties.line_height = undefined;
        resetProperties.letter_spacing = undefined;
        resetProperties.font_family = undefined;
        resetProperties.font_weight = undefined;
        resetProperties.text_transform = undefined;
        resetProperties.font_style = undefined;
        resetProperties.white_space = undefined;
        break;
      case 'background':
        resetProperties.background_color = undefined;
        resetProperties.background_image = undefined;
        resetProperties.background_image_type = undefined;
        resetProperties.background_image_entity = undefined;
        resetProperties.background_size = undefined;
        resetProperties.background_repeat = undefined;
        resetProperties.background_position = undefined;
        resetProperties.backdrop_filter = undefined;
        break;
      case 'sizes':
        resetProperties.width = undefined;
        resetProperties.height = undefined;
        resetProperties.max_width = undefined;
        resetProperties.max_height = undefined;
        resetProperties.min_width = undefined;
        resetProperties.min_height = undefined;
        break;
      case 'spacing':
        resetProperties.margin_top = undefined;
        resetProperties.margin_bottom = undefined;
        resetProperties.margin_left = undefined;
        resetProperties.margin_right = undefined;
        resetProperties.padding_top = undefined;
        resetProperties.padding_bottom = undefined;
        resetProperties.padding_left = undefined;
        resetProperties.padding_right = undefined;
        break;
      case 'border':
        resetProperties.border_radius = undefined;
        resetProperties.border_style = undefined;
        resetProperties.border_width = undefined;
        resetProperties.border_color = undefined;
        break;
      case 'position':
        resetProperties.position = undefined;
        resetProperties.top = undefined;
        resetProperties.bottom = undefined;
        resetProperties.left = undefined;
        resetProperties.right = undefined;
        resetProperties.z_index = undefined;
        break;
      case 'text-shadow':
        resetProperties.text_shadow_h = undefined;
        resetProperties.text_shadow_v = undefined;
        resetProperties.text_shadow_blur = undefined;
        resetProperties.text_shadow_color = undefined;
        break;
      case 'box-shadow':
        resetProperties.box_shadow_h = undefined;
        resetProperties.box_shadow_v = undefined;
        resetProperties.box_shadow_blur = undefined;
        resetProperties.box_shadow_spread = undefined;
        resetProperties.box_shadow_color = undefined;
        break;
      case 'overflow':
        resetProperties.overflow = undefined;
        resetProperties.clip_path = undefined;
        break;
      case 'animations':
        resetProperties.animation_type = undefined;
        resetProperties.animation_entity = undefined;
        resetProperties.animation_trigger_type = undefined;
        resetProperties.animation_attribute = undefined;
        resetProperties.animation_state = undefined;
        resetProperties.intro_animation = undefined;
        resetProperties.outro_animation = undefined;
        resetProperties.animation_duration = undefined;
        resetProperties.animation_delay = undefined;
        resetProperties.animation_timing = undefined;
        break;
    }

    // Update local state immediately so UI reflects the reset
    this.designProperties = { ...(this.designProperties || {}), ...resetProperties } as any;
    this.requestUpdate();

    // Use callback if provided (module integration), otherwise use event (row/column integration)
    if (this.onUpdate) {
      try {
        this.onUpdate(resetProperties);
      } catch (error) {
        console.error(`🔄 GlobalDesignTab: Callback error for ${section}:`, error);
      }
    } else {
      // Dispatch event for event-listener based integrations
      const event = new CustomEvent('design-changed', {
        detail: resetProperties,
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }

    // Force component re-render to update UI indicators after a small delay
    this.requestUpdate();

    // Schedule another update to ensure UI indicators refresh after parent updates designProperties
    setTimeout(() => {
      this.requestUpdate();
    }, 50);
  }

  private _copyDesign(): void {
    // Copy all current design properties to clipboard (both local state and localStorage)
    this._clipboardProperties = { ...this.designProperties };
    this._saveClipboardToStorage(this._clipboardProperties);

    // Count non-empty properties for better feedback
    const propertyCount = Object.keys(this._clipboardProperties).filter(
      key => this._clipboardProperties![key as keyof DesignProperties]
    ).length;

    // Show feedback to user

    // Trigger a visual feedback
    this.requestUpdate();
  }

  private _pasteDesign(): void {
    // First try local state, then reload from localStorage if needed
    if (!this._clipboardProperties) {
      this._loadClipboardFromStorage();
    }

    if (this._clipboardProperties) {
      // Use callback if provided (module integration), otherwise use event (row/column integration)
      if (this.onUpdate) {
        this.onUpdate(this._clipboardProperties);
      } else {
        // Dispatch event for event-listener based integrations
        this.dispatchEvent(
          new CustomEvent('design-changed', {
            detail: this._clipboardProperties,
            bubbles: true,
            composed: true,
          })
        );
      }
    } else {
    }
  }

  private _resetAllDesign(): void {
    // Reset all design properties to undefined values

    const resetProperties: Record<string, undefined> = {
      // Text properties
      color: undefined,
      text_align: undefined,
      font_size: undefined,
      line_height: undefined,
      letter_spacing: undefined,
      font_family: undefined,
      font_weight: undefined,
      text_transform: undefined,
      font_style: undefined,
      white_space: undefined,
      // Background properties
      background_color: undefined,
      background_image: undefined,
      background_image_type: undefined,
      background_image_entity: undefined,
      backdrop_filter: undefined,
      // Size properties
      width: undefined,
      height: undefined,
      max_width: undefined,
      max_height: undefined,
      min_width: undefined,
      min_height: undefined,
      // Spacing properties
      margin_top: undefined,
      margin_bottom: undefined,
      margin_left: undefined,
      margin_right: undefined,
      padding_top: undefined,
      padding_bottom: undefined,
      padding_left: undefined,
      padding_right: undefined,
      // Border properties
      border_radius: undefined,
      border_style: undefined,
      border_width: undefined,
      border_color: undefined,
      // Position properties
      position: undefined,
      top: undefined,
      bottom: undefined,
      left: undefined,
      right: undefined,
      z_index: undefined,
      // Shadow properties
      text_shadow_h: undefined,
      text_shadow_v: undefined,
      text_shadow_blur: undefined,
      text_shadow_color: undefined,
      box_shadow_h: undefined,
      box_shadow_v: undefined,
      box_shadow_blur: undefined,
      box_shadow_spread: undefined,
      box_shadow_color: undefined,
      // Other properties
      overflow: undefined,
      clip_path: undefined,
      // Animation properties
      animation_type: undefined,
      animation_entity: undefined,
      animation_trigger_type: undefined,
      animation_attribute: undefined,
      animation_state: undefined,
      intro_animation: undefined,
      outro_animation: undefined,
      animation_duration: undefined,
      animation_delay: undefined,
      animation_timing: undefined,
    };

    // Use callback if provided (module integration), otherwise use event (row/column integration)
    if (this.onUpdate) {
      try {
        this.onUpdate(resetProperties);
      } catch (error) {
        console.error('🔄 GlobalDesignTab: Reset all callback error:', error);
      }
    } else {
      // Dispatch event for event-listener based integrations
      const event = new CustomEvent('design-changed', {
        detail: resetProperties,
        bubbles: true,
        composed: true,
      });
      const dispatched = this.dispatchEvent(event);
    }

    // Force component re-render to update UI indicators after a small delay
    this.requestUpdate();

    // Schedule another update to ensure UI indicators refresh after parent updates designProperties
    setTimeout(() => {
      this.requestUpdate();
    }, 50);
  }

  private _clearClipboard(): void {
    this._clipboardProperties = null;
    this._clearClipboardFromStorage();
    this.requestUpdate();
  }

  private async _handleBackgroundImageUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.hass) return;

    try {
      const imagePath = await uploadImage(this.hass, file);
      const updates = {
        background_image: imagePath,
        background_image_type: 'upload' as const,
      };

      // Use callback if provided (module integration), otherwise use event (row/column integration)
      if (this.onUpdate) {
        this.onUpdate(updates);
      } else {
        // Dispatch event for event-listener based integrations
        this.dispatchEvent(
          new CustomEvent('design-changed', {
            detail: updates,
            bubbles: true,
            composed: true,
          })
        );
      }
    } catch (error) {
      console.error('Background image upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private _truncatePath(path: string): string {
    if (!path) return '';
    const maxLength = 30;
    if (path.length <= maxLength) return path;
    return '...' + path.slice(-maxLength + 3);
  }

  private _getStateValueHint(entityId: string): string {
    if (!this.hass || !entityId) {
      return 'Enter the state value to trigger animation';
    }

    const entity = this.hass.states[entityId];
    if (!entity) {
      return 'Entity not found';
    }

    if (entity.state && entity.state !== 'unknown' && entity.state !== 'unavailable') {
      return `Current state: ${entity.state}`;
    }

    return 'Enter the state value to trigger animation';
  }

  private _getAttributeNameHint(entityId: string): string {
    if (!this.hass || !entityId) {
      return 'Enter the attribute name to monitor';
    }

    const entity = this.hass.states[entityId];
    if (!entity || !entity.attributes) {
      return 'Entity not found or has no attributes';
    }

    const availableAttributes = Object.keys(entity.attributes)
      .filter(key => !key.startsWith('_') && typeof entity.attributes[key] !== 'object')
      .slice(0, 3);

    if (availableAttributes.length > 0) {
      return `Available attributes: ${availableAttributes.join(', ')}${
        Object.keys(entity.attributes).length > 3 ? ', ...' : ''
      }`;
    }

    return 'Enter the attribute name to monitor';
  }

  private _getAttributeValueHint(entityId: string, attributeName: string): string {
    if (!this.hass || !entityId) {
      return 'Enter the attribute value to trigger animation';
    }

    if (!attributeName) {
      return 'Select an attribute first';
    }

    const entity = this.hass.states[entityId];
    if (!entity || !entity.attributes) {
      return 'Entity not found or has no attributes';
    }

    const attributeValue = entity.attributes[attributeName];
    if (attributeValue !== null && attributeValue !== undefined) {
      const valueStr = String(attributeValue);
      const displayValue = valueStr.length > 30 ? `${valueStr.slice(0, 27)}...` : valueStr;
      return `Current value: ${displayValue}`;
    }

    return 'Attribute not found - check the attribute name';
  }

  private _hasModifiedProperties(section: string): boolean {
    const props = this.designProperties;

    // Helper function to check if a value is actually set (not undefined, null, or empty string)
    const hasValue = (value: any): boolean => {
      return value !== undefined && value !== null && value !== '';
    };

    switch (section) {
      case 'text':
        return !!(
          hasValue(props.color) ||
          hasValue(props.text_align) ||
          hasValue(props.font_size) ||
          hasValue(props.line_height) ||
          hasValue(props.letter_spacing) ||
          hasValue(props.font_family) ||
          hasValue(props.font_weight) ||
          hasValue(props.text_transform) ||
          hasValue(props.font_style) ||
          hasValue(props.white_space)
        );
      case 'background':
        return !!(
          hasValue(props.background_color) ||
          hasValue(props.background_image) ||
          hasValue(props.background_image_type) ||
          hasValue(props.background_image_entity) ||
          hasValue(props.background_size) ||
          hasValue(props.background_repeat) ||
          hasValue(props.background_position) ||
          hasValue(props.backdrop_filter)
        );
      case 'sizes':
        return !!(
          hasValue(props.width) ||
          hasValue(props.height) ||
          hasValue(props.max_width) ||
          hasValue(props.max_height) ||
          hasValue(props.min_width) ||
          hasValue(props.min_height)
        );
      case 'spacing':
        return !!(
          hasValue(props.margin_top) ||
          hasValue(props.margin_bottom) ||
          hasValue(props.margin_left) ||
          hasValue(props.margin_right) ||
          hasValue(props.padding_top) ||
          hasValue(props.padding_bottom) ||
          hasValue(props.padding_left) ||
          hasValue(props.padding_right)
        );
      case 'border':
        return !!(
          hasValue(props.border_radius) ||
          hasValue(props.border_style) ||
          hasValue(props.border_width) ||
          hasValue(props.border_color)
        );
      case 'position':
        return !!(
          hasValue(props.position) ||
          hasValue(props.top) ||
          hasValue(props.bottom) ||
          hasValue(props.left) ||
          hasValue(props.right) ||
          hasValue(props.z_index)
        );
      case 'shadows':
        return !!(
          hasValue(props.text_shadow_h) ||
          hasValue(props.text_shadow_v) ||
          hasValue(props.text_shadow_blur) ||
          hasValue(props.text_shadow_color) ||
          hasValue(props.box_shadow_h) ||
          hasValue(props.box_shadow_v) ||
          hasValue(props.box_shadow_blur) ||
          hasValue(props.box_shadow_spread) ||
          hasValue(props.box_shadow_color)
        );
      case 'effects':
        return !!(hasValue(props.overflow) || hasValue(props.clip_path));
      case 'animations':
        return !!(
          hasValue(props.animation_type) ||
          hasValue(props.animation_entity) ||
          hasValue(props.animation_trigger_type) ||
          hasValue(props.animation_attribute) ||
          hasValue(props.animation_state) ||
          hasValue(props.intro_animation) ||
          hasValue(props.outro_animation) ||
          hasValue(props.animation_duration) ||
          hasValue(props.animation_delay) ||
          hasValue(props.animation_timing)
        );
      case 'custom_targeting':
        return !!hasValue(props.css_variable_prefix);
      default:
        return false;
    }
  }

  private _loadGoogleFont(fontFamily?: string): void {
    if (!fontFamily || fontFamily === '') {
      return; // Don't load fonts for default/empty selection
    }

    // Check if it's a web-safe font (contains comma)
    if (WEB_SAFE_FONTS.some(font => font.value === fontFamily)) {
      return; // Don't load Google Fonts for web-safe fonts
    }

    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`);
    if (existingLink) {
      return;
    }

    // Create and append Google Fonts link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  private _renderAccordion(
    title: string,
    content: TemplateResult,
    section: string
  ): TemplateResult {
    const isExpanded = this._expandedSections.has(section);
    const hasEdits = this._hasModifiedProperties(section);

    return html`
      <div class="accordion-section">
        <div class="accordion-header ${isExpanded ? 'expanded' : ''}">
          <button class="accordion-toggle" @click=${() => this._toggleSection(section)}>
            <span class="accordion-title">
              ${title} ${hasEdits ? html`<span class="edit-indicator"></span>` : ''}
            </span>
          </button>
          <div class="accordion-actions">
            ${hasEdits
              ? html`
                  <button
                    class="reset-button"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._resetSection(section);
                    }}
                    title="Reset ${title} settings to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                `
              : ''}
            <button class="expand-button" @click=${() => this._toggleSection(section)}>
              <ha-icon icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"></ha-icon>
            </button>
          </div>
        </div>
        ${isExpanded ? html`<div class="accordion-content">${content}</div>` : ''}
      </div>
    `;
  }

  protected render(): TemplateResult {
    const lang = this.hass?.locale?.language || 'en';
    return html`
      <div class="global-design-tab">
        <!-- Design Actions Toolbar -->
        <div class="design-toolbar">
          <button
            class="toolbar-button copy-button"
            @click=${this._copyDesign}
            title="${localize(
              'editor.design.copy_tooltip',
              lang,
              'Copy current design settings (works across all Ultra Cards)'
            )}"
          >
            <ha-icon icon="mdi:content-copy"></ha-icon>
            <span>${localize('editor.design.copy', lang, 'Copy')}</span>
          </button>

          <button
            class="toolbar-button paste-button ${this._clipboardProperties ? 'has-content' : ''}"
            @click=${this._pasteDesign}
            ?disabled=${!this._clipboardProperties}
            title="${this._clipboardProperties
              ? localize(
                  'editor.design.paste_tooltip_has',
                  lang,
                  'Paste copied design settings (from cross-card clipboard)'
                )
              : localize(
                  'editor.design.paste_tooltip_none',
                  lang,
                  'No design settings in cross-card clipboard'
                )}"
          >
            <ha-icon icon="mdi:content-paste"></ha-icon>
            <span>${localize('editor.design.paste', lang, 'Paste')}</span>
          </button>

          <button
            class="toolbar-button reset-all-button"
            @click=${this._resetAllDesign}
            title="${localize(
              'editor.design.reset_all_tooltip',
              lang,
              'Reset all design settings to default'
            )}"
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
            <span>${localize('editor.design.reset_all', lang, 'Reset All')}</span>
          </button>
        </div>

        ${this._renderAccordion(
          localize('editor.design.text_section', lang, 'Text'),
          html`
            <div class="property-group">
              <ultra-color-picker
                .label=${localize('editor.design.text_color', lang, 'Text Color')}
                .value=${this.designProperties.color || ''}
                .defaultValue=${'var(--primary-text-color)'}
                .hass=${this.hass}
                @value-changed=${(e: CustomEvent) => this._updateProperty('color', e.detail.value)}
              ></ultra-color-picker>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.alignment', lang, 'Alignment:')}:</label>
              <div class="button-group">
                ${[
                  { value: 'inherit', icon: 'mdi:circle-off-outline' },
                  { value: 'left', icon: 'mdi:format-align-left' },
                  { value: 'center', icon: 'mdi:format-align-center' },
                  { value: 'right', icon: 'mdi:format-align-right' },
                  { value: 'justify', icon: 'mdi:format-align-justify' },
                ].map(
                  opt => html`
                    <button
                      class="property-btn ${(this.designProperties.text_align || 'inherit') ===
                      opt.value
                        ? 'active'
                        : ''}"
                      @click=${() =>
                        this._updateProperty(
                          'text_align',
                          opt.value === 'inherit' ? undefined : (opt.value as any)
                        )}
                      title=${opt.value === 'inherit'
                        ? localize(
                            'editor.design.inherit_alignment',
                            lang,
                            'Inherit (no alignment)'
                          )
                        : opt.value}
                    >
                      <ha-icon icon="${opt.icon}"></ha-icon>
                    </button>
                  `
                )}
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.font_size', lang, 'Font Size:')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.font_size || ''}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Store cursor position
                    const cursorPosition = target.selectionStart;
                    const cursorEnd = target.selectionEnd;

                    // Update property without immediate re-render
                    this._updateProperty('font_size', value);

                    // Restore cursor position after update
                    requestAnimationFrame(() => {
                      if (target && typeof cursorPosition === 'number') {
                        target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                      }
                    });
                  }}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(e, this.designProperties.font_size || '', value =>
                      this._updateProperty('font_size', value)
                    )}
                  placeholder="${localize(
                    'editor.design.font_size_placeholder',
                    lang,
                    '16px (default), 1.2rem, max(1rem, 1.5vw)'
                  )}"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('font_size', '')}
                  title="${localize(
                    'editor.design.reset_font_size',
                    lang,
                    'Reset font size to default'
                  )}"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.line_height', lang, 'Line Height:')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.line_height || ''}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Store cursor position
                    const cursorPosition = target.selectionStart;
                    const cursorEnd = target.selectionEnd;

                    // Update property without immediate re-render
                    this._updateProperty('line_height', value);

                    // Restore cursor position after update
                    requestAnimationFrame(() => {
                      if (target && typeof cursorPosition === 'number') {
                        target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                      }
                    });
                  }}
                  placeholder="${localize(
                    'editor.design.line_height_placeholder',
                    lang,
                    '0 (default), 28px, 1.7'
                  )}"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('line_height', '')}
                  title="${localize(
                    'editor.design.reset_line_height',
                    lang,
                    'Reset line height to default'
                  )}"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.letter_spacing', lang, 'Letter Spacing:')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.letter_spacing || ''}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Store cursor position
                    const cursorPosition = target.selectionStart;
                    const cursorEnd = target.selectionEnd;

                    // Update property without immediate re-render
                    this._updateProperty('letter_spacing', value);

                    // Restore cursor position after update
                    requestAnimationFrame(() => {
                      if (target && typeof cursorPosition === 'number') {
                        target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                      }
                    });
                  }}
                  placeholder="${localize(
                    'editor.design.letter_spacing_placeholder',
                    lang,
                    'auto (default), 1px, -0.04em'
                  )}"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('letter_spacing', '')}
                  title="${localize(
                    'editor.design.reset_letter_spacing',
                    lang,
                    'Reset letter spacing to default'
                  )}"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.font', lang, 'Font')}:</label>
              <div class="input-with-reset">
                <select
                  .value=${this.designProperties.font_family || ''}
                  @change=${(e: Event) => {
                    const value = (e.target as HTMLSelectElement).value;
                    this._updateProperty('font_family', value);
                    this._loadGoogleFont(value);
                  }}
                  class="property-select"
                >
                  <option value="">
                    ${localize('editor.design.default_option', lang, '– Default –')}
                  </option>
                  <optgroup label="Web-safe Fonts">
                    ${WEB_SAFE_FONTS.map(
                      font => html`
                        <option value="${font.value}">${font.label}</option>
                      `
                    )}
                  </optgroup>
                  <optgroup label="Google Fonts">
                    ${GOOGLE_FONTS.map(
                      font => html`
                        <option value="${font.value}">${font.label}</option>
                      `
                    )}
                  </optgroup>
                </select>
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('font_family', '')}
                  title="${localize(
                    'editor.design.reset_font',
                    lang,
                    'Reset font to default'
                  )}"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
              ${this.designProperties.font_family && GOOGLE_FONTS.some(font => font.value === this.designProperties.font_family)
                ? html`
                    <div class="google-fonts-info-box">
                      <ha-icon icon="mdi:information-outline"></ha-icon>
                      <span>
                        ${localize(
                          'editor.design.google_fonts_warning',
                          lang,
                          'Google Fonts load dynamically from Google\'s CDN and require an internet connection. They will not be available on local/offline installations.'
                        )}
                      </span>
                    </div>
                  `
                : ''}
            </div>

            <div class="property-group">
              <label>${localize('editor.design.font_weight', lang, 'Font Weight')}:</label>
              <div class="input-with-reset">
                <select
                  .value=${this.designProperties.font_weight || ''}
                  @change=${(e: Event) =>
                    this._updateProperty('font_weight', (e.target as HTMLSelectElement).value)}
                  class="property-select"
                >
                  <option value="">
                    ${localize('editor.design.default_option', lang, '– Default –')}
                  </option>
                  <option value="100">
                    ${localize('editor.design.weight_thin', lang, '100 - Thin')}
                  </option>
                  <option value="300">
                    ${localize('editor.design.weight_light', lang, '300 - Light')}
                  </option>
                  <option value="400">
                    ${localize('editor.design.weight_normal', lang, '400 - Normal')}
                  </option>
                  <option value="500">
                    ${localize('editor.design.weight_medium', lang, '500 - Medium')}
                  </option>
                  <option value="600">
                    ${localize('editor.design.weight_semi_bold', lang, '600 - Semi Bold')}
                  </option>
                  <option value="700">
                    ${localize('editor.design.weight_bold', lang, '700 - Bold')}
                  </option>
                  <option value="900">
                    ${localize('editor.design.weight_black', lang, '900 - Black')}
                  </option>
                </select>
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('font_weight', '')}
                  title="${localize(
                    'editor.design.reset_font_weight',
                    lang,
                    'Reset font weight to default'
                  )}"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.text_transform', lang, 'Text Transform')}:</label>
              <div class="input-with-reset">
                <select
                  .value=${this.designProperties.text_transform || ''}
                  @change=${(e: Event) =>
                    this._updateProperty('text_transform', (e.target as HTMLSelectElement).value)}
                  class="property-select"
                >
                  <option value="">
                    ${localize('editor.design.default_option', lang, '– Default –')}
                  </option>
                  <option value="none">
                    ${localize('editor.design.transform_none', lang, 'None')}
                  </option>
                  <option value="uppercase">
                    ${localize('editor.design.transform_uppercase', lang, 'UPPERCASE')}
                  </option>
                  <option value="lowercase">
                    ${localize('editor.design.transform_lowercase', lang, 'lowercase')}
                  </option>
                  <option value="capitalize">
                    ${localize('editor.design.transform_capitalize', lang, 'Capitalize')}
                  </option>
                </select>
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('text_transform', '')}
                  title="${localize(
                    'editor.design.reset_text_transform',
                    lang,
                    'Reset text transform to default'
                  )}"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.font_style', lang, 'Font Style')}:</label>
              <div class="input-with-reset">
                <select
                  .value=${this.designProperties.font_style || ''}
                  @change=${(e: Event) =>
                    this._updateProperty('font_style', (e.target as HTMLSelectElement).value)}
                  class="property-select"
                >
                  <option value="">
                    ${localize('editor.design.default_option', lang, '– Default –')}
                  </option>
                  <option value="normal">
                    ${localize('editor.design.style_normal', lang, 'Normal')}
                  </option>
                  <option value="italic">
                    ${localize('editor.design.style_italic', lang, 'Italic')}
                  </option>
                  <option value="oblique">
                    ${localize('editor.design.style_oblique', lang, 'Oblique')}
                  </option>
                </select>
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('font_style', '')}
                  title="${localize(
                    'editor.design.reset_font_style',
                    lang,
                    'Reset font style to default'
                  )}"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.white_space', lang, 'White Space')}:</label>
              <div class="input-with-reset">
                <select
                  .value=${this.designProperties.white_space || ''}
                  @change=${(e: Event) =>
                    this._updateProperty('white_space', (e.target as HTMLSelectElement).value)}
                  class="property-select"
                >
                  <option value="">
                    ${localize('editor.design.default_option', lang, '– Default –')}
                  </option>
                  <option value="normal">
                    ${localize('editor.design.white_space_normal', lang, 'Normal')}
                  </option>
                  <option value="nowrap">
                    ${localize('editor.design.white_space_nowrap', lang, 'No Wrap')}
                  </option>
                  <option value="pre">
                    ${localize('editor.design.white_space_pre', lang, 'Pre')}
                  </option>
                  <option value="pre-wrap">
                    ${localize('editor.design.white_space_pre_wrap', lang, 'Pre Wrap')}
                  </option>
                  <option value="pre-line">
                    ${localize('editor.design.white_space_pre_line', lang, 'Pre Line')}
                  </option>
                </select>
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('white_space', '')}
                  title="${localize(
                    'editor.design.reset_white_space',
                    lang,
                    'Reset white space to default'
                  )}"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>
          `,
          'text'
        )}
        ${this._renderAccordion(
          localize('editor.design.background_section', lang, 'Background'),
          html`
            <div class="property-group">
              <ultra-color-picker
                .label=${localize('editor.design.background_color', lang, 'Background Color')}
                .value=${this.designProperties.background_color || ''}
                .defaultValue=${'transparent'}
                .hass=${this.hass}
                @value-changed=${(e: CustomEvent) =>
                  this._updateProperty('background_color', e.detail.value)}
              ></ultra-color-picker>
            </div>

            <div class="property-group">
              <label
                >${localize(
                  'editor.design.background_image_type',
                  lang,
                  'Background Image Type'
                )}:</label
              >
              <select
                .value=${this.designProperties.background_image_type || 'none'}
                @change=${(e: Event) =>
                  this._updateProperty(
                    'background_image_type',
                    (e.target as HTMLSelectElement).value
                  )}
                class="property-select"
              >
                <option value="none">${localize('editor.design.bg_none', lang, 'None')}</option>
                <option value="upload">
                  ${localize('editor.design.bg_upload', lang, 'Upload Image')}
                </option>
                <option value="entity">
                  ${localize('editor.design.bg_entity', lang, 'Entity Image')}
                </option>
                <option value="url">${localize('editor.design.bg_url', lang, 'Image URL')}</option>
              </select>
            </div>

            ${this.designProperties.background_image_type === 'upload'
              ? html`
                  <div class="property-group">
                    <label
                      >${localize(
                        'editor.design.upload_bg_image',
                        lang,
                        'Upload Background Image'
                      )}:</label
                    >
                    <div class="upload-container">
                      <div class="file-upload-row">
                        <label class="file-upload-button">
                          <div class="button-content">
                            <ha-icon icon="mdi:upload"></ha-icon>
                            <span class="button-label"
                              >${localize('editor.design.choose_file', lang, 'Choose File')}</span
                            >
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            @change=${this._handleBackgroundImageUpload}
                            style="display: none"
                          />
                        </label>
                        <div class="path-display">
                          ${this.designProperties.background_image
                            ? html`<span
                                class="uploaded-path"
                                title="${this.designProperties.background_image}"
                              >
                                ${this._truncatePath(this.designProperties.background_image)}
                              </span>`
                            : html`<span class="no-file"
                                >${localize(
                                  'editor.design.no_file_chosen',
                                  lang,
                                  'No file chosen'
                                )}</span
                              >`}
                        </div>
                      </div>
                    </div>
                  </div>
                `
              : ''}
            ${this.designProperties.background_image_type === 'entity'
              ? html`
                  <div class="property-group">
                    <label
                      >${localize(
                        'editor.design.bg_image_entity',
                        lang,
                        'Background Image Entity'
                      )}:</label
                    >
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this.designProperties.background_image_entity || ''}
                      @value-changed=${(e: CustomEvent) =>
                        this._updateProperty('background_image_entity', e.detail.value)}
                      .label=${'Select entity with image attribute'}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                `
              : ''}
            ${this.designProperties.background_image_type === 'url'
              ? html`
                  <div class="property-group">
                    <label
                      >${localize(
                        'editor.design.bg_image_url',
                        lang,
                        'Background Image URL'
                      )}:</label
                    >
                    <input
                      type="text"
                      .value=${this.designProperties.background_image || ''}
                      @input=${(e: Event) =>
                        this._updateProperty(
                          'background_image',
                          (e.target as HTMLInputElement).value
                        )}
                      placeholder="https://example.com/image.jpg"
                      class="property-input"
                    />
                  </div>
                `
              : ''}
            ${this.designProperties.background_image_type &&
            this.designProperties.background_image_type !== 'none'
              ? html`
                  <div class="property-group">
                    <label>Background Size:</label>
                    <select
                      .value=${this._getBackgroundSizeDropdownValue(
                        this.designProperties.background_size
                      )}
                      @change=${(e: Event) =>
                        this._updateProperty(
                          'background_size',
                          (e.target as HTMLSelectElement).value
                        )}
                      class="property-select"
                    >
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="auto">Auto</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  ${this._getBackgroundSizeDropdownValue(this.designProperties.background_size) ===
                  'custom'
                    ? html`
                        <div class="property-group">
                          <label>Custom Width:</label>
                          <input
                            type="text"
                            .value=${this._getCustomSizeValue(
                              this.designProperties.background_size,
                              'width'
                            )}
                            @input=${(e: Event) => {
                              const width = (e.target as HTMLInputElement).value;
                              const height = this._getCustomSizeValue(
                                this.designProperties.background_size,
                                'height'
                              );
                              const customSize =
                                width && height ? `${width} ${height}` : width || height || 'auto';
                              this._updateProperty('background_size', customSize);
                            }}
                            placeholder="100px, 50%, auto"
                            class="property-input"
                          />
                        </div>
                        <div class="property-group">
                          <label>Custom Height:</label>
                          <input
                            type="text"
                            .value=${this._getCustomSizeValue(
                              this.designProperties.background_size,
                              'height'
                            )}
                            @input=${(e: Event) => {
                              const height = (e.target as HTMLInputElement).value;
                              const width = this._getCustomSizeValue(
                                this.designProperties.background_size,
                                'width'
                              );
                              const customSize =
                                width && height ? `${width} ${height}` : width || height || 'auto';
                              this._updateProperty('background_size', customSize);
                            }}
                            placeholder="100px, 50%, auto"
                            class="property-input"
                          />
                        </div>
                      `
                    : ''}

                  <div class="property-group">
                    <label>Background Repeat:</label>
                    <select
                      .value=${this.designProperties.background_repeat || 'no-repeat'}
                      @change=${(e: Event) =>
                        this._updateProperty(
                          'background_repeat',
                          (e.target as HTMLSelectElement).value
                        )}
                      class="property-select"
                    >
                      <option value="no-repeat">No Repeat</option>
                      <option value="repeat">Repeat</option>
                      <option value="repeat-x">Repeat X</option>
                      <option value="repeat-y">Repeat Y</option>
                    </select>
                  </div>

                  <div class="property-group">
                    <label>Background Position:</label>
                    <select
                      .value=${this.designProperties.background_position || 'center center'}
                      @change=${(e: Event) =>
                        this._updateProperty(
                          'background_position',
                          (e.target as HTMLSelectElement).value
                        )}
                      class="property-select"
                    >
                      <option value="left top">Left Top</option>
                      <option value="left center">Left Center</option>
                      <option value="left bottom">Left Bottom</option>
                      <option value="center top">Center Top</option>
                      <option value="center center">Center</option>
                      <option value="center bottom">Center Bottom</option>
                      <option value="right top">Right Top</option>
                      <option value="right center">Right Center</option>
                      <option value="right bottom">Right Bottom</option>
                    </select>
                  </div>
                `
              : ''}

            <div class="property-group">
              <label
                >${localize(
                  'editor.design.backdrop_filter',
                  this.hass?.locale?.language || 'en',
                  'Backdrop Filter'
                )}:</label
              >
              <input
                type="text"
                .value=${this.designProperties.backdrop_filter || ''}
                @input=${(e: Event) =>
                  this._updateProperty('backdrop_filter', (e.target as HTMLInputElement).value)}
                placeholder="blur(10px), grayscale(100%), invert(75%)"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label
                >${localize(
                  'editor.design.background_filter',
                  this.hass?.locale?.language || 'en',
                  'Background Filter'
                )}:</label
              >
              <input
                type="text"
                .value=${this.designProperties.background_filter || ''}
                @input=${(e: Event) =>
                  this._updateProperty('background_filter', (e.target as HTMLInputElement).value)}
                placeholder="grayscale(100%), blur(10px), brightness(0.5)"
                class="property-input"
              />
            </div>
          `,
          'background'
        )}
        ${this._renderAccordion(
          localize('editor.design.sizes_section', lang, 'Sizes'),
          html`
            <div class="property-group">
              <label>${localize('editor.design.width', lang, 'Width')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.width || ''}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Store cursor position
                    const cursorPosition = target.selectionStart;
                    const cursorEnd = target.selectionEnd;

                    // Update property without immediate re-render
                    this._updateProperty('width', value);

                    // Restore cursor position after update
                    requestAnimationFrame(() => {
                      if (target && typeof cursorPosition === 'number') {
                        target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                      }
                    });
                  }}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(e, this.designProperties.width || '', value =>
                      this._updateProperty('width', value)
                    )}
                  placeholder="auto (default), 200px, 100%, 14rem, 10vw"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('width', '')}
                  title="Reset width to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.height', lang, 'Height')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.height || ''}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Store cursor position
                    const cursorPosition = target.selectionStart;
                    const cursorEnd = target.selectionEnd;

                    // Update property without immediate re-render
                    this._updateProperty('height', value);

                    // Restore cursor position after update
                    requestAnimationFrame(() => {
                      if (target && typeof cursorPosition === 'number') {
                        target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                      }
                    });
                  }}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(e, this.designProperties.height || '', value =>
                      this._updateProperty('height', value)
                    )}
                  placeholder="auto (default), 200px, 15rem, 10vh"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('height', '')}
                  title="Reset height to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.max_width', lang, 'Max Width')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.max_width || ''}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Store cursor position
                    const cursorPosition = target.selectionStart;
                    const cursorEnd = target.selectionEnd;

                    // Update property without immediate re-render
                    this._updateProperty('max_width', value);

                    // Restore cursor position after update
                    requestAnimationFrame(() => {
                      if (target && typeof cursorPosition === 'number') {
                        target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                      }
                    });
                  }}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(e, this.designProperties.max_width || '', value =>
                      this._updateProperty('max_width', value)
                    )}
                  placeholder="200px, 100%, 14rem, 10vw"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('max_width', '')}
                  title="Reset max width to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.max_height', lang, 'Max Height')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.max_height || ''}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Store cursor position
                    const cursorPosition = target.selectionStart;
                    const cursorEnd = target.selectionEnd;

                    // Update property without immediate re-render
                    this._updateProperty('max_height', value);

                    // Restore cursor position after update
                    requestAnimationFrame(() => {
                      if (target && typeof cursorPosition === 'number') {
                        target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                      }
                    });
                  }}
                  placeholder="200px, 15rem, 10vh"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('max_height', '')}
                  title="Reset max height to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.min_width', lang, 'Min Width')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.min_width || ''}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Store cursor position
                    const cursorPosition = target.selectionStart;
                    const cursorEnd = target.selectionEnd;

                    // Update property without immediate re-render
                    this._updateProperty('min_width', value);

                    // Restore cursor position after update
                    requestAnimationFrame(() => {
                      if (target && typeof cursorPosition === 'number') {
                        target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                      }
                    });
                  }}
                  placeholder="200px, 100%, 14rem, 10vw"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('min_width', '')}
                  title="Reset min width to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.min_height', lang, 'Min Height')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.min_height || ''}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Store cursor position
                    const cursorPosition = target.selectionStart;
                    const cursorEnd = target.selectionEnd;

                    // Update property without immediate re-render
                    this._updateProperty('min_height', value);

                    // Restore cursor position after update
                    requestAnimationFrame(() => {
                      if (target && typeof cursorPosition === 'number') {
                        target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                      }
                    });
                  }}
                  placeholder="200px, 15rem, 10vh"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('min_height', '')}
                  title="Reset min height to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>
          `,
          'sizes'
        )}
        ${this._renderAccordion(
          localize('editor.design.spacing_section', lang, 'Spacing'),
          html`
            <div class="spacing-group">
              <div class="spacing-header">
                <h4>
                  ${localize('editor.design.margin', this.hass?.locale?.language || 'en', 'Margin')}
                </h4>
                <button
                  type="button"
                  class="lock-button ${this._marginLocked ? 'locked' : ''}"
                  @click=${() => this._toggleSpacingLock('margin')}
                  title="${this._marginLocked
                    ? 'Unlock to edit sides independently'
                    : 'Lock to edit all sides together'}"
                >
                  <ha-icon icon="${this._marginLocked ? 'mdi:lock' : 'mdi:lock-open'}"></ha-icon>
                </button>
              </div>
              <div class="spacing-fields-desktop">
                <div class="spacing-field">
                  <label>Top</label>
                  <input
                    type="text"
                    placeholder="8px, auto, 1rem"
                    .value=${this.designProperties.margin_top || ''}
                    @input=${this._createSpacingInputHandler('margin', 'top')}
                    @keydown=${this._createProtectedKeydownHandler(
                      'margin_top',
                      () => this.designProperties.margin_top || '',
                      (value: string) => this._updateSpacing('margin', 'top', value)
                    )}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Right</label>
                  <input
                    type="text"
                    placeholder="0px, auto, 1rem"
                    .value=${this._marginLocked
                      ? this.designProperties.margin_top || ''
                      : this.designProperties.margin_right || ''}
                    .disabled=${this._marginLocked}
                    @input=${this._createSpacingInputHandler('margin', 'right')}
                    @keydown=${this._createProtectedKeydownHandler(
                      'margin_right',
                      () => this.designProperties.margin_right || '',
                      (value: string) => this._updateSpacing('margin', 'right', value)
                    )}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    class="spacing-input ${this._marginLocked ? 'locked' : ''}"
                  />
                </div>
                <div class="spacing-field">
                  <label>Bottom</label>
                  <input
                    type="text"
                    placeholder="8px, auto, 1rem"
                    .value=${this._marginLocked
                      ? this.designProperties.margin_top || ''
                      : this.designProperties.margin_bottom || ''}
                    .disabled=${this._marginLocked}
                    @input=${this._createSpacingInputHandler('margin', 'bottom')}
                    @keydown=${this._createProtectedKeydownHandler(
                      'margin_bottom',
                      () => this.designProperties.margin_bottom || '',
                      (value: string) => this._updateSpacing('margin', 'bottom', value)
                    )}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    class="spacing-input ${this._marginLocked ? 'locked' : ''}"
                  />
                </div>
                <div class="spacing-field">
                  <label>Left</label>
                  <input
                    type="text"
                    placeholder="0px, auto, 1rem"
                    .value=${this._marginLocked
                      ? this.designProperties.margin_top || ''
                      : this.designProperties.margin_left || ''}
                    .disabled=${this._marginLocked}
                    @input=${this._createSpacingInputHandler('margin', 'left')}
                    @keydown=${this._createProtectedKeydownHandler(
                      'margin_left',
                      () => this.designProperties.margin_left || '',
                      (value: string) => this._updateSpacing('margin', 'left', value)
                    )}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    class="spacing-input ${this._marginLocked ? 'locked' : ''}"
                  />
                </div>
              </div>
            </div>

            <div class="spacing-group">
              <div class="spacing-header">
                <h4>Padding</h4>
                <button
                  type="button"
                  class="lock-button ${this._paddingLocked ? 'locked' : ''}"
                  @click=${() => this._toggleSpacingLock('padding')}
                  title="${this._paddingLocked
                    ? 'Unlock to edit sides independently'
                    : 'Lock to edit all sides together'}"
                >
                  <ha-icon icon="${this._paddingLocked ? 'mdi:lock' : 'mdi:lock-open'}"></ha-icon>
                </button>
              </div>
              <div class="spacing-fields-desktop">
                <div class="spacing-field">
                  <label>Top</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.padding_top || ''}
                    @input=${this._createSpacingInputHandler('padding', 'top')}
                    @keydown=${this._createProtectedKeydownHandler(
                      'padding_top',
                      () => this.designProperties.padding_top || '',
                      (value: string) => this._updateSpacing('padding', 'top', value)
                    )}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Right</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this._paddingLocked
                      ? this.designProperties.padding_top || ''
                      : this.designProperties.padding_right || ''}
                    .disabled=${this._paddingLocked}
                    @input=${this._createSpacingInputHandler('padding', 'right')}
                    @keydown=${this._createProtectedKeydownHandler(
                      'padding_right',
                      () => this.designProperties.padding_right || '',
                      (value: string) => this._updateSpacing('padding', 'right', value)
                    )}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    class="spacing-input ${this._paddingLocked ? 'locked' : ''}"
                  />
                </div>
                <div class="spacing-field">
                  <label>Bottom</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this._paddingLocked
                      ? this.designProperties.padding_top || ''
                      : this.designProperties.padding_bottom || ''}
                    .disabled=${this._paddingLocked}
                    @input=${this._createSpacingInputHandler('padding', 'bottom')}
                    @keydown=${this._createProtectedKeydownHandler(
                      'padding_bottom',
                      () => this.designProperties.padding_bottom || '',
                      (value: string) => this._updateSpacing('padding', 'bottom', value)
                    )}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    class="spacing-input ${this._paddingLocked ? 'locked' : ''}"
                  />
                </div>
                <div class="spacing-field">
                  <label>Left</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this._paddingLocked
                      ? this.designProperties.padding_top || ''
                      : this.designProperties.padding_left || ''}
                    .disabled=${this._paddingLocked}
                    @input=${this._createSpacingInputHandler('padding', 'left')}
                    @keydown=${this._createProtectedKeydownHandler(
                      'padding_left',
                      () => this.designProperties.padding_left || '',
                      (value: string) => this._updateSpacing('padding', 'left', value)
                    )}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    class="spacing-input ${this._paddingLocked ? 'locked' : ''}"
                  />
                </div>
              </div>
            </div>
          `,
          'spacing'
        )}
        ${this._renderAccordion(
          localize('editor.design.border_section', lang, 'Border'),
          html`
            <div class="property-group">
              <label>${localize('editor.design.border_radius', lang, 'Border Radius')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.border_radius || ''}
                  @input=${this._createRobustInputHandler(
                    'border_radius',
                    (value: string) => this._updateProperty('border_radius', value)
                  )}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(
                      e,
                      this.designProperties.border_radius || '',
                      value => this._updateProperty('border_radius', value)
                    )}
                  placeholder="5px, 50%, 0.3em, 12px 0"
                  class="property-input"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('border_radius', '')}
                  title="Reset border radius to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.border_style', lang, 'Border Style')}:</label>
              <select
                .value=${this.designProperties.border_style || ''}
                @change=${(e: Event) =>
                  this._updateProperty('border_style', (e.target as HTMLSelectElement).value)}
                class="property-select"
              >
                <option value="">
                  ${localize(
                    'editor.design.border_style_none',
                    this.hass?.locale?.language || 'en',
                    'None'
                  )}
                </option>
                <option value="solid">
                  ${localize(
                    'editor.design.border_style_solid',
                    this.hass?.locale?.language || 'en',
                    'Solid'
                  )}
                </option>
                <option value="dashed">
                  ${localize(
                    'editor.design.border_style_dashed',
                    this.hass?.locale?.language || 'en',
                    'Dashed'
                  )}
                </option>
                <option value="dotted">
                  ${localize(
                    'editor.design.border_style_dotted',
                    this.hass?.locale?.language || 'en',
                    'Dotted'
                  )}
                </option>
                <option value="double">
                  ${localize(
                    'editor.design.border_style_double',
                    this.hass?.locale?.language || 'en',
                    'Double'
                  )}
                </option>
              </select>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.border_width', lang, 'Border Width')}:</label>
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.border_width || ''}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Store cursor position
                    const cursorPosition = target.selectionStart;
                    const cursorEnd = target.selectionEnd;

                    // Update property without immediate re-render
                    this._updateProperty('border_width', value);

                    // Restore cursor position after update
                    requestAnimationFrame(() => {
                      if (target && typeof cursorPosition === 'number') {
                        target.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                      }
                    });
                  }}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(e, this.designProperties.border_width || '', value =>
                      this._updateProperty('border_width', value)
                    )}
                  placeholder="1px, 2px, 0.125rem"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('border_width', '')}
                  title="Reset border width to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <ultra-color-picker
                .label=${localize('editor.design.border_color', lang, 'Border Color')}
                .value=${this.designProperties.border_color || ''}
                .defaultValue=${'var(--divider-color)'}
                .hass=${this.hass}
                @value-changed=${(e: CustomEvent) =>
                  this._updateProperty('border_color', e.detail.value)}
              ></ultra-color-picker>
            </div>
          `,
          'border'
        )}
        ${this._renderAccordion(
          localize('editor.design.position_section', lang, 'Position'),
          html`
            <div class="property-group">
              <label
                >${localize(
                  'editor.design.position',
                  this.hass?.locale?.language || 'en',
                  'Position'
                )}:</label
              >
              <select
                .value=${this.designProperties.position || ''}
                @change=${(e: Event) =>
                  this._updateProperty('position', (e.target as HTMLSelectElement).value)}
                class="property-select"
              >
                <option value="">
                  ${localize(
                    'editor.design.position_default',
                    this.hass?.locale?.language || 'en',
                    '– Default –'
                  )}
                </option>
                <option value="static">
                  ${localize(
                    'editor.design.position_static',
                    this.hass?.locale?.language || 'en',
                    'Static'
                  )}
                </option>
                <option value="relative">
                  ${localize(
                    'editor.design.position_relative',
                    this.hass?.locale?.language || 'en',
                    'Relative'
                  )}
                </option>
                <option value="absolute">
                  ${localize(
                    'editor.design.position_absolute',
                    this.hass?.locale?.language || 'en',
                    'Absolute'
                  )}
                </option>
                <option value="fixed">
                  ${localize(
                    'editor.design.position_fixed',
                    this.hass?.locale?.language || 'en',
                    'Fixed'
                  )}
                </option>
                <option value="sticky">
                  ${localize(
                    'editor.design.position_sticky',
                    this.hass?.locale?.language || 'en',
                    'Sticky'
                  )}
                </option>
              </select>
            </div>

            ${this.designProperties.position && this.designProperties.position !== 'static'
              ? html`
                  <div class="position-grid">
                    <input
                      type="text"
                      placeholder="Top"
                      .value=${this.designProperties.top || ''}
                      @input=${(e: Event) =>
                        this._updateProperty('top', (e.target as HTMLInputElement).value)}
                      @keydown=${(e: KeyboardEvent) =>
                        this._handleNumericKeydown(e, this.designProperties.top || '', value =>
                          this._updateProperty('top', value)
                        )}
                    />
                    <div class="position-row">
                      <input
                        type="text"
                        placeholder="Left"
                        .value=${this.designProperties.left || ''}
                        @input=${(e: Event) =>
                          this._updateProperty('left', (e.target as HTMLInputElement).value)}
                        @keydown=${(e: KeyboardEvent) =>
                          this._handleNumericKeydown(e, this.designProperties.left || '', value =>
                            this._updateProperty('left', value)
                          )}
                      />
                      <div class="position-center">POS</div>
                      <input
                        type="text"
                        placeholder="Right"
                        .value=${this.designProperties.right || ''}
                        @input=${(e: Event) =>
                          this._updateProperty('right', (e.target as HTMLInputElement).value)}
                        @keydown=${(e: KeyboardEvent) =>
                          this._handleNumericKeydown(e, this.designProperties.right || '', value =>
                            this._updateProperty('right', value)
                          )}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Bottom"
                      .value=${this.designProperties.bottom || ''}
                      @input=${(e: Event) =>
                        this._updateProperty('bottom', (e.target as HTMLInputElement).value)}
                      @keydown=${(e: KeyboardEvent) =>
                        this._handleNumericKeydown(e, this.designProperties.bottom || '', value =>
                          this._updateProperty('bottom', value)
                        )}
                    />
                  </div>

                  <div class="property-group">
                    <label>Z-Index:</label>
                    <input
                      type="text"
                      .value=${this.designProperties.z_index || ''}
                      @input=${(e: Event) =>
                        this._updateProperty('z_index', (e.target as HTMLInputElement).value)}
                      @keydown=${(e: KeyboardEvent) =>
                        this._handleNumericKeydown(e, this.designProperties.z_index || '', value =>
                          this._updateProperty('z_index', value)
                        )}
                      placeholder="-1, 1, 3, 50"
                      class="property-input"
                    />
                  </div>
                `
              : ''}
          `,
          'position'
        )}
        ${this._renderAccordion(
          localize('editor.design.text_shadow_section', lang, 'Text Shadow'),
          html`
            <div class="property-group">
              <label
                >${localize(
                  'editor.design.horizontal_shift',
                  this.hass?.locale?.language || 'en',
                  'Horizontal Shift'
                )}:</label
              >
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.text_shadow_h || ''}
                  @input=${this._createRobustInputHandler('text_shadow_h', (value: string) =>
                    this._updateProperty('text_shadow_h', value)
                  )}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(
                      e,
                      this.designProperties.text_shadow_h || '',
                      value => this._updateProperty('text_shadow_h', value)
                    )}
                  placeholder="0, 3px, 0.05em, 2rem"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('text_shadow_h', '')}
                  title="Reset horizontal shadow to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label
                >${localize(
                  'editor.design.vertical_shift',
                  this.hass?.locale?.language || 'en',
                  'Vertical Shift'
                )}:</label
              >
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.text_shadow_v || ''}
                  @input=${this._createRobustInputHandler('text_shadow_v', (value: string) =>
                    this._updateProperty('text_shadow_v', value)
                  )}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(
                      e,
                      this.designProperties.text_shadow_v || '',
                      value => this._updateProperty('text_shadow_v', value)
                    )}
                  placeholder="0, 3px, 0.05em, 2rem"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('text_shadow_v', '')}
                  title="Reset vertical shadow to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label
                >${localize(
                  'editor.design.blur',
                  this.hass?.locale?.language || 'en',
                  'Blur'
                )}:</label
              >
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.text_shadow_blur || ''}
                  @input=${(e: Event) =>
                    this._updateProperty('text_shadow_blur', (e.target as HTMLInputElement).value)}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(
                      e,
                      this.designProperties.text_shadow_blur || '',
                      value => this._updateProperty('text_shadow_blur', value)
                    )}
                  placeholder="0, 3px, 0.05em, 2rem"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('text_shadow_blur', '')}
                  title="Reset shadow blur to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <ultra-color-picker
                .label=${localize('editor.design.text_shadow_color', lang, 'Text Shadow Color')}
                .value=${this.designProperties.text_shadow_color || ''}
                .defaultValue=${'rgba(0,0,0,0.5)'}
                .hass=${this.hass}
                @value-changed=${(e: CustomEvent) =>
                  this._updateProperty('text_shadow_color', e.detail.value)}
              ></ultra-color-picker>
            </div>
          `,
          'text-shadow'
        )}
        ${this._renderAccordion(
          localize('editor.design.box_shadow_section', lang, 'Box Shadow'),
          html`
            <div class="property-group">
              <label
                >${localize(
                  'editor.design.horizontal_shift',
                  this.hass?.locale?.language || 'en',
                  'Horizontal Shift'
                )}:</label
              >
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.box_shadow_h || ''}
                  @input=${this._createRobustInputHandler('box_shadow_h', (value: string) =>
                    this._updateProperty('box_shadow_h', value)
                  )}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(e, this.designProperties.box_shadow_h || '', value =>
                      this._updateProperty('box_shadow_h', value)
                    )}
                  placeholder="0, 3px, 0.05em, 2rem"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('box_shadow_h', '')}
                  title="Reset horizontal box shadow to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label
                >${localize(
                  'editor.design.vertical_shift',
                  this.hass?.locale?.language || 'en',
                  'Vertical Shift'
                )}:</label
              >
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.box_shadow_v || ''}
                  @input=${this._createRobustInputHandler('box_shadow_v', (value: string) =>
                    this._updateProperty('box_shadow_v', value)
                  )}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(e, this.designProperties.box_shadow_v || '', value =>
                      this._updateProperty('box_shadow_v', value)
                    )}
                  placeholder="0, 3px, 0.05em, 2rem"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('box_shadow_v', '')}
                  title="Reset vertical box shadow to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label
                >${localize(
                  'editor.design.blur',
                  this.hass?.locale?.language || 'en',
                  'Blur'
                )}:</label
              >
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.box_shadow_blur || ''}
                  @input=${(e: Event) =>
                    this._updateProperty('box_shadow_blur', (e.target as HTMLInputElement).value)}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(
                      e,
                      this.designProperties.box_shadow_blur || '',
                      value => this._updateProperty('box_shadow_blur', value)
                    )}
                  placeholder="0, 3px, 0.05em, 2rem"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('box_shadow_blur', '')}
                  title="Reset box shadow blur to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <label
                >${localize(
                  'editor.design.spread',
                  this.hass?.locale?.language || 'en',
                  'Spread'
                )}:</label
              >
              <div class="input-with-reset">
                <input
                  type="text"
                  .value=${this.designProperties.box_shadow_spread || ''}
                  @input=${this._createRobustInputHandler('box_shadow_spread', (value: string) =>
                    this._updateProperty('box_shadow_spread', value)
                  )}
                  @keydown=${(e: KeyboardEvent) =>
                    this._handleNumericKeydown(
                      e,
                      this.designProperties.box_shadow_spread || '',
                      value => this._updateProperty('box_shadow_spread', value)
                    )}
                  placeholder="0, 3px, 0.05em, 2rem"
                  class="property-input"
                />
                <button
                  class="reset-btn"
                  @click=${() => this._updateProperty('box_shadow_spread', '')}
                  title="Reset box shadow spread to default"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <div class="property-group">
              <ultra-color-picker
                .label=${localize('editor.design.box_shadow_color', lang, 'Box Shadow Color')}
                .value=${this.designProperties.box_shadow_color || ''}
                .defaultValue=${'rgba(0,0,0,0.1)'}
                .hass=${this.hass}
                @value-changed=${(e: CustomEvent) =>
                  this._updateProperty('box_shadow_color', e.detail.value)}
              ></ultra-color-picker>
            </div>
          `,
          'box-shadow'
        )}
        ${this._renderAccordion(
          localize('editor.design.overflow_section', lang, 'Overflow'),
          html`
            <div class="property-group">
              <label>${localize('editor.design.overflow', lang, 'Overflow')}:</label>
              <select
                .value=${this.designProperties.overflow || 'visible'}
                @change=${(e: Event) =>
                  this._updateProperty('overflow', (e.target as HTMLSelectElement).value)}
                class="property-select"
              >
                <option value="visible">Visible (Default)</option>
                <option value="hidden">Hidden</option>
                <option value="scroll">Scroll</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div class="property-group">
              <label>${localize('editor.design.clip_path', lang, 'Clip-path')}:</label>
              <input
                type="text"
                .value=${this.designProperties.clip_path || ''}
                @input=${(e: Event) =>
                  this._updateProperty('clip_path', (e.target as HTMLInputElement).value)}
                placeholder="ellipse(75% 100% at bottom)"
                class="property-input"
              />
              <small class="property-hint"
                >Examples:<br />
                ellipse(75% 100% at bottom)<br />
                polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)<br />
                polygon(100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%, 25% 6.7%, 75% 6.7%)
              </small>
            </div>
          `,
          'overflow'
        )}
        ${this._renderAccordion(
          localize('editor.design.animations_section', lang, 'Animations'),
          html`
            <!-- State-based Animation -->
            <div class="property-section">
              <h5>
                ${localize(
                  'editor.design.state_based_animation',
                  this.hass?.locale?.language || 'en',
                  'State-based Animation'
                )}
              </h5>
              <div class="property-group">
                <label
                  >${localize(
                    'editor.design.animation_type',
                    this.hass?.locale?.language || 'en',
                    'Animation Type'
                  )}:</label
                >
                <select
                  .value=${this.designProperties.animation_type || 'none'}
                  @change=${(e: Event) =>
                    this._updateProperty('animation_type', (e.target as HTMLSelectElement).value)}
                  class="property-select"
                >
                  <option value="none">
                    ${localize('editor.design.none', this.hass?.locale?.language || 'en', 'None')}
                  </option>
                  <option value="pulse">Pulse</option>
                  <option value="vibrate">Vibrate</option>
                  <option value="rotate-left">Rotate Left</option>
                  <option value="rotate-right">Rotate Right</option>
                  <option value="hover">Hover</option>
                  <option value="fade">Fade</option>
                  <option value="scale">Scale</option>
                  <option value="bounce">Bounce</option>
                  <option value="shake">Shake</option>
                  <option value="tada">Tada</option>
                </select>
              </div>

              <div class="property-group">
                <label
                  >${localize(
                    'editor.design.animation_duration',
                    this.hass?.locale?.language || 'en',
                    'Animation Duration'
                  )}:</label
                >
                <input
                  type="text"
                  .value=${this.designProperties.animation_duration || '2s'}
                  @change=${(e: Event) =>
                    this._updateProperty(
                      'animation_duration',
                      (e.target as HTMLInputElement).value
                    )}
                  placeholder="2s, 500ms, 1.5s"
                  class="property-input"
                />
                <small class="property-hint">
                  ${localize(
                    'editor.design.animation_duration_desc',
                    this.hass?.locale?.language || 'en',
                    'Duration for the animation (e.g., 2s, 500ms, 1.5s)'
                  )}
                </small>
              </div>

              ${this.designProperties.animation_type &&
              this.designProperties.animation_type !== 'none'
                ? html`
                    <div class="property-group">
                      <label>Entity to Monitor:</label>
                      <ha-form
                        .hass=${this.hass}
                        .data=${{ entity: this.designProperties.animation_entity || '' }}
                        .schema=${[
                          {
                            name: 'entity',
                            selector: { entity: {} },
                            label: 'Entity',
                          },
                        ]}
                        @value-changed=${(e: CustomEvent) =>
                          this._updateProperty('animation_entity', e.detail.value.entity)}
                      ></ha-form>
                    </div>

                    ${this.designProperties.animation_entity
                      ? html`
                          <div class="property-group">
                            <label>Animation Trigger Type:</label>
                            <select
                              id="animation-trigger-type-select"
                              .value=${this.designProperties.animation_trigger_type || 'state'}
                              @change=${(e: Event) => {
                                const triggerType = (e.target as HTMLSelectElement).value as
                                  | 'state'
                                  | 'attribute';

                                // Create an update object
                                const updates: Partial<DesignProperties> = {
                                  animation_trigger_type: triggerType,
                                  animation_state: '', // Reset state when changing type
                                  animation_attribute: '', // Reset attribute when changing type
                                };

                                // Apply updates through parent component
                                if (this.onUpdate) {
                                  this.onUpdate(updates);
                                } else {
                                  this.dispatchEvent(
                                    new CustomEvent('design-changed', {
                                      detail: updates,
                                      bubbles: true,
                                      composed: true,
                                    })
                                  );
                                }

                                // Force immediate local update for responsive UI
                                this.designProperties = {
                                  ...this.designProperties,
                                  ...updates,
                                };

                                // Request update
                                this.requestUpdate();
                              }}
                              class="property-select ${this.designProperties
                                .animation_trigger_type === 'attribute'
                                ? 'attribute-mode'
                                : 'state-mode'}"
                            >
                              <option value="state">Entity State</option>
                              <option value="attribute">Entity Attribute</option>
                            </select>
                            <div
                              class="trigger-type-indicator ${this.designProperties
                                .animation_trigger_type === 'attribute'
                                ? 'attribute-mode-indicator'
                                : 'state-mode-indicator'}"
                            >
                              <ha-icon
                                icon="${this.designProperties.animation_trigger_type === 'attribute'
                                  ? 'mdi:format-list-checks'
                                  : 'mdi:state-machine'}"
                              ></ha-icon>
                              <span
                                >${this.designProperties.animation_trigger_type === 'attribute'
                                  ? 'Attribute mode: select an attribute and its value to trigger the animation'
                                  : 'State mode: enter a state value to trigger the animation'}</span
                              >
                            </div>
                          </div>

                          ${(() => {
                            // SIMPLIFIED TRIGGER TYPE DETECTION:
                            // Use component properties as the primary source of truth
                            const currentTriggerType =
                              this.designProperties.animation_trigger_type || 'state';
                            const isAttributeMode = currentTriggerType === 'attribute';

                            // Render attribute mode UI when trigger type is 'attribute'
                            if (isAttributeMode) {
                              return html`
                                <div class="property-group attribute-mode-container">
                                  <div class="property-group">
                                    <label>
                                      <ha-icon icon="mdi:format-list-checks"></ha-icon>
                                      Attribute Name:
                                    </label>
                                    <input
                                      type="text"
                                      .value=${this.designProperties.animation_attribute || ''}
                                      @input=${(e: Event) => {
                                        const attribute = (e.target as HTMLInputElement).value;

                                        // Reference to the input element for visual feedback
                                        const inputElement = e.target as HTMLInputElement;

                                        // Visual feedback - temporarily add a success class
                                        inputElement.classList.add('change-success');

                                        // Create a batch of updates to ensure UI consistency
                                        const updates = {
                                          animation_attribute: attribute,
                                          animation_state: '', // Reset the state value when changing attributes
                                        };

                                        // Apply updates using the appropriate method
                                        if (this.onUpdate) {
                                          this.onUpdate(updates);
                                        } else {
                                          this.dispatchEvent(
                                            new CustomEvent('design-changed', {
                                              detail: updates,
                                              bubbles: true,
                                              composed: true,
                                            })
                                          );
                                        }

                                        // Progressive UI refresh strategy with cascading timeouts
                                        setTimeout(() => {
                                          this.requestUpdate();
                                        }, 50);

                                        setTimeout(() => {
                                          this.requestUpdate();
                                        }, 150);

                                        setTimeout(() => {
                                          this.requestUpdate();
                                        }, 300);

                                        setTimeout(() => {
                                          this.requestUpdate();

                                          // Remove the success class after animation completes
                                          inputElement.classList.remove('change-success');
                                        }, 500);
                                      }}
                                      placeholder="friendly_name, device_class, state, etc."
                                      class="property-input attribute-mode-input"
                                    />
                                    <small class="property-hint">
                                      Enter the attribute name manually (e.g., friendly_name,
                                      device_class, state, battery_level)
                                    </small>
                                  </div>

                                  <div class="property-group">
                                    <label>
                                      <ha-icon icon="mdi:format-text"></ha-icon>
                                      Attribute Value:
                                    </label>
                                    <input
                                      type="text"
                                      .value=${this.designProperties.animation_state || ''}
                                      @input=${(e: Event) =>
                                        this._updateProperty(
                                          'animation_state',
                                          (e.target as HTMLInputElement).value
                                        )}
                                      placeholder="blue, 255, heating, on, off, etc."
                                      class="property-input attribute-value-input"
                                    />
                                    <small class="property-hint">
                                      Enter the attribute value that will trigger the animation
                                    </small>
                                  </div>
                                </div>
                              `;
                            } else {
                              return html`
                                <div
                                  class="property-group state-value-container"
                                  style="display: ${String(
                                    this.designProperties.animation_trigger_type
                                  ) !== 'attribute'
                                    ? 'block !important'
                                    : 'none !important'}"
                                  data-mode="state"
                                >
                                  <label>
                                    <ha-icon icon="mdi:state-machine"></ha-icon>
                                    State Value:
                                  </label>
                                  <input
                                    type="text"
                                    .value=${this.designProperties.animation_state || ''}
                                    @input=${(e: Event) =>
                                      this._updateProperty(
                                        'animation_state',
                                        (e.target as HTMLInputElement).value
                                      )}
                                    placeholder="on, off, playing, idle, etc."
                                    class="property-input state-value-input"
                                  />
                                  <small class="property-hint">
                                    Enter the exact state value that will trigger the animation
                                  </small>
                                  <div class="property-hint state-value-hint">
                                    <ha-icon icon="mdi:information-outline"></ha-icon>
                                    <span>
                                      ${this._getStateValueHint(
                                        this.designProperties.animation_entity
                                      )}
                                    </span>
                                  </div>
                                </div>
                              `;
                            }
                          })()}
                        `
                      : html`
                          <div class="property-group">
                            <label>Trigger Type:</label>
                            <select disabled class="property-select">
                              <option>Select an entity first</option>
                            </select>
                            <small class="property-hint">
                              Select an entity first to configure trigger conditions
                            </small>
                          </div>
                        `}
                  `
                : ''}
            </div>

            <!-- Intro/Outro Animations -->
            <div class="property-section">
              <h5>
                ${localize(
                  'editor.design.intro_outro_animations',
                  this.hass?.locale?.language || 'en',
                  'Intro & Outro Animations'
                )}
              </h5>
              <div class="two-column-grid">
                <div class="property-group">
                  <label
                    >${localize(
                      'editor.design.intro_animation',
                      this.hass?.locale?.language || 'en',
                      'Intro Animation'
                    )}:</label
                  >
                  <select
                    .value=${this.designProperties.intro_animation || 'none'}
                    @change=${(e: Event) =>
                      this._updateProperty(
                        'intro_animation',
                        (e.target as HTMLSelectElement).value
                      )}
                    class="property-select"
                  >
                    <option value="none">
                      ${localize('editor.design.none', this.hass?.locale?.language || 'en', 'None')}
                    </option>
                    <option value="fadeIn">Fade In</option>
                    <option value="slideInUp">Slide In Up</option>
                    <option value="slideInDown">Slide In Down</option>
                    <option value="slideInLeft">Slide In Left</option>
                    <option value="slideInRight">Slide In Right</option>
                    <option value="zoomIn">Zoom In</option>
                    <option value="bounceIn">Bounce In</option>
                    <option value="flipInX">Flip In X</option>
                    <option value="flipInY">Flip In Y</option>
                    <option value="rotateIn">Rotate In</option>
                  </select>
                </div>

                <div class="property-group">
                  <label
                    >${localize(
                      'editor.design.outro_animation',
                      this.hass?.locale?.language || 'en',
                      'Outro Animation'
                    )}:</label
                  >
                  <select
                    .value=${this.designProperties.outro_animation || 'none'}
                    @change=${(e: Event) =>
                      this._updateProperty(
                        'outro_animation',
                        (e.target as HTMLSelectElement).value
                      )}
                    class="property-select"
                  >
                    <option value="none">
                      ${localize('editor.design.none', this.hass?.locale?.language || 'en', 'None')}
                    </option>
                    <option value="fadeOut">Fade Out</option>
                    <option value="slideOutUp">Slide Out Up</option>
                    <option value="slideOutDown">Slide Out Down</option>
                    <option value="slideOutLeft">Slide Out Left</option>
                    <option value="slideOutRight">Slide Out Right</option>
                    <option value="zoomOut">Zoom Out</option>
                    <option value="bounceOut">Bounce Out</option>
                    <option value="flipOutX">Flip Out X</option>
                    <option value="flipOutY">Flip Out Y</option>
                    <option value="rotateOut">Rotate Out</option>
                  </select>
                </div>
              </div>

              <!-- Animation Settings -->
              <div class="three-column-grid">
                <div class="property-group">
                  <label
                    >${localize(
                      'editor.design.duration',
                      this.hass?.locale?.language || 'en',
                      'Duration'
                    )}:</label
                  >
                  <input
                    type="text"
                    .value=${this.designProperties.animation_duration || ''}
                    @change=${(e: Event) =>
                      this._updateProperty(
                        'animation_duration',
                        (e.target as HTMLInputElement).value
                      )}
                    placeholder="0.3s, 500ms"
                    class="property-input"
                  />
                </div>

                <div class="property-group">
                  <label
                    >${localize(
                      'editor.design.delay',
                      this.hass?.locale?.language || 'en',
                      'Delay'
                    )}:</label
                  >
                  <input
                    type="text"
                    .value=${this.designProperties.animation_delay || ''}
                    @change=${(e: Event) =>
                      this._updateProperty('animation_delay', (e.target as HTMLInputElement).value)}
                    placeholder="0s, 100ms"
                    class="property-input"
                  />
                </div>

                <div class="property-group">
                  <label
                    >${localize(
                      'editor.design.timing',
                      this.hass?.locale?.language || 'en',
                      'Timing'
                    )}:</label
                  >
                  <select
                    .value=${this.designProperties.animation_timing || 'ease'}
                    @change=${(e: Event) =>
                      this._updateProperty(
                        'animation_timing',
                        (e.target as HTMLSelectElement).value
                      )}
                    class="property-select"
                  >
                    <option value="ease">
                      ${localize('editor.design.ease', this.hass?.locale?.language || 'en', 'Ease')}
                    </option>
                    <option value="linear">Linear</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="ease-in-out">Ease In Out</option>
                    <option value="cubic-bezier(0.25,0.1,0.25,1)">Custom Cubic</option>
                  </select>
                </div>
              </div>
            </div>
          `,
          'animations'
        )}
        ${this._renderAccordion(
          localize('editor.design.custom_targeting_section', lang, 'Custom Targeting'),
          html`
            <div class="property-group">
              <label
                >${localize('editor.design.css_var_prefix', lang, 'CSS Variable Prefix')}:</label
              >
              <input
                type="text"
                .value=${this.designProperties.css_variable_prefix || ''}
                @input=${(e: Event) =>
                  this._updateProperty('css_variable_prefix', (e.target as HTMLInputElement).value)}
                placeholder="my-row"
                class="property-input"
              />
              <div class="field-description">
                ${localize(
                  'editor.design.css_var_prefix_desc',
                  lang,
                  'Prefix for CSS variables (e.g., "my-row" creates --my-row-bg-color, --my-row-text-color). Override with card-mod: style: | :host { --my-row-bg-color: red; }'
                )}
              </div>
            </div>
          `,
          'custom_targeting'
        )}
      </div>
    `;
  }

  static get styles() {
    return css`
      .global-design-tab {
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-sizing: border-box;
        overflow: hidden;
      }

      .design-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        margin-bottom: 8px;
        box-sizing: border-box;
        overflow: hidden;
      }

      .toolbar-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: 500;
        min-width: 0;
        flex: 1;
        justify-content: center;
      }

      .toolbar-button:hover:not(:disabled) {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .toolbar-button:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .toolbar-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--disabled-background-color, #f5f5f5);
        color: var(--disabled-text-color, #999);
        border-color: var(--disabled-border-color, #ddd);
      }

      .toolbar-button ha-icon {
        font-size: 16px;
        flex-shrink: 0;
      }

      .toolbar-button span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Specific button styling */
      .copy-button:hover:not(:disabled) {
        border-color: var(--info-color, #2196f3);
        background: var(--info-color, #2196f3);
      }

      .paste-button.has-content {
        border-color: var(--success-color, #4caf50);
        background: rgba(76, 175, 80, 0.1);
      }

      .paste-button.has-content:hover:not(:disabled) {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
      }

      .reset-all-button:hover:not(:disabled) {
        border-color: var(--error-color, #f44336);
        background: var(--error-color, #f44336);
      }

      /* Responsive design for smaller screens */
      @media (max-width: 768px) {
        .design-toolbar {
          flex-direction: column;
          gap: 8px;
        }

        .toolbar-button {
          width: 100%;
          justify-content: center;
        }
      }

      @media (max-width: 480px) {
        .toolbar-button span {
          display: none;
        }

        .toolbar-button {
          min-width: 44px;
          padding: 8px;
          justify-content: center;
        }

        .design-toolbar {
          flex-direction: row;
          justify-content: space-around;
        }
      }

      .accordion-section {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        box-sizing: border-box;
      }

      .accordion-header {
        width: 100%;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border: none;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
        color: var(--primary-text-color);
        transition: background-color 0.2s ease;
        box-sizing: border-box;
      }

      .accordion-header:hover {
        background: var(--primary-color);
        color: white;
      }

      .accordion-header.expanded {
        background: var(--primary-color);
        color: white;
        border-radius: 8px 8px 0 0;
      }

      .accordion-header:not(.expanded) {
        border-radius: 8px;
      }

      .accordion-toggle {
        background: none;
        border: none;
        color: inherit;
        font: inherit;
        cursor: pointer;
        display: flex;
        align-items: center;
        flex: 1;
        text-align: left;
        padding: 0;
      }

      .accordion-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .reset-button,
      .expand-button {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
        min-width: 24px;
        height: 24px;
      }

      .reset-button:hover,
      .expand-button:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .accordion-header:not(.expanded) .reset-button:hover,
      .accordion-header:not(.expanded) .expand-button:hover {
        background: rgba(0, 0, 0, 0.1);
      }

      .accordion-title {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .edit-indicator {
        width: 8px;
        height: 8px;
        background: var(--primary-color);
        border-radius: 50%;
        display: inline-block;
        animation: pulse 2s ease-in-out infinite;
      }

      .accordion-header.expanded .edit-indicator {
        background: white;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
      }

      .accordion-content {
        padding: 20px;
        background: var(--card-background-color, #fff);
        border-top: 1px solid var(--divider-color);
        border-radius: 0 0 8px 8px;
        position: relative;
        box-sizing: border-box;
        overflow: hidden;
      }

      .property-group {
        margin-bottom: 16px;
        box-sizing: border-box;
        overflow: hidden;
      }

      .property-group:last-child {
        margin-bottom: 0;
      }

      .property-group label {
        display: block;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--primary-text-color);
      }

      .property-input,
      .property-select {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
        max-width: 100%;
      }

      .property-input:focus,
      .property-select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .property-hint {
        display: block;
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: 4px;
        line-height: 1.3;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }

      .button-group {
        display: flex;
        gap: 4px;
      }

      .property-btn {
        flex: 1;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .property-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .property-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .spacing-group {
        margin-bottom: 20px;
      }

      .spacing-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .spacing-group h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .lock-button {
        padding: 6px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
      }

      .lock-button:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .lock-button.locked {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .spacing-fields-desktop {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }

      .spacing-field {
        display: flex;
        flex-direction: column;
      }

      .spacing-field label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
        text-align: center;
      }

      .spacing-input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 12px;
        text-align: center;
        box-sizing: border-box;
        max-width: 100%;
      }

      .spacing-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .spacing-input.locked {
        background: var(--disabled-color);
        color: var(--secondary-text-color);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .spacing-input.locked:focus {
        border-color: var(--divider-color);
        box-shadow: none;
      }

      @media (max-width: 768px) {
        .spacing-fields-desktop {
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
      }

      .google-fonts-info-box {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-top: 8px;
        padding: 12px;
        background: linear-gradient(135deg, rgba(var(--rgb-primary-color, 3, 169, 244), 0.1), rgba(var(--rgb-primary-color, 3, 169, 244), 0.05));
        border-left: 3px solid var(--primary-color);
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        animation: fadeIn 0.3s ease-in-out;
      }

      .google-fonts-info-box ha-icon {
        color: var(--primary-color);
        flex-shrink: 0;
        margin-top: 2px;
        --mdc-icon-size: 20px;
      }

      .google-fonts-info-box span {
        font-size: 13px;
        line-height: 1.5;
        color: var(--primary-text-color);
        opacity: 0.9;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .spacing-grid,
      .position-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        align-items: center;
        max-width: 150px;
        margin: 0 auto;
      }

      .spacing-row,
      .position-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 8px;
        align-items: center;
      }

      .spacing-center,
      .position-center {
        width: 40px;
        height: 32px;
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-weight: bold;
        font-size: 11px;
      }

      .spacing-grid input,
      .position-grid input {
        width: 100%;
        text-align: center;
        padding: 4px 8px;
        font-size: 12px;
      }

      /* Property sections */
      .property-section {
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--divider-color);
      }

      .property-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .property-section h5 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        padding-bottom: 8px;
        border-bottom: 1px solid var(--primary-color);
        display: inline-block;
      }

      /* Grid layouts */
      .two-column-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }

      .three-column-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }

      @media (max-width: 768px) {
        .two-column-grid,
        .three-column-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
      }

      /* Animation keyframes for intro/outro animations */
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutUp {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }

      @keyframes slideInDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }

      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutLeft {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-100%);
          opacity: 0;
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes zoomIn {
        from {
          transform: scale(0.3);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes zoomOut {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(0.3);
          opacity: 0;
        }
      }

      @keyframes bounceIn {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes bounceOut {
        20% {
          transform: scale(0.9);
        }
        50%,
        55% {
          transform: scale(1.05);
          opacity: 1;
        }
        100% {
          transform: scale(0.3);
          opacity: 0;
        }
      }

      @keyframes flipInX {
        from {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
        40% {
          transform: perspective(400px) rotateX(-20deg);
        }
        60% {
          transform: perspective(400px) rotateX(10deg);
        }
        80% {
          transform: perspective(400px) rotateX(-5deg);
        }
        to {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
      }

      @keyframes flipOutX {
        from {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
      }

      @keyframes flipInY {
        from {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
        40% {
          transform: perspective(400px) rotateY(-20deg);
        }
        60% {
          transform: perspective(400px) rotateY(10deg);
        }
        80% {
          transform: perspective(400px) rotateY(-5deg);
        }
        to {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
      }

      @keyframes flipOutY {
        from {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
      }

      @keyframes rotateIn {
        from {
          transform: rotate(-200deg);
          opacity: 0;
        }
        to {
          transform: rotate(0deg);
          opacity: 1;
        }
      }

      @keyframes rotateOut {
        from {
          transform: rotate(0deg);
          opacity: 1;
        }
        to {
          transform: rotate(200deg);
          opacity: 0;
        }
      }

      /* Color picker z-index fix - ensure above editor UI */
      ultra-color-picker {
        position: relative;
        z-index: ${Z_INDEX.COLOR_PICKER_CONTAINER};
      }

      /* Upload button styling */
      .upload-container {
        width: 100%;
      }

      .file-upload-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .file-upload-button {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 120px;
      }

      .file-upload-button:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }

      .button-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .button-label {
        font-size: 14px;
        font-weight: 500;
      }

      .path-display {
        flex: 1;
        min-width: 0;
      }

      .uploaded-path {
        color: var(--primary-text-color);
        font-size: 12px;
        word-break: break-all;
      }

      .no-file {
        color: var(--secondary-text-color);
        font-size: 12px;
        font-style: italic;
      }

      /* Attribute value selection styling */
      .attribute-value-selection {
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
        margin-bottom: 8px;
      }

      .attribute-value-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--primary-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
        appearance: menulist;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        max-height: 200px;
        overflow-y: auto;
      }

      .attribute-value-select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .attribute-value-select option {
        padding: 8px;
      }

      /* Enhanced attribute mode styling */
      .attribute-mode {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .attribute-mode-container {
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.05);
        padding: 12px;
        border-radius: 4px;
        border-left: 3px solid var(--primary-color);
        margin-bottom: 16px;
      }

      .trigger-type-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        margin: 8px 0;
        border-radius: 4px;
        font-weight: 500;
      }

      .attribute-mode-indicator {
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.1);
        border-left: 3px solid var(--primary-color);
        color: var(--primary-color);
      }

      .state-mode-indicator {
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1);
        border-left: 3px solid var(--info-color, #03a9f4);
        color: var(--info-color, #03a9f4);
      }

      .attribute-mode-select {
        border-color: var(--primary-color);
      }

      .attribute-value-container {
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.05);
        padding: 16px;
        border-radius: 8px;
        border-left: 3px solid var(--primary-color);
        margin-top: 16px;
      }

      .attribute-value-container label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--primary-color);
        font-weight: 600;
        margin-bottom: 8px;
      }

      .attribute-value-selection {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--primary-color);
        border-radius: 4px;
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.05);
        margin-top: 8px;
      }

      .attribute-value-input {
        border-color: var(--primary-color);
        border-width: 2px;
      }

      .attribute-value-dropdown-container {
        background: white;
        padding: 12px;
        border-radius: 4px;
        border: 1px dashed var(--primary-color);
        position: relative;
        overflow: hidden;
      }

      .attribute-value-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-color);
        margin-bottom: 4px;
      }

      .attribute-value-hint {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 8px;
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.05);
        padding: 8px;
        border-radius: 4px;
      }

      /* State mode styling */
      .state-value-container {
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.05);
        padding: 16px;
        border-radius: 8px;
        border-left: 3px solid var(--info-color, #03a9f4);
        margin-top: 16px;
      }

      .state-value-container label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--info-color, #03a9f4);
        font-weight: 600;
        margin-bottom: 8px;
      }

      .state-value-selection {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--info-color, #03a9f4);
        border-radius: 4px;
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.05);
        margin-top: 8px;
      }

      .state-value-input {
        border-color: var(--info-color, #03a9f4);
        border-width: 2px;
      }

      .state-value-dropdown-container {
        background: white;
        padding: 12px;
        border-radius: 4px;
        border: 1px dashed var(--info-color, #03a9f4);
        position: relative;
        overflow: hidden;
      }

      .state-value-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--info-color, #03a9f4);
        margin-bottom: 4px;
      }

      .state-value-hint {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 8px;
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.05);
        padding: 8px;
        border-radius: 4px;
      }

      .state-value-hint ha-icon {
        color: var(--info-color, #03a9f4);
        flex-shrink: 0;
      }

      .attribute-value-hint ha-icon,
      .state-value-hint ha-icon {
        color: currentColor;
        flex-shrink: 0;
      }

      /* Visual feedback animations */
      @keyframes success-pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(var(--rgb-success-color, 76, 175, 80), 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(var(--rgb-success-color, 76, 175, 80), 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(var(--rgb-success-color, 76, 175, 80), 0);
        }
      }

      .change-success {
        animation: success-pulse 0.5s ease-in-out;
        border-color: var(--success-color, #4caf50) !important;
        box-shadow: 0 0 0 1px var(--success-color, #4caf50);
        transition: all 0.3s ease;
      }

      .attribute-mode-select.change-success,
      .state-mode-select.change-success {
        border-width: 2px;
      }

      .select-attribute-first {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        color: var(--warning-color, #ff9800);
        font-style: italic;
        text-align: center;
        background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.05);
        border: 1px dashed var(--warning-color, #ff9800);
        border-radius: 4px;
      }

      /* Mode switch animation */
      @keyframes highlight-fade {
        0% {
          background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.2);
        }
        100% {
          background-color: transparent;
        }
      }

      .trigger-type-indicator {
        animation: highlight-fade 1.5s ease-out;
      }

      /* Additional highlight animation for mode switches */
      @keyframes border-pulse {
        0% {
          border-left-width: 3px;
        }
        50% {
          border-left-width: 6px;
        }
        100% {
          border-left-width: 3px;
        }
      }

      .attribute-mode-indicator {
        animation: border-pulse 1s ease-in-out;
      }

      .state-mode-indicator {
        animation: border-pulse 1s ease-in-out;
      }

      /* Visual transitions for UI state changes */
      .property-select,
      .property-input,
      .attribute-value-select,
      .state-value-select {
        transition:
          border-color 0.3s ease,
          box-shadow 0.3s ease,
          background-color 0.3s ease;
      }

      /* Value selection feedback */
      .attribute-value-select:focus,
      .state-value-select:focus {
        border-width: 2px;
        transform: translateY(-1px);
      }

      /* Attribute mode specific animations */
      .attribute-mode-select::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.1);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .attribute-mode-select:focus::after {
        opacity: 1;
      }

      /* State mode specific animations */
      .state-value-select::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .state-value-select:focus::after {
        opacity: 1;
      }

      /* Animation classes */
      .fadeIn {
        animation: fadeIn var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .fadeOut {
        animation: fadeOut var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideInUp {
        animation: slideInUp var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideOutUp {
        animation: slideOutUp var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideInDown {
        animation: slideInDown var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideOutDown {
        animation: slideOutDown var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideInLeft {
        animation: slideInLeft var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideOutLeft {
        animation: slideOutLeft var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideInRight {
        animation: slideInRight var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideOutRight {
        animation: slideOutRight var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .zoomIn {
        animation: zoomIn var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .zoomOut {
        animation: zoomOut var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .bounceIn {
        animation: bounceIn var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .bounceOut {
        animation: bounceOut var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .flipInX {
        animation: flipInX var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .flipOutX {
        animation: flipOutX var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .flipInY {
        animation: flipInY var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .flipOutY {
        animation: flipOutY var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .rotateIn {
        animation: rotateIn var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .rotateOut {
        animation: rotateOut var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }

      /* Input with reset button styles */
      .input-with-reset {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }

      .input-with-reset .property-input,
      .input-with-reset .property-select {
        flex: 1;
      }

      .reset-btn {
        width: 32px;
        height: 32px;
        min-width: 32px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .reset-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .reset-btn ha-icon {
        font-size: 16px;
      }

      /* Field description styling */
      .field-description {
        margin-top: 12px;
        padding: 12px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
        border-left: 3px solid var(--primary-color, #03a9f4);
        border-radius: 4px;
        font-size: 13px;
        line-height: 1.5;
        color: var(--secondary-text-color);
      }
    `;
  }

  private _getBackgroundSizeDropdownValue(backgroundSize: string | undefined): string {
    if (!backgroundSize) {
      return 'cover';
    }

    // If it's one of the preset values, return it as-is
    if (['cover', 'contain', 'auto'].includes(backgroundSize)) {
      return backgroundSize;
    }

    // If it's 'custom' or any other custom value, return 'custom'
    return 'custom';
  }

  private _getCustomSizeValue(
    backgroundSize: string | undefined,
    dimension: 'width' | 'height'
  ): string {
    if (!backgroundSize || ['cover', 'contain', 'auto'].includes(backgroundSize)) {
      return '';
    }

    // If it's just 'custom' without actual values, return empty
    if (backgroundSize === 'custom') {
      return '';
    }

    // Parse custom size value like "100px 200px" or "50% auto"
    const parts = backgroundSize.split(' ');
    if (dimension === 'width') {
      return parts[0] || '';
    } else if (dimension === 'height') {
      return parts[1] || parts[0] || '';
    }
    return '';
  }
}
