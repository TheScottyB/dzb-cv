import { describe, it, expect } from 'vitest';
import { ScoringEngine, createScoringEngine } from '../index.js';
import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';

describe('ScoringEngine', () => {
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
      professionalTitle: 'Senior Software Engineer',
    },
    experience: [
      {
        position: 'Senior Software Engineer',
        employer: 'Tech Corp',
        startDate: '2020-01',
        endDate: '2023-12',
        responsibilities: [
          'Led development of microservices architecture',
          'Implemented CI/CD pipelines',
          'Mentored junior developers',
        ],
      },
      {
        position: 'Software Engineer',
        employer: 'Dev Inc',
        startDate: '2018-01',
        endDate: '2019-12',
        responsibilities: [
          'Developed React applications',
          'Worked with TypeScript and Node.js',
        ],
      },
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Tech University',
        graduationDate: '2018',
      },
    ],
    skills: [
      { name: 'TypeScript', level: 'expert' },
      { name: 'React', level: 'advanced' },
      { name: 'Node.js', level: 'advanced' },
      { name: 'Docker', level: 'intermediate' },
    ],
  };

  const sampleJob: JobPosting = {
    title: 'Senior Full Stack Developer',
    company: 'Innovation Labs',
    description: 'Looking for a senior developer with 5 years of experience in web development.',
    qualifications: [
      'Bachelor\'s degree in Computer Science or related field',
      'Strong experience with TypeScript and React',
      '5+ years of professional experience',
    ],
    responsibilities: [
      'Lead development of web applications',
      'Mentor junior developers',
      'Implement best practices and CI/CD',
    ],
    skills: [
      'TypeScript',
      'React',
      'Node.js',
      'Docker',
      'Kubernetes',
    ],
  };

  describe('score', () => {
    const engine = new ScoringEngine();

    it('should calculate overall score correctly', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.overall).toBeGreaterThan(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });

    it('should score keywords correctly', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.keywords.score).toBeGreaterThan(0);
      expect(result.keywords.matches).toContain('TypeScript');
      expect(result.keywords.matches).toContain('React');
      expect(result.keywords.missing).toContain('Kubernetes');
    });

    it('should score experience correctly', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.experience.score).toBeGreaterThan(0);
      expect(result.experience.matches).toContain('6 years of experience');
    });

    it('should score education correctly', () => {
      const result = engine.score(sampleCV, sampleJob);
      expect(result.education.score).toBe(1); // Perfect match for education
      expect(result.education.matches).toContain('Bachelor of Science');
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
      const emptyCV: CVData = {
        personalInfo: {
          name: { first: '', last: '', full: '' },
          contact: { email: '', phone: '' },
        },
        experience: [],
        education: [],
        skills: [],
      };

      const result = engine.score(emptyCV, sampleJob);
      expect(result.overall).toBe(0);
    });

    it('should handle empty job posting gracefully', () => {
      const emptyJob: JobPosting = {
        title: '',
        company: '',
        description: '',
      };

      const result = engine.score(sampleCV, emptyJob);
      expect(result.overall).toBeGreaterThan(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });

    it('should handle missing optional fields', () => {
      const minimalJob: JobPosting = {
        title: 'Developer',
        company: 'Company',
        description: 'Job description',
      };

      const result = engine.score(sampleCV, minimalJob);
      expect(result.overall).toBeGreaterThan(0);
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

