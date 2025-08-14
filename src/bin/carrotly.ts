#!/usr/bin/env node

import { Command } from 'commander';
const chalk = require('chalk');
const packageJson = require('../../package.json');
const version = packageJson.version;
import { NewCommand } from '../commands/new.command';

const program = new Command();

program
  .name('carrotly')
  .description('A modern CLI tool for scaffolding NestJS applications')
  .version(version, '-v, --version', 'output the current version');

// Add commands
program.addCommand(new NewCommand().getCommand());

// Error handling
program.on('command:*', () => {
  console.error(
    chalk.red(
      `Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`,
    ),
  );
  process.exit(1);
});

program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
