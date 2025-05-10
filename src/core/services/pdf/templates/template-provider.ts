import type { CVData, CVTemplate, TemplateOptions } from '@dzb-cv/core/types';
import { BasicTemplate } from './basic-template.js';
/**
 * Factory for creating CV templates
 */
export class TemplateProvider {
  private templates: Map<string, CVTemplate> = new Map();

  constructor() {
    const basicTemplate = new BasicTemplate();
    this.templates.set(basicTemplate.name, basicTemplate);
  }

  getTemplate(name: string = 'basic'): CVTemplate {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template '${name}' not found`);
    }
    return template;
  }

  registerTemplate(template: CVTemplate): void {
    this.templates.set(template.name, template);
  }
}
