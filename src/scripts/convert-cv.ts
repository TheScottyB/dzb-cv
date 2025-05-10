import { readFile, writeFile } from 'fs/promises';
import { MarkdownConverter } from '../utils/markdown-converter.js';
import { HTMLToPDFConverter } from '../utils/html-to-pdf.js';

async function main() {
  try {
    // Read the markdown file
    const markdown = await readFile('cv.md', 'utf-8');

    // Convert markdown to styled HTML
    const markdownConverter = new MarkdownConverter({
      primaryColor: '#006633', // Forest green
      accentColor: '#cc3333', // Red
      fontSize: '14px',
      lineHeight: '1.6',
    });

    const html = markdownConverter.convertToHTML(
      markdown,
      'Dawn Zurick Beilfuss - Patient Access Supervisor',
      'Tailored CV'
    );

    // Save the HTML for inspection
    await writeFile('cv.html', html);
    console.log('Generated HTML preview: cv.html');

    // Convert HTML to PDF
    const pdfConverter = new HTMLToPDFConverter();
    const pdfBuffer = await pdfConverter.convertToPDF(html, {
      format: 'Letter',
      landscape: false,
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
      printBackground: true,
      scale: 1.0,
      pageRanges: '',
    });

    // Save the PDF
    await writeFile('cv.pdf', pdfBuffer);
    console.log('Successfully generated CV: cv.pdf');

    // Clean up
    await pdfConverter.close();
  } catch (error) {
    console.error('Error generating CV:', error);
    process.exit(1);
  }
}

main();
