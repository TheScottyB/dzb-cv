import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

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

describe('createCVCommand', () => {
  let program: Command;
  let mockConsoleLog: SpyInstance;
  let mockConsoleError: SpyInstance;
  let originalProcessExit: typeof process.exit;

  beforeEach(() => {
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
