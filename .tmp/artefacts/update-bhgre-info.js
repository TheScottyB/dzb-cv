#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Tool to verify the BHGRE information in the base profile
 */
async function main() {
  try {
    // Load the base profile
    const baseProfilePath = path.join(process.cwd(), 'src', 'data', 'base-info.json');
    const baseProfileContent = await fs.readFile(baseProfilePath, 'utf-8');
    const baseProfile = JSON.parse(baseProfileContent);
    
    // Note: The original CV document was located at:
    // "/Users/scottybe/Workspace/dzb-cv/assets/documents/Resume at BHGRE .docx"
    // This has been renamed to:
    // "/Users/scottybe/Workspace/dzb-cv/assets/documents/renamed/Resume-BHGRE.docx"
    // for better compatibility with command-line tools.

    // Find the BHGRE entry in the profile
    let bhgreEntry = null;

    for (let i = 0; i < baseProfile.workExperience.realEstate.length; i++) {
      const entry = baseProfile.workExperience.realEstate[i];
      if (entry.employer && entry.employer.includes('Better Homes and Gardens')) {
        bhgreEntry = entry;
        break;
      }
    }

    if (!bhgreEntry) {
      console.error('BHGRE entry not found in base profile!');
      process.exit(1);
    }

    console.log('Current BHGRE entry in base profile:');
    console.log(JSON.stringify(bhgreEntry, null, 2));

    console.log('\nVerification complete!');
    console.log('\nThe BHGRE information in the base profile has been successfully updated with:');
    console.log('- Secondary office in Grayslake: ' + (bhgreEntry.address.includes('Grayslake') ? '✅ Included' : '❌ Missing'));
    console.log('- Supervisor information: ' + (bhgreEntry.supervisor ? '✅ Included (' + bhgreEntry.supervisor + ')' : '❌ Missing'));
    console.log('- Contact permission: ' + (bhgreEntry.mayContact ? '✅ Included' : '❌ Missing'));
    console.log('- Employment type: ' + (bhgreEntry.employmentType ? '✅ Included (' + bhgreEntry.employmentType + ')' : '❌ Missing'));
    console.log('- Hours: ' + (bhgreEntry.hours ? '✅ Included (' + bhgreEntry.hours + ')' : '❌ Missing'));
    console.log('- IDFPR compliance duties: ' + (bhgreEntry.duties.some(d => d.includes('IDFPR')) ? '✅ Included' : '❌ Missing'));
    console.log('- Illinois real estate law duties: ' + (bhgreEntry.duties.some(d => d.includes('Illinois real estate law')) ? '✅ Included' : '❌ Missing'));
    console.log('- Property transactions duties: ' + (bhgreEntry.duties.some(d => d.includes('transactions')) ? '✅ Included' : '❌ Missing'));

    // All checks passed
    if (bhgreEntry.address.includes('Grayslake') && 
        bhgreEntry.supervisor && 
        bhgreEntry.mayContact && 
        bhgreEntry.employmentType && 
        bhgreEntry.hours && 
        bhgreEntry.duties.some(d => d.includes('IDFPR')) &&
        bhgreEntry.duties.some(d => d.includes('Illinois real estate law')) &&
        bhgreEntry.duties.some(d => d.includes('transactions'))) {
      console.log('\n✅ All information has been successfully updated in the base profile!');
    } else {
      console.log('\n⚠️ Some information may be missing from the base profile.');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();