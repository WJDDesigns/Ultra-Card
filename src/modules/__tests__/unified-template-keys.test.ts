import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Backward-compatibility guard for the unified-template unknown-key warning.
 *
 * Each module editor declares a `*_TEMPLATE_KEYS` list used by
 * `renderTemplateKeyWarning` to flag template keys the module ignores. If a
 * module reads a `parsed.<key>` that is missing from its list, valid user
 * templates would show a false "unrecognized key" warning. This test statically
 * scans each module source and asserts every key read from a parsed unified
 * template result is declared in the module's key list.
 */

const MODULES_WITH_KEY_LISTS = [
  'info-module.ts',
  'icon-module.ts',
  'bar-module.ts',
  'gauge-module.ts',
  'graphs-module.ts',
  'spinbox-module.ts',
  'toggle-module.ts',
  'status-summary-module.ts',
  'qr-code-module.ts',
  'text-module.ts',
  'markdown-module.ts',
  'camera-module.ts',
  'dropdown-module.ts',
];

// Internal plumbing of UnifiedTemplateResult, not user-facing JSON keys.
// `content` is the plain-string fallback (guarded by `_isString` checks), so
// it is not required to be a valid JSON key for every module that touches it.
const IGNORED_KEYS = new Set(['_error', '_isString', 'content']);

function extractDeclaredKeys(source: string): Set<string> | null {
  const match = source.match(/const \w+_TEMPLATE_KEYS = \[([\s\S]*?)\] as const;/);
  if (!match) return null;
  const keys = new Set<string>();
  for (const m of match[1].matchAll(/'([a-z_]+)'/g)) {
    keys.add(m[1]);
  }
  return keys;
}

function extractReadKeys(source: string): Set<string> {
  const keys = new Set<string>();
  for (const m of source.matchAll(/\bparsed\.([a-zA-Z_][a-zA-Z0-9_]*)/g)) {
    if (!IGNORED_KEYS.has(m[1])) keys.add(m[1]);
  }
  return keys;
}

describe('unified template key lists cover all keys each module reads', () => {
  for (const file of MODULES_WITH_KEY_LISTS) {
    it(file, () => {
      const source = readFileSync(resolve(__dirname, '..', file), 'utf8');
      const declared = extractDeclaredKeys(source);
      expect(declared, `${file} must declare a *_TEMPLATE_KEYS list`).not.toBeNull();
      const read = extractReadKeys(source);
      for (const key of read) {
        expect(
          declared!.has(key),
          `${file} reads parsed.${key} but it is missing from its *_TEMPLATE_KEYS list — ` +
            'valid templates would show a false unknown-key warning'
        ).toBe(true);
      }
    });
  }
});
