import type { CVData } from '../../../types/cv-base.js';

/**
 * Result of parsing a CV document
 */
export interface ParseResult {
  data: CVData;
  metadata: {
    format: string;
    originalFile: string;
    parseDate: string;
    confidence: number;
  };
  warnings?: string[];
}

/**
 * Base interface for CV document parsers
 */
export interface DocumentParser {
  /**
   * Check if this parser can handle the given file
   */
  canParse(file: string, content: string): boolean;

  /**
   * Parse the document into CV data
   * @param content The document content as either a string or Buffer
   * @param options Optional parser-specific options
   */
  parse(content: string | Buffer, options?: Record<string, unknown>): Promise<ParseResult>;

  /**
   * Get the format name this parser handles
   */
  getFormat(): string;
}
