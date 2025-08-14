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
      'no-async-promise-executor': 'error',
      'array-callback-return': 'error',
      'no-empty-function': ['error', { allow: ['constructors'] }],
      'no-implied-eval': 'error',
      'no-var': 'error',
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            any: {
              message:
                "Avoid this type unless it's absolutely necessary. Use unknown or custom interface instead",
              fixWith: 'unknown',
            },

            String: {
              message: 'Use string instead',
              fixWith: 'string',
            },

            Function:
              "Avoid this type unless it's absolutely necessary. Create custom type instead.",
          },
        },
      ],
      'no-console': 'error',
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
    ],
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
  },
];
