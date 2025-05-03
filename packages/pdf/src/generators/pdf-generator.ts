import { PDFDocument, StandardFonts } from 'pdf-lib';
import type { CVData, PDFGenerator, PDFGenerationOptions } from '@dzb-cv/types';

export class StandardPDFGenerator implements PDFGenerator {
  async generate(data: CVData, options: PDFGenerationOptions = {}): Promise<Buffer> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([options.pageSize === 'A4' ? 595.28 : 612, 841.89]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    
    // Set initial cursor position
    let y = page.getHeight() - (options.margins?.top ?? 50);
    const startX = options.margins?.left ?? 50;
    
    // Add name
    page.drawText(data.personalInfo.name.full, {
      x: startX,
      y,
      font,
      size: options.font?.headerSize ?? 24
    });
    y -= 30;

    // Add contact info
    if (data.personalInfo.contact) {
      const contact = data.personalInfo.contact;
      page.drawText(`${contact.email}${contact.phone ? ` | ${contact.phone}` : ''}`, {
        x: startX,
        y,
        font,
        size: options.font?.size ?? 12
      });
      y -= 20;
    }

    // Add other sections...
    // (Implementation continues with other sections)

    return Buffer.from(await doc.save());
  }
}
