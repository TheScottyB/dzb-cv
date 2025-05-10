import { resolve } from 'path';

export function resolveOutputPath(path: string): string {
  return resolve(process.cwd(), 'output', path);
}

export function resolveDataPath(path: string): string {
  return resolve(process.cwd(), 'data', path);
}

export async function ensureProjectDirectories(): Promise<void> {
  const dirs = ['output', 'data'];
  for (const dir of dirs) {
    await import('fs/promises').then((fs) =>
      fs.mkdir(resolve(process.cwd(), dir), { recursive: true })
    );
  }
}
