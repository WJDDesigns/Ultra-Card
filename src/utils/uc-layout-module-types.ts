import type { CardModule, LayoutConfig } from '../types';

/**
 * Collect every `module.type` in a layout, including nested containers
 * (horizontal, tabs, accordion, popup, dynamic-list, etc.) — same traversal
 * as clock unregister / other nested walks.
 */
export function collectModuleTypesFromLayout(layout: LayoutConfig | undefined | null): Set<string> {
  const types = new Set<string>();

  const visit = (modules: CardModule[] | undefined) => {
    if (!modules) return;
    for (const mod of modules) {
      if (mod?.type) types.add(mod.type);
      const m = mod as unknown as Record<string, unknown>;
      if (Array.isArray(m.modules)) visit(m.modules as CardModule[]);
      if (Array.isArray(m.panels)) {
        for (const panel of m.panels as Array<{ modules?: CardModule[] }>) {
          if (Array.isArray(panel?.modules)) visit(panel.modules);
        }
      }
      if (Array.isArray(m.panes)) {
        for (const pane of m.panes as Array<{ modules?: CardModule[] }>) {
          if (Array.isArray(pane?.modules)) visit(pane.modules);
        }
      }
      if (Array.isArray(m.tabs)) {
        for (const tab of m.tabs as Array<{ modules?: CardModule[] }>) {
          if (Array.isArray(tab?.modules)) visit(tab.modules);
        }
      }
      if (Array.isArray(m.sections)) {
        for (const sec of m.sections as Array<{ modules?: CardModule[] }>) {
          if (Array.isArray(sec?.modules)) visit(sec.modules);
        }
      }
    }
  };

  if (!layout?.rows) return types;
  for (const row of layout.rows) {
    for (const col of row.columns || []) {
      visit(col.modules || []);
    }
  }
  return types;
}
