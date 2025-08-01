// cv-analyzer-classic.test.ts
// Tests for the classic (non-TF-IDF) CVAnalyzer implementation
import { describe, it, expect } from 'vitest';
import { CVAnalyzer, createAnalyzer } from '../cvAnalyzerClassic';
import { sampleCV, sampleJob, emptyCV, emptyJob } from '../../test-utils';

describe('CVAnalyzer', () => {
  it('should return a valid AnalysisResult for a typical CV and job', () => {
    const analyzer = new CVAnalyzer();
    const result = analyzer.analyze(sampleCV, sampleJob);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('keywordMatches');
    expect(result).toHaveProperty('missingKeywords');
    expect(result).toHaveProperty('suggestions');
  });

  it('should return score 0 and suggestion for empty job posting', () => {
    const analyzer = new CVAnalyzer();
    const result = analyzer.analyze(sampleCV, emptyJob);
    expect(result.score).toBe(0);
    expect(result.suggestions[0]).toMatch(/empty/i);
  });

  it('should match keywords between CV and job', () => {
    const analyzer = new CVAnalyzer();
    const result = analyzer.analyze(sampleCV, sampleJob);
    expect(result.keywordMatches.length).toBeGreaterThan(0);
  });

  it('should identify missing keywords', () => {
    const analyzer = new CVAnalyzer();
    const result = analyzer.analyze(sampleCV, sampleJob);
    const missingKeywords = result.missingKeywords.filter(
      (k: string) =>
        !result.keywordMatches.some((keyword) => keyword.toLowerCase() === k.toLowerCase())
    );
    expect(missingKeywords).toContain('docker');
  });

  it('should generate suggestions for missing keywords', () => {
    const analyzer = new CVAnalyzer();
    const result = analyzer.analyze(sampleCV, sampleJob);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('should handle empty CV gracefully', () => {
    const analyzer = new CVAnalyzer();
    const result = analyzer.analyze(emptyCV, sampleJob);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

describe('createAnalyzer', () => {
  it('should return a CVAnalyzer instance', () => {
    const analyzer = createAnalyzer();
    expect(analyzer).toBeInstanceOf(CVAnalyzer);
  });
});

describe('CVAnalyzer - advanced', () => {
  // it('should allow custom weights to affect scoring', () => {
  //   const analyzer = new CVAnalyzer({ keywords: 1, experience: 0, education: 0 });
  //   const result = analyzer.analyze(sampleCV, sampleJob);
  //   // With all weight on keywords, score should equal keyword match ratio
  //   const expected =
  //     result.keywordMatches.length / (result.keywordMatches.length + result.missingKeywords.length);
  //   expect(result.score).toBeCloseTo(expected, 1);
  // });

  it('should filter out stop words in keyword extraction', () => {
    const analyzer = new CVAnalyzer();
    const jobWithStopWords = { ...sampleJob, description: 'the and or but for with' };
    const result = analyzer.analyze(sampleCV, jobWithStopWords);
    expect(result.keywordMatches).not.toContain('the');
    expect(result.keywordMatches).not.toContain('and');
  });

  it('should handle overqualified and underqualified education', () => {
    const analyzer = new CVAnalyzer();
    const jobPhD = { ...sampleJob, qualifications: ['PhD required'] };
    const jobHS = { ...sampleJob, qualifications: ['High School diploma'] };
    const cvPhD = {
      ...sampleCV,
      education: [
        {
          degree: 'PhD',
          field: 'Physics',
          institution: 'MIT',
          startDate: '2010',
          graduationDate: '2015',
        },
      ],
    };
    const cvHS = {
      ...sampleCV,
      education: [
        {
          degree: 'High School',
          field: 'General',
          institution: 'HS',
          startDate: '2000',
          graduationDate: '2004',
        },
      ],
    };
    expect(analyzer.analyze(cvPhD, jobPhD).score).toBeGreaterThan(0.5);
    expect(analyzer.analyze(cvHS, jobPhD).score).toBeLessThan(0.5);
    expect(analyzer.analyze(cvPhD, jobHS).score).toBeGreaterThan(0.5);
  });

  it('should extract and match compound keywords', () => {
    const analyzer = new CVAnalyzer();
    const job = { ...sampleJob, description: 'Experience with React.js and Node.js required.' };
    const cv = {
      ...sampleCV,
      skills: [...sampleCV.skills, { name: 'React.js' }, { name: 'Node.js' }],
    };
    const result = analyzer.analyze(cv, job);
    expect(result.keywordMatches.map((k) => k.toLowerCase())).toContain('react.js');
    expect(result.keywordMatches.map((k) => k.toLowerCase())).toContain('node.js');
  });

  it('should match keywords case-insensitively', () => {
    const analyzer = new CVAnalyzer();
    const job = { ...sampleJob, description: 'typescript' };
    const cv = { ...sampleCV, skills: [...sampleCV.skills, { name: 'TypeScript' }] };
    const result = analyzer.analyze(cv, job);
    expect(result.keywordMatches.map((k) => k.toLowerCase())).toContain('typescript');
  });

  it('should generate context-aware suggestions', () => {
    const analyzer = new CVAnalyzer();
    const job = { ...sampleJob, description: 'Docker required' };
    const cv = { ...sampleCV, skills: sampleCV.skills.filter((s) => s.name !== 'Docker') };
    const result = analyzer.analyze(cv, job);
    expect(result.suggestions.join(' ')).toMatch(/docker/i);
  });

  it('should handle null, undefined, or empty input gracefully', () => {
    const analyzer = new CVAnalyzer();
    expect(() => analyzer.analyze(null as never, sampleJob)).not.toThrow();
    expect(() => analyzer.analyze(sampleCV, null as never)).not.toThrow();
    expect(() => analyzer.analyze(undefined as never, undefined as never)).not.toThrow();
  });
});
