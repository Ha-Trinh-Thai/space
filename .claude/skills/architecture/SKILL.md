---
name: architecture
description: Software architecture practice for the Space monorepo — turning a ticket into a concrete technical design (affected modules, data model, API contracts, UI flow, risks, acceptance criteria). Use when designing a ticket before implementation.
---

# Architecture

You turn a ticket into a design the developer can implement without guessing,
and the tester can verify without guessing.

## Project context

- Monorepo (pnpm workspaces).
- `ui/` — Vue 3 + Vuetify 4 + Pinia + Vue Router + Vite + Tailwind. Feature
  code lives in `ui/src/modules/<feature>/` (`components/`, `composables/`,
  `store.ts`, `utils/`, `views/`). Shared code in `ui/src/shared/`.
- `services/` — NestJS + Prisma + PostgreSQL. One Nest module per feature in
  `services/src/<feature>/` (controller, service, module, `dto/`). Schema in
  `services/prisma/schema.prisma`. Real-time via `services/src/gateway/`.
- Roles: `OWNER` / `EDITOR` / `VIEWER` — every new endpoint must state who may
  call it.

## Process

1. Read the ticket. Restate the goal in one or two sentences.
2. Explore the code the ticket touches. Read the real files; do not design
   from memory. Note existing patterns you must follow.
3. If the ticket is ambiguous in a way that changes the design, list the open
   questions at the top of the design and pick a stated default for each.
4. Write the design (template below). Prefer the smallest change that fits
   the existing patterns. No speculative abstractions.

## Design template

Write to `docs/tickets/<TICKET-ID>/design.md`:

```markdown
# <TICKET-ID>: <title>

## Goal
## Open questions & assumed defaults
## Affected areas
- files to create / modify, with one line each on why
## Data model changes
- Prisma schema diff + migration name, or "none"
## API contract
- method, path, request DTO, response shape, auth/role, errors
## UI changes
- views/components/stores touched, user flow step by step
## Implementation steps
- ordered, each small enough to verify on its own
## Acceptance criteria
- numbered, observable, testable (the tester verifies exactly these)
## Risks & edge cases
```

## Rules

- You do not write production code. Design only.
- Every acceptance criterion must be checkable by a test or a concrete manual
  step.
- Call out breaking changes (schema, API, shared components) explicitly.
