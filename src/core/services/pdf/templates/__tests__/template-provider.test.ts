import { describe, it, expect } from 'vitest';
import { BasicTemplate, MinimalTemplate, FederalTemplate, AcademicTemplate } from '../index.js';
import { TemplateProvider } from '../template-provider.js';
import type { CVData } from '../../../../types/cv-base.js';

describe('TemplateProvider', () => {
  const provider = new TemplateProvider();

  const testData: CVData = {
    personalInfo: {
      name: { full: 'Test User' },
      contact: {
        email: 'test@example.com',
        phone: '123-456-7890',
      },
    },
    experience: [
      {
        title: 'Developer',
        company: 'Tech Co',
        startDate: '2020-01',
        endDate: '2023-01',
        responsibilities: ['Coding'],
      },
    ],
    education: [
      {
        degree: 'BS',
        institution: 'University',
        year: '2020',
      },
    ],
    skills: ['JavaScript'],
    certifications: ['AWS'],
  };

  describe('BasicTemplate', () => {
    it('should generate complete markdown with all sections', () => {
      const template = new BasicTemplate();
      const markdown = template.generateMarkdown(testData);

      expect(markdown).toContain('Test User');
      expect(markdown).toContain('Professional Experience');
      expect(markdown).toContain('Education');
      expect(markdown).toContain('Skills');
    });

    it('should respect section inclusion options', () => {
      const template = new BasicTemplate();
      const markdown = template.generateMarkdown(testData, {
        includeEducation: false,
        includeSkills: false,
      });

      expect(markdown).not.toContain('## Education');
      expect(markdown).not.toContain('## Skills');
      expect(markdown).toContain('Professional Experience');
    });

    it('should provide CSS styles', () => {
      const template = new BasicTemplate();
      const styles = template.getStyles();

      expect(styles).toContain('font-family');
      expect(styles).toContain('@media print');
    });
  });

  describe('TemplateProvider', () => {
    it('should provide basic template by default', () => {
      const template = provider.getTemplate();
      expect(template).toBeInstanceOf(BasicTemplate);
    });

    it('should allow registering custom templates', () => {
      class CustomTemplate extends BasicTemplate {
        name = 'custom';
      }

      const customTemplate = new CustomTemplate();
      provider.registerTemplate(customTemplate);

      const template = provider.getTemplate('custom');
      expect(template).toBe(customTemplate);
    });

    it('should throw error for non-existent template', () => {
      expect(() => provider.getTemplate('non-existent')).toThrow(
        "Template 'non-existent' not found"
      );
    });
  });
});
