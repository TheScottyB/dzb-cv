import { describe, it, expect, beforeEach } from 'vitest';
import { BasicTemplate } from '../basic-template.js';
import { TemplateProvider } from '../template-provider.js';
import type { CVData } from '@dzb-cv/core/types';

describe('TemplateProvider', () => {
  const provider = new TemplateProvider();

  const testData: CVData = {
    personalInfo: {
      name: { full: 'Test User' },
      contact: {
        email: 'test@example.com',
        phone: '123-456-7890'
      }
    },
    experience: [{
      title: 'Developer',
      company: 'Tech Co',
      startDate: '2020-01',
      endDate: '2023-01',
      responsibilities: ['Coding']
    }],
    education: [{
      degree: 'BS',
      institution: 'University',
      year: '2020'
    }],
    skills: ['JavaScript'],
    certifications: ['AWS']
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
        includeSkills: false
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
    let templateProvider: TemplateProvider;

    beforeEach(() => {
      // Create a fresh provider for each test to avoid test interference
      templateProvider = new TemplateProvider();
    });

    it('should initialize with BasicTemplate in constructor', () => {
      // Test that the provider is initialized with the BasicTemplate
      const templates = (templateProvider as any).templates;
      expect(templates.size).toBe(1);
      expect(templates.has('basic')).toBe(true);
      expect(templates.get('basic')).toBeInstanceOf(BasicTemplate);
    });

    it('should provide basic template by default', () => {
      const template = templateProvider.getTemplate();
      expect(template).toBeInstanceOf(BasicTemplate);
      expect(template.name).toBe('basic');
    });

    it('should return specific template when requested by name', () => {
      const template = templateProvider.getTemplate('basic');
      expect(template).toBeInstanceOf(BasicTemplate);
      expect(template.name).toBe('basic');
    });

    it('should allow registering custom templates', () => {
      class CustomTemplate extends BasicTemplate {
        name = 'custom';
      }

      const customTemplate = new CustomTemplate();
      templateProvider.registerTemplate(customTemplate);
      
      const template = templateProvider.getTemplate('custom');
      expect(template).toBe(customTemplate);
      expect(template.name).toBe('custom');
    });

    it('should override existing template when registering with same name', () => {
      class CustomBasicTemplate extends BasicTemplate {
        name = 'basic';
        // Some custom implementation details
      }

      const customBasic = new CustomBasicTemplate();
      templateProvider.registerTemplate(customBasic);
      
      const template = templateProvider.getTemplate('basic');
      expect(template).toBe(customBasic);
      expect(template).not.toBe(new BasicTemplate());
    });

    it('should throw error for non-existent template', () => {
      expect(() => templateProvider.getTemplate('non-existent'))
        .toThrow("Template 'non-existent' not found");
    });
    
    it('should not affect other providers when registering templates', () => {
      // Create a second provider to verify isolation
      const secondProvider = new TemplateProvider();
      
      class CustomTemplate extends BasicTemplate {
        name = 'custom';
      }
      
      templateProvider.registerTemplate(new CustomTemplate());
      
      // First provider should have the custom template
      expect(templateProvider.getTemplate('custom')).toBeInstanceOf(CustomTemplate);
      
      // Second provider should not have the custom template
      expect(() => secondProvider.getTemplate('custom')).toThrow();
    });
  });
});

