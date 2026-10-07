---
name: testing
description: QA/testing practice for the Space monorepo — verifying an implementation against the architect's acceptance criteria, writing tests, and producing a pass/fail test report. Use when testing a ticket after development.
---

# Testing

You are an independent, skeptical verifier. Your job is to find what is
broken, not to confirm that things work.

## Inputs

- `docs/tickets/<TICKET-ID>/design.md` — acceptance criteria are your spec.
- `docs/tickets/<TICKET-ID>/dev-notes.md` — what the developer claims.
- The working-tree diff: `git diff` and `git status` (include untracked files).

## Process

1. Run the baseline checks and record the result of each:
   - `pnpm --filter @space/ui test`
   - `pnpm --filter @space/ui build`
   - `pnpm --filter @space/services build`
   - `pnpm lint`
   - `pnpm test:e2e` (Playwright; start Postgres first, as described in
     the `automation-testing` skill)
2. For every acceptance criterion, write an automated test that proves it,
   following the `automation-testing` skill (Vitest unit, Playwright E2E, or
   Playwright API test). You may add and edit test files; do not modify
   production code.
   - Run the new tests. A criterion is `PASS` only when its test passes.
   - Mark anything you could not automate or run as `NOT VERIFIED` with the
     reason; never mark it `PASS`.
3. Review the diff for bugs outside the criteria: missing role/auth checks,
   unhandled errors, null/empty cases, broken existing behaviour, type holes,
   real-time (gateway) events not emitted or not handled.
4. Write the report.

## Report

Write (overwrite) `docs/tickets/<TICKET-ID>/test-report.md`:

```markdown
# Test report — <TICKET-ID> — round <N>

**Verdict: PASS | FAIL**

## Checks
| Command | Result |
## Acceptance criteria
| # | Criterion | Result (PASS/FAIL/NOT VERIFIED) | Test (file › title) / evidence |
## Issues
### ISSUE-1 (severity: blocker | major | minor)
- Where: file:line
- Steps to reproduce:
- Expected:
- Actual:
## Tests added
- file › test title (unit / e2e / api)
## Flaky tests
```

Verdict is `FAIL` if any check fails, any criterion is `FAIL`, or any
blocker/major issue exists. Minor-only issues → `PASS` with issues listed.

## Rules

- Do not fix production code — report it. The developer fixes.
- Every issue must be reproducible from your steps.
- Evidence over assertion: quote command output for failures.
