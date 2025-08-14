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
    sets.push(this.getConfigTemplateSet());
    sets.push(this.getCommonTemplateSet());
    sets.push(this.getExampleModuleTemplateSet());

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

    // IDE-specific templates
    if (context.codeAssistant === 'cursor') {
      sets.push(this.getCursorTemplateSet());
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
   * Configuration template set
   */
  private getConfigTemplateSet(): TemplateSet {
    return {
      name: 'config',
      description: 'Configuration modules with validation',
      files: [
        {
          templatePath: 'base/config/env.variables.ts.hbs',
          outputPath: 'src/config/env.variables.ts',
        },
        {
          templatePath: 'base/config/server.config.ts.hbs',
          outputPath: 'src/config/server.config.ts',
        },
        {
          templatePath: 'base/config/config.module.ts.hbs',
          outputPath: 'src/config/config.module.ts',
        },
        {
          templatePath: 'mongoose/database.config.ts.hbs',
          outputPath: 'src/database/database.config.ts',
          condition: (context) => context.isMongoose,
        },
      ],
    };
  }

  /**
   * Common modules template set
   */
  private getCommonTemplateSet(): TemplateSet {
    return {
      name: 'common',
      description: 'Common modules and utilities',
      files: [
        {
          templatePath: 'base/common/modules/app-db.module.ts.hbs',
          outputPath: 'src/common/modules/app-db.module.ts',
        },
        {
          templatePath: 'base/common/modules/app-gql.module.ts.hbs',
          outputPath: 'src/common/modules/app-gql.module.ts',
          condition: (context) => context.isGraphQL,
        },
        {
          templatePath:
            'mongoose/common/modules/app-mongoose-models.module.ts.hbs',
          outputPath: 'src/common/modules/app-mongoose-models.module.ts',
          condition: (context) => context.isMongoose,
        },
      ],
    };
  }

  /**
   * Example module template set
   */
  private getExampleModuleTemplateSet(): TemplateSet {
    const files: TemplateFile[] = [
      // Base files (always included)
      {
        templatePath: 'base/example-module/example.module.ts.hbs',
        outputPath: 'src/example-module/example.module.ts',
      },
      {
        templatePath: 'base/example-module/services/example.service.ts.hbs',
        outputPath: 'src/example-module/services/example.service.ts',
      },
    ];

    // Mongoose-specific files
    files.push(
      {
        templatePath: 'base/example-module/schemas/example.schema.ts.hbs',
        outputPath: 'src/example-module/schemas/example.schema.ts',
        condition: (context) => context.isMongoose,
      },
      {
        templatePath:
          'base/example-module/repositories/example.repository.ts.hbs',
        outputPath: 'src/example-module/repositories/example.repository.ts',
        condition: (context) => context.isMongoose,
      },
    );

    // GraphQL-specific files
    files.push(
      {
        templatePath: 'graphql/example-module/objects/example.object.ts.hbs',
        outputPath: 'src/example-module/objects/example.object.ts',
        condition: (context) => context.isGraphQL,
      },
      {
        templatePath:
          'graphql/example-module/inputs/example-create.input.ts.hbs',
        outputPath: 'src/example-module/inputs/example-create.input.ts',
        condition: (context) => context.isGraphQL,
      },
      {
        templatePath:
          'graphql/example-module/inputs/example-update.input.ts.hbs',
        outputPath: 'src/example-module/inputs/example-update.input.ts',
        condition: (context) => context.isGraphQL,
      },
      {
        templatePath:
          'graphql/example-module/inputs/example-find-many.input.ts.hbs',
        outputPath: 'src/example-module/inputs/example-find-many.input.ts',
        condition: (context) => context.isGraphQL,
      },
      {
        templatePath:
          'graphql/example-module/resolvers/example.resolver.ts.hbs',
        outputPath: 'src/example-module/resolvers/example.resolver.ts',
        condition: (context) => context.isGraphQL,
      },
    );

    // REST-specific files
    files.push(
      {
        templatePath:
          'rest/example-module/controllers/example.controller.ts.hbs',
        outputPath: 'src/example-module/controllers/example.controller.ts',
        condition: (context) => context.isRest,
      },
      {
        templatePath: 'rest/example-module/dto/example.dto.ts.hbs',
        outputPath: 'src/example-module/dto/example.dto.ts',
        condition: (context) => context.isRest,
      },
    );

    return {
      name: 'example-module',
      description: 'Complete example module with all layers',
      files,
    };
  }

  /**
   * Cursor IDE template set
   */
  private getCursorTemplateSet(): TemplateSet {
    return {
      name: 'cursor',
      description: 'Cursor IDE configuration',
      files: [
        {
          templatePath: 'cursor/.cursor/rules',
          outputPath: '.cursor/rules',
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
