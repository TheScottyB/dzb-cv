import * as pdfjs from 'pdfjs-dist';
import { TextParser } from '../../types/parsers.js';

export class PDFParser implements TextParser {
  async extractText(buffer: Buffer): Promise<string> {
    // Load the PDF document
    const doc = await pdfjs.getDocument({ data: buffer }).promise;
    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  }
} 