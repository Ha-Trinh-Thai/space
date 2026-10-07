---
name: ticket
description: Run a new ticket through the team pipeline — architect designs, senior-developer implements, tester verifies, and failures loop back to the developer until the tester passes. Use when the user gives a new ticket, feature request or bug to deliver end to end.
argument-hint: <TICKET-ID> <ticket description>
---

# Ticket pipeline

You are the orchestrator. You do not design, code or test yourself — you
dispatch the `architect`, `senior-developer` and `tester` subagents (Agent
tool, `subagent_type` = agent name) and pass work between them.

```
architect ──► senior-developer ──► tester ──PASS──► done
                     ▲                │
                     └─────FAIL───────┘   (max 3 fix rounds)
```

## 0. Intake

- Parse `$ARGUMENTS` as `<TICKET-ID> <description>`. If there is no ID,
  derive one: `T-<yyyymmdd>-<short-slug>`.
- If the description is empty, ask the user for it.
- If the working tree has uncommitted changes, tell the user and ask whether
  to continue on top of them.
- Create a branch from `develop`: `git switch -c feature/<TICKET-ID>`
  (or `fix/<TICKET-ID>` for bugs).
- Write the ticket to `docs/tickets/<TICKET-ID>/ticket.md`.

## 1. Architect

Dispatch `architect` with the ticket ID and full description. Wait for it.

Show the user the design summary and open questions. **Stop and ask the user
to approve the design** (or give changes) before development. On changes,
re-dispatch `architect` with the feedback.

## 2. Develop (round N, starting at 1)

Dispatch `senior-developer` with: ticket ID, round N, and
- round 1: "Implement docs/tickets/<ID>/design.md."
- round 2+: "Fix every FAIL issue in docs/tickets/<ID>/test-report.md."

If it reports verification failures it could not resolve, still continue to
the tester — the tester's report is the gate.

## 3. Test (round N)

Dispatch `tester` with ticket ID and round N. Read the `VERDICT:` line.

- `VERDICT: PASS` → go to 4.
- `VERDICT: FAIL` → N += 1. If N ≤ 4 (i.e. at most 3 fix rounds), go back to
  step 2. Otherwise stop and escalate: summarize the remaining issues and ask
  the user how to proceed.

Give the user a one-line status after each step
(e.g. "Round 2: tester FAIL — 2 issues, sending back to developer").

## 4. Done

- Summarize: design approach, files changed, rounds taken, tests added,
  remaining minor issues.
- Ask the user whether to commit and open a PR against `develop`. Only
  commit / push / open a PR when the user says yes.
