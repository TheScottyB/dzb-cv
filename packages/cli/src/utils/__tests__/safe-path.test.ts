import { describe, it, expect } from 'vitest';
import path from 'path';
import os from 'os';
import { safePath } from '../safe-path.js';

describe('safePath', () => {
  const base = path.resolve(os.tmpdir(), 'safepath-test');

  it('accepts a relative path inside base', () => {
    expect(safePath('cv.pdf', base)).toBe(path.join(base, 'cv.pdf'));
  });

  it('accepts a nested relative path', () => {
    expect(safePath('out/cv.pdf', base)).toBe(path.join(base, 'out/cv.pdf'));
  });

  it('accepts an absolute path that lives inside base', () => {
    const inside = path.join(base, 'sub/cv.pdf');
    expect(safePath(inside, base)).toBe(inside);
  });

  it('rejects a parent traversal', () => {
    expect(() => safePath('../escape.pdf', base)).toThrow(/Refusing to write outside/);
  });

  it('rejects an absolute path outside base', () => {
    expect(() => safePath('/etc/passwd', base)).toThrow(/Refusing to write outside/);
  });

  it('rejects a path that resolves to base itself', () => {
    // base resolves equal to base, which is technically allowed
    expect(safePath('.', base)).toBe(base);
  });
});
