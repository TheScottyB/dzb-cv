import type { CVData, PDFGenerationOptions } from '@dzb-cv/common';

/**
 * Base class for all CV templates
 * Defines the common interface and shared functionality
 */
export abstract class BaseTemplate {
  abstract id: string;
  abstract name: string;
  abstract generateMarkdown(data: CVData, options?: PDFGenerationOptions): string;

  // Template generation methods that can be overridden
  protected abstract generateHeader(data: CVData, options?: PDFGenerationOptions): string;
  protected abstract generateExperience(data: CVData, options?: PDFGenerationOptions): string;
  protected abstract generateEducation(data: CVData, options?: PDFGenerationOptions): string;
  protected abstract generateSkills(data: CVData, options?: PDFGenerationOptions): string;
  protected abstract generatePublications(data: CVData, options?: PDFGenerationOptions): string;
  protected abstract generateConferences(data: CVData, options?: PDFGenerationOptions): string;
  protected abstract generateGrants(data: CVData, options?: PDFGenerationOptions): string;
  protected abstract generateAwards(data: CVData, options?: PDFGenerationOptions): string;

  /**
   * Get custom styles for the template
   */
  getStyles(): string {
    return '';
  }

  /**
   * Render the full CV content
   */
  render(data: CVData, options?: PDFGenerationOptions): string {
    if (!this.validate(data)) {
      throw new Error('Invalid CV data: Required fields are missing');
    }

    return `
${this.generateHeader(data, options)}

${this.generateExperience(data, options)}

${this.generateEducation(data, options)}

${this.generateSkills(data, options)}

${this.generatePublications(data, options)}

${this.generateConferences(data, options)}

${this.generateGrants(data, options)}

${this.generateAwards(data, options)}
    `.trim();
  }

  /**
   * Check if data is ready for rendering
   */
  protected validate(data: CVData): boolean {
    return !!(
      data &&
      data.personalInfo?.name?.full &&
      data.experience?.length &&
      data.education?.length
    );
  }

  /**
   * Safe accessor for optional arrays
   */
  protected safeArray<T>(arr: T[] | undefined): T[] {
    return arr || [];
  }

  /**
   * Safe accessor for optional strings
   */
  protected safeString(str: string | undefined, defaultValue = ''): string {
    return str || defaultValue;
  }
}
