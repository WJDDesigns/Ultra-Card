import { describe, it, expect } from 'vitest';
import { normalizeModelKey, ucUnifiDeviceDb, type UnifiDbEntry } from './uc-unifi-device-db';

describe('normalizeModelKey', () => {
  it('uppercases and strips separators', () => {
    expect(normalizeModelKey('U7-Pro-Max')).toBe('U7PROMAX');
    expect(normalizeModelKey('u7promax')).toBe('U7PROMAX');
    expect(normalizeModelKey('USW Pro 24 PoE')).toBe('USWPRO24POE');
    expect(normalizeModelKey('')).toBe('');
    expect(normalizeModelKey(null)).toBe('');
  });
});

describe('ucUnifiDeviceDb.imageUrl', () => {
  const entry: UnifiDbEntry = {
    id: 'abc-123',
    name: 'Access Point U7 Pro Max',
    deviceType: 'access-point',
    sku: 'U7-Pro-Max',
    images: { default: 'ddd', nopadding: 'nnn' },
  };

  it('builds a proxied, resized URL for the requested image type', () => {
    const url = ucUnifiDeviceDb.imageUrl(entry, 'nopadding', 256);
    expect(url).toContain('images.svc.ui.com');
    expect(url).toContain('w=256');
    expect(url).toContain(encodeURIComponent('abc-123/nopadding/nnn.png'));
  });

  it('falls back to another image type with a matching path', () => {
    const url = ucUnifiDeviceDb.imageUrl(entry, 'topology', 128);
    expect(url).toContain(encodeURIComponent('abc-123/nopadding/nnn.png'));
  });

  it('returns null when no image exists', () => {
    const bare: UnifiDbEntry = { ...entry, images: {} };
    expect(ucUnifiDeviceDb.imageUrl(bare, 'default', 128)).toBeNull();
  });
});

describe('ucUnifiDeviceDb.lookup', () => {
  it('returns null before the catalog is loaded', () => {
    expect(ucUnifiDeviceDb.lookup('U7PROMAX')).toBeNull();
    expect(ucUnifiDeviceDb.lookup('')).toBeNull();
  });

  it('resolves shortnames, skus, and family+sysid registry codes', () => {
    ucUnifiDeviceDb.prime([
      {
        id: 'hd24',
        sku: 'USW-Pro-HD-24-PoE',
        deviceType: 'switch',
        shortnames: ['USPH24P'],
        sysids: ['ed72'],
        product: { name: 'Switch Pro HD 24 PoE' },
        images: { nopadding: 'hash1' },
      },
      {
        id: 'udmse',
        sku: 'UDM-SE',
        deviceType: 'console',
        shortnames: ['UDMPROSE', 'UDM SE'],
        product: { name: 'Dream Machine Special Edition' },
        images: { nopadding: 'hash2' },
      },
    ]);

    expect(ucUnifiDeviceDb.lookup('USPH24P')?.id).toBe('hd24');
    expect(ucUnifiDeviceDb.lookup('USW-Pro-HD-24-PoE')?.id).toBe('hd24');
    // HA reports "USW" + hex sysid for newer gear
    expect(ucUnifiDeviceDb.lookup('USWED72')?.id).toBe('hd24');
    // Non-hex tails must not hit the sysid index
    expect(ucUnifiDeviceDb.lookup('UDMPROSE')?.id).toBe('udmse');
    expect(ucUnifiDeviceDb.lookup('TOTALLY-UNKNOWN')).toBeNull();
  });
});
