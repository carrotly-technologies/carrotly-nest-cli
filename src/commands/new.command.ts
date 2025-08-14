import { Command } from 'commander';
const chalk = require('chalk');
import inquirer from 'inquirer';
const validateNpmPackageName = require('validate-npm-package-name');
import { ProjectWizard } from '../utils/project-wizard';
import { ProjectGenerator } from '../utils/project-generator';
import { CommandOptions, ProjectConfig } from '../types/project-config.types';

export class NewCommand {
  private wizard = new ProjectWizard();
  private generator = new ProjectGenerator();

  getCommand(): Command {
    const newCommand = new Command('new');

    newCommand
      .description('create a new NestJS application')
      .argument('[name]', 'project name')
      .option('-d, --description <description>', 'project description')
      .option('-a, --api <api>', 'API type (rest|graphql)', 'graphql')
      .option('-o, --orm <orm>', 'ORM type (mongoose|prisma)', 'mongoose')
      .option(
        '-db, --database <database>',
        'database type (mongodb|postgresql|mysql)',
      )
      .option(
        '-s, --services <services>',
        'additional services (comma-separated)',
      )
      .option(
        '-ca, --code-assistant <assistant>',
        'code assistant (cursor|copilot|none)',
        'cursor',
      )
      .option('-dir, --directory <directory>', 'target directory')
      .option('--skip-prompts', 'skip interactive prompts')
      .action(async (name: string, options: CommandOptions) => {
        try {
          await this.execute(name, options);
        } catch (error) {
          console.error(chalk.red('Error creating project:'), error);
          process.exit(1);
        }
      });

    return newCommand;
  }

  private async execute(name: string, options: CommandOptions): Promise<void> {
    console.log(chalk.cyan('🥕 Welcome to Carrotly CLI!'));
    console.log(chalk.gray('Creating a new NestJS application...\\n'));

    // Get project configuration
    const config = await this.getProjectConfig(name, options);

    // Validate project name
    this.validateProjectName(config.name);

    // Generate project
    console.log(chalk.cyan(`\\n📦 Generating project \"${config.name}\"...`));
    await this.generator.generate(config);

    console.log(chalk.green('\\n✅ Project created successfully!'));
    console.log(chalk.gray(`\\n📁 Project location: ${config.directory}`));
    console.log(chalk.gray('\\n🚀 Next steps:'));
    console.log(chalk.gray(`   cd ${config.name}`));
    console.log(chalk.gray('   yarn install'));
    console.log(chalk.gray('   docker-compose up -d'));
    console.log(chalk.gray('   yarn start:dev'));
  }

  private async getProjectConfig(
    name: string,
    options: CommandOptions,
  ): Promise<ProjectConfig> {
    if (options.skipPrompts) {
      return this.buildConfigFromOptions(name, options);
    }

    return await this.wizard.run(name, options);
  }

  private buildConfigFromOptions(
    name: string,
    options: CommandOptions,
  ): ProjectConfig {
    const services = options.services
      ? options.services.split(',').map((s) => s.trim())
      : [];

    return {
      name: name || 'my-nest-app',
      description: options.description,
      api: options.api || 'graphql',
      orm: options.orm || 'mongoose',
      database: options.database,
      services: services as any[],
      codeAssistant: options.codeAssistant || 'cursor',
      directory: options.directory || `./${name || 'my-nest-app'}`,
    };
  }

  private validateProjectName(name: string): void {
    const validation = validateNpmPackageName(name);

    if (!validation.validForNewPackages) {
      const errors = [
        ...(validation.errors || []),
        ...(validation.warnings || []),
      ];
      throw new Error(`Invalid project name: ${errors.join(', ')}`);
    }
  }
}
