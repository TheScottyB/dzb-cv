import { describe, it, expect } from 'vitest';
import { StandardPDFGenerator } from '../pdf-generator';
import type { CVData } from '@dzb-cv/types';
import { PDFDocument } from 'pdf-lib';

describe('StandardPDFGenerator', () => {
  const generator = new StandardPDFGenerator();

  const sampleCV: CVData = {
    personalInfo: {
      name: {
        first: 'John',
        last: 'Doe',
        full: 'John Doe'
      },
      contact: {
        email: 'john@example.com',
        phone: '123-456-7890'
      }
    },
    experience: [
      {
        position: 'Software Engineer',
        employer: 'Tech Corp',
        startDate: '2020-01',
        endDate: '2023-12',
        responsibilities: ['Development', 'Testing']
      }
    ],
    education: [
      {
        degree: 'BS Computer Science',
        institution: 'Test University',
        year: '2019'
      }
    ],
    skills: [
      {
        name: 'TypeScript',
        level: 'Expert'
      }
    ]
  };

  it('should generate a valid PDF buffer', async () => {
    const result = await generator.generate(sampleCV);
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);

    // Verify it's a valid PDF by trying to load it
    const pdfDoc = await PDFDocument.load(result);
    expect(pdfDoc.getPageCount()).toBeGreaterThan(0);
  });

  it('should generate PDF with correct page size', async () => {
    const result = await generator.generate(sampleCV, { pageSize: 'A4' });
    const pdfDoc = await PDFDocument.load(result);
    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();
    
    // A4 dimensions in points (72 points per inch)
    expect(Math.round(width)).toBe(595); // 210mm ≈ 595pt
    expect(Math.round(height)).toBe(842); // 297mm ≈ 842pt
  });

  it('should apply custom margins when specified', async () => {
    const margins = {
      top: 100,
      right: 80,
      bottom: 100,
      left: 80
    };

    const result = await generator.generate(sampleCV, { margins });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });
});
