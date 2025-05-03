/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest-setup.ts'],
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.turbo/**'],
    testTimeout: 10000,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/test/**',
        '**/*.d.ts',
        '**/*.test.*',
        '**/*.config.*',
      ],
    },
    alias: {
      '@dzb-cv': resolve(__dirname, './packages'),
      '@core': resolve(__dirname, './packages/core/src'),
      '@shared': resolve(__dirname, './packages/core/src/shared'),
      '@types': resolve(__dirname, './types')
    }
  },
});
