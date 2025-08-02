# DZB-CV Usage Guide

A comprehensive guide to using the DZB-CV system for creating professional CVs and resumes.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [CLI Usage](#cli-usage)
- [Common Workflows](#common-workflows)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Getting Started

DZB-CV is a TypeScript-based CV management system that allows you to create professional CVs with customizable templates and PDF export capabilities.

### Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 20.10.0
- **pnpm** >= 10.9.0
- **Git** (for cloning the repository)

Check your versions:
```bash
node --version    # Should be >= 20.10.0
pnpm --version    # Should be >= 10.9.0
```

## Installation

### 🚀 Method 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/TheScottyB/dzb-cv.git
cd dzb-cv

# Run the automated setup script
./setup-dzb-cv.sh
```

The script will automatically:
- ✅ Check system requirements
- ✅ Install dependencies  
- ✅ Build all packages
- ✅ Test CLI functionality
- ✅ Optionally link CLI globally

### ⚡ Method 2: Quick Setup

```bash
# Clone and quick setup (no global linking)
git clone https://github.com/TheScottyB/dzb-cv.git
cd dzb-cv
pnpm run setup:quick
```

### 🔧 Method 3: Manual Setup

```bash
# Clone the repository
git clone https://github.com/TheScottyB/dzb-cv.git
cd dzb-cv

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Link CLI globally (optional)
pnpm run link-cli
```

### Verify Installation

```bash
# Test the CLI
node packages/cli/dist/index.js --help

# Or if globally linked
cv --help
```

You should see:
```
Usage: cv [options] [command]

CV management tool

Options:
  -V, --version     output the version number
  -h, --help        display help for command

Commands:
  create [options]  Create a new CV
  help [command]    display help for command
```

## CLI Usage

### Available Commands

The current CLI supports the following commands:

#### `cv create` - Create a New CV

Creates a new CV with basic personal information and generates a PDF output.

**Syntax:**
```bash
cv create --name "Full Name" --email "email@example.com" [--output filename.pdf]
```

**Required Options:**
- `--name, -n <name>`: Full name for the CV
- `--email, -e <email>`: Email address

**Optional Options:**
- `--output, -o <file>`: Output PDF filename (default: generated automatically)

**Examples:**
```bash
# Basic CV creation
cv create --name "John Doe" --email "john.doe@email.com"

# With custom output filename
cv create --name "Jane Smith" --email "jane@company.com" --output "jane-smith-cv.pdf"

# Using short flags
cv create -n "Alex Johnson" -e "alex@email.com" -o "alex-cv.pdf"
```

#### `--single-page` Flag for CLI Create

The CLI `create` command supports a `--single-page` flag for optimized single-page PDF generation.

**Syntax:**
```bash
cv create --name <name> --email <email> [--single-page] [--output <file>]
```

**Optional Flags:**
- `--single-page`: Optimize PDF for single-page layout with improved scaling
- `--output <file>`: Custom output filename

**Examples:**
```bash
# Generate single-page CV with optimized scaling
cv create --name "John Doe" --email "john@example.com" --single-page

# Single-page CV with custom filename
cv create --name "Jane Smith" --email "jane@company.com" --single-page --output "jane-optimized-cv.pdf"

# Standard CV (multi-page capable)
cv create --name "John Doe" --email "john@example.com"
```

**Note**: For sector-specific templates and advanced generation features, use the AI generator or simple scripts described below.

### Command Help

Get help for any command:

```bash
# General help
cv --help
dzb-cv --help

# Help for specific command
cv create --help
dzb-cv generate --help

# Version information
cv --version
dzb-cv --version
```

## Common Workflows

### Workflow 1: First-Time Setup and CV Creation

```bash
# 1. Clone and run automated setup
git clone https://github.com/TheScottyB/dzb-cv.git
cd dzb-cv
./setup-dzb-cv.sh

# 2. Create your CV (if CLI was linked globally)
cv create \
  --name "Your Full Name" \
  --email "your.email@example.com" \
  --output "my-professional-cv.pdf"

# Or use direct path if not globally linked
node packages/cli/dist/index.js create \
  --name "Your Full Name" \
  --email "your.email@example.com" \
  --output "my-professional-cv.pdf"
```

### Workflow 2: Development and Testing

```bash
# 1. Make changes to the code
# ... edit files ...

# 2. Rebuild the project
pnpm run build

# 3. Test your changes
pnpm test

# 4. Test the CLI with your changes
node packages/cli/dist/index.js create --name "Test User" --email "test@example.com"
```

### Workflow 3: Managing Global CLI Access

```bash
# Link CLI globally (if not done during setup)
pnpm run link-cli

# Use the CLI from anywhere
cv create --name "John Doe" --email "john@example.com"

# Unlink CLI if needed
pnpm run unlink-cli

# Rebuild and test after changes
pnpm run build
cv --help
```

## Advanced Usage

### Using Different Node Environments

```bash
# Using specific Node version with nvm
nvm use 20.10.0
node packages/cli/dist/index.js create --name "Test" --email "test@example.com"

# Using npx for one-off execution
npx --node-options="--max-old-space-size=4096" node packages/cli/dist/index.js create --name "Test" --email "test@example.com"
```

### Development Commands

```bash
# Run tests across all packages
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm run typecheck

# Linting
pnpm run lint
pnpm run lint:fix

# Clean build artifacts
pnpm run clean
```

### Package-Specific Development

```bash
# Work on a specific package
cd packages/core
pnpm run build
pnpm test

# Build only specific packages
pnpm --filter @dzb-cv/core run build
pnpm --filter @dzb-cv/pdf run build
```

## Examples

### Example 1: Basic Personal CV

```bash
cv create \
  --name "Sarah Johnson" \
  --email "sarah.johnson@email.com" \
  --output "sarah-johnson-cv.pdf"
```

### Example 2: Professional CV with Corporate Email

```bash
cv create \
  --name "Michael Chen" \
  --email "michael.chen@company.com" \
  --output "michael-chen-professional-cv.pdf"
```

### Example 3: Academic CV

```bash
cv create \
  --name "Dr. Emily Rodriguez" \
  --email "e.rodriguez@university.edu" \
  --output "emily-rodriguez-academic-cv.pdf"
```

### Example 4: Batch Processing (Multiple CVs)

```bash
#!/bin/bash
# Create multiple CVs with different configurations

cv create --name "Alice Smith" --email "alice@company.com" --output "alice-cv.pdf"
cv create --name "Bob Wilson" --email "bob@startup.io" --output "bob-cv.pdf"
cv create --name "Carol Davis" --email "carol@nonprofit.org" --output "carol-cv.pdf"
```

## Integration Examples

### Using in Scripts

```bash
#!/bin/bash
# automated-cv-generation.sh

# Check if DZB-CV is available
if ! command -v cv &> /dev/null; then
    echo "DZB-CV CLI not found. Please install and link it."
    exit 1
fi

# Generate CV
echo "Generating CV..."
cv create \
  --name "$FULL_NAME" \
  --email "$EMAIL_ADDRESS" \
  --output "generated-cv-$(date +%Y%m%d).pdf"

echo "CV generated successfully!"
```

### Integration with CI/CD

```yaml
# .github/workflows/cv-generation.yml
name: Generate CV
on:
  push:
    branches: [main]

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
      - run: node packages/cli/dist/index.js create --name "Auto Generated" --email "auto@example.com"
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Command not found: cv"

**Solution:**
```bash
# Make sure you've linked the CLI
cd packages/cli && npm link

# Or use the full path
node packages/cli/dist/index.js create --help
```

#### Issue: "Module not found" errors

**Solution:**
```bash
# Rebuild all packages
pnpm run clean
pnpm install
pnpm run build
```

#### Issue: TypeScript compilation errors

**Solution:**
```bash
# Check TypeScript version
pnpm list typescript

# Run type checking
pnpm run typecheck

# Rebuild with verbose output
pnpm run build --verbose
```

#### Issue: PDF generation fails

**Solution:**
```bash
# Check if all dependencies are installed
pnpm install

# Verify PDF package build
cd packages/pdf
pnpm run build
pnpm test
```

#### Issue: Permission denied when linking CLI

**Solution:**
```bash
# Use sudo if necessary (macOS/Linux)
sudo npm link

# Or change npm prefix (recommended)
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Set debug environment
export DEBUG=dzb-cv:*

# Run with debug output
cv create --name "Debug Test" --email "debug@example.com"
```

### Getting Help

1. **Check the documentation**: Review this guide and the README.md
2. **Run help commands**: Use `cv --help` and `cv create --help`
3. **Check the logs**: Look for error messages in the console output
4. **Verify installation**: Ensure all dependencies are installed and packages are built
5. **Create an issue**: If problems persist, create an issue on GitHub with:
   - Your operating system and version
   - Node.js and pnpm versions
   - Complete error message
   - Steps to reproduce the issue

## Next Steps

- **Customize Templates**: Explore the `packages/templates/` directory to customize CV layouts
- **Extend Functionality**: Add new commands to the CLI in `packages/cli/src/commands/`
- **API Integration**: Use the core packages programmatically in your applications
- **Web Interface**: Consider building a web frontend using the existing packages

For more advanced usage and development information, see:
- [Technical Documentation](docs/technical/README.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [API Reference](docs/reference/Reference.md)
