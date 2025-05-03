import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@dzb-cv/cli': resolve(__dirname, './src'),
      '@dzb-cv/core': resolve(__dirname, '../core/src'),
    },
  },
});

