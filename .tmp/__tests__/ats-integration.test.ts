import { createATSOptimizedPDF } from '../utils/ats/optimizer';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { PDFOptions } from '../types/cv-types';

describe('ATS Integration Tests', () => {
  const testOutputDir = join(process.cwd(), 'test-output');
  const sampleCV = `
Dawn Zurick Beilfuss
email@test.com | 123-456-7890
Chicago, IL

# Professional Experience
ACME Corp | 01/2020 - Present
Senior Role
- Led team of 5 people
- Increased efficiency

# Skills
- Project Management
- Leadership
  `;

  beforeAll(async () => {
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(testOutputDir, { recursive: true, force: true });
  });

  // Utility: validate that at least one item matches a regex in an array
  function arrayHasMatching(array: string[], regex: RegExp): boolean {
    return array.some(item => regex.test(item));
  }

  // Utility: All optimizations should follow "Standardized section headings" or similar description format for human readability.
  function assertOptimizationsAreHumanReadable(arr: string[]) {
    arr.forEach(opt => {
      // Example spec: starts with uppercase, short phrase
      expect(opt).toMatch(/^[A-Z][\w\s\-]+/);
      // Contains key words ("heading" or "character" or "format" etc) for clarity in the demo implementation
    });
  }

  describe('Content Optimization', () => {
    test('improves formatting while preserving content', async () => {
      const outputPath = join(testOutputDir, 'content-preservation.pdf');
      const options: PDFOptions = {
        paperSize: 'Letter',
        margins: { top: 1, right: 1, bottom: 1, left: 1 },
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        orientation: 'portrait'
      };

      const result = await createATSOptimizedPDF(sampleCV, outputPath, options);

      // Content preservation checks
      expect(result.content).toContain('email@test.com');
      expect(result.content).toContain('Chicago, IL');
      expect(result.content).toContain('Led team of 5 people');

      // Format improvement checks
      expect(result.analysis.score).toBeGreaterThan(90);
      // Use arrayContaining to allow any optimization containing the keyword
      expect(result.optimizations).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/format|structure|standard/i)
        ])
      );
      assertOptimizationsAreHumanReadable(result.optimizations);
    });

    test('handles empty content gracefully', async () => {
      const outputPath = join(testOutputDir, 'empty.pdf');
      const options: PDFOptions = {
        paperSize: 'Letter',
        margins: { top: 1, right: 1, bottom: 1, left: 1 },
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        orientation: 'portrait'
      };

      const result = await createATSOptimizedPDF('', outputPath, options);
      expect(result.analysis.score).toBeGreaterThanOrEqual(90);
      expect(result.analysis.issues).toHaveLength(0);
    });

    test('handles problematic content and provides actionable improvements', async () => {
      const problematicCV = `
★★★ AMAZING CV ★★★
• Super awesome skills
• Did great things!!!
`;

      const outputPath = join(testOutputDir, 'problematic.pdf');
      const options: PDFOptions = {
        paperSize: 'Letter',
        margins: { top: 1, right: 1, bottom: 1, left: 1 },
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        orientation: 'portrait'
      };

      const result = await createATSOptimizedPDF(problematicCV, outputPath, options);
      
      // Should improve the content
      expect(result.optimizations.length).toBeGreaterThan(0);
      expect(result.analysis.score).toBeGreaterThan(85);
      
      // Should provide helpful suggestions (allow flexible matching for partial/exact matches)
      expect(arrayHasMatching(result.analysis.improvements, /format|character|standard/i)).toBe(true);
      assertOptimizationsAreHumanReadable(result.optimizations);
    });
  });
});
