export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
  includeHeaderFooter?: boolean;
}

export interface PDFGenerator {
  generate(data: import('../cv/index.js').CVData, options?: PDFGenerationOptions): Promise<Buffer>;
}

