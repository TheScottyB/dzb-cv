import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.{test,spec}.{ts,tsx}"],
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
  },
});
