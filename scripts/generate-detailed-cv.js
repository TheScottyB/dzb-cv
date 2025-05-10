import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { convertMarkdownToPdf } from './pdf-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateDetailedCoverLetter() {
  const inputPath =
    'job-postings/careers.mercyhealthsystem.org-39454/Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.md';
  const outputPath =
    'job-postings/careers.mercyhealthsystem.org-39454/Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.pdf';

  try {
    const markdown = fs.readFileSync(inputPath, 'utf8');
    await convertMarkdownToPdf(markdown, outputPath, {
      paperSize: 'Letter',
      margins: {
        top: 0.75,
        right: 0.75,
        bottom: 0.75,
        left: 0.75,
      },
      fontFamily: 'Georgia, serif',
      fontSize: 11,
      includeHeaderFooter: false,
    });
  } catch (error) {
    console.error('Error generating detailed cover letter:', error);
    process.exit(1);
  }
}

generateDetailedCoverLetter();
