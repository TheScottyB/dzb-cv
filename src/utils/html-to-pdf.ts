import puppeteer, { PDFMargin } from 'puppeteer';

interface PDFOptions {
  format: 'Letter' | 'Legal' | 'Tabloid' | 'A4' | 'A3';
  landscape: boolean;
  margin: PDFMargin;
  printBackground: boolean;
  scale: number;
  pageRanges: string;
}

const defaultOptions = {
  format: 'Letter' as const,
  landscape: false,
  margin: {
    top: '0.5in',
    right: '0.5in',
    bottom: '0.5in',
    left: '0.5in'
  },
  printBackground: true,
  scale: 1.0,
  pageRanges: '' // Empty string means all pages
} satisfies PDFOptions;

export class HTMLToPDFConverter {
  private browser: puppeteer.Browser | null = null;

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
    }
  }

  async convertToPDF(html: string, options: PDFOptions = defaultOptions): Promise<Buffer> {
    let page: puppeteer.Page | null = null;
    
    try {
      await this.init();
      
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      page = await this.browser.newPage();
      
      // Set viewport to ensure proper rendering
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1
      });

      // Set content with wait until option
      await page.setContent(html, {
        waitUntil: ['load', 'networkidle0']
      });

      // Wait a bit to ensure all content is rendered
      await page.waitForTimeout(1000);

      // Generate PDF with merged options
      const pdfOptions = {
        ...defaultOptions,
        ...options,
        margin: {
          ...defaultOptions.margin,
          ...options.margin
        }
      };

      const pdf = await page.pdf({
        format: pdfOptions.format,
        landscape: pdfOptions.landscape,
        margin: pdfOptions.margin,
        printBackground: pdfOptions.printBackground,
        scale: pdfOptions.scale,
        pageRanges: pdfOptions.pageRanges
      });

      return pdf;

    } catch (error) {
      console.error('Error converting HTML to PDF:', error);
      throw error;
    } finally {
      if (page) {
        await page.close().catch(console.error);
      }
      await this.close().catch(console.error);
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      } finally {
        this.browser = null;
      }
    }
  }
} 