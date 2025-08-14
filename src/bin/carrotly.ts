#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NewCommand } from '../commands/new.command';
import { InfoCommand } from '../commands/info.command';

// Read package.json to get version
const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

const program = new Command();

program
  .name('carrotly')
  .description('A modern CLI tool for scaffolding NestJS applications')
  .version(version, '-v, --version', 'output the current version');

// Add commands
program.addCommand(new NewCommand().getCommand());
program.addCommand(new InfoCommand().getCommand());

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
