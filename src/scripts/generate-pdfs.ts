import { MarkdownConverter } from '../utils/markdown-converter.js';
import { HTMLToPDFConverter } from '../utils/html-to-pdf.js';
import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs/promises';
import path from 'node:path';

async function generatePDFs(cvMdPath, coverMdPath, outputDir) {
  const markdownConverter = new MarkdownConverter();
  const htmlToPdf = new HTMLToPDFConverter();

  // Read markdown files
  const cvMarkdown = await fs.readFile(cvMdPath, 'utf-8');
  const coverLetterMarkdown = await fs.readFile(coverMdPath, 'utf-8');

  // Convert markdown to styled HTML
  const cvHtml = markdownConverter.convertToHTML(
    cvMarkdown,
    'Dawn Zurick Beilfuss',
    'Mental Health Technician Trainee',
  );
  const coverLetterHtml = markdownConverter.convertToHTML(
    coverLetterMarkdown,
    'Cover Letter',
    'Mental Health Technician Trainee',
  );

  // Save HTML for inspection
  await fs.writeFile(path.join(outputDir, 'cv.html'), cvHtml);
  await fs.writeFile(path.join(outputDir, 'cover-letter.html'), coverLetterHtml);

  // Convert HTML to PDF
  const cvPdfBytes = await htmlToPdf.convertToPDF(cvHtml);
  const coverLetterPdfBytes = await htmlToPdf.convertToPDF(coverLetterHtml);

  // Save PDFs
  await fs.writeFile(path.join(outputDir, 'cv.pdf'), cvPdfBytes);
  await fs.writeFile(path.join(outputDir, 'cover-letter.pdf'), coverLetterPdfBytes);

  // Check cover letter page count and warn if > 1
  const pdfDoc = await PDFDocument.load(coverLetterPdfBytes);
  if (pdfDoc.getPageCount() > 1) {
    console.warn(
      'Warning: Cover letter exceeds one page! Consider shortening the content or adjusting formatting.',
    );
  }

  console.log('PDFs and HTML files generated successfully!');
}

// Accept CLI arguments for file paths
const [, , cvMdPath, coverMdPath, outputDir] = process.argv;
if (!cvMdPath || !coverMdPath || !outputDir) {
  console.error(
    'Usage: pnpm tsx src/scripts/generate-pdfs.ts <cv.md> <cover-letter.md> <outputDir>',
  );
  process.exit(1);
}

generatePDFs(cvMdPath, coverMdPath, outputDir).catch(console.error);
