import fs from 'fs/promises';
import path from 'path';
import { ResumeAnalysisEngine } from '../src/ats/engine.js';

const JOB_POSTINGS_DIR = 'job-postings';
const GENERATED = 'generated';
const SOURCE = 'source';
const ANALYSIS = 'analysis';
const UPLOADABLE_EXTS = ['.pdf', '.docx'];
const CV_KEYWORDS = ['cv', 'resume'];
const COVER_KEYWORDS = ['cover', 'letter'];
const NAME = 'dawn_zurick_beilfuss';

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
    try {
      await fs.mkdir(subPath, { recursive: true });
    } catch {}
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
        await fs.rename(src, dest).catch(() => {});
        console.log(`Moved and renamed: ${src} -> ${dest}`);
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
      console.log(`Scored: ${filePath}`);
    } catch (e: any) {
      console.warn(`Failed to score ${filePath}:`, e.message);
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
  await fs.writeFile(path.join(JOB_POSTINGS_DIR, 'catalog.json'), JSON.stringify(catalog, null, 2));
  console.log('Catalog written to job-postings/catalog.json');
}

main().catch((e: any) => {
  console.error(e);
  process.exit(1);
});
