import * as fs from 'fs';
import * as path from 'path';
import { parseCvMarkdown } from '../utils/cv-parser.js';
import { ProfileService } from '../services/profile-service.js';
/**
 * Test function to process Dawn's Markdown CV and create a profile
 */
export async function testCvParser() {
    try {
        // Read the markdown file
        const cvPath = path.resolve(__dirname, '../../assets/documents/__Dawn Zurick Beilfuss__.md');
        const markdownContent = fs.readFileSync(cvPath, 'utf8');
        // Parse the markdown into structured data
        const profileData = parseCvMarkdown(markdownContent);
        // Create a profile service instance (would normally connect to a database)
        const profileService = new ProfileService();
        // Create a profile using the parsed data
        const profile = await profileService.createProfile('Dawn Zurick Beilfuss', profileData);
        // Output a summary of the parsed data for verification
        console.log('✅ Profile created successfully!');
        outputProfileSummary(profileData);
        return Promise.resolve();
    }
    catch (error) {
        console.error('❌ Error processing CV:', error);
        return Promise.reject(error);
    }
}
/**
 * Outputs a summary of the parsed profile data
 */
function outputProfileSummary(data) {
    console.log('\n======= PROFILE SUMMARY =======\n');
    // Basic Info
    console.log('👤 BASIC INFO:');
    console.log(`Name: ${data.basicInfo.name}`);
    console.log(`Email: ${data.basicInfo.email}`);
    console.log(`Phone: ${data.basicInfo.phone}`);
    console.log(`Location: ${data.basicInfo.location}`);
    console.log(`Title: ${data.basicInfo.title}`);
    console.log(`Summary: ${data.basicInfo.summary.substring(0, 100)}...`);
    // Work Experience
    console.log('\n💼 WORK EXPERIENCE:');
    data.experience.forEach((exp, index) => {
        console.log(`\n${index + 1}. ${exp.title} at ${exp.company}`);
        console.log(`   Location: ${exp.location}`);
        console.log(`   Period: ${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'}`);
        console.log(`   Achievements: ${exp.achievements.length} entries`);
    });
    // Skills
    console.log('\n🛠️ SKILLS:');
    const categories = [...new Set(data.skills.map(skill => skill.category))];
    categories.forEach(category => {
        const categorySkills = data.skills.filter(skill => skill.category === category);
        console.log(`\n${category}: ${categorySkills.map(s => s.name).join(', ')}`);
    });
    // Education
    console.log('\n🎓 EDUCATION:');
    data.education.forEach((edu, index) => {
        console.log(`\n${index + 1}. ${edu.degree} in ${edu.fieldOfStudy}`);
        console.log(`   Institution: ${edu.institution}`);
        console.log(`   Completion: ${edu.endDate ? formatDate(edu.endDate) : 'Ongoing'}`);
    });
    // Certifications
    console.log('\n📜 CERTIFICATIONS:');
    data.certifications.forEach((cert, index) => {
        console.log(`\n${index + 1}. ${cert.name}`);
        console.log(`   Issuer: ${cert.issuer}`);
        console.log(`   Obtained: ${formatDate(cert.dateObtained)}`);
        console.log(`   Status: ${cert.expirationDate ? `Expires ${formatDate(cert.expirationDate)}` : 'Current'}`);
    });
    // Projects
    console.log('\n🏆 PROJECTS/VOLUNTEER WORK:');
    data.projects.forEach((proj, index) => {
        console.log(`\n${index + 1}. ${proj.name}`);
        console.log(`   Description: ${proj.description.substring(0, 100) || 'N/A'}`);
        console.log(`   Highlights: ${proj.highlights.length} entries`);
    });
    console.log('\n======= END OF SUMMARY =======\n');
}
/**
 * Helper function to format dates
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
}
// If the file is executed directly, run the test
if (require.main === module) {
    testCvParser()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
//# sourceMappingURL=cv-parser.test.js.map