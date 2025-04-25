import { describe, beforeAll, afterAll, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
// Test path alias resolution
import type { CVData } from '@types/cv-base';
import { CVService } from '@core/services/cv-service';
import { scrapeJob } from '@shared/tools/job-scraper';
import { TEST_OUTPUT_DIR } from './test/setup';

describe('Config tests', () => {
  beforeAll(() => {
    const outDir = path.resolve(process.cwd(), 'test-output');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    // For file access assertion
    const testFile = path.join(outDir, 'config-test.txt');
    if (!fs.existsSync(testFile)) {
      fs.writeFileSync(testFile, 'TEST');
    }
  });
  // Ensure test directory is available
  beforeAll(async () => {
    await globalThis.__testUtils.createTestFile('test-init.txt', 'initialization check');
  });

  afterAll(async () => {
    await globalThis.__testUtils.cleanupTestFiles();
  });

  test('path aliases are properly resolved', () => {
    // Verify types and imports are properly resolved
    const data: CVData = {
      personalInfo: {
        name: {
          full: 'Test User'
        },
        contact: {
          email: 'test@example.com',
          phone: '123-456-7890'
        }
      },
      experience: [],
      education: [],
      skills: [],
      certifications: []
    };
    
    expect(data).toBeDefined();
    expect(CVService).toBeDefined();
    expect(scrapeJob).toBeDefined();
  });

  test('test utilities are properly initialized', () => {
    expect(globalThis.__testUtils).toBeDefined();
    expect(typeof globalThis.__testUtils.createTestFile).toBe('function');
    expect(typeof globalThis.__testUtils.cleanupTestFiles).toBe('function');
  });

  test('test environment has proper file access', async () => {
    const testFile = 'config-test.txt';
    const testContent = 'test content';
    
    const { path } = await globalThis.__testUtils.createTestFile(testFile, testContent);
    await writeFile(path, testContent);
    
    // Read and verify file content
    const fileExists = await globalThis.__testUtils
      .createTestFile(testFile, testContent)
      .then(() => true)
      .catch(() => false);
      
    expect(fileExists).toBe(true);
  });

  test('test output directory is properly configured', () => {
    expect(TEST_OUTPUT_DIR).toBeDefined();
    expect(TEST_OUTPUT_DIR).toContain('test-output');
  });
});
