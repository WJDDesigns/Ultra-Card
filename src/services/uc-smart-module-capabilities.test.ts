// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { CORE_MANIFESTS } from '../modules/module-manifest-data';
import {
  getSmartModuleCatalogLines,
  getSmartModuleKeywordLines,
  inferEntityDomainsFromPrompt,
  suggestSmartModuleTypesForPrompt,
} from './uc-smart-module-capabilities';
import { getManifestTypesMissingRegistry } from './smart/module-specs';
import './uc-smart-module-sanitizer';

describe('uc-smart-module-capabilities', () => {
  it('includes keyword metadata in Smart module catalog lines', () => {
    const lines = getSmartModuleCatalogLines('free');
    const gaugeLine = lines.find(line => line.includes('- gauge ('));
    expect(gaugeLine).toContain('Keywords:');
    expect(gaugeLine).toContain('fuel');
  });

  it('exposes library-wide keyword hints including non-composable modules', () => {
    const lines = getSmartModuleKeywordLines('pro');
    const navigationLine = lines.find(line => line.startsWith('- navigation '));
    expect(navigationLine).toContain('library-only');
    expect(navigationLine).toContain('navbar');
  });

  it('suggests module types from prompt intent keywords', () => {
    const suggestions = suggestSmartModuleTypesForPrompt(
      'weather on top, lights side by side, and a fuel gauge below',
      'free',
      { includeLibraryOnly: false, max: 8 }
    );

    expect(suggestions).toEqual(expect.arrayContaining(['horizontal', 'light', 'gauge']));
  });

  it('suggests bar module from explicit bar prompts', () => {
    const suggestions = suggestSmartModuleTypesForPrompt('show a bar for fuel left in my car', 'free', {
      includeLibraryOnly: false,
      max: 6,
    });
    expect(suggestions[0]).toBe('bar');
  });

  it('infers sensor domain from gauge/fuel prompts', () => {
    const domains = inferEntityDomainsFromPrompt('show a car fuel gauge');
    expect(domains).toEqual(expect.arrayContaining(['sensor']));
  });

  it('requires manifest tags for AI keyword onboarding', () => {
    const missingTags = CORE_MANIFESTS.filter(manifest => !manifest.tags || manifest.tags.length < 2).map(
      manifest => manifest.type
    );
    expect(missingTags).toEqual([]);
  });

  it('requires a registry entry for every manifest module', () => {
    expect(getManifestTypesMissingRegistry()).toEqual([]);
  });
});
