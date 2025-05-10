// Import testing library to extend Vitest's expect with DOM matchers
import "@testing-library/jest-dom/extend-expect";

// Import Vitest utilities
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Clean up after each test - this ensures tests don't interfere with each other
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

// No CSS module mocking needed - Vite will handle CSS modules natively
