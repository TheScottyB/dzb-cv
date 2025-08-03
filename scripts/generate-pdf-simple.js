#!/usr/bin/env node

/**
 * Simple PDF Generator for Dawn's CVs
 * 
 * Usage:
 *   node scripts/generate-pdf-simple.js input.md [output.pdf]
 *   node scripts/generate-pdf-simple.js output/dawn-ekg-cv-2025-08-03.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Try to import the PDF package
let createPDFInterface;
try {
  const pdfModule = await import('../packages/pdf/dist/index.js');
  createPDFInterface = pdfModule.createPDFInterface;
  console.log('✅ Using built PDF package');
} catch (error) {
  console.log('⚠️  Built PDF package not available, building...');
  
  // Try to build the PDF package
  try {
    const { execSync } = await import('child_process');
    execSync('cd packages/pdf && pnpm build', { 
      stdio: 'inherit',
      cwd: rootDir 
    });
    
    // Try import again
    const pdfModule = await import('../packages/pdf/dist/index.js');
    createPDFInterface = pdfModule.createPDFInterface;
    console.log('✅ PDF package built and loaded');
  } catch (buildError) {
    console.error('❌ Could not build or load PDF package:', buildError.message);
    console.log('\n🔧 Fallback: Using simple HTML to PDF conversion...');
    createPDFInterface = null; // Mark as unavailable
  }
}

// Simple HTML template for CVs
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.75in;
            font-size: 11pt;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
            font-size: 24pt;
        }
        h2 {
            color: #2c3e50;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 0.3rem;
            margin-top: 1.5rem;
            margin-bottom: 0.8rem;
            font-size: 14pt;
        }
        h3 {
            color: #34495e;
            margin-bottom: 0.5rem;
            font-size: 12pt;
        }
        strong {
            color: #2c3e50;
        }
        ul {
            margin: 0.5rem 0;
            padding-left: 1.2rem;
        }
        li {
            margin-bottom: 0.3rem;
        }
        .contact-info {
            text-align: center;
            margin-bottom: 1rem;
            color: #7f8c8d;
        }
        .section {
            margin-bottom: 1.2rem;
        }
        hr {
            border: none;
            border-top: 1px solid #bdc3c7;
            margin: 1rem 0;
        }
        @media print {
            body { margin: 0; padding: 0.5in; }
            .no-print { display: none; }
        }
        .emoji {
            font-size: 0.9em;
        }
    </style>
</head>
<body>
{{CONTENT}}
</body>
</html>`;

// Simple markdown to HTML converter (basic)
function markdownToHtml(markdown) {
  return markdown
    // Headers
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    
    // Bullet points (simple)
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    
    // Wrap in paragraphs
    .replace(/^(.+)$/gm, '<p>$1</p>')
    
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p><h([1-6])>/g, '<h$1>')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
    .replace(/<p><hr><\/p>/g, '<hr>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>');
}

// Fallback simple PDF generation using built-in HTML conversion
async function useSimplePDFGeneration() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node scripts/generate-pdf-simple.js input.md [output.pdf]');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputPath = args[1] ? path.resolve(args[1]) : inputPath.replace('.md', '.pdf');

  console.log(`📄 Converting: ${inputPath}`);
  console.log(`💾 Output: ${outputPath}`);

  try {
    // Read markdown file
    const markdown = fs.readFileSync(inputPath, 'utf8');
    
    // Convert to HTML
    const htmlContent = markdownToHtml(markdown);
    const fullHtml = htmlTemplate.replace('{{CONTENT}}', htmlContent);
    
    // Write HTML temporarily
    const tempHtml = inputPath.replace('.md', '.tmp.html');
    fs.writeFileSync(tempHtml, fullHtml, 'utf8');
    
    console.log(`⚠️  Simple HTML file created: ${tempHtml}`);
    console.log(`💡 To convert to PDF manually:`);
    console.log(`   1. Open ${tempHtml} in Chrome`);
    console.log(`   2. Print > Save as PDF`);
    console.log(`   3. Use these settings:`);
    console.log(`      - Paper size: Letter`);
    console.log(`      - Margins: Default`);
    console.log(`      - Scale: 100%`);
    
    console.log(`\n✅ HTML file ready for manual PDF conversion`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Main PDF generation function
async function generatePDF() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🏥 Dawn's PDF Generator

Usage:
  node scripts/generate-pdf-simple.js input.md [output.pdf]

Examples:
  node scripts/generate-pdf-simple.js output/dawn-ekg-cv-2025-08-03.md
  node scripts/generate-pdf-simple.js output/dawn-ekg-cv-2025-08-03.md dawn-cv.pdf
`);
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputPath = args[1] ? path.resolve(args[1]) : inputPath.replace('.md', '.pdf');

  console.log(`🏥 Generating PDF for Dawn...`);
  console.log(`📄 Input: ${inputPath}`);
  console.log(`💾 Output: ${outputPath}`);

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }

  try {
    // Check if PDF package is available
    if (!createPDFInterface) {
      console.log(`⚠️  PDF package not available, using fallback...`);
      await useSimplePDFGeneration();
      return;
    }

    // Use the fixed PDF package
    const pdfInterface = createPDFInterface('cli');
    
    const result = await pdfInterface.generate({
      input: inputPath,
      outputPath: outputPath,
      template: 'healthcare',
      debug: true
    });

    if (result.success) {
      console.log(`✅ PDF generated successfully!`);
      console.log(`📄 Output: ${result.outputPath}`);
      console.log(`⏱️  Generation time: ${result.executionTime}ms`);
    } else {
      console.error(`❌ PDF generation failed: ${result.error}`);
      console.log(`\n🔧 Trying fallback method...`);
      await useSimplePDFGeneration();
    }

  } catch (error) {
    console.error(`❌ PDF generation error: ${error.message}`);
    console.log(`\n🔧 Using fallback method...`);
    await useSimplePDFGeneration();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePDF();
}

export { generatePDF };