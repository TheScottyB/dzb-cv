import { CVData } from '../../../types/cv-base.js';
import { TemplateOptions } from '../../../types/template.js';

export abstract class BaseTemplate {
  protected abstract name: string;

  /**
   * Generate personal information section
   */
  protected abstract generatePersonalInfo(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate experience section
   */
  protected abstract generateExperience(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate education section
   */
  protected abstract generateEducation(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate skills section
   */
  protected abstract generateSkills(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate projects section
   */
  protected abstract generateProjects(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate publications section
   */
  protected abstract generatePublications(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate certifications section
   */
  protected abstract generateCertifications(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate languages section
   */
  protected abstract generateLanguages(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate volunteer work section
   */
  protected abstract generateVolunteer(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate awards section
   */
  protected abstract generateAwards(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate references section
   */
  protected abstract generateReferences(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate conferences section
   */
  protected abstract generateConferences(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate grants section
   */
  protected abstract generateGrants(data: CVData, options?: TemplateOptions): string;

  /**
   * Generate the complete CV in markdown format
   */
  public generateMarkdown(data: CVData, options: TemplateOptions = {}): string {
    const sections: string[] = [];

    // Add sections based on template options
    if (options.includePersonalInfo ?? true) {
      sections.push(this.generatePersonalInfo(data, options));
    }

    if (options.includeExperience ?? true) {
      sections.push(this.generateExperience(data, options));
    }

    if (options.includeEducation ?? true) {
      sections.push(this.generateEducation(data, options));
    }

    if (options.includeSkills ?? true) {
      sections.push(this.generateSkills(data, options));
    }

    if (options.includeProjects ?? true) {
      sections.push(this.generateProjects(data, options));
    }

    if (options.includePublications ?? true) {
      sections.push(this.generatePublications(data, options));
    }

    if (options.includeCertifications ?? true) {
      sections.push(this.generateCertifications(data, options));
    }

    if (options.includeLanguages ?? true) {
      sections.push(this.generateLanguages(data, options));
    }

    if (options.includeVolunteer ?? true) {
      sections.push(this.generateVolunteer(data, options));
    }

    if (options.includeAwards ?? true) {
      sections.push(this.generateAwards(data, options));
    }

    if (options.includeReferences ?? true) {
      sections.push(this.generateReferences(data, options));
    }

    // Academic-specific sections that are conditionally included based on data
    if (data.publications?.length) {
      sections.push(this.generateConferences(data, options));
      sections.push(this.generateGrants(data, options));
    }

    return sections.filter(Boolean).join('\n\n').trim();
  }
}
