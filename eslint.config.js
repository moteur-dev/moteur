import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // Base JS config
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'vitest.config.js',
      'src/tests/**',
      'html/**'
    ],
  },

  // TypeScript-specific config
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        console: true,
        process: true,
        require: true,
        module: true,
        Buffer: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // TypeScript
      'no-unused-vars': 'off', // Let @typescript-eslint handle it
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'warn', // helps with API boundaries

      // Prettier
      'prettier/prettier': [
        'error',
        {
          tabWidth: 4,
          endOfLine: 'auto', // Ensures consistent line endings across OSes
          semi: true,       // Add semicolons
          singleQuote: true // Use single quotes
        }
      ]
    },
  },
];
