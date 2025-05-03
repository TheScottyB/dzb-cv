import type { CVData, PDFGenerationOptions } from '@dzb-cv/types';
import type { PDFTestResult } from '../types';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createMockCVData } from '../factories';

export interface PDFFactoryOptions extends PDFGenerationOptions {
  preset?: 'minimal' | 'standard' | 'academic' | 'federal';
  style?: {
    font?: StandardFonts;
    fontSize?: number;
    lineHeight?: number;
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  };
}

export async function createTestPDF(
  data: CVData = createMockCVData(),
  options: PDFFactoryOptions = {}
): Promise<PDFTestResult> {
  const doc = await PDFDocument.create();
  const page = doc.addPage();
  
  // Set metadata
  doc.setTitle(`${data.personalInfo.name.full} - CV`);
  doc.setAuthor('DZB CV Generator');
  doc.setCreator('DZB CV Generator Test Suite');

  // Add basic content
  const { width, height } = page.getSize();
  const font = await doc.embedFont(options.style?.font || StandardFonts.Helvetica);
  const fontSize = options.style?.fontSize || 12;
  const lineHeight = options.style?.lineHeight || 1.5;

  let y = height - (options.style?.margins?.top || 50);
  
  // Add name
  page.drawText(data.personalInfo.name.full, {
    x: 50,
    y,
    font,
    size: fontSize * 1.5,
    color: rgb(0, 0, 0)
  });

  y -= lineHeight * fontSize;

  // Add contact info
  page.drawText(data.personalInfo.contact.email, {
    x: 50,
    y,
    font,
    size: fontSize,
    color: rgb(0, 0, 0)
  });

  const pdfBytes = await doc.save();
  
  return {
    buffer: Buffer.from(pdfBytes),
    metadata: {
      pageCount: doc.getPageCount(),
      format: options.format || 'A4',
      title: doc.getTitle()
    }
  };
}

export async function createPresetPDF(
  preset: PDFFactoryOptions['preset'] = 'standard',
  data?: CVData,
  options?: Partial<PDFFactoryOptions>
): Promise<PDFTestResult> {
  const presetOptions: Record<string, PDFFactoryOptions> = {
    minimal: {
      style: {
        font: StandardFonts.Helvetica,
        fontSize: 10,
        margins: { top: 30, right: 30, bottom: 30, left: 30 }
      }
    },
    standard: {
      style: {
        font: StandardFonts.TimesRoman,
        fontSize: 12,
        margins: { top: 50, right: 50, bottom: 50, left: 50 }
      }
    },
    academic: {
      style: {
        font: StandardFonts.TimesRoman,
        fontSize: 11,
        margins: { top: 40, right: 40, bottom: 40, left: 40 }
      }
    },
    federal: {
      style: {
        font: StandardFonts.Courier,
        fontSize: 12,
        margins: { top: 60, right: 60, bottom: 60, left: 60 }
      }
    }
  };

  return createTestPDF(
    data,
    { ...presetOptions[preset], ...options }
  );
}

