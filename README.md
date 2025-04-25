# DZB-CV: CV Management System

A modular CV management system with job analysis capabilities. This tool helps create, manage, and tailor CVs for specific job applications.

## Features

- **CV Generation**: Generate CVs for different sectors (federal, state, private)
- **Job Analysis**: Analyze job postings to extract key requirements for CV tailoring
- **Profile Management**: Import, export, and manage CV profiles
- **Multiple Output Formats**: Export as PDF, Markdown, or JSON
- **ATS Optimization**: Tailor CVs to pass Applicant Tracking Systems
- **Verification System**: Track and verify content sources
- **Modular CLI**: Extensible command structure

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 20.10.0 or higher
- [Volta](https://volta.sh/) (recommended for managing Node.js and pnpm versions)
- [pnpm](https://pnpm.io/) 8.12.1 or higher
- Git for version control

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/dzb-cv.git
   cd dzb-cv
   ```

2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. Build the CLI:
   ```bash
   pnpm build
   ```

4. Link the CLI globally (optional):
   ```bash
   pnpm link-cli
   ```

The setup script will:
- Install dependencies
- Set up TypeScript configurations
- Configure Git hooks for code quality

## Command Documentation

The CLI provides a modular command structure with several key command groups.

### Global Options

The following options are available for all commands:

```bash
-v, --verbose       # Enable verbose output
--no-color          # Disable color output
-c, --config <path> # Path to configuration file
-h, --help          # Display help information
```

### CV Generation

Generate CVs for different sectors:

```bash
dzb-cv generate <sector> [options]
```

Arguments:
- `<sector>`: The sector to generate for (`federal`, `state`, or `private`)

Options:
- `-f, --format <format>`: Output format (`markdown` or `pdf`, default: `pdf`)
- `-o, --output <path>`: Output directory for the generated CV (default: `output`)
- `--filename <name>`: Base filename for the generated CV

Examples:
```bash
# Generate a federal CV in PDF format
dzb-cv generate federal

# Generate a state CV in markdown format
dzb-cv generate state --format markdown

# Generate a private CV with a custom filename
dzb-cv generate private --filename my-custom-cv --output ./my-output
```

### Job Analysis

Analyze job postings to extract key requirements:

```bash
dzb-cv analyze <source> [options]
```

Arguments:
- `<source>`: URL of the job posting or path to a file containing the job description

Options:
- `-o, --output <path>`: Path to save the analysis output
- `-f, --format <format>`: Output format (`json`, `text`, `markdown`, default: `text`)
- `--file`: Treat the source as a local file path instead of URL
- `--force-generic`: Force using the generic parser for any site
- `--no-rate-limit`: Disable rate limiting (use with caution)

Examples:
```bash
# Analyze a job posting from a URL
dzb-cv analyze https://example.com/jobs/12345

# Analyze a job posting from a local file
dzb-cv analyze ./job-descriptions/analyst.txt --file

# Save analysis output to a JSON file
dzb-cv analyze https://example.com/jobs/12345 --output ./analysis.json --format json
```

### Profile Management

Manage CV profiles with various subcommands:

#### Import Profiles

```bash
dzb-cv profile import <file> [options]
```

Arguments:
- `<file>`: Path to the CV document file

Options:
- `-o, --owner <name>`: Name of the profile owner (default: `Dawn Zurick Beilfuss`)
- `-v, --validate`: Validate the profile data
- `--output <path>`: Save the imported profile to a file
- `-f, --format <format>`: Format for output (`json`, `markdown`, default: `json`)

Examples:
```bash
# Import a profile from a markdown file
dzb-cv profile import ./my-cv.md

# Import with validation and custom owner
dzb-cv profile import ./my-cv.md --validate --owner "John Doe"

# Import and save to a specific location
dzb-cv profile import ./my-cv.md --output ./profiles/imported.json
```

#### Export Profiles

```bash
dzb-cv profile export [options]
```

Options:
- `-p, --profile-id <id>`: ID of the profile to export
- `-f, --format <format>`: Export format (`json`, `markdown`, `pdf`, default: `json`)
- `-o, --output <path>`: Output file path (default: `output/profiles/exported-profile.json`)

Examples:
```bash
# Export a profile to JSON
dzb-cv profile export --profile-id profile-123

# Export a profile to markdown
dzb-cv profile export --profile-id profile-123 --format markdown --output ./my-cv.md
```

#### Validate Profiles

```bash
dzb-cv profile validate <file> [options]
```

Arguments:
- `<file>`: Path to the profile file to validate

Options:
- `-t, --type <type>`: Validation type (`basic`, `strict`, `federal`, default: `basic`)

Examples:
```bash
# Validate a profile with basic validation
dzb-cv profile validate ./my-cv.json

# Validate a profile with federal requirements
dzb-cv profile validate ./my-cv.json --type federal
```

#### List Profiles

```bash
dzb-cv profile list [options]
```

Options:
- `-v, --verbose`: Show detailed information

Example:
```bash
# List all profiles with detailed information
dzb-cv profile list --verbose
```

## Configuration Options

The CLI supports configuration through:

1. **Command-line options**: As shown in the command documentation
2. **Environment variables**: Prefixed with `DZB_CV_`
3. **Configuration files**: JSON format, path specified with the `-c, --config` option

Example configuration file (`config.json`):

```json
{
  "output": "./my-output-dir",
  "format": "pdf",
  "verbose": true,
  "profile": {
    "defaultOwner": "Dawn Zurick Beilfuss",
    "storage": "./profiles"
  },
  "analyze": {
    "noRateLimit": false,
    "forceGeneric": false
  }
}
```

Usage with config file:
```bash
dzb-cv -c ./config.json generate federal
```

## Development

### Project Structure

```
.
├── src/                # Source code
│   ├── cli/            # CLI implementation
│   │   ├── commands/   # Command modules
│   │   └── index.ts    # CLI entry point
│   ├── shared/         # Shared utilities and types
│   ├── tools/          # Core functionality
│   └── core/           # Business logic
├── dist/               # Compiled JavaScript
├── job-postings/       # Sample job postings
└── scripts/            # Utility scripts
```

### Development Workflow

```bash
# Install dependencies
pnpm install

# Start development server with watch mode
pnpm dev

# Run the CLI in development mode
pnpm cli [commands...]

# Debug the CLI
pnpm dev:debug

# Build for production
pnpm build

# Run tests
pnpm test
```

### Adding New Commands

1. Create a new file in `src/cli/commands/` that extends `BaseCommand`
2. Implement the required methods
3. Register the command in `src/cli/index.ts`

Example:
```typescript
import { BaseCommand } from './base-command.js';

export class MyNewCommand extends BaseCommand {
  constructor() {
    super('new-command', 'Description of my new command');
  }

  configure(): void {
    this.program
      .name(this.name)
      .description(this.description)
      .option('-o, --option <value>', 'Description of option')
      .action(this.execute.bind(this));
  }

  async execute(options: any): Promise<void> {
    // Command implementation
  }
}
```

### Testing

The project uses Vitest for testing:

```bash
# Run all tests
pnpm test

# Run CLI-specific tests
pnpm test:cli

# Run command module tests
pnpm test:commands

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

## Troubleshooting

### Common Issues

#### Command Not Found

If `dzb-cv` command is not found:

1. Ensure you've built the project with `pnpm build`
2. Link the CLI globally with `pnpm link-cli`
3. Check that the `dist/cli/index.js` file has execute permissions

#### Permission Errors

If you encounter permission errors:

```bash
# Make the CLI executable
chmod +x dist/cli/index.js

# Link with sudo if needed
sudo pnpm link-cli
```

#### TypeScript Compilation Errors

If you encounter compilation errors:

1. Ensure TypeScript is installed: `pnpm add -D typescript`
2. Check your `tsconfig.json` is correctly configured
3. Run `pnpm typecheck` to verify types

### Getting Help

If you encounter issues:

1. Run the command with `--verbose` flag for detailed logging
2. Check the error messages for specific issues
3. File an issue on GitHub with detailed information

## Contributing

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/dzb-cv.git`
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Ensure code quality:
   - Run tests: `pnpm test`
   - Run linter: `pnpm lint`
   - Run type check: `pnpm typecheck`
6. Commit with a descriptive message
7. Push to your branch: `git push origin feature/my-feature`
8. Create a pull request

### Code Style

The project follows these code style guidelines:

- Use ESLint and Prettier for code formatting
- Follow TypeScript best practices
- Document public APIs with JSDoc comments
- Write unit tests for new functionality

### Commit Messages

Please use conventional commit messages:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

## License

This project is licensed under the MIT License - see the LICENSE file for details.

