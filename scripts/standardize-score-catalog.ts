import fs from 'fs/promises';
import path from 'path';
import { ResumeAnalysisEngine } from '../src/ats/engine.js';
import chalk from 'chalk';

const JOB_POSTINGS_DIR = 'job-postings';
const GENERATED = 'generated';
const SOURCE = 'source';
const ANALYSIS = 'analysis';
const UPLOADABLE_EXTS = ['.pdf', '.docx'];
const CV_KEYWORDS = ['cv', 'resume'];
const COVER_KEYWORDS = ['cover', 'letter'];
const NAME = 'dawn_zurick_beilfuss';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

function logAction(msg: string) {
  console.log(chalk.blueBright('ℹ️'), msg);
}
function logMove(src: string, dest: string) {
  console.log(chalk.green('📦 Move'), chalk.yellow(src), chalk.cyan('→'), chalk.yellow(dest));
}
function logScore(file: string) {
  console.log(chalk.magenta('📝 Scoring'), chalk.yellow(file));
}
function logWrite(file: string) {
  console.log(chalk.green('💾 Write'), chalk.yellow(file));
}
function logWarn(msg: string) {
  console.warn(chalk.red('⚠️'), msg);
}

type CatalogEntry = {
  job_posting: string;
  file: string;
  type: string;
  score: number;
  ats: any;
  ml: any;
  suggestions: string[];
};

async function ensureSubfolders(dir: string) {
  for (const sub of [SOURCE, GENERATED, ANALYSIS]) {
    const subPath = path.join(dir, sub);
    if (DRY_RUN) {
      logAction(`Would ensure folder: ${subPath}`);
    } else {
      try {
        await fs.mkdir(subPath, { recursive: true });
      } catch {}
    }
  }
}

function detectType(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (CV_KEYWORDS.some((k) => lower.includes(k))) return 'cv';
  if (COVER_KEYWORDS.some((k) => lower.includes(k))) return 'cover_letter';
  return null;
}

async function moveAndStandardizeFiles(jobDir: string) {
  const entries = await fs.readdir(jobDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (UPLOADABLE_EXTS.includes(ext)) {
        const type = detectType(entry.name);
        if (!type) continue;
        const newName = `${NAME}_${type}${ext}`;
        const dest = path.join(jobDir, GENERATED, newName);
        const src = path.join(jobDir, entry.name);
        if (DRY_RUN) {
          logMove(src, dest);
        } else {
          await fs.rename(src, dest).catch(() => {});
          logMove(src, dest);
        }
      }
    }
  }
}

async function scoreFiles(jobDir: string, catalog: CatalogEntry[]) {
  const genDir = path.join(jobDir, GENERATED);
  let files: string[];
  try {
    files = await fs.readdir(genDir);
  } catch {
    return;
  }
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!UPLOADABLE_EXTS.includes(ext)) continue;
    const type = detectType(file);
    if (!type) continue;
    const filePath = path.join(genDir, file);
    if (DRY_RUN) {
      logScore(filePath);
      logWrite(path.join(jobDir, ANALYSIS, `${type}_score.json`));
      continue;
    }
    try {
      const buffer = await fs.readFile(filePath);
      const mimeType =
        ext === '.pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const engine = new ResumeAnalysisEngine({});
      const result = await engine.analyzeResume(buffer, mimeType);
      catalog.push({
        job_posting: path.basename(jobDir),
        file: filePath,
        type,
        score: result.combinedScore,
        ats: result.atsAnalysis || null,
        ml: result.mlAnalysis || null,
        suggestions: result.suggestions || [],
      });
      // Write per-file analysis
      const analysisDir = path.join(jobDir, ANALYSIS);
      await fs.mkdir(analysisDir, { recursive: true });
      await fs.writeFile(
        path.join(analysisDir, `${type}_score.json`),
        JSON.stringify(result, null, 2),
      );
      logScore(filePath);
      logWrite(path.join(analysisDir, `${type}_score.json`));
    } catch (e: any) {
      logWarn(`Failed to score ${filePath}: ${e.message}`);
    }
  }
}

async function main() {
  const postings = await fs.readdir(JOB_POSTINGS_DIR);
  const catalog: CatalogEntry[] = [];
  for (const posting of postings) {
    const jobDir = path.join(JOB_POSTINGS_DIR, posting);
    const stat = await fs.stat(jobDir).catch(() => null);
    if (!stat || !stat.isDirectory()) continue;
    await ensureSubfolders(jobDir);
    await moveAndStandardizeFiles(jobDir);
    await scoreFiles(jobDir, catalog);
  }
  // Write catalog
  if (DRY_RUN) {
    logWrite(path.join(JOB_POSTINGS_DIR, 'catalog.json'));
    logAction('Dry run complete! No files were changed.');
  } else {
    await fs.writeFile(
      path.join(JOB_POSTINGS_DIR, 'catalog.json'),
      JSON.stringify(catalog, null, 2),
    );
    logWrite(path.join(JOB_POSTINGS_DIR, 'catalog.json'));
    logAction('Catalog written to job-postings/catalog.json');
  }
}

main().catch((e: any) => {
  logWarn(e);
  process.exit(1);
});
