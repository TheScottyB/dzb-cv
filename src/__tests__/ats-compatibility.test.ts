import { analyzeATSCompatibility } from '../utils/ats/analyzer';
import type { ATSAnalysis } from '../types/ats-types';

describe('ATS Compatibility Tests', () => {
  describe('Content Analysis', () => {
    test('detects complex formatting', async () => {
      const content = `
# Experience
• Managed team of 5
★ Increased sales by 50%
      `;
      
      const analysis = await analyzeATSCompatibility(content);
      expect(analysis.score).toBeLessThan(100);
      expect(analysis.issues).toContainEqual(
        expect.objectContaining({ type: 'COMPLEX_FORMATTING' })
      );
    });

    test('validates proper date formats', async () => {
      const content = `
# Experience
Company Name
Role
Did something great
      `;
      
      const analysis = await analyzeATSCompatibility(content);
      expect(analysis.issues).toContainEqual(
        expect.objectContaining({ type: 'MISSING_DATES' })
      );
    });

    test('accepts proper date formats', async () => {
      const content = `
# Experience
Company Name | 2020 - Present
Role
Achievements
      `;
      
      const analysis = await analyzeATSCompatibility(content);
      expect(analysis.issues).not.toContainEqual(
        expect.objectContaining({ type: 'MISSING_DATES' })
      );
    });
  });

  describe('Contact Information', () => {
    test('requires proper contact format', async () => {
      const content = `
Dawn Zurick Beilfuss
email@example.com | 123-456-7890
Chicago, IL
      `;
      
      const analysis = await analyzeATSCompatibility(content);
      expect(analysis.issues).not.toContainEqual(
        expect.objectContaining({ type: 'CONTACT_INFO' })
      );
    });
  });

  describe('Section Headings', () => {
    test('validates standard section headings', async () => {
      const content = `
# My Amazing Journey
# Cool Stuff I Did
      `;
      
      const analysis = await analyzeATSCompatibility(content);
      expect(analysis.issues).toContainEqual(
        expect.objectContaining({ type: 'UNUSUAL_HEADINGS' })
      );
    });

    test('accepts standard section headings', async () => {
      const content = `
# Professional Experience
# Education
# Skills
      `;
      
      const analysis = await analyzeATSCompatibility(content);
      expect(analysis.issues).not.toContainEqual(
        expect.objectContaining({ type: 'UNUSUAL_HEADINGS' })
      );
    });
  });

  describe('Improvement Suggestions', () => {
    test('provides actionable improvements', async () => {
      const content = `
★ My Amazing Profile ★
• Did cool stuff
• Made things happen
      `;
      
      const analysis = await analyzeATSCompatibility(content);
      expect(analysis.improvements.length).toBeGreaterThan(0);
      expect(analysis.improvements[0]).toContain('Suggestion:');
    });
  });

  describe('Scoring System', () => {
    test('perfect score for ATS-friendly content', async () => {
      const content = `
Dawn Zurick Beilfuss
email@example.com | 123-456-7890
Chicago, IL

# Professional Summary
Experienced professional with expertise in multiple industries.

# Professional Experience
Company Name | 2020 - Present
Senior Role
- Led team of 5 people
- Increased efficiency by 25%

# Education
University Name | 2015
Degree in Business

# Skills
- Project Management
- Team Leadership
- Strategic Planning
      `;
      
      const analysis = await analyzeATSCompatibility(content);
      expect(analysis.score).toBe(100);
      expect(analysis.issues.length).toBe(0);
    });

    test('reduces score for each issue', async () => {
      const content = `
★ Dawn's Amazing CV ★
• Did stuff
• Made things happen
      `;
      
      const analysis = await analyzeATSCompatibility(content);
      expect(analysis.score).toBeLessThan(100);
      expect(analysis.issues.length).toBeGreaterThan(1);
    });
  });
});
