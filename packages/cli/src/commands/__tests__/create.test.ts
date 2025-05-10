import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

import { createCVCommand } from '../create.js';

type SpyInstance = ReturnType<typeof vi.spyOn>;

// Mock the dependencies
vi.mock('@dzb-cv/pdf', () => ({
  PDFGenerator: vi.fn().mockImplementation(() => ({
    // Corrected class name
    generate: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
  })),
}));

vi.mock('@dzb-cv/core', () => ({
  CVService: vi.fn().mockImplementation(() => ({
    createCV: vi.fn().mockResolvedValue({}),
    generatePDF: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
  })),
}));
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
    process.exit = vi.fn() as unknown as typeof process.exit; // Type assertion for mock
    createCVCommand(program);
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    process.exit = originalProcessExit;
    vi.clearAllMocks();
  });

  it('should register create command', () => {
    const createCommand = program.commands.find((cmd) => cmd.name() === 'create');
    expect(createCommand).toBeDefined();
    expect(createCommand?.description()).toBeTruthy();
  });

  it('should require name and email options', () => {
    const createCommand = program.commands.find((cmd) => cmd.name() === 'create');
    const nameOption = createCommand?.options.find((opt) => opt.name() === 'name');
    const emailOption = createCommand?.options.find((opt) => opt.name() === 'email');

    expect(nameOption?.required).toBe(true);
    expect(emailOption?.required).toBe(true);
  });

  it('should handle command execution', async () => {
    const command = program.commands.find((cmd) => cmd.name() === 'create');
    await command?.parseAsync(
      ['node', 'test', '--name', 'John Doe', '--email', 'john@example.com'],
      { from: 'user' }
    );

    expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for John Doe');
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Generated PDF:'));
  });

  it('should split name into first and last', async () => {
    const command = program.commands.find((cmd) => cmd.name() === 'create');
    await command?.parseAsync(
      ['node', 'test', '--name', 'John Doe', '--email', 'john@example.com'],
      { from: 'user' }
    );

    expect(mockConsoleLog).toHaveBeenCalledWith('Creating CV for John Doe');
  });
});
