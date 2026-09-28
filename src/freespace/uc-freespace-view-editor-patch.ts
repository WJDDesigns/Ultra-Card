/**
 * Guarded patch of Home Assistant's view editor so FreeSpace appears in the
 * Layout dropdown (same approach as thomasloven/lovelace-layout-card).
 *
 * Only affects discoverability: YAML `type: custom:ultra-freespace-view` always
 * works. Failures are swallowed so a HA schema change never breaks the card.
 */

import { localize } from '../localize/localize';
import { ucFreeSpaceSettingsService } from '../services/uc-freespace-settings-service';
import { BREAKPOINT_SPECS, type FreeSpaceBreakpoint } from './uc-freespace-breakpoints';
import { DEFAULT_GRID, DEFAULT_MIN_HEIGHT, FREESPACE_VIEW_TYPE } from './types';

const FREESPACE_OPTION = {
  value: FREESPACE_VIEW_TYPE,
  label: 'FreeSpace (Ultra Card)',
};

function lang(): string {
  const ha = document.querySelector('home-assistant') as any;
  return ha?.hass?.locale?.language ?? 'en';
}

function t(key: string, fallback: string): string {
  return localize(`freespace.${key}`, lang(), fallback);
}

function bpLabel(bp: FreeSpaceBreakpoint): string {
  const name = t(`bp_${bp}`, BREAKPOINT_SPECS[bp].label);
  return bp === 'phone' ? name : `${name} (≥ ${BREAKPOINT_SPECS[bp].minWidth}px)`;
}

function defaultNote(bp: FreeSpaceBreakpoint): string {
  return t('editor_default', 'Default {value}.').replace(
    '{value}',
    String(BREAKPOINT_SPECS[bp].canvasWidth)
  );
}

function label(name: string): string | undefined {
  switch (name) {
    case 'freespace_specifics':
      return t('editor_section', 'FreeSpace view specific settings');
    case 'freespace':
      return 'FreeSpace';
    case 'canvas_widths':
      return t('editor_canvas_widths', 'Breakpoint canvas sizes');
    case 'desktop':
    case 'laptop':
    case 'tablet':
    case 'phone':
      return bpLabel(name);
    case 'min_height':
      return t('editor_min_height', 'Minimum artboard height');
    case 'grid':
      return t('editor_grid', 'Snap grid (0 = off)');
    case 'narrow':
      return t('editor_narrow', 'Phone without layout');
    case 'canvas_width':
      return t('editor_canvas_width_legacy', 'Desktop canvas width (legacy)');
    default:
      return undefined;
  }
}

function helper(name: string): string | undefined {
  switch (name) {
    case 'canvas_widths':
      return t(
        'editor_canvas_widths_help',
        'Artboard design width per breakpoint (defaults: Desktop {desktop}, Laptop {laptop}, Tablet {tablet}, Phone {phone}). On screen, FreeSpace fills the view at 1:1 like Sections. It does not stretch a small canvas to enlarge cards.'
      )
        .replace('{desktop}', String(BREAKPOINT_SPECS.desktop.canvasWidth))
        .replace('{laptop}', String(BREAKPOINT_SPECS.laptop.canvasWidth))
        .replace('{tablet}', String(BREAKPOINT_SPECS.tablet.canvasWidth))
        .replace('{phone}', String(BREAKPOINT_SPECS.phone.canvasWidth));
    case 'desktop':
      return `${defaultNote('desktop')} ${t('editor_desktop_help', 'Cards use this layout on wide screens.')}`;
    case 'laptop':
    case 'tablet':
      return defaultNote(name);
    case 'phone':
      return `${defaultNote('phone')} ${t(
        'editor_phone_help',
        'If Phone uses Desktop and “stack” is on, cards stack until you choose Custom and arrange a Phone layout.'
      )}`;
    case 'min_height':
      return t(
        'editor_min_height_help',
        'Artboard grows with content; this is the floor (default {value}).'
      ).replace('{value}', String(DEFAULT_MIN_HEIGHT));
    case 'grid':
      return t('editor_grid_help', 'Snap step in artboard units while dragging and resizing.');
    case 'narrow':
      return t(
        'editor_narrow_help',
        'When Phone uses the Desktop layout: stack cards for readability, or keep scaling the artboard.'
      );
    default:
      return undefined;
  }
}

let installed = false;

function findTypeSelector(schema: unknown[]): any | undefined {
  return schema.find(
    (e: any) => e && typeof e === 'object' && e.name === 'type' && e.selector?.select?.options
  );
}

function numberSelector(min: number, max: number) {
  return {
    number: {
      min,
      max,
      mode: 'box',
      step: 1,
    },
  };
}

/**
 * One outer expandable (HA’s “view specific settings” pattern). Fields inside
 * are flat — no nested accordions for FreeSpace / canvas sizes.
 */
function buildFreeSpaceExpandable(): Record<string, unknown> {
  return {
    name: 'freespace_specifics',
    type: 'expandable',
    flatten: true,
    expanded: true,
    visible: { field: 'type', value: FREESPACE_VIEW_TYPE },
    schema: [
      {
        name: 'freespace',
        schema: [
          {
            name: 'canvas_widths',
            schema: [
              {
                name: 'desktop',
                default: BREAKPOINT_SPECS.desktop.canvasWidth,
                selector: numberSelector(280, 4000),
              },
              {
                name: 'laptop',
                default: BREAKPOINT_SPECS.laptop.canvasWidth,
                selector: numberSelector(280, 4000),
              },
              {
                name: 'tablet',
                default: BREAKPOINT_SPECS.tablet.canvasWidth,
                selector: numberSelector(280, 2000),
              },
              {
                name: 'phone',
                default: BREAKPOINT_SPECS.phone.canvasWidth,
                selector: numberSelector(280, 1000),
              },
            ],
          },
          {
            name: 'min_height',
            default: DEFAULT_MIN_HEIGHT,
            selector: numberSelector(200, 8000),
          },
          {
            name: 'grid',
            default: DEFAULT_GRID,
            selector: numberSelector(0, 64),
          },
          {
            name: 'narrow',
            default: 'stack',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'stack', label: t('editor_narrow_stack', 'Stack cards (recommended)') },
                  { value: 'scale', label: t('editor_narrow_scale', 'Keep scaled artboard') },
                ],
              },
            },
          },
        ],
      },
    ],
  };
}

/**
 * Wrap an editor instance's `_schema` so FreeSpace is listed when discoverable.
 * Called from firstUpdated (or immediately if already updated).
 */
function patchEditorInstance(editor: any): void {
  if (!editor || editor.__ucFreeSpacePatched) return;
  editor.__ucFreeSpacePatched = true;

  const original = editor._schema;
  if (typeof original !== 'function') return;

  editor._schema = function ucFreeSpaceSchema(...args: unknown[]) {
    const retval = original.apply(this, args);
    if (!Array.isArray(retval)) return retval;

    try {
      const ha = document.querySelector('home-assistant') as any;
      const hass = ha?.hass;
      if (!ucFreeSpaceSettingsService.isDiscoverable(hass)) {
        return retval;
      }

      const typeSelector = findTypeSelector(retval);
      if (!typeSelector) return retval;

      const options: any[] = typeSelector.selector.select.options;
      if (!options.find((o: any) => o?.value === FREESPACE_VIEW_TYPE)) {
        options.push({ ...FREESPACE_OPTION });
      }

      if (!retval.find((e: any) => e?.name === 'freespace_specifics')) {
        retval.push(buildFreeSpaceExpandable());
      }
    } catch {
      // Schema shape changed; leave HA's schema alone.
    }
    return retval;
  };

  // Labels / helpers for our custom schema names
  const origLabel = editor._computeLabel?.bind(editor);
  editor._computeLabel = (schema: { name?: string }) => {
    const ours = schema?.name ? label(schema.name) : undefined;
    if (ours) return ours;
    return origLabel?.(schema) ?? schema?.name;
  };
  const origHelper = editor._computeHelper?.bind(editor);
  editor._computeHelper = (schema: { name?: string }) => {
    const ours = schema?.name ? helper(schema.name) : undefined;
    if (ours) return ours;
    return origHelper?.(schema);
  };

  try {
    editor.requestUpdate?.();
  } catch {
    // ignore
  }
}

/** Install the hui-view-editor patch once. Idempotent and safe if HA is absent. */
export function installFreeSpaceViewEditorPatch(): void {
  if (installed || typeof customElements === 'undefined') return;
  installed = true;

  const hook = () => {
    try {
      const Ctor = customElements.get('hui-view-editor') as any;
      if (!Ctor?.prototype) return;

      const originalFirstUpdated = Ctor.prototype.firstUpdated;
      Ctor.prototype.firstUpdated = function ucFreeSpaceFirstUpdated(...args: unknown[]) {
        try {
          originalFirstUpdated?.apply(this, args);
        } catch {
          // ignore
        }
        patchEditorInstance(this);
      };

      document.querySelectorAll('hui-view-editor').forEach(el => patchEditorInstance(el));
    } catch {
      // ignore
    }
  };

  if (customElements.get('hui-view-editor')) {
    hook();
  } else {
    customElements.whenDefined('hui-view-editor').then(hook).catch(() => {
      // HA frontend never loaded the editor; fine.
    });
  }
}
