import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default {
  files: ['**/*.{js,mjs,cjs,ts,tsx}'],
  ignores: [
    '**/dist/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/*.d.ts',
    '**/*.json',
    '**/*.md',
    '**/*.css'
  ],
  plugins: {
    '@typescript-eslint': tseslint,
    import: importPlugin
  },
  languageOptions: {
    globals: {
      ...globals.browser
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true
    }
  },
  rules: {
    ...js.configs.recommended.rules,
    ...tseslint.configs.recommended.rules,
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }],
    ...prettier.rules
  }
};
