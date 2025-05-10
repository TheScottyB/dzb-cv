import { describe, it, expect } from 'vitest';
import { MinimalTemplate } from '../index.js';
import type { CVData } from '../../../../types/cv-base.js';

describe('MinimalTemplate', () => {
  const template = new MinimalTemplate();

  const testData: CVData = {
    personalInfo: {
      name: { full: 'Test User' },
      title: 'Software Engineer',
      contact: {
        email: 'test@example.com',
        phone: '123-456-7890',
        address: 'Test City',
      },
    },
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Co',
        startDate: '2020-01',
        endDate: '2023-01',
        responsibilities: ['Lead development', 'Architecture design'],
      },
    ],
    education: [
      {
        degree: 'BS Computer Science',
        institution: 'Test University',
        year: '2020',
      },
    ],
    skills: ['JavaScript', 'TypeScript', 'React'],
    certifications: ['AWS Certified'],
  };

  it('should generate markdown with minimal styling', () => {
    const result = template.generateMarkdown(testData);

    expect(result).toContain('# Test User');
    expect(result).toContain('Software Engineer');
    expect(result).toContain('test@example.com · 123-456-7890 · Test City');
  });

  it('should format experience entries with bullet points', () => {
    const result = template.generateMarkdown(testData);

    expect(result).toContain('### Senior Developer · Tech Co');
    expect(result).toContain('- Lead development');
    expect(result).toContain('- Architecture design');
  });

  it('should generate skills with custom styling', () => {
    const result = template.generateMarkdown(testData);

    expect(result).toContain('<div class="skills-list">');
    expect(result).toContain('<span class="skill-item">JavaScript</span>');
  });

  it('should respect template options for section inclusion', () => {
    const result = template.generateMarkdown(testData, {
      includeSkills: false,
      includeEducation: false,
    });

    expect(result).not.toContain('## Skills');
    expect(result).not.toContain('## Education');
    expect(result).toContain('## Experience');
  });

  it('should provide minimal CSS styles', () => {
    const styles = template.getStyles();

    expect(styles).toContain('font-family: -apple-system');
    expect(styles).toContain('.skill-item');
    expect(styles).toContain('@media print');
  });
});
