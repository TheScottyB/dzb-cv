import { beforeAll, afterAll } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';

// Setup global test utilities
export const TEST_OUTPUT_DIR = join(process.cwd(), 'test-output');

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

// Add global test utilities
export const testUtils = {
  async createTestFile(filename: string, content: string) {
    const filePath = join(TEST_OUTPUT_DIR, filename);
    await mkdir(TEST_OUTPUT_DIR, { recursive: true });
    return { path: filePath, content };
  },
  
  async cleanupTestFiles() {
    await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
};

// Make test utilities available globally
// @ts-ignore - extending globalThis
globalThis.__testUtils = testUtils;

// Type declaration for global test utilities
declare global {
  // eslint-disable-next-line no-var
  var __testUtils: typeof testUtils;
}

