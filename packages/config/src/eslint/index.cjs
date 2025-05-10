module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier', // Add prettier last to override conflicting rules
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'import/order': ['error', { 'newlines-between': 'always' }],
    '@typescript-eslint/explicit-function-return-type': 'error',
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './packages/**/*', // Apply this rule to files within any package
            from: '../src', // Forbid imports resolving to the top-level src
            message:
              "Direct imports from the root 'src/' directory are forbidden. Import from the appropriate package instead.",
          },
        ],
      },
    ],
  },
};
