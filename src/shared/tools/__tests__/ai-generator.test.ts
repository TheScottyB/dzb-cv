import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { generateAICV } from '../ai-generator';
import LLMServiceAgent from '../../../ats/agents/LLMServiceAgent';

// Each test writes its PDF into a throwaway temp directory instead of cwd,
// so runs never leave generated files in the repo root.
let tmpDir: string;
let mockOptions: { name: string; email: string; output: string; style: string };

describe('AI Generate CV', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dzb-cv-ai-generator-test-'));
    mockOptions = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      output: path.join(tmpDir, 'john-doe-cv.pdf'),
      style: 'professional',
    };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should successfully generate an AI-optimized CV and save as PDF', async () => {
    const result = await generateAICV(mockOptions);
    expect(result.success).toBe(true);
    expect(result.filePath).toContain('john-doe-cv.pdf');
    // Additional verification could be added here
  });

  it('should handle empty email gracefully', async () => {
    const invalidOptions = { ...mockOptions, email: '' }; // Missing critical info
    const result = await generateAICV(invalidOptions);
    // The AI generator is designed to be resilient and should still succeed
    // but potentially with placeholder email data
    expect(result.success).toBe(true);
    expect(result.filePath).toBeDefined();
  });

  it('should handle AI processing timeout', async () => {
    vi.useFakeTimers();

    const slowOptions = { ...mockOptions, name: 'slow' };

    const timeoutError = new Error('Test timed out');
    vi.spyOn(global, 'setTimeout').mockImplementationOnce((_fn, delay) => {
      const err = delay === 30000 ? timeoutError : new Error('Unexpected timeout');
      throw err;
    });
    const slowPromise = generateAICV(slowOptions).catch(err => err === timeoutError);

    vi.advanceTimersByTime(30000); // Simulate timeout

    await expect(slowPromise).resolves.toHaveProperty('success', false);

    vi.useRealTimers();
  });

  it('should call shutdown after processing', async () => {
    const shutdownSpy = vi.spyOn(LLMServiceAgent.prototype, 'shutdown');

    await generateAICV(mockOptions);

    expect(shutdownSpy).toHaveBeenCalled();
  });
});

