import { expect } from 'vitest';

// Add custom matchers
expect.extend({
  toHaveLength(received: any, length: number) {
    const pass = received.length === length;
    return {
      pass,
      message: () => `expected ${received} to ${pass ? 'not ' : ''}have length ${length}`,
    };
  },
  toBeInstanceOf(received: any, expected: any) {
    const pass = received instanceof expected;
    return {
      pass,
      message: () => `expected ${received} to ${pass ? 'not ' : ''}be instance of ${expected}`,
    };
  },
  toBeGreaterThan(received: number, expected: number) {
    const pass = received > expected;
    return {
      pass,
      message: () => `expected ${received} to ${pass ? 'not ' : ''}be greater than ${expected}`,
    };
  },
  toContainEqual(received: any[], expected: any) {
    const pass = received.some((item) => JSON.stringify(item) === JSON.stringify(expected));
    return {
      pass,
      message: () => `expected ${received} to ${pass ? 'not ' : ''}contain equal ${expected}`,
    };
  },
  toBeNull(received: any) {
    const pass = received === null;
    return {
      pass,
      message: () => `expected ${received} to ${pass ? 'not ' : ''}be null`,
    };
  },
  toMatch(received: string, expected: string | RegExp) {
    const pass =
      typeof expected === 'string' ? received.includes(expected) : expected.test(received);
    return {
      pass,
      message: () => `expected ${received} to ${pass ? 'not ' : ''}match ${expected}`,
    };
  },
  toHaveBeenCalled(received: any) {
    const pass = received.mock.calls.length > 0;
    return {
      pass,
      message: () => `expected ${received} to ${pass ? 'not ' : ''}have been called`,
    };
  },
  toHaveBeenCalledTimes(received: any, count: number) {
    const pass = received.mock.calls.length === count;
    return {
      pass,
      message: () => `expected ${received} to ${pass ? 'not ' : ''}have been called ${count} times`,
    };
  },
});
