import type { CVData, Experience } from './cv-base.js';

/**
 * Options for template customization and CV generation
 *
 * This interface defines all available options for customizing CV templates
 * and controlling the generation process.
 */
export interface TemplateOptions {
  /** Whether to include personal information section */
  includePersonalInfo?: boolean;
  /** Whether to include professional summary section */
  includeProfessionalSummary?: boolean;
  /** Whether to include experience section */
  includeExperience?: boolean;
  /** Whether to include skills section */
  includeSkills?: boolean;
  /** Whether to include education section */
  includeEducation?: boolean;
  /** Whether to include certifications section */
  includeCertifications?: boolean;
  /** Whether to include projects section */
  includeProjects?: boolean;
  /** Whether to include volunteer work section */
  includeVolunteerWork?: boolean;
  /** Whether to include awards section */
  includeAwards?: boolean;
  /** Whether to include affiliations section */
  includeAffiliations?: boolean;
  /** Filter function for experience entries */
  experienceFilter?: (exp: Experience) => boolean;
  /** Order of experience entries by title */
  experienceOrder?: string[];
  /** Custom styles to override template defaults */
  customStyles?: string;
  /** Custom header content */
  customHeader?: string;
  /** Custom footer content */
  customFooter?: string;
  /** Custom sections to include */
  customSections?: Array<{
    title: string;
    content: string;
  }>;
}

/**
 * Base template class interface
 */
export interface BaseTemplate {
  /** Template name */
  name: string;
  /** Get template styles */
  getStyles(): string;
  /** Generate header section */
  generateHeader(data: CVData, options?: TemplateOptions): string;
  /** Generate experience section */
  generateExperience(data: CVData, options?: TemplateOptions): string;
  /** Generate skills section */
  generateSkills(data: CVData, options?: TemplateOptions): string;
  /** Generate education section */
  generateEducation(data: CVData, options?: TemplateOptions): string;
  /** Generate certifications section */
  generateCertifications(data: CVData, options?: TemplateOptions): string;
  /** Generate projects section */
  generateProjects(data: CVData, options?: TemplateOptions): string;
}
