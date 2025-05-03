import type { PDFDocument } from 'pdf-lib';
import type { ElementMetrics, SectionMetrics } from './metrics-validation';
import { CVMetricsValidator } from './cv-metrics';
import { createPDFValidationError } from './validation-error';

interface AcademicCVRules extends CVElementRules {
  publications: {
    format: 'apa' | 'mla' | 'chicago';
    yearPosition: 'start' | 'end';
    authorStyle: 'full' | 'initial';
  };
  research: {
    grantLayout: 'table' | 'list';
    fundingFormat: boolean;
  };
  teaching: {
    courseLayout: 'chronological' | 'subject';
    includeEvaluations: boolean;
  };
}

export class AcademicCVMetricsValidator extends CVMetricsValidator {
  private academicRules: AcademicCVRules['publications' | 'research' | 'teaching'];

  constructor() {
    super('academic');
    this.academicRules = {
      publications: {
        format: 'apa',
        yearPosition: 'end',
        authorStyle: 'full'
      },
      research: {
        grantLayout: 'table',
        fundingFormat: true
      },
      teaching: {
        courseLayout: 'chronological',
        includeEvaluations: true
      }
    };
  }

  async validateCV(doc: PDFDocument, sections: SectionMetrics[]): Promise<void> {
    await super.validateCV(doc, sections);
    await this.validatePublicationsSection(sections.find(s => s.title.text === 'Publications'));
    await this.validateResearchSection(sections.find(s => s.title.text === 'Research'));
    await this.validateTeachingSection(sections.find(s => s.title.text === 'Teaching'));
  }

  private async validatePublicationsSection(section?: SectionMetrics): Promise<void> {
    if (!section) return;

    const publicationEntries = this.extractPublicationEntries(section.content);
    for (const entry of publicationEntries) {
      await this.validatePublicationFormat(entry);
    }
  }

  private extractPublicationEntries(elements: ElementMetrics[]): TextContent[] {
    // Group elements that belong to the same publication entry
    const entries: TextContent[] = [];
    let currentEntry: TextContent | null = null;

    for (const element of elements) {
      if (this.isNewPublicationEntry(element)) {
        if (currentEntry) entries.push(currentEntry);
        currentEntry = { text: element.text || '', metrics: element };
      } else if (currentEntry) {
        currentEntry.text += ' ' + (element.text || '');
        currentEntry.metrics = {
          ...currentEntry.metrics,
          width: Math.max(currentEntry.metrics.width, element.width),
          height: currentEntry.metrics.height + element.height
        };
      }
    }

    if (currentEntry) entries.push(currentEntry);
    return entries;
  }

  private isNewPublicationEntry(element: ElementMetrics & { text?: string }): boolean {
    // Detect start of new publication by author pattern or year
    return (
      element.text?.includes(',') && 
      (this.isDateElement(element) || /^[A-Z]/.test(element.text || ''))
    );
  }

  private async validatePublicationFormat(entry: TextContent): Promise<void> {
    const { text } = entry;

    // Check for required components based on format
    switch (this.academicRules.publications.format) {
      case 'apa':
        if (!this.validateAPAFormat(text)) {
          throw createPDFValidationError(
            'format',
            'publications.apa',
            'Author, A. A. (Year). Title. Journal, Vol(Issue), pp.',
            text
          );
        }
        break;
      case 'mla':
        if (!this.validateMLAFormat(text)) {
          throw createPDFValidationError(
            'format',
            'publications.mla',
            'Author. "Title." Journal, vol., no., Year, pp.',
            text
          );
        }
        break;
    }
  }

  private validateAPAFormat(text: string): boolean {
    // Basic APA format validation
    return (
      /[A-Z][a-z]+,\s+[A-Z]\.(\s+[A-Z]\.)*\s+\(\d{4}\)/.test(text) && // Author and year
      text.includes('.') && // Title end
      /Vol\.*\s*\d+/.test(text) // Volume
    );
  }

  private validateMLAFormat(text: string): boolean {
    // Basic MLA format validation
    return (
      /[A-Z][a-z]+,\s+[A-Z][a-z]+/.test(text) && // Author name
      /"[^"]+"/.test(text) && // Title in quotes
      /vol\.\s*\d+/.test(text) && // Volume
      /\d{4}/.test(text) // Year
    );
  }

  private async validateResearchSection(section?: SectionMetrics): Promise<void> {
    if (!section) return;

    // Validate grant information format
    const grantEntries = section.content.filter(el => 
      el.text?.includes('$') || this.isDateElement(el)
    );

    for (const grant of grantEntries) {
      if (this.academicRules.research.fundingFormat && !this.validateFundingFormat(grant.text || '')) {
        throw createPDFValidationError(
          'format',
          'research.funding',
          'Grant amount ($X,XXX), Period, Agency',
          grant.text || ''
        );
      }
    }
  }

  private validateFundingFormat(text: string): boolean {
    return (
      /\$\d{1,3}(,\d{3})*(\.\d{2})?/.test(text) && // Currency format
      /\d{4}(-\d{2,4})?/.test(text) // Date or period
    );
  }

  private async validateTeachingSection(section?: SectionMetrics): Promise<void> {
    if (!section) return;

    if (this.academicRules.teaching.includeEvaluations) {
      const hasEvaluations = section.content.some(el => 
        el.text?.toLowerCase().includes('evaluation') ||
        el.text?.includes('rating') ||
        /\d\.\d+\/5\.0/.test(el.text || '')
      );

      if (!hasEvaluations) {
        throw createPDFValidationError(
          'content',
          'teaching.evaluations',
          'Teaching evaluations or ratings',
          'No evaluation information found'
        );
      }
    }

    // Validate course listing format
    const courseEntries = section.content.filter(el => 
      /[A-Z]{2,4}\s*\d{3,4}/.test(el.text || '') // Course code pattern
    );

    if (courseEntries.length === 0) {
      throw createPDFValidationError(
        'content',
        'teaching.courses',
        'Course listings with codes',
        'No valid course entries found'
      );
    }
  }
}

export const academicCVValidator = new AcademicCVMetricsValidator();

