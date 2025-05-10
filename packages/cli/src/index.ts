#!/usr/bin/env node
import { Command } from 'commander';

import { createCVCommand } from './commands/create.js';

const program = new Command();

program.name('cv').description('CV management tool').version('1.0.0');

createCVCommand(program);

program.parse(process.argv);
