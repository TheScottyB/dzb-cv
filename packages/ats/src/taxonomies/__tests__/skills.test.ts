import { describe, it, expect } from 'vitest';
import {
  SkillCategory,
  SkillDefinition,
  SkillMatcher,
  createSkillMatcher,
} from '@dzb-cv/ats/taxonomies';
import { expectNoJobSpecificSuggestions as _expectNoJobSpecificSuggestions } from '../../test-utils';

describe('SkillMatcher', () => {
  const testSkills: SkillDefinition[] = [
    {
      name: 'JavaScript',
      aliases: ['JS', 'ECMAScript'],
      category: SkillCategory.Programming,
      related: ['TypeScript', 'Node.js'],
    },
    {
      name: 'TypeScript',
      aliases: ['TS'],
      category: SkillCategory.Programming,
      related: ['JavaScript'],
    },
    {
      name: 'Node.js',
      aliases: ['NodeJS', 'Node'],
      category: SkillCategory.Programming,
      related: ['JavaScript', 'Express'],
    },
    {
      name: 'PostgreSQL',
      aliases: ['Postgres'],
      category: SkillCategory.Database,
      related: ['SQL', 'Database Design'],
    },
  ];

  const matcher = new SkillMatcher(testSkills);

  describe('findSkill', () => {
    it('should find skill by exact name', () => {
      const skill = matcher.findSkill('JavaScript');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('JavaScript');
    });

    it('should find skill by alias', () => {
      const skill = matcher.findSkill('JS');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('JavaScript');
    });

    it('should find skill case-insensitively', () => {
      const skill = matcher.findSkill('javascript');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('JavaScript');
    });

    it('should return undefined for unknown skill', () => {
      const skill = matcher.findSkill('Unknown');
      expect(skill).toBeUndefined();
    });
  });

  describe('getRelatedSkills', () => {
    it('should return related skills', () => {
      const related = matcher.getRelatedSkills('JavaScript');
      expect(related).toHaveLength(2);
      expect(related.map((s: SkillDefinition) => s.name)).toContain('TypeScript');
      expect(related.map((s: SkillDefinition) => s.name)).toContain('Node.js');
    });

    it('should return empty array for skill with no relations', () => {
      const related = matcher.getRelatedSkills('PostgreSQL');
      expect(related).toHaveLength(0);
    });

    it('should return empty array for unknown skill', () => {
      const related = matcher.getRelatedSkills('Unknown');
      expect(related).toHaveLength(0);
    });
  });

  describe('findByCategory', () => {
    it('should return all skills in category', () => {
      const programming = matcher.findByCategory(SkillCategory.Programming);
      expect(programming).toHaveLength(3);
      expect(programming.map((s: SkillDefinition) => s.name)).toContain('JavaScript');
      expect(programming.map((s: SkillDefinition) => s.name)).toContain('TypeScript');
      expect(programming.map((s: SkillDefinition) => s.name)).toContain('Node.js');
    });

    it('should return empty array for category with no skills', () => {
      const design = matcher.findByCategory(SkillCategory.Design);
      expect(design).toHaveLength(0);
    });
  });

  describe('areRelated', () => {
    it('should return true for directly related skills', () => {
      expect(matcher.areRelated('JavaScript', 'TypeScript')).toBe(true);
    });

    it('should return true for bidirectionally related skills', () => {
      expect(matcher.areRelated('TypeScript', 'JavaScript')).toBe(true);
    });

    it('should return false for unrelated skills', () => {
      expect(matcher.areRelated('JavaScript', 'PostgreSQL')).toBe(false);
    });

    it('should return false when either skill is unknown', () => {
      expect(matcher.areRelated('JavaScript', 'Unknown')).toBe(false);
      expect(matcher.areRelated('Unknown', 'JavaScript')).toBe(false);
      expect(matcher.areRelated('Unknown1', 'Unknown2')).toBe(false);
    });
  });

  describe('createSkillMatcher', () => {
    it('should create a new SkillMatcher instance', () => {
      const instance = createSkillMatcher(testSkills);
      expect(instance).toBeInstanceOf(SkillMatcher);
    });

    it('should use default skills when none provided', () => {
      const instance = createSkillMatcher();
      expect(instance).toBeInstanceOf(SkillMatcher);
      expect(instance.findSkill('JavaScript')).toBeDefined();
    });
  });

  it('should match skills', () => {
    const matcher = createSkillMatcher([
      {
        name: 'JavaScript',
        category: SkillCategory.Programming,
      },
      {
        name: 'TypeScript',
        category: SkillCategory.Programming,
      },
    ]);
    expect(matcher.findSkill('JavaScript')).toBeDefined();
    expect(matcher.findSkill('TypeScript')).toBeDefined();
    expect(matcher.findSkill('Python')).toBeUndefined();
  });
});
