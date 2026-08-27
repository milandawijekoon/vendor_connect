import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.js',
      '**/*.mjs',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Using the 'recommended' (not 'strict') type-checked ruleset for now —
      // 'strict' flagged ~45 pre-existing violations across apps/api (mostly
      // stylistic: NestJS's empty module classes, non-null assertions,
      // template-literal number formatting). Revisit and tighten later.
      ...tsPlugin.configs['recommended-type-checked'].rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      // NestJS modules are conventionally empty decorated classes — not a
      // real problem, just how the framework's DI wiring works.
      '@typescript-eslint/no-extraneous-class': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
