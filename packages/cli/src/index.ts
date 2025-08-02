#!/usr/bin/env node
import { Command } from 'commander';

import { createCVCommand } from './commands/create.js';
// AI generate command temporarily removed due to import issues

const program = new Command();

program.name('cv').description('CV management tool').version('1.0.0');

createCVCommand(program);
// createAICVCommand(program); // Temporarily disabled

program.parse(process.argv);
