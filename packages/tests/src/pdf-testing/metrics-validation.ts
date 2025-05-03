import type { PDFDocument, PDFPage } from 'pdf-lib';
import { createPDFValidationError } from './validation-error';

interface FontMetrics {
  name: string;
  size: number;
  style?: 'normal' | 'bold' | 'italic' | 'bolditalic';
}

interface ElementMetrics {
  x: number;
  y: number;
  width: number;
  height: number;
  font?: FontMetrics;
}

interface SectionMetrics {
  title: ElementMetrics & { text?: string };
  content: ElementMetrics[];
  bounds: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export class MetricsValidator {
  private fontRules: Map<string, FontMetrics> = new Map([
    ['header', { name: 'Helvetica', size: 16, style: 'bold' }],
    ['sectionTitle', { name: 'Helvetica', size: 14, style: 'bold' }],
    ['bodyText', { name: 'Helvetica', size: 11, style: 'normal' }]
  ]);

  constructor(private template: 'standard' | 'minimal' | 'academic' = 'standard') {
    this.initializeFontRules();
  }

  private initializeFontRules(): void {
    if (this.template === 'academic') {
      this.fontRules.set('header', { name: 'Times-Roman', size: 16, style: 'bold' });
      this.fontRules.set('sectionTitle', { name: 'Times-Roman', size: 14, style: 'bold' });
      this.fontRules.set('bodyText', { name: 'Times-Roman', size: 12, style: 'normal' });
    } else if (this.template === 'minimal') {
      this.fontRules.set('header', { name: 'Helvetica', size: 14, style: 'bold' });
      this.fontRules.set('sectionTitle', { name: 'Helvetica', size: 12, style: 'bold' });
      this.fontRules.set('bodyText', { name: 'Helvetica', size: 10, style: 'normal' });
    }
  }

  async validateMetrics(doc: PDFDocument): Promise<void> {
    const page = doc.getPage(0);
    const sections = await this.extractSectionMetrics(page);

    await this.validateFonts(sections);
    await this.validateAlignment(sections);
    await this.validateSpacing(sections);
  }

  private async extractSectionMetrics(page: PDFPage): Promise<SectionMetrics[]> {
    // This would require actual PDF parsing implementation
    // Placeholder implementation
    return [];
  }

  private async validateFonts(sections: SectionMetrics[]): Promise<void> {
    for (const section of sections) {
      const titleRule = this.fontRules.get('sectionTitle');
      if (!this.fontMatches(section.title.font, titleRule)) {
        throw createPDFValidationError(
          'fonts',
          'section.title.font',
          `${titleRule?.name} ${titleRule?.size}pt`,
          `${section.title.font?.name} ${section.title.font?.size}pt`
        );
      }

      for (const element of section.content) {
        const bodyRule = this.fontRules.get('bodyText');
        if (!this.fontMatches(element.font, bodyRule)) {
          throw createPDFValidationError(
            'fonts',
            'section.content.font',
            `${bodyRule?.name} ${bodyRule?.size}pt`,
            `${element.font?.name} ${element.font?.size}pt`
          );
        }
      }
    }
  }
  private async validateAlignment(sections: SectionMetrics[]): Promise<void> {
    let previousBottom = 0;

    for (const section of sections) {
      // Check vertical alignment
      if (previousBottom > 0 && section.bounds.top - previousBottom < 20) {
        throw createPDFValidationError(
          'alignment',
          'section.spacing',
          'At least 20pt',
          `${section.bounds.top - previousBottom}pt`
        );
      }

      // Check horizontal alignment
      const leftEdge = section.bounds.left;
      for (const element of section.content) {
        if (Math.abs(element.x - leftEdge) > 1) {
          throw createPDFValidationError(
            'alignment',
            'content.horizontal.alignment',
            'Aligned with section edge',
            `Misalignment of ${element.x - leftEdge}pt`
          );
        }
      }

      previousBottom = section.bounds.bottom;
    }
  }

  private async validateSpacing(sections: SectionMetrics[]): Promise<void> {
    for (const section of sections) {
      const contentSpacing = this.calculateContentSpacing(section.content);
      const expectedSpacing = this.getExpectedLineSpacing();

      if (Math.abs(contentSpacing - expectedSpacing) > 1) {
        throw createPDFValidationError(
          'spacing',
          'line.spacing',
          `${expectedSpacing}pt`,
          `${contentSpacing}pt`
        );
      }
    }
  }

  private fontMatches(actual?: FontMetrics, expected?: FontMetrics): boolean {
    if (!actual || !expected) return false;
    return (
      actual.name === expected.name &&
      Math.abs(actual.size - expected.size) <= 0.1 &&
      (!expected.style || actual.style === expected.style)
    );
  }

  private calculateContentSpacing(elements: ElementMetrics[]): number {
    if (elements.length < 2) return 0;
    
    const spacings = elements
      .slice(1)
      .map((el, i) => el.y - elements[i].y);
    
    return spacings.reduce((a, b) => a + b, 0) / spacings.length;
  }

  private getExpectedLineSpacing(): number {
    switch (this.template) {
      case 'academic': return 14;
      case 'minimal': return 12;
      default: return 13;
    }
  }
}

export const standardMetricsValidator = new MetricsValidator('standard');
export const minimalMetricsValidator = new MetricsValidator('minimal');
export const academicMetricsValidator = new MetricsValidator('academic');

