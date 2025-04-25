import * as fs from 'fs';
import * as path from 'path';
import { createProfileFromMarkdown } from '../../../scripts/markdown-profile-parser.js';
/**
 * Test the markdown parser with Dawn's CV
 */
export async function testMarkdownParser() {
    try {
        // Read the markdown file
        const cvPath = path.resolve(__dirname, '../../assets/documents/__Dawn Zurick Beilfuss__.md');
        const markdownContent = fs.readFileSync(cvPath, 'utf8');
        // Parse the markdown
        console.log('Parsing Dawn\'s CV from markdown...');
        const profileData = createProfileFromMarkdown(markdownContent);
        // Output summary
        console.log('\n--- PROFILE SUMMARY ---\n');
        console.log(`Name: ${profileData.basicInfo.name}`);
        console.log(`Title: ${profileData.basicInfo.title}`);
        console.log(`Contact: ${profileData.basicInfo.email} | ${profileData.basicInfo.phone}`);
        console.log(`Location: ${profileData.basicInfo.location}`);
        console.log(`\nExperience entries: ${profileData.experience.length}`);
        profileData.experience.forEach((exp, i) => {
            console.log(`  ${i + 1}. ${exp.title} at ${exp.company} (${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'})`);
        });
        console.log(`\nSkill categories: ${new Set(profileData.skills.map(s => s.category)).size}`);
        // Display certification count
        console.log(`\nCertifications: ${profileData.certifications.length}`);
        // Display projects/volunteer work
        console.log(`\nProjects/Volunteer work: ${profileData.projects.length}`);
        console.log('\n--- END OF SUMMARY ---');
        return Promise.resolve();
    }
    catch (error) {
        console.error('Error processing CV:', error);
        return Promise.reject(error);
    }
}
/**
 * Format a date for display
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
}
// Execute test if run directly
if (require.main === module) {
    testMarkdownParser()
        .then(() => console.log('Test completed successfully'))
        .catch(err => {
        console.error('Test failed:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=markdown-parser.test.js.map