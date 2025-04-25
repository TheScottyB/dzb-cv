import { CVData } from '../../../types/cv-base.js';
import { TemplateOptions } from '../../../types/cv-types.js';

export abstract class BaseTemplate {
  protected abstract name: string;

  protected abstract generateExperience(data: CVData, options?: TemplateOptions): string;

  protected abstract generateEducation(data: CVData, options?: TemplateOptions): string;

  protected abstract generateSkills(data: CVData, options?: TemplateOptions): string;

  protected abstract generatePublications(data: CVData, options?: TemplateOptions): string;

  protected abstract generateConferences(data: CVData, options?: TemplateOptions): string;

  protected abstract generateGrants(data: CVData, options?: TemplateOptions): string;

  protected abstract generateAwards(data: CVData, options?: TemplateOptions): string;

  public generate(data: CVData, options?: TemplateOptions): string {
    return `
${this.generateExperience(data, options)}

${this.generateEducation(data, options)}

${this.generateSkills(data, options)}

${this.generatePublications(data, options)}

${this.generateConferences(data, options)}

${this.generateGrants(data, options)}

${this.generateAwards(data, options)}
    `.trim();
  }
} 