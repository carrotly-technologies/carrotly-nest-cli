import * as fs from 'fs-extra';
import * as path from 'path';
const chalk = require('chalk');
const ora = require('ora');
import { ProjectConfig, TemplateContext } from '../types/project-config.types';

export class ProjectGenerator {
  async generate(config: ProjectConfig): Promise<void> {
    const spinner = ora('Generating project structure...').start();

    try {
      // Create project directory
      await this.createProjectDirectory(config);

      // Build template context
      const context = this.buildTemplateContext(config);

      // Generate base structure (placeholder)
      await this.generateBaseStructure(config, context);

      spinner.succeed('Project structure generated');
    } catch (error) {
      spinner.fail('Failed to generate project');
      throw error;
    }
  }

  private async createProjectDirectory(config: ProjectConfig): Promise<void> {
    const targetPath = path.resolve(config.directory);

    if (await fs.pathExists(targetPath)) {
      const files = await fs.readdir(targetPath);
      if (files.length > 0) {
        throw new Error(`Directory ${config.directory} is not empty`);
      }
    }

    await fs.ensureDir(targetPath);
  }

  private buildTemplateContext(config: ProjectConfig): TemplateContext {
    return {
      projectName: config.name,
      projectDescription: config.description || '',
      api: config.api,
      orm: config.orm,
      database: config.database,
      services: config.services,
      hasRedis: config.services.includes('redis'),
      hasElasticsearch: config.services.includes('elasticsearch'),
      hasRabbitmq: config.services.includes('rabbitmq'),
      isGraphQL: config.api === 'graphql',
      isRest: config.api === 'rest',
      isMongoose: config.orm === 'mongoose',
      isPrisma: config.orm === 'prisma',
      codeAssistant: config.codeAssistant,
    };
  }

  private async generateBaseStructure(
    config: ProjectConfig,
    context: TemplateContext,
  ): Promise<void> {
    const targetPath = path.resolve(config.directory);

    // Create basic README.md as a placeholder
    const readmeContent = `# ${context.projectName}

${context.projectDescription}

## Configuration

- **API Type**: ${context.api === 'graphql' ? 'GraphQL with Yoga driver' : 'REST API with Swagger'}
- **ORM**: ${context.orm === 'mongoose' ? 'Mongoose (MongoDB)' : 'Prisma'}
${context.database ? `- **Database**: ${context.database}` : ''}
${context.services.length > 0 ? `- **Services**: ${context.services.join(', ')}` : ''}
- **Code Assistant**: ${context.codeAssistant}

## Getting Started

\`\`\`bash
# Install dependencies
yarn install

# Start development services
docker-compose up -d

# Start development server
yarn start:dev
\`\`\`

## Generated with Carrotly CLI 🥕
`;

    await fs.writeFile(path.join(targetPath, 'README.md'), readmeContent);

    console.log(chalk.yellow('\\n⚠️  Template generation not yet implemented'));
    console.log(chalk.gray('   This is a placeholder implementation.'));
    console.log(
      chalk.gray('   Full template system will be added in the next task.'),
    );
  }
}
