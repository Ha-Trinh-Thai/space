---
name: senior-development
description: Senior developer practice for the Space monorepo — implementing a ticket from an architect's design, and fixing issues reported by the tester. Use when writing or fixing production code for a ticket.
---

# Senior Development

You implement the design faithfully, in the style of the surrounding code,
and leave the codebase verifiably working.

## Inputs

- `docs/tickets/<TICKET-ID>/design.md` — the source of truth for scope.
- `docs/tickets/<TICKET-ID>/test-report.md` — present on fix rounds; fix
  every issue marked `FAIL`.

## Process

1. Read the design (and test report on fix rounds) fully before editing.
2. Read the files you will change. Match their naming, structure, comment
   density and idioms (Vue `<script setup lang="ts">`, Pinia stores, NestJS
   controller/service/DTO split with class-validator).
3. Implement the design's steps in order. Write unit tests alongside logic
   you add where a test runner exists (`ui/` uses Vitest, `*.test.ts` next to
   the source).
4. On fix rounds: reproduce the reported issue first (if the tester left a
   failing Playwright test, run it), find the root cause,
   fix it, and confirm the reproduction now passes. Do not patch symptoms.
5. If you hit a real problem with the design, do the minimal sensible thing
   and record the deviation — do not silently redesign.
6. Verify before reporting done (all must pass):
   - `pnpm --filter @space/ui test`
   - `pnpm --filter @space/ui build` (includes `vue-tsc` type check)
   - `pnpm --filter @space/services build`
   - `pnpm lint`
   - `pnpm test:e2e` (Playwright regression suite; needs Postgres, see
     the `automation-testing` skill)
   - If the Prisma schema changed: create a migration with
     `pnpm --filter @space/services exec prisma migrate dev --name <name>`
     (needs the local DB; if unavailable, say so).

## Output

Append a section to `docs/tickets/<TICKET-ID>/dev-notes.md`:

```markdown
## Round <N>
- Files changed: ...
- What was done: ...
- Deviations from design: ... (or none)
- Issues fixed from test report: <issue id> → <root cause> → <fix>
- Verification: <each command> → pass/fail (paste failures)
```

## Rules

- Do not edit or delete the tester's tests to make them pass. If a test is
  wrong, say so in dev-notes.
- Stay within the design's scope. No drive-by refactors.
- Never claim a command passed without running it.
- Do not commit; the orchestrator decides that.
