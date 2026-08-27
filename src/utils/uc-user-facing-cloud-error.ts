/**
 * User-facing cloud errors must stay generic. Host, CDN, WAF, and remediation
 * details belong in our logs — never in Hub copy, login failures, or downloads.
 */

export const CLOUD_UNAVAILABLE_MESSAGE =
  "Can't reach Ultra Card cloud right now. Please try again in a few minutes.";

const INTERNAL_CLOUD_ERROR_MARKERS = [
  'siteground',
  'anti-bot',
  'sg-captcha',
  'sgcaptcha',
  'bot-protection',
  'bot protection',
  'javascript challenge',
  'exempt /wp-json',
  '/wp-json/',
  'robot challenge',
];

export function isInternalCloudError(raw: string): boolean {
  const lower = raw.toLowerCase();
  return INTERNAL_CLOUD_ERROR_MARKERS.some(marker => lower.includes(marker));
}

export function userFacingCloudError(
  raw: unknown,
  fallback = CLOUD_UNAVAILABLE_MESSAGE
): string {
  if (typeof raw !== 'string' || !raw.trim()) return fallback;
  if (isInternalCloudError(raw)) return CLOUD_UNAVAILABLE_MESSAGE;
  return raw.trim();
}

export function redactCloudErrorTree<T>(value: T): T {
  if (typeof value === 'string') {
    return (isInternalCloudError(value) ? CLOUD_UNAVAILABLE_MESSAGE : value) as T;
  }
  if (Array.isArray(value)) {
    return value.map(item => redactCloudErrorTree(item)) as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = redactCloudErrorTree(nested);
    }
    return out as T;
  }
  return value;
}
