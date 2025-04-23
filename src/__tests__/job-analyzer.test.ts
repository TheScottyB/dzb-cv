// @ts-check
import { describe, expect, test, jest } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { analyzeJobPosting } from '../utils/job-analyzer.js';
import type { JobPostingAnalysis } from '../types/cv-types.js';

// Mock fetch to avoid actual network requests during tests
jest.mock('node-fetch', () => {
  return jest.fn(() => 
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Software Engineer - TechCorp</title>
          </head>
          <body>
            <h1>Software Engineer</h1>
            <div class="company-name">TechCorp</div>
            <div class="location">San Francisco, CA</div>
            
            <div class="job-description">
              <h2>About the Role</h2>
              <p>We're looking for a talented Software Engineer to join our team.</p>
              
              <h2>Responsibilities</h2>
              <ul>
                <li>Build scalable web applications</li>
                <li>Write clean, maintainable code</li>
                <li>Work with product and design teams</li>
                <li>Troubleshoot and debug issues</li>
              </ul>
              
              <h2>Requirements</h2>
              <ul>
                <li>3+ years of experience in software development</li>
                <li>Proficiency in JavaScript, TypeScript, and React</li>
                <li>Experience with Node.js and Express</li>
                <li>Understanding of RESTful APIs and GraphQL</li>
              </ul>
              
              <h2>Education</h2>
              <p>Bachelor's degree in Computer Science or related field</p>
              
              <h2>Salary</h2>
              <p>$120,000 - $150,000 yearly</p>
            </div>
          </body>
        </html>
      `)
    })
  );
});

describe('Job Analyzer', () => {
  test('Successfully parses job posting from HTML', async () => {
    // Test with a generic job posting
    const result = await analyzeJobPosting('https://example.com/job/12345', {
      skipRateLimiting: true,
      forceGenericParser: true
    });
    
    // Verify basic job information
    expect(result.title).toContain('Software Engineer');
    expect(result.company).toBe('TechCorp');
    expect(result.location).toBe('San Francisco, CA');
    
    // Verify responsibilities were extracted
    expect(result.responsibilities).toHaveLength(4);
    expect(result.responsibilities).toContain('Build scalable web applications');
    
    // Verify requirements/qualifications were extracted
    expect(result.qualifications).toHaveLength(4);
    expect(result.qualifications.some(q => q.includes('TypeScript'))).toBe(true);
    
    // Verify salary information was parsed
    expect(result.salaryRange).toBeDefined();
    expect(result.salaryRange?.min).toBe(120000);
    expect(result.salaryRange?.max).toBe(150000);
    expect(result.salaryRange?.period).toBe('yearly');
    
    // Verify key terms were extracted
    expect(result.keyTerms).toContain('javascript');
    expect(result.keyTerms).toContain('typescript');
    expect(result.keyTerms).toContain('react');
    
    // Verify source information
    expect(result.sourceUrl).toBe('https://example.com/job/12345');
    expect(result.sourceSite).toBe('example.com');
    expect(result.analyzedAt).toBeTruthy();
  });
});
