import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { CVData, PDFGenerationOptions } from '@dzb-cv/types';

export class PDFGenerator {
  private convertToNumber(value: string | number | undefined, defaultValue: number): number {
    if (typeof value === 'undefined') return defaultValue;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  async generate(data: CVData, options: PDFGenerationOptions = {}): Promise<Buffer> {
    const doc = await PDFDocument.create();
    const pageWidth = options.format === 'A4' ? 595.28 : 612;
    const pageHeight = options.format === 'A4' ? 841.89 : 792;
    
    const page = doc.addPage([pageWidth, pageHeight]);
    const { width, height } = page.getSize();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const defaultMargin = 50;
    const marginTop = this.convertToNumber(options.margin?.top, defaultMargin);
    const marginRight = this.convertToNumber(options.margin?.right, defaultMargin);
    const marginBottom = this.convertToNumber(options.margin?.bottom, defaultMargin);
    const marginLeft = this.convertToNumber(options.margin?.left, defaultMargin);

    let y = height - marginTop;
    const startX = marginLeft;

    // Add name
    page.drawText(data.personalInfo.name.full, {
      x: startX,
      y,
      font,
      size: 24,
      color: rgb(0, 0, 0)
    });

    y -= 30;

    // Add contact info
    const contactText = `${data.personalInfo.contact.email} | ${data.personalInfo.contact.phone}`;
    page.drawText(contactText, {
      x: startX,
      y,
      font,
      size: 12,
      color: rgb(0, 0, 0)
    });

    y -= 40;

    // Experience section
    page.drawText('Experience', {
      x: startX,
      y,
      font,
      size: 16,
      color: rgb(0, 0, 0)
    });

    y -= 20;

    for (const exp of data.experience) {
      page.drawText(`${exp.position} at ${exp.employer}`, {
        x: startX,
        y,
        font,
        size: 14,
        color: rgb(0, 0, 0)
      });

      y -= 20;

      page.drawText(`${exp.startDate} - ${exp.endDate || 'Present'}`, {
        x: startX,
        y,
        font,
        size: 12,
        color: rgb(0, 0, 0)
      });

      y -= 20;

      for (const responsibility of exp.responsibilities) {
        page.drawText(`• ${responsibility}`, {
          x: startX + 20,
          y,
          font,
          size: 12,
          color: rgb(0, 0, 0)
        });
        y -= 15;
      }

      y -= 10;
    }

    // Education section
    if (data.education.length > 0) {
      page.drawText('Education', {
        x: startX,
        y,
        font,
        size: 16,
        color: rgb(0, 0, 0)
      });

      y -= 20;

      for (const edu of data.education) {
        page.drawText(`${edu.degree} in ${edu.field}`, {
          x: startX,
          y,
          font,
          size: 14,
          color: rgb(0, 0, 0)
        });

        y -= 20;

        page.drawText(`${edu.institution}, ${edu.graduationDate}`, {
          x: startX,
          y,
          font,
          size: 12,
          color: rgb(0, 0, 0)
        });

        y -= 30;
      }
    }

    // Skills section
    if (data.skills.length > 0) {
      page.drawText('Skills', {
        x: startX,
        y,
        font,
        size: 16,
        color: rgb(0, 0, 0)
      });

      y -= 20;

      for (const skill of data.skills) {
        const skillText = skill.level ? `${skill.name} (${skill.level})` : skill.name;
        page.drawText(`• ${skillText}`, {
          x: startX + 20,
          y,
          font,
          size: 12,
          color: rgb(0, 0, 0)
        });
        y -= 15;
      }
    }

    // Convert to buffer
    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes);
  }
}
