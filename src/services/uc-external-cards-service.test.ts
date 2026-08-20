import { describe, expect, it, afterEach } from 'vitest';
import { isEntityRowType, ucExternalCardsService } from './uc-external-cards-service';

const setRegistry = (cards: Array<{ type: string; name?: string }>) => {
  (window as any).customCards = cards;
};

afterEach(() => {
  delete (window as any).customCards;
});

describe('isEntityRowType', () => {
  it('recognises rows by the -row suffix', () => {
    expect(isEntityRowType('multiple-entity-row')).toBe(true);
    expect(isEntityRowType('custom:template-entity-row')).toBe(true);
    expect(isEntityRowType('fold-entity-row')).toBe(true);
  });

  it('recognises rows that skip the suffix convention', () => {
    expect(isEntityRowType('battery-state-entity')).toBe(true);
  });

  it('leaves cards alone', () => {
    expect(isEntityRowType('mushroom-entity-card')).toBe(false);
    expect(isEntityRowType('mini-graph-card')).toBe(false);
    expect(isEntityRowType('')).toBe(false);
  });
});

describe('getAvailableCards', () => {
  it('hides entity rows, which cannot render outside an Entities card', () => {
    setRegistry([
      { type: 'multiple-entity-row', name: 'Multiple Entity Row' },
      { type: 'mini-graph-card', name: 'Mini Graph Card' },
    ]);

    expect(ucExternalCardsService.getAvailableCards().map(c => c.type)).toEqual([
      'mini-graph-card',
    ]);
  });

  it('still hides Ultra Card itself', () => {
    setRegistry([
      { type: 'ultra-card', name: 'Ultra Card' },
      { type: 'button-card', name: 'Button Card' },
    ]);

    expect(ucExternalCardsService.getAvailableCards().map(c => c.type)).toEqual(['button-card']);
  });
});
