# DZB-CV: CV Management System

A modular CV management system with job analysis capabilities. This tool helps create, manage, and tailor CVs for specific job applications.

## Features

- **CV Generation**: Generate CVs for different sectors (federal, state, private, academic)
- **Job Analysis**: Analyze job postings to extract key requirements for CV tailoring
- **Profile Management**: Import, export, and manage CV profiles
- **Multiple Output Formats**: Export as PDF, Markdown, or JSON
- **ATS Optimization**: Tailor CVs to pass Applicant Tracking Systems with scoring and improvement suggestions
- **Multiple Templates**: Support for various CV templates including Basic, Minimal, Federal, and Academic
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

2. Install Volta (if not already installed):
   ```bash
   curl https://get.volta.sh | bash
   ```

3. Let Volta install the correct Node.js and pnpm versions:
   ```bash
   # Volta will automatically use versions from package.json
   volta install node@20.10.0
   volta install pnpm@8.12.1
   ```

4. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

5. Build the CLI:
   ```bash
   pnpm build
   ```

6. Link the CLI globally (optional):
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
- `<sector>`: The sector to generate for (`federal`, `state`, `private`, or `academic`)

Options:
- `-f, --format <format>`: Output format (`markdown` or `pdf`, default: `pdf`)
- `-o, --output <path>`: Output directory for the generated CV (default: `output`)
- `--filename <name>`: Base filename for the generated CV
- `--template <name>`: Specify template to use (default varies by sector)
- `--ats-optimize`: Apply ATS optimization to the generated CV

Examples:
```bash
# Generate a federal CV in PDF format
dzb-cv generate federal

# Generate a state CV in markdown format
dzb-cv generate state --format markdown

# Generate a private CV with a custom filename
dzb-cv generate private --filename my-custom-cv --output ./my-output

# Generate an academic CV with ATS optimization
dzb-cv generate academic --ats-optimize
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
- `--extract-keywords`: Extract and prioritize keywords from the job posting
- `--match-skills`: Match job requirements with your existing skill set
- `--generate-suggestions`: Generate suggestions for CV customization

Examples:
```bash
# Analyze a job posting from a URL
dzb-cv analyze https://example.com/jobs/12345

# Analyze a job posting from a local file
dzb-cv analyze ./job-descriptions/analyst.txt --file

# Save analysis output to a JSON file
dzb-cv analyze https://example.com/jobs/12345 --output ./analysis.json --format json

# Analyze a job posting and match with your skills
dzb-cv analyze https://example.com/jobs/12345 --match-skills --profile-id profile-123
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

## Templates

The system supports multiple CV templates for different purposes:

### Basic Template

A clean, professional layout suitable for most industries with balanced content presentation.

### Minimal Template

A modern, minimalist design focusing on essential information, perfect for technology and creative industries.

### Federal Template

Detailed format following US government guidelines for applications to federal positions.

### Academic Template

Comprehensive format for academic and research positions, with sections for:

- Publications
- Conference presentations
- Grants and funding
- Research interests
- Academic service

## ATS Optimization

The system includes built-in ATS (Applicant Tracking System) optimization features:

### ATS Analysis

```bash
dzb-cv ats analyze <file> [options]
```

Analyzes your CV for ATS compatibility, checking for:

- Complex formatting that may confuse ATS parsers
- Non-standard section headings
- Missing or unclear dates
- Graphics or special characters
- Contact information formatting

The analysis provides a compatibility score and specific improvement suggestions.

### ATS Optimization

```bash
dzb-cv ats optimize <input-file> <output-file> [options]
```

Automatically optimizes your CV for ATS compatibility by:

- Standardizing headings
- Fixing date formats
- Improving keyword density
- Enhancing readability
- Removing complex formatting

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
  },
  "ats": {
    "optimize": true,
    "targetScore": 90
  },
  "templates": {
    "default": "basic",
    "federal": "federal",
    "academic": "academic"
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
```
.
├── src/                      # Source code
│   ├── ats/                  # ATS optimization tools
│   │   ├── analyzer.ts       # ATS compatibility analysis
│   │   └── optimizer.ts      # CV optimization for ATS
│   ├── cli/                  # CLI implementation
│   │   ├── commands/         # Command modules
│   │   └── index.ts          # CLI entry point
│   ├── core/                 # Business logic
│   │   ├── services/         # Core services
│   │   │   ├── pdf/          # PDF generation
│   │   │   │   ├── templates/  # CV templates
│   │   │   └── storage/      # Data storage
│   │   └── types/            # Type definitions
│   ├── shared/               # Shared utilities and types
│   │   ├── components/       # Reusable components
│   │   ├── templates/        # Markdown templates
│   │   ├── tools/            # Shared tools
│   │   └── utils/            # Utility functions
│   ├── templates/            # Template definitions
│   ├── tools/                # Core functionality
│   └── utils/                # Utility functions
├── dist/                     # Compiled JavaScript
├── job-postings/             # Sample job postings
├── docs/                     # Documentation
└── scripts/                  # Utility scripts
```
### Development Workflow

```bash
# Install dependencies
pnpm install

# Start development server with watch mode
pnpm dev

# Run the CLI in development mode
dzb-cv [commands...]

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

## PDF Generation and Templates

The system includes robust PDF generation capabilities with multiple templates:

```bash
dzb-cv generate pdf <input> <output> --template <template-name>
```

Options:
- `--template <name>`: Template to use (basic, minimal, federal, academic)
- `--paper-size <size>`: Paper size (letter, a4, legal)
- `--font <font>`: Primary font family
- `--font-size <size>`: Base font size
- `--margins <value>`: Page margins
- `--header <text>`: Custom header text
- `--footer <text>`: Custom footer text

The PDF generator supports:

- Full Markdown syntax
- Custom CSS styling
- Headers and footers
- Page numbers
- Custom fonts
- Template inheritance and customization

## Markdown Templates

The system uses Markdown templates for generating different CV formats:

- **Federal Templates**: Detailed templates following federal resume guidelines
- **Private Templates**: Various templates for private sector applications
- **State Templates**: Templates for state government positions
- **Academic Templates**: Comprehensive templates for academic positions

Templates support variables and conditional sections using Handlebars syntax:

```markdown
# {{personalInfo.name.full}}

{{#if personalInfo.title}}
*{{personalInfo.title}}*
{{/if}}

{{#each experience}}
## {{position}} at {{employer}}
{{startDate}} - {{endDate}}

{{#each responsibilities}}
- {{this}}
{{/each}}
{{/each}}
```

Templates are stored in the `src/shared/templates` directory and can be customized or extended.

## License

This project is licensed under the ISC License - see the LICENSE file for details.
