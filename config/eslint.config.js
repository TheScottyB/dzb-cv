import js from '@eslint/js';
import globals from 'globals';
import * as tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * DZB CV Monorepo ESLint Configuration
 *
 * This configuration uses ESLint flat config format to provide consistent
 * code quality rules across all packages in the monorepo.
 *
 * It's designed to work with TypeScript 5.8+ and includes MCP server integration
 * for AI-assisted linting.
 *
 * @see https://eslint.org/docs/latest/use/configure/configuration-files-new
 * @see https://typescript-eslint.io/
 * @see https://mcp.ai
 */

// Configuration for TypeScript projects
const tsconfigFiles = ['./tsconfig.json', './packages/*/tsconfig.json'];

// MCP server configuration
export const mcpConfig = {
  enabled: true,
  server: {
    command: 'eslint-mcp-server',
    args: ['--config', './mcp.config.js'],
  },
};

// Linter options configuration
const linterOptions = {
  reportUnusedDisableDirectives: true,
  noInlineConfig: false,
};

// ES module compatible dirname (replacement for CommonJS __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Files to ignore across all configurations
const ignores = [
  '**/dist/**',
  '**/node_modules/**',
  '**/coverage/**',
  '**/*.d.ts',
  '**/*.json',
  '**/*.md',
  '**/*.css',
  '**/build/**',
  '**/tsconfig.tsbuildinfo',
];

// Base TypeScript configuration
const baseTypescriptConfig = {
  files: ['**/*.{js,mjs,cjs,ts,tsx}'],
  ignores,
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },
    parser: tseslint.parser,
    parserOptions: {
      project: true,
      ecmaVersion: 2024,
      sourceType: 'module',
    },
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    import: importPlugin,
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    // Base JavaScript/TypeScript rules
    ...js.configs.recommended.rules,
    ...tseslint.configs.recommendedTypeChecked.rules,
    ...tseslint.configs.stylistic.rules,

    // TypeScript 5.8+ specific rules
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/no-unsafe-declaration-merging': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
    // Additional type checking rules for optional properties
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',

    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type',
        ],
        pathGroups: [
          {
            pattern: '@dzb-cv/**',
            group: 'internal',
            position: 'after',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',

    // General code quality rules
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-duplicate-imports': 'off', // Using import/no-duplicates instead
    'import/no-duplicates': 'error',
  },
};

// React configuration
const reactConfig = {
  files: ['**/*.{jsx,tsx}'],
  ignores,
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...reactPlugin.configs.recommended.rules,
    ...reactHooksPlugin.configs.recommended.rules,
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-curly-brace-presence': [
      'error',
      {
        props: 'never',
        children: 'never',
      },
    ],
    'react/jsx-no-bind': [
      'warn',
      {
        ignoreDOMComponents: true,
        ignoreRefs: true,
        allowArrowFunctions: true,
        allowFunctions: false,
        allowBind: false,
      },
    ],
    'react/jsx-pascal-case': 'error',
  },
};

// Test files configuration
const testConfig = {
  files: ['**/*.test.{ts,tsx,js,jsx}', '**/__tests__/**/*', '**/vitest.config.*'],
  languageOptions: {
    globals: {
      describe: 'readonly',
      it: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly',
      vi: 'readonly',
      jest: 'readonly',
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-console': 'off',
  },
};

// Declaration files - special handling
const declarationConfig = {
  files: ['**/*.d.ts'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: null,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/ban-types': 'off',
    'import/no-duplicates': 'off',
  },
};

// Add a configuration specifically for handling path alias imports
const pathAliasConfig = {
  files: ['**/*.{ts,tsx}'],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    import: importPlugin,
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: tsconfigFiles,
        alwaysTryTypes: true,
        extensions: ['.ts', '.tsx', '.d.ts'],
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'packages'],
        paths: [dirname(fileURLToPath(import.meta.url))],
      },
    },
    'import/internal-regex': '^@dzb-cv/',
  },
  rules: {
    'import/no-unresolved': 'error',
  },
};

// Special configuration for monorepo package imports
const monorepoPackageConfig = {
  files: ['**/packages/**/*.{ts,tsx}'],
  settings: {
    'import/resolver': {
      typescript: {
        project: tsconfigFiles,
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../../../*'],
            message: 'Deeply nested relative imports are forbidden. Use package imports instead.',
          },
        ],
      },
    ],
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './packages/**/*',
            from: '../src',
            message:
              'Direct imports from root src/ are forbidden. Import from the appropriate package.',
          },
        ],
      },
    ],
  },
};

// UI package specific rules
const uiPackageConfig = {
  files: ['packages/ui/**/*.{js,ts,jsx,tsx}'],
  ignores,
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    'react/jsx-no-bind': [
      'warn',
      {
        ignoreDOMComponents: true,
        ignoreRefs: true,
        allowArrowFunctions: true,
        allowFunctions: false,
      },
    ],
    'react/jsx-pascal-case': 'error',
  },
};

// Templates package specific rules
const templatesPackageConfig = {
  files: ['packages/templates/**/*.{js,ts,jsx,tsx}'],
  ignores,
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  rules: {
    'react/jsx-max-depth': ['warn', { max: 8 }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
};

// Prettier configuration
const prettierConfig = {
  files: ['**/*.{js,mjs,cjs,ts,tsx,jsx}'],
  ignores,
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    ...prettier.rules,
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
        tabWidth: 2,
        printWidth: 100,
        endOfLine: 'auto',
      },
    ],
  },
};

// Export the complete configuration
export default [
  { linterOptions },
  baseTypescriptConfig,
  reactConfig,
  testConfig,
  declarationConfig,
  pathAliasConfig,
  monorepoPackageConfig,
  uiPackageConfig,
  templatesPackageConfig,
  prettierConfig,
  // Disable unused-vars for all type files
  {
    files: ['packages/types/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
