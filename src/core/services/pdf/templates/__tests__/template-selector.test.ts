import { describe, it, expect } from 'vitest';
import { TemplateSelector } from '../template-selector.js';
import type { CVData } from '../../../../types/cv-base.js';

describe('TemplateSelector', () => {
  const selector = new TemplateSelector();

  describe('template registration', () => {
    it('should have all default templates registered', () => {
      const templates = selector.getAvailableTemplates();

      expect(templates).toHaveLength(4);
      expect(templates.map((t) => t.id)).toEqual(['basic', 'minimal', 'federal', 'academic']);
    });

    it('should provide template metadata', () => {
      const academic = selector.getTemplateMetadata('academic');

      expect(academic).toBeDefined();
      expect(academic?.suitableFor).toContain('Academia');
      expect(academic?.description).toContain('curriculum vitae');
    });
  });

  describe('template suggestions', () => {
    it('should suggest academic template for academic experience', () => {
      const data: CVData = {
        personalInfo: {
          name: { full: 'Test' },
          contact: { email: 'test@test.com', phone: '123' },
        },
        experience: [
          {
            title: 'Professor',
            company: 'University',
            startDate: '2020',
            responsibilities: [],
            employment_type: 'academic',
          },
        ],
        education: [],
        skills: [],
        certifications: [],
      };

      const suggestions = selector.suggestTemplates(data);
      expect(suggestions.map((s) => s.id)).toContain('academic');
    });

    it('should suggest federal template for government experience', () => {
      const data: CVData = {
        personalInfo: {
          name: { full: 'Test' },
          contact: { email: 'test@test.com', phone: '123' },
        },
        experience: [
          {
            title: 'Analyst',
            company: 'Department of State',
            startDate: '2020',
            responsibilities: [],
            employment_type: 'government',
            grade_level: 'GS-13',
          },
        ],
        education: [],
        skills: [],
        certifications: [],
      };

      const suggestions = selector.suggestTemplates(data);
      expect(suggestions.map((s) => s.id)).toContain('federal');
    });

    it('should always include basic template as fallback', () => {
      const data: CVData = {
        personalInfo: {
          name: { full: 'Test' },
          contact: { email: 'test@test.com', phone: '123' },
        },
        experience: [],
        education: [],
        skills: [],
        certifications: [],
      };

      const suggestions = selector.suggestTemplates(data);
      expect(suggestions.map((s) => s.id)).toContain('basic');
    });
  });
});
