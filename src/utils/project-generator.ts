import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { ProjectConfig, TemplateContext } from '../types/project-config.types';
import { ConfigManager } from './config-manager';
import { CreateCarrotlyConfigOptions } from '../types/carrotly-config.types';
import { TemplateEngine } from './template-engine';
import { createTemplateContext } from './template-context';

export class ProjectGenerator {
  private templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  async generate(config: ProjectConfig): Promise<void> {
    const spinner = ora('Generating project structure...').start();

    try {
      // Create project directory
      await this.createProjectDirectory(config);

      // Build template context
      const context = createTemplateContext(config);

      // Generate project files from templates
      const generatedFiles = await this.generateFromTemplates(config, context);

      // Create and save Carrotly configuration file
      await this.createConfigurationFile(config, generatedFiles);

      spinner.succeed('Project structure generated successfully!');

      // Show completion summary
      this.showCompletionSummary(config, generatedFiles);
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

  private async generateFromTemplates(
    config: ProjectConfig,
    context: TemplateContext,
  ): Promise<string[]> {
    const targetPath = path.resolve(config.directory);
    const allGeneratedFiles: string[] = [];

    // Get all template sets for this configuration
    const templateSets = this.templateEngine.getTemplateSets(context);

    // Generate files from each template set
    for (const templateSet of templateSets) {
      console.log(chalk.blue(`   Generating ${templateSet.description}...`));

      const generatedFiles = await this.templateEngine.generateFromTemplateSet(
        templateSet,
        targetPath,
        context,
      );

      allGeneratedFiles.push(...generatedFiles);
      console.log(
        chalk.green(
          `   ✓ Generated ${generatedFiles.length} files for ${templateSet.name}`,
        ),
      );
    }

    // Create README.md
    await this.generateReadme(targetPath, context);
    allGeneratedFiles.push('README.md');

    return allGeneratedFiles;
  }

  private async generateReadme(
    targetPath: string,
    context: TemplateContext,
  ): Promise<void> {
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
npm install

# Start development server
npm run start:dev
\`\`\`

${
  context.isPrisma
    ? `## Database Setup

\`\`\`bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
\`\`\`

`
    : ''
}${
      context.isRest
        ? `## API Documentation

Once the server is running, visit \`http://localhost:3000/api/docs\` for Swagger documentation.

`
        : ''
    }${
      context.isGraphQL
        ? `## GraphQL Playground

Once the server is running, visit \`http://localhost:3000/graphql\` for GraphQL Playground.

`
        : ''
    }## Generated with Carrotly CLI 🥕

This project was generated using [Carrotly CLI](https://github.com/your-username/carrotly-cli).
`;

    await fs.writeFile(path.join(targetPath, 'README.md'), readmeContent);
  }

  private async createConfigurationFile(
    config: ProjectConfig,
    generatedFiles: string[],
  ): Promise<void> {
    const targetPath = path.resolve(config.directory);

    // Prepare configuration options
    const configOptions: CreateCarrotlyConfigOptions = {
      projectName: config.name,
      projectDescription: config.description,
      directory: config.directory,
      api: config.api,
      ormType: config.orm,
      database: config.database,
      services: config.services,
      codeAssistant: config.codeAssistant,
      cliVersion: ConfigManager.getCliVersion(),
    };

    // Create configuration
    const carrotlyConfig = ConfigManager.createConfig(configOptions);

    // Add all generated files to the configuration
    carrotlyConfig.generated.files = [...generatedFiles, '.carrotly.json'];

    // Save configuration file
    await ConfigManager.saveConfig(carrotlyConfig, targetPath);

    console.log(chalk.green(`   ✓ Configuration saved to .carrotly.json`));
  }

  private showCompletionSummary(
    config: ProjectConfig,
    generatedFiles: string[],
  ): void {
    console.log(chalk.green('\n🎉 Project generated successfully!'));
    console.log(chalk.cyan(`\n📁 Project: ${config.name}`));
    console.log(chalk.gray(`   Location: ${path.resolve(config.directory)}`));
    console.log(chalk.gray(`   Generated ${generatedFiles.length + 1} files`));

    console.log(chalk.cyan('\n🚀 Next steps:'));
    console.log(chalk.white(`   cd ${config.directory}`));
    console.log(chalk.white(`   npm install`));

    if (config.orm === 'prisma') {
      console.log(chalk.white(`   npm run prisma:generate`));
    }

    console.log(chalk.white(`   npm run start:dev`));

    if (config.api === 'rest') {
      console.log(
        chalk.gray(
          '\n📚 Visit http://localhost:3000/api/docs for API documentation',
        ),
      );
    } else if (config.api === 'graphql') {
      console.log(
        chalk.gray(
          '\n🎯 Visit http://localhost:3000/graphql for GraphQL Playground',
        ),
      );
    }
  }
}
