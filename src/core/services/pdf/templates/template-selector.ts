import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-types.js';
import type { PDFOptions } from '../../../types/cv-generation.js';
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
      description: 'Comprehensive format for academic and research positions',
      suitableFor: ['Academia', 'Research', 'Education']
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
    // TODO: Implement PDF generation using markdown and styles
    return Buffer.from(template.generateMarkdown(data, options?.templateOptions));
  }

  /**
   * Get template suggestions based on CV data
   */
  suggestTemplates(data: CVData): TemplateMetadata[] {
    const suggestions: TemplateMetadata[] = [];

    // Check for academic experience
    const hasAcademicExperience = data.experience.some(exp => 
      exp.employmentType === 'academic' || 
      exp.employmentType === 'research' || 
      exp.employmentType === 'teaching'
    );

    // Check for government experience
    const hasGovernmentExperience = data.experience.some(exp => 
      exp.employmentType === 'government' || 
      exp.gradeLevel
    );

    if (hasAcademicExperience) {
      const academic = this.templates.get('academic');
      if (academic) suggestions.push(academic);
    }

    if (hasGovernmentExperience) {
      const federal = this.templates.get('federal');
      if (federal) suggestions.push(federal);
    }

    // Always suggest basic and minimal templates
    const basic = this.templates.get('basic');
    const minimal = this.templates.get('minimal');
    if (basic) suggestions.push(basic);
    if (minimal) suggestions.push(minimal);

    return suggestions;
  }
}

