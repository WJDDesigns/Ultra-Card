/**
 * Guarded patch of Home Assistant's view editor so FreeSpace appears in the
 * Layout dropdown (same approach as thomasloven/lovelace-layout-card).
 *
 * Only affects discoverability: YAML `type: custom:ultra-freespace-view` always
 * works. Failures are swallowed so a HA schema change never breaks the card.
 */

import { ucFreeSpaceSettingsService } from '../services/uc-freespace-settings-service';
import { BREAKPOINT_SPECS } from './uc-freespace-breakpoints';
import { FREESPACE_VIEW_TYPE } from './types';

const FREESPACE_OPTION = {
  value: FREESPACE_VIEW_TYPE,
  label: 'FreeSpace (Ultra Card)',
};

const LABEL_MAP: Record<string, string> = {
  freespace_specifics: 'FreeSpace view specific settings',
  freespace: 'FreeSpace',
  canvas_widths: 'Breakpoint canvas sizes',
  desktop: `Desktop (≥ ${BREAKPOINT_SPECS.desktop.minWidth}px)`,
  laptop: `Laptop (≥ ${BREAKPOINT_SPECS.laptop.minWidth}px)`,
  tablet: `Tablet (≥ ${BREAKPOINT_SPECS.tablet.minWidth}px)`,
  phone: 'Phone',
  min_height: 'Minimum artboard height',
  grid: 'Snap grid (0 = off)',
  narrow: 'Phone without layout',
  canvas_width: 'Desktop canvas width (legacy)',
};

const HELPER_MAP: Record<string, string> = {
  canvas_widths:
    'Artboard design width per breakpoint (defaults: Desktop 1400, Laptop 1100, Tablet 768, Phone 390). On screen, FreeSpace fills the view at 1:1 like Sections — it does not stretch a small canvas to enlarge cards.',
  desktop: 'Default 1400. Cards use this layout on wide screens.',
  laptop: 'Default 1100.',
  tablet: 'Default 768.',
  phone: 'Default 390. If empty and “stack” is on, cards stack until you arrange a Phone layout.',
  min_height: 'Artboard grows with content; this is the floor (default 800).',
  grid: 'Snap step in artboard units while dragging and resizing.',
  narrow: 'When no Phone layout exists: stack cards for readability, or keep scaling the artboard.',
};

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
            default: 800,
            selector: numberSelector(200, 8000),
          },
          {
            name: 'grid',
            default: 8,
            selector: numberSelector(0, 64),
          },
          {
            name: 'narrow',
            default: 'stack',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'stack', label: 'Stack cards (recommended)' },
                  { value: 'scale', label: 'Keep scaled artboard' },
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
    if (schema?.name && LABEL_MAP[schema.name]) return LABEL_MAP[schema.name];
    return origLabel?.(schema) ?? schema?.name;
  };
  const origHelper = editor._computeHelper?.bind(editor);
  editor._computeHelper = (schema: { name?: string }) => {
    if (schema?.name && HELPER_MAP[schema.name]) return HELPER_MAP[schema.name];
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
