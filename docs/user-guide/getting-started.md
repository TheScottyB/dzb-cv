---
path: docs/user-guide/getting-started.md
type: user
category: guide
maintainer: system
last_updated: 2024-03-27
related_files:
  - docs/user-guide/advanced-usage.md
  - docs/user-guide/troubleshooting.md
---

# Getting Started with DZB-CV

## Introduction

DZB-CV is a specialized tool for generating tailored CVs for different job sectors from a single source of data. 

> **Note:** This tool is uniquely designed for a single user: Dawn Zurick Beilfuss. All features, templates, and data are tailored for Dawn, ensuring maximum consistency, automation, and personal optimization throughout her job search journey.

This guide will help you get started with the basic setup and usage.

## Prerequisites

- Node.js 20.10.0 or higher
- pnpm 8.12.1 or higher

## Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the project:
   ```bash
   pnpm build
   ```

3. Link the CLI globally (optional):
   ```bash
   pnpm link-cli
   ```

## Basic Usage

### Available CV Formats

This tool generates three types of CVs:

1. **Federal Format** - For US federal government applications
2. **State Format** - For state government applications
3. **Private Sector** - For private industry

### Quick Start Commands

```bash
# Generate a basic CV
dzb-cv generate federal
dzb-cv generate state
dzb-cv generate private

# Get help
dzb-cv --help
dzb-cv generate --help
```

### Output Location

Generated CVs are saved to:
- `output/federal/` - Federal job applications
- `output/state/` - State job applications 
- `output/private/` - Private sector applications

## Next Steps

- See [Advanced Usage](advanced-usage.md) for detailed features and customization
- Check [Troubleshooting](troubleshooting.md) if you encounter any issues
- Read our [CLI Reference](../reference/cli-commands.md) for complete command documentation

