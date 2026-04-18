/**
 * Parse a user-entered or HA state numeric string with locale-aware handling
 * (e.g. European "30,96" → 30.96, "1.234,56" → 1234.56).
 */
export function parseLocaleNumber(val: unknown): number {
  if (val === undefined || val === null) return NaN;
  if (typeof val === 'number') return val;
  let s = String(val).trim();
  if (s === '' || s === 'unknown' || s === 'unavailable') return NaN;
  if (s.includes(',')) {
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      s = s.substring(0, lastComma).replace(/[.,]/g, '') + '.' + s.substring(lastComma + 1);
    } else {
      s = s.replace(/,/g, '');
    }
  }
  return parseFloat(s);
}

/**
 * Parse a list of tick positions from the bar "custom ticks" field.
 * Prefer semicolon separators so comma can be a decimal separator ("30,5; 40; 50").
 * If there are no semicolons, split on commas (legacy "10, 20, 30" lists).
 */
export function parseCustomTickValues(raw: string): number[] {
  const trimmed = (raw || '').trim();
  if (!trimmed) return [];
  const parts = trimmed.includes(';')
    ? trimmed.split(';').map(p => p.trim()).filter(Boolean)
    : trimmed.split(',').map(p => p.trim()).filter(Boolean);
  return parts.map(p => parseLocaleNumber(p)).filter(v => !Number.isNaN(v));
}
