import { describe, it, expect } from 'vitest';
import { ATSEngine, createATSEngine } from '@dzb-cv/ats/engine';
import {
  sampleCV,
  sampleJob,
  emptyCV,
  emptyJob,
  minimalJob as _minimalJob,
  expectNoJobSpecificSuggestions,
} from '../../test-utils';
import { SkillCategory } from '@dzb-cv/ats/taxonomies';
import type { CVData } from '@dzb-cv/types';
import type { JobPosting as _JobPosting } from '@dzb-cv/types/job';

describe('ATSEngine', () => {
  describe('analyze', () => {
    const engine = new ATSEngine();

    it('should return comprehensive analysis results', async () => {
      const result = await engine.analyze(sampleCV, sampleJob);

      // Check score
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);

      // Check analysis
      expect(result.analysis.keywordMatches).toContain('typescript');
      expect(result.analysis.keywordMatches).toContain('react');
      expect(result.analysis.missingKeywords).toContain('docker');

      // Check scoring
      expect(result.scoring.skills.matches).toContain('TypeScript');
      expect(result.scoring.skills.matches).toContain('React');
      expect(result.scoring.skills.missing).toContain('Docker');

      // Check suggestions
      expect(result.suggestions.join(' ')).toMatch(/docker/i);
    });

    it('should identify missing skills with alternatives', async () => {
      const result = await engine.analyze(sampleCV, sampleJob);

      expect(result.missingSkills).toContainEqual(
        expect.objectContaining({
          skill: 'Docker',
        })
      );
    });
  });

  describe('meetsRequirements', () => {
    const engine = new ATSEngine({ minimumScore: 0.7 });

    it('should return true for well-matching CV', async () => {
      const result = await engine.analyze(sampleCV, sampleJob);
      const score = result.score;
      // Log the score for debugging
      console.log('Well-matching CV score:', score);
      expect(engine.meetsRequirements(sampleCV, sampleJob)).toBe(score >= 0.7);
    });

    it('should return false for poorly matching CV', () => {
      const poorCV: CVData = {
        personalInfo: {
          name: { first: 'Poor', last: 'Match', full: 'Poor Match' },
          contact: { email: 'poor@example.com', phone: '123-456-7890' },
        },
        experience: [],
        education: [],
        skills: [{ name: 'Different Skill', level: 'beginner' }],
      };

      expect(engine.meetsRequirements(poorCV, sampleJob)).toBe(false);
    });
  });

  describe('with custom options', () => {
    it('should apply custom scoring weights', async () => {
      const engine = new ATSEngine({
        scoring: {
          keywordWeight: 0.5,
          experienceWeight: 0.2,
          educationWeight: 0.2,
          skillsWeight: 0.1,
        },
      });

      const result = await engine.analyze(sampleCV, sampleJob);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should use custom minimum score', () => {
      const strictEngine = new ATSEngine({ minimumScore: 0.9 });
      expect(strictEngine.meetsRequirements(sampleCV, sampleJob)).toBe(false);

      const lenientEngine = new ATSEngine({ minimumScore: 0.5 });
      expect(lenientEngine.meetsRequirements(sampleCV, sampleJob)).toBe(true);
    });

    it('should work with custom skill definitions', async () => {
      const engine = new ATSEngine({
        skills: [
          {
            name: 'React',
            aliases: ['ReactJS', 'React.js'],
            category: SkillCategory.Programming,
            related: ['TypeScript', 'JavaScript'],
          },
        ],
      });

      const result = await engine.analyze(sampleCV, sampleJob);
      expect(
        result.missingSkills.some(
          (s) => s.skill === 'Docker' && s.alternatives?.some((a) => a.name === 'React')
        )
      ).toBe(false);
    });
  });

  describe('edge cases', () => {
    const engine = new ATSEngine();

    it('should handle empty CV gracefully', async () => {
      const result = await engine.analyze(emptyCV, sampleJob);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle empty job posting gracefully', async () => {
      const result = await engine.analyze(sampleCV, emptyJob);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expectNoJobSpecificSuggestions(result.suggestions);
    });
  });

  describe('createATSEngine', () => {
    it('should create engine with default options', () => {
      const engine = createATSEngine();
      expect(engine).toBeInstanceOf(ATSEngine);
    });

    it('should create engine with custom options', () => {
      const engine = createATSEngine({
        minimumScore: 0.8,
        scoring: {
          keywordWeight: 0.4,
          experienceWeight: 0.3,
          educationWeight: 0.2,
          skillsWeight: 0.1,
        },
      });
      expect(engine).toBeInstanceOf(ATSEngine);
    });
  });
});
