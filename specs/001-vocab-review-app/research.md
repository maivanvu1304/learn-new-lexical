# Phase 0 Research - Daily Vocabulary Review App

## Decision 1: Frontend stack and module organization

- Decision: Use React + Vite + TypeScript + Tailwind CSS with a feature-first
  structure (`features/cards`, `features/review`, `features/dashboard`,
  `features/import-export`) and small shared UI primitives.
- Rationale: This matches requested technologies, keeps UI simple, and avoids
  large framework-level abstractions.
- Alternatives considered: Layer-first structure (`components/hooks/utils`),
  heavyweight UI kits, large global state frameworks.

## Decision 2: State management strategy

- Decision: Default to local component state and React Context only for
  low-frequency cross-cutting app state (settings, offline/sync status).
- Rationale: The app is single-user and workflow-focused; this reduces runtime
  dependencies and complexity.
- Alternatives considered: Redux Toolkit, Zustand, Jotai for all app state.

## Decision 3: Local persistence mechanism

- Decision: Use IndexedDB as primary local data store for cards, schedules,
  review attempts, and local sync metadata; use localStorage only for small
  UI preferences.
- Rationale: IndexedDB scales for larger card sets and history while remaining
  offline-capable and browser-native.
- Alternatives considered: localStorage-only persistence, heavy client DB
  frameworks.

## Decision 4: Sync-ready architecture for future PostgreSQL backend

- Decision: Adopt local-first outbox architecture:
  - Local database is source of truth for MVP.
  - Domain writes update local tables and append outbox mutations.
  - Future backend uses PostgreSQL and acknowledges mutations via cursor-based
    sync responses.
- Rationale: Enables immediate offline operation and clean path to multi-device
  synchronization later.
- Alternatives considered: server-first CRUD with offline cache, CRDT-based
  syncing, event-sourced architecture.

## Decision 5: Identity, conflict, and merge strategy

- Decision:
  - Use client-generated IDs (UUIDv7/ULID style) for cards and review records.
  - Keep review history append-only.
  - Use optimistic concurrency (`base_version` / `row_version`) for mutable
    card edits in future sync.
  - Auto-merge disjoint field edits and mark same-field collisions for explicit
    conflict handling.
- Rationale: Keeps synchronization deterministic and debuggable while avoiding
  ID remapping complexity.
- Alternatives considered: server-generated IDs, silent last-write-wins for all
  fields, full CRDT conflict resolution.

## Decision 6: MVP spaced repetition algorithm

- Decision: Use deterministic date-based Leitner-lite scheduling:
  - Review results: `again`, `hard`, `good`, `easy`.
  - Bounded level range: `0..5`.
  - Interval ladder: `[1, 2, 4, 7, 14, 30]` days.
  - `dueDate` is computed from local study date plus interval.
- Rationale: Simple to explain, stable for offline behavior, and straightforward
  to test.
- Alternatives considered: full SM-2 ease-factor model, fixed Leitner boxes
  without result gradation, probabilistic scheduling.

## Decision 7: Score and streak calculation rules

- Decision:
  - Increment `attemptCount` on every answer.
  - Increment `correctCount` on `good` and `easy` outcomes.
  - Daily streak increments once per local day with at least one completed
    review; streak resets after gaps of 2+ days.
- Rationale: Rules are deterministic, user-comprehensible, and align with
  requirement for visible daily consistency.
- Alternatives considered: UTC-based streak logic, per-session streak updates,
  streak coupling to completion of full workload.

## Decision 8: Testing approach for critical logic

- Decision:
  - Unit tests for scheduling transitions, score updates, and streak
    calculations with fixed clocks and table-driven cases.
  - Add one integration-style sequence test across multiple days.
  - Maintain high coverage for scheduling/scoring modules per constitution.
- Rationale: Critical memory logic must be reliable and regression-resistant.
- Alternatives considered: UI-only tests for review behavior, ad hoc manual
  validation without deterministic fixtures.

## Decision 9: Portability format and versioning

- Decision: Support JSON and CSV export/import with format version metadata and
  per-row validation reports during import.
- Rationale: Satisfies portability and round-trip constraints while keeping
  user data inspectable.
- Alternatives considered: proprietary binary export, JSON-only without CSV.
