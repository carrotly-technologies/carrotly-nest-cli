import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';
import { TemplateContext } from '../types/project-config.types';

export interface TemplateFile {
  /** Template file path relative to templates directory */
  templatePath: string;
  /** Output file path relative to project root */
  outputPath: string;
  /** Whether this template should be included based on context */
  condition?: (context: TemplateContext) => boolean;
}

export interface TemplateSet {
  name: string;
  description: string;
  files: TemplateFile[];
}

export class TemplateEngine {
  private templatesDir: string;
  private compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();

  constructor() {
    // Templates directory is relative to the CLI package
    this.templatesDir = path.join(__dirname, '../../templates');
  }

  /**
   * Compile a template file
   */
  private async compileTemplate(
    templatePath: string,
  ): Promise<HandlebarsTemplateDelegate> {
    const cacheKey = templatePath;

    if (this.compiledTemplates.has(cacheKey)) {
      return this.compiledTemplates.get(cacheKey)!;
    }

    const fullTemplatePath = path.join(this.templatesDir, templatePath);
    const templateContent = await fs.readFile(fullTemplatePath, 'utf8');
    const compiled = Handlebars.compile(templateContent);

    this.compiledTemplates.set(cacheKey, compiled);
    return compiled;
  }

  /**
   * Generate a single file from template
   */
  async generateFile(
    templatePath: string,
    outputPath: string,
    context: TemplateContext,
  ): Promise<void> {
    const template = await this.compileTemplate(templatePath);
    const content = template(context);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.ensureDir(outputDir);

    // Write the generated content
    await fs.writeFile(outputPath, content, 'utf8');
  }

  /**
   * Generate multiple files from a template set
   */
  async generateFromTemplateSet(
    templateSet: TemplateSet,
    projectDir: string,
    context: TemplateContext,
  ): Promise<string[]> {
    const generatedFiles: string[] = [];

    for (const file of templateSet.files) {
      // Check if this file should be included
      if (file.condition && !file.condition(context)) {
        continue;
      }

      const outputPath = path.join(projectDir, file.outputPath);
      await this.generateFile(file.templatePath, outputPath, context);
      generatedFiles.push(file.outputPath);
    }

    return generatedFiles;
  }

  /**
   * Get template sets based on project configuration
   */
  getTemplateSets(context: TemplateContext): TemplateSet[] {
    const sets: TemplateSet[] = [];

    // Base NestJS templates - always included
    sets.push(this.getBaseTemplateSet());

    // API-specific templates
    if (context.isGraphQL) {
      sets.push(this.getGraphQLTemplateSet());
    } else if (context.isRest) {
      sets.push(this.getRestTemplateSet());
    }

    // ORM-specific templates
    if (context.isMongoose) {
      sets.push(this.getMongooseTemplateSet());
    } else if (context.isPrisma) {
      sets.push(this.getPrismaTemplateSet());
    }

    // Service-specific templates
    if (context.hasRedis) {
      sets.push(this.getRedisTemplateSet());
    }

    return sets;
  }

  /**
   * Base NestJS template set
   */
  private getBaseTemplateSet(): TemplateSet {
    return {
      name: 'base',
      description: 'Core NestJS application files',
      files: [
        {
          templatePath: 'base/package.json.hbs',
          outputPath: 'package.json',
        },
        {
          templatePath: 'base/main.ts.hbs',
          outputPath: 'src/main.ts',
        },
        {
          templatePath: 'base/app.module.ts.hbs',
          outputPath: 'src/app.module.ts',
        },
        {
          templatePath: 'base/tsconfig.json.hbs',
          outputPath: 'tsconfig.json',
        },
        {
          templatePath: 'base/tsconfig.build.json.hbs',
          outputPath: 'tsconfig.build.json',
        },
        {
          templatePath: 'base/nest-cli.json.hbs',
          outputPath: 'nest-cli.json',
        },
        {
          templatePath: 'base/.env.example.hbs',
          outputPath: '.env.example',
        },
        {
          templatePath: 'base/.gitignore.hbs',
          outputPath: '.gitignore',
        },
      ],
    };
  }

  /**
   * GraphQL template set
   */
  private getGraphQLTemplateSet(): TemplateSet {
    return {
      name: 'graphql',
      description: 'GraphQL with Yoga driver',
      files: [
        {
          templatePath: 'graphql/app.resolver.ts.hbs',
          outputPath: 'src/app.resolver.ts',
        },
        {
          templatePath: 'graphql/graphql.module.ts.hbs',
          outputPath: 'src/graphql/graphql.module.ts',
        },
      ],
    };
  }

  /**
   * REST API template set
   */
  private getRestTemplateSet(): TemplateSet {
    return {
      name: 'rest',
      description: 'REST API with Swagger',
      files: [
        {
          templatePath: 'rest/app.controller.ts.hbs',
          outputPath: 'src/app.controller.ts',
        },
        {
          templatePath: 'rest/app.service.ts.hbs',
          outputPath: 'src/app.service.ts',
        },
        {
          templatePath: 'rest/dto/app.dto.ts.hbs',
          outputPath: 'src/dto/app.dto.ts',
        },
      ],
    };
  }

  /**
   * Mongoose template set
   */
  private getMongooseTemplateSet(): TemplateSet {
    return {
      name: 'mongoose',
      description: 'Mongoose ODM for MongoDB',
      files: [
        {
          templatePath: 'mongoose/database.module.ts.hbs',
          outputPath: 'src/database/database.module.ts',
        },
        {
          templatePath: 'mongoose/schemas/example.schema.ts.hbs',
          outputPath: 'src/schemas/example.schema.ts',
        },
      ],
    };
  }

  /**
   * Prisma template set
   */
  private getPrismaTemplateSet(): TemplateSet {
    return {
      name: 'prisma',
      description: 'Prisma ORM for PostgreSQL/MySQL',
      files: [
        {
          templatePath: 'prisma/prisma.service.ts.hbs',
          outputPath: 'src/prisma/prisma.service.ts',
        },
        {
          templatePath: 'prisma/prisma.module.ts.hbs',
          outputPath: 'src/prisma/prisma.module.ts',
        },
        {
          templatePath: 'prisma/schema.prisma.hbs',
          outputPath: 'prisma/schema.prisma',
        },
      ],
    };
  }

  /**
   * Redis template set
   */
  private getRedisTemplateSet(): TemplateSet {
    return {
      name: 'redis',
      description: 'Redis configuration and service',
      files: [
        {
          templatePath: 'services/redis.module.ts.hbs',
          outputPath: 'src/redis/redis.module.ts',
        },
        {
          templatePath: 'services/redis.service.ts.hbs',
          outputPath: 'src/redis/redis.service.ts',
        },
      ],
    };
  }

  /**
   * Register custom Handlebars helpers
   */
  static registerHelpers(): void {
    // Helper for conditional inclusion
    Handlebars.registerHelper('if_eq', function (a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Helper for array inclusion check
    Handlebars.registerHelper('includes', function (array, value, options) {
      if (Array.isArray(array) && array.includes(value)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Helper for capitalizing strings
    Handlebars.registerHelper('capitalize', function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Helper for converting to PascalCase
    Handlebars.registerHelper('pascalCase', function (str) {
      return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase());
    });
  }
}

// Register helpers when the module is loaded
TemplateEngine.registerHelpers();
