import { describe, expect, it } from 'vitest';
import { applyNavItemOrder, NAV_MEDIA_PLAYER_ID } from '../uc-nav-item-order';

const ids = (items: Array<{ id: string }>) => items.map(i => i.id);

describe('applyNavItemOrder', () => {
  const items = [{ id: 'path1' }, { id: 'path2' }, { id: 'stack1' }, { id: NAV_MEDIA_PLAYER_ID }];

  it('keeps the default order when nothing is saved', () => {
    expect(ids(applyNavItemOrder(items, i => i.id, undefined))).toEqual(ids(items));
    expect(ids(applyNavItemOrder(items, i => i.id, []))).toEqual(ids(items));
  });

  it('puts a stack between paths', () => {
    const order = ['path1', 'stack1', 'path2', NAV_MEDIA_PLAYER_ID];
    expect(ids(applyNavItemOrder(items, i => i.id, order))).toEqual(order);
  });

  it('adds new items after the saved ones and ignores removed ids', () => {
    const withNew = [...items, { id: 'path3' }];
    const order = ['stack1', 'gone', 'path2', 'path1'];
    expect(ids(applyNavItemOrder(withNew, i => i.id, order))).toEqual([
      'stack1',
      'path2',
      'path1',
      NAV_MEDIA_PLAYER_ID,
      'path3',
    ]);
  });
});
