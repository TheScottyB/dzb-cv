import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-types.js';
import { BasicTemplate } from './template-provider.js';
import { MinimalTemplate } from './minimal-template.js';
import { FederalTemplate } from './federal-template.js';
import { AcademicTemplate } from './academic-template.js';

interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  suitableFor: string[];
}

// Interface for CV templates
interface Template {
  name: string;
  generateMarkdown(data: CVData, options?: TemplateOptions): string;
  getStyles(): string;
}

export class TemplateSelector {
  private templates: Map<string, Template> = new Map();
  private metadata: Map<string, TemplateMetadata> = new Map();

  constructor() {
    // Set up metadata first
    this.metadata.set('basic', {
      id: 'basic',
      name: 'Basic Resume',
      description: 'Clean, professional format suitable for most industries',
      suitableFor: ['General', 'Industry']
    });
    
    this.metadata.set('minimal', {
      id: 'minimal',
      name: 'Minimal Resume',
      description: 'Modern, minimalist design for technology and creative fields',
      suitableFor: ['Technology', 'Creative', 'Startup']
    });
    
    this.metadata.set('federal', {
      id: 'federal',
      name: 'Federal Resume',
      description: 'Detailed format following US government guidelines',
      suitableFor: ['Government', 'Federal Positions']
    });
    
    this.metadata.set('academic', {
      id: 'academic',
      name: 'Academic CV',
      description: 'Comprehensive curriculum vitae format for academic and research positions',
      suitableFor: ['Academia', 'Research', 'Higher Education']
    });

    // Register default templates
    const basic = new BasicTemplate();
    this.registerTemplate(basic);

    const minimal = new MinimalTemplate();
    this.registerTemplate(minimal);

    const federal = new FederalTemplate();
    this.registerTemplate(federal);

    const academic = new AcademicTemplate();
    this.registerTemplate(academic);
  }

  registerTemplate(template: Template): void {
    this.templates.set(template.name, template);
  }

  getTemplate(id: string): Template | undefined {
    // Try to get the template directly by name/id
    const template = this.templates.get(id);
    if (template) return template;
    
    // If not found directly, try to match by metadata id
    // This allows looking up templates by their metadata id (e.g., 'basic', 'minimal')
    for (const [name, template] of this.templates.entries()) {
      const metadata = this.metadata.get(name);
      if (metadata && metadata.id === id) {
        return template;
      }
    }
    
    return undefined;
  }
  
  getTemplateMetadata(id: string): TemplateMetadata | undefined {
    return this.metadata.get(id);
  }

  /**
   * Get a list of all registered templates
   */
  getAvailableTemplates(): Template[] {
    return Array.from(this.templates.values());
  }
  
  getTemplates(): Template[] {
    return this.getAvailableTemplates();
  }

  /**
   * Suggest templates based on CV data
   * @param data CV data to analyze
   * @returns List of suggested templates in order of relevance
   */
  suggestTemplates(data: CVData): Template[] {
    const suggestions: Template[] = [];
    const experienceTypes = this.analyzeExperience(data);

    // Basic template always included as fallback
    // Basic template always included as fallback
    const basic = this.templates.get('basic');
    if (basic) suggestions.push(basic);

    // Add academic template if academic experience is detected
    if (experienceTypes.hasAcademicExperience) {
      const academic = this.templates.get('academic');
      if (academic) suggestions.unshift(academic);
    }
    
    // Add federal template if government experience is detected
    if (experienceTypes.hasGovernmentExperience) {
      const federal = this.templates.get('federal');
      if (federal) suggestions.unshift(federal);
    }

    // Add minimal template for tech roles
    if (experienceTypes.hasTechExperience) {
      const minimal = this.templates.get('minimal');
      if (minimal) suggestions.push(minimal);
    }
    return suggestions;
  }

  /**
   * Analyze experience to determine appropriate template types
   * @param data CV data to analyze
   * @returns Object indicating presence of different types of experience
   */
  private analyzeExperience(data: CVData): { 
    hasTechExperience: boolean;
    hasAcademicExperience: boolean;
    hasGovernmentExperience: boolean;
  } {
    if (!data.experience?.length) {
      return {
        hasTechExperience: false,
        hasAcademicExperience: false,
        hasGovernmentExperience: false
      };
    }

    // Check for academic experience
    const hasAcademicExperience = data.experience.some(exp => {
      const testData = exp as any; // For test data access
      const position = (testData.title || exp.position || '').toLowerCase();
      const employer = (testData.company || exp.employer || '').toLowerCase();
      const employmentType = testData.employment_type || exp.employmentType;
      
      return position.includes('professor') || 
             position.includes('lecturer') || 
             position.includes('academic') || 
             position.includes('research') ||
             employer.includes('university') || 
             employer.includes('college') ||
             employer.includes('academia') ||
             employmentType === 'academic' ||
             employmentType === 'research' ||
             employmentType === 'teaching';
    });
    
    // Check for government experience
    const hasGovernmentExperience = data.experience.some(exp => {
      const testData = exp as any; // For test data access
      const position = (testData.title || exp.position || '').toLowerCase();
      const employer = (testData.company || exp.employer || '').toLowerCase();
      const employmentType = testData.employment_type || exp.employmentType;
      const gradeLevel = testData.grade_level || exp.gradeLevel;
      
      return position.includes('government') || 
             position.includes('federal') || 
             position.includes('policy') ||
             employer.includes('department') || 
             employer.includes('government') ||
             employer.includes('agency') ||
             employmentType === 'government' ||
             gradeLevel?.toLowerCase?.()?.startsWith('gs-');
    });
    // Check for tech experience
    const hasTechExperience = data.experience.some(exp => {
      const testData = exp as any; // For test data access
      const position = (testData.title || exp.position || '').toLowerCase();
      const employmentType = testData.employment_type || exp.employmentType;
      
      return position.includes('developer') || 
             position.includes('engineer') || 
             position.includes('software') ||
             employmentType === 'technology';
    });
    
    return {
      hasTechExperience,
      hasAcademicExperience,
      hasGovernmentExperience
    };
  }
}
