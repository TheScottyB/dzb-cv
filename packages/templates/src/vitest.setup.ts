import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeEach } from 'vitest';

import '@testing-library/jest-dom';

// Polyfill ResizeObserver for tests
class MockResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

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
