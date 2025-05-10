import { MLResumeParser, ParsedResume } from '../../src/ats/ml-parser.js';

/**
 * Tool: parse_resume
 * Description: Parses a resume buffer into structured resume data using MLResumeParser.
 *
 * Input: { buffer: Buffer, mimeType: string }
 * Output: ParsedResume (see src/ats/ml-parser.ts)
 */
export const parseResumeTool = {
  name: 'parse_resume',
  description:
    'Parses a resume file buffer and MIME type into structured resume data using MLResumeParser.',
  /**
   * @param input - Resume file buffer and mimeType
   * @returns Structured parsed resume data (ParsedResume)
   * @throws If parsing fails
   */
  async run(input: { buffer: Buffer; mimeType: string }): Promise<ParsedResume> {
    const parser = new MLResumeParser();
    return await parser.parseResume(input.buffer, input.mimeType);
  },
};
