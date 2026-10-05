import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DIR = path.join(__dirname, '..');

function load(lang: string): Record<string, any> {
  return JSON.parse(fs.readFileSync(path.join(DIR, `${lang}.json`), 'utf8'));
}

describe('hover effect + native card translation keys', () => {
  it('ships English keys used by the actions and native card editors', () => {
    const en = load('en');
    expect(en.editor.hover_effects.animation_settings).toBe('Animation Settings');
    expect(en.editor.hover_effects.duration).toBe('Duration');
    expect(en.editor.hover_effects.timing).toBe('Timing Function');
    expect(en.editor.hover_effects.intensity).toBe('Intensity');
    expect(en.editor.native_card.settings_title).toBe('{name} Settings');
    expect(en.editor.native_card.settings_desc).toContain('built-in editor');
  });

  it('provides German translations for the previously English-only strings', () => {
    const de = load('de');
    expect(de.editor.hover_effects.animation_settings).toBe('Animationseinstellungen');
    expect(de.editor.hover_effects.duration).toBe('Dauer');
    expect(de.editor.hover_effects.timing).toBe('Zeitfunktion');
    expect(de.editor.hover_effects.intensity).toBe('Intensität');
    expect(de.editor.native_card.settings_title).toBe('{name}-Einstellungen');
    expect(de.editor.native_card.settings_desc).toContain('integrierten Editor');
  });
});
