import './matchers';
import './types';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';

export const TEST_OUTPUT_DIR = join(process.cwd(), 'test-output');

// Define expect globally
declare global {
  // eslint-disable-next-line no-var
  var expect: typeof import('vitest').expect;
  // eslint-disable-next-line no-var
  var vi: typeof import('vitest').vi;
}

// Setup
beforeAll(async () => {
  await mkdir(TEST_OUTPUT_DIR, { recursive: true });
});

// Cleanup
afterAll(async () => {
  try {
    await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  } catch (error) {
    console.warn('Failed to clean up test directory:', error);
  }
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Test utilities
export const testUtils = {
  async createTestFile(filename: string, content: string) {
    const filePath = join(TEST_OUTPUT_DIR, filename);
    return { path: filePath, content };
  },
  
  async cleanupTestFiles() {
    await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
};

// Global test utilities
// @ts-ignore
globalThis.__testUtils = testUtils;

// Type declaration for global test utilities
declare global {
  // eslint-disable-next-line no-var
  var __testUtils: typeof testUtils;
}

