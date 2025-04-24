#!/usr/bin/env node

/**
 * Verification script to run all implementation tests
 * This script runs the build, validation, and test generation
 * to ensure all fixes are working correctly
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

/**
 * Run a command and return the result
 */
function runCommand(command, args, label) {
  console.log(chalk.blue(`\n${label}...`));
  
  const result = spawnSync(command, args, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  
  const success = result.status === 0;
  
  if (success) {
    console.log(chalk.green(`✓ ${label} completed successfully`));
  } else {
    console.log(chalk.red(`✗ ${label} failed`));
  }
  
  return { success, command, label };
}

/**
 * Main verification function
 */
async function verifyFixes() {
  console.log(chalk.bold('\n================================================='));
  console.log(chalk.bold('   Verifying CV Generation System Implementation'));
  console.log(chalk.bold('=================================================\n'));
  
  const steps = [
    { command: 'npm', args: ['run', 'clean'], label: 'Clean build output' },
    { command: 'npm', args: ['run', 'build'], label: 'Build the project' },
    { command: 'npm', args: ['run', 'validate'], label: 'Validate implementation' },
    { command: 'npm', args: ['run', 'test-generation'], label: 'Test CV generation' }
  ];
  
  const results = [];
  
  for (const step of steps) {
    const result = runCommand(step.command, step.args, step.label);
    results.push(result);
    
    // If a step fails, stop the process
    if (!result.success) {
      console.log(chalk.yellow('\nStopping verification due to step failure.'));

