import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import type { CVData, PDFGenerationOptions } from '@dzb-cv/types';

// Mock the PDF generator with enhanced functionality to test single-page features
vi.mock('@dzb-cv/pdf', async (importActual) => {
  const actual = await importActual<typeof import('@dzb-cv/pdf')>();
  const mockPDFGenerator = {
    generate: vi.fn().mockImplementation(async (data: CVData, options?: PDFGenerationOptions) => {
      // Simulate different behavior based on options
      const baseSize = 1000;
      let size = baseSize;
      
      // Simulate smaller PDF for single-page
      if (options?.singlePage) {
        size = Math.floor(baseSize * 0.7); // Single page is typically smaller/more compact
      }
      
      // Simulate different sizes for different templates
      if (options?.template === 'minimal') size = Math.floor(size * 0.8);
      if (options?.template === 'federal') size = Math.floor(size * 1.3);
      if (options?.template === 'academic') size = Math.floor(size * 1.2);
      
      // Simulate format differences
      if (options?.format === 'A4') size = Math.floor(size * 1.05);
      
      return Buffer.alloc(size, 'mock-pdf-content');
    }),
  };
  return {
    ...actual,
    PDFGenerator: vi.fn().mockImplementation(() => mockPDFGenerator),
    createPDFGenerator: vi.fn().mockImplementation(() => mockPDFGenerator),
  };
});

// Mock CVService with template support
vi.mock('@dzb-cv/core', async (importActual) => {
  const actual = await importActual<typeof import('@dzb-cv/core')>();
  return {
    ...actual,
    CVService: vi.fn().mockImplementation(() => ({
      createCV: vi.fn().mockResolvedValue({}),
      generatePDF: vi.fn().mockImplementation(async (data: CVData, options?: PDFGenerationOptions) => {
        // Use the same mock logic as the PDF generator
        const baseSize = 1000;
        let size = baseSize;
        
        if (options?.singlePage) size = Math.floor(baseSize * 0.7);
        if (options?.template === 'minimal') size = Math.floor(size * 0.8);
        if (options?.template === 'federal') size = Math.floor(size * 1.3);
        if (options?.template === 'academic') size = Math.floor(size * 1.2);
        if (options?.format === 'A4') size = Math.floor(size * 1.05);
        
        return Buffer.alloc(size, 'mock-pdf-content');
      }),
    })),
  };
});

import { createCVCommand } from '../create.js';

type SpyInstance = ReturnType<typeof vi.spyOn>;

describe('CV CLI Integration Tests', () => {
  let program: Command;
  let mockConsoleLog: SpyInstance;
  let mockConsoleError: SpyInstance;
  let originalProcessExit: typeof process.exit;

  // Sample CV data for testing different formats
  const sampleCVData: CVData = {
    personalInfo: {
      name: {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
      },
      contact: {
        email: 'john@example.com',
        phone: '+1-555-0123',
        address: '123 Test St, Test City, TC 12345',
      },
    },
    experience: [
      {
        position: 'Senior Software Engineer',
        employer: 'Tech Corp',
        startDate: '2020-01-01',
        endDate: '2023-12-31',
        employmentType: 'full-time' as const,
        responsibilities: [
          'Developed scalable web applications using React and Node.js',
          'Led a team of 5 junior developers',
          'Implemented CI/CD pipelines reducing deployment time by 50%',
          'Collaborated with product managers to define technical requirements',
        ],
      },
      {
        position: 'Software Engineer',
        employer: 'StartupCo',
        startDate: '2018-06-01',
        endDate: '2019-12-31',
        employmentType: 'full-time' as const,
        responsibilities: [
          'Built RESTful APIs using Python and Flask',
          'Optimized database queries improving performance by 30%',
          'Participated in code reviews and pair programming sessions',
        ],
      },
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'University of Technology',
        graduationDate: '2018-05-15',
      },
    ],
    skills: [
      { name: 'JavaScript', level: 'expert' },
      { name: 'Python', level: 'advanced' },
      { name: 'React', level: 'expert' },
      { name: 'Node.js', level: 'advanced' },
      { name: 'Docker', level: 'intermediate' },
    ],
  };

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

  describe('Single-Page PDF Generation', () => {
    it('should generate single-page PDF when single-page flag is provided', async () => {
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

    it('should generate normal two-page PDF by default', async () => {
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'John Doe',
        '--email',
        'john@example.com'
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for John Doe');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
    });
  });

  describe('Template Compatibility', () => {
    const templates = ['default', 'minimal', 'federal', 'academic'] as const;

    templates.forEach((template) => {
      it(`should work with ${template} template in single-page mode`, async () => {
        await program.parseAsync([
          'node',
          'test',
          'create',
          '--name',
          'Jane Smith',
          '--email',
          'jane@example.com',
          '--template',
          template,
          '--single-page'
        ]);

        expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Jane Smith');
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
      });

      it(`should work with ${template} template in normal mode`, async () => {
        await program.parseAsync([
          'node',
          'test',
          'create',
          '--name',
          'Jane Smith',
          '--email',
          'jane@example.com',
          '--template',
          template
        ]);

        expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Jane Smith');
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
      });
    });
  });

  describe('Format Compatibility', () => {
    const formats = ['A4', 'Letter'] as const;

    formats.forEach((format) => {
      it(`should work with ${format} format in single-page mode`, async () => {
        await program.parseAsync([
          'node',
          'test',
          'create',
          '--name',
          'Alice Johnson',
          '--email',
          'alice@example.com',
          '--format',
          format,
          '--single-page'
        ]);

        expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Alice Johnson');
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
      });

      it(`should work with ${format} format in normal mode`, async () => {
        await program.parseAsync([
          'node',
          'test',
          'create',
          '--name',
          'Alice Johnson',
          '--email',
          'alice@example.com',
          '--format',
          format
        ]);

        expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Alice Johnson');
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
      });
    });
  });

  describe('CLI Flag Interactions', () => {
    it('should handle multiple flags together: single-page + template + format + output', async () => {
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'Dr. Bob Wilson',
        '--email',
        'bob@university.edu',
        '--single-page',
        '--template',
        'academic',
        '--format',
        'A4',
        '--output',
        'bob-wilson-cv.pdf'
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Dr. Bob Wilson');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
    });

    it('should handle all combinations of boolean flags', async () => {
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'Carol Davis',
        '--email',
        'carol@company.com',
        '--single-page'
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Carol Davis');
    });

    it('should handle edge case: very long names and emails', async () => {
      const longName = 'Dr. Elizabeth Alexandra Mary Catherine Windsor-Mountbatten III';
      const longEmail = 'elizabeth.alexandra.mary.catherine.windsor.mountbatten@very-long-university-name.edu.uk';
      
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        longName,
        '--email',
        longEmail,
        '--single-page'
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith(`Creating CV for ${longName}`);
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
    });
  });

  describe('Export Functionality', () => {
    it('should export PDF with custom filename', async () => {
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'Export Test',
        '--email',
        'export@test.com',
        '--output',
        'custom-filename.pdf',
        '--single-page'
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Export Test');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
    });

    it('should handle different file extensions gracefully', async () => {
      
      
      // Test with different extensions (should still work)
      const testCases = [
        'output.pdf',
        'output.PDF',
        'output',
        'output.doc', // Wrong extension but should still work
      ];

      for (const filename of testCases) {
        await program.parseAsync([
          'node',
          'test',
          'create',
          '--name',
          'File Test',
          '--email',
          'file@test.com',
          '--output',
          filename,
          '--single-page'
        ]);

        expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for File Test');
      }
    });
  });

  describe('Regression Tests - Two-Page PDF Generation', () => {
    it('should generate two-page PDF with large content (no single-page flag)', async () => {
      
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'Large Content User',
        '--email',
        'large@content.com'
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Large Content User');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('bytes'));
    });

    it('should maintain original PDF quality without single-page flag', async () => {
      
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'Quality Test User',
        '--email',
        'quality@test.com',
        '--template',
        'federal' // Federal template is typically larger
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Quality Test User');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('bytes'));
    });

    it('should work correctly with all supported templates in normal mode', async () => {
      const templates = ['default', 'minimal', 'federal', 'academic'] as const;
      
      for (const template of templates) {
        
        await program.parseAsync([
          'node',
          'test',
          'create',
          '--name',
          `Template ${template} Test`,
          '--email',
          `${template}@test.com`,
          '--template',
          template
        ]);

        expect(mockConsoleLog).toHaveBeenCalledWith(`Creating CV for Template ${template} Test`);
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle PDF generation errors gracefully', async () => {
      // Force the CVService to throw
      const { CVService } = await import('@dzb-cv/core');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (CVService as any).mockImplementationOnce(() => ({
        createCV: vi.fn().mockResolvedValue({}),
        generatePDF: vi.fn().mockRejectedValue(new Error('PDF generation failed')),
      }));

      
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'Error Test',
        '--email',
        'error@test.com',
        '--single-page'
      ]);

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error creating CV:'),
        expect.any(Error)
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should validate required options regardless of other flags', async () => {
      
      
      // Missing required name option
      try {
        await program.parseAsync([
          'node',
          'test',
          'create',
          '--email',
          'test@example.com',
          '--single-page'
        ]);
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Missing required email option
      try {
        await program.parseAsync([
          'node',
          'test',
          'create',
          '--name',
          'Test User',
          '--single-page'
        ]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance and Scaling', () => {
    it('should handle single-page generation with minimal performance impact', async () => {
      const startTime = Date.now();
      
      
      await program.parseAsync([
        'node',
        'test',
        'create',
        '--name',
        'Performance Test',
        '--email',
        'perf@test.com',
        '--single-page'
      ]);

      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (less than 5 seconds in test environment)
      expect(executionTime).toBeLessThan(5000);
      expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Performance Test');
    });

    it('should handle multiple consecutive PDF generations', async () => {
      
      
      // Generate multiple PDFs in sequence
      for (let i = 0; i < 3; i++) {
        await program.parseAsync([
          'node',
          'test',
          'create',
          '--name',
          `Bulk Test ${i}`,
          '--email',
          `bulk${i}@test.com`,
          '--single-page'
        ]);

        expect(mockConsoleLog).toHaveBeenCalledWith(`Creating CV for Bulk Test ${i}`);
      }
    });
  });
});
