export * from './cv/index.js';
export * from './pdf/index.js';

export interface Template {
  id: string;
  name: string;
  description: string;
  render(data: import('./cv/index.js').CVData, options?: import('./pdf/index.js').PDFGenerationOptions): string;
  getStyles(): string;
}
