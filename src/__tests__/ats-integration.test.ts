import { createATSOptimizedPDF } from '../utils/ats/optimizer';
import { convertMarkdownToPdf } from '../utils/pdf-generator';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { PDFOptions } from '../types/cv-types';

describe('ATS Integration Tests', () => {
  const testOutputDir = join(process.cwd(), 'test-output');
  const sampleCV = `
★ Dawn's Amazing Profile ★
email@test.com | 123-456-7890
Chicago, IL

• Led team of 5 people
• Increased efficiency
  `;

  beforeAll(async () => {
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(testOutputDir, { recursive: true, force: true });
  });

  describe('PDF Generation with ATS Optimization', () => {
    test('generates ATS-optimized PDF', async () => {
      const outputPath = join(testOutputDir, 'ats-optimized.pdf');
      const options: PDFOptions = {
        paperSize: 'Letter',
        margins: { top: 1, right: 1, bottom: 1, left: 1 },
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        orientation: 'portrait'
      };

      const result = await createATSOptimizedPDF(sampleCV, outputPath, options);

      expect(result.pdfPath).toBe(outputPath);
      expect(result.analysis.score).toBeGreaterThan(0);
      expect(result.optimizations.length).toBeGreaterThan(0);

      const fileExists = await fs.access(outputPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });

    test('improves ATS score', async () => {
      const outputPath = join(testOutputDir, 'ats-score-test.pdf');
      const options: PDFOptions = {
        paperSize: 'Letter',
        margins: { top: 1, right: 1, bottom: 1, left: 1 },
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        orientation: 'portrait'
      };

      const result = await createATSOptimizedPDF(sampleCV, outputPath, options);
      
      // Original CV has special characters and formatting issues
      expect(result.analysis.score).toBeGreaterThan(50);
      expect(result.optimizations).toContain('Simplified special characters and formatting');
    });

    test('maintains content integrity', async () => {
      const outputPath = join(testOutputDir, 'content-integrity.pdf');
      const options: PDFOptions = {
        paperSize: 'Letter',
        margins: { top: 1, right: 1, bottom: 1, left: 1 },
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        orientation: 'portrait'
      };

      const result = await createATSOptimizedPDF(sampleCV, outputPath, options);

      // Key content should still be present after optimization
      expect(result.pdfPath).toContain('email@test.com');
      expect(result.pdfPath).toContain('Chicago, IL');
      expect(result.pdfPath).toContain('Led team of 5 people');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty content', async () => {
      const outputPath = join(testOutputDir, 'empty.pdf');
      const options: PDFOptions = {
        paperSize: 'Letter',
        margins: { top: 1, right: 1, bottom: 1, left: 1 },
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        orientation: 'portrait'
      };

      const result = await createATSOptimizedPDF('', outputPath, options);
      expect(result.analysis.score).toBe(100); // Empty content should not cause errors
    });

    test('handles extremely long content', async () => {
      const longContent = Array(1000).fill('Test content line').join('\n');
      const outputPath = join(testOutputDir, 'long.pdf');
      const options: PDFOptions = {
        paperSize: 'Letter',
        margins: { top: 1, right: 1, bottom: 1, left: 1 },
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        orientation: 'portrait'
      };

      const result = await createATSOptimizedPDF(longContent, outputPath, options);
      expect(result.analysis.score).toBeGreaterThanOrEqual(0);
      expect(result.analysis.score).toBeLessThanOrEqual(100);
    });
  });
});
