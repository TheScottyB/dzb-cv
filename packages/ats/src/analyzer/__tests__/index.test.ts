import { describe, it, expect } from 'vitest';
import { CVAnalyzer, createAnalyzer } from '@dzb-cv/ats/analyzer';
import {
  simpleSampleCV as sampleCV,
  simpleSampleJob as sampleJob,
  emptyCV,
  emptyJob,
  minimalJob,
  expectNoJobSpecificSuggestions,
} from '../../test-utils';
import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';

describe('CVAnalyzer', () => {
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
      expect(result.suggestions.join(' ')).toMatch(/jest/i);
      expect(result.suggestions.join(' ')).toMatch(/webpack/i);
    });
  });

  describe('edge cases', () => {
    const analyzer = new CVAnalyzer();

    it('should handle empty CV', () => {
      const result = analyzer.analyze(emptyCV, sampleJob);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.keywordMatches).toHaveLength(0);
      expect(result.missingKeywords.length).toBeGreaterThan(0);
    });

    it('should handle empty job posting', () => {
      const result = analyzer.analyze(sampleCV, emptyJob);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.keywordMatches).toHaveLength(0);
      expect(result.missingKeywords).toHaveLength(0);
    });

    it('should handle job posting with no required skills', () => {
      const result = analyzer.analyze(sampleCV, minimalJob);
      expect(result.score).toBeGreaterThan(0);
      expect(result.missingKeywords).toEqual(['description']);
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
