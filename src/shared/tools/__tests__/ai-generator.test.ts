import { describe, it, expect, vi } from 'vitest';
import { generateAICV } from '../ai-generator';
import LLMServiceAgent from '../../../ats/agents/LLMServiceAgent';

const mockOptions = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  output: 'john-doe-cv.pdf',
  style: 'professional'
};

describe('AI Generate CV', () => {
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

