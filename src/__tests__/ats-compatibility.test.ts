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

    test('validates date formats', async () => {
      const badContent = `
# Experience
Company Name
Role
2023 to now
      `;
      
      const goodContent = `
# Experience
Company Name | 01/2023 - Present
Role
Achievements
      `;
      
      const badAnalysis = await analyzeATSCompatibility(badContent);
      const goodAnalysis = await analyzeATSCompatibility(goodContent);
      
      expect(badAnalysis.issues).toContainEqual(
        expect.objectContaining({ type: 'MISSING_DATES' })
      );
      expect(goodAnalysis.issues).not.toContainEqual(
        expect.objectContaining({ type: 'MISSING_DATES' })
      );
    });
  });

  describe('Scoring System', () => {
    test('handles perfectly formatted content', async () => {
      const perfectContent = `
Dawn Zurick Beilfuss
email@example.com | 123-456-7890
Chicago, IL

# Professional Summary
Experienced professional.

# Professional Experience
ACME Corp | 01/2020 - Present
Senior Role
- Led team of 5 people
- Increased efficiency by 25%

# Education
University | 2015
Degree in Business

# Skills
- Project Management
- Leadership
      `;
      
      const analysis = await analyzeATSCompatibility(perfectContent);
      expect(analysis.score).toBe(100);
      expect(analysis.issues).toHaveLength(0);
    });

    test('reduces score proportionally to issues', async () => {
      const problematicContent = `
★ Dawn's Amazing CV ★
• Did stuff
• Made things happen
      `;
      
      const analysis = await analyzeATSCompatibility(problematicContent);
      expect(analysis.score).toBeLessThan(95);
      expect(analysis.score).toBeGreaterThan(80);
      expect(analysis.issues.length).toBeGreaterThan(1);
    });

    test('provides actionable improvements', async () => {
      const content = `
★ Profile ★
• Skills
• Experience
      `;
      
      const analysis = await analyzeATSCompatibility(content);
      expect(analysis.improvements).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Suggestion:')
        ])
      );
    });
  });
});
