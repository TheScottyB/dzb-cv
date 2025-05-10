import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Project root directory (2 levels up from utils)
const PROJECT_ROOT = join(__dirname, '..', '..');
/**
 * Resolves a path relative to the project's data directory
 * @param relPath Relative path within the data directory
 * @returns Absolute path to the requested resource
 */
export function resolveDataPath(relPath) {
  return join(PROJECT_ROOT, 'src', relPath);
}
/**
 * Resolves an output path relative to the project's output directory
 * @param relPath Relative path within the output directory
 * @returns Absolute path to the output location
 */
export function resolveOutputPath(relPath) {
  return join(PROJECT_ROOT, 'output', relPath);
}
/**
 * Ensures that all required project directories exist
 */
export async function ensureProjectDirectories() {
  // Ensure output directory exists
  await fs.mkdir(join(PROJECT_ROOT, 'output'), { recursive: true });
  // Ensure sector-specific output directories exist
  await fs.mkdir(join(PROJECT_ROOT, 'output', 'federal'), { recursive: true });
  await fs.mkdir(join(PROJECT_ROOT, 'output', 'state'), { recursive: true });
  await fs.mkdir(join(PROJECT_ROOT, 'output', 'private'), { recursive: true });
  console.log('Project directories verified');
}
//# sourceMappingURL=path-resolver.js.map
