// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import pako from 'pako';
import { ucExportImportService } from './uc-export-import-service';
import type { UltraCardConfig } from '../types';

function decodeShortcode(shortcode: string): Record<string, unknown> {
  const body = shortcode.replace('[ultra_card]', '').replace('[/ultra_card]', '');
  const base64 = body.startsWith('C:') ? body.slice(2) : body;
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  const json = body.startsWith('C:') ? pako.inflate(bytes, { to: 'string' }) : binary;
  return JSON.parse(json) as Record<string, unknown>;
}

const configWithPersonalData = (): UltraCardConfig =>
  ({
    type: 'custom:ultra-card',
    favorite_colors: ['#ff0000'],
    layout: {
      rows: [
        {
          id: 'r1',
          columns: [
            {
              id: 'c1',
              modules: [
                { id: 'm1', type: 'text', entity: 'person.emily' },
                { id: 'm2', type: 'image', image: 'http://192.168.1.42/snapshot.jpg' },
              ],
            },
          ],
        },
      ],
    },
  }) as unknown as UltraCardConfig;

describe('generateCardShortcodeForSharing (C9)', () => {
  it('redacts personal data instead of only claiming to', () => {
    const { shortcode, redactions } = ucExportImportService.generateCardShortcodeForSharing(
      configWithPersonalData()
    );

    const decoded = decodeShortcode(shortcode);
    const asText = JSON.stringify(decoded);

    expect(asText).not.toContain('person.emily');
    expect(asText).not.toContain('192.168.1.42');
    expect(redactions.length).toBeGreaterThan(0);
  });

  it('reports privacyProtected honestly rather than hardcoding it', () => {
    const clean = {
      type: 'custom:ultra-card',
      layout: {
        rows: [{ id: 'r1', columns: [{ id: 'c1', modules: [{ id: 'm1', type: 'separator' }] }] }],
      },
    } as unknown as UltraCardConfig;

    const dirty = decodeShortcode(
      ucExportImportService.generateCardShortcodeForSharing(configWithPersonalData()).shortcode
    );
    const spotless = decodeShortcode(
      ucExportImportService.generateCardShortcodeForSharing(clean).shortcode
    );

    expect((dirty.metadata as { privacyProtected?: boolean }).privacyProtected).toBe(true);
    expect((spotless.metadata as { privacyProtected?: boolean }).privacyProtected).toBe(false);
  });

  it('still strips favourite colours from the shared payload', () => {
    const decoded = decodeShortcode(
      ucExportImportService.generateCardShortcodeForSharing(configWithPersonalData()).shortcode
    );
    expect(JSON.stringify(decoded)).not.toContain('favorite_colors');
  });

  it('keeps the original single-value entry point working', () => {
    const shortcode = ucExportImportService.generateCardShortcode(configWithPersonalData());
    expect(typeof shortcode).toBe('string');
    expect(shortcode.startsWith('[ultra_card]')).toBe(true);
    expect(JSON.stringify(decodeShortcode(shortcode))).not.toContain('person.emily');
  });

  it('groups redactions by description with counts', () => {
    const { redactions } = ucExportImportService.generateCardShortcodeForSharing(
      configWithPersonalData()
    );
    for (const item of redactions) {
      expect(typeof item.description).toBe('string');
      expect(item.count).toBeGreaterThan(0);
    }
  });
});
