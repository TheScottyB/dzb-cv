import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Enhanced configuration with better TypeScript/JSX support
export default defineConfig({
  // Use the test-specific TypeScript configuration
  esbuild: {
    jsx: 'automatic',
    jsxInject: `import React from 'react'`,
    tsconfigRaw: `{
      "extends": "./tsconfig.test.json"
    }`,
  },

  plugins: [
    // React support with explicit configuration
    react({
      // Use React 18 JSX transform
      jsxRuntime: 'automatic',
      // Ensure .tsx files are handled
      include: '**/*.{jsx,tsx}',
      // Use Babel for JSX
      babel: {
        plugins: [],
      },
    }),
  ],

  css: {
    // Enable CSS modules processing
    modules: {
      // Return original classnames
      localsConvention: 'camelCaseOnly',
    },
  },

  test: {
    // Use jsdom for React component testing
    environment: 'jsdom',

    // Use minimal setup file (only testing-library)
    setupFiles: ['./vitest-setup.ts'],

    // Explicit test file patterns with proper extensions
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
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

    // Enable globals for expect
    globals: true,

    // Simply let Vite handle CSS
    css: true,

    // Basic test configuration
    testTimeout: 10000,
    passWithNoTests: true,

    // Let modules have proper resolution
    deps: {
      inline: [/\.css$/, /\.module\.css$/],
      // Let Vite handle modules
      optimizer: {
        web: {
          include: ['react', 'react-dom', '@testing-library/react', '@testing-library/jest-dom'],
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    // Explicitly list extensions to resolve
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
});
