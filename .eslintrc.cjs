module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    // Add browser env for scripts that need browser globals
    browser: true
  },
  // Handle both JavaScript and TypeScript files
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  // Define globals that are used across the codebase
  globals: {
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
  },
  rules: {
    // Disable warnings for unnecessary escape characters in regular expressions
    'no-useless-escape': 'off',
    // Be more permissive about control characters in regular expressions
    'no-control-regex': 'warn',
    // TypeScript-specific rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }],
    // Node.js specific rules
    'no-undef': 'error',
    'prefer-const': 'warn'
  },
  // Different rules for different file patterns
  overrides: [
    {
      // Test files can use any as needed
      files: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts', '**/*.spec.js'],
      parserOptions: {
        project: './tsconfig.test.json'
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    },
    {
      // Script files in the scripts directory
      files: ['scripts/**/*.js'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'warn',
        'no-undef': 'off' // Since we've defined the common globals
      }
    }
  ]
};
