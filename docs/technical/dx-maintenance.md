# dzb-cv DX Maintenance Checklist

_Keep this checklist up to date to ensure world-class developer experience (DX) for all contributors._

---

## 🚀 Onboarding & Setup

- [ ] Use Volta to manage tool versions (`node`, `pnpm`) as specified in `package.json`
- [ ] Install dependencies: `pnpm install`
- [ ] Run setup and prepare scripts:  
  - `pnpm run setup`  
  - `pnpm run prepare`
- [ ] Enable Git LFS if prompted

---

## 🛠 Required VSCode Extensions & Settings

- [ ] Install all recommended extensions (`.vscode/extensions.json`):
  - ESLint (`dbaeumer.vscode-eslint`)
  - Prettier (`esbenp.prettier-vscode`)
  - Vitest Explorer (`vitest.explorer`)
  - VSCode ZipFS (`arcanis.vscode-zipfs`)
- [ ] Ensure settings in `.vscode/settings.json` are respected, especially:
  - Format on save is enabled
  - ESLint runs on JavaScript/TypeScript files
  - Prettier is the default formatter
- [ ] Use provided launch and task configs for rapid dev/test/debug

---

## 🔒 Pre-commit/CI Code Quality

- [ ] Problems are surfaced early via editor and PR (CI problem matchers active)
- [ ] CI must pass on PR before merge (typecheck, lint, test, build)

---

## 📝 Commit Conventions

- [ ] Use clear, semantic commit messages (`feat:`, `fix:`, `chore:`, etc.)
- [ ] All commits should pass commitlint and relate to a meaningful change

---

## 🗎 Documentation Standards

- [ ] Update `README.md` with new major features or changes in workflow/tooling
- [ ] Keep `CONTRIBUTING.md` up to date with setup, scripts, and conventions
- [ ] Add/refresh badge status for CI, lint, code coverage, as applicable

---

## 🔄 Ongoing Maintenance

- [ ] Regularly update dependencies (use `pnpm outdated`/`pnpm update`)
- [ ] Sync VSCode extensions/settings as workspace evolves
- [ ] Review lint-staged config for coverage as code/types/format tooling expands
- [ ] Pin new required tool versions in `package.json` via Volta
- [ ] Periodically run the DX audit checklist to proactively address workflow friction

---

_Adhering to this checklist will ensure dzb-cv remains a joy to develop and contribute to. Thank you for helping maintain world-class DX!_

