import { BaseTemplate } from './base-template.js';
import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-types.js';

export class BasicTemplate extends BaseTemplate {
  id = 'basic';
  name = 'basic';

  protected generateExperience(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generateEducation(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generateSkills(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generatePublications(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generateConferences(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generateGrants(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generateAwards(data: CVData, options?: TemplateOptions): string {
    return '';
  }
}
