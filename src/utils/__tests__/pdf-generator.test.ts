import { PDFGenerator } from '../pdf-generator.js';
import { MatchResult } from '../job-matcher.js';

describe('PDFGenerator', () => {
  let pdfGenerator: PDFGenerator;

  beforeEach(() => {
    pdfGenerator = new PDFGenerator();
  });

  describe('generateFromMarkdown', () => {
    it('should generate a PDF from markdown content', async () => {
      const markdown = '# Test Document\n\nThis is a test document.';
      const pdfBytes = await pdfGenerator.generateFromMarkdown(markdown);
      
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });

    it('should generate a PDF with custom options', async () => {
      const markdown = '# Test Document\n\nThis is a test document.';
      const options = {
        title: 'Custom Title',
        subtitle: 'Custom Subtitle',
        includeHeader: true,
        includeFooter: true
      };
      
      const pdfBytes = await pdfGenerator.generateFromMarkdown(markdown, options);
      
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });
  });

  describe('generateFromJobMatches', () => {
    it('should generate a PDF from job matches', async () => {
      const matches: MatchResult[] = [
        {
          requirement: 'Experience with TypeScript',
          confidence: 'high',
          matches: ['5 years of TypeScript experience'],
          evidence: ['Worked on multiple TypeScript projects']
        }
      ];
      
      const pdfBytes = await pdfGenerator.generateFromJobMatches(matches);
      
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });
  });

  describe('theme customization', () => {
    it('should update theme settings', () => {
      const newTheme = {
        primaryColor: [0.2, 0.4, 0.6] as [number, number, number],
        secondaryColor: [0.1, 0.1, 0.1] as [number, number, number],
        fontSize: 14,
        lineHeight: 1.8,
        accentColor: [0.9, 0.3, 0.3] as [number, number, number]
      };
      
      pdfGenerator.setTheme(newTheme);
      
      // Note: We can't directly access the private theme property
      // This test just verifies the method doesn't throw
      expect(() => pdfGenerator.setTheme(newTheme)).not.toThrow();
    });
  });

  describe('header and footer', () => {
    it('should update header content', () => {
      const header = 'Custom Header';
      pdfGenerator.setHeader(header);
      
      // Note: We can't directly access the private header property
      // This test just verifies the method doesn't throw
      expect(() => pdfGenerator.setHeader(header)).not.toThrow();
    });

    it('should update footer content', () => {
      const footer = 'Custom Footer';
      pdfGenerator.setFooter(footer);
      
      // Note: We can't directly access the private footer property
      // This test just verifies the method doesn't throw
      expect(() => pdfGenerator.setFooter(footer)).not.toThrow();
    });
  });
}); 