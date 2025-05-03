# CV Management System

A modular system for managing and generating CVs in various formats.

## Project Structure

```
packages/
├── types/     # Shared type definitions
├── core/      # Core CV management functionality
├── pdf/       # PDF generation
├── templates/ # CV templates
└── cli/       # Command-line interface
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm test

# Type checking
pnpm run typecheck

# Clean build artifacts
pnpm run clean
```

## Usage

```bash
# Create a new CV
pnpm cv create --name "John Doe" --email "john@example.com"
```
