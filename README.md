# Carrotly CLI 🥕

A modern CLI tool for scaffolding NestJS applications with comprehensive configuration support.

## Features

- 🚀 **Interactive Setup Wizard** - Easy project configuration through prompts
- 🔧 **Multiple API Types** - Support for both GraphQL (with Yoga driver) and REST APIs
- 🗄️ **ORM Flexibility** - Choose between Mongoose (MongoDB) or Prisma (PostgreSQL/MySQL)
- 🐳 **Docker Ready** - Automatic Docker configuration with hot reloading
- 🛠️ **Development Tools** - Pre-configured ESLint, Prettier, Husky, and more
- 🤖 **AI Assistant Support** - Ready-to-use rulesets for Cursor, Copilot, and others
- 📦 **Additional Services** - Redis, Elasticsearch, RabbitMQ support
- ✅ **Best Practices** - Production-ready configurations and examples

## Installation

```bash
# Install globally
npm install -g carrotly-cli

# Or use with npx (recommended)
npx carrotly-cli new my-project

# You can also use yarn
yarn global add carrotly-cli
# Or with yarn dlx
yarn dlx carrotly-cli new my-project
```

## Quick Start

```bash
# Create a new project with interactive setup
carrotly new my-nestjs-app

# Create with specific options
carrotly new my-app --api graphql --orm mongoose --services redis
```

## Usage

### Interactive Mode

```bash
carrotly new
```

This will start the interactive setup wizard that guides you through:

- Project name and description
- API type (GraphQL/REST)
- ORM selection (Mongoose/Prisma)
- Database choice (for Prisma)
- Additional services
- Code assistant rulesets

### Command Line Options

```bash
carrotly new [name] [options]

Options:
  -d, --description <description>    Project description
  -a, --api <api>                   API type (rest|graphql)
  -o, --orm <orm>                   ORM type (mongoose|prisma)
  -db, --database <database>        Database type (mongodb|postgresql|mysql)
  -s, --services <services>         Additional services (comma-separated)
  -ca, --code-assistant <assistant> Code assistant (cursor|copilot|none)
  -dir, --directory <directory>     Target directory
  --skip-prompts                    Skip interactive prompts
  -h, --help                        Display help
```

### Examples

```bash
# GraphQL API with Mongoose and Redis
carrotly new blog-api --api graphql --orm mongoose --services redis

# REST API with Prisma and PostgreSQL
carrotly new shop-api --api rest --orm prisma --database postgresql

# Multiple services
carrotly new analytics-api --services redis,elasticsearch,rabbitmq

# Skip prompts with defaults
carrotly new quick-app --skip-prompts
```

## Generated Project Structure

```
my-nestjs-app/
├── src/
│   ├── app.module.ts
│   ├── app.resolver.ts     # (GraphQL) or app.controller.ts (REST)
│   └── main.ts
├── docker-compose.yml      # With selected services
├── Dockerfile              # Hot-reload enabled
├── package.json
├── tsconfig.json
├── eslint.config.cjs
├── .prettierrc
├── .gitignore
└── README.md
```

## Development

```bash
# Clone the repository
git clone https://github.com/filipkostecki/carrotly-cli.git
cd carrotly-cli

# Install dependencies
yarn install

# Run in development mode
yarn dev new my-test-app

# Build the project
yarn build

# Run tests
yarn test
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE) - see LICENSE file for details.

---

**Generated with ❤️ by Filip Kostecki**
