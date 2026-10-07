---
name: automation-testing
description: Test automation for the Space monorepo with Playwright (end-to-end, browser + API) and Vitest (unit). Use when writing, running or debugging automated tests for a ticket, or turning acceptance criteria into automated checks.
---

# Automation Testing

Every acceptance criterion that a user can observe should end up as an
automated test. Manual checks are the exception, and must be justified.

## Choosing the layer

| What is being checked | Layer | Where |
|---|---|---|
| Pure logic (utils, composables, store logic) | Vitest unit | `ui/src/**/<name>.test.ts`, next to the source |
| A user flow through the UI (forms, navigation, dialogs, permissions shown in UI) | Playwright E2E | `e2e/tests/<feature>.spec.ts` |
| An API contract (status codes, role checks, validation errors) | Playwright API test (`request` fixture, no browser) | `e2e/tests/api/<feature>.spec.ts` |

Prefer the lowest layer that proves the criterion. Use E2E for what really
needs the browser and the full stack.

## Playwright setup (`e2e/`)

- Config: `e2e/playwright.config.ts`. It starts `services` (port 4000) and
  `ui` (port 3000) by itself, or reuses them if they are already running.
- Postgres must be running:
  `docker compose -f services/docker-compose.yml up -d --wait`, then
  `pnpm --filter @space/services exec prisma migrate deploy`.
- Fixtures: `e2e/fixtures/index.ts`. Always import `test`/`expect` from
  `../fixtures`, not from `@playwright/test`.
  - `user`: a fresh user registered through the API (unique email).
  - `authedPage`: a page already logged in as `user` (tokens put into
    localStorage before the page loads).
  - `createUser(request)`: for extra users, e.g. a second member to test
    OWNER/EDITOR/VIEWER roles.
  - `API_URL`: base URL for API tests.
- Commands:
  - `pnpm test:e2e`: the whole suite (headless)
  - `pnpm --filter @space/e2e exec playwright test tests/<file>.spec.ts`: one file
  - `pnpm --filter @space/e2e exec playwright test -g "<title>"`: one test
  - `pnpm test:e2e:ui`: interactive UI mode (for humans, not agents)
  - After a failure: read `e2e/test-results/<test>/error-context.md` (the
    page's accessibility snapshot) and the screenshot. Traces are in
    `trace.zip` (`playwright show-trace`).

## Writing stable tests

- **Locators**, in order of preference: `getByRole` (with `name`) →
  `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId`. Never use
  CSS classes. Vuetify and Tailwind classes change often.
- If an element has no accessible name, report it as an issue (an
  accessibility gap). Don't work around it with CSS selectors. Ask the
  developer to add a label or a `data-testid`.
- Use web-first assertions (`await expect(locator).toBeVisible()`,
  `toHaveURL`, `toHaveText`), which retry automatically. Never use
  `waitForTimeout`.
- Scope to containers: `page.getByRole('dialog').getByRole('button', …)`.
- Isolation: each test creates its own data (unique names using
  `Date.now()`). Never depend on seed data, test order, or another test's
  data. Tests run in parallel.
- Set up preconditions through the API (fixtures, `request.post`), and only
  click through the UI for the behaviour under test.
- Real-time features: open two browser contexts
  (`browser.newContext()`), act in one, and assert in the other.
- One behaviour per test. The test title states the expected behaviour.

## Flakiness

- A test that passes on retry is flaky, not passing. Rerun the failing test
  3× (`--repeat-each=3`) before reporting. If it fails intermittently, report
  it as flaky and attach the trace/error context.
- First-run hiccups (Vite optimising dependencies, Nest compiling): rerun
  once before treating a failure as a bug.

## Definition of done for automation

- Every acceptance criterion maps to a named test (or is marked
  `NOT VERIFIED` with the reason).
- New and existing E2E + unit suites pass.
- `pnpm exec eslint e2e` and `pnpm --filter @space/e2e exec tsc -p tsconfig.json` pass.
