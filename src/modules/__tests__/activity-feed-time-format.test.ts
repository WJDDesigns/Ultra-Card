import { describe, it, expect, beforeAll } from 'vitest';
import { getModuleRegistry } from '../module-registry';

describe('Activity Feed absolute time format', () => {
  let handler: any;
  const at = new Date(2026, 10, 8, 18, 51);
  const hassWith = (time_format?: string, language = 'en') =>
    ({ language, locale: { language, time_format } }) as any;

  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('activity_feed');
    handler = getModuleRegistry().getModule('activity_feed');
  });

  it('auto follows the HA profile 24h setting', () => {
    expect(handler._absoluteTime(at, { time_format: 'auto' }, hassWith('24'))).toBe('18:51');
  });

  it('auto follows the HA profile 12h setting', () => {
    expect(handler._absoluteTime(at, {}, hassWith('12'))).toMatch(/6:51\s?PM/);
  });

  it('auto with language uses the language default (German = 24h)', () => {
    expect(handler._absoluteTime(at, {}, hassWith('language', 'de'))).toBe('18:51');
  });

  it('explicit 24h wins over a 12h profile', () => {
    expect(handler._absoluteTime(at, { time_format: '24' }, hassWith('12'))).toBe('18:51');
  });

  it('explicit 12h wins over a 24h profile', () => {
    expect(handler._absoluteTime(at, { time_format: '12' }, hassWith('24'))).toMatch(/6:51\s?PM/);
  });
});
