import { promises as fs } from 'fs';
import path from 'path';
import { ResumeAnalysisEngine } from '../ats/engine.js';

async function main() {
  // Check if file path is provided
  if (process.argv.length < 3) {
    console.error('Usage: score-resume <resume-file-path> [job-id]');
    process.exit(1);
  }

  const filePath = process.argv[2];
  const jobId = process.argv.length > 3 ? process.argv[3] : undefined;

  try {
    // Read the file
    const buffer = await fs.readFile(filePath);

    // Determine MIME type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
    };
    const mimeType = mimeTypes[ext];

    if (!mimeType) {
      throw new Error(
        `Unsupported file type: ${ext}. Supported types: ${Object.keys(mimeTypes).join(', ')}`
      );
    }

    // Initialize the analysis engine with default options
    const engine = new ResumeAnalysisEngine({});

    // Analyze the resume
    const result = await engine.analyzeResume(buffer, mimeType, jobId);

    // Print the results
    console.log('\nResume Analysis Results:');
    console.log('=======================');
    console.log(`Overall Score: ${result.combinedScore.toFixed(2)}%`);

    if (result.mlAnalysis) {
      console.log('\nML Analysis:');
      console.log(`- Skills Match: ${result.mlAnalysis.categoryMatches.skills.toFixed(2)}%`);
      console.log(
        `- Experience Match: ${result.mlAnalysis.categoryMatches.experience.toFixed(2)}%`
      );
      console.log(`- Education Match: ${result.mlAnalysis.categoryMatches.education.toFixed(2)}%`);

      if (result.mlAnalysis.missingSkills.length > 0) {
        console.log('\nMissing Skills:');
        result.mlAnalysis.missingSkills.forEach((skill) => console.log(`- ${skill}`));
      }
    }

    if (result.atsAnalysis) {
      console.log('\nATS Analysis:');
      console.log(`- ATS Score: ${result.atsAnalysis.score.toFixed(2)}%`);
      console.log(`- Parse Rate: ${result.atsAnalysis.parseRate.toFixed(2)}%`);

      if (result.atsAnalysis.issues.length > 0) {
        console.log('\nATS Issues:');
        result.atsAnalysis.issues.forEach((issue) => console.log(`- ${issue.message}`));
      }

      if (result.atsAnalysis.keywords.missing.length > 0) {
        console.log('\nMissing Keywords:');
        result.atsAnalysis.keywords.missing.forEach((keyword) => console.log(`- ${keyword}`));
      }
    }

    if (result.suggestions.length > 0) {
      console.log('\nSuggestions for Improvement:');
      result.suggestions.forEach((suggestion) => console.log(`- ${suggestion}`));
    }
  } catch (error) {
    console.error('Error analyzing resume:', error);
    process.exit(1);
  }
}

main();
