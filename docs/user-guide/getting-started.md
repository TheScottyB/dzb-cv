---
path: docs/user-guide/getting-started.md
type: user
category: guide
maintainer: system
last_updated: 2025-08-01
related_files:
  - docs/user-guide/advanced-usage.md
  - docs/user-guide/troubleshooting.md
---

# Getting Started with DZB-CV

## Introduction

DZB-CV is a TypeScript-based CV management system that allows you to create professional CVs with customizable templates and PDF export capabilities. The system is built as a modular monorepo with separate packages for types, core functionality, PDF generation, templates, and CLI interface.

This guide will help you get started with the basic setup and usage of the CLI tool.

## Prerequisites

- Node.js >= 20.10.0
- pnpm >= 10.9.0
- Git (for cloning the repository)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TheScottyB/dzb-cv.git
   cd dzb-cv
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm run build
   ```

4. Verify installation:
   ```bash
   node packages/cli/dist/index.js --help
   ```

5. Link the CLI globally (optional):
   ```bash
   cd packages/cli
   npm link
   cd ../..
   ```

## Basic Usage

### Available Commands

The CLI currently supports the following command:

- **`cv create`** - Create a new CV with personal information and generate PDF output

### Quick Start Commands

```bash
# Create a CV with required information
node packages/cli/dist/index.js create --name "John Doe" --email "john@example.com"

# Create a CV with custom output filename
node packages/cli/dist/index.js create --name "Jane Smith" --email "jane@company.com" --output "jane-cv.pdf"

# If you've linked the CLI globally:
cv create --name "Your Name" --email "your@email.com"

# Get help
node packages/cli/dist/index.js --help
node packages/cli/dist/index.js create --help
```

### Command Options

**Required:**
- `--name, -n <name>`: Full name for the CV
- `--email, -e <email>`: Email address

**Optional:**
- `--output, -o <file>`: Output PDF filename
- `--single-page`: Optimize PDF for single-page layout with improved scaling

## Examples

### Example 1: Basic CV Creation

```bash
# Create a simple CV
node packages/cli/dist/index.js create \
  --name "Sarah Johnson" \
  --email "sarah.johnson@email.com"
```

### Example 2: Professional CV with Custom Output

```bash
# Create a CV with specific output filename
node packages/cli/dist/index.js create \
  --name "Michael Chen" \
  --email "michael.chen@company.com" \
  --output "michael-chen-professional-cv.pdf"
```

### Example 3: Using Short Flags

```bash
# Same command with abbreviated flags
node packages/cli/dist/index.js create \
  -n "Dr. Emily Rodriguez" \
  -e "e.rodriguez@university.edu" \
  -o "emily-academic-cv.pdf"
```

### Example 4: Single-Page Optimized CV

```bash
# Create a CV optimized for single-page layout
node packages/cli/dist/index.js create \
  --name "Alex Thompson" \
  --email "alex@example.com" \
  --single-page \
  --output "alex-single-page-cv.pdf"

# If CLI is globally linked:
cv create --name "Sarah Wilson" --email "sarah@company.com" --single-page
```

**Note:** The `--single-page` flag applies optimized scaling parameters to fit content on a single page while maintaining readability. This is ideal for job applications that prefer concise, one-page resumes.

## Next Steps

- See [USAGE.md](../../USAGE.md) for comprehensive usage guide with examples
- See [Advanced Usage](advanced-usage.md) for detailed features and customization
- Check [Troubleshooting](troubleshooting.md) if you encounter any issues
- Read our [Technical Documentation](../technical/README.md) for development information

