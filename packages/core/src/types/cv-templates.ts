import type { CVData } from './cv-base';

export interface TemplateOptions {
  includeHeaderFooter?: boolean;
  headerText?: string;
  footerText?: string;
  paperSize?: 'Letter' | 'A4' | 'Legal';
  margins?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  pdfTitle?: string;
  pdfAuthor?: string;
  orientation?: 'portrait' | 'landscape';
  fontFamily?: string;
}

export interface CVTemplate {
  name: string;
  getStyles(): string;
  generate(data: CVData, options?: TemplateOptions): string;
  generateHeader(data: CVData, options?: TemplateOptions): string;
}

export abstract class BaseTemplate implements CVTemplate {
  abstract name: string;
  abstract getStyles(): string;
  abstract generate(data: CVData, options?: TemplateOptions): string;
  protected abstract generateHeader(data: CVData, options?: TemplateOptions): string;
}

/**
 * Template system type definitions
 */
import type { CVData } from './cv-base.js';

export interface TemplateOptions {
  name: string;
  format: 'pdf' | 'docx' | 'html' | 'md';
  version?: string;
  style?: {
    font?: string;
    fontSize?: number;
    spacing?: number;
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  };
  sections?: {
    order: string[];
    hide?: string[];
    custom?: Record<string, unknown>;
  };
  header?: {
    includePhoto?: boolean;
    style?: 'minimal' | 'standard' | 'detailed';
  };
  footer?: {
    includePageNumbers?: boolean;
    customText?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface TemplateContext {
  data: CVData;
  options: TemplateOptions;
  helpers?: Record<string, Function>;
  partials?: Record<string, string>;
}

export interface TemplateResult {
  content: Buffer;
  metadata: {
    format: string;
    timestamp: string;
    template: string;
    pageCount?: number;
    fileSize?: number;
  };
  warnings?: string[];
}

