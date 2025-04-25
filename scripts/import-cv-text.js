#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { createInterface } from 'readline';

/**
 * CV Text Import Tool
 * 
 * This script lets users paste CV text from various sources,
 * preprocesses the content, and saves it for validation.
 */

const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), 'temp-cv-import.txt');

const preprocessors = {
  /**
   * General cleanup common to all import sources
   */
  general: (text) => {
    return text
      .replace(/\r\n/g, '\n')                  // Normalize line endings
      .replace(/[ \t]+$/gm, '')                // Remove trailing spaces
      .replace(/\n{3,}/g, '\n\n')              // Limit consecutive newlines
      .trim();
  },
  
  /**
   * For text imported from Word documents
   */
  word: (text) => {
    return text
      .replace(/\f/g, '\n\n')                  // Form feeds to double newlines
      .replace(/•\s*/g, '- ')                  // Convert bullets to markdown list
      .replace(/\n\s{4,}/g, '\n    ')          // Normalize indentation
      .replace(/_{2,}|={2,}/g, '');            // Remove lines of underscores/equals
  },
  
  /**
   * For text imported from PDF documents
   */
  pdf: (text) => {
    // PDFs often have split lines that should be paragraphs
    const lines = text.split('\n');
    const result = [];
    
    let paragraph = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect if this might be a header or a list item
      const isHeader = /^[A-Z\s]{5,}$/.test(line) || line.startsWith('#');
      const isListItem = line.startsWith('•') || line.startsWith('-') || /^\d+[\.\)]/.test(line);
      const isShortLine = line.length < 50;
      
      if (isHeader) {
        // Flush previous paragraph
        if (paragraph) {
          result.push(paragraph);
          paragraph = '';
        }
        
        // Add header with markdown syntax if needed
        if (!line.startsWith('#')) {
          result.push(`\n## ${line}`);
        } else {
          result.push(`\n${line}`);
        }
      } else if (isListItem) {
        // Flush previous paragraph
        if (paragraph) {
          result.push(paragraph);
          paragraph = '';
        }
        
        // Add list item with consistent markdown syntax
        result.push(line.replace(/^•\s*/, '- ').replace(/^\d+[\.\)]\s*/, '- '));
      } else if (line === '' || i === lines.length - 1) {
        // End of paragraph or document
        if (paragraph) {
          result.push(paragraph + (line ? ' ' + line : ''));
          paragraph = '';
        } else if (line) {
          result.push(line);
        }
        
        // Add a separator for empty lines
        if (line === '') {
          result.push('');
        }
      } else if (isShortLine && i < lines.length - 1 && 
                !/[.!?:;]$/.test(line)) {
        // Likely a broken line in a paragraph, collect it
        paragraph += (paragraph ? ' ' : '') + line;
      } else {
        // Standard line, append to current paragraph
        paragraph += (paragraph ? ' ' : '') + line;
        
        // If ends with punctuation, likely end of paragraph
        if (/[.!?]$/.test(line)) {
          result.push(paragraph);
          paragraph = '';
        }
      }
    }
    
    // Final cleanup and convert to markdown-friendly format
    return result.join('\n')
      .replace(/•\s*/g, '- ')                  // Convert bullets to markdown
      .replace(/[ \t]{2,}/g, ' ');             // Remove extra spaces
  },
  
  /**
   * For text imported from HTML or web pages
   */
  html: (text) => {
    return text
      .replace(/<\/?[^>]+(>|$)/g, '')          // Remove HTML tags
      .replace(/&nbsp;/g, ' ')                 // Replace non-breaking spaces
      .replace(/&amp;/g, '&')                  // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n\s*\n\s*\n/g, '\n\n');       // Normalize line spacing
  },
  
  /**
   * For text imported from LinkedIn profiles
   */
  linkedin: (text) => {
    return text
      .replace(/^(Experience|Education|Skills|Languages|Recommendations|Accomplishments)/gm, '## $1')
      .replace(/^[A-Z][a-z]+ [0-9]{4} - .*$/gm, '**$&**')
      .replace(/^• /gm, '- ');
  }
};

/**
 * Detect the source type based on content patterns
 */
function detectSourceType(text) {
  if (/<html|<body|<div|<p>/.test(text)) {
    return 'html';
  } else if (/^\%PDF/.test(text) || text.includes('\f') || text.includes('•  ')) {
    return 'pdf';
  } else if (text.includes('View profile badges') || text.includes('Contact info') || 
            text.includes('LinkedIn member') || text.includes('Skills & endorsements')) {
    return 'linkedin';
  } else {
    return 'word'; // Default assumption
  }
}

/**
 * Create a command line input interface
 */
function createReadlineInterface() {
  return createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Main function to handle CV text import
 */
async function main() {
  const args = process.argv.slice(2);
  const outputPath = args[0] || DEFAULT_OUTPUT_PATH;
  
  const _rl = createReadlineInterface();
  
  console.log(`
CV Text Import Tool
------------------
Paste the CV text below (press Ctrl+D when finished)
  `);
  
  let content = '';
  
  // Collect text from standard input
  process.stdin.on('data', (chunk) => {
    content += chunk.toString();
  });
  
  // Process when input ends
  process.stdin.on('end', async () => {
    try {
      // Detect source type and apply appropriate preprocessing
      const sourceType = detectSourceType(content);
      console.log(`\nDetected source type: ${sourceType}\n`);
      
      // Apply general cleanup and source-specific processing
      let processedText = preprocessors.general(content);
      processedText = preprocessors[sourceType](processedText);
      
      // Add front matter
      const frontMatter = `---
imported: true
source: ${sourceType}
date: ${new Date().toISOString().split('T')[0]}
---

`;
      
      const finalText = frontMatter + processedText;
      
      // Save to file
      await fs.writeFile(outputPath, finalText);
      
      console.log(`CV text preprocessed and saved to: ${outputPath}`);
      console.log(`\nNext steps:`);
      console.log(`1. Validate the imported CV: node utils/cv-validator.js ${outputPath}`);
      console.log(`2. Edit if needed and generate PDF: node utils/generate-pdf.js`);
      
    } catch (error) {
      console.error('Error processing input:', error.message);
      process.exit(1);
    }
  });
}

// Run the main function
main();