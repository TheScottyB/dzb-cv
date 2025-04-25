import { PDFGenerator } from '../utils/pdf-generator.js';
import fs from 'node:fs/promises';
import path from 'node:path';

async function generatePDFs() {
  const generator = new PDFGenerator();

  // Set theme
  generator.setTheme({
    primaryColor: [0, 0.3, 0.6], // Professional blue
    secondaryColor: [0.2, 0.2, 0.2], // Dark gray
    fontSize: 11,
    lineHeight: 1.4,
    accentColor: [0.6, 0, 0] // Dark red
  });

  // Read markdown files
  const cvMarkdown = await fs.readFile(
    path.join(process.cwd(), 'job-postings/mercy-health-37949/cv-draft.md'),
    'utf-8'
  );
  const coverLetterMarkdown = await fs.readFile(
    path.join(process.cwd(), 'job-postings/mercy-health-37949/cover-letter.md'),
    'utf-8'
  );

  // Generate CV PDF
  const cvPdfBytes = await generator.generateFromMarkdown(
    cvMarkdown,
    '',
    {
      title: 'Dawn Zurick Beilfuss',
      subtitle: 'Patient Access Supervisor | Healthcare Administration & Revenue Cycle Management',
      theme: {
        primaryColor: [0, 0.3, 0.6],
        secondaryColor: [0.2, 0.2, 0.2],
        font: 'Helvetica'
      },
      includeHeader: true,
      includeFooter: true
    }
  );

  // Generate cover letter PDF
  const coverLetterPdfBytes = await generator.generateFromMarkdown(
    coverLetterMarkdown,
    '',
    {
      title: 'Cover Letter',
      subtitle: 'Patient Access Supervisor Position',
      theme: {
        primaryColor: [0, 0.3, 0.6],
        secondaryColor: [0.2, 0.2, 0.2],
        font: 'Helvetica'
      },
      includeHeader: true,
      includeFooter: true
    }
  );

  // Save PDFs
  await fs.writeFile(
    path.join(process.cwd(), 'job-postings/mercy-health-37949/cv.pdf'),
    cvPdfBytes
  );
  await fs.writeFile(
    path.join(process.cwd(), 'job-postings/mercy-health-37949/cover-letter.pdf'),
    coverLetterPdfBytes
  );

  console.log('PDFs generated successfully!');
}

generatePDFs().catch(console.error); 