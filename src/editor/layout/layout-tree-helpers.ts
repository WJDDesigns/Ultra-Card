/** Shared pure helpers for layout tree editing. */

export const LAYOUT_MODULE_TYPES = [
  'horizontal',
  'vertical',
  'stack',
  'accordion',
  'popup',
  'slider',
  'tabs',
] as const;

export function isLayoutModuleType(moduleType: string | undefined | null): boolean {
  if (!moduleType) return false;
  return (LAYOUT_MODULE_TYPES as readonly string[]).includes(moduleType);
}

export function reorderArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return arr;
  const copy = [...arr];
  const [moved] = copy.splice(fromIndex, 1);
  const adjustedTo = fromIndex < toIndex ? toIndex - 1 : toIndex;
  copy.splice(adjustedTo, 0, moved);
  return copy;
}

/** Resolve a nested modules[] array from a path: [row, col, module, ...child indices]. */
export function resolveModuleList(layout: any, path: number[]): any[] | null {
  if (!path || path.length < 3) return null;
  let current: any = layout.rows[path[0]]?.columns[path[1]]?.modules[path[2]];
  for (let i = 3; i < path.length; i++) {
    if (!current?.modules) return null;
    current = current.modules[path[i]];
  }
  return current?.modules ?? null;
}

export interface ColumnLayoutDef {
  id: string;
  name: string;
  proportions: number[];
  columnCount: number;
}

/** Minimal column layout catalog used by move/column ops (default layout per count). */
export const COLUMN_LAYOUTS: ColumnLayoutDef[] = [
  { id: '1-col', name: '1', proportions: [1], columnCount: 1 },
  { id: '1-2-1-2', name: '1/2 + 1/2', proportions: [1, 1], columnCount: 2 },
  { id: '1-3-2-3', name: '1/3 + 2/3', proportions: [1, 2], columnCount: 2 },
  { id: '2-3-1-3', name: '2/3 + 1/3', proportions: [2, 1], columnCount: 2 },
  { id: '2-5-3-5', name: '2/5 + 3/5', proportions: [2, 3], columnCount: 2 },
  { id: '3-5-2-5', name: '3/5 + 2/5', proportions: [3, 2], columnCount: 2 },
  { id: '1-3-1-3-1-3', name: '1/3 + 1/3 + 1/3', proportions: [1, 1, 1], columnCount: 3 },
  { id: '1-4-1-2-1-4', name: '1/4 + 1/2 + 1/4', proportions: [1, 2, 1], columnCount: 3 },
  { id: '1-5-3-5-1-5', name: '1/5 + 3/5 + 1/5', proportions: [1, 3, 1], columnCount: 3 },
  { id: '1-6-2-3-1-6', name: '1/6 + 2/3 + 1/6', proportions: [1, 4, 1], columnCount: 3 },
  {
    id: '1-4-1-4-1-4-1-4',
    name: '1/4 + 1/4 + 1/4 + 1/4',
    proportions: [1, 1, 1, 1],
    columnCount: 4,
  },
  {
    id: '1-5-1-5-1-5-1-5',
    name: '1/5 + 1/5 + 1/5 + 1/5',
    proportions: [1, 1, 1, 1],
    columnCount: 4,
  },
  {
    id: '1-6-1-6-1-6-1-6',
    name: '1/6 + 1/6 + 1/6 + 1/6',
    proportions: [1, 1, 1, 1],
    columnCount: 4,
  },
  {
    id: '1-8-1-4-1-4-1-8',
    name: '1/8 + 1/4 + 1/4 + 1/8',
    proportions: [1, 2, 2, 1],
    columnCount: 4,
  },
  {
    id: '1-5-1-5-1-5-1-5-1-5',
    name: '1/5 + 1/5 + 1/5 + 1/5 + 1/5',
    proportions: [1, 1, 1, 1, 1],
    columnCount: 5,
  },
  {
    id: '1-6-1-6-1-3-1-6-1-6',
    name: '1/6 + 1/6 + 1/3 + 1/6 + 1/6',
    proportions: [1, 1, 2, 1, 1],
    columnCount: 5,
  },
  {
    id: '1-8-1-4-1-4-1-4-1-8',
    name: '1/8 + 1/4 + 1/4 + 1/4 + 1/8',
    proportions: [1, 2, 2, 2, 1],
    columnCount: 5,
  },
  {
    id: '1-6-1-6-1-6-1-6-1-6-1-6',
    name: '1/6 + 1/6 + 1/6 + 1/6 + 1/6 + 1/6',
    proportions: [1, 1, 1, 1, 1, 1],
    columnCount: 6,
  },
];

export function getLayoutsForColumnCount(columnCount: number): ColumnLayoutDef[] {
  const maxColumns = Math.min(columnCount, 6);
  return COLUMN_LAYOUTS.filter(layout => layout.columnCount === maxColumns);
}

export function isValidLayoutDrop(sourceType: string, targetType: string): boolean {
  const validCombinations: Record<string, string[]> = {
    module: [
      'module',
      'column',
      'layout',
      'nested-layout',
      'layout-child',
      'nested-child-target',
      'deep-nested-child-target',
      'path-child-target',
    ],
    'nested-child': [
      'module',
      'column',
      'layout',
      'nested-layout',
      'layout-child',
      'nested-child-target',
      'deep-nested-child-target',
      'path-child-target',
    ],
    'layout-child': [
      'module',
      'column',
      'layout',
      'nested-layout',
      'layout-child',
      'nested-child-target',
      'deep-nested-child-target',
      'path-child-target',
    ],
    'deep-nested-child': [
      'module',
      'column',
      'layout',
      'nested-layout',
      'layout-child',
      'nested-child-target',
      'deep-nested-child-target',
      'path-child-target',
    ],
    'path-child': [
      'module',
      'column',
      'layout',
      'nested-layout',
      'layout-child',
      'nested-child-target',
      'deep-nested-child-target',
      'path-child-target',
    ],
    'tabs-section-child': [
      'module',
      'column',
      'layout',
      'nested-layout',
      'layout-child',
      'nested-child-target',
      'deep-nested-child-target',
      'path-child-target',
    ],
    column: ['column', 'row'],
    row: ['row'],
  };

  return validCombinations[sourceType]?.includes(targetType) || false;
}
