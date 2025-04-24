#!/usr/bin/env node

/**
 * Utility script to copy assets to the dist directory during build
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Source and destination directories
const ASSET_MAPPING = [
  { src: 'src/templates', dest: 'dist/templates' },
  { src: 'src/components', dest: 'dist/components' },
  { src: 'src/data', dest: 'dist/data' },
  { src: 'src/styles', dest: 'dist/styles' }
];

/**
 * Copies a directory recursively
 */
async function copyDir(src, dest) {
  // Ensure destination directory exists
  await fs.mkdir(dest, { recursive: true });
  
  // Read source directory contents
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      await copyDir(srcPath, destPath);
    } else {
      // Copy file
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Main function to copy all assets
 */
async function copyAssets() {
  for (const { src, dest } of ASSET_MAPPING) {
    const srcPath = join(PROJECT_ROOT, src);
    const destPath = join(PROJECT_ROOT, dest);
    
    try {
      // Check if source directory exists
      await fs.access(srcPath);
      
      // Copy directory
      await copyDir(srcPath, destPath);
      console.log(`✓ Copied ${src} to ${dest}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`⚠ Source directory ${src} does not exist, skipping.`);
      } else {
        console.error(`❌ Error copying ${src} to ${dest}:`, error);
      }
    }
  }
}

// Run the copy operation
copyAssets().catch(error => {
  console.error('Asset copy failed:', error);
  process.exit(1);
});
