import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import type { CVData, PDFGenerationOptions } from '@dzb-cv/types';

// Mock the PDF generator
vi.mock('@dzb-cv/pdf', async (importActual) => {
  const actual = await importActual<typeof import('@dzb-cv/pdf')>();
  const mockPDFGenerator = {
    generate: vi.fn().mockImplementation(async (data: CVData, options?: PDFGenerationOptions) => {
      const baseSize = 1000;
      let size = baseSize;
      if (options?.singlePage) {
        size = Math.floor(baseSize * 0.7);
      }
      return Buffer.alloc(size, 'mock-pdf-content');
    }),
  };
  return {
    ...actual,
    PDFGenerator: vi.fn().mockImplementation(() => mockPDFGenerator),
    createPDFGenerator: vi.fn().mockImplementation(() => mockPDFGenerator),
  };
});

// Mock CVService
vi.mock('@dzb-cv/core', async (importActual) => {
  const actual = await importActual<typeof import('@dzb-cv/core')>();
  return {
    ...actual,
    CVService: vi.fn().mockImplementation(() => ({
      createCV: vi.fn().mockResolvedValue({}),
      generatePDF: vi.fn().mockImplementation(async (data: CVData, options?: PDFGenerationOptions) => {
        const baseSize = 1000;
        let size = baseSize;
        if (options?.singlePage) size = Math.floor(baseSize * 0.7);
        return Buffer.alloc(size, 'mock-pdf-content');
      }),
    })),
  };
});

import { createCVCommand } from '../create.js';

type SpyInstance = ReturnType<typeof vi.spyOn>;

describe('CV CLI Integration - Simple Tests', () => {
  let program: Command;
  let mockConsoleLog: SpyInstance;
  let mockConsoleError: SpyInstance;
  let originalProcessExit: typeof process.exit;

  beforeEach(() => {
    program = new Command();
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    originalProcessExit = process.exit;
    process.exit = vi.fn() as unknown as typeof process.exit;
    createCVCommand(program);
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    process.exit = originalProcessExit;
    vi.clearAllMocks();
  });

  describe('Basic CLI Functionality', () => {
    it('should generate single-page PDF with correct flags', async () => {
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'John Doe',
        '--email',
        'john@example.com',
        '--single-page'
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for John Doe');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
    });

    it('should generate normal PDF by default', async () => {
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'Jane Smith',
        '--email',
        'jane@example.com'
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Jane Smith');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
    });

    it('should work with template option', async () => {
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'Bob Wilson',
        '--email',
        'bob@example.com',
        '--template',
        'minimal'
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Bob Wilson');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
    });

    it('should work with output option', async () => {
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'Alice Johnson',
        '--email',
        'alice@example.com',
        '--output',
        'custom-cv.pdf'
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Alice Johnson');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
    });
  });
});
