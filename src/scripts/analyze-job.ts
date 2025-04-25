import { readFile, writeFile } from 'fs/promises';
import { JobMatcher } from '../utils/job-matcher.js';
import { MarkdownConverter } from '../utils/markdown-converter.js';
import { HTMLToPDFConverter } from '../utils/html-to-pdf.js';

async function main() {
  try {
    // Read the job data
    const jobData = JSON.parse(
      await readFile('job-postings/mercy-health-37949/job-data.json', 'utf-8')
    );

    // Create job matcher and analyze requirements
    const matcher = new JobMatcher();
    const matches = matcher.matchRequirements(jobData);

    // Generate tailored content
    const content = matcher.generateTailoredContent(matches);

    // Convert markdown to styled HTML
    const markdownConverter = new MarkdownConverter({
      primaryColor: '#006633',  // Forest green
      accentColor: '#cc3333',   // Red
      fontSize: '14px',
      lineHeight: '1.6'
    });

    const html = markdownConverter.convertToHTML(
      content,
      `Tailored CV for ${jobData.title}`,
      `${jobData.company} - ${jobData.location.city}, ${jobData.location.state}`
    );

    // Save the HTML for inspection
    await writeFile('tailored-cv.html', html);
    console.log('Generated HTML preview: tailored-cv.html');

    // Convert HTML to PDF
    const pdfConverter = new HTMLToPDFConverter();
    const pdfBuffer = await pdfConverter.convertToPDF(html, {
      format: 'Letter',
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in'
      },
      printBackground: true,
      landscape: false,
      scale: 0,
      pageRanges: ''
    });

    // Save the PDF
    await writeFile('tailored-cv.pdf', pdfBuffer);
    console.log('Successfully generated tailored CV: tailored-cv.pdf');

    // Clean up
    await pdfConverter.close();

  } catch (error) {
    console.error('Error generating tailored CV:', error);
    process.exit(1);
  }
}

main(); 