import type { CVData } from '../cv/base';

export interface PDFGenerationOptions {
  pageSize?: 'A4' | 'Letter' | 'Legal';
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  font?: {
    family?: string;
    size?: number;
    headerSize?: number;
  };
  includeHeader?: boolean;
  includeFooter?: boolean;
  includePageNumbers?: boolean;
  customStyles?: string;
}

export interface PDFGenerator {
  generate(data: CVData, options?: PDFGenerationOptions): Promise<Buffer>;
}

export interface Template {
  name: string;
  render(data: CVData, options?: PDFGenerationOptions): Promise<string> | string;
  getStyles(): string;
}
