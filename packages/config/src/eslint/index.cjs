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
  },
};

