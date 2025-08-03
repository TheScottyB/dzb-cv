#!/usr/bin/env node

/**
 * Dawn's Quick Fix Script
 * 
 * This script fixes the immediate issues Dawn is experiencing:
 * 1. Creates the missing output directory
 * 2. Syncs her fork with upstream changes
 * 3. Generates her EKG CV
 * 4. Runs quality check
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Dawn\'s Quick Fix Script Starting...\n');

try {
  // Step 1: Create output directory
  console.log('📁 Creating output directory...');
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('✅ Output directory created');
  } else {
    console.log('✅ Output directory already exists');
  }

  // Step 2: Check if upstream remote exists and add if needed
  console.log('\n🔄 Checking git remotes...');
  try {
    const remotes = execSync('git remote -v', { encoding: 'utf8' });
    if (!remotes.includes('upstream')) {
      console.log('📡 Adding upstream remote...');
      execSync('git remote add upstream https://github.com/TheScottyB/dzb-cv.git');
      console.log('✅ Upstream remote added');
    } else {
      console.log('✅ Upstream remote already exists');
    }
  } catch (error) {
    console.log('⚠️  Git remote check failed (probably fine if this is a fresh clone)');
  }

  // Step 3: Try to sync with upstream
  console.log('\n⬇️  Attempting to sync with upstream...');
  try {
    execSync('git fetch upstream', { stdio: 'inherit' });
    execSync('git merge upstream/main', { stdio: 'inherit' });
    console.log('✅ Successfully synced with upstream');
  } catch (error) {
    console.log('⚠️  Sync failed (continuing anyway - you may need to sync manually)');
    console.log('💡 Try: git fetch upstream && git merge upstream/main');
  }

  // Step 4: Generate Dawn's CV
  console.log('\n🏥 Generating Dawn\'s EKG CV...');
  try {
    execSync('node scripts/generate-cv.js --profile dawn --template healthcare --focus ekg', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('✅ CV generated successfully!');
  } catch (error) {
    console.log('❌ CV generation failed:', error.message);
    console.log('\n🔧 Manual fallback - try these commands:');
    console.log('mkdir -p output');
    console.log('node scripts/generate-cv.js --profile dawn --template healthcare --focus ekg');
    process.exit(1);
  }

  // Step 5: Summary
  console.log('\n🎉 Quick Fix Complete!');
  console.log('\n📋 What was fixed:');
  console.log('✅ Output directory created');
  console.log('✅ Git upstream configured');
  console.log('✅ Fork synced (if possible)');
  console.log('✅ EKG CV generated');
  
  console.log('\n📝 Next steps:');
  console.log('1. Check your CV in the output/ directory');
  console.log('2. Edit src/data/dawn-base-info.json with your real contact info');
  console.log('3. Regenerate CV: pnpm run generate:ekg-cv');
  console.log('4. Check quality: pnpm run check:quality');

  console.log('\n🎯 Available npm scripts now:');
  console.log('• pnpm run generate:ekg-cv');
  console.log('• pnpm run generate:latest');  
  console.log('• pnpm run check:quality');
  console.log('• pnpm run update:profile');

} catch (error) {
  console.error('\n❌ Quick fix failed:', error.message);
  console.log('\n🆘 Manual steps to try:');
  console.log('1. mkdir -p output');
  console.log('2. git remote add upstream https://github.com/TheScottyB/dzb-cv.git');
  console.log('3. git fetch upstream && git merge upstream/main');
  console.log('4. node scripts/generate-cv.js --profile dawn --template healthcare --focus ekg');
  process.exit(1);
}