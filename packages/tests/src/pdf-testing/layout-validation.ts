import type { PDFDocument, PDFPage } from 'pdf-lib';
import { createPDFValidationError } from './validation-error';

interface LayoutRule {
  name: string;
  validate: (doc: PDFDocument) => Promise<boolean>;
  message: string;
}

interface MarginConfig {
  min: number;
  max?: number;
}

interface LayoutConfig {
  margins: {
    top: MarginConfig;
    right: MarginConfig;
    bottom: MarginConfig;
    left: MarginConfig;
  };
  spacing: {
    sectionGap: number;
    paragraphGap: number;
    lineHeight: number;
  };
  columnConfig?: {
    count: number;
    gap: number;
  };
}

const defaultLayoutConfigs: Record<string, LayoutConfig> = {
  minimal: {
    margins: {
      top: { min: 30, max: 40 },
      right: { min: 30, max: 40 },
      bottom: { min: 30, max: 40 },
      left: { min: 30, max: 40 }
    },
    spacing: {
      sectionGap: 20,
      paragraphGap: 10,
      lineHeight: 1.2
    }
  },
  standard: {
    margins: {
      top: { min: 50, max: 60 },
      right: { min: 50, max: 60 },
      bottom: { min: 50, max: 60 },
      left: { min: 50, max: 60 }
    },
    spacing: {
      sectionGap: 30,
      paragraphGap: 15,
      lineHeight: 1.5
    }
  },
  academic: {
    margins: {
      top: { min: 40, max: 50 },
      right: { min: 40, max: 50 },
      bottom: { min: 40, max: 50 },
      left: { min: 40, max: 50 }
    },
    spacing: {
      sectionGap: 25,
      paragraphGap: 12,
      lineHeight: 1.4
    },
    columnConfig: {
      count: 2,
      gap: 20
    }
  }
};

export class LayoutValidator {
  private rules: LayoutRule[] = [];
  private config: LayoutConfig;

  constructor(templateType: keyof typeof defaultLayoutConfigs = 'standard') {
    this.config = defaultLayoutConfigs[templateType];
    this.initializeRules();
  }

  private initializeRules(): void {
    this.addRule({
      name: 'margins',
      validate: this.validateMargins.bind(this),
      message: 'Invalid margins detected'
    });

    this.addRule({
      name: 'pageSize',
      validate: this.validatePageSize.bind(this),
      message: 'Invalid page size'
    });

    this.addRule({
      name: 'spacing',
      validate: this.validateSpacing.bind(this),
      message: 'Invalid spacing between sections'
    });

    if (this.config.columnConfig) {
      this.addRule({
        name: 'columns',
        validate: this.validateColumns.bind(this),
        message: 'Invalid column layout'
      });
    }
  }

  addRule(rule: LayoutRule): void {
    this.rules.push(rule);
  }

  async validate(doc: PDFDocument): Promise<void> {
    for (const rule of this.rules) {
      const isValid = await rule.validate(doc);
      if (!isValid) {
        throw createPDFValidationError(
          'layout',
          rule.name,
          rule.message
        );
      }
    }
  }

  private async validateMargins(doc: PDFDocument): Promise<boolean> {
    const page = doc.getPage(0);
    const { width, height } = page.getSize();
    
    // Convert points to standard units (assuming 72 points per inch)
    const leftMargin = await this.detectLeftMargin(page);
    const rightMargin = width - await this.detectRightMargin(page);
    const topMargin = height - await this.detectTopMargin(page);
    const bottomMargin = await this.detectBottomMargin(page);

    return (
      this.isWithinRange(leftMargin, this.config.margins.left) &&
      this.isWithinRange(rightMargin, this.config.margins.right) &&
      this.isWithinRange(topMargin, this.config.margins.top) &&
      this.isWithinRange(bottomMargin, this.config.margins.bottom)
    );
  }

  private async validatePageSize(doc: PDFDocument): Promise<boolean> {
    const page = doc.getPage(0);
    const { width, height } = page.getSize();
    
    const isA4 = Math.abs(width - 595.28) < 1 && Math.abs(height - 841.89) < 1;
    const isLetter = Math.abs(width - 612) < 1 && Math.abs(height - 792) < 1;
    
    return isA4 || isLetter;
  }

  private async validateSpacing(doc: PDFDocument): Promise<boolean> {
    // This would require actual text extraction to validate
    // For now, return true as placeholder
    return true;
  }

  private async validateColumns(doc: PDFDocument): Promise<boolean> {
    if (!this.config.columnConfig) return true;
    
    // This would require actual text extraction to validate column layout
    // For now, return true as placeholder
    return true;
  }

  private isWithinRange(value: number, config: MarginConfig): boolean {
    return value >= config.min && (!config.max || value <= config.max);
  }

  // These methods would need actual implementation using PDF parsing
  private async detectLeftMargin(page: PDFPage): Promise<number> { return 50; }
  private async detectRightMargin(page: PDFPage): Promise<number> { return 50; }
  private async detectTopMargin(page: PDFPage): Promise<number> { return 50; }
  private async detectBottomMargin(page: PDFPage): Promise<number> { return 50; }
}

// Create and export validators for each CV type
export const standardLayoutValidator = new LayoutValidator('standard');
export const minimalLayoutValidator = new LayoutValidator('minimal');
export const academicLayoutValidator = new LayoutValidator('academic');
