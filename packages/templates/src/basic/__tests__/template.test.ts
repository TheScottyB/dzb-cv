import { describe, it, expect } from 'vitest';
import { BasicTemplate } from '../template';
import type { CVData } from '@dzb-cv/types';

describe('BasicTemplate', () => {
  const template = new BasicTemplate();

  const sampleCV: CVData = {
    personalInfo: {
      name: {
        first: 'John',
        last: 'Doe',
        full: 'John Doe'
      },
      contact: {
        email: 'john@example.com',
        phone: '123-456-7890'
      }
    },
    experience: [
      {
        position: 'Software Engineer',
        employer: 'Tech Corp',
        startDate: '2020-01',
        endDate: '2023-12',
        responsibilities: ['Development', 'Testing']
      }
    ],
    education: [
      {
        degree: 'BS Computer Science',
        institution: 'Test University',
        year: '2019'
      }
    ],
    skills: [
      {
        name: 'TypeScript',
        level: 'Expert'
      }
    ]
  };

  it('should have correct name', () => {
    expect(template.name).toBe('basic');
  });

  it('should render personal information', () => {
    const output = template.render(sampleCV);
    expect(output).toContain('John Doe');
    expect(output).toContain('john@example.com');
    expect(output).toContain('123-456-7890');
  });

  it('should render experience section', () => {
    const output = template.render(sampleCV);
    expect(output).toContain('Software Engineer');
    expect(output).toContain('Tech Corp');
    expect(output).toContain('2020-01');
    expect(output).toContain('2023-12');
    expect(output).toContain('Development');
    expect(output).toContain('Testing');
  });

  it('should render education section', () => {
    const output = template.render(sampleCV);
    expect(output).toContain('BS Computer Science');
    expect(output).toContain('Test University');
    expect(output).toContain('2019');
  });

  it('should render skills section', () => {
    const output = template.render(sampleCV);
    expect(output).toContain('TypeScript');
  });

  it('should include CSS styles', () => {
    const styles = template.getStyles();
    expect(styles).toContain('font-family');
    expect(styles).toContain('margin');
    expect(styles).toContain('color');
  });
});
