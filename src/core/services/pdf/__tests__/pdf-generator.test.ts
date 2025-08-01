import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultPDFGenerator } from '../pdf-generator.js';
import type { CVData } from '../../../types/cv-base.js';
import type { CVGenerationOptions } from '../../../types/cv-generation.js';

// Mock puppeteer to avoid actual browser launch in tests
vi.mock('puppeteer', () => {
  const pdfMock = vi.fn().mockResolvedValue(Buffer.from('PDF content'));
  const setContentMock = vi.fn().mockResolvedValue(undefined);
  const evaluateMock = vi.fn().mockResolvedValue({
    scrollHeight: 800,
    clientHeight: 600,
    scrollWidth: 600
  });
  const addStyleTagMock = vi.fn().mockResolvedValue(undefined);

  return {
    default: {
      launch: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          setContent: setContentMock,
          pdf: pdfMock,
          evaluate: evaluateMock,
          addStyleTag: addStyleTagMock,
        }),
        close: vi.fn().mockResolvedValue(undefined),
      }),
    },
  };
});

describe('PDFGenerator', () => {
  let generator: DefaultPDFGenerator;
  let testData: CVData;

  beforeEach(() => {
    generator = new DefaultPDFGenerator();
    testData = {
      personalInfo: {
        name: { full: 'Test User' },
        contact: {
          email: 'test@example.com',
          phone: '123-456-7890',
        },
      },
      experience: [
        {
          title: 'Developer',
          company: 'Tech Co',
          startDate: '2020-01',
          endDate: '2023-01',
          responsibilities: ['Coding', 'Testing'],
        },
      ],
      education: [
        {
          degree: 'BS Computer Science',
          institution: 'Test University',
          year: '2020',
        },
      ],
      skills: ['JavaScript', 'TypeScript'],
      certifications: ['AWS Certified'],
    };
  });

  describe('generate', () => {
    it('should generate PDF with default template', async () => {
      const options = {
        includeHeaderFooter: false,
        paperSize: 'Letter',
      };

      const result = await generator.generate(testData, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should generate PDF with minimal template', async () => {
      const options = {
        template: 'minimal',
        includeHeaderFooter: false,
        paperSize: 'Letter',
      };

      const result = await generator.generate(testData, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should generate single-page PDF when requested', async () => {
      const options = {
        singlePage: true,
        paperSize: 'Letter',
        scale: 0.9,
      };

      const result = await generator.generate(testData, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle missing optional fields', async () => {
      const minimalData: CVData = {
        personalInfo: {
          name: { full: 'Minimal User' },
          contact: {
            email: 'minimal@example.com',
            phone: '555-1234',
          },
        },
        experience: [],
        education: [],
        skills: [],
        certifications: [],
      };

      const result = await generator.generate(minimalData);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  it('should throw error for invalid template', async () => {
    const options = {
      template: 'non-existent',
    };

    await expect(generator.generate(testData, options)).rejects.toThrow(
      "Template 'non-existent' not found"
    );
  });
});
