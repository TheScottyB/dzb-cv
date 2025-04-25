#!/usr/bin/env node

/**
 * Job Analyzer Helper
 * A script to analyze job postings from various formats (JSON, text files, URLs)
 * and output standardized job analysis for CV generation.
 * 
 * Usage:
 *   node job-analyzer-helper.js [input-file] [--output=output.json] [--format=json|yaml|text]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Analyzes a job posting from various input formats
 * @param {string} inputPath - Path to input file or raw text content
 * @param {Object} options - Analysis options
 * @returns {Object} Structured job analysis
 */
export async function analyzeJobInput(inputPath, options = {}) {
  const { isFile = true, format = 'auto' } = options;
  
  try {
    let content;
    
    // Read the input content
    if (isFile) {
      console.log(chalk.blue(`Reading input from file: ${inputPath}`));
      content = fs.readFileSync(inputPath, 'utf-8');
    } else {
      console.log(chalk.blue('Using provided content'));
      content = inputPath;
    }
    
    // Detect and parse the format
    let detectedFormat = format;
    if (format === 'auto') {
      if (inputPath.toLowerCase().endsWith('.json') || content.trim().startsWith('{')) {
        detectedFormat = 'json';
      } else if (inputPath.toLowerCase().endsWith('.txt') || content.includes('\n')) {
        detectedFormat = 'text';
      } else {
        // Default to text for other formats
        detectedFormat = 'text';
      }
    }
    
    console.log(chalk.yellow(`Detected format: ${detectedFormat}`));
    
    // Parse according to detected format
    let jobDetails;
    if (detectedFormat === 'json') {
      jobDetails = parseJsonInput(content);
    } else {
      jobDetails = parseTextInput(content);
    }
    
    // Ensure all required fields are present
    const analysis = normalizeJobAnalysis(jobDetails);
    
    return analysis;
  } catch (error) {
    console.error(chalk.red('Error analyzing job input:'), error);
    throw error;
  }
}

/**
 * Parse JSON input format
 * @param {string} content - JSON content string
 * @returns {Object} Parsed job details
 */
function parseJsonInput(content) {
  try {
    const jobDetails = JSON.parse(content);
    return jobDetails;
  } catch (error) {
    console.error(chalk.red('Error parsing JSON:'), error.message);
    throw new Error('Invalid JSON format');
  }
}

/**
 * Parse plain text input format
 * @param {string} content - Plain text job description
 * @returns {Object} Structured job details
 */
function parseTextInput(content) {
  try {
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Initialize job details
    let jobDetails = {
      title: 'Unknown Position',
      company: 'Unknown Company',
      location: '',
      responsibilities: [],
      qualifications: [],
      keyTerms: [],
      source: {
        url: '',
        site: 'Local File',
        fetchDate: new Date()
      }
    };
    
    // Extract title (typically first line or line containing Job Title)
    // First, check if first line looks like a job title
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      
      // If the first line is in ALL CAPS or contains typical job title words,
      // it's likely the job title
      const isLikelyTitle = firstLine === firstLine.toUpperCase() || 
                          /\b(position|specialist|manager|director|secretary|assistant|coordinator|officer|analyst|executive|supervisor|lead|head|chief)\b/i.test(firstLine);
      
      if (isLikelyTitle && !firstLine.includes(':')) {
        jobDetails.title = firstLine;
      }
    }
    
    // If we didn't get a title from the first line, look for explicit "Job Title:" etc.
    if (jobDetails.title === 'Unknown Position') {
      const titleLine = lines.find(line => 
        line.toLowerCase().includes('job title:') || 
        line.toLowerCase().includes('position:') || 
        line.toLowerCase().includes('role:') ||
        line.toLowerCase().includes('class title:')
      );
      
      if (titleLine) {
        const parts = titleLine.split(':');
        if (parts.length > 1) {
          jobDetails.title = parts[1].trim();
        }
      }
    }
    
    // Extract company name - check for agency first (for government jobs)
    const agencyLine = lines.find(line => 
      line.toLowerCase().includes('agency:')
    );
    
    if (agencyLine) {
      const parts = agencyLine.split(':');
      if (parts.length > 1) {
        jobDetails.company = parts[1].trim();
      }
    } else {
      // If no agency, look for company
      const companyLine = lines.find(line => 
        line.toLowerCase().includes('company:') || 
        line.toLowerCase().includes('organization:') || 
        line.toLowerCase().includes('employer:')
      );
      
      if (companyLine) {
        const parts = companyLine.split(':');
        if (parts.length > 1) {
          jobDetails.company = parts[1].trim();
        }
      }
    }
    
    // Extract location
    const locationLine = lines.find(line => 
      line.toLowerCase().includes('location:') || 
      line.toLowerCase().includes('address:') || 
      line.toLowerCase().includes('city:')
    );
    
    if (locationLine) {
      const parts = locationLine.split(':');
      if (parts.length > 1) {
        jobDetails.location = parts[1].trim();
      }
    }
    
    // Extract responsibilities
    let inResponsibilities = false;
    let inQualifications = false;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check for section headers
      if (lowerLine.includes('responsibilities:') || 
          lowerLine.includes('duties:') || 
          lowerLine.includes('job description:') || 
          lowerLine.includes('key responsibilities:')) {
        inResponsibilities = true;
        inQualifications = false;
        continue;
      } 
      
      if (lowerLine.includes('qualifications:') || 
          lowerLine.includes('requirements:') || 
          lowerLine.includes('skills:') || 
          lowerLine.includes('minimum requirements:')) {
        inResponsibilities = false;
        inQualifications = true;
        continue;
      }
      
      // Check for end of sections
      if (lowerLine.includes('benefits:') || 
          lowerLine.includes('salary:') || 
          lowerLine.includes('about us:') || 
          lowerLine.includes('work hours:')) {
        inResponsibilities = false;
        inQualifications = false;
        continue;
      }
      
      // Extract bullet points or plain text
      if (inResponsibilities && line.trim()) {
        // Remove bullet point markers and clean up
        const cleanLine = line.replace(/^[•\-\*\s]+/, '').trim();
        if (cleanLine) {
          jobDetails.responsibilities.push(cleanLine);
        }
      } else if (inQualifications && line.trim()) {
        // Remove bullet point markers and clean up
        const cleanLine = line.replace(/^[•\-\*\s]+/, '').trim();
        if (cleanLine) {
          jobDetails.qualifications.push(cleanLine);
        }
      }
    }
    
    // Extract common job-related terms
    jobDetails.keyTerms = extractKeyTerms(content);
    
    return jobDetails;
  } catch (error) {
    console.error(chalk.red('Error parsing text:'), error.message);
    throw new Error('Error processing text input');
  }
}

/**
 * Extract key terms from the job description
 * @param {string} content - Full job description
 * @returns {string[]} Array of key terms
 */
function extractKeyTerms(content) {
  // Extract commonly valuable skills and terms
  const keyTermPatterns = [
    /Microsoft Office/i, /Excel/i, /Word/i, /PowerPoint/i, /Outlook/i,
    /communication skills/i, /organizational skills/i, /detail-oriented/i,
    /team player/i, /problem.solving/i, /customer service/i,
    /project management/i, /time management/i, /leadership/i,
    /data analysis/i, /strategic/i, /presentation/i, /training/i,
    /coordination/i, /planning/i, /scheduling/i, /administrative/i,
    /clerical/i, /filing/i, /documentation/i, /confidential/i,
    /database/i, /management/i, /dictation/i, /transcription/i,
    /minutes/i, /agenda/i, /meeting/i, /travel arrangements/i
  ];
  
  const terms = [];
  
  for (const pattern of keyTermPatterns) {
    if (pattern.test(content)) {
      // Convert the pattern to a readable term
      const term = pattern.toString()
        .replace(/^\/|\/i$/g, '')  // Remove regex markers
        .replace(/\\\s/g, ' ')     // Fix escaped spaces
        .replace(/\\/g, '')        // Remove other escapes
        .toLowerCase();
      
      terms.push(term);
    }
  }
  
  return [...new Set(terms)];  // Remove duplicates
}

/**
 * Ensures all required fields are present in the job analysis
 * @param {Object} analysis - Raw job details
 * @returns {Object} Normalized job analysis
 */
function normalizeJobAnalysis(analysis) {
  const normalized = {
    title: analysis.title || 'Unknown Position',
    company: analysis.company || 'Unknown Company',
    location: analysis.location || '',
    responsibilities: analysis.responsibilities || [],
    qualifications: analysis.qualifications || [],
    keyTerms: analysis.keyTerms || [],
    source: {
      url: analysis.source?.url || '',
      site: analysis.source?.site || 'Local Source',
      fetchDate: analysis.source?.fetchDate || new Date()
    }
  };
  
  // Extract additional fields if present
  if (analysis.id) normalized.id = analysis.id;
  if (analysis.jobId) normalized.id = analysis.jobId;
  if (analysis.description) normalized.description = analysis.description;
  if (analysis.jobType) normalized.jobType = analysis.jobType;
  if (analysis.experienceLevel) normalized.experienceLevel = analysis.experienceLevel;
  if (analysis.salaryRange) normalized.salaryRange = analysis.salaryRange;
  if (analysis.educationRequirements) normalized.educationRequirements = analysis.educationRequirements;
  if (analysis.openingDate) normalized.openingDate = analysis.openingDate;
  if (analysis.closingDate) normalized.closingDate = analysis.closingDate;
  if (analysis.classTitle) normalized.classTitle = analysis.classTitle;
  
  return normalized;
}

/**
 * Command-line interface handler
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Check for help command
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Job Analyzer Helper
-------------------
Analyzes job postings from various formats and outputs structured job analysis.

Usage:
  node job-analyzer-helper.js [options] input-file

Options:
  --output=<path>   Save analysis to JSON file (default: job-analysis.json)
  --format=<format> Force specific input format: json, text (default: auto-detect)
  --help, -h        Show this help message

Examples:
  node job-analyzer-helper.js job-posting.txt
  node job-analyzer-helper.js job-data.json --output=analysis.json
  node job-analyzer-helper.js job-description.txt --format=text
    `);
    process.exit(0);
  }
  
  // Get input file
  const inputFile = args.find(arg => !arg.startsWith('-'));
  
  if (!inputFile) {
    console.error(chalk.red('Error: No input file provided'));
    process.exit(1);
  }
  
  // Check if file exists
  if (!fs.existsSync(inputFile)) {
    console.error(chalk.red(`Error: File ${inputFile} does not exist`));
    process.exit(1);
  }
  
  // Parse options
  const outputArg = args.find(arg => arg.startsWith('--output='));
  const outputPath = outputArg ? outputArg.split('=')[1] : 'job-analysis.json';
  
  const formatArg = args.find(arg => arg.startsWith('--format='));
  const format = formatArg ? formatArg.split('=')[1] : 'auto';
  
  try {
    console.log(chalk.blue(`🔍 Analyzing job posting from ${inputFile}...`));
    
    // Analyze the job posting
    const analysis = await analyzeJobInput(inputFile, { isFile: true, format });
    
    // Output results
    console.log(chalk.green('\n✅ Job Analysis Complete:'));
    console.log(chalk.yellow('-----------------------'));
    console.log(`Title: ${chalk.cyan(analysis.title)}`);
    console.log(`Company: ${chalk.cyan(analysis.company)}`);
    if (analysis.location) console.log(`Location: ${chalk.cyan(analysis.location)}`);
    
    console.log(chalk.yellow('\nResponsibilities:'));
    analysis.responsibilities.forEach(r => console.log(`- ${r}`));
    
    console.log(chalk.yellow('\nQualifications:'));
    analysis.qualifications.forEach(q => console.log(`- ${q}`));
    
    console.log(chalk.yellow('\nKey Terms:'));
    console.log(analysis.keyTerms.join(', '));
    
    // Save to file
    const outputContent = JSON.stringify(analysis, null, 2);
    fs.writeFileSync(outputPath, outputContent);
    console.log(chalk.green(`\nAnalysis saved to: ${outputPath}`));
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

// Run as script if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

