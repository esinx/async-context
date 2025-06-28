# Contributing to async-context

Thank you for considering contributing to async-context! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 18+ (we test on 18, 20, and 22)
- pnpm 8+

### Getting Started

1. Fork the repository
2. Clone your fork:

    ```bash
    git clone https://github.com/your-username/async-context.git
    cd async-context
    ```

3. Install dependencies:

    ```bash
    pnpm install
    ```

4. Run the development pipeline:

    ```bash
    # Type checking
    pnpm run type-check

    # Linting
    pnpm run lint

    # Formatting
    pnpm run format:check

    # Testing
    pnpm run test

    # Building
    pnpm run build
    ```

## Development Workflow

### Code Style

- We use **tabs for indentation** (4-space width)
- ESLint v9 with TypeScript rules enforces code quality
- Prettier handles formatting automatically
- Single quotes, no semicolons

### Scripts

- `pnpm run format:fix` - Format and fix linting issues
- `pnpm run test` - Run tests in watch mode
- `pnpm run test run` - Run tests once
- `pnpm run test:coverage` - Run tests with coverage
- `pnpm run build` - Build the library

### Making Changes

1. Create a feature branch from `main`:

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. Make your changes following our coding standards

3. Add/update tests as needed

4. Ensure all checks pass:

    ```bash
    pnpm run format:fix
    pnpm run test run
    pnpm run build
    ```

5. Commit your changes with a clear message

6. Push and create a pull request

## CI/CD Pipeline

### Continuous Integration

Our CI pipeline runs on every push and pull request:

- **Multi-Node Testing**: Tests on Node.js 18, 20, and 22
- **Code Quality**: ESLint, Prettier, TypeScript checking
- **Test Coverage**: Vitest with coverage reporting
- **Security**: CodeQL analysis and dependency review
- **Build Verification**: Ensures library builds correctly

### Continuous Deployment

Releases are automated when tags are pushed:

- **Version Extraction**: From git tags (e.g., `v1.0.0`)
- **Full Pipeline**: All CI checks must pass
- **NPM Publishing**: Automatic with provenance
- **GitHub Releases**: Created with changelog info

### Required Secrets

For the repository owner to set up:

- `NPM_TOKEN`: npm authentication token for publishing
- `GITHUB_TOKEN`: Automatically provided by GitHub

### Dependabot

- Automatic dependency updates weekly
- GitHub Actions updates weekly
- Auto-merge for passing dependency PRs

## Pull Request Process

1. Fill out the pull request template
2. Ensure all CI checks pass
3. Request review from maintainers
4. Address any feedback
5. Maintainers will merge when approved

## Testing Guidelines

- Write tests for new features
- Maintain or improve test coverage
- Test edge cases and error conditions
- Use descriptive test names
- Group related tests in `describe` blocks

### Test Structure

```typescript
import { describe, expect, it } from 'vitest'
import { createContext, use } from './index'

describe('Feature Name', () => {
	it('should do something specific', async () => {
		// Arrange
		const context = createContext('initial')

		// Act
		const result = await context.run('test', async () => {
			return use(context)
		})

		// Assert
		expect(result).toBe('test')
	})
})
```

## Release Process

Releases are handled automatically:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create and push a git tag:
    ```bash
    git tag v1.0.0
    git push origin v1.0.0
    ```
4. GitHub Actions handles the rest

## Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Assume good intentions

## Getting Help

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues and PRs first

Thank you for contributing! 🎉
