import { Tool } from '../types';
import { PDFParser } from '../../../core/services/pdf/parser';
import { DOCXParser } from '../../../core/services/docx/parser';
import { TXTParser } from '../../../core/services/txt/parser';

interface ExtractTextInput {
  fileBuffer: Buffer;
  mimeType: string;
  fileName: string;
}

interface ExtractTextOutput {
  extractedText: string;
  metadata: {
    fileType: string;
    fileName: string;
    fileSize: number;
    extractionDate: string;
    confidence: number;
  };
}

/**
 * Tool for extracting raw text from resume files (PDF, DOCX)
 */
export const extractTextTool: Tool<ExtractTextInput, ExtractTextOutput> = {
  name: 'extract_text',
  description: 'Extracts raw text content from PDF or DOCX resume files',
  parameters: {
    type: 'object',
    required: ['fileBuffer', 'mimeType', 'fileName'],
    properties: {
      fileBuffer: {
        type: 'object',
        description: 'Binary buffer of the resume file',
      },
      mimeType: {
        type: 'string',
        description: 'MIME type of the file (e.g. application/pdf)',
      },
      fileName: {
        type: 'string',
        description: 'Original filename of the resume',
      },
    },
  },
  async execute(input: ExtractTextInput): Promise<ExtractTextOutput> {
    let extractedText = '';
    let confidence = 0.9;

    switch (input.mimeType) {
      case 'application/pdf':
        const pdfParser = new PDFParser();
        extractedText = await pdfParser.extractText(input.fileBuffer);
        break;

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxParser = new DOCXParser();
        extractedText = await docxParser.extractText(input.fileBuffer);
        break;

      case 'text/plain':
        const txtParser = new TXTParser();
        extractedText = await txtParser.extractText(input.fileBuffer);
        break;

      default:
        throw new Error(`Unsupported file type: ${input.mimeType}`);
    }

    return {
      extractedText,
      metadata: {
        fileType: input.mimeType,
        fileName: input.fileName,
        fileSize: input.fileBuffer.length,
        extractionDate: new Date().toISOString(),
        confidence,
      },
    };
  },
};
