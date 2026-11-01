/**
 * Shared ordering for the Navigation module's top-level items (paths, stacks and the
 * media player icon). Used by both the editor list and the live navbar so the two
 * always agree.
 */

export const NAV_MEDIA_PLAYER_ID = '__media_player__';

/**
 * Applies a saved `nav_item_order` to items that are already in their default order.
 * Items named in the saved order come first, in that order. Items it doesn't name
 * (for example a path added after the order was saved) follow in their default order.
 * Ids in the saved order that no longer exist are ignored.
 */
export function applyNavItemOrder<T>(
  items: T[],
  getId: (item: T) => string,
  savedOrder: string[] | undefined
): T[] {
  if (!Array.isArray(savedOrder) || savedOrder.length === 0) return items;
  const rank = new Map<string, number>();
  savedOrder.forEach((id, idx) => {
    if (typeof id === 'string' && !rank.has(id)) rank.set(id, idx);
  });
  const listed: Array<{ item: T; rank: number }> = [];
  const rest: T[] = [];
  for (const item of items) {
    const r = rank.get(getId(item));
    if (r === undefined) rest.push(item);
    else listed.push({ item, rank: r });
  }
  listed.sort((a, b) => a.rank - b.rank);
  return [...listed.map(x => x.item), ...rest];
}
