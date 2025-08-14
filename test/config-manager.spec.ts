import { ConfigManager } from '../src/utils/config-manager';
import { CreateCarrotlyConfigOptions } from '../src/types/carrotly-config.types';

describe('ConfigManager', () => {
  describe('createConfig', () => {
    it('should create a valid configuration', () => {
      const options: CreateCarrotlyConfigOptions = {
        projectName: 'test-app',
        projectDescription: 'A test application',
        directory: './test-app',
        api: 'graphql',
        ormType: 'mongoose',
        services: ['redis'],
        codeAssistant: 'cursor',
        cliVersion: '1.0.0',
      };

      const config = ConfigManager.createConfig(options);

      expect(config.version).toBe('1.0.0');
      expect(config.cliVersion).toBe('1.0.0');
      expect(config.project.name).toBe('test-app');
      expect(config.project.description).toBe('A test application');
      expect(config.project.directory).toBe('./test-app');
      expect(config.tech.api).toBe('graphql');
      expect(config.tech.orm.type).toBe('mongoose');
      expect(config.tech.services.redis).toBe(true);
      expect(config.tech.services.elasticsearch).toBe(false);
      expect(config.tech.services.rabbitmq).toBe(false);
      expect(config.tech.tools.codeAssistant).toBe('cursor');
      expect(config.tech.tools.docker).toBe(true);
      expect(config.tech.tools.testing).toBe(true);
      expect(Array.isArray(config.generated.files)).toBe(true);
      expect(Array.isArray(config.generated.modules)).toBe(true);
      expect(config.generated.files).toHaveLength(0);
      expect(config.generated.modules).toHaveLength(0);
    });

    it('should handle minimal configuration', () => {
      const options: CreateCarrotlyConfigOptions = {
        projectName: 'minimal-app',
        directory: './minimal-app',
        api: 'rest',
        ormType: 'prisma',
        database: 'postgresql',
        services: [],
        codeAssistant: 'none',
        cliVersion: '0.1.0',
      };

      const config = ConfigManager.createConfig(options);

      expect(config.project.name).toBe('minimal-app');
      expect(config.project.description).toBeUndefined();
      expect(config.tech.api).toBe('rest');
      expect(config.tech.orm.type).toBe('prisma');
      expect(config.tech.orm.database).toBe('postgresql');
      expect(config.tech.services.redis).toBe(false);
      expect(config.tech.services.elasticsearch).toBe(false);
      expect(config.tech.services.rabbitmq).toBe(false);
      expect(config.tech.tools.codeAssistant).toBe('none');
    });

    it('should handle all services enabled', () => {
      const options: CreateCarrotlyConfigOptions = {
        projectName: 'full-app',
        directory: './full-app',
        api: 'graphql',
        ormType: 'mongoose',
        services: ['redis', 'elasticsearch', 'rabbitmq'],
        codeAssistant: 'windsurf',
        cliVersion: '1.0.0',
      };

      const config = ConfigManager.createConfig(options);

      expect(config.tech.services.redis).toBe(true);
      expect(config.tech.services.elasticsearch).toBe(true);
      expect(config.tech.services.rabbitmq).toBe(true);
    });
  });

  describe('getConfigSummary', () => {
    it('should generate a readable summary', () => {
      const options: CreateCarrotlyConfigOptions = {
        projectName: 'summary-test',
        projectDescription: 'Test summary generation',
        directory: './summary-test',
        api: 'graphql',
        ormType: 'mongoose',
        services: ['redis', 'elasticsearch'],
        codeAssistant: 'cursor',
        cliVersion: '1.0.0',
      };

      const config = ConfigManager.createConfig(options);
      const summary = ConfigManager.getConfigSummary(config);

      expect(summary).toContain('Project: summary-test');
      expect(summary).toContain('API: GraphQL');
      expect(summary).toContain('ORM: mongoose');
      expect(summary).toContain('Services: redis, elasticsearch');
      expect(summary).toContain('Code Assistant: cursor');
      expect(summary).toContain('Created:');
    });

    it('should handle no services', () => {
      const options: CreateCarrotlyConfigOptions = {
        projectName: 'no-services',
        directory: './no-services',
        api: 'rest',
        ormType: 'prisma',
        database: 'postgresql',
        services: [],
        codeAssistant: 'none',
        cliVersion: '1.0.0',
      };

      const config = ConfigManager.createConfig(options);
      const summary = ConfigManager.getConfigSummary(config);

      expect(summary).toContain('API: REST API');
      expect(summary).toContain('ORM: prisma (postgresql)');
      expect(summary).toContain('Services: none');
      expect(summary).toContain('Code Assistant: none');
    });
  });

  describe('getCliVersion', () => {
    it('should return a version string', () => {
      const version = ConfigManager.getCliVersion();
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });
  });
});
