import type { MockInstance, InlineConfig, Assertion, ExpectMatcherContext } from 'vitest';

declare module 'vitest' {
  interface CustomMatchers<R = unknown> {
    toHaveLength(expected: number): R;
    toBeInstanceOf(expected: any): R;
    toBeGreaterThan(expected: number): R;
    toContainEqual(expected: any): R;
    toBeNull(): R;
    toMatch(expected: string | RegExp): R;
    toHaveBeenCalled(): R;
    toHaveBeenCalledTimes(times: number): R;
    not: CustomMatchers<R>;
  }

  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}

  interface ExpectMatcherContext {
    utils: {
      diff(a: unknown, b: unknown): string | null;
      stringify(value: unknown): string;
      equals(a: unknown, b: unknown): boolean;
    };
  }

  // Mock extensions
  interface Mock<T extends (...args: any[]) => any> extends MockInstance<T> {
    getMockName(): string;
    mock: {
      calls: Array<Parameters<T>>;
      results: Array<{ type: string; value: ReturnType<T> }>;
      instances: Array<T>;
      lastCall: Parameters<T>;
    };
    mockClear(): this;
    mockReset(): this;
    mockRestore(): void;
    mockImplementation(fn: T): this;
    mockImplementationOnce(fn: T): this;
    mockName(name: string): this;
    mockReturnThis(): this;
    mockReturnValue(value: ReturnType<T>): this;
    mockReturnValueOnce(value: ReturnType<T>): this;
    mockResolvedValue<U extends ReturnType<T>>(value: Awaited<U>): this;
    mockResolvedValueOnce<U extends ReturnType<T>>(value: Awaited<U>): this;
    mockRejectedValue(value: unknown): this;
    mockRejectedValueOnce(value: unknown): this;
  }
}

declare global {
  const expect: {
    <T = any>(actual: T): Assertion<T>;
    extend(matchers: Record<string, Function>): void;
  };
  const vi: {
    fn<T extends (...args: any[]) => any>(implementation?: T): Mock<T>;
    spyOn<T, K extends keyof T>(obj: T, method: K): Mock<T[K]>;
    mock(moduleName: string, factory?: () => any): void;
    clearAllMocks(): void;
    restoreAllMocks(): void;
    resetAllMocks(): void;
  };
}

