import { describe, it, expect } from 'vitest';
import type { CVData } from '@dzb-cv/types';

import { PDFGenerator } from '../pdf-generator.js';

describe('PDFGenerator', () => {
  const generator = new PDFGenerator();

  const sampleCV: CVData = {
    personalInfo: {
      name: {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
      },
      contact: {
        email: 'john@example.com',
        phone: '123-456-7890',
      },
    },
    experience: [
      {
        position: 'Software Engineer',
        employer: 'Tech Corp',
        startDate: '2020-01',
        endDate: '2023-12',
        responsibilities: ['Development', 'Testing'],
        employmentType: 'full-time', // Add required field
      },
    ],
    education: [
      {
        institution: 'Test University',
        degree: 'BS Computer Science',
        field: 'Computer Science',
        graduationDate: '2019', // Changed from year to graduationDate
      },
    ],
    skills: [
      {
        name: 'TypeScript',
        level: 'expert', // Changed from Expert to expert
      },
    ],
  };

  it('generates PDF with default options', async () => {
    const result = await generator.generate(sampleCV);
    expect(result).toBeInstanceOf(Buffer);
  });

  it('generates PDF with A4 format', async () => {
    const result = await generator.generate(sampleCV, { format: 'A4' }); // Changed from pageSize to format
    expect(result).toBeInstanceOf(Buffer);
  });

  it('generates PDF with custom margins', async () => {
    const margin = {
      // Changed from margins to margin
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    };
    const result = await generator.generate(sampleCV, { margin }); // Changed from margins to margin
    expect(result).toBeInstanceOf(Buffer);
  });
});
