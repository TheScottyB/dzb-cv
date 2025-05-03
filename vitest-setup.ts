// vitest-setup.ts
import { expect } from 'vitest';
import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

declare module 'vitest' {
  interface Assertion {
    toHaveLength(length: number): void;
    toBeInstanceOf(constructor: Function): void;
    toBeGreaterThan(number: number): void;
    toContainEqual(item: unknown): void;
    toBeNull(): void;
    toHaveBeenCalled(): void;
    toHaveBeenCalledTimes(times: number): void;
    toMatch(pattern: RegExp | string): void;
    not: Assertion;
  }
  
  interface AsymmetricMatchersContaining {
    toHaveLength(length: number): void;
    toBeInstanceOf(constructor: Function): void;
    toBeGreaterThan(number: number): void;
    toContainEqual(item: unknown): void;
    toBeNull(): void;
    toHaveBeenCalled(): void;
    toHaveBeenCalledTimes(times: number): void;
    toMatch(pattern: RegExp | string): void;
  }
}

// Add custom matchers
expect.extend({
  toHaveLength(received, expected) {
    const pass = received.length === expected;
    return {
      pass,
      message: () => `expected ${received} to have length ${expected}`,
    };
  },
  toBeInstanceOf(received, expected) {
    const pass = received instanceof expected;
    return {
      pass,
      message: () => `expected ${received} to be an instance of ${expected}`,
    };
  },
  toContainEqual(received, expected) {
    const pass = Array.isArray(received) && received.some(item => 
      JSON.stringify(item) === JSON.stringify(expected)
    );
    return {
      pass,
      message: () => `expected ${received} to contain equal ${expected}`,
    };
  }
});

