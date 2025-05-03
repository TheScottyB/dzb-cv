import type { PDFDocument } from 'pdf-lib';
import type { ElementMetrics, SectionMetrics } from './metrics-validation';
import { createPDFValidationError } from './validation-error';

interface TextContent {
  text: string;
  metrics: ElementMetrics;
}

interface DateFormat {
  pattern: RegExp;
  format: string;
}

interface CVElementRules {
  header: {
    name: {
      minHeight: number;
      maxHeight: number;
      emphasis: 'bold' | 'larger' | 'both';
    };
    contact: {
      spacing: number;
      alignment: 'left' | 'right' | 'center';
    };
  };
  sections: {
    experience: {
      titleStyle: 'bold' | 'underline' | 'both';
      dateAlignment: 'left' | 'right';
      companyEmphasis: boolean;
    };
    education: {
      degreeEmphasis: boolean;
      datePosition: 'inline' | 'right';
    };
    skills: {
      layout: 'list' | 'grid' | 'inline';
      grouping: boolean;
    };
  };
}

const templateRules: Record<string, CVElementRules> = {
  standard: {
    header: {
      name: {
        minHeight: 24,
        maxHeight: 36,
        emphasis: 'both'
      },
      contact: {
        spacing: 8,
        alignment: 'center'
      }
    },
    sections: {
      experience: {
        titleStyle: 'bold',
        dateAlignment: 'right',
        companyEmphasis: true
      },
      education: {
        degreeEmphasis: true,
        datePosition: 'right'
      },
      skills: {
        layout: 'grid',
        grouping: true
      }
    }
  },
  minimal: {
    header: {
      name: {
        minHeight: 20,
        maxHeight: 28,
        emphasis: 'larger'
      },
      contact: {
        spacing: 6,
        alignment: 'left'
      }
    },
    sections: {
      experience: {
        titleStyle: 'bold',
        dateAlignment: 'right',
        companyEmphasis: false
      },
      education: {
        degreeEmphasis: false,
        datePosition: 'inline'
      },
      skills: {
        layout: 'inline',
        grouping: false
      }
    }
  }
};

export class CVMetricsValidator {
  private rules: CVElementRules;
  private dateFormats: DateFormat[] = [
    { pattern: /^\d{4}-\d{2}$/, format: 'YYYY-MM' },
    { pattern: /^\d{4}$/, format: 'YYYY' },
    { pattern: /^\d{2}\/\d{4}$/, format: 'MM/YYYY' }
  ];

  constructor(template: keyof typeof templateRules = 'standard') {
    this.rules = templateRules[template];
  }
  async validateCV(doc: PDFDocument, sections: SectionMetrics[]): Promise<void> {
    await this.validateHeader(sections[0]);
    await this.validateExperienceSection(sections.find(s => s.title.text === 'Experience'));
    await this.validateEducationSection(sections.find(s => s.title.text === 'Education'));
    await this.validateSkillsSection(sections.find(s => s.title.text === 'Skills'));
  }

  private async validateHeader(header: SectionMetrics): Promise<void> {
    if (!header) {
      throw createPDFValidationError(
        'structure',
        'header',
        'Header section present',
        'Header section missing'
      );
    }

    const nameElement = header.content[0];
    if (nameElement.height < this.rules.header.name.minHeight ||
        nameElement.height > this.rules.header.name.maxHeight) {
      throw createPDFValidationError(
        'metrics',
        'header.name.height',
        `Between ${this.rules.header.name.minHeight} and ${this.rules.header.name.maxHeight}`,
        nameElement.height
      );
    }

    // Validate contact info alignment
    const contactElements = header.content.slice(1);
    const alignment = this.detectAlignment(contactElements);
    if (alignment !== this.rules.header.contact.alignment) {
      throw createPDFValidationError(
        'layout',
        'header.contact.alignment',
        this.rules.header.contact.alignment,
        alignment
      );
    }
  }

  private async validateExperienceSection(section?: SectionMetrics): Promise<void> {
    if (!section) return;

    for (const element of section.content) {
      if (element.font?.style === 'bold' !== this.rules.sections.experience.companyEmphasis) {
        throw createPDFValidationError(
          'style',
          'experience.company.emphasis',
          this.rules.sections.experience.companyEmphasis ? 'bold' : 'normal',
          element.font?.style || 'none'
        );
      }
    }
  }

  private async validateEducationSection(section?: SectionMetrics): Promise<void> {
    if (!section) return;

    const dateElements = section.content.filter(this.isDateElement);
    const dateAlignment = this.detectAlignment(dateElements);
    
    if (this.rules.sections.education.datePosition === 'right' && dateAlignment !== 'right') {
      throw createPDFValidationError(
        'layout',
        'education.dates.alignment',
        'right',
        dateAlignment
      );
    }
  }

  private async validateSkillsSection(section?: SectionMetrics): Promise<void> {
    if (!section) return;

    const layout = this.detectSkillsLayout(section.content);
    if (layout !== this.rules.sections.skills.layout) {
      throw createPDFValidationError(
        'layout',
        'skills.layout',
        this.rules.sections.skills.layout,
        layout
      );
    }
  }

  private async validateContentMatches(
    actualText: string,
    expectedText: string,
    options: {
      ignoreCase?: boolean;
      ignoreWhitespace?: boolean;
      partialMatch?: boolean;
    } = {}
  ): Promise<boolean> {
    let actual = actualText;
    let expected = expectedText;

    if (options.ignoreCase) {
      actual = actual.toLowerCase();
      expected = expected.toLowerCase();
    }

    if (options.ignoreWhitespace) {
      actual = actual.replace(/\s+/g, ' ').trim();
      expected = expected.replace(/\s+/g, ' ').trim();
    }

    return options.partialMatch ? 
      actual.includes(expected) : 
      actual === expected;
  }

  private async validateTextContent(
    element: ElementMetrics & { text?: string },
    expectedContent: string,
    field: string,
    options: {
      ignoreCase?: boolean;
      ignoreWhitespace?: boolean;
      partialMatch?: boolean;
    } = {}
  ): Promise<void> {
    if (!element.text) {
      throw createPDFValidationError(
        'content',
        field,
        expectedContent,
        'No text content found'
      );
    }

    const matches = await this.validateContentMatches(
      element.text,
      expectedContent,
      options
    );

    if (!matches) {
      throw createPDFValidationError(
        'content',
        field,
        expectedContent,
        element.text
      );
    }
  }

  // Add academic-specific validation
  private async validateAcademicElements(section?: SectionMetrics): Promise<void> {
    if (!section) return;

    // Validate publications format
    const publications = section.content.filter(el => 
      el.text?.includes('et al.') || (el.text?.includes('(') && el.text?.includes(')'))
    );

    for (const pub of publications) {
      const hasYear = this.isDateElement(pub);
      const hasAuthors = pub.text?.includes(',');
      
      if (!hasYear || !hasAuthors) {
        throw createPDFValidationError(
          'content',
          'academic.publication.format',
          'Author(s), Title (Year)',
          pub.text || 'Invalid publication format'
        );
      }
    }
  }

  // Add helper for common validation scenarios
  public static async validateCommonScenario(
    doc: PDFDocument,
    sections: SectionMetrics[],
    scenario: 'fullCV' | 'minimalCV' | 'academicCV'
  ): Promise<void> {
    const validator = new CVMetricsValidator(
      scenario === 'academicCV' ? 'academic' :
      scenario === 'minimalCV' ? 'minimal' : 'standard'
    );

    await validator.validateCV(doc, sections);

    if (scenario === 'academicCV') {
      await validator.validateAcademicElements(
        sections.find(s => s.title.text === 'Publications')
      );
    }

    // Add additional scenario-specific validations
    switch (scenario) {
      case 'fullCV':
        await validator.validateExperienceSection(
          sections.find(s => s.title.text === 'Experience')
        );
        await validator.validateEducationSection(
          sections.find(s => s.title.text === 'Education')
        );
        await validator.validateSkillsSection(
          sections.find(s => s.title.text === 'Skills')
        );
        break;
      
      case 'minimalCV':
        // Minimal CV might skip certain sections
        const requiredSections = ['Experience', 'Education'];
        for (const required of requiredSections) {
          const section = sections.find(s => s.title.text === required);
          if (!section) {
            throw createPDFValidationError(
              'structure',
              'required.sections',
              required,
              'Section missing'
            );
          }
        }
        break;
    }
  }

  private detectAlignment(elements: ElementMetrics[]): 'left' | 'right' | 'center' {
    if (elements.length === 0) return 'left';

    const leftEdges = elements.map(el => el.x);
    const rightEdges = elements.map(el => el.x + el.width);
    const pageWidth = Math.max(...rightEdges) + this.rules.header.contact.spacing;

    const leftAligned = leftEdges.every(x => Math.abs(x - leftEdges[0]) < 2);
    const rightAligned = rightEdges.every(x => Math.abs(x - rightEdges[0]) < 2);

    if (leftAligned && rightAligned) {
      // If both edges are aligned, it's likely centered
      const centerPoint = pageWidth / 2;
      const elementCenters = elements.map(el => el.x + (el.width / 2));
      const isCentered = elementCenters.every(x => Math.abs(x - centerPoint) < 10);
      
      return isCentered ? 'center' : 'left';
    }

    return rightAligned ? 'right' : 'left';
  }

  private detectSkillsLayout(elements: ElementMetrics[]): CVElementRules['sections']['skills']['layout'] {
    if (elements.length === 0) return 'list';

    // Calculate the layout pattern
    const verticalGaps = new Set();
    const horizontalGaps = new Set();

    for (let i = 0; i < elements.length - 1; i++) {
      const current = elements[i];
      const next = elements[i + 1];

      const verticalGap = next.y - (current.y + current.height);
      const horizontalGap = next.x - (current.x + current.width);

      if (verticalGap > 0) verticalGaps.add(verticalGap);
      if (horizontalGap > 0) horizontalGaps.add(horizontalGap);
    }

    // If we have consistent horizontal gaps and multiple items per row,
    // it's likely a grid
    if (horizontalGaps.size === 1 && horizontalGaps.values().next().value > 0) {
      return 'grid';
    }

    // If items are on the same line with consistent spacing,
    // it's likely inline
    if (verticalGaps.size === 0 && horizontalGaps.size === 1) {
      return 'inline';
    }

    // Default to list if we can't determine a clear pattern
    return 'list';
  }

  private isDateElement(element: ElementMetrics & { text?: string }): boolean {
    if (!element.text) return false;
    return this.dateFormats.some(format => format.pattern.test(element.text));
  }
}

// Separate test helpers into their own object
export const pdfTestHelpers = {
  async validatePDFScenario(
    doc: PDFDocument,
    sections: SectionMetrics[],
    scenario: 'fullCV' | 'minimalCV' | 'academicCV'
  ): Promise<void> {
    try {
      return await CVMetricsValidator.validateCommonScenario(doc, sections, scenario);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `PDF validation failed for ${scenario} scenario:\n${error.message}`
        );
      }
      throw error;
    }
  },

  expectValidPDFStructure(sections: SectionMetrics[]): void {
    const errors: string[] = [];

    if (!sections) errors.push('Sections not defined');
    if (sections?.length === 0) errors.push('No sections found');
    if (!sections?.[0]?.title) errors.push('First section has no title');
    if (sections?.[0]?.content.length === 0) errors.push('First section has no content');

    if (errors.length > 0) {
      throw new Error(`Invalid PDF structure:\n${errors.join('\n')}`);
    }
  },

  expectValidHeaderSection(header: SectionMetrics): void {
    const errors: string[] = [];

    if (!header.title.text) errors.push('Header title text not defined');
    if (header.content.length <= 1) errors.push('Header has insufficient content');
    if (header.content[0].height <= 0) errors.push('Header name has invalid height');

    if (errors.length > 0) {
      throw new Error(`Invalid header section:\n${errors.join('\n')}`);
    }
  },

  // Add helper for checking specific sections
  expectValidSection(
    section: SectionMetrics,
    requirements: {
      minContent?: number;
      requiredTexts?: string[];
      forbiddenTexts?: string[];
      dateFormat?: boolean;
    }
  ): void {
    const errors: string[] = [];

    if (requirements.minContent && section.content.length < requirements.minContent) {
      errors.push(`Section has insufficient content (min: ${requirements.minContent})`);
    }

    if (requirements.requiredTexts) {
      for (const text of requirements.requiredTexts) {
        if (!section.content.some(el => el.text?.includes(text))) {
          errors.push(`Required text "${text}" not found in section`);
        }
      }
    }

    if (requirements.forbiddenTexts) {
      for (const text of requirements.forbiddenTexts) {
        if (section.content.some(el => el.text?.includes(text))) {
          errors.push(`Forbidden text "${text}" found in section`);
        }
      }
    }

    if (requirements.dateFormat) {
      const hasValidDate = section.content.some(el => 
        /^\d{2}\/\d{4}$/.test(el.text || '') || 
        /^\d{4}-\d{2}$/.test(el.text || '') ||
        /^\d{4}$/.test(el.text || '')
      );
      if (!hasValidDate) {
        errors.push('No valid date format found in section');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Invalid section "${section.title.text}":\n${errors.join('\n')}`);
    }
  }
};

// Export standard validator instances
export const standardCVValidator = new CVMetricsValidator('standard');
export const minimalCVValidator = new CVMetricsValidator('minimal');
