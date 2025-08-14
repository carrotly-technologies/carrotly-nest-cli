import inquirer from 'inquirer';
const chalk = require('chalk');
const validateNpmPackageName = require('validate-npm-package-name');
import {
  ProjectConfig,
  CommandOptions,
  ApiType,
  OrmType,
  DatabaseType,
  ServiceType,
  CodeAssistantType,
} from '../types/project-config.types';

export class ProjectWizard {
  async run(
    initialName?: string,
    options: CommandOptions = {},
  ): Promise<ProjectConfig> {
    console.log(chalk.cyan('🔧 Project Configuration Wizard'));
    console.log(
      chalk.gray(
        'Answer the following questions to set up your NestJS project:\\n',
      ),
    );

    const questions = this.buildQuestions(initialName, options);
    const answers = await inquirer.prompt(questions);

    return this.buildConfig(answers, options);
  }

  private buildQuestions(
    initialName: string | undefined,
    options: CommandOptions,
  ) {
    const questions: any[] = [];

    // Project name
    if (!initialName && !options.name) {
      questions.push({
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: 'my-nest-app',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Project name is required';
          }
          const validation = validateNpmPackageName(input);
          if (!validation.validForNewPackages) {
            const errors = [
              ...(validation.errors || []),
              ...(validation.warnings || []),
            ];
            return `Invalid project name: ${errors.join(', ')}`;
          }
          return true;
        },
      });
    }

    // Project description
    if (!options.description) {
      questions.push({
        type: 'input',
        name: 'description',
        message: 'Project description (optional):',
      });
    }

    // API type
    if (!options.api) {
      questions.push({
        type: 'list',
        name: 'api',
        message: 'Which API type would you like to use?',
        choices: [
          { name: 'GraphQL (with Yoga driver)', value: 'graphql' },
          { name: 'REST API (with Swagger)', value: 'rest' },
        ],
        default: 'graphql',
      });
    }

    // ORM type
    if (!options.orm) {
      questions.push({
        type: 'list',
        name: 'orm',
        message: 'Which ORM would you like to use?',
        choices: [
          { name: 'Mongoose (MongoDB)', value: 'mongoose' },
          { name: 'Prisma (PostgreSQL/MySQL)', value: 'prisma' },
        ],
        default: 'mongoose',
      });
    }

    // Database type (only for Prisma)
    if (!options.database) {
      questions.push({
        type: 'list',
        name: 'database',
        message: 'Which database would you like to use?',
        choices: [
          { name: 'PostgreSQL', value: 'postgresql' },
          { name: 'MySQL', value: 'mysql' },
        ],
        when: (answers) => {
          const orm = options.orm || answers.orm;
          return orm === 'prisma';
        },
      });
    }

    // Additional services
    if (!options.services) {
      questions.push({
        type: 'checkbox',
        name: 'services',
        message: 'Select additional services:',
        choices: [
          { name: 'Redis (Caching & Sessions)', value: 'redis', checked: true },
          { name: 'Elasticsearch (Search)', value: 'elasticsearch' },
          { name: 'RabbitMQ (Message Queue)', value: 'rabbitmq' },
        ],
      });
    }

    // Code assistant
    if (!options.codeAssistant) {
      questions.push({
        type: 'list',
        name: 'codeAssistant',
        message: 'Which code assistant rules would you like to include?',
        choices: [
          { name: 'Cursor AI', value: 'cursor' },
          { name: 'GitHub Copilot', value: 'copilot' },
          { name: 'None', value: 'none' },
        ],
        default: 'cursor',
      });
    }

    // Target directory
    if (!options.directory) {
      questions.push({
        type: 'input',
        name: 'directory',
        message: 'Target directory:',
        default: (answers: any) => {
          const name = initialName || options.name || answers.name;
          return `./${name}`;
        },
      });
    }

    return questions;
  }

  private buildConfig(answers: any, options: CommandOptions): ProjectConfig {
    const name = options.name || answers.name;

    return {
      name,
      description: options.description || answers.description || '',
      api: (options.api || answers.api) as ApiType,
      orm: (options.orm || answers.orm) as OrmType,
      database: (options.database || answers.database) as DatabaseType,
      services: this.parseServices(options.services || answers.services),
      codeAssistant: (options.codeAssistant ||
        answers.codeAssistant) as CodeAssistantType,
      directory: options.directory || answers.directory || `./${name}`,
    };
  }

  private parseServices(services: string | ServiceType[]): ServiceType[] {
    if (typeof services === 'string') {
      return services.split(',').map((s) => s.trim()) as ServiceType[];
    }
    return services || [];
  }
}
