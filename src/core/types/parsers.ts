/**
 * Interface for text extraction parsers
 */
export interface TextParser {
  /**
   * Extracts text content from a buffer
   * @param buffer The file buffer to extract text from
   * @returns A promise that resolves to the extracted text
   */
  extractText(buffer: Buffer): Promise<string>;
}
