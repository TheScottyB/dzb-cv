import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

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
  not: CustomMatchers<R>;
}

// Extend Vitest's expect
declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

import type { Assertion, AsymmetricMatchersContaining, MockInstance } from 'vitest';

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
  interface Assertion<T = any> extends CustomMatchers<T> {
    not: Assertion<T>;
  }
  interface AsymmetricMatchersContaining extends CustomMatchers {}

  // Extend MockInstance type
  interface MockInstance<T extends (...args: any[]) => any, Y extends any[] = any[]> {
    mockName(name: string): this;
    mockImplementation(fn: (...args: Parameters<T>) => ReturnType<T>): this;
    mockImplementationOnce(fn: (...args: Parameters<T>) => ReturnType<T>): this;
    mockReturnValue(val: ReturnType<T>): this;
    mockReturnValueOnce(val: ReturnType<T>): this;
    mockResolvedValue<U extends ReturnType<T>>(val: Awaited<U>): this;
    mockResolvedValueOnce<U extends ReturnType<T>>(val: Awaited<U>): this;
    mockRejectedValue(val: unknown): this;
    mockRejectedValueOnce(val: unknown): this;
  }

  // Add global types for test context
  interface TestContext {
    outputDir: string;
  }
}

// Define global test utilities
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    interface Assertion<T = any> extends CustomMatchers<T> {
      not: Assertion<T>;
    }
  }

  interface Window {
    __testUtils: {
      createTestFile(filename: string, content: string): Promise<{ path: string; content: string }>;
      cleanupTestFiles(): Promise<void>;
    };
  }
}

// Export common types used in tests
export type MockFn<T extends (...args: any[]) => any> = MockInstance<T>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
