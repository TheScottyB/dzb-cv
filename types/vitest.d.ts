/// <reference types="vitest/globals" />

declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T> {
    toHaveLength(length: number): void;
    toBeInstanceOf(constructor: Function): void;
    toBeGreaterThan(number: number): void;
    toContainEqual(item: unknown): void;
    toBeNull(): void;
    toHaveBeenCalled(): void;
    toHaveBeenCalledTimes(times: number): void;
    toMatch(pattern: RegExp | string): void;
    not: Assertion<T>;
  }

  export interface Suite {
    name: string;
    tests: Test[];
    suites: Suite[];
  }

  export interface Test {
    name: string;
    mode: 'test' | 'skip' | 'todo' | 'only';
    handler: () => void | Promise<void>;
  }

  export interface CustomMatchers<R = unknown> {
    toHaveLength(length: number): R;
    toBeInstanceOf(constructor: Function): R;
    toContainEqual(expected: unknown): R;
    toBeNull(): R;
    toMatch(pattern: RegExp | string): R;
  }

  export const describe: {
    (name: string, fn: () => void): void;
    skip: (name: string, fn: () => void) => void;
    only: (name: string, fn: () => void) => void;
    todo: (name: string) => void;
  };

  export const test: {
    (name: string, fn: () => void | Promise<void>): void;
    skip: (name: string, fn: () => void | Promise<void>) => void;
    only: (name: string, fn: () => void | Promise<void>) => void;
    todo: (name: string) => void;
  };

  export const it: typeof test;

  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const afterEach: (fn: () => void | Promise<void>) => void;
  export const beforeAll: (fn: () => void | Promise<void>) => void;
  export const afterAll: (fn: () => void | Promise<void>) => void;

  export const vi: {
    fn: () => any;
    spyOn: (obj: any, method: string) => any;
    mock: (moduleName: string) => any;
  };
}

declare module 'vitest/globals' {
  export * from 'vitest';
}
