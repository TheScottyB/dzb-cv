import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import { MatchResult } from './job-matcher';

interface PDFTheme {
  primaryColor: [number, number, number];
  secondaryColor: [number, number, number];
  font?: string;
  fontSize?: number;
  lineHeight?: number;
  accentColor?: [number, number, number];
}

interface PDFOptions {
  title?: string;
  subtitle?: string;
  theme?: PDFTheme;
  includeHeader?: boolean;
  includeFooter?: boolean;
}

export class PDFGenerator {
  private defaultTheme: PDFTheme = {
    primaryColor: [0, 0.5, 0.2], // Forest green
    secondaryColor: [0.2, 0.2, 0.2],
    fontSize: 12,
    lineHeight: 1.5,
    accentColor: [0.8, 0.2, 0.2],
  };

  private theme: PDFTheme = this.defaultTheme;
  private header: string = '';
  private footer: string = '';

  setTheme(theme: Partial<PDFTheme>): void {
    this.theme = { ...this.defaultTheme, ...theme };
  }

  setHeader(header: string): void {
    this.header = header;
  }

  setFooter(footer: string): void {
    this.footer = footer;
  }

  async generateFromMarkdown(
    markdown: string,
    _outputPath: string,
    _p0: {
      title: string;
      subtitle: string;
      theme: { primaryColor: number[]; secondaryColor: number[]; font: string };
      includeHeader: boolean;
      includeFooter: boolean;
    },
    options: PDFOptions = {}
  ): Promise<Uint8Array> {
    // Convert markdown to HTML
    const html = await marked(markdown);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Set up theme
    const theme = options.theme || this.theme;
    const primaryColor = rgb(...theme.primaryColor);
    const secondaryColor = rgb(...theme.secondaryColor);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add header if requested
    if (options.includeHeader) {
      page.drawText(options.title || this.header || 'Document', {
        x: 50,
        y: height - 50,
        size: 24,
        color: primaryColor,
        font,
      });

      if (options.subtitle) {
        page.drawText(options.subtitle, {
          x: 50,
          y: height - 80,
          size: 14,
          color: secondaryColor,
          font,
        });
      }
    }

    // Process HTML content
    const content = document.body.textContent || '';
    page.drawText(content, {
      x: 50,
      y: height - 120,
      size: theme.fontSize || 12,
      color: secondaryColor,
      font,
      maxWidth: width - 100,
    });

    // Add footer if requested
    if (options.includeFooter) {
      const footerText = this.footer || `Generated on ${new Date().toLocaleDateString()}`;
      page.drawText(footerText, {
        x: 50,
        y: 30,
        size: 10,
        color: secondaryColor,
        font,
      });
    }

    // Return PDF bytes
    return await pdfDoc.save();
  }

  async generateFromJobMatches(
    matches: MatchResult[],
    outputPath: string,
    options: {
      title: string;
      subtitle: string;
      theme: { primaryColor: number[]; secondaryColor: number[]; font: string };
      includeHeader: boolean;
      includeFooter: boolean;
    }
  ): Promise<Uint8Array> {
    const markdown = this.formatMatchesForPDF(matches);
    return await this.generateFromMarkdown(markdown, outputPath, options);
  }

  private formatMatchesForPDF(matches: MatchResult[]): string {
    const highMatches = matches.filter((m) => m.confidence === 'high');
    const mediumMatches = matches.filter((m) => m.confidence === 'medium');
    const lowMatches = matches.filter((m) => m.confidence === 'low');

    let markdown = '# Job Match Analysis\n\n';

    if (highMatches.length > 0) {
      markdown += '## Strong Matches\n\n';
      highMatches.forEach((match) => {
        markdown += `- **${match.requirement}**\n`;
        match.matches.forEach((m) => (markdown += `  - ${m}\n`));
        match.evidence.forEach((e) => (markdown += `  - Evidence: ${e}\n`));
        markdown += '\n';
      });
    }

    if (mediumMatches.length > 0) {
      markdown += '## Moderate Matches\n\n';
      mediumMatches.forEach((match) => {
        markdown += `- **${match.requirement}**\n`;
        match.matches.forEach((m) => (markdown += `  - ${m}\n`));
        match.evidence.forEach((e) => (markdown += `  - Evidence: ${e}\n`));
        markdown += '\n';
      });
    }

    if (lowMatches.length > 0) {
      markdown += '## Weak Matches\n\n';
      lowMatches.forEach((match) => {
        markdown += `- **${match.requirement}**\n`;
        match.matches.forEach((m) => (markdown += `  - ${m}\n`));
        match.evidence.forEach((e) => (markdown += `  - Evidence: ${e}\n`));
        markdown += '\n';
      });
    }

    return markdown;
  }
}
