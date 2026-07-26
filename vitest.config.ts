import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
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
