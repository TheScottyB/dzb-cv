# dzb-cv

A powerful, modular curriculum vitae management system built with TypeScript. Generate and maintain professional CVs with customizable templates and multiple export formats.

## Features

- 📄 Modular CV data management
- 🎨 Customizable templates
- 📱 CLI interface for easy CV creation and updates
- 🔄 Type-safe data structures
- 📦 PDF export support
- 🏗️ Extensible architecture

## Project Structure

The project is organized as a monorepo using pnpm workspaces:

```
packages/
├── types/     # Shared type definitions for CV data structures
├── core/      # Core CV management functionality and services
├── pdf/       # PDF generation and rendering capabilities
├── templates/ # CV templates (basic, academic, etc.)
└── cli/       # Command-line interface for CV operations
```

### Package Details

- **@dzb-cv/types**: Foundation of the type system, containing shared interfaces and type definitions used across all packages. Includes CV data structures, PDF configuration types, and more.

- **@dzb-cv/core**: The heart of the system, providing CV management services, data handling, and integration with storage solutions. Depends on @dzb-cv/types.

- **@dzb-cv/pdf**: PDF generation functionality with different layout options and styling capabilities. Uses pdf-lib for document creation and depends on @dzb-cv/types.

- **@dzb-cv/templates**: Collection of customizable CV templates, including basic and academic formats. Templates define both structure and styling. Depends on @dzb-cv/types.

- **@dzb-cv/cli**: Command-line interface for interacting with the CV system. Provides commands for creating, updating, and exporting CVs. Depends on all other packages.

## Installation

### Requirements

- Node.js >= 20.10.0
- pnpm >= 10.9.0

### Global Installation (coming soon)

```bash
# Install globally
npm install -g @dzb-cv/cli

# Use the CLI
cv create --name "John Doe" --email "john@example.com"
```

### Local Development Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dzb-cv.git
cd dzb-cv

# Install dependencies
pnpm install

# Build packages
pnpm run build

# Run CLI commands locally
pnpm cv create --name "John Doe" --email "john@example.com"
```

## Quick Start

### Create Your First CV

1. **Initialize a new CV**:

```bash
pnpm cv create --name "John Doe" --email "john@example.com"
```

2. **Export to PDF** (coming soon):

```bash
pnpm cv export --id "your-cv-id" --format pdf --output "my-cv.pdf"
```

3. **Update your CV** (coming soon):

```bash
pnpm cv update --id "your-cv-id" --add-experience "Company Name" --title "Job Title" --start "2022-01" --end "Present"
```

## Development Setup

### Workspace Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm run typecheck

# Clean build artifacts
pnpm run clean
```

### IDE Recommendations

- **VSCode**: Recommended for TypeScript development with the following extensions:
  - ESLint
  - Prettier
  - TypeScript Hero
  - Jest Runner

### Package Development

Each package can be developed independently:

```bash
# Build a specific package
cd packages/core
pnpm run build

# Test a specific package
cd packages/pdf
pnpm test
```

## Package Documentation

### @dzb-cv/types

Contains all type definitions used throughout the system:

```typescript
import { CVData, PersonalInfo, ExperienceItem } from '@dzb-cv/types';

// Create a CV data structure
const myCV: CVData = {
  personalInfo: {
    name: {
      first: 'John',
      last: 'Doe',
      full: 'John Doe'
    },
    contact: {
      email: 'john@example.com'
    }
  },
  experience: [],
  education: [],
  skills: []
};
```

### @dzb-cv/core

Provides the CVService for managing CV data:

```typescript
import { CVService } from '@dzb-cv/core';
import type { CVData } from '@dzb-cv/types';

// Example CV service usage
const service = new CVService(storageProvider, pdfGenerator);
await service.createCV(cvData);
```

### @dzb-cv/pdf

PDF generation capabilities:

```typescript
import { StandardPDFGenerator } from '@dzb-cv/pdf';
import type { CVData } from '@dzb-cv/types';

const generator = new StandardPDFGenerator();
const pdfBytes = await generator.generatePDF(cvData);
```

### @dzb-cv/templates

Template system for CV rendering:

```typescript
import { BasicTemplate } from '@dzb-cv/templates/basic';
import type { CVData } from '@dzb-cv/types';

const template = new BasicTemplate();
const renderedCV = template.render(cvData);
```

### @dzb-cv/cli

Command-line interface:

```bash
# Available commands
pnpm cv create --name "John Doe" --email "john@example.com"
```

## Configuration

### CV Data Structure

The core CV data structure includes:

- Personal Information (name, contact details)
- Work Experience
- Education
- Skills
- Projects (coming soon)
- Publications (coming soon)
- References (coming soon)

### Template Configuration

Templates can be configured with various options:

```typescript
// Coming soon
const template = new BasicTemplate({
  fontFamily: 'Arial',
  primaryColor: '#2D3748',
  fontSize: 11
});
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure they pass
5. Submit a pull request

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon).

## Project Status

The project is currently in alpha stage with core functionality implemented. Planned features include:

- More CV templates
- Web interface
- Extended data fields
- Additional export formats (HTML, Markdown)

See the [project roadmap](ROADMAP.md) (coming soon) for more details.

## License

MIT (coming soon)
