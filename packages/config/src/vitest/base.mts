import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import type { PluginOption } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['@dzb-cv/testing/setup'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  plugins: [tsconfigPaths()] as PluginOption[],
});
