// types/vitest.d.ts
declare module 'vitest' {
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

  export const expect: <T>(actual: T) => {
    toBe: (expected: T) => void;
    toEqual: (expected: T) => void;
    toBeDefined: () => void;
    toBeUndefined: () => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toContain: (expected: any) => void;
    toThrow: (error?: any) => void;
    resolves: any;
    rejects: any;
  };

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

