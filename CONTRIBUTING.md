# Contributing to dzb-cv

Thank you for your interest in contributing to this project! Here's what you need to know to get started and ensure the best developer experience for everyone.

## Toolchain Requirements

- **Node.js**: 20.10.0 (managed via [Volta](https://volta.sh) — recommended)
- **pnpm**: 8.12.1+
- **Git**: with [Git LFS](https://git-lfs.com/)
- **(Optional) Ruby 3.2.3:** for mixed stacks

> All required versions are pinned via Volta and specified in `package.json`.

## Setup (One-Time)

```sh
pnpm install
pnpm run setup
pnpm run prepare  # Installs Husky hooks
```

## VSCode Workspace Recommendations

- Extensions recommended in `.vscode/extensions.json`:
  - ESLint, Prettier, Vitest Explorer, ZipFS
- `.vscode/settings.json` enforces format on save and lint integration.

## Code Style & Quality

- **Linting:** Strict, enforced by ESLint + TypeScript recommended rules.
- **Formatting:** Prettier, config in `.prettierrc`.
- **Type Checking:** Strict, `"strict": true` in `tsconfig.json`.
- **Tests:** Run with Vitest, coverage thresholds encouraged.

> All are surfaced in-editor (with the right extensions), on commit (pre-commit hooks), and in CI.

## Commit Conventions

- This repo enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint and Husky.
- Please use descriptive commit messages (e.g., `feat: add user profile export`, `fix(cli): handle parse errors gracefully`).

## Workflow

- Lint, type-check, and format run on pre-commit.
- Tests run on pre-push.
- CI will also block merge on failing checks.

## Useful Scripts

| Script                | Description                             |
|-----------------------|-----------------------------------------|
| pnpm dev              | Start dev cli (watch mode, TS)          |
| pnpm lint             | Run ESLint on main sources               |
| pnpm lint-staged      | Lint & format only staged files          |
| pnpm typecheck        | Run TypeScript strict checking           |
| pnpm test             | Run all tests (Vitest)                   |
| pnpm test:watch       | Watch tests (Vitest)                     |
| pnpm format           | Format code with Prettier                |

## Need Help?

Open an issue or start a discussion in the GitHub repository. Thank you for contributing!

