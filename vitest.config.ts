import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    // Add specific alias configuration to match tsconfig
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@shared': resolve(__dirname, './src/shared'),
      '@types': resolve(__dirname, './src/core/types')
    },
    // Setup global test configuration
    setupFiles: ['./src/test/setup.ts']
  },
});

