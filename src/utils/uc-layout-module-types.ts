import type { CardModule, LayoutConfig } from '../types';

/**
 * Visit every module in a layout tree, including nested containers
 * (horizontal, tabs.sections, accordion panels, popup, panes, etc.).
 */
export function forEachLayoutModule(
  layout: LayoutConfig | undefined | null,
  visitor: (module: CardModule) => void
): void {
  const visit = (modules: CardModule[] | undefined) => {
    if (!modules) return;
    for (const mod of modules) {
      if (!mod || typeof mod !== 'object') continue;
      visitor(mod);
      forEachNestedChildModules(mod, visit);
    }
  };

  if (!layout?.rows) return;
  for (const row of layout.rows) {
    for (const col of row.columns || []) {
      visit(col.modules || []);
    }
  }
}

/**
 * Collect every `module.type` in a layout, including nested containers
 * (horizontal, tabs, accordion, popup, dynamic-list, etc.) — same traversal
 * as clock unregister / other nested walks.
 */
export function collectModuleTypesFromLayout(layout: LayoutConfig | undefined | null): Set<string> {
  const types = new Set<string>();
  forEachLayoutModule(layout, mod => {
    if (mod?.type) types.add(mod.type);
  });
  return types;
}

/**
 * Recurse into a single module's nested child containers (not including the module itself).
 * Used by host-card entity/runtime walks that already process the current module.
 */
export function forEachNestedChildModules(
  module: CardModule | Record<string, unknown> | null | undefined,
  visit: (modules: CardModule[]) => void
): void {
  if (!module || typeof module !== 'object') return;
  const m = module as Record<string, unknown>;
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
