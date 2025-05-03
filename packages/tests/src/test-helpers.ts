import type { TestContext, TestCase, ValidationTestResult } from './types';
import { createTestContext } from './test-utils';
import { join } from 'path';
import { promises as fs } from 'fs';

export async function runTestCase<T>(
  testCase: TestCase<T>,
  testFn: (input: T, context?: Record<string, unknown>) => Promise<any>
): Promise<void> {
  if (testCase.shouldThrow) {
    await expect(testFn(testCase.input, testCase.context)).rejects.toThrow();
    return;
  }

  const result = await testFn(testCase.input, testCase.context);
  expect(result).toEqual(testCase.expected);
}

export async function withTestContext<T>(
  fn: (context: TestContext) => Promise<T>
): Promise<T> {
  const context = await createTestContext();
  try {
    return await fn(context);
  } finally {
    await context.cleanup();
  }
}

export function createValidationTest(validator: (input: any) => ValidationTestResult) {
  return async function runValidationTest(testCase: TestCase<any>) {
    const result = validator(testCase.input);
    
    if (testCase.shouldThrow) {
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    } else {
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    }
  };
}

export async function withTempFile(
  context: TestContext,
  fileName: string,
  content: string | Buffer
): Promise<string> {
  const filePath = join(context.tempDir, fileName);
  await fs.writeFile(filePath, content);
  return filePath;
}

