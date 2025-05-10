import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react({
      // Add jsx runtime options for better compatibility
      jsxRuntime: "automatic",
      babel: {
        plugins: [
          // Add any babel plugins if needed
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      // Use more reliable resolution for React
      {
        find: /^react$/,
        replacement: resolve(__dirname, "./node_modules/react/index.js"),
      },
      {
        find: /^react-dom$/,
        replacement: resolve(__dirname, "./node_modules/react-dom/index.js"),
      },
      {
        find: "@dzb-cv/core",
        replacement: resolve(__dirname, "packages/core/src"),
      },
      {
        find: "@dzb-cv/cli",
        replacement: resolve(__dirname, "packages/cli/src"),
      },
      {
        find: "@dzb-cv/ui",
        replacement: resolve(__dirname, "packages/ui/src"),
      },
      {
        find: "@dzb-cv/pdf",
        replacement: resolve(__dirname, "packages/pdf/src"),
      },
      {
        find: "@dzb-cv/templates",
        replacement: resolve(__dirname, "packages/templates/src"),
      },
      {
        find: "@dzb-cv/types",
        replacement: resolve(__dirname, "packages/types/src"),
      },
      {
        find: "@dzb-cv/ats",
        replacement: resolve(__dirname, "packages/ats/src"),
      },
      {
        find: "@dzb-cv/config",
        replacement: resolve(__dirname, "packages/config/src"),
      },
    ],
    // Ensure proper module resolution
    dedupe: ["react", "react-dom"],
    // Add proper extensions for module resolution
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  test: {
    // Use jsdom as the default test environment for component testing
    environment: "jsdom",

    // Setup global test utilities and mocks
    setupFiles: ["./vitest-setup.ts"],

    // Include and exclude patterns
    include: ["packages/*/src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "e2e/**",
      "../e2e/**",
      "../../e2e/**",
      "**/*.spec.ts",
      "**/*.spec.js",
      "**/*.spec.tsx",
      "**/*.spec.jsx",
    ],

    // Configure coverage reporting
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "coverage/**",
        "**/*.d.ts",
        "**/index.ts",
        "**/test/**",
        "**/__tests__/**",
        "**/__mocks__/**",
        "**/*.test.*",
        "**/*.config.*",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // Set a longer timeout for certain tests
    testTimeout: 10000,

    // Configure mocks for CSS modules - use much simpler approach
    css: true, // Just enable CSS handling without complex configurations

    // Handle CSS and static assets - simplified approach
    server: {
      deps: {
        inline: [/\/.*\.css/, "@dzb-cv/ui"],
      },
    },

    // Global variables
    globals: true,

    // Add environment variables for testing
    environmentOptions: {
      jsdom: {
        // Add JSDOM-specific options here
      },
    },

    // Add dependencies configuration for node modules
    deps: {
      // Inline specific modules
      inline: [/\/.*\.css/, "@dzb-cv/ui", "react", "react-dom"],
    },
  },
});
