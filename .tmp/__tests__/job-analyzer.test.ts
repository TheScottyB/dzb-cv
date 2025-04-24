// @ts-check
import { jest, describe, test, expect, beforeAll } from '@jest/globals';
import { analyzeJobPosting } from '../utils/job-analyzer.js';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Job Analyzer', () => {
  beforeAll(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('Successfully parses executive secretary job posting', async () => {
    // Mock successful HTTP response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(`
        <div class="job-posting">
          <h1>Executive Secretary II</h1>
          <div class="company">Illinois Department of Human Services</div>
          <div class="location">Chicago, IL</div>
          <div class="description">
            Exciting opportunity for an experienced executive secretary...
          </div>
          <div class="requirements">
            <ul>
              <li>5+ years administrative experience</li>
              <li>Strong MS Office skills</li>
              <li>Experience with scheduling and correspondence</li>
            </ul>
          </div>
          <div class="responsibilities">
            <ul>
              <li>Manage executive calendars</li>
              <li>Coordinate meetings and communications</li>
              <li>Maintain confidential records</li>
            </ul>
          </div>
        </div>
      `)
    });

    const url = 'https://example.com/job';
    const result = await analyzeJobPosting(url, {});
    
    // Basic structure validation
    expect(result).toBeDefined();
    expect(result.title).toBe('Executive Secretary II');
    expect(result.company).toBe('Illinois Department of Human Services');
    expect(result.location).toBe('Chicago, IL');
    expect(result.responsibilities).toBeInstanceOf(Array);
    expect(result.responsibilities.length).toBeGreaterThan(0);
    expect(result.qualifications).toBeInstanceOf(Array);
    expect(result.qualifications.length).toBeGreaterThan(0);
    expect(result.keyTerms).toBeInstanceOf(Array);
    expect(result.keyTerms.length).toBeGreaterThan(0);
    
    // Source info validation
    expect(result.source).toBeDefined();
    expect(result.source.url).toBe(url);
    expect(result.source.site).toBe('example.com');
    expect(result.source.fetchDate).toBeInstanceOf(Date);
  });

  test('Successfully parses software engineer job posting', async () => {
    // Mock successful HTTP response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(`
        <div class="job-posting">
          <h1>Software Engineer</h1>
          <div class="company">TechCorp</div>
          <div class="location">San Francisco, CA</div>
          <div class="salary">$120,000 - $150,000 yearly</div>
          
          <div class="responsibilities">
            <h2>Responsibilities</h2>
            <ul>
              <li>Build scalable web applications</li>
              <li>Write clean, maintainable code</li>
              <li>Work with product and design teams</li>
              <li>Troubleshoot and debug issues</li>
            </ul>
          </div>
          
          <div class="requirements">
            <h2>Requirements</h2>
            <ul>
              <li>3+ years of experience in software development</li>
              <li>Proficiency in JavaScript, TypeScript, and React</li>
              <li>Experience with Node.js and Express</li>
              <li>Understanding of RESTful APIs and GraphQL</li>
            </ul>
          </div>
          
          <div class="education">
            <h2>Education</h2>
            <p>Bachelor's degree in Computer Science or related field</p>
          </div>
        </div>
      `)
    });

    // Test with a generic job posting
    const result = await analyzeJobPosting('https://example.com/job/12345', {
      skipRateLimiting: true,
      forceGenericParser: true
    });
    
    // Verify basic job information
    expect(result.title).toBe('Software Engineer');
    expect(result.company).toBe('TechCorp');
    expect(result.location).toBe('San Francisco, CA');
    
    // Verify responsibilities were extracted
    expect(result.responsibilities).toHaveLength(4);
    expect(result.responsibilities).toContain('Build scalable web applications');
    
    // Verify requirements/qualifications were extracted
    expect(result.qualifications).toHaveLength(4);
    expect(result.qualifications.some(q => q.includes('TypeScript'))).toBe(true);
    
    // Verify key terms were extracted
    expect(result.keyTerms).toContain('javascript');
    expect(result.keyTerms).toContain('typescript');
    expect(result.keyTerms).toContain('react');
    
    // Verify source information
    expect(result.source.url).toBe('https://example.com/job/12345');
    expect(result.source.site).toBe('example.com');
    expect(result.source.fetchDate).toBeInstanceOf(Date);
  });
  test('Throws a descriptive error on HTTP 404 when analyzing job posting', async () => {
    // Mock HTTP 404 error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not Found')
    });

    const url = 'https://example.com/job/should-404';
    await expect(analyzeJobPosting(url, {})).rejects.toThrow(/404|not found|Failed to fetch job posting/i);
  });
});
