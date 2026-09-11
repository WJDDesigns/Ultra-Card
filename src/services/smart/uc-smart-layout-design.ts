import type { CardModule, LayoutConfig } from '../../types';

/**
 * Design pass for Smart-built layouts.
 *
 * The planner/AI decide *what* goes on the card; this decides how it breathes.
 * Nothing here overrides a value that is already set, so AI-supplied or cloud
 * designed presets keep their styling and only gain what they left out:
 *
 * - rows get the same margins the editor gives a hand-made row
 * - columns stretch their content
 * - sections (top-level modules) get spacing between them
 * - groups of small modules (icon/info rows, people rows, button rows) sit in a
 *   subtle rounded panel so they read as one block instead of loose parts
 * - big self-styled modules (weather, climate, media, camera, map...) are left alone
 */

const CONTAINER_TYPES = new Set(['horizontal', 'vertical']);

/** Small building-block modules that look better grouped in a panel. */
const COMPACT_TYPES = new Set([
  'icon',
  'info',
  'button',
  'bar',
  'gauge',
  'people',
  'light',
  'spinbox',
  'toggle',
  'dropdown',
  'slider_control',
  'text',
  'separator',
]);

/** Text-only modules act as headings; a lone one should not be boxed. */
const HEADING_TYPES = new Set(['text', 'markdown', 'separator']);

const SECTION_GAP = '12px';
const GROUP_PANEL = {
  padding_top: '12px',
  padding_bottom: '12px',
  padding_left: '14px',
  padding_right: '14px',
  border_radius: '14px',
  background_color: 'rgba(var(--rgb-primary-text-color), 0.05)',
};

type AnyModule = CardModule & Record<string, unknown> & { design?: Record<string, unknown> };

export function applySmartLayoutDesign(layout: LayoutConfig | null | undefined): void {
  if (!layout?.rows) return;

  for (const row of layout.rows) {
    const rowRecord = row as unknown as Record<string, unknown>;
    if (!isPlainObject(rowRecord.design)) {
      rowRecord.design = { margin_top: '8px', margin_bottom: '8px' };
    }
    for (const column of row.columns || []) {
      const columnRecord = column as unknown as Record<string, unknown>;
      if (columnRecord.vertical_alignment === undefined) columnRecord.vertical_alignment = 'stretch';
      if (columnRecord.horizontal_alignment === undefined) columnRecord.horizontal_alignment = 'stretch';
      decorateSections((column.modules || []) as AnyModule[]);
    }
  }
}

function decorateSections(modules: AnyModule[]): void {
  modules.forEach((module, index) => {
    if (!module || typeof module !== 'object') return;
    if (index > 0) ensureDesign(module, { margin_top: SECTION_GAP });
    decorateSection(module);
  });
}

function decorateSection(module: AnyModule): void {
  const children = Array.isArray(module.modules) ? (module.modules as AnyModule[]) : [];

  // A vertical stack of sections is the card body: space its sections, style each one.
  if (module.type === 'vertical' && children.length > 1 && children.some(isContainer)) {
    if (module.gap === undefined) {
      module.gap = 12;
      module.gap_unit = 'px';
    }
    children.forEach(child => decorateSection(child));
    return;
  }

  if (isContainer(module)) {
    if (children.length && children.every(isCompactTree)) {
      ensureDesign(module, GROUP_PANEL);
    }
    return;
  }

  if (COMPACT_TYPES.has(String(module.type)) && !HEADING_TYPES.has(String(module.type))) {
    ensureDesign(module, GROUP_PANEL);
  }
}

function isContainer(module: AnyModule): boolean {
  return CONTAINER_TYPES.has(String(module?.type));
}

function isCompactTree(module: AnyModule): boolean {
  if (!module || typeof module !== 'object') return false;
  if (isContainer(module)) {
    const children = Array.isArray(module.modules) ? (module.modules as AnyModule[]) : [];
    return children.length > 0 && children.every(isCompactTree);
  }
  return COMPACT_TYPES.has(String(module.type));
}

/** Fill design keys the module has not set. Never overrides existing values. */
function ensureDesign(module: AnyModule, values: Record<string, string>): void {
  const design = isPlainObject(module.design) ? module.design : {};
  for (const [key, value] of Object.entries(values)) {
    if (design[key] === undefined || design[key] === '') design[key] = value;
  }
  module.design = design;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
