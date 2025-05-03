import { TextParser } from '../../types/parsers.js';

export class TXTParser implements TextParser {
  async extractText(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8').trim();
  }
} 