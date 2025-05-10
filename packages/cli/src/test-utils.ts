import { vi } from 'vitest';

/**
 * Mocks the @dzb-cv/pdf and @dzb-cv/core modules for CLI command tests.
 * Call this at the top of your test files before importing the command under test.
 */
export function setupCLIMocks() {
  vi.mock('@dzb-cv/pdf', () => ({
    PDFGenerator: vi.fn().mockImplementation(() => ({
      generate: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
    })),
  }));

  vi.mock('@dzb-cv/core', () => ({
    CVService: vi.fn().mockImplementation(() => ({
      createCV: vi.fn().mockResolvedValue({}),
      generatePDF: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
    })),
  }));
}
