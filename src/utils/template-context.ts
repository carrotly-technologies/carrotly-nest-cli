import { ProjectConfig, TemplateContext } from '../types/project-config.types';

/**
 * Converts a ProjectConfig to TemplateContext for use in templates
 */
export function createTemplateContext(config: ProjectConfig): TemplateContext {
  const services = config.services || [];

  return {
    projectName: config.name,
    projectDescription:
      config.description || `A NestJS application named ${config.name}`,
    api: config.api,
    orm: config.orm,
    database: config.database,
    services: services,
    codeAssistant: config.codeAssistant,

    // Convenience flags for templates
    hasRedis: services.includes('redis'),
    hasElasticsearch: services.includes('elasticsearch'),
    hasRabbitmq: services.includes('rabbitmq'),
    isGraphQL: config.api === 'graphql',
    isRest: config.api === 'rest',
    isMongoose: config.orm === 'mongoose',
    isPrisma: config.orm === 'prisma',
  };
}
