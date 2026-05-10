import type { CardModule, LayoutConfig } from '../types';

function patchModuleRecursive(
  mod: CardModule,
  moduleId: string,
  updates: Partial<CardModule>
): { node: CardModule; changed: boolean } {
  if (mod.id === moduleId) {
    const updated = { ...mod };
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        delete (updated as Record<string, unknown>)[key];
      } else {
        (updated as Record<string, unknown>)[key] = value;
      }
    }
    return { node: updated as CardModule, changed: true };
  }

  let node: CardModule = mod;
  const m = node as unknown as Record<string, unknown>;
  let changed = false;

  if (Array.isArray(m.modules)) {
    const old = m.modules as CardModule[];
    const results = old.map(c => patchModuleRecursive(c, moduleId, updates));
    if (results.some((r, i) => r.changed || r.node !== old[i])) {
      node = { ...node, modules: results.map(r => r.node) } as CardModule;
      changed = true;
    }
  }

  const patchKeyedArray = (key: 'panels' | 'panes' | 'tabs' | 'sections') => {
    const cur = node as unknown as Record<string, unknown>;
    if (!Array.isArray(cur[key])) return;
    const arr = cur[key] as Array<{ modules?: CardModule[] }>;
    let any = false;
    const nextArr = arr.map(entry => {
      if (!Array.isArray(entry.modules)) return entry;
      const om = entry.modules;
      const pm = om.map(c => patchModuleRecursive(c, moduleId, updates));
      if (pm.some((r, i) => r.changed || r.node !== om[i])) {
        any = true;
        return { ...entry, modules: pm.map(r => r.node) };
      }
      return entry;
    });
    if (any) {
      node = { ...node, [key]: nextArr } as CardModule;
      changed = true;
    }
  };

  patchKeyedArray('panels');
  patchKeyedArray('panes');
  patchKeyedArray('tabs');
  patchKeyedArray('sections');

  return { node, changed };
}

/**
 * Deep-patch a module anywhere in the layout tree (including nested containers).
 */
export function patchModuleByIdInLayout(
  layout: LayoutConfig,
  moduleId: string,
  updates: Partial<CardModule>
): { layout: LayoutConfig; changed: boolean } {
  let anyChanged = false;
  const newRows = layout.rows.map(row => ({
    ...row,
    columns: row.columns.map(col => {
      const oldMods = col.modules || [];
      const results = oldMods.map(m => patchModuleRecursive(m, moduleId, updates));
      if (results.some((r, i) => r.changed || r.node !== oldMods[i])) {
        anyChanged = true;
        return { ...col, modules: results.map(r => r.node) };
      }
      return col;
    }),
  }));

  if (!anyChanged) {
    return { layout, changed: false };
  }

  return {
    layout: { ...layout, rows: newRows },
    changed: true,
  };
}
