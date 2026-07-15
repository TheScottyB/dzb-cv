import path from 'path';

/**
 * Resolve `userPath` against `baseDir` and reject anything that escapes.
 * See ADR-0003.
 */
export function safePath(userPath: string, baseDir: string = process.cwd()): string {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, userPath);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error(
      `Refusing to write outside ${base}: "${userPath}" resolves to "${resolved}"`
    );
  }
  return resolved;
}
