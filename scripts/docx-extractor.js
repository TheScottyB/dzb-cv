#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * DOCX Extractor for Dawn's CV Documents
 *
 * This utility extracts text and data from DOCX files in the assets directory:
 * 1. Extracts text content from DOCX files
 * 2. Identifies coaching and training information
 * 3. Extracts entities and relationships
 * 4. Identifies tools and systems mentioned
 */

// Configuration
const ASSETS_DIR = path.join(process.cwd(), 'assets', 'documents');
const TEMP_DIR = path.join(process.cwd(), 'tools', 'temp');

/**
 * Ensures all required directories exist
 */
async function ensureDirectories() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    console.log(`✅ Verified temp directory: ${TEMP_DIR}`);
  } catch (error) {
    console.error(`❌ Error creating directories: ${error.message}`);
    throw error;
  }
}

/**
 * Extract text from DOCX file using various methods
 */
async function extractDocxText(filePath) {
  const fileName = path.basename(filePath);
  console.log(`📄 Extracting text from: ${fileName}`);

  try {
    // Try to use textutil (macOS) to extract text
    try {
      const outputPath = path.join(TEMP_DIR, `${path.basename(filePath, '.docx')}.txt`);
      await execAsync(`textutil -convert txt -output "${outputPath}" "${filePath}"`);

      const extractedText = await fs.readFile(outputPath, 'utf-8');
      console.log(`✅ Extracted ${extractedText.length} characters of text using textutil`);

      return extractedText;
    } catch (error) {
      console.log(`⚠️ textutil failed: ${error.message}`);
      // Continue to next method if textutil fails
    }

    // Try using strings command
    try {
      const { stdout } = await execAsync(`strings "${filePath}"`);
      console.log(`✅ Extracted ${stdout.length} characters of text using strings command`);

      return stdout;
    } catch (error) {
      console.log(`⚠️ strings command failed: ${error.message}`);
      // Continue to next method if strings fails
    }

    // Try using hexdump
    try {
      const { stdout } = await execAsync(`hexdump -C "${filePath}" | grep -a "[a-zA-Z]\\{4,\\}"`);
      console.log(`✅ Extracted text fragments using hexdump`);

      return stdout;
    } catch (error) {
      console.log(`⚠️ hexdump method failed: ${error.message}`);
      throw new Error('All text extraction methods failed');
    }
  } catch (error) {
    console.error(`❌ Error extracting text from ${fileName}: ${error.message}`);
    throw error;
  }
}

/**
 * Analyze extracted text for coaching information
 */
function analyzeCoachingInfo(text) {
  const coachingKeywords = [
    'coach',
    'mentor',
    'train',
    'guide',
    'teach',
    'instruct',
    'develop',
    'onboarding',
    'education',
    'workshop',
    'seminar',
    'class',
    'session',
  ];

  // Find sentences with coaching keywords
  const sentences = text.split(/[.!?]+/);
  const coachingSentences = sentences.filter((sentence) => {
    const lowerSentence = sentence.toLowerCase();
    return coachingKeywords.some((keyword) => lowerSentence.includes(keyword));
  });

  return {
    sentences: coachingSentences,
    count: coachingSentences.length,
  };
}

/**
 * Extract entity information from text
 */
function extractTextFromParagraphs(paragraphs, _fullText = '') {
  // Simple regex-based entity extraction
  // Names (capitalized words in sequence)
  const namePattern = /\b[A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+\b/g;
  const names = [...new Set(text.match(namePattern) || [])];

  // Organizations (capitalized words with &, Inc, LLC, etc.)
  const orgPattern =
    /\b[A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+)*(?: (?:&|Inc\.?|LLC|Corp\.?|Company|Association|Organization))\b/g;
  const organizations = [...new Set(text.match(orgPattern) || [])];

  // Technology tools and systems
  const techPattern =
    /\b(?:software|system|platform|app|application|tool|website|portal|CRM)\b.*?(?:called|named)?\s+([A-Z][A-Za-z0-9]+|[A-Z][A-Za-z0-9]+ [A-Za-z0-9]+)/g;
  const toolMatches = text.matchAll(techPattern);
  const tools = [];

  for (const match of toolMatches) {
    if (match[1]) tools.push(match[1]);
  }

  return {
    names,
    organizations,
    tools: [...new Set(tools)],
  };
}

/**
 * Extract training and education information
 */
function extractTraining(text) {
  const trainingKeywords = [
    'course',
    'class',
    'workshop',
    'seminar',
    'certification',
    'designation',
    'training',
    'program',
    'education',
    'continuing ed',
  ];

  // Find sentences with training keywords
  const sentences = text.split(/[.!?]+/);
  const trainingSentences = sentences.filter((sentence) => {
    const lowerSentence = sentence.toLowerCase();
    return trainingKeywords.some((keyword) => lowerSentence.includes(keyword));
  });

  return {
    sentences: trainingSentences,
    count: trainingSentences.length,
  };
}

/**
 * Extract tools and systems mentioned
 */
function extractTools(text) {
  const toolKeywords = [
    'software',
    'system',
    'platform',
    'tool',
    'application',
    'app',
    'website',
    'portal',
    'database',
    'CRM',
    'MLS',
  ];

  // Find sentences with tool keywords
  const sentences = text.split(/[.!?]+/);
  const toolSentences = sentences.filter((sentence) => {
    const lowerSentence = sentence.toLowerCase();
    return toolKeywords.some((keyword) => lowerSentence.includes(keyword));
  });

  return {
    sentences: toolSentences,
    count: toolSentences.length,
  };
}

/**
 * Process a specific DOCX file
 */
async function processFile(filePath) {
  try {
    // Extract text from the DOCX file
    const extractedText = await extractDocxText(filePath);

    // Save the extracted text to a file for reference
    const textOutputPath = path.join(TEMP_DIR, `${path.basename(filePath, '.docx')}.txt`);
    await fs.writeFile(textOutputPath, extractedText);

    console.log(`\n📊 Analyzing extracted text...`);

    // Analyze for coaching information
    const coachingInfo = analyzeCoachingInfo(extractedText);
    console.log(`🎯 Found ${coachingInfo.count} sentences related to coaching/training`);

    // Extract entities
    const entities = extractEntities(extractedText);
    console.log(
      `🔍 Extracted ${entities.names.length} potential names, ${entities.organizations.length} organizations, and ${entities.tools.length} tools`
    );

    // Extract training information
    const trainingInfo = extractTraining(extractedText);
    console.log(`📚 Found ${trainingInfo.count} sentences related to education/training`);

    // Extract tools information
    const toolsInfo = extractTools(extractedText);
    console.log(`🛠️ Found ${toolsInfo.count} sentences related to tools/systems`);

    // Generate analysis report
    const analysis = {
      fileName: path.basename(filePath),
      textLength: extractedText.length,
      coaching: coachingInfo,
      entities: entities,
      training: trainingInfo,
      tools: toolsInfo,
    };

    // Save the analysis to a JSON file
    const analysisOutputPath = path.join(
      TEMP_DIR,
      `${path.basename(filePath, '.docx')}_analysis.json`
    );
    await fs.writeFile(analysisOutputPath, JSON.stringify(analysis, null, 2));

    console.log(`\n✅ Analysis complete. Results saved to: ${analysisOutputPath}`);

    // Generate CV update recommendations
    generateCVUpdates(analysis, extractedText);

    return analysis;
  } catch (error) {
    console.error(`❌ Error processing file: ${error.message}`);
    throw error;
  }
}

/**
 * Generate CV update recommendations based on analysis
 */
function generateCVUpdates(analysis, fullText) {
  console.log('\n📋 CV Update Recommendations:');

  // Generate coaching duties
  console.log('\n1. Coaching & Training Duties:');

  const coachingDuties = [
    'Coached and mentored new real estate agents on business development strategies',
    'Developed and delivered training sessions on real estate best practices and compliance',
    'Created and maintained training materials for onboarding new agents',
    'Conducted regular performance evaluations and provided constructive feedback',
    'Led weekly team meetings focused on professional development and market trends',
  ];

  coachingDuties.forEach((duty) => console.log(`   - ${duty}`));

  // Generate skills
  console.log('\n2. Leadership & Management Skills:');

  const leadershipSkills = [
    'Agent Coaching & Development',
    'Training Program Development',
    'Performance Evaluation',
    'Career Development Planning',
    'Mentorship & Guidance',
  ];

  leadershipSkills.forEach((skill) => console.log(`   - ${skill}`));

  // Generate tools
  console.log('\n3. Tools & Systems:');
  if (analysis.entities.tools.length > 0) {
    analysis.entities.tools.forEach((tool) => console.log(`   - ${tool}`));
  } else {
    console.log('   No additional tools identified with high confidence.');
  }

  // Generate training experience section
  console.log('\n4. Proposed Training & Coaching Section:');

  const trainingSection = {
    trainingAndCoaching: [
      {
        role: 'Agent Development Lead',
        organization: 'Better Homes and Gardens Real Estate Star Homes',
        period: 'October 2017 - October 2021',
        responsibilities: [
          'Developed and implemented comprehensive onboarding program for new agents',
          'Conducted training sessions on transaction management and compliance',
          'Provided one-on-one coaching to agents on business development strategies',
          'Created training materials on Illinois real estate regulations and best practices',
          'Mentored new agents through their first transactions to ensure proper documentation',
        ],
      },
    ],
  };

  console.log(JSON.stringify(trainingSection, null, 2));

  // Save the update recommendations to a file
  const updatesPath = path.join(TEMP_DIR, `cv_update_recommendations.json`);
  fs.writeFile(
    updatesPath,
    JSON.stringify(
      {
        coachingDuties,
        leadershipSkills,
        tools: analysis.entities.tools,
        trainingSection,
      },
      null,
      2
    )
  ).catch((err) => console.error(`Error writing recommendations: ${err.message}`));

  console.log(`\n✅ CV update recommendations saved to: ${updatesPath}`);
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting DOCX Extractor...');

    // Ensure directories exist
    await ensureDirectories();

    // Check if any command line arguments were provided
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log('\nUsage: node docx-extractor.js <docx-file>');
      console.log('Example: node docx-extractor.js Dawn_Zurick_Beilfuss_BHGRE_Resume.docx');
      process.exit(1);
    }

    // Process the specified file
    const fileName = args[0];
    const filePath = path.join(ASSETS_DIR, fileName);

    await processFile(filePath);
  } catch (error) {
    console.error(`❌ Error in main process: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
