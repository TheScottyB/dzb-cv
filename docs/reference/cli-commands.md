---
path: docs/reference/cli-commands.md
type: reference
category: cli
maintainer: system
last_updated: 2024-03-27
---

# CLI Reference

## Command Structure
```typescript
program
  .name('dzb-cv')
  .description('Dawn Z. Beilfuss CV and profile management system')
  .version('1.0.0')
```

## Available Commands

### 1. Generate CV
```bash
dzb-cv generate <sector> [options]
Options:
  -f, --format <format>  Output format (markdown, pdf)
  -o, --output <path>    Output directory
  --filename <name>      Custom filename
```

### 2. Analyze Job
```bash
dzb-cv analyze <source> [options]
Options:
  -o, --output <path>     Save analysis output
  -f, --format <format>   Output format (json, text, markdown)
  --file                  Use local file instead of URL
  --force-generic         Use generic parser
  --save-raw-content     Save raw content
```

### 3. Profile Management
```bash
dzb-cv profile <command> [options]
Commands:
  import    Import CV document
  export    Export profile
  validate  Validate profile
  list      List profiles
```

#### Profile Import
```bash
dzb-cv profile import <file> [options]
Options:
  -o, --owner <name>    Profile owner name
  -v, --validate        Validate profile data
  --output <path>       Save imported profile
  -f, --format <format> Output format (json, markdown)
```

#### Profile Export
```bash
dzb-cv profile export [options]
Options:
  -p, --profile-id <id>  Profile ID to export
  -f, --format <format>  Export format (json, markdown, pdf)
  -o, --output <path>    Output file path
```

#### Profile Validation
```bash
dzb-cv profile validate <file> [options]
Options:
  -t, --type <type>     Validation type (basic, strict, federal)
```

## Global Options
- `-v, --verbose`: Enable verbose output
- `--no-color`: Disable color output
- `-c, --config <path>`: Path to configuration file 