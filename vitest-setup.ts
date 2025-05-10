import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Import React types only for TypeScript, not for runtime
import type * as ReactTypes from 'react';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

// Super simple CSS module mock that returns the key as the value
const cssModuleMock = new Proxy(
  {},
  {
    get: (_, key) => {
      // Special module keys
      if (key === 'default' || key === '__esModule') return {};
      
      // Handle any dynamic key access by returning the key itself
      if (typeof key === 'string') {
        // Create a string that definitely has all string methods
        return String(key);
      }
      
      // Fallback for any other property type
      return '';
    }
  }
);

// Mock all CSS modules
vi.mock('*.module.css', () => cssModuleMock);
vi.mock('*.css', () => ({}));
vi.mock(/\.module\.css$/, () => cssModuleMock);

// Mock static asset imports
vi.mock(/\.(jpg|jpeg|png|gif|svg)$/, () => ({
  default: 'mock-image-path',
}));

// Add DOM polyfills for testing environment
beforeAll(() => {
  // Add React 18 useId polyfill for testing
  let idCounter = 0;
  
  // Create a proper useId implementation that returns a string with all string methods
  const safeUseId = () => {
    const id = `:r${idCounter++}:`;
    return String(id); // Ensure it's a proper string
  };
  
  // Get the React object directly from global or require it at runtime
  let ReactModule: any;
  try {
    // Try to get the actual React module (will be correctly resolved by Vite)
    ReactModule = global.React || require('react');
  } catch (e) {
    // If require fails or global React isn't available, create a mock React object
    console.warn('Could not import React directly, using mock implementation');
    ReactModule = { version: '18.0.0' };
    global.React = ReactModule;
  }
  
  // Patch useId on the React module
  if (!ReactModule.useId) {
    ReactModule.useId = safeUseId;
  }
  
  // Make sure global.React exists and has useId
  if (!global.React) {
    global.React = ReactModule;
  } else if (!global.React.useId) {
    global.React.useId = safeUseId;
  }

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock scrollTo
  global.scrollTo = vi.fn();
});

// Suppress React 18 console errors about useId in test environment
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && (
      args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: useLayoutEffect does nothing on the server') ||
      args[0].includes('Warning: React does not recognize the') ||
      args[0].includes('Warning: The current testing environment is not configured') ||
      args[0].includes("It looks like you're using the wrong act()") ||
      args[0].includes('Warning: useId() relies on React.useId()')
    )
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Create a custom version of replace that works on any value
const originalReplace = String.prototype.replace;
Object.defineProperty(String.prototype, 'replace', {
  value: function(...args) {
    try {
      // First try to use the original method
      return originalReplace.apply(this, args);
    } catch (e) {
      // If that fails, convert to string and try again
      console.warn(`String replace failed, converting value: "${this}" to string`);
      return originalReplace.apply(String(this), args);
    }
  },
  writable: true,
  configurable: true
});

// Make Symbol.toString return a proper string with string methods
const originalSymbolToString = Symbol.prototype.toString;
Object.defineProperty(Symbol.prototype, 'toString', {
  value: function() {
    return String(originalSymbolToString.call(this));
  },
  writable: true,
  configurable: true
});

// Try to ensure Proxy objects can be converted to strings
// Note: This may not work in all environments as Proxy.prototype is not accessible in some JS engines
try {
  Object.defineProperty(Proxy.prototype, 'toString', {
    value: function() {
      return '[object Proxy]';
    },
    writable: true,
    configurable: true
  });
} catch (e) {
  console.warn('Could not patch Proxy.prototype.toString, will use fallback mechanisms');
}
