import { describe, it, expect } from 'vitest';
import type { JobPosting, JobPostingAnalysis, CVMatchResult } from '../job-analysis.js';

describe('Job Analysis Types', () => {
  it('should validate a JobPosting object', () => {
    const posting: JobPosting = {
      url: 'https://example.com/job',
      title: 'Software Engineer',
      company: 'Tech Co',
      description: 'Engineering position',
      source: 'LinkedIn'
    };

    expect(posting).toBeDefined();
    expect(posting.title).toBe('Software Engineer');
  });

  it('should validate a JobPostingAnalysis object', () => {
    const analysis: JobPostingAnalysis = {
      title: 'Software Engineer',
      company: 'Tech Co',
      responsibilities: ['Coding', 'Testing'],
      qualifications: ['JavaScript', 'TypeScript'],
      keyTerms: ['React', 'Node.js'],
      source: {
        url: 'https://example.com/job',
        site: 'LinkedIn',
        fetchDate: new Date()
      }
    };

    expect(analysis).toBeDefined();
    expect(analysis.responsibilities).toHaveLength(2);
  });
});

