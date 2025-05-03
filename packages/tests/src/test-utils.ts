import { TestContext, TestUtils, MockData } from './types';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export const createTestContext = async (): Promise<TestContext> => {
  const rootDir = process.cwd();
  const tempDir = await createTempDir();
  
  return {
    rootDir,
    tempDir,
    cleanup: async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  };
};

export const createTempDir = async (): Promise<string> => {
  const prefix = 'dzb-cv-test-';
  const tempPath = join(tmpdir(), `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.mkdir(tempPath, { recursive: true });
  return tempPath;
};

export const loadFixture = async (name: string): Promise<any> => {
  const fixturePath = join(process.cwd(), 'src/test/fixtures', name);
  const content = await fs.readFile(fixturePath, 'utf-8');
  return JSON.parse(content);
};

export const compareSnapshots = (actual: any, expected: any): boolean => {
  return JSON.stringify(actual) === JSON.stringify(expected);
};

export const loadMockData = async <T>(type: string): Promise<MockData<T>> => {
  const data = await loadFixture(`${type}.json`);
  return {
    valid: data.valid || [],
    invalid: data.invalid || [],
    partial: data.partial || []
  };
};

export const validateTestResult = <T>(actual: T, expected: T): boolean => {
  if (actual === expected) return true;
  if (typeof actual !== typeof expected) return false;
  if (typeof actual !== 'object') return false;
  if (!actual || !expected) return false;

  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);

  if (actualKeys.length !== expectedKeys.length) return false;

  return actualKeys.every(key => validateTestResult(actual[key], expected[key]));
};
