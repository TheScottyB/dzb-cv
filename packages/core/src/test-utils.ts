import type { CVData } from '@dzb-cv/types';
import { vi } from 'vitest';

/**
 * A sample CV for core service tests.
 */
export const sampleCV: CVData = {
  personalInfo: {
    name: {
      first: 'Test',
      last: 'Name',
      full: 'Test Name',
    },
    contact: {
      email: 'test@example.com',
      phone: '123-456-7890',
    },
  },
  experience: [],
  education: [],
  skills: [],
};

/**
 * Factory for a mock storage object with save, load, and delete methods.
 */
export function createMockStorage() {
  return {
    save: vi.fn(),
    load: vi.fn(),
    delete: vi.fn(),
  };
}

/**
 * Factory for a mock PDF generator with a generate method.
 */
export function createMockPdfGenerator() {
  return {
    generate: vi.fn(),
  };
}
