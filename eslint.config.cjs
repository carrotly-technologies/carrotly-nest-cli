const prettier = require('eslint-plugin-prettier');
const tseslint = require('typescript-eslint');
const unusedImports = require('eslint-plugin-unused-imports');
const eslint = require('@eslint/js');
const { fixupPluginRules } = require('@eslint/compat');

module.exports = [
  ...tseslint.config({
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        node: true,
        jest: true,
      },
    },
    plugins: {
      prettier,
      'unused-imports': fixupPluginRules(unusedImports),
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      'no-async-promise-executor': 'error',
      'array-callback-return': 'error',
      'no-empty-function': ['error', { allow: ['constructors'] }],
      'no-implied-eval': 'error',
      'no-var': 'error',
      'no-console': 'off', // Allow console for CLI
      'no-useless-escape': 'warn',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-return-await': 'off',

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: 'src/.*',
            },
          ],
        },
      ],

      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  }),
  {
    ignores: [
      '.yalc',
      '**/*.cjs',
      '**/*.js',
      '**/*.jsx',
      'build/**/**',
      '**/generated/**',
      'dist/**/**',
      'fakers/**',
      'pypi-package/**',
      // Template files contain Handlebars syntax that conflicts with TypeScript parsing
      'templates/**',
      '**/*.hbs',
      // Build outputs and dependencies
      'node_modules/**',
      // Test outputs
      'coverage/**',
    ],
  },
  {
    files: ['src/**/*.ts'],
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      // Allow test files to import from src
      'no-restricted-imports': 'off',
    },
  },
];
