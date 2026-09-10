/**
 * Small formatting helpers shared by the Hub panel tabs.
 */

/**
 * Human-friendly relative time ("Just now", "5m ago", "3h ago", or a short date).
 * Returns "Never" for empty input and "Unknown" if the value cannot be parsed.
 */
export function formatRelativeTime(value: Date | string | number | null | undefined): string {
  if (value == null || value === '') return 'Never';
  try {
    const d = value instanceof Date ? value : new Date(value);
    const ms = d.getTime();
    if (Number.isNaN(ms)) return 'Unknown';
    const diffMins = Math.floor((Date.now() - ms) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown';
  }
}

/** Short absolute date, e.g. "Sep 9, 2026". Empty string when not parseable. */
export function formatShortDate(value: Date | string | number | null | undefined): string {
  if (value == null || value === '') return '';
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}
