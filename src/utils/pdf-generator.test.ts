import { PDFGenerator } from './pdf-generator.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { JobMatcher } from './job-matcher.js';

describe('PDFGenerator', () => {
  let generator: PDFGenerator;
  let matcher: JobMatcher;
  let jobData: any;

  beforeAll(() => {
    generator = new PDFGenerator();
    matcher = new JobMatcher();
    // Load the job data from our JSON file
    const jobDataPath = join(process.cwd(), 'job-postings', 'mercy-health-37949', 'job-data-20240425.json');
    jobData = JSON.parse(readFileSync(jobDataPath, 'utf-8'));
  });

  test('should generate PDF from markdown with custom theme', async () => {
    const markdown = `
# Test Document
## With Custom Theme
This is a test document with **bold** text and *italic* text.

- List item 1
- List item 2
    `;

    const outputPath = join(process.cwd(), 'test-output.pdf');
    await generator.generateFromMarkdown(markdown, outputPath, {
      title: 'Test Document',
      subtitle: 'Custom Theme Test',
      theme: {
        primaryColor: [0.2, 0.4, 0.8], // Blue theme
        secondaryColor: [0.1, 0.1, 0.1],
        font: 'Helvetica'
      },
      includeHeader: true,
      includeFooter: true
    });

    // Verify file was created
    expect(() => readFileSync(outputPath)).not.toThrow();
  });

  test('should generate PDF from job matches', async () => {
    const matches = matcher.matchRequirements(jobData);
    const outputPath = join(process.cwd(), 'job-analysis.pdf');
    
    await generator.generateFromJobMatches(matches, outputPath, {
      title: 'Job Analysis Report',
      subtitle: 'Mercyhealth - Patient Access Supervisor',
      theme: {
        primaryColor: [0, 0.5, 0.2], // Forest green
        secondaryColor: [0.2, 0.2, 0.2]
      },
      includeHeader: true,
      includeFooter: true
    });

    // Verify file was created
    expect(() => readFileSync(outputPath)).not.toThrow();
  });
}); 