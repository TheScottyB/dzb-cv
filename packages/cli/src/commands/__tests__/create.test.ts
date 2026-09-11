import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// ESM-compatible mock for @dzb-cv/pdf
vi.mock('@dzb-cv/pdf', async (importActual) => {
  const actual = await importActual<typeof import('@dzb-cv/pdf')>();
  const mockPDFGenerator = {
    generate: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
  };
  return {
    ...actual,
    PDFGenerator: vi.fn().mockImplementation(() => mockPDFGenerator),
    createPDFGenerator: vi.fn().mockImplementation(() => mockPDFGenerator),
  };
});

// ESM-compatible mock for @dzb-cv/core
vi.mock('@dzb-cv/core', async (importActual) => {
  const actual = await importActual<typeof import('@dzb-cv/core')>();
  return {
    ...actual,
    CVService: vi.fn().mockImplementation(() => ({
      createCV: vi.fn().mockResolvedValue({}),
      generatePDF: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
    })),
  };
});

import { createCVCommand } from '../create.js';

type SpyInstance = ReturnType<typeof vi.spyOn>;

// packages/cli/src/commands/__tests__ -> repo root
const BASE_INFO_FIXTURE = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../../../../data/base-info.json'
);

describe('createCVCommand', () => {
  let program: Command;
  let mockConsoleLog: SpyInstance;
  let mockConsoleError: SpyInstance;
  let originalProcessExit: typeof process.exit;
  let originalCwd: string;
  let tmpDir: string;

  beforeEach(() => {
    // The create command resolves output paths against process.cwd() (and
    // safePath rejects anything outside it), so run each test inside a
    // throwaway temp directory rather than polluting the repo root.
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dzb-cv-cli-test-'));
    // The command also reads data/base-info.json from cwd; mirror the repo's
    // copy so the test exercises the same code path it did before.
    if (fs.existsSync(BASE_INFO_FIXTURE)) {
      fs.mkdirSync(path.join(tmpDir, 'data'));
      fs.copyFileSync(BASE_INFO_FIXTURE, path.join(tmpDir, 'data', 'base-info.json'));
    }
    process.chdir(tmpDir);
    program = new Command();
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    originalProcessExit = process.exit;
    process.exit = vi.fn() as unknown as typeof process.exit;
    createCVCommand(program);
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    process.exit = originalProcessExit;
    vi.clearAllMocks();
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('registers the create command with required options', () => {
    const createCommand = program.commands.find((cmd) => cmd.name() === 'create');
    expect(createCommand).toBeDefined();
    expect(createCommand?.description()).toBeTruthy();
    const nameOption = createCommand?.options.find((opt) => opt.name() === 'name');
    const emailOption = createCommand?.options.find((opt) => opt.name() === 'email');
    expect(nameOption?.required).toBe(true);
    expect(emailOption?.required).toBe(true);
  });

  it('executes the command and logs output', async () => {
    const command = program.commands.find((cmd) => cmd.name() === 'create');
    await command?.parseAsync(
      ['node', 'test', '--name', 'John Doe', '--email', 'john@example.com'],
      { from: 'user' }
    );
    expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for John Doe');
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
  });

  it('splits name into first and last correctly', async () => {
    const command = program.commands.find((cmd) => cmd.name() === 'create');
    await command?.parseAsync(
      ['node', 'test', '--name', 'Jane Q. Public', '--email', 'jane@example.com'],
      { from: 'user' }
    );
    expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for Jane Q. Public');
  });

  it('handles errors and exits with code 1', async () => {
    // Force the CVService to throw
    const { CVService } = await import('@dzb-cv/core');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (CVService as any).mockImplementationOnce(() => ({
      createCV: vi.fn().mockRejectedValue(new Error('fail')),
      generatePDF: vi.fn(),
    }));

    const command = program.commands.find((cmd) => cmd.name() === 'create');
    await command?.parseAsync(
      ['node', 'test', '--name', 'Error Case', '--email', 'error@example.com'],
      { from: 'user' }
    );
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Error creating CV:'),
      expect.any(Error)
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
