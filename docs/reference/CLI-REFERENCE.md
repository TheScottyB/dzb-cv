# CLI Reference

Complete reference documentation for the DZB-CV command-line interface.

## Overview

The DZB-CV CLI provides a command-line interface for creating and managing professional CVs. The CLI is built using the Commander.js framework and supports various commands for CV operations.

## Installation and Setup

### Prerequisites

- Node.js >= 20.10.0
- pnpm >= 10.9.0

### Using the CLI

There are two ways to use the CLI:

1. **Direct execution** (after building):
   ```bash
   node packages/cli/dist/index.js [command] [options]
   ```

2. **Global linking** (for development):
   ```bash
   cd packages/cli && npm link
   cv [command] [options]
   ```

## Global Options

These options are available for all commands:

| Option | Alias | Description |
|--------|--------|-------------|
| `--version` | `-V` | Output the version number |
| `--help` | `-h` | Display help information |

## Commands

### `cv create`

Creates a new CV with basic personal information and generates a PDF output.

#### Syntax

```bash
cv create [options]
```

#### Required Options

| Option | Alias | Type | Description |
|--------|--------|------|-------------|
| `--name` | `-n` | `<string>` | Full name for the CV |
| `--email` | `-e` | `<string>` | Email address |

#### Optional Options

| Option | Alias | Type | Description | Default |
|--------|--------|------|-------------|---------|
| `--output` | `-o` | `<string>` | Output PDF filename | Auto-generated |
| `--single-page` | | `boolean` | Force PDF to fit on a single page | `false` |

#### Examples

```bash
# Basic usage with required options
cv create --name "John Doe" --email "john@example.com"

# With custom output filename
cv create --name "Jane Smith" --email "jane@company.com" --output "jane-cv.pdf"

# Using short aliases
cv create -n "Alex Johnson" -e "alex@example.com" -o "alex-cv.pdf"

# Professional example
cv create \
  --name "Dr. Sarah Chen" \
  --email "s.chen@university.edu" \
  --output "sarah-chen-academic-cv.pdf"
```

#### Behavior

1. **Name Parsing**: The `--name` option is automatically parsed:
   - First word becomes the first name
   - Remaining words become the last name
   - Full name is stored as provided

2. **Email Validation**: Basic email format validation is performed

3. **PDF Generation**: A PDF is automatically generated using the configured template

4. **Output**: 
   - Console feedback shows the CV creation process
   - PDF byte size is displayed upon successful generation
   - Errors are logged to stderr with exit code 1

#### Return Codes

| Code | Meaning |
|------|---------|
| `0` | Success - CV created and PDF generated |
| `1` | Error - Failed to create CV or generate PDF |

### `cv optimize`

Optimize a CV for a specific job by leveraging detailed analysis and custom scoring.

#### Syntax

```bash
cv optimize <cv-file> <job-description> [options]
```

#### Options

| Option | Alias | Description |
|--------|--------|-------------|
| `--output` | `-o` | Path for the optimized CV output |
| `--format` | `-f` | Output format, e.g. `pdf`, `markdown` |
| `--profile` | `-p` | Specific profile to optimize for |

#### Examples

```bash
# Optimize a CV with detailed job alignment
cv optimize john-doe.md job-details.txt --output optimized-cv.pdf --format pdf

# Optimize using a specific profile
cv optimize jane-smith.md job-ad.md --profile tech --output jane-tech-optimized.md --format markdown
```

## Error Handling

The CLI provides comprehensive error handling:

### Common Errors

| Error Type | Description | Solution |
|------------|-------------|----------|
| Missing required option | Required `--name` or `--email` not provided | Provide all required options |
| Invalid email format | Email doesn't match expected format | Use valid email format |
| PDF generation failure | Error in PDF creation process | Check logs, ensure dependencies are installed |
| File system errors | Cannot write output file | Check permissions and disk space |

### Error Output Format

Errors are output to stderr with the following format:

```
Error creating CV: [specific error message]
```

The process exits with code 1 on any error.

## Development Usage

### Direct Node Execution

When developing or when the CLI isn't globally linked:

```bash
# From project root
node packages/cli/dist/index.js create --name "Test User" --email "test@example.com"

# With full path
/path/to/dzb-cv/packages/cli/dist/index.js create -n "Test User" -e "test@example.com"
```

### Environment Variables

The CLI respects the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable debug output | `false` |
| `NODE_ENV` | Environment mode | `production` |

Example:
```bash
DEBUG=dzb-cv:* cv create --name "Debug Test" --email "debug@example.com"
```

## Integration Examples

### Shell Scripts

```bash
#!/bin/bash
# generate-team-cvs.sh

TEAM_MEMBERS=(
  "Alice Johnson:alice@company.com"
  "Bob Smith:bob@company.com"
  "Carol Davis:carol@company.com"
)

for member in "${TEAM_MEMBERS[@]}"; do
  name="${member%:*}"
  email="${member#*:}"
  filename="${name// /-}-cv.pdf"
  
  echo "Generating CV for $name..."
  cv create --name "$name" --email "$email" --output "$filename"
done
```

### CI/CD Integration

```yaml
# GitHub Actions example
name: Generate CV
on: [push]

jobs:
  generate-cv:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.10.0'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm run build
      - run: |
          node packages/cli/dist/index.js create \
            --name "${{ github.actor }}" \
            --email "${{ github.actor }}@users.noreply.github.com" \
            --output "generated-cv.pdf"
      - uses: actions/upload-artifact@v3
        with:
          name: cv-pdf
          path: generated-cv.pdf
```

### npm Scripts Integration

```json
{
  "scripts": {
    "cv:create": "node packages/cli/dist/index.js create",
    "cv:generate": "npm run cv:create -- --name \"$npm_config_name\" --email \"$npm_config_email\""
  }
}
```

Usage:
```bash
npm run cv:generate --name="John Doe" --email="john@example.com"
```

## Programmatic Usage

While primarily a CLI tool, the underlying functionality can be used programmatically:

```typescript
import { createCVCommand } from '@dzb-cv/cli';
import { Command } from 'commander';

const program = new Command();
createCVCommand(program);

// Parse arguments programmatically
program.parse(['node', 'cli.js', 'create', '--name', 'John Doe', '--email', 'john@example.com']);
```

## Troubleshooting

### Common Issues

1. **"Command not found: cv"**
   - Solution: Either use full path or link CLI globally
   - Command: `cd packages/cli && npm link`

2. **"Module not found" errors**
   - Solution: Rebuild all packages
   - Command: `pnpm run clean && pnpm install && pnpm run build`

3. **Permission denied**
   - Solution: Check file permissions or use sudo for global linking
   - Command: `sudo npm link` (if necessary)

4. **PDF generation fails**
   - Solution: Verify dependencies and check logs
   - Command: `cd packages/pdf && pnpm run build && pnpm test`

### Debug Mode

Enable verbose logging:

```bash
DEBUG=dzb-cv:* cv create --name "Debug Test" --email "debug@example.com"
```

### Version Information

Check CLI and dependencies:

```bash
# CLI version
cv --version

# Node.js version
node --version

# pnpm version
pnpm --version

# Package versions
pnpm list --depth=0
```

## Future Commands

The following commands are planned for future releases:

- `cv list` - List all created CVs
- `cv update` - Update existing CV data
- `cv export` - Export CVs in different formats
- `cv template` - Manage CV templates
- `cv config` - Configure CLI settings

## API Compatibility

The CLI is built on top of the core DZB-CV packages:

- `@dzb-cv/core` - Core CV management functionality
- `@dzb-cv/pdf` - PDF generation capabilities
- `@dzb-cv/types` - Type definitions
- `@dzb-cv/templates` - Template system

Changes to these packages may affect CLI behavior. Always rebuild after updating dependencies:

```bash
pnpm run build
```

## Contributing

To contribute to the CLI:

1. Add new commands in `packages/cli/src/commands/`
2. Update this documentation
3. Add tests in `packages/cli/src/commands/__tests__/`
4. Update the main CLI entry point in `packages/cli/src/index.ts`

For detailed contributing guidelines, see [CONTRIBUTING.md](../../CONTRIBUTING.md).
