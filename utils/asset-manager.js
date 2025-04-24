#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Asset Manager for CV Documents
 * 
 * This utility manages CV-related assets:
 * 1. Processes incoming files in assets directory
 * 2. Updates system data when relevant information is found
 * 3. Renames files to follow standardized naming conventions
 * 4. Records file processing history
 */

// Configuration
const ASSETS_DIR = path.join(process.cwd(), 'assets', 'documents');
const PROCESSED_DIR = path.join(ASSETS_DIR, 'processed');
const NAMING_CONVENTIONS = {
  resume: 'Dawn_Zurick_Beilfuss_{employer}_Resume.docx',
  cv: 'Dawn_Zurick_Beilfuss_{position}_{employer}_CV.docx',
  federal: 'Dawn_Zurick_Beilfuss_Federal_Resume.docx',
  certification: 'Dawn_Zurick_Beilfuss_{cert_name}_Certification.pdf',
  reference: 'Dawn_Zurick_Beilfuss_Reference_{person}.pdf'
};

/**
 * Ensures all required directories exist
 */
async function ensureDirectories() {
  try {
    await fs.mkdir(PROCESSED_DIR, { recursive: true });
    console.log(`✅ Verified processed directory: ${PROCESSED_DIR}`);
  } catch (error) {
    console.error(`❌ Error creating directories: ${error.message}`);
    throw error;
  }
}

/**
 * Lists all files in the assets directory
 */
async function listAssetFiles() {
  try {
    const files = await fs.readdir(ASSETS_DIR);
    // Only list files, not directories
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(ASSETS_DIR, file);
        const stats = await fs.stat(filePath);
        return { name: file, path: filePath, isDirectory: stats.isDirectory() };
      })
    );
    
    return fileStats.filter(file => !file.isDirectory);
  } catch (error) {
    console.error(`❌ Error listing assets: ${error.message}`);
    throw error;
  }
}

/**
 * Process a specific file based on its type
 */
async function processFile(filePath) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath).toLowerCase();
  
  console.log(`\nProcessing file: ${fileName}`);
  
  try {
    // Determine file type and process accordingly
    if (fileExt === '.docx') {
      if (fileName.toLowerCase().includes('resume') || fileName.toLowerCase().includes('cv')) {
        await processResumeFile(filePath);
      } else {
        console.log(`⚠️ Unknown DOCX file type: ${fileName}`);
      }
    } else if (fileExt === '.pdf') {
      console.log(`⚠️ PDF processing not yet implemented: ${fileName}`);
    } else {
      console.log(`⚠️ Unsupported file type ${fileExt}: ${fileName}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${fileName}: ${error.message}`);
  }
}

/**
 * Process a resume/CV file
 */
async function processResumeFile(filePath) {
  const fileName = path.basename(filePath);
  
  // Detect employer or context from filename
  let employer = 'Unknown';
  
  if (fileName.includes('BHGRE')) {
    employer = 'BHGRE';
  } else if (fileName.includes('Federal')) {
    employer = 'Federal';
  } else if (fileName.toLowerCase().includes('resume at ')) {
    // Extract employer from "Resume at XYZ" pattern
    const match = fileName.match(/Resume at (.+?)(\.|\s|$)/i);
    if (match && match[1]) {
      employer = match[1].trim();
    }
  }
  
  // Generate a standardized filename
  const newFileName = NAMING_CONVENTIONS.resume.replace('{employer}', employer);
  const newFilePath = path.join(ASSETS_DIR, newFileName);
  
  // Rename the file if it doesn't already have the standardized name
  if (fileName !== newFileName) {
    // Check if destination already exists to avoid overwriting
    try {
      await fs.access(newFilePath);
      console.log(`⚠️ Destination file already exists: ${newFileName}`);
      return;
    } catch (error) {
      // File doesn't exist, which is what we want
    }
    
    await fs.rename(filePath, newFilePath);
    console.log(`✅ Renamed file to: ${newFileName}`);
    
    // Record the processing
    await recordProcessedFile(fileName, newFileName, employer);
  } else {
    console.log(`✅ File already has standardized name: ${fileName}`);
  }
}

/**
 * Record information about processed file
 */
async function recordProcessedFile(originalName, newName, context) {
  const logFilePath = path.join(ASSETS_DIR, 'asset-processing-log.txt');
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] Renamed "${originalName}" to "${newName}" (Context: ${context})\n`;
  
  try {
    await fs.appendFile(logFilePath, logEntry);
  } catch (error) {
    console.error(`❌ Error recording processed file: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting Asset Manager...');
    
    // Ensure directories exist
    await ensureDirectories();
    
    // List files
    const files = await listAssetFiles();
    console.log(`\nFound ${files.length} files in assets directory.`);
    
    // Check if any command line arguments were provided
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
      // Process specific files mentioned in arguments
      for (const arg of args) {
        // Check if this is a file pattern or specific file
        if (arg.includes('*')) {
          // This is a pattern
          console.log(`⚠️ File pattern matching not implemented yet: ${arg}`);
        } else {
          // This is a specific file
          const filePath = path.join(ASSETS_DIR, arg);
          await processFile(filePath);
        }
      }
    } else {
      // Process all files
      for (const file of files) {
        await processFile(file.path);
      }
    }
    
    console.log('\n✅ Asset processing complete!');
    
  } catch (error) {
    console.error(`❌ Error in main process: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();