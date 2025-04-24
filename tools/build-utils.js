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
  { src: 'src/data', dest: 'dist/data' }
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

