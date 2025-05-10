import { beforeAll, afterAll, expect, afterEach } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { cleanup } from '@testing-library/react';
import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

// Setup global test utilities
export const TEST_OUTPUT_DIR = join(process.cwd(), 'test-output');

// Define custom matchers interface
interface CustomMatchers<R = unknown> {
  toHaveLength(length: number): R;
  toBeInstanceOf(expected: any): R;
  toBeGreaterThan(expected: number): R;
  toContainEqual(expected: any): R;
  toBeNull(): R;
  toMatch(expected: string | RegExp): R;
  toHaveBeenCalled(): R;
  toHaveBeenCalledTimes(count: number): R;
}

// Extend Vitest's expect
declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

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

// Global setup
export async function setup() {
  // Create test output directory if it doesn't exist
  await mkdir(TEST_OUTPUT_DIR, { recursive: true });
}

// Global teardown
export async function teardown() {
  // Clean up test output directory
  try {
    await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  } catch (error) {
    console.warn('Failed to clean up test directory:', error);
  }
}

// Register cleanup
beforeAll(setup);
afterAll(teardown);
afterEach(() => {
  cleanup();
});

// Add global test utilities
export const testUtils = {
  async createTestFile(filename: string, content: string) {
    const filePath = join(TEST_OUTPUT_DIR, filename);
    await mkdir(TEST_OUTPUT_DIR, { recursive: true });
    return { path: filePath, content };
  },

  async cleanupTestFiles() {
    await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  },
};

// Make test utilities available globally
// @ts-ignore - extending globalThis
globalThis.__testUtils = testUtils;

// Type declaration for global test utilities
declare global {
  // eslint-disable-next-line no-var
  var __testUtils: typeof testUtils;
}
