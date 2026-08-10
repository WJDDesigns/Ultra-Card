import { describe, it, expect } from 'vitest';
import { configValidationService } from './config-validation-service';

/**
 * H2: setConfig only threw for a falsy config. Real validation ran inside a
 * promise, and the throw in that .then() was swallowed by a .catch() that logged
 * a warning — so a malformed config produced a half-rendered card instead of the
 * config error HA shows when setConfig throws synchronously.
 *
 * The gate has to stay narrow. It reports shapes that are wrong, never values
 * that are merely absent, because validateAndCorrectConfig fills those in and
 * that auto-correction is worth keeping.
 */
describe('validateConfigStructure', () => {
  const check = (config: unknown): string[] =>
    configValidationService.validateConfigStructure(config);

  describe('rejects what cannot be rendered', () => {
    it('rejects a non-object config', () => {
      expect(check(null)).toEqual(['Configuration must be an object']);
      expect(check('nope')).toEqual(['Configuration must be an object']);
      expect(check([])).toEqual(['Configuration must be an object']);
    });

    it('rejects a foreign card type', () => {
      expect(check({ type: 'custom:other-card' })).toEqual([
        'Invalid card type: custom:other-card',
      ]);
    });

    it('rejects a non-string card type', () => {
      expect(check({ type: 42 })).toEqual(['Card type must be a string']);
    });

    it('rejects a layout that is not an object', () => {
      expect(check({ type: 'custom:ultra-card', layout: [] })).toEqual([
        'Layout must be an object',
      ]);
    });

    it('rejects rows that are not an array', () => {
      expect(check({ type: 'custom:ultra-card', layout: { rows: {} } })).toEqual([
        'Layout rows must be an array',
      ]);
    });

    it('rejects a row that is not an object', () => {
      expect(check({ type: 'custom:ultra-card', layout: { rows: ['broken'] } })).toEqual([
        'Row 1 must be an object',
      ]);
    });

    it('rejects columns that are not an array', () => {
      expect(check({ type: 'custom:ultra-card', layout: { rows: [{ columns: 'x' }] } })).toEqual([
        'Row 1: columns must be an array',
      ]);
    });

    it('rejects modules that are not an array', () => {
      const errors = check({
        type: 'custom:ultra-card',
        layout: { rows: [{ columns: [{ modules: 'x' }] }] },
      });
      expect(errors).toEqual(['Row 1, column 1: modules must be an array']);
    });

    it('rejects a module that is not an object', () => {
      const errors = check({
        type: 'custom:ultra-card',
        layout: { rows: [{ columns: [{ modules: ['text'] }] }] },
      });
      expect(errors).toEqual(['Row 1, column 1: every module must be an object']);
    });

    it('reports the position of a problem in a later row', () => {
      const errors = check({
        type: 'custom:ultra-card',
        layout: { rows: [{ columns: [] }, { columns: [] }, { columns: 'x' }] },
      });
      expect(errors).toEqual(['Row 3: columns must be an array']);
    });

    it('finds a broken module nested inside a layout module', () => {
      const errors = check({
        type: 'custom:ultra-card',
        layout: {
          rows: [
            {
              columns: [{ modules: [{ type: 'horizontal', modules: [{ type: 7 }] }] }],
            },
          ],
        },
      });
      expect(errors).toEqual(['Row 1, column 1: module type must be a string']);
    });

    it('caps how many problems it reports', () => {
      const rows = Array.from({ length: 50 }, () => 'broken');
      expect(check({ type: 'custom:ultra-card', layout: { rows } })).toHaveLength(10);
    });
  });

  describe('leaves auto-correctable configs alone', () => {
    it('accepts a config with nothing but a type', () => {
      expect(check({ type: 'custom:ultra-card' })).toEqual([]);
    });

    it('accepts a missing type, which the async pass fills in', () => {
      expect(check({ layout: { rows: [] } })).toEqual([]);
    });

    it('accepts a missing rows array', () => {
      expect(check({ type: 'custom:ultra-card', layout: {} })).toEqual([]);
    });

    it('accepts a module with no type yet', () => {
      const config = {
        type: 'custom:ultra-card',
        layout: { rows: [{ columns: [{ modules: [{ id: 'm1' }] }] }] },
      };
      expect(check(config)).toEqual([]);
    });

    it('accepts an unknown module type, which may be a third-party module', () => {
      const config = {
        type: 'custom:ultra-card',
        layout: { rows: [{ columns: [{ modules: [{ id: 'm1', type: 'not-registered' }] }] }] },
      };
      expect(check(config)).toEqual([]);
    });

    it('accepts a realistic nested layout', () => {
      const config = {
        type: 'custom:ultra-card',
        card_background: '#fff',
        layout: {
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'col-1',
                  modules: [
                    { id: 'm1', type: 'text', text: 'hello' },
                    {
                      id: 'm2',
                      type: 'horizontal',
                      modules: [
                        { id: 'm3', type: 'icon' },
                        { id: 'm4', type: 'bar' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };
      expect(check(config)).toEqual([]);
    });

    it('does not recurse without bound on a deeply nested config', () => {
      let modules: unknown = [{ id: 'leaf', type: 'text' }];
      for (let i = 0; i < 200; i++) {
        modules = [{ id: `l${i}`, type: 'horizontal', modules }];
      }
      const config = {
        type: 'custom:ultra-card',
        layout: { rows: [{ columns: [{ modules }] }] },
      };
      expect(() => check(config)).not.toThrow();
    });
  });
});
