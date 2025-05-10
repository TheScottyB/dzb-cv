import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeEach } from 'vitest';

import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Extend expect matchers for Vitest
declare global {
  namespace Vi {
    interface JestAssertion<T = unknown> extends TestingLibraryMatchers<T, void> {}
  }
}

// Mock global objects and functions needed for tests
global.ResizeObserver = vi
  .fn<
    [],
    {
      observe: () => void;
      unobserve: () => void;
      disconnect: () => void;
    }
  >()
  .mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(
    (_query: string) =>
      ({
        matches: false,
        media: _query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList
  ),
});

// Automatically clean up after each test
afterEach(() => {
  cleanup();
});

// Reset mocks between tests
beforeEach(() => {
  vi.resetAllMocks();
});
