#!/usr/bin/env node
/**
 * Main CLI entry point
 * This will be the starting point for the refactored application
 */

import { Command } from 'commander';

const program = new Command();

program
  .name('dzb-cv')
  .description('CV and profile management system')
  .version('1.0.0');

// In the future, we'll import command modules
// import { generateCommand } from '../commands/generate.js';
// program.addCommand(generateCommand);

// Temporary command to verify CLI is working
program
  .command('test')
  .description('Test command to verify CLI is working')
  .action(() => {
    console.log('CLI is working! The refactoring is in progress.');
  });

program.parse(process.argv);

