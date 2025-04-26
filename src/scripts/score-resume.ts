import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';
import { ResumeAnalysisEngine } from '../ats/engine.js';
import { getJobPostingFolderName } from '../shared/utils/job-metadata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPLOADABLE_EXTS = ['.pdf', '.docx'];

type MimeTypeMap = {
  [key: string]: string;
};

async function resolveJobDirOrFile(
  inputPath: string,
): Promise<{ files: string[]; context: string }> {
  // If input is a job-data.json file, resolve the folder name and score all resumes in generated/
  if (inputPath.endsWith('job-data.json')) {
    const folderName = await getJobPostingFolderName(inputPath);
    if (!folderName) {
      throw new Error('Could not resolve folder name from job-data.json');
    }
    const jobDir = path.join('job-postings', folderName);
    console.log(chalk.green('📂 Resolved job posting folder:'), chalk.yellow(jobDir));
    const genDir = path.join(jobDir, 'generated');
    let files: string[] = [];
    try {
      files = (await fs.readdir(genDir))
        .filter((f) => UPLOADABLE_EXTS.includes(path.extname(f).toLowerCase()))
        .map((f) => path.join(genDir, f));
    } catch {
      throw new Error(`No generated/ folder found in ${jobDir}`);
    }
    if (files.length === 0) throw new Error(`No resumes found in ${genDir}`);
    return { files, context: jobDir };
  }
  // If input is a folder, score all resumes in generated/
  const stat = await fs.stat(inputPath).catch(() => null);
  if (stat && stat.isDirectory()) {
    const jobDataPath = path.join(inputPath, 'job-data.json');
    try {
      await fs.access(jobDataPath);
      const folderName = await getJobPostingFolderName(jobDataPath);
      if (!folderName) {
        throw new Error('Could not resolve folder name from job-data.json in folder');
      }
      const expectedDir = path.join('job-postings', folderName);
      if (path.resolve(inputPath) !== path.resolve(expectedDir)) {
        console.warn(
          chalk.yellow('⚠️  Warning:'),
          'Folder name does not match standardized convention. Expected:',
          chalk.cyan(expectedDir),
        );
      }
    } catch {
      console.warn(
        chalk.yellow(
          '⚠️  Warning: No job-data.json found in folder. Cannot verify standardization.',
        ),
      );
    }
    const genDir = path.join(inputPath, 'generated');
    let files: string[] = [];
    try {
      files = (await fs.readdir(genDir))
        .filter((f) => UPLOADABLE_EXTS.includes(path.extname(f).toLowerCase()))
        .map((f) => path.join(genDir, f));
    } catch {
      throw new Error(`No generated/ folder found in ${inputPath}`);
    }
    if (files.length === 0) throw new Error(`No resumes found in ${genDir}`);
    return { files, context: inputPath };
  }
  // Otherwise, treat as a single file
  return { files: [inputPath], context: inputPath };
}

async function scoreResume(filePath: string, jobId?: string) {
  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: MimeTypeMap = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
    };
    const mimeType = mimeTypes[ext];
    if (!mimeType) {
      throw new Error(
        `Unsupported file type: ${ext}. Supported types: ${Object.keys(mimeTypes).join(', ')}`,
      );
    }
    const engine = new ResumeAnalysisEngine({});
    const result = await engine.analyzeResume(buffer, mimeType, jobId);
    // Print the results
    console.log(chalk.blueBright('\nResume Analysis Results for:'), chalk.yellow(filePath));
    console.log('=======================');
    console.log(`Overall Score: ${result.combinedScore.toFixed(2)}%`);
    if (result.mlAnalysis) {
      console.log('\nML Analysis:');
      console.log(`- Skills Match: ${result.mlAnalysis.categoryMatches.skills.toFixed(2)}%`);
      console.log(
        `- Experience Match: ${result.mlAnalysis.categoryMatches.experience.toFixed(2)}%`,
      );
      console.log(`- Education Match: ${result.mlAnalysis.categoryMatches.education.toFixed(2)}%`);
      if (result.mlAnalysis.missingSkills.length > 0) {
        console.log('\nMissing Skills:');
        result.mlAnalysis.missingSkills.forEach((skill: string) => console.log(`- ${skill}`));
      }
    }
    if (result.atsAnalysis) {
      console.log('\nATS Analysis:');
      console.log(`- ATS Score: ${result.atsAnalysis.score.toFixed(2)}%`);
      console.log(`- Parse Rate: ${result.atsAnalysis.parseRate.toFixed(2)}%`);
      if (result.atsAnalysis.issues.length > 0) {
        console.log('\nATS Issues:');
        result.atsAnalysis.issues.forEach((issue: { message: string }) =>
          console.log(`- ${issue.message}`),
        );
      }
      if (result.atsAnalysis.keywords.missing.length > 0) {
        console.log('\nMissing Keywords:');
        result.atsAnalysis.keywords.missing.forEach((keyword: string) =>
          console.log(`- ${keyword}`),
        );
      }
    }
    if (result.suggestions.length > 0) {
      console.log('\nSuggestions for Improvement:');
      result.suggestions.forEach((suggestion: string) => console.log(`- ${suggestion}`));
    }
    console.log(chalk.green('✅'), 'Scoring complete for:', chalk.yellow(filePath));
  } catch (error: any) {
    console.error(chalk.red('❌'), 'Error analyzing resume:', error.message || error);
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.error(
      'Usage: pnpm tsx src/scripts/score-resume.ts <resume-file|job-posting-folder|job-data.json> [job-id]',
    );
    process.exit(1);
  }
  const inputPath = process.argv[2];
  const jobId = process.argv.length > 3 ? process.argv[3] : undefined;
  try {
    const { files, context } = await resolveJobDirOrFile(inputPath);
    for (const file of files) {
      await scoreResume(file, jobId);
    }
  } catch (error: any) {
    console.error(chalk.red('❌'), error.message || error);
    process.exit(1);
  }
}

main();
