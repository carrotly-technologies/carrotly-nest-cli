export interface ProjectConfig {
  name: string;
  description?: string;
  api: ApiType;
  orm: OrmType;
  database?: DatabaseType;
  services: ServiceType[];
  codeAssistant: CodeAssistantType;
  directory: string;
}

export type ApiType = 'rest' | 'graphql';

export type OrmType = 'mongoose' | 'prisma';

export type DatabaseType = 'mongodb' | 'postgresql' | 'mysql';

export type ServiceType = 'redis' | 'elasticsearch' | 'rabbitmq';

export type CodeAssistantType =
  | 'cursor'
  | 'windsurf'
  | 'copilot'
  | 'claude'
  | 'warp'
  | 'none';

export interface TemplateContext {
  projectName: string;
  projectDescription: string;
  api: ApiType;
  orm: OrmType;
  database?: DatabaseType;
  services: ServiceType[];
  hasRedis: boolean;
  hasElasticsearch: boolean;
  hasRabbitmq: boolean;
  isGraphQL: boolean;
  isRest: boolean;
  isMongoose: boolean;
  isPrisma: boolean;
  codeAssistant: CodeAssistantType;
}

export interface CommandOptions {
  name?: string;
  description?: string;
  api?: ApiType;
  orm?: OrmType;
  database?: DatabaseType;
  services?: string;
  codeAssistant?: CodeAssistantType;
  directory?: string;
  skipPrompts?: boolean;
}
