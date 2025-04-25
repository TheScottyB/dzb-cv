// eslint.config.js
import eslint from '@eslint/js';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Define project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define common globals
const customGlobals = {
  ...globals.node,
  ...globals.browser,
  console: 'readonly',
  process: 'readonly',
  module: 'readonly',
  document: 'readonly',
  window: 'readonly',
  URL: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  Blob: 'readonly',
  AbortController: 'readonly',
  __dirname: 'readonly',
  global: 'readonly',
  fetch: 'readonly'
};

// Create a minimal ESLint flat config
export default [
  // Ignore patterns for all files
  {
    ignores: ['node_modules/**', 'dist/**', '.tmp/**', 'coverage/**']
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // JavaScript files config
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: customGlobals
    },
    rules: {
      'no-useless-escape': 'off',
      'no-control-regex': 'warn',
      'no-undef': 'error',
      'prefer-const': 'warn'
    }
  },

  // TypeScript files config
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: (await import('@typescript-eslint/parser')).default,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: customGlobals
    },
    plugins: {
      '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin')).default
    },
    rules: {
      // Custom overrides
      'no-useless-escape': 'off',
      'no-control-regex': 'warn',
      'prefer-const': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true
      }]
    }
  },

  // Test files config - more permissive
  {
    files: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts', '**/*.spec.js'],
    languageOptions: {
      parser: (await import('@typescript-eslint/parser')).default,
      parserOptions: {
        project: './tsconfig.test.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: customGlobals
    },
    plugins: {
      '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin')).default
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },

  // Script files in the scripts directory
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: customGlobals
    },
    rules: {
      'no-undef': 'off'
    }
  }
];
