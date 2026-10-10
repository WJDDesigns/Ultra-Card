/**
 * Shared inline-CSS helpers for module renderers.
 *
 * Twenty modules each carried a private copy of these, in nine variants: some
 * kept `prop: undefined` declarations, some only handled whole integers, and the
 * animated weather/clock copies turned "10pt" into "10ptpx". One implementation now.
 */

const NUMBER = /^-?\d+(?:\.\d+)?$/;
const NUMBER_LIST = /^(?:-?\d+(?:\.\d+)?\s+)+-?\d+(?:\.\d+)?$/;

/**
 * Add `px` to unitless numbers, including each number of a multi-value such as
 * "4 8" (padding shorthand). Anything with a unit or keyword is returned as is.
 */
export function addPixelUnit(value: string | number | undefined | null): string | undefined {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim();
  if (!str) return undefined;
  if (NUMBER.test(str)) return `${str}px`;
  if (NUMBER_LIST.test(str)) {
    return str
      .split(/\s+/)
      .map(part => (NUMBER.test(part) ? `${part}px` : part))
      .join(' ');
  }
  return str;
}

/**
 * `{ fontSize: '12px', '--uc-x': 'red' }` → `font-size: 12px; --uc-x: red`.
 * Empty values are dropped; custom properties keep their name unchanged.
 */
export function styleObjectToCss(styles: Record<string, unknown>): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      const prop = key.startsWith('--') ? key : key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
      return `${prop}: ${value}`;
    })
    .join('; ');
}
