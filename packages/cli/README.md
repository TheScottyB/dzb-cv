# @dzb-cv/cli

Command-line interface for the DZB-CV system.

## Commands

- `generate`: Generate CVs in various formats
- `analyze`: Analyze job postings
- `profile`: Manage CV profiles
- `ats`: ATS-related operations

## Usage

```bash
# Install globally
pnpm add -g @dzb-cv/cli

# Generate a CV
dzb-cv generate federal

# Analyze a job posting
dzb-cv analyze job-posting.txt
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Run CLI in development
pnpm dev
```

## Adding New Commands

See main README for detailed instructions on adding new commands.

