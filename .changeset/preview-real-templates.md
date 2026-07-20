---
"@dzb-cv/templates": minor
"@dzb-cv/web": minor
---

feat: wire real templates into the web preview and make export honest

- `@dzb-cv/templates` now exports `ModernTemplate` from the package index
  (previously unreachable — only `BasicTemplate` was exported)
- Preview page renders the actually-selected template (Basic via
  marked-rendered Markdown, Modern via React SSR) with template styles
- "Download PDF" replaced with an honest pair: "Print / Save as PDF"
  (browser print dialog) and "Download HTML"
- Preview iframe sandboxed (`allow-same-origin allow-modals`, no scripts);
  `escapeHTML` escapes single quotes
- Editor labels associated with inputs via htmlFor/id for all repeated rows
- Playwright config and teardown fixed for ESM (`__dirname` crash); chromium
  `executablePath` overridable via `PLAYWRIGHT_CHROMIUM_PATH` for sandboxed
  environments
