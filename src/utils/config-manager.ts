import * as fs from 'fs-extra';
import * as path from 'path';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  CarrotlyConfig,
  CreateCarrotlyConfigOptions,
  CARROTLY_CONFIG_FILE,
  CARROTLY_CONFIG_VERSION,
  GeneratedModule,
} from '../types/carrotly-config.types';

export class ConfigManager {
  /**
   * Create a new Carrotly configuration file
   */
  static createConfig(options: CreateCarrotlyConfigOptions): CarrotlyConfig {
    const now = new Date().toISOString();

    return {
      version: CARROTLY_CONFIG_VERSION,
      createdAt: now,
      cliVersion: options.cliVersion,
      project: {
        name: options.projectName,
        description: options.projectDescription,
        directory: options.directory,
      },
      tech: {
        api: options.api,
        orm: {
          type: options.ormType,
          database: options.database,
        },
        services: {
          redis: options.services.includes('redis'),
          elasticsearch: options.services.includes('elasticsearch'),
          rabbitmq: options.services.includes('rabbitmq'),
        },
        tools: {
          codeAssistant: options.codeAssistant,
          docker: true, // Always include Docker
          testing: true, // Always include testing setup
        },
      },
      generated: {
        lastGenerated: now,
        files: [],
        modules: [],
      },
    };
  }

  /**
   * Save configuration to file
   */
  static async saveConfig(
    config: CarrotlyConfig,
    targetDir: string,
  ): Promise<void> {
    const configPath = path.join(targetDir, CARROTLY_CONFIG_FILE);
    const configJson = JSON.stringify(config, null, 2);
    await fs.writeFile(configPath, configJson, 'utf8');
  }

  /**
   * Read configuration from file
   */
  static async readConfig(projectDir: string): Promise<CarrotlyConfig | null> {
    const configPath = path.join(projectDir, CARROTLY_CONFIG_FILE);

    try {
      if (!(await fs.pathExists(configPath))) {
        return null;
      }

      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent) as CarrotlyConfig;

      // Validate configuration
      if (!this.isValidConfig(config)) {
        throw new Error('Invalid configuration file format');
      }

      return config;
    } catch (error) {
      throw new Error(`Failed to read configuration: ${error}`);
    }
  }

  /**
   * Check if a directory contains a Carrotly project
   */
  static async isCarrotlyProject(projectDir: string): Promise<boolean> {
    const configPath = path.join(projectDir, CARROTLY_CONFIG_FILE);
    return await fs.pathExists(configPath);
  }

  /**
   * Update configuration with new generated files/modules
   */
  static async updateGenerated(
    projectDir: string,
    files: string[],
    module?: GeneratedModule,
  ): Promise<void> {
    const config = await this.readConfig(projectDir);
    if (!config) {
      throw new Error('No Carrotly configuration found in this directory');
    }

    // Update generated files
    config.generated.files.push(...files);

    // Add module if provided
    if (module) {
      config.generated.modules.push(module);
    }

    // Update timestamp
    config.generated.lastGenerated = new Date().toISOString();

    // Save updated configuration
    await this.saveConfig(config, projectDir);
  }

  /**
   * Get CLI version from package.json
   */
  static getCliVersion(): string {
    try {
      const packageJsonPath = join(__dirname, '../../package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Validate configuration structure
   */
  private static isValidConfig(config: any): config is CarrotlyConfig {
    return (
      config &&
      typeof config.version === 'string' &&
      typeof config.createdAt === 'string' &&
      typeof config.cliVersion === 'string' &&
      config.project &&
      typeof config.project.name === 'string' &&
      config.tech &&
      ['rest', 'graphql'].includes(config.tech.api) &&
      config.tech.orm &&
      ['mongoose', 'prisma'].includes(config.tech.orm.type) &&
      config.tech.services &&
      config.tech.tools &&
      config.generated &&
      Array.isArray(config.generated.files) &&
      Array.isArray(config.generated.modules)
    );
  }

  /**
   * Migrate configuration to newer version if needed
   */
  static migrateConfig(config: CarrotlyConfig): CarrotlyConfig {
    // For now, just return the config as-is
    // In the future, this would handle version migrations
    return config;
  }

  /**
   * Get configuration summary for display
   */
  static getConfigSummary(config: CarrotlyConfig): string {
    const { project, tech } = config;
    const database = tech.orm.database ? ` (${tech.orm.database})` : '';
    const services = Object.entries(tech.services)
      .filter(([, enabled]) => enabled)
      .map(([service]) => service);

    return `
Project: ${project.name}
API: ${tech.api === 'graphql' ? 'GraphQL' : 'REST API'}
ORM: ${tech.orm.type}${database}
Services: ${services.length > 0 ? services.join(', ') : 'none'}
Code Assistant: ${tech.tools.codeAssistant}
Created: ${new Date(config.createdAt).toLocaleDateString()}
`.trim();
  }
}
