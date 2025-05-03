/**
 * Types related to PDF generation
 */

import { CVData } from './cv-base';

// PDF generation options
export interface PDFGenerationOptions {
  template?: string;
  filename?: string;
  outputDir?: string;
  format?: 'A4' | 'Letter' | 'Legal' | 'Tabloid';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
  scale?: number;
  printBackground?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  pageRanges?: string;
  includeMetadata?: boolean;
  attachments?: string[];
  optimize?: boolean;
  compress?: boolean;
  password?: string;
  customStyles?: string;
  customScripts?: string;
  watermark?: string;
  debug?: boolean;
}

// Template options
export interface TemplateOptions {
  showEducationFirst?: boolean;
  includeReferences?: boolean;
  condensed?: boolean;
  colorScheme?: string;
  font?: string;
  fontSize?: string;
  lineHeight?: string;
  hideContactInfo?: boolean;
  includeSummary?: boolean;
  includeDates?: boolean;
  includeLinkedin?: boolean;
  includeGithub?: boolean;
  customSections?: string[];
  customHeader?: string;
  customFooter?: string;
}

// Template interface
export interface CVTemplate {
  name: string;
  title?: string;
  description?: string;
  render(data: CVData, options?: TemplateOptions): Promise<string> | string;
  getStyles?(): string;
  renderHTML?(data: CVData, options?: TemplateOptions): Promise<string> | string;
  getPreview?(): string;
  getSample?(): CVData;
}

// Storage provider for PDFs
export interface PDFStorageProvider {
  savePDF(id: string, content: Buffer): Promise<void>;
  getPDF(id: string): Promise<Buffer | null>;
  deletePDF(id: string): Promise<boolean>;
  listPDFs(): Promise<string[]>;
}

// PDF generation service
export interface PDFGenerator {
  generatePDF(data: CVData, options?: PDFGenerationOptions): Promise<Buffer>;
  generateHTML(data: CVData, options?: PDFGenerationOptions): Promise<string>;
  getTemplateNames(): string[];
  setTemplate(templateName: string): void;
  getCurrentTemplate(): string;
}

