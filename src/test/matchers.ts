import { expect } from 'vitest';
import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

// Define the structure of custom matchers
interface CustomMatchers<R = unknown> {
  toHaveLength(length: number): R;
  toBeInstanceOf(expected: any): R;
  toBeGreaterThan(expected: number): R;
  toContainEqual(expected: any): R;
  toBeNull(): R;
  toMatch(expected: string | RegExp): R;
  toHaveBeenCalled(): R;
  toHaveBeenCalledTimes(count: number): R;
  not: CustomMatchers<R>;
}

// Extend Vitest's Assertion interface
declare module 'vitest' {
  interface Assertion extends CustomMatchers {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// Add custom matchers
expect.extend({
  toHaveLength(received: any, expected: number) {
    if (received?.length === undefined) {
      return {
        pass: false,
        message: () => `expected ${received} to have a length property`,
      };
    }
    return {
      pass: received.length === expected,
      message: () => `expected ${received} to have length ${expected}`,
    };
  },
  toBeInstanceOf(received: any, expected: any) {
    return {
      pass: received instanceof expected,
      message: () => `expected ${received} to be instance of ${expected}`,
    };
  },
  toBeGreaterThan(received: number, expected: number) {
    return {
      pass: received > expected,
      message: () => `expected ${received} to be greater than ${expected}`,
    };
  },
  toContainEqual(received: any[], expected: any) {
    const pass = received.some(item => 
      JSON.stringify(item) === JSON.stringify(expected)
    );
    return {
      pass,
      message: () => `expected ${received} to contain ${expected}`,
    };
  },
  toBeNull(received: any) {
    return {
      pass: received === null,
      message: () => `expected ${received} to be null`,
    };
  },
  toMatch(received: string, expected: string | RegExp) {
    const pass = typeof expected === 'string' 
      ? received.includes(expected)
      : expected.test(received);
    return {
      pass,
      message: () => `expected ${received} to match ${expected}`,
    };
  },
  toHaveBeenCalled(received: any) {
    const pass = received?.mock?.calls?.length > 0;
    return {
      pass,
      message: () => `expected ${received} to have been called`,
    };
  },
  toHaveBeenCalledTimes(received: any, times: number) {
    const pass = received?.mock?.calls?.length === times;
    return {
      pass,
      message: () => `expected ${received} to have been called ${times} times`,
    };
  },
});

