import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { getJobPostingFolderName } from '../src/shared/utils/job-metadata.js';

const JOB_POSTINGS_DIR = 'job-postings';
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

function logAction(msg: string) {
  console.log(chalk.blueBright('ℹ️'), msg);
}
function logMove(src: string, dest: string) {
  console.log(chalk.green('📦 Rename'), chalk.yellow(src), chalk.cyan('→'), chalk.yellow(dest));
}
function logWarn(msg: string) {
  console.warn(chalk.red('⚠️'), msg);
}

async function findJobDataFile(dir: string): Promise<string | null> {
  // Look for job-data.json in dir, source/, generated/, or application/
  const candidates = [
    path.join(dir, 'job-data.json'),
    path.join(dir, 'source', 'job-data.json'),
    path.join(dir, 'generated', 'job-data.json'),
    path.join(dir, 'application', 'job-data.json'),
  ];
  for (const file of candidates) {
    try {
      await fs.access(file);
      return file;
    } catch {}
  }
  return null;
}

async function main() {
  const postings = await fs.readdir(JOB_POSTINGS_DIR);
  for (const posting of postings) {
    const oldDir = path.join(JOB_POSTINGS_DIR, posting);
    const stat = await fs.stat(oldDir).catch(() => null);
    if (!stat || !stat.isDirectory()) continue;
    const jobDataPath = await findJobDataFile(oldDir);
    if (!jobDataPath) {
      logWarn(`No job-data.json found in ${oldDir}`);
      continue;
    }
    const newFolder = await getJobPostingFolderName(jobDataPath);
    if (!newFolder) {
      logWarn(`Could not determine new folder name for ${oldDir}`);
      continue;
    }
    const newDir = path.join(JOB_POSTINGS_DIR, newFolder);
    if (oldDir === newDir) {
      logAction(`Already standardized: ${oldDir}`);
      continue;
    }
    if (DRY_RUN) {
      logMove(oldDir, newDir);
    } else {
      try {
        await fs.rename(oldDir, newDir);
        logMove(oldDir, newDir);
      } catch (e: any) {
        logWarn(`Failed to rename ${oldDir} → ${newDir}: ${e.message}`);
      }
    }
  }
  logAction('Folder renaming complete.');
}

main().catch((e: any) => {
  logWarn(e);
  process.exit(1);
});
