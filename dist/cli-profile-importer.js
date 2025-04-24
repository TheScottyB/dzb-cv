#!/usr/bin/env node
import * as fs from 'fs';
import { Command } from 'commander';
import { parseCvMarkdown } from './utils/cv-parser.js';
import { ProfileService } from './services/profile-service.js';
// Set up the command line interface
const program = new Command();
program
    .name('profile-importer')
    .description('Import CV documents into the profile management system')
    .version('1.0.0');
program
    .command('import-markdown')
    .description('Import a markdown CV document')
    .argument('<file>', 'Path to the markdown file')
    .option('-o, --owner <name>', 'Name of the profile owner', 'Dawn Zurick Beilfuss')
    .action(async (file, options) => {
    try {
        // Check if file exists
        if (!fs.existsSync(file)) {
            console.error(`Error: File '${file}' does not exist.`);
            process.exit(1);
        }
        // Read the markdown file
        const markdownContent = fs.readFileSync(file, 'utf8');
        console.log(`📄 Parsing CV markdown for ${options.owner}...`);
        // Parse the markdown into structured data using the specialized parser
        const profileData = parseCvMarkdown(markdownContent);
        console.log('✅ Parsing complete.');
        console.log(`📊 Found:`);
        console.log(`   - ${profileData.experience.length} work experiences`);
        console.log(`   - ${profileData.skills.length} skills`);
        console.log(`   - ${profileData.education.length} education entries`);
        console.log(`   - ${profileData.certifications.length} certifications`);
        // Create a profile service instance
        const profileService = new ProfileService();
        console.log(`💾 Creating profile for ${profileData.basicInfo.name || options.owner}...`);
        // Create a profile using the parsed data
        const profile = await profileService.createProfile(options.owner, profileData);
        console.log(`✅ Profile created successfully!`);
        console.log(`   Profile ID: ${profile.id}`);
        console.log(`   Version ID: ${profile.currentVersionId}`);
    }
    catch (error) {
        console.error('❌ Error processing CV:', error);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli-profile-importer.js.map