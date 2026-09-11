#!/usr/bin/env node

/**
 * Dawn's Fork Customization Script
 *
 * Seeds the canonical profile file (base-info.json at the repo root) with a
 * placeholder skeleton for a fresh fork. Non-destructive: if base-info.json
 * already holds real data (a contact email that is not an example.com
 * placeholder) it prints a notice and exits 0 without writing anything.
 *
 * data/base-info.json is synced from the root file by scripts/serve-api.js
 * (PUT /profile) or by copying; this script never touches it.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), '..');
const baseInfoPath = path.join(rootDir, 'base-info.json');

const placeholderInfo = {
  name: 'Dawn Zurick-Beilfuss',
  title: 'Certified EKG Technician',
  email: 'dawn@example.com', // placeholder - replace with the real address
  phone: '(555) 123-4567', // placeholder - replace with the real number
  location: 'Your City, State'
};

function isCustomized(filePath) {
  if (!fs.existsSync(filePath)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const email = data?.personalInfo?.contact?.email;
    return typeof email === 'string' && email.length > 0 && !email.includes('example.com');
  } catch {
    // Unreadable/invalid JSON: treat as NOT customized so the caller can decide,
    // but never overwrite silently - see customizeFork().
    return false;
  }
}

function buildPlaceholderProfile() {
  return {
    personalInfo: {
      name: { first: 'Dawn', last: 'Zurick-Beilfuss', full: placeholderInfo.name },
      contact: {
        email: placeholderInfo.email,
        phone: placeholderInfo.phone,
        location: placeholderInfo.location
      },
      professionalTitle: placeholderInfo.title,
      summary:
        'Certified EKG Technician with strong analytical skills and attention to detail. Successfully transitioned from real estate to healthcare, bringing customer service excellence and professional communication skills to medical environments.'
    },
    certifications: [
      { name: 'EKG Technician Certification', issuer: 'Healthcare Certification Board', date: '2024', status: 'Active' }
    ],
    skills: [
      { name: 'EKG Testing', level: 'Expert', category: 'Medical' },
      { name: 'Patient Care', level: 'Advanced', category: 'Healthcare' },
      { name: 'Medical Terminology', level: 'Proficient', category: 'Healthcare' },
      { name: 'Healthcare Compliance', level: 'Proficient', category: 'Healthcare' },
      { name: 'Customer Service', level: 'Expert', category: 'Soft Skills' },
      { name: 'Communication', level: 'Expert', category: 'Soft Skills' }
    ],
    preferences: {
      targetIndustries: ['Healthcare', 'Medical Testing', 'Cardiology'],
      preferredRoles: ['EKG Technician', 'Medical Technician', 'Healthcare Support'],
      workEnvironment: 'Healthcare Facility',
      availability: 'Full-time'
    }
  };
}

async function customizeFork() {
  console.log('🎯 Customizing dzb-cv for Dawn Zurick-Beilfuss...\n');

  if (isCustomized(baseInfoPath)) {
    console.log(`✅ Profile already customized: ${path.relative(rootDir, baseInfoPath)} contains real contact data.`);
    console.log('   Nothing written. Edit base-info.json directly to update your profile.');
    return;
  }

  if (fs.existsSync(baseInfoPath)) {
    // File exists but is a placeholder (or unparseable). Refuse to clobber unless explicitly asked.
    if (!process.argv.includes('--force')) {
      console.log(`⚠️  ${path.relative(rootDir, baseInfoPath)} exists but looks like a placeholder or is not valid JSON.`);
      console.log('   Re-run with --force to overwrite it with a fresh placeholder skeleton. Nothing written.');
      return;
    }
  }

  fs.writeFileSync(baseInfoPath, JSON.stringify(buildPlaceholderProfile(), null, 2) + '\n');
  console.log(`✅ Wrote placeholder profile to ${path.relative(rootDir, baseInfoPath)}`);
  console.log('\n📋 Next Steps:');
  console.log('1. Replace the placeholder contact details in base-info.json');
  console.log('2. Set up your AI API keys in .env');
  console.log('3. Run: npm run generate:ekg-cv');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  customizeFork().catch((error) => {
    console.error('❌ Error during customization:', error.message);
    process.exit(1);
  });
}

export { customizeFork };
