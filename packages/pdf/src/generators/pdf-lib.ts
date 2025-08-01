import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { CVData, PDFGenerationOptions } from '@dzb-cv/types';
import type { PDFGenerator } from './interface.js';

/**
 * Light-weight PDF generator using pdf-lib
 * @class PdfLibGenerator
 * @implements {PDFGenerator}
 */
export class PdfLibGenerator implements PDFGenerator {
  private convertToNumber(value: string | number | undefined, defaultValue: number): number {
    if (typeof value === 'undefined') return defaultValue;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  async generate(data: CVData, options: PDFGenerationOptions = {}): Promise<Buffer> {
    const doc = await PDFDocument.create();
    const pageWidth = options.format?.toUpperCase() === 'A4' ? 595.28 : 612;
    const pageHeight = options.format?.toUpperCase() === 'A4' ? 841.89 : 792;

    const page = doc.addPage([pageWidth, pageHeight]);
    const { height } = page.getSize();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    
    // Adjust margins and font sizes for single-page layout
    const defaultMargin = options.singlePage ? 30 : 50;
    const marginTop = this.convertToNumber(options.margin?.top, defaultMargin);
    const marginLeft = this.convertToNumber(options.margin?.left, defaultMargin);
    const marginBottom = this.convertToNumber(options.margin?.bottom, defaultMargin);
    
    let y = height - marginTop;
    const startX = marginLeft;
    const availableHeight = height - marginTop - marginBottom;
    
    // Calculate content scaling for single-page layout
    const contentInfo = this.calculateContentDimensions(data, options);
    const scale = options.singlePage ? 
      this.calculateSinglePageScale(contentInfo, availableHeight, options) : 1;
    
    // Apply scaling to font sizes
    const baseFontSize = options.singlePage ? 10 : 12;
    const titleSize = Math.max((options.singlePage ? 16 : 24) * scale, 14);
    const headerSize = Math.max((options.singlePage ? 12 : 16) * scale, 10);
    const bodySize = Math.max(baseFontSize * scale, options.minFontSize || 8);

    // Set metadata if provided
    if (options.metadata) {
      doc.setTitle(options.metadata.title || `${data.personalInfo.name.full} - CV`);
      doc.setAuthor(options.metadata.author || data.personalInfo.name.full);
      doc.setSubject(options.metadata.subject || 'Curriculum Vitae');
      doc.setKeywords(options.metadata.keywords || ['CV', 'resume']);
    }
    // Add name with scaled font size
    page.drawText(data.personalInfo.name.full, {
      x: startX,
      y,
      font,
      size: titleSize,
      color: rgb(0, 0, 0),
    });

    y -= options.singlePage ? 20 : 30;

    // Add contact info
    const contactText = `${data.personalInfo.contact.email} | ${data.personalInfo.contact.phone}`;
    page.drawText(contactText, {
      x: startX,
      y,
      font,
      size: bodySize,
      color: rgb(0, 0, 0),
    });

    y -= options.singlePage ? 25 : 40;

    // Experience section
    page.drawText('Experience', {
      x: startX,
      y,
      font,
      size: headerSize,
      color: rgb(0, 0, 0),
    });

    y -= options.singlePage ? 15 : 20;

    for (const exp of data.experience) {
      // Check if we have enough space, if not and single-page is enabled, compress more
      if (options.singlePage && y < marginBottom + 50) {
        const remainingItems = data.experience.length + data.education.length + data.skills.length;
        if (remainingItems > 0) {
          // Switch to more compact rendering
          y = this.renderCompactExperience(page, data.experience, startX, y, font, bodySize * 0.9, marginBottom);
          break;
        }
      }

      page.drawText(`${exp.position} at ${exp.employer}`, {
        x: startX,
        y,
        font,
        size: bodySize + 1,
        color: rgb(0, 0, 0),
      });

      y -= options.singlePage ? 12 : 20;

      page.drawText(`${exp.startDate} - ${exp.endDate || 'Present'}`, {
        x: startX,
        y,
        font,
        size: bodySize - 1,
        color: rgb(0, 0, 0),
      });

      y -= options.singlePage ? 12 : 20;

      for (const responsibility of exp.responsibilities) {
        if (options.singlePage && y < marginBottom + 30) break; // Stop if running out of space
        page.drawText(`• ${responsibility}`, {
          x: startX + 15,
          y,
          font,
          size: bodySize,
          color: rgb(0, 0, 0),
        });
        y -= options.singlePage ? 10 : 15;
      }

      y -= options.singlePage ? 8 : 10;
    }

    // Education section
    if (data.education.length > 0 && y > marginBottom + 40) {
      page.drawText('Education', {
        x: startX,
        y,
        font,
        size: headerSize,
        color: rgb(0, 0, 0),
      });

      y -= options.singlePage ? 15 : 20;

      for (const edu of data.education) {
        if (options.singlePage && y < marginBottom + 30) break;
        page.drawText(`${edu.degree} in ${edu.field}`, {
          x: startX,
          y,
          font,
          size: bodySize + 1,
          color: rgb(0, 0, 0),
        });

        y -= options.singlePage ? 12 : 20;

        page.drawText(`${edu.institution}, ${edu.graduationDate}`, {
          x: startX,
          y,
          font,
          size: bodySize,
          color: rgb(0, 0, 0),
        });

        y -= options.singlePage ? 15 : 30;
      }
    }

    // Skills section
    if (data.skills.length > 0 && y > marginBottom + 30) {
      page.drawText('Skills', {
        x: startX,
        y,
        font,
        size: headerSize,
        color: rgb(0, 0, 0),
      });

      y -= options.singlePage ? 15 : 20;

      for (const skill of data.skills) {
        if (options.singlePage && y < marginBottom + 15) break;
        const skillText = skill.level ? `${skill.name} (${skill.level})` : skill.name;
        page.drawText(`• ${skillText}`, {
          x: startX + 15,
          y,
          font,
          size: bodySize,
          color: rgb(0, 0, 0),
        });
        y -= options.singlePage ? 10 : 15;
      }
    }

    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Calculate approximate content dimensions for layout planning
   */
  private calculateContentDimensions(data: CVData, options: PDFGenerationOptions): {
    estimatedHeight: number;
    sections: number;
    totalItems: number;
  } {
    const baseLineHeight = options.singlePage ? 12 : 18;
    const headerHeight = options.singlePage ? 20 : 30;
    
    let estimatedHeight = 100; // Header and contact info
    let sections = 0;
    let totalItems = 0;

    // Experience section
    if (data.experience.length > 0) {
      sections++;
      estimatedHeight += headerHeight; // Section header
      for (const exp of data.experience) {
        totalItems++;
        estimatedHeight += 40; // Job title + dates
        estimatedHeight += exp.responsibilities.length * baseLineHeight;
      }
    }

    // Education section
    if (data.education.length > 0) {
      sections++;
      estimatedHeight += headerHeight;
      estimatedHeight += data.education.length * 50;
      totalItems += data.education.length;
    }

    // Skills section
    if (data.skills.length > 0) {
      sections++;
      estimatedHeight += headerHeight;
      estimatedHeight += data.skills.length * baseLineHeight;
      totalItems += data.skills.length;
    }

    return { estimatedHeight, sections, totalItems };
  }

  /**
   * Calculate appropriate scale factor for single-page layout
   */
  private calculateSinglePageScale(
    contentInfo: { estimatedHeight: number; sections: number; totalItems: number },
    availableHeight: number,
    options: PDFGenerationOptions
  ): number {
    if (contentInfo.estimatedHeight <= availableHeight) {
      return options.scale || 1; // Content fits, use requested scale or 1
    }

    // Calculate compression needed
    const compressionRatio = availableHeight / contentInfo.estimatedHeight;
    return Math.max(compressionRatio * 0.9, 0.6); // Leave 10% buffer, minimum 60% scale
  }

  /**
   * Render experience section in compact mode when space is limited
   */
  private renderCompactExperience(
    page: any,
    experiences: any[],
    startX: number,
    currentY: number,
    font: any,
    fontSize: number,
    marginBottom: number
  ): number {
    let y = currentY;
    const compactSpacing = 8;
    
    for (const exp of experiences) {
      if (y < marginBottom + 20) break;
      
      // Compact job title and company
      page.drawText(`${exp.position} - ${exp.employer} (${exp.startDate}-${exp.endDate || 'Present'})`, {
        x: startX,
        y,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      
      y -= compactSpacing + 2;
      
      // Only show first 2-3 responsibilities in compact mode
      const maxResponsibilities = Math.min(exp.responsibilities.length, 3);
      for (let i = 0; i < maxResponsibilities; i++) {
        if (y < marginBottom + 15) break;
        page.drawText(`• ${exp.responsibilities[i]}`, {
          x: startX + 10,
          y,
          font,
          size: fontSize - 1,
          color: rgb(0, 0, 0),
        });
        y -= compactSpacing;
      }
      
      y -= 5; // Small gap between jobs
    }
    
    return y;
  }
}
