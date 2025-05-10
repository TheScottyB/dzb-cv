import { describe, it, expect } from 'vitest';
import { CVAnalyzer, createAnalyzer } from '../index.js';
import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';

describe('CVAnalyzer', () => {
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
        position: 'Frontend Developer',
        employer: 'Web Corp',
        startDate: '2020-01',
        endDate: '2023-12',
        responsibilities: [
          'Developed React applications',
          'Implemented responsive designs',
          'Worked with TypeScript',
        ],
      },
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Tech University',
        graduationDate: '2020',
      },
    ],
    skills: [
      { name: 'React', level: 'advanced' },
      { name: 'TypeScript', level: 'advanced' },
      { name: 'HTML', level: 'expert' },
      { name: 'CSS', level: 'expert' },
    ],
  };

  const sampleJob: JobPosting = {
    title: 'Senior Frontend Developer',
    company: 'Tech Solutions',
    description: 'Looking for an experienced frontend developer with strong React skills.',
    qualifications: [
      'Strong experience with React and TypeScript',
      '3+ years of frontend development',
      'Experience with modern CSS frameworks',
    ],
    responsibilities: [
      'Develop and maintain React applications',
      'Write clean, maintainable TypeScript code',
      'Implement responsive designs',
      'Optimize application performance',
    ],
    skills: ['React', 'TypeScript', 'CSS', 'Jest', 'Webpack'],
  };

  describe('analyze', () => {
    const analyzer = new CVAnalyzer();

    it('should calculate match score', () => {
      const result = analyzer.analyze(sampleCV, sampleJob);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should identify matching keywords', () => {
      const result = analyzer.analyze(sampleCV, sampleJob);
      expect(result.keywordMatches).toContain('react');
      expect(result.keywordMatches).toContain('typescript');
      expect(result.keywordMatches).toContain('css');
    });

    it('should identify missing keywords', () => {
      const result = analyzer.analyze(sampleCV, sampleJob);
      expect(result.missingKeywords).toContain('jest');
      expect(result.missingKeywords).toContain('webpack');
    });

    it('should generate relevant suggestions', () => {
      const result = analyzer.analyze(sampleCV, sampleJob);
      expect(result.suggestions).toContain(expect.stringContaining('jest'));
      expect(result.suggestions).toContain(expect.stringContaining('webpack'));
    });
  });

  describe('edge cases', () => {
    const analyzer = new CVAnalyzer();

    it('should handle empty CV', () => {
      const emptyCV: CVData = {
        personalInfo: {
          name: { first: '', last: '', full: '' },
          contact: { email: '', phone: '' },
        },
        experience: [],
        education: [],
        skills: [],
      };

      const result = analyzer.analyze(emptyCV, sampleJob);
      expect(result.score).toBe(0);
      expect(result.keywordMatches).toHaveLength(0);
      expect(result.missingKeywords.length).toBeGreaterThan(0);
    });

    it('should handle empty job posting', () => {
      const emptyJob: JobPosting = {
        title: '',
        company: '',
        description: '',
      };

      const result = analyzer.analyze(sampleCV, emptyJob);
      expect(result.score).toBe(0);
      expect(result.keywordMatches).toHaveLength(0);
      expect(result.missingKeywords).toHaveLength(0);
    });

    it('should handle job posting with no required skills', () => {
      const noSkillsJob: JobPosting = {
        title: 'Developer',
        company: 'Company',
        description: 'Looking for a developer',
      };

      const result = analyzer.analyze(sampleCV, noSkillsJob);
      expect(result.score).toBeGreaterThan(0);
      expect(result.missingKeywords).toHaveLength(0);
    });
  });

  describe('keyword extraction', () => {
    const analyzer = new CVAnalyzer();

    it('should extract keywords from CV experience', () => {
      const result = analyzer.analyze(sampleCV, sampleJob);
      expect(result.keywordMatches).toContain('react');
      expect(result.keywordMatches).toContain('typescript');
    });

    it('should extract keywords from job responsibilities', () => {
      const result = analyzer.analyze(sampleCV, sampleJob);
      expect(result.keywordMatches).toContain('react');
      expect(result.keywordMatches).toContain('typescript');
    });

    it('should not match stop words', () => {
      const result = analyzer.analyze(sampleCV, sampleJob);
      expect(result.keywordMatches).not.toContain('and');
      expect(result.keywordMatches).not.toContain('with');
    });
  });

  describe('createAnalyzer', () => {
    it('should create a new CVAnalyzer instance', () => {
      const analyzer = createAnalyzer();
      expect(analyzer).toBeInstanceOf(CVAnalyzer);
    });

    it('should produce consistent results', () => {
      const analyzer1 = createAnalyzer();
      const analyzer2 = createAnalyzer();

      const result1 = analyzer1.analyze(sampleCV, sampleJob);
      const result2 = analyzer2.analyze(sampleCV, sampleJob);

      expect(result1.score).toBe(result2.score);
      expect(result1.keywordMatches).toEqual(result2.keywordMatches);
      expect(result1.missingKeywords).toEqual(result2.missingKeywords);
    });
  });
});
