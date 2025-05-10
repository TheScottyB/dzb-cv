import { defineConfig } from 'vitest/config';
import baseConfig from '@dzb-cv/config/vitest';

export default defineConfig({
  ...baseConfig,
  // Add any package-specific Vitest overrides here if necessary
  test: {
    environment: 'jsdom',
    setupFiles: ['../../vitest-setup.ts'],
    // Example override:
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'e2e/**',
      '../e2e/**',
      '../../e2e/**',
      '**/*.spec.ts',
      '**/*.spec.js',
      '**/*.spec.tsx',
      '**/*.spec.jsx',
    ],
  },
});
