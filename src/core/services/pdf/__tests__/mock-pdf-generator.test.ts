import { describe, it, expect } from 'vitest';
import { MockPDFGenerator } from '../mock-pdf-generator.js';
import type { CVData } from '../../../types/cv-base.js';
import type { PDFOptions } from '../../../types/cv-generation.js';

describe('MockPDFGenerator', () => {
  const generator = new MockPDFGenerator();

  const testData: CVData = {
    personalInfo: {
      name: { full: 'Test User' },
      contact: {
        email: 'test@example.com',
        phone: '123-456-7890',
      },
    },
    experience: [
      {
        title: 'Software Engineer',
        company: 'Tech Co',
        startDate: '2020-01',
        endDate: '2023-01',
        responsibilities: ['Development', 'Testing'],
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

  it('should generate a PDF buffer from CV data', async () => {
    const options: PDFOptions = {
      includeHeaderFooter: true,
      paperSize: 'Letter',
    };

    const result = await generator.generate(testData, options);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString()).toContain('Test User');
    expect(result.toString()).toContain('Software Engineer at Tech Co');
  });

  it('should include all required sections', async () => {
    const result = await generator.generate(testData);
    const content = result.toString();

    expect(content).toContain('Experience:');
    expect(content).toContain('Education:');
    expect(content).toContain('Skills:');
    expect(content).toContain('Certifications:');
  });

  it('should handle missing end date in experience', async () => {
    const dataWithCurrentJob: CVData = {
      ...testData,
      experience: [
        {
          title: 'Current Job',
          company: 'Current Co',
          startDate: '2023-01',
          responsibilities: ['Current work'],
        },
      ],
    };

    const result = await generator.generate(dataWithCurrentJob);
    expect(result.toString()).toContain('Current Job at Current Co (2023-01 - Present)');
  });

  it('should generate consistent format regardless of options', async () => {
    const result1 = await generator.generate(testData);
    const result2 = await generator.generate(testData, {
      includeHeaderFooter: false,
    });

    expect(result1.toString()).toBe(result2.toString());
  });
});
