import { Document } from 'docx4js';
import { TextParser } from '../../types/parsers.js';

export class DOCXParser implements TextParser {
  async extractText(buffer: Buffer): Promise<string> {
    const doc = await Document.load(buffer);
    const textContent = await doc.getText();
    return textContent.trim();
  }
} 