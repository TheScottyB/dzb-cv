import { promises as fs } from 'fs';
import type { DocumentParser, ParseResult } from './parsers/base-parser.js';
import type { ProfileService } from '../profile/profile-service.js';
import { MarkdownParser } from './parsers/markdown-parser.js';
import { DocxParser } from './parsers/docx-parser.js';
import { PdfParser } from './parsers/pdf-parser.js';

/**
 * Service for importing CV documents into profiles
 */
export class ImportService {
  private parsers: DocumentParser[];
  private profileService: ProfileService;

  constructor(profileService: ProfileService) {
    this.profileService = profileService;
    this.parsers = [new MarkdownParser(), new DocxParser(), new PdfParser()];
  }

  /**
   * Import a CV document and create a profile
   */
  async importDocument(
    filePath: string,
    owner: string,
    options: {
      format?: string;
      validateOnly?: boolean;
    } = {}
  ) {
    // Read the file
    const buffer = await fs.readFile(filePath);
    const content = buffer.toString('utf-8');

    // Find appropriate parser
    const parser = this.findParser(filePath, content, options.format);
    if (!parser) {
      throw new Error(`No parser found for file: ${filePath}`);
    }

    // Parse the document
    const result = await parser.parse(buffer);

    // If validation only, return the parse result
    if (options.validateOnly) {
      return result;
    }

    // Create profile from parsed data
    const profile = await this.profileService.createProfile(owner, result.data);

    return {
      profile,
      parseResult: result,
    };
  }

  /**
   * Find an appropriate parser for the document
   */
  private findParser(
    filePath: string,
    content: string,
    preferredFormat?: string
  ): DocumentParser | null {
    // If format specified, try to find exact match
    if (preferredFormat) {
      const parser = this.parsers.find(
        (p) => p.getFormat().toLowerCase() === preferredFormat.toLowerCase()
      );
      if (parser) return parser;
    }

    // Try to find parser that can handle the file
    return this.parsers.find((parser) => parser.canParse(filePath, content)) || null;
  }
}
