# CV Generator Usage Guide

## Setup
1. Install dependencies:
```bash
pnpm install
```

2. Build the project:
```bash
pnpm build
```

## Generating CVs

### Generate a specific sector CV:
- Federal CV: `pnpm generate:federal`
- State CV: `pnpm generate:state`
- Private Sector CV: `pnpm generate:private`

### Generate all CV formats:
```bash
pnpm generate:all
```

## Project Structure

```
dzb-cv/
├── src/
│   ├── templates/       # CV templates for each sector
│   ├── data/           # CV data files
│   ├── utils/          # Helper functions
│   └── types/          # TypeScript type definitions
├── output/             # Generated CVs
│   ├── federal/
│   ├── state/
│   └── private/
└── assets/            # Supporting documents and images
```

## Adding New Content

1. Update base information in `src/data/base-info.json`
2. Modify templates in `src/templates/<sector>` as needed
3. Run appropriate generate command

## Customizing Templates

Templates use Handlebars syntax and support:
- Variable substitution: `{{variable}}`
- Loops: `{{#each items}}...{{/each}}`
- Conditionals: `{{#if condition}}...{{/if}}`

## Version Control

- CV versions are tracked in git
- Generated files are stored in `output/<sector>/<date>/`
- Support files are stored in `assets/`
