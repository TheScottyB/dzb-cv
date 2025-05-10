import type { CVData } from './cv.js';

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
  generate(_data: CVData, _options?: PDFGenerationOptions): Promise<Buffer>;
}

export interface Template {
  name: string;

  render(_data: CVData, _options?: PDFGenerationOptions): Promise<string> | string;
  getStyles(): string;
}
