module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    // Relax some rules for alpha release
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn', // Change from error to warning
    'no-console': 'warn', // Allow console for debugging in alpha
    'no-case-declarations': 'off', // Disable this rule temporarily
    'no-self-assign': 'error', // Keep this as it's a real bug
    'no-useless-escape': 'warn', // Change to warning

    // TypeScript specific
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // General code quality
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: 'error',
  },
  ignorePatterns: ['dist/', 'node_modules/', '--help/', '*.js'],
};
