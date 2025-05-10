# Reference

## Introduction

This document provides a consolidated reference for the DZB-CV project, including CLI commands, and placeholders for API and configuration documentation. Use this as the main entry point for all reference material.

---

## CLI Reference

### Command Structure
```typescript
program
  .name('dzb-cv')
  .description('Dawn Z. Beilfuss CV and profile management system')
  .version('1.0.0')
```

### Available Commands

#### 1. Generate CV
```bash
dzb-cv generate <sector> [options]
Options:
  -f, --format <format>  Output format (markdown, pdf)
  -o, --output <path>    Output directory
  --filename <n>      Custom filename
```

#### 2. Analyze Job (Beta)
```bash
dzb-cv analyze <source> [options]
Options:
  -o, --output <path>     Save analysis output (basic analysis only)
  -f, --format <format>   Output format (json, text, markdown)
  --file                  Use local file instead of URL (basic parsing)
  --force-generic         Use generic parser
  --save-raw-content     Save raw content from URL
  --no-rate-limit        Disable rate limiting

Note: This command is currently in development. Basic functionality includes:
- File-based job description parsing
- Basic URL content retrieval
- Simple keyword extraction
- Basic structure analysis

Full job analysis features including ATS optimization and detailed requirement extraction are planned for future releases.
```

#### 3. Profile Management
```bash
dzb-cv profile <command> [options]
Commands:
  import    Import CV document
  export    Export profile
  validate  Validate profile
  list      List profiles
```

##### Profile Import
```bash
dzb-cv profile import <file> [options]
Options:
  -o, --owner <name>    Profile owner name
  -v, --validate        Validate profile data
  --output <path>       Save imported profile
  -f, --format <format> Output format (json, markdown)
```

##### Profile Export
```bash
dzb-cv profile export [options]
Options:
  -p, --profile-id <id>  Profile ID to export
  -f, --format <format>  Export format (json, markdown, pdf)
  -o, --output <path>    Output file path
```

##### Profile Validation
```bash
dzb-cv profile validate <file> [options]
Options:
  -t, --type <type>     Validation type (basic, strict, federal)
```

#### Global Options
- `-v, --verbose`: Enable verbose output
- `--no-color`: Disable color output
- `-c, --config <path>`: Path to configuration file

---

## API Reference *(coming soon)*

_This section will document all public APIs, types, and endpoints as the project evolves._

---

## Configuration Reference *(coming soon)*

_This section will document all configuration options, files, and environment variables as the project evolves._

---

## Further Reading
- [User Guide](../user-guide/)
- [System Architecture](../technical/System-Architecture.md)
- [Developer Experience & Maintenance](../technical/Developer-Experience.md) 