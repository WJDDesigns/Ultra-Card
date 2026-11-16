import { defineConfig } from 'vitest/config';
import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Same split as scripts/webpack/locale-part-loader.js, so tests see exactly
 * the runtime / editor parts the build ships (issue #281).
 */
const localePartPlugin = {
  name: 'uc-locale-part',
  enforce: 'pre' as const,
  load(id: string) {
    const m = id.match(/^(.*[\\/]translations[\\/][^\\/]+\.json)\?part=(runtime|editor)$/);
    if (!m) return null;
    const { pickPart } = require('./scripts/lib/locale-split.js');
    const dict = JSON.parse(fs.readFileSync(m[1], 'utf8'));
    return `export default ${JSON.stringify(pickPart(dict, m[2]))};`;
  },
};

export default defineConfig({
  plugins: [localePartPlugin],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/modules/_module-template.ts',
        'src/node_modules/**',
      ],
      thresholds: {
        // Baseline for extracted layout helpers (ratchet up as coverage grows).
        'src/editor/layout/layout-tree-helpers.ts': {
          lines: 50,
          functions: 50,
          statements: 50,
        },
        'src/editor/layout/layout-config-writer.ts': {
          lines: 70,
          functions: 70,
          statements: 70,
        },
        'src/editor/layout/layout-tree-keyboard-move.ts': {
          lines: 50,
          functions: 50,
          statements: 50,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
