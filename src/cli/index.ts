#!/usr/bin/env node
/**
 * Main CLI Entry Point
 * 
 * This is the central entry point for the refactored CLI application.
 * It integrates all command modules and provides a unified interface.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { GenerateCvCommand } from './commands/generate-cv.js';
import { AnalyzeJobCommand } from './commands/analyze-job.js';
import { ManageProfileCommand } from './commands/manage-profile.js';

// Create the main CLI program
const program = new Command();

/**
 * Set up main program metadata
 */
program
  .name('dzb-cv')
  .description('Dawn Z. Beilfuss CV and profile management system')
  .version('1.0.0')
  .addHelpCommand(true)
  .helpOption('-h, --help', 'Display help information')
  .configureOutput({
    outputError: (str, write) => write(chalk.red(str))
  });

/**
 * Add global options
 */
program
  .option('-v, --verbose', 'Enable verbose output')
  .option('--no-color', 'Disable color output')
  .option('-c, --config <path>', 'Path to configuration file');

/**
 * Register all command modules
 */
try {
  // Initialize commands
  const generateCvCommand = new GenerateCvCommand();
  const analyzeJobCommand = new AnalyzeJobCommand();
  const manageProfileCommand = new ManageProfileCommand();
  
  // Register commands with the main program
  generateCvCommand.register(program);
  analyzeJobCommand.register(program);
  manageProfileCommand.register(program);
  
  // Add a test command for verifying the CLI is working
  program
    .command('test')
    .description('Test command to verify CLI is working')
    .action(() => {
      console.log(chalk.green('✅ CLI is working!'));
      console.log(chalk.blue('💡 Available commands:'));
      console.log('   - generate: Generate a CV for a specific sector');
      console.log('   - analyze: Analyze a job posting');
      console.log('   - profile: Manage CV profiles');
      console.log(chalk.yellow('\nFor more details, use --help with any command.'));
    });
  
  /**
   * Custom event handlers
   */
  program
    .on('command:*', (operands) => {
      console.error(chalk.red(`Error: Unknown command '${operands[0]}'`));
      console.log(`See ${chalk.green('--help')} for a list of available commands.`);
      process.exit(1);
    })
    .on('option:verbose', () => {
      process.env.VERBOSE = 'true';
      console.log(chalk.yellow('Verbose mode enabled'));
    });
  
} catch (error) {
  console.error(chalk.red(`Failed to initialize commands: ${error instanceof Error ? error.message : String(error)}`));
  process.exit(1);
}

/**
 * Parse arguments and execute commands
 */
try {
  program.parse(process.argv);
  
  // Show help if no command specified
  if (process.argv.length <= 2) {
    program.outputHelp();
  }
} catch (error) {
  console.error(chalk.red(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`));
  process.exit(1);
}

