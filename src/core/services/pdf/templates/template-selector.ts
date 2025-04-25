import type { CVData } from '../../../types/cv-base.js';
import type { PDFOptions, TemplateOptions } from '../../../types/cv-generation.js';
import { TemplateProvider } from './template-provider.js';
import { BasicTemplate } from './template-provider.js';
import { MinimalTemplate } from './minimal-template.js';
import { FederalTemplate } from './federal-template.js';
import { AcademicTemplate } from './academic-template.js';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  suitableFor: string[];
  previewImage?: string;
}

/**
 * Template selector interface for managing and selecting CV templates
 */
export class TemplateSelector {
  private readonly provider: TemplateProvider;
  private readonly templates: Map<string, TemplateMetadata>;

  constructor() {
    this.provider = new TemplateProvider();
    this.templates = new Map();

    // Register all available templates
    this.registerTemplate(new BasicTemplate(), {
      id: 'basic',
      name: 'Basic CV',
      description: 'Clean and professional layout suitable for most industries',
      suitableFor: ['Industry', 'General']
    });

    this.registerTemplate(new MinimalTemplate(), {
      id: 'minimal',
      name: 'Minimal',
      description: 'Modern, minimalist design focusing on essential information',
      suitableFor: ['Technology', 'Creative', 'Startups']
    });

    this.registerTemplate(new FederalTemplate(), {
      id: 'federal',
      name: 'Federal Resume',
      description: 'Detailed format following US government guidelines',
      suitableFor: ['Government', 'Federal Positions', 'Military']
    });

    this.registerTemplate(new AcademicTemplate(), {
      id: 'academic',
      name: 'Academic CV',
      description: 'Comprehensive academic curriculum vitae',
      suitableFor: ['Academia', 'Research', 'Higher Education']
    });
  }

  /**
   * Register a new template with metadata
   */
  registerTemplate(template: any, metadata: TemplateMetadata): void {
    this.provider.registerTemplate(template);
    this.templates.set(metadata.id, metadata);
  }

  /**
   * Get available templates with metadata
   */
  getAvailableTemplates(): TemplateMetadata[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template metadata by ID
   */
  getTemplateMetadata(id: string): TemplateMetadata | undefined {
    return this.templates.get(id);
  }

  /**
   * Generate CV using specified template
   */
  async generateCV(
    data: CVData,
    templateId: string,
    options?: PDFOptions & { templateOptions?: TemplateOptions }
  ): Promise<Buffer> {
    const template = this.provider.getTemplate(templateId);
    const content = template.generateMarkdown(data, options?.templateOptions);
    const styles = template.getStyles();

    // Implementation would continue with PDF generation...
    return Buffer.from(''); // Placeholder
  }

  /**
   * Get template suggestions based on CV data
   */
  suggestTemplates(data: CVData): TemplateMetadata[] {
    const suggestions: TemplateMetadata[] = [];

    // Check for academic indicators
    const hasAcademicExperience = data.experience.some(exp => 
      exp.employment_type === 'academic' || 
      exp.employment_type === 'research' ||
      exp.employment_type === 'teaching'
    );

    // Check for government experience
    const hasGovernmentExperience = data.experience.some(exp =>
      exp.employment_type === 'government' ||
      exp.grade_level
    );

    if (hasAcademicExperience) {
      const academic = this.templates.get('academic');
      if (academic) suggestions.push(academic);
    }

    if (hasGovernmentExperience) {
      const federal = this.templates.get('federal');
      if (federal) suggestions.push(federal);
    }

    // Always include basic template as fallback
    const basic = this.templates.get('basic');
    if (basic && !suggestions.includes(basic)) {
      suggestions.push(basic);
    }

    return suggestions;
  }
}

