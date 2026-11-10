import { afterEach, describe, expect, it, vi } from 'vitest';
import { openActionUrl, safeActionUrl } from './uc-safe-url';

describe('safeActionUrl', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    'https://example.com/a?b=c',
    'http://homeassistant.local:8123/lovelace',
    '/lovelace/kitchen',
    'lovelace/kitchen#pop-up',
    'tel:+15555550100',
    'mailto:someone@example.com',
    'spotify:track:123',
    'homeassistant://navigate/lovelace/0',
  ])('allows %s', url => {
    expect(safeActionUrl(url)).toBe(url);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    '  javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    '\u0001javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'blob:https://example.com/123',
    'file:///etc/passwd',
  ])('blocks %j', url => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(safeActionUrl(url)).toBeNull();
  });

  it.each([undefined, null, '', '   ', 42, {}])('rejects non-URL value %j', value => {
    expect(safeActionUrl(value)).toBeNull();
  });
});

describe('openActionUrl', () => {
  afterEach(() => vi.restoreAllMocks());

  it('opens allowed URLs in a new tab with noopener', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    expect(openActionUrl('https://example.com')).toBe(true);
    expect(open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener');
  });

  it('never calls the browser for a blocked URL', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    expect(openActionUrl('javascript:alert(1)')).toBe(false);
    expect(openActionUrl('javascript:alert(1)', '_self')).toBe(false);
    expect(open).not.toHaveBeenCalled();
  });
});
