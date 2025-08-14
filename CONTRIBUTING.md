# Contributing to Carrotly CLI 🥕

Thank you for your interest in contributing to Carrotly CLI! We welcome contributions from the community.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Yarn package manager
- Git

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/carrotly-nest-cli.git
   cd carrotly-nest-cli
   ```

3. Install dependencies:

   ```bash
   yarn install
   ```

4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Code Style

We use ESLint and Prettier to maintain consistent code style:

```bash
# Check for linting issues
yarn lint

# Fix linting issues automatically
yarn lint:fix

# Format code
yarn format
```

### Building

```bash
# Build the project
yarn build

# Check TypeScript diagnostics
yarn lint:diagnostics
```

### Testing

```bash
# Run tests (when available)
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:cov
```

### Development Testing

You can test the CLI locally during development:

```bash
# Run the CLI in development mode
yarn dev new test-project

# Or test specific commands
yarn dev info --path ./some-project
```

## Project Structure

```
src/
├── bin/           # CLI entry point
├── commands/      # Command implementations
├── types/         # TypeScript type definitions
└── utils/         # Utility functions and classes
templates/         # Handlebars templates for project generation
```

## Making Changes

### Adding New Features

1. Create a new branch from `main`
2. Implement your feature
3. Add or update tests if applicable
4. Update documentation (README.md, code comments)
5. Run linting and ensure all checks pass
6. Commit your changes with conventional commit messages

### Fixing Bugs

1. Create a new branch from `main`
2. Reproduce the bug and identify the root cause
3. Implement the fix
4. Add regression tests if applicable
5. Verify the fix works as expected
6. Commit your changes

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes (formatting, etc.)
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

Examples:

```
feat: add support for new database provider
fix: resolve template generation issue for GraphQL projects
docs: update installation instructions
```

## Code Quality

### TypeScript

- Use strict TypeScript settings
- Provide proper type definitions
- Avoid `any` types when possible
- Use meaningful variable and function names

### Error Handling

- Provide meaningful error messages
- Handle edge cases gracefully
- Use appropriate exit codes for CLI commands

### Templates

- Keep templates modular and reusable
- Use Handlebars helpers for complex logic
- Test template generation with various configurations

## Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update documentation if necessary
3. Make sure all tests pass
4. Update the CHANGELOG.md if applicable
5. Create a pull request with a clear description of changes
6. Link any related issues

### Pull Request Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] All existing tests pass
- [ ] New tests added (if applicable)
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or breaking changes documented)
```

## Release Process

Releases are managed by maintainers using:

```bash
# For patch releases
yarn release:patch

# For minor releases
yarn release:minor

# For major releases
yarn release:major
```

## Community

- Be respectful and constructive in discussions
- Help others by answering questions and reviewing PRs
- Follow the project's Code of Conduct

## Questions?

If you have questions about contributing, please:

1. Check existing issues and documentation
2. Open a new issue with the "question" label
3. Join our community discussions

Thank you for contributing to Carrotly CLI! 🎉
