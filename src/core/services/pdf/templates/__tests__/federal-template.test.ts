import { describe, it, expect } from 'vitest';
import { FederalTemplate } from '../index.js';
import type { CVData } from '../../../../types/cv-base.js';

describe('FederalTemplate', () => {
  const template = new FederalTemplate();

  const testData: CVData = {
    personalInfo: {
      name: { full: 'John Q. Public' },
      contact: {
        email: 'john.public@email.gov',
        phone: '(555) 555-1234',
        address: '123 Federal Ave, Washington, DC 20001',
      },
      citizenship: 'U.S. Citizen',
    },
    experience: [
      {
        title: 'Senior Program Analyst',
        company: 'Department of State',
        startDate: '2020-01',
        endDate: '2023-01',
        responsibilities: ['Program management', 'Budget analysis'],
        grade_level: 'GS-13',
        hours: '40',
        salary: '$95,000 per annum',
        supervisor: 'Jane Smith',
        mayContact: true,
        achievements: ['Reduced processing time by 50%'],
      },
    ],
    education: [
      {
        degree: 'Master of Public Administration',
        institution: 'Georgetown University',
        year: '2019',
        field: 'Public Policy',
        completion_date: 'May 2019',
        status: 'Completed',
      },
    ],
    skills: ['Policy Analysis', 'Budget Management', 'Project Management'],
    certifications: ['PMP Certified'],
  };

  it('should generate federal format header with citizenship', () => {
    const result = template.generateMarkdown(testData);

    expect(result).toContain('# John Q. Public');
    expect(result).toContain('U.S. Citizen');
    expect(result).toContain('123 Federal Ave, Washington, DC 20001');
  });

  it('should format experience with federal requirements', () => {
    const result = template.generateMarkdown(testData);

    expect(result).toContain('Grade Level: GS-13');
    expect(result).toContain('Hours per week: 40');
    expect(result).toContain('Salary: $95,000 per annum');
    expect(result).toContain('Supervisor: Jane Smith (May contact)');
  });

  it('should include achievements section', () => {
    const result = template.generateMarkdown(testData);

    expect(result).toContain('Key Achievements:');
    expect(result).toContain('- Reduced processing time by 50%');
  });

  it('should format education with federal details', () => {
    const result = template.generateMarkdown(testData);

    expect(result).toContain('Master of Public Administration in Public Policy');
    expect(result).toContain('Completion Date: May 2019');
    expect(result).toContain('Status: Completed');
  });

  it('should provide federal-compliant CSS styles', () => {
    const styles = template.getStyles();

    expect(styles).toContain("font-family: 'Times New Roman'");
    expect(styles).toContain('font-size: 12pt');
    expect(styles).toContain('.job-details');
  });
});
