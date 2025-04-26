---
path: docs/technical/documentation-metadata.md
type: technical
category: documentation
maintainer: system
last_updated: 2024-03-27
---

# Documentation Metadata Format

## Overview
Each documentation file in the DZB-CV project includes a YAML metadata header that provides important information about the file's purpose, location, and maintenance status.

## Format
```yaml
---
path: relative/path/to/file.md
type: <type>
category: <category>
maintainer: <maintainer>
last_updated: YYYY-MM-DD
related_files:  # Optional
  - path/to/related/file1.md
  - path/to/related/file2.md
---
```

## Fields

### Required Fields
- `path`: Relative path to the file from the project root
- `type`: Document type (see Types section)
- `category`: Document category (see Categories section)
- `maintainer`: Who maintains this document
- `last_updated`: Date of last update (YYYY-MM-DD format)

### Optional Fields
- `related_files`: List of related documentation files
- `deprecated`: Boolean indicating if the document is deprecated
- `version`: Document version number
- `tags`: List of relevant tags

## Types
- `technical`: Technical documentation
- `reference`: Reference documentation
- `user`: User-facing documentation
- `index`: Directory index or overview
- `example`: Example documentation

## Categories
- `architecture`: System architecture documentation
- `cli`: Command-line interface documentation
- `profiles`: Profile management documentation
- `documentation`: Documentation about documentation
- `configuration`: Configuration documentation
- `api`: API documentation

## Best Practices

1. **Metadata Maintenance**
   - Keep `last_updated` field current
   - Review and update related files
   - Maintain accurate categorization

2. **File Organization**
   - Use consistent paths
   - Keep related files together
   - Follow naming conventions

3. **Version Control**
   - Update metadata on significant changes
   - Track deprecated content
   - Maintain change history

## Example
```yaml
---
path: docs/technical/system-architecture.md
type: technical
category: architecture
maintainer: system
last_updated: 2024-03-27
related_files:
  - docs/technical/profile-management.md
  - docs/reference/cli-commands.md
---
``` 