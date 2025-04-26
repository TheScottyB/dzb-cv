import { describe, it, expect, beforeAll } from 'vitest';
import { JobMatcher } from './job-matcher';
import { join } from 'path';
import { readFileSync } from 'fs';

describe('JobMatcher', () => {
  let matcher: JobMatcher;
  let jobData: any;

  beforeAll(() => {
    matcher = new JobMatcher();
    // Load the job data from our JSON file
    const jobDataPath = join(process.cwd(), 'job-postings', 'mercy-health-37949', 'job-data-20240425.json');
    jobData = JSON.parse(readFileSync(jobDataPath, 'utf-8'));
  });

  it('should match requirements from job posting', () => {
    const matches = matcher.matchRequirements(jobData);
    
    // Check that we found matches for key requirements
    const supervisionMatches = matches.filter(m => 
      m.requirement.toLowerCase().includes('supervisor') || 
      m.requirement.toLowerCase().includes('supervision')
    );
    
    expect(supervisionMatches.length).toBeGreaterThan(0);
    expect(supervisionMatches.some(m => m.confidence === 'medium')).toBe(true);
    
    // Check patient access matches
    const patientAccessMatches = matches.filter(m => 
      m.requirement.toLowerCase().includes('patient') || 
      m.requirement.toLowerCase().includes('access')
    );
    
    expect(patientAccessMatches.length).toBeGreaterThan(0);
  });

  it('should generate tailored content', () => {
    const matches = matcher.matchRequirements(jobData);
    const content = matcher.generateTailoredContent(matches);
    
    // Check that the content includes key elements
    expect(content).toContain('healthcare administration');
    expect(content).toContain('Fox Lake');
    expect(content).toContain('Midwest Sports');
    
    // Check that it mentions key responsibilities
    expect(content).toContain('patient flow');
    expect(content).toContain('supervision');
  });
}); 