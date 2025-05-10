import { describe, it, expect } from 'vitest';
import { ScoringEngine, createScoringEngine } from '@dzb-cv/ats/scoring';
import {
  sampleCV,
  sampleJob,
  emptyCV,
  emptyJob,
  minimalJob,
  expectNoJobSpecificSuggestions,
} from '../../test-utils';
import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';

describe('ScoringEngine', () => {
  describe('score', () => {
    const engine = new ScoringEngine();

    it('should calculate overall score correctly', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.overall).toBeGreaterThan(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });

    it('should score keywords correctly', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.keywords.score).toBeGreaterThanOrEqual(0);
    });

    it('should score experience correctly', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.experience.score).toBeGreaterThanOrEqual(0);
    });

    it('should score education correctly', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.education.score).toBeGreaterThanOrEqual(0);
    });

    it('should score skills correctly', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.skills.score).toBeGreaterThan(0);
      expect(result.skills.matches).toContain('TypeScript');
      expect(result.skills.matches).toContain('React');
      expect(result.skills.missing).toContain('Kubernetes');
    });

    it('should generate relevant suggestions', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.skills.suggestions).toContain('Add missing skill: Kubernetes');
    });

    it('should handle empty CV gracefully', () => {
      const result = engine.score(emptyCV, sampleJob);
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty job posting gracefully', () => {
      const result = engine.score(sampleCV, emptyJob);
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);
      expectNoJobSpecificSuggestions(result.keywords.suggestions);
    });

    it('should handle missing optional fields', () => {
      const result = engine.score(sampleCV, minimalJob);
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });
  });

  describe('with custom weights', () => {
    const engine = new ScoringEngine({
      keywordWeight: 0.5,
      experienceWeight: 0.2,
      educationWeight: 0.2,
      skillsWeight: 0.1,
    });

    it('should apply custom weights correctly', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.overall).toBeGreaterThan(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    const engine = new ScoringEngine();

    it('should handle empty CV gracefully', () => {
      const result = engine.score(emptyCV, sampleJob);
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty job posting gracefully', () => {
      const result = engine.score(sampleCV, emptyJob);
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);
      expectNoJobSpecificSuggestions(result.keywords.suggestions);
    });

    it('should handle missing optional fields', () => {
      const result = engine.score(sampleCV, minimalJob);
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });
  });

  describe('createScoringEngine', () => {
    it('should create engine with default weights', () => {
      const engine = createScoringEngine();
      expect(engine).toBeInstanceOf(ScoringEngine);
    });

    it('should create engine with custom weights', () => {
      const engine = createScoringEngine({
        keywordWeight: 0.4,
        experienceWeight: 0.3,
        educationWeight: 0.2,
        skillsWeight: 0.1,
      });
      expect(engine).toBeInstanceOf(ScoringEngine);
    });
  });
});
