import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';
import { TemplateContext } from '../types/project-config.types';

interface TemplateFile {
  /** Template file path relative to templates directory */
  templatePath: string;
  /** Output file path relative to project root */
  outputPath: string;
  /** Whether this template should be included based on context */
  condition?: (context: TemplateContext) => boolean;
}

interface TemplateSet {
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
    sets.push(this.getDockerTemplateSet());
    sets.push(this.getConfigTemplateSet());
    sets.push(this.getCommonTemplateSet());
    sets.push(this.getExampleModuleTemplateSet());

    // API-specific templates
    if (context.isRest) {
      sets.push(this.getRestTemplateSet());
    }

    // ORM-specific templates
    if (context.isMongoose) {
      sets.push(this.getMongooseTemplateSet());
    } else if (context.isPrisma) {
      sets.push(this.getPrismaTemplateSet());
    }

    // Module-specific templates
    if (context.isGraphQL && context.isMongoose) {
      sets.push(this.getModulesTemplateSet());
    }

    // External service templates
    if (context.hasRedis || context.hasElasticsearch || context.hasRabbitmq) {
      sets.push(this.getExternalServicesTemplateSet());
    }

    // AI Assistant-specific templates
    if (context.codeAssistant === 'cursor') {
      sets.push(this.getCursorTemplateSet());
    } else if (context.codeAssistant === 'windsurf') {
      sets.push(this.getWindsurfTemplateSet());
    } else if (context.codeAssistant === 'copilot') {
      sets.push(this.getGitHubCopilotTemplateSet());
    } else if (context.codeAssistant === 'claude') {
      sets.push(this.getClaudeTemplateSet());
    } else if (context.codeAssistant === 'warp') {
      sets.push(this.getWarpTemplateSet());
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
          templatePath: 'core/package.json.hbs',
          outputPath: 'package.json',
        },
        {
          templatePath: 'core/yarn.lock.hbs',
          outputPath: 'yarn.lock',
        },
        {
          templatePath: 'core/main.ts.hbs',
          outputPath: 'src/main.ts',
        },
        {
          templatePath: 'core/app.module.ts.hbs',
          outputPath: 'src/app.module.ts',
        },
        {
          templatePath: 'core/tsconfig.json.hbs',
          outputPath: 'tsconfig.json',
        },
        {
          templatePath: 'core/tsconfig.build.json.hbs',
          outputPath: 'tsconfig.build.json',
        },
        {
          templatePath: 'core/nest-cli.json.hbs',
          outputPath: 'nest-cli.json',
        },
        {
          templatePath: 'config/.env.example.hbs',
          outputPath: '.env.example',
        },
        {
          templatePath: 'config/.gitignore.hbs',
          outputPath: '.gitignore',
        },
        {
          templatePath: 'config/eslint.config.cjs.hbs',
          outputPath: 'eslint.config.cjs',
        },
        {
          templatePath: 'utils/registerEnums.ts.hbs',
          outputPath: 'src/utils/registerEnums.ts',
          condition: (context) => context.isGraphQL,
        },
      ],
    };
  }

  /**
   * Docker configuration template set
   */
  private getDockerTemplateSet(): TemplateSet {
    return {
      name: 'docker',
      description: 'Docker configuration files',
      files: [
        {
          templatePath: 'docker/Dockerfile.hbs',
          outputPath: 'Dockerfile',
        },
        {
          templatePath: 'docker/.dockerignore.hbs',
          outputPath: '.dockerignore',
        },
        {
          templatePath: 'docker/docker-compose.yml.hbs',
          outputPath: 'docker-compose.yml',
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
          templatePath: 'api/rest/app.controller.ts.hbs',
          outputPath: 'src/app.controller.ts',
        },
        {
          templatePath: 'api/rest/app.service.ts.hbs',
          outputPath: 'src/app.service.ts',
        },
        {
          templatePath: 'api/rest/dto/app.dto.ts.hbs',
          outputPath: 'src/dto/app.dto.ts',
        },
      ],
    };
  }

  /**
   * Mongoose template set (no longer needed - all files moved to other template sets)
   */
  private getMongooseTemplateSet(): TemplateSet {
    return {
      name: 'mongoose',
      description: 'Mongoose ODM for MongoDB',
      files: [
        // All Mongoose-specific files are now in the common modules and example module template sets
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
          templatePath: 'database/prisma/schema.prisma.hbs',
          outputPath: 'prisma/schema.prisma',
        },
        {
          templatePath: 'database/prisma/prisma.module.ts.hbs',
          outputPath: 'src/prisma/prisma.module.ts',
        },
        {
          templatePath: 'database/prisma/prisma.service.ts.hbs',
          outputPath: 'src/prisma/prisma.service.ts',
        },
      ],
    };
  }

  /**
   * Modules template set (GraphQL + Mongoose utilities)
   */
  private getModulesTemplateSet(): TemplateSet {
    return {
      name: 'modules',
      description: 'Utility modules for GraphQL and Mongoose',
      files: [
        {
          templatePath: 'modules/pagination/pagination.module.ts.hbs',
          outputPath: 'src/pagination/pagination.module.ts',
        },
        {
          templatePath: 'modules/pagination/pagination.service.ts.hbs',
          outputPath: 'src/pagination/pagination.service.ts',
        },
      ],
    };
  }

  /**
   * External services template set (Redis, Elasticsearch, RabbitMQ)
   */
  private getExternalServicesTemplateSet(): TemplateSet {
    return {
      name: 'external-services',
      description:
        'External service integrations (Redis, Elasticsearch, RabbitMQ)',
      files: [
        // Redis templates
        {
          templatePath: 'external-services/redis/redis.module.ts.hbs',
          outputPath: 'src/external-services/redis/redis.module.ts',
          condition: (context) => context.hasRedis,
        },
        {
          templatePath: 'external-services/redis/redis.service.ts.hbs',
          outputPath: 'src/external-services/redis/redis.service.ts',
          condition: (context) => context.hasRedis,
        },
        // Elasticsearch templates
        {
          templatePath:
            'external-services/elasticsearch/elasticsearch.module.ts.hbs',
          outputPath:
            'src/external-services/elasticsearch/elasticsearch.module.ts',
          condition: (context) => context.hasElasticsearch,
        },
        {
          templatePath:
            'external-services/elasticsearch/elasticsearch.service.ts.hbs',
          outputPath:
            'src/external-services/elasticsearch/elasticsearch.service.ts',
          condition: (context) => context.hasElasticsearch,
        },
        // RabbitMQ templates
        {
          templatePath: 'external-services/rabbitmq/rabbitmq.module.ts.hbs',
          outputPath: 'src/external-services/rabbitmq/rabbitmq.module.ts',
          condition: (context) => context.hasRabbitmq,
        },
        {
          templatePath: 'external-services/rabbitmq/rabbitmq.service.ts.hbs',
          outputPath: 'src/external-services/rabbitmq/rabbitmq.service.ts',
          condition: (context) => context.hasRabbitmq,
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
          templatePath: 'config/config.module.ts.hbs',
          outputPath: 'src/config/config.module.ts',
        },
        {
          templatePath: 'config/server.config.ts.hbs',
          outputPath: 'src/config/server.config.ts',
        },
        {
          templatePath: 'config/env.variables.ts.hbs',
          outputPath: 'src/config/env.variables.ts',
        },
        {
          templatePath: 'config/database.config.ts.hbs',
          outputPath: 'src/config/database.config.ts',
          condition: (context) => context.isMongoose,
        },
        {
          templatePath: 'config/redis.config.ts.hbs',
          outputPath: 'src/config/redis.config.ts',
          condition: (context) => context.hasRedis,
        },
        {
          templatePath: 'config/elasticsearch.config.ts.hbs',
          outputPath: 'src/config/elasticsearch.config.ts',
          condition: (context) => context.hasElasticsearch,
        },
        {
          templatePath: 'config/rabbitmq.config.ts.hbs',
          outputPath: 'src/config/rabbitmq.config.ts',
          condition: (context) => context.hasRabbitmq,
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
        // Common modules
        {
          templatePath: 'core/modules/app-db.module.ts.hbs',
          outputPath: 'src/common/modules/app-db.module.ts',
        },
        {
          templatePath: 'core/modules/app-gql.module.ts.hbs',
          outputPath: 'src/common/modules/app-gql.module.ts',
          condition: (context) => context.isGraphQL,
        },
        {
          templatePath:
            'database/mongoose/common/modules/app-mongoose-models.module.ts.hbs',
          outputPath: 'src/common/modules/app-mongoose-models.module.ts',
          condition: (context) => context.isMongoose,
        },
        // Common utilities
        {
          templatePath: 'common/common.constraints.ts.hbs',
          outputPath: 'src/common/common.constraints.ts',
        },
        {
          templatePath: 'core/errors/business.error.ts.hbs',
          outputPath: 'src/common/errors/business.error.ts',
        },
        {
          templatePath: 'common/errors/graphql-common-errors.ts.hbs',
          outputPath: 'src/common/errors/graphql-common-errors.ts',
          condition: (context) => context.isGraphQL,
        },
        {
          templatePath: 'common/errors/unauthenticated.error.ts.hbs',
          outputPath: 'src/common/errors/unauthenticated.error.ts',
          condition: (context) => context.isGraphQL,
        },
        {
          templatePath: 'core/responses/success.response.ts.hbs',
          outputPath: 'src/common/responses/success.response.ts',
        },
        // Common enums
        {
          templatePath: 'core/enum/sort.enum.ts.hbs',
          outputPath: 'src/common/enum/sort.enum.ts',
          condition: (context) => context.isGraphQL,
        },
        // GraphQL common inputs and responses
        {
          templatePath: 'core/inputs/pagination.input.ts.hbs',
          outputPath: 'src/common/inputs/pagination.input.ts',
          condition: (context) => context.isGraphQL,
        },
        {
          templatePath: 'core/inputs/sort.input.ts.hbs',
          outputPath: 'src/common/inputs/sort.input.ts',
          condition: (context) => context.isGraphQL,
        },
        {
          templatePath: 'core/responses/pagination.response.ts.hbs',
          outputPath: 'src/common/responses/pagination.response.ts',
          condition: (context) => context.isGraphQL,
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
        templatePath: 'examples/base-example/example.module.ts.hbs',
        outputPath: 'src/example-module/example.module.ts',
      },
      {
        templatePath: 'examples/base-example/services/example.service.ts.hbs',
        outputPath: 'src/example-module/services/example.service.ts',
      },
    ];

    // Mongoose-specific files
    files.push(
      {
        templatePath: 'examples/base-example/schemas/example.schema.ts.hbs',
        outputPath: 'src/example-module/schemas/example.schema.ts',
        condition: (context) => context.isMongoose,
      },
      {
        templatePath:
          'examples/base-example/repositories/example.repository.ts.hbs',
        outputPath: 'src/example-module/repositories/example.repository.ts',
        condition: (context) => context.isMongoose,
      },
    );

    // GraphQL-specific files
    files.push(
      // GraphQL objects and responses
      {
        templatePath: 'examples/graphql-example/objects/example.object.ts.hbs',
        outputPath: 'src/example-module/objects/example.object.ts',
        condition: (context) => context.isGraphQL,
      },
      // Pagination response
      {
        templatePath:
          'examples/graphql-example/responses/example-pagination.response.ts.hbs',
        outputPath:
          'src/example-module/responses/example-pagination.response.ts',
        condition: (context) => context.isGraphQL,
      },
      // GraphQL inputs (only existing ones)
      {
        templatePath:
          'examples/graphql-example/inputs/example-create.input.ts.hbs',
        outputPath: 'src/example-module/inputs/example-create.input.ts',
        condition: (context) => context.isGraphQL,
      },
      {
        templatePath:
          'examples/graphql-example/inputs/example-update.input.ts.hbs',
        outputPath: 'src/example-module/inputs/example-update.input.ts',
        condition: (context) => context.isGraphQL,
      },
      {
        templatePath: 'examples/graphql-example/inputs/example.input.ts.hbs',
        outputPath: 'src/example-module/inputs/example.input.ts',
        condition: (context) => context.isGraphQL,
      },
      {
        templatePath:
          'examples/graphql-example/inputs/example-find-many.input.ts.hbs',
        outputPath: 'src/example-module/inputs/example-find-many.input.ts',
        condition: (context) => context.isGraphQL,
      },
      {
        templatePath:
          'examples/graphql-example/inputs/example-find-many-sort.input.ts.hbs',
        outputPath: 'src/example-module/inputs/example-find-many-sort.input.ts',
        condition: (context) => context.isGraphQL,
      },
      // GraphQL errors
      {
        templatePath:
          'examples/graphql-example/errors/graphql-example-errors.ts.hbs',
        outputPath: 'src/example-module/errors/graphql-example-errors.ts',
        condition: (context) => context.isGraphQL,
      },
      {
        templatePath:
          'examples/graphql-example/errors/example-not-found.error.ts.hbs',
        outputPath: 'src/example-module/errors/example-not-found.error.ts',
        condition: (context) => context.isGraphQL,
      },
      // GraphQL resolver
      {
        templatePath:
          'examples/graphql-example/resolvers/example.resolver.ts.hbs',
        outputPath: 'src/example-module/resolvers/example.resolver.ts',
        condition: (context) => context.isGraphQL,
      },
    );

    // REST-specific files
    files.push(
      {
        templatePath:
          'examples/rest-example/controllers/example.controller.ts.hbs',
        outputPath: 'src/example-module/controllers/example.controller.ts',
        condition: (context) => context.isRest,
      },
      {
        templatePath: 'examples/rest-example/dto/example.dto.ts.hbs',
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
   * Cursor AI assistant template set
   */
  private getCursorTemplateSet(): TemplateSet {
    return {
      name: 'cursor',
      description:
        'Cursor AI assistant configuration with individual rule files',
      files: [
        {
          templatePath: 'assistants/cursor/rules/module-structure.mdc.hbs',
          outputPath: '.cursor/rules/module-structure.mdc',
        },
        {
          templatePath: 'assistants/cursor/rules/resolver-conventions.mdc.hbs',
          outputPath: '.cursor/rules/resolver-conventions.mdc',
          condition: (context) => context.isGraphQL,
        },
        {
          templatePath: 'assistants/cursor/rules/input-guidelines.mdc.hbs',
          outputPath: '.cursor/rules/input-guidelines.mdc',
          condition: (context) => context.isGraphQL,
        },
        {
          templatePath: 'assistants/cursor/rules/object-guidelines.mdc.hbs',
          outputPath: '.cursor/rules/object-guidelines.mdc',
          condition: (context) => context.isGraphQL,
        },
        {
          templatePath: 'assistants/cursor/rules/controller-guidelines.mdc.hbs',
          outputPath: '.cursor/rules/controller-guidelines.mdc',
          condition: (context) => context.isRest,
        },
        {
          templatePath: 'assistants/cursor/rules/dto-guidelines.mdc.hbs',
          outputPath: '.cursor/rules/dto-guidelines.mdc',
          condition: (context) => context.isRest,
        },
        {
          templatePath: 'assistants/cursor/rules/repository-guidelines.mdc.hbs',
          outputPath: '.cursor/rules/repository-guidelines.mdc',
          condition: (context) => context.isMongoose,
        },
        {
          templatePath: 'assistants/cursor/rules/schema-guidelines.mdc.hbs',
          outputPath: '.cursor/rules/schema-guidelines.mdc',
          condition: (context) => context.isMongoose,
        },
        {
          templatePath: 'assistants/cursor/rules/prisma-guidelines.mdc.hbs',
          outputPath: '.cursor/rules/prisma-guidelines.mdc',
          condition: (context) => context.isPrisma,
        },
        {
          templatePath: 'assistants/cursor/rules/error-guidelines.mdc.hbs',
          outputPath: '.cursor/rules/error-guidelines.mdc',
        },
        {
          templatePath: 'assistants/cursor/rules/service-guidelines.mdc.hbs',
          outputPath: '.cursor/rules/service-guidelines.mdc',
        },
        {
          templatePath: 'assistants/cursor/rules/file-naming.mdc.hbs',
          outputPath: '.cursor/rules/file-naming.mdc',
        },
      ],
    };
  }

  /**
   * Windsurf AI assistant template set
   */
  private getWindsurfTemplateSet(): TemplateSet {
    return {
      name: 'windsurf',
      description: 'Windsurf (Codeium) AI assistant configuration',
      files: [
        {
          templatePath: 'assistants/windsurf/rules.md.hbs',
          outputPath: '.windsurf/rules.md',
        },
      ],
    };
  }

  /**
   * GitHub Copilot template set
   */
  private getGitHubCopilotTemplateSet(): TemplateSet {
    return {
      name: 'github-copilot',
      description: 'GitHub Copilot AI assistant configuration',
      files: [
        {
          templatePath: 'assistants/github-copilot/copilot-instructions.md.hbs',
          outputPath: '.github/copilot-instructions.md',
        },
      ],
    };
  }

  /**
   * Claude AI assistant template set
   */
  private getClaudeTemplateSet(): TemplateSet {
    return {
      name: 'claude',
      description: 'Claude (Anthropic) AI assistant configuration',
      files: [
        {
          templatePath: 'assistants/claude/project_knowledge.md.hbs',
          outputPath: '.claude/project_knowledge.md',
        },
      ],
    };
  }

  /**
   * Warp AI assistant template set
   */
  private getWarpTemplateSet(): TemplateSet {
    return {
      name: 'warp',
      description: 'Warp AI assistant configuration',
      files: [
        {
          templatePath: 'assistants/warp/project-context.md.hbs',
          outputPath: '.warp/project-context.md',
        },
      ],
    };
  }

  /**
   * Register custom Handlebars helpers
   */
  static registerHelpers(): void {
    // Helper for equality check (used in conditions)
    Handlebars.registerHelper('eq', function (a, b, options) {
      // When used in {{#if (eq ...)}} context, options is undefined
      // When used in {{#if}} block context, options contains fn/inverse
      if (typeof options === 'undefined') {
        return a === b;
      }

      if (a === b) {
        return options.fn ? options.fn(this) : true;
      }
      return options.inverse ? options.inverse(this) : false;
    });

    // Helper for conditional inclusion
    Handlebars.registerHelper('if_eq', function (a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Helper for array inclusion check
    Handlebars.registerHelper('includes', function (array, value, options) {
      // Handle case where options might not be provided (when used in conditions)
      if (typeof options === 'undefined') {
        return Array.isArray(array) && array.includes(value);
      }

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
