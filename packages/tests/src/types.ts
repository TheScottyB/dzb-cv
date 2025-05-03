import type { CVData, Experience, Education, Skill, Profile } from '@dzb-cv/types';

// Test Context Types
export interface TestContext {
  rootDir: string;
  tempDir: string;
  cleanup: () => void;
}

export interface PDFTestContext extends TestContext {
  outputPath: string;
  sampleData: CVData;
}

export interface ProfileTestContext extends TestContext {
  profile: Profile;
  backupPath: string;
}

// Factory Types
export type MockFactory<T> = (override?: Partial<T>) => T;
export type TestFactory<T> = (context: TestContext) => Promise<T>;

// Test Configuration
export interface TestConfig {
  verbose: boolean;
  outputDir: string;
  timeout: number;
  snapshotDir?: string;
  mockDataPath?: string;
}

// Test Result Types
export interface ValidationTestResult {
  valid: boolean;
  errors: string[];
  context?: Record<string, unknown>;
}

export interface PDFTestResult {
  buffer: Buffer;
  metadata: {
    pageCount: number;
    format: string;
    title?: string;
  };
}

// Test Utilities
export interface TestUtils {
  createTempDir(): Promise<string>;
  cleanupTempDir(dir: string): Promise<void>;
  loadFixture(name: string): Promise<any>;
  compareSnapshots(actual: any, expected: any): boolean;
}

// Mock Data Types
export interface MockData<T> {
  valid: T[];
  invalid: T[];
  partial: Partial<T>[];
}

export interface TestCase<T> {
  name: string;
  input: T;
  expected: any;
  shouldThrow?: boolean;
  context?: Record<string, unknown>;
}
