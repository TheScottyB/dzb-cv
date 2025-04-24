import { analyzeJobPosting } from './utils/job-analyzer.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * CLI for analyzing job postings
 *
 * Takes a job posting URL as input and produces a structured analysis
 * that can be used to tailor CVs for specific job applications.
 */
async function main() {
    const args = process.argv.slice(2);
    // Check for help command
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        console.log(`
Job Posting Analyzer CLI
------------------------
Analyzes job postings from URLs and extracts key information to help tailor your CV.

Usage:
  node dist/cli-job-analyzer.js [options] <job-posting-url>

Options:
  --output=<path>       Save analysis to a JSON file
  --force-generic       Force using the generic parser for any site
  --no-rate-limit       Disable rate limiting (use with caution)
  --help, -h            Show this help message

Examples:
  node dist/cli-job-analyzer.js https://linkedin.com/jobs/view/12345
  node dist/cli-job-analyzer.js --output=analysis.json https://indeed.com/job/software-engineer
    `);
        process.exit(0);
    }
    // Extract URL and options
    const urlArg = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-'));
    if (!urlArg) {
        console.error('Error: No job posting URL provided');
        process.exit(1);
    }
    // Parse options
    const outputArg = args.find(arg => arg.startsWith('--output='));
    const outputPath = outputArg ? outputArg.split('=')[1] : null;
    const forceGeneric = args.includes('--force-generic');
    const noRateLimit = args.includes('--no-rate-limit');
    try {
        console.log(`Analyzing job posting from ${urlArg}...`);
        const result = await analyzeJobPosting(urlArg, {
            skipRateLimiting: noRateLimit,
            forceGenericParser: forceGeneric
        });
        // Print summary to console
        console.log('\nJob Analysis Summary:');
        console.log('---------------------');
        console.log(`Title: ${result.title}`);
        console.log(`Company: ${result.company}`);
        if (result.location)
            console.log(`Location: ${result.location}`);
        if (result.jobType)
            console.log(`Job Type: ${result.jobType}`);
        if (result.experienceLevel)
            console.log(`Experience Level: ${result.experienceLevel}`);
        console.log('\nKey Terms for CV Tailoring:');
        console.log(result.keyTerms.join(', '));
        if (result.salaryRange) {
            const min = result.salaryRange.min ? `$${result.salaryRange.min.toLocaleString()}` : '?';
            const max = result.salaryRange.max ? `$${result.salaryRange.max.toLocaleString()}` : '?';
            const period = result.salaryRange.period || 'yearly';
            console.log(`\nSalary Range: ${min} - ${max} (${period})`);
        }
        // Save to file if output path is provided
        if (outputPath) {
            const outputContent = JSON.stringify(result, null, 2);
            await fs.writeFile(outputPath, outputContent);
            console.log(`\nFull analysis saved to: ${outputPath}`);
        }
        else {
            console.log('\nResponsibilities:');
            result.responsibilities.forEach(r => console.log(`- ${r}`));
            console.log('\nQualifications:');
            result.qualifications.forEach(q => console.log(`- ${q}`));
            if (result.educationRequirements && result.educationRequirements.length > 0) {
                console.log('\nEducation Requirements:');
                result.educationRequirements.forEach(e => console.log(`- ${e}`));
            }
        }
        console.log('\nCV Tailoring Suggestions:');
        console.log('1. Highlight matching skills in your professional summary');
        console.log('2. Adjust your work experience descriptions to emphasize relevant responsibilities');
        console.log('3. Use similar terminology/keywords throughout your CV');
        console.log('4. Update your skills section to prioritize the most relevant ones');
    }
    catch (error) {
        console.error('Error analyzing job posting:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
main();
//# sourceMappingURL=cli-job-analyzer.js.map