# Documentation Rules

## Goal

Keep docs actionable, current, and specific to this codebase.

## Authoring Rules

1. Write docs in Markdown and store them in `docs/`.
2. Prefer small focused files over one large catch-all document.
3. Start each doc with:
   - Purpose
   - Scope
   - Last updated date (`YYYY-MM-DD`)
4. Use concrete references to code paths (for example: `app/page.tsx`, `lib/types.ts`).
5. Record decisions and tradeoffs, not just final outcomes.
6. For behavior changes, include:
   - What changed
   - Why it changed
   - Any migration or compatibility impact
7. For API docs, include request/response shapes and failure behavior.
8. Do not include secrets, API keys, or private tokens.
9. When a doc becomes outdated, update it in the same PR as related code.
10. If assumptions are unknown, mark them explicitly with `Assumption:` and track follow-up items.

## Naming Conventions

- Use kebab-case file names.
- Prefix decision records with `adr-` (for example: `adr-001-local-generator-first.md`).
- Prefix runbooks with `runbook-`.
- Prefix integration docs with `integration-`.

## Minimum Checklist Before Merge

- The doc reflects current behavior.
- All code references are valid.
- Any operational steps were tested at least once.
- Dates are updated.
