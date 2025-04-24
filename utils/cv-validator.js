#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { diffLines } from 'diff';
import chalk from 'chalk';

/**
 * CV Validator and Comparator
 * 
 * This script validates new CV text against Dawn's known data
 * and shows a diff of changes.
 */

// Key identifiers that must exist in Dawn's resumes
const IDENTITY_MARKERS = [
  "Dawn Zurick Beilfuss",
  "Dawn Zurick",
  "DZ4100@gmail.com",
  "847.287.1148"
];

// Significant experience markers that should be present
const EXPERIENCE_MARKERS = [
  "Vylla",
  "GenStone Realty",
  "Better Homes and Gardens Real Estate Star Homes",
  "healthcare",
  "real estate"
];

// Key skills that should be referenced
const SKILL_MARKERS = [
  "Real Estate License",
  "Licensed Managing Broker",
  "Team Leadership"
];

/**
 * Loads the base CV data for comparison
 */
async function loadBaseData() {
  try {
    const baseInfoPath = path.join(process.cwd(), 'src', 'data', 'base-info.json');
    const baseInfoData = await fs.readFile(baseInfoPath, 'utf-8');
    return JSON.parse(baseInfoData);
  } catch (error) {
    console.error('Error loading base data:', error.message);
    process.exit(1);
  }
}

/**
 * Validates if a text is likely Dawn's CV by checking for key markers
 */
function validateIdentity(text) {
  const foundMarkers = IDENTITY_MARKERS.filter(marker => 
    text.includes(marker)
  );
  
  const percentageFound = (foundMarkers.length / IDENTITY_MARKERS.length) * 100;
  
  return {
    isValid: percentageFound >= 75, // At least 75% of identity markers must be present
    foundMarkers,
    percentageFound,
    missingMarkers: IDENTITY_MARKERS.filter(marker => !foundMarkers.includes(marker))
  };
}

/**
 * Validates if content aligns with Dawn's known experience
 */
function validateContent(text) {
  const foundExperience = EXPERIENCE_MARKERS.filter(marker => 
    text.includes(marker)
  );
  
  const foundSkills = SKILL_MARKERS.filter(marker => 
    text.includes(marker)
  );
  
  const experiencePercentage = (foundExperience.length / EXPERIENCE_MARKERS.length) * 100;
  const skillsPercentage = (foundSkills.length / SKILL_MARKERS.length) * 100;
  
  return {
    isConsistent: experiencePercentage >= 50 && skillsPercentage >= 50,
    experienceScore: experiencePercentage,
    skillsScore: skillsPercentage,
    missingExperience: EXPERIENCE_MARKERS.filter(marker => !foundExperience.includes(marker)),
    missingSkills: SKILL_MARKERS.filter(marker => !foundSkills.includes(marker))
  };
}

/**
 * Find most similar existing CV to compare against
 */
async function findBestMatch(text) {
  try {
    // Check CV versions directory
    const cvVersionsDir = path.join(process.cwd(), 'cv-versions');
    const files = await fs.readdir(cvVersionsDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    let bestMatch = null;
    let highestSimilarity = 0;
    
    for (const file of mdFiles) {
      const filePath = path.join(cvVersionsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Simple similarity score based on shared words
      const textWords = new Set(text.toLowerCase().split(/\W+/));
      const contentWords = new Set(content.toLowerCase().split(/\W+/));
      
      const intersection = [...textWords].filter(word => contentWords.has(word));
      const similarity = intersection.length / (textWords.size + contentWords.size - intersection.length);
      
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = {
          path: filePath,
          content,
          similarity: similarity * 100,
          name: file
        };
      }
    }
    
    return bestMatch;
  } catch (error) {
    console.error('Error finding best match:', error.message);
    return null;
  }
}

/**
 * Compare text with existing CV and show diff
 */
function compareAndShowDiff(newText, existingText, existingName) {
  console.log(`\nComparing with most similar CV: ${chalk.blue(existingName)} (${chalk.green(Math.round(existingText.similarity))}% similar)\n`);
  
  const diff = diffLines(existingText.content, newText);
  
  diff.forEach((part) => {
    // Color the added and removed parts
    const color = part.added ? chalk.green :
                 part.removed ? chalk.red : chalk.grey;
    
    const prefix = part.added ? '+ ' :
                  part.removed ? '- ' : '  ';
    
    // Only show first 3 lines for unchanged parts to reduce clutter
    if (!part.added && !part.removed && part.value.split('\n').length > 4) {
      const lines = part.value.split('\n');
      const firstLines = lines.slice(0, 3).join('\n');
      const lineCount = lines.length - 3;
      console.log(color(prefix + firstLines));
      console.log(chalk.grey(`  ... ${lineCount} more unchanged lines ...`));
    } else {
      console.log(color(prefix + part.value.trimEnd()));
    }
  });
}

/**
 * Saves a validated CV to the appropriate directory
 */
async function saveValidatedCV(text, fileName) {
  try {
    const cvVersionsDir = path.join(process.cwd(), 'cv-versions');
    const outputPath = path.join(cvVersionsDir, fileName);
    
    await fs.writeFile(outputPath, text, 'utf-8');
    console.log(`\nSaved validated CV to: ${chalk.blue(outputPath)}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error saving validated CV:', error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  // Check if a file path was provided
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
CV Validator and Comparator
---------------------------

Usage: node utils/cv-validator.js <input_file_path>

This tool validates if a CV text belongs to Dawn Zurick Beilfuss by:
1. Checking for identity markers (name, email, phone)
2. Validating experience and skills alignment
3. Comparing with the most similar existing CV
4. Showing a diff of changes

If valid, the CV can be saved to the cv-versions directory.

Example:
  node utils/cv-validator.js new-resume.txt
    `);
    process.exit(0);
  }
  
  const inputFilePath = args[0];
  
  try {
    // Load the input file
    const inputText = await fs.readFile(inputFilePath, 'utf-8');
    console.log(`\n${chalk.cyan('CV Validator')} - Analyzing ${chalk.yellow(inputFilePath)}\n`);
    
    // Validate identity
    const identityValidation = validateIdentity(inputText);
    
    if (identityValidation.isValid) {
      console.log(`${chalk.green('✓')} Identity validation passed (${chalk.green(Math.round(identityValidation.percentageFound))}% of markers found)`);
    } else {
      console.log(`${chalk.red('✗')} Identity validation failed (${chalk.red(Math.round(identityValidation.percentageFound))}% of markers found)`);
      console.log(`   Missing identity markers: ${chalk.yellow(identityValidation.missingMarkers.join(', '))}`);
      console.log(`\n${chalk.red('This does not appear to be Dawn Zurick Beilfuss\\'s CV.')}`);
      process.exit(1);
    }
    
    // Validate content
    const contentValidation = validateContent(inputText);
    
    if (contentValidation.isConsistent) {
      console.log(`${chalk.green('✓')} Content validation passed (Experience: ${chalk.green(Math.round(contentValidation.experienceScore))}%, Skills: ${chalk.green(Math.round(contentValidation.skillsScore))}%)`);
    } else {
      console.log(`${chalk.yellow('⚠')} Content validation warning:`);
      console.log(`   Experience score: ${chalk.yellow(Math.round(contentValidation.experienceScore))}%`);
      console.log(`   Skills score: ${chalk.yellow(Math.round(contentValidation.skillsScore))}%`);
      
      if (contentValidation.missingExperience.length > 0) {
        console.log(`   Missing expected experience: ${chalk.yellow(contentValidation.missingExperience.join(', '))}`);
      }
      
      if (contentValidation.missingSkills.length > 0) {
        console.log(`   Missing expected skills: ${chalk.yellow(contentValidation.missingSkills.join(', '))}`);
      }
      
      console.log(`\n${chalk.yellow('This CV appears to be incomplete or differs significantly from Dawn\\'s normal format.')}`);
    }
    
    // Find best match for comparison
    console.log(`\n${chalk.cyan('Finding most similar existing CV for comparison...')}`);
    const bestMatch = await findBestMatch(inputText);
    
    if (bestMatch) {
      compareAndShowDiff(inputText, bestMatch, bestMatch.name);
      
      // Ask to save validated CV
      console.log(`\n${chalk.cyan('Validation complete')}`);
      
      const fileName = path.basename(inputFilePath, path.extname(inputFilePath)) + '.md';
      await saveValidatedCV(inputText, fileName);
      
      // Suggest next steps
      console.log(`\nNext steps:`);
      console.log(`1. Generate PDF version: ${chalk.yellow('node utils/generate-pdf.js')}`);
      console.log(`2. Copy to appropriate sector directory: ${chalk.yellow(`cp cv-versions/${fileName} output/[sector]/`)}`);
      
    } else {
      console.log(`${chalk.yellow('⚠')} Could not find a similar CV to compare with.`);
    }
    
  } catch (error) {
    console.error('Error processing file:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();