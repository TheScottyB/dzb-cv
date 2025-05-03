import { describe, it, expect } from 'vitest';
import { BasicTemplate } from '../template.js';
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
        responsibilities: ['Development', 'Testing'],
        employmentType: 'full-time'
      }
    ],
    education: [
      {
        degree: 'BS',
        field: 'Computer Science',
        institution: 'Test University',
        graduationDate: '2019'
      }
    ],
    skills: [
      {
        name: 'TypeScript',
        level: 'expert'
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
    expect(output).toContain('BS (Computer Science)'); // Match template output with parentheses
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

  it('should handle empty or null fields gracefully', () => {
    const cvWithEmptyFields: CVData = {
      personalInfo: {
        name: {
          first: '',
          last: '',
          full: ''
        },
        contact: {
          email: '',
          phone: '' // Changed from null to empty string to match type definition
        }
      },
      experience: [],
      education: [],
      skills: []
    };
    
    const output = template.render(cvWithEmptyFields);
    
    // Should not throw errors
    expect(() => template.render(cvWithEmptyFields)).not.toThrow();
    
    // Should still render something even with empty data
    expect(output).toBeTruthy();
    
    // Should include at least a title section (even if empty)
    expect(output).toContain('#');
    
    // Should include section headers for main sections
    expect(output).toContain('## Experience');
    expect(output).toContain('## Education');
    expect(output).toContain('## Skills');
  });

  it('should render optional contact fields when provided', () => {
    const cvWithOptionalContact: CVData = {
      ...sampleCV,
      personalInfo: {
        ...sampleCV.personalInfo,
        contact: {
          ...sampleCV.personalInfo.contact,
          address: '123 Main St, Anytown, USA',
          linkedin: 'linkedin.com/in/johndoe'
        }
      }
    };
    
    const output = template.render(cvWithOptionalContact);
    
    expect(output).toContain('123 Main St, Anytown, USA');
    expect(output).toContain('linkedin.com/in/johndoe');
  });

  it('should handle different date formats in experience section', () => {
    const cvWithVariousDateFormats: CVData = {
      ...sampleCV,
      experience: [
        {
          position: 'Senior Developer',
          employer: 'Advanced Tech',
          startDate: 'Jan 2021',
          endDate: 'Present',
          responsibilities: ['Leadership'],
          employmentType: 'full-time'
        },
        {
          position: 'Junior Developer',
          employer: 'Startup Inc',
          startDate: '2018',
          endDate: '2020',
          responsibilities: ['Coding'],
          employmentType: 'full-time'
        }
      ]
    };
    
    const output = template.render(cvWithVariousDateFormats);
    
    expect(output).toContain('Jan 2021');
    expect(output).toContain('Present');
    expect(output).toContain('2018');
    expect(output).toContain('2020');
  });

  it('should handle edge cases for responsibilities array', () => {
    const cvWithResponsibilitiesEdgeCases: CVData = {
      ...sampleCV,
      experience: [
        {
          position: 'Manager',
          employer: 'Big Corp',
          startDate: '2020',
          endDate: '2023',
          responsibilities: [],
          employmentType: 'full-time'
        },
        {
          position: 'Intern',
          employer: 'Small Shop',
          startDate: '2019',
          endDate: '2019',
          responsibilities: ['Very long responsibility description that goes into significant detail about the tasks performed and projects completed during the internship period'],
          employmentType: 'internship'
        }
      ]
    };
    
    const output = template.render(cvWithResponsibilitiesEdgeCases);
    
    // Empty responsibilities should not cause errors
    expect(output).toContain('Manager');
    expect(output).toContain('Big Corp');
    
    // Long responsibility text should be included
    expect(output).toContain('Very long responsibility description');
  });

  it('should validate complete Markdown structure', () => {
    const output = template.render(sampleCV);
    
    // Check for proper Markdown structure
    expect(output).toContain('# John Doe');
    
    // Check for contact information
    expect(output).toContain('john@example.com');
    expect(output).toContain('123-456-7890');
    
    // Check for main document sections (using Markdown headers)
    expect(output).toContain('## Experience');
    expect(output).toContain('## Education');
    expect(output).toContain('## Skills');
    
    // Check for experience details
    expect(output).toContain('### Software Engineer at Tech Corp');
    expect(output).toContain('2020-01 - 2023-12');
    
    // Check for list items using Markdown syntax
    expect(output).toContain('- Development');
    expect(output).toContain('- Testing');

    // Check for education details
    expect(output).toContain('### BS (Computer Science)'); // Match template output with parentheses
    expect(output).toContain('Test University, 2019');
    // Check for skills list
    expect(output).toContain('- TypeScript');
  });
});
