import { createTemplateContext } from '../src/utils/template-context';
import { ProjectConfig } from '../src/types/project-config.types';

describe('Project Configuration', () => {
  describe('createTemplateContext', () => {
    it('should create template context with default values', () => {
      const config: ProjectConfig = {
        name: 'test-project',
        api: 'graphql',
        orm: 'mongoose',
        services: [],
        codeAssistant: 'none',
        directory: './test-project',
      };

      const context = createTemplateContext(config);

      expect(context.projectName).toBe('test-project');
      expect(context.projectDescription).toBe(
        'A NestJS application named test-project',
      );
      expect(context.api).toBe('graphql');
      expect(context.orm).toBe('mongoose');
      expect(context.services).toEqual([]);
      expect(context.codeAssistant).toBe('none');
      expect(context.isGraphQL).toBe(true);
      expect(context.isRest).toBe(false);
      expect(context.isMongoose).toBe(true);
      expect(context.isPrisma).toBe(false);
      expect(context.hasRedis).toBe(false);
      expect(context.hasElasticsearch).toBe(false);
      expect(context.hasRabbitmq).toBe(false);
    });

    it('should create template context with custom description', () => {
      const config: ProjectConfig = {
        name: 'my-app',
        description: 'My custom application',
        api: 'rest',
        orm: 'prisma',
        database: 'postgresql',
        services: ['redis', 'elasticsearch'],
        codeAssistant: 'cursor',
        directory: './my-app',
      };

      const context = createTemplateContext(config);

      expect(context.projectName).toBe('my-app');
      expect(context.projectDescription).toBe('My custom application');
      expect(context.api).toBe('rest');
      expect(context.orm).toBe('prisma');
      expect(context.database).toBe('postgresql');
      expect(context.services).toEqual(['redis', 'elasticsearch']);
      expect(context.codeAssistant).toBe('cursor');
      expect(context.isGraphQL).toBe(false);
      expect(context.isRest).toBe(true);
      expect(context.isMongoose).toBe(false);
      expect(context.isPrisma).toBe(true);
      expect(context.hasRedis).toBe(true);
      expect(context.hasElasticsearch).toBe(true);
      expect(context.hasRabbitmq).toBe(false);
    });

    it('should handle all services correctly', () => {
      const config: ProjectConfig = {
        name: 'full-stack-app',
        api: 'graphql',
        orm: 'mongoose',
        services: ['redis', 'elasticsearch', 'rabbitmq'],
        codeAssistant: 'windsurf',
        directory: './full-stack-app',
      };

      const context = createTemplateContext(config);

      expect(context.hasRedis).toBe(true);
      expect(context.hasElasticsearch).toBe(true);
      expect(context.hasRabbitmq).toBe(true);
      expect(context.services).toEqual(['redis', 'elasticsearch', 'rabbitmq']);
    });

    it('should handle undefined services', () => {
      const config: ProjectConfig = {
        name: 'minimal-app',
        api: 'rest',
        orm: 'prisma',
        services: [],
        codeAssistant: 'none',
        directory: './minimal-app',
      };

      const context = createTemplateContext(config);

      expect(context.services).toEqual([]);
      expect(context.hasRedis).toBe(false);
      expect(context.hasElasticsearch).toBe(false);
      expect(context.hasRabbitmq).toBe(false);
    });
  });
});
