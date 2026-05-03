// Flat config for ESLint v9+/v10
// Migrated from .eslintrc.js when bumping eslint to v10.2.x.

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/node_modules/**',
      '--help/**',
      '**/*.js',
      '**/*.bak',
      '**/*.backup',
      'src/modules/_module-template.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2017,
        ...globals.node,
      },
    },
    rules: {
      // Relax some rules for alpha release (warnings keep CI/release signal without blocking Phase 3 gates)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'no-case-declarations': 'off',
      'no-prototype-builtins': 'warn',
      'no-empty': 'warn',
      eqeqeq: 'warn',
      'no-self-assign': 'error',
      'no-useless-escape': 'warn',

      // Rules introduced/promoted in eslint v9+/v10 and typescript-eslint v8 that
      // would otherwise fail CI under the existing relaxed policy. Keep them as
      // warnings so they surface in editors but don't block the release script.
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'warn',
      '@typescript-eslint/no-unused-expressions': [
        'warn',
        { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
      ],
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',

      // TypeScript specific
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // General code quality
      'prefer-const': 'error',
      'no-var': 'error',
    },
  }
);
