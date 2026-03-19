# Implementation Plan: Daily Vocabulary Review App

**Branch**: `001-vocab-review-app` | **Date**: 2026-03-18 | **Spec**: [spec.md](D:/Project-v1/my-project/specs/001-vocab-review-app/spec.md)
**Input**: Feature specification from `/specs/001-vocab-review-app/spec.md`

## Summary

Build an offline-friendly vocabulary learning web app for English/Chinese card review
with deterministic spaced repetition, multiple study modes, progress tracking, and
portable import/export. The architecture is local-first (IndexedDB source of truth)
with a sync-ready backend contract for future PostgreSQL-backed multi-device sync.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 18, Vite 5, Tailwind CSS, React Router, Vitest  
**Storage**: IndexedDB (local source of truth) + PostgreSQL 16 (future sync backend for vocabulary and review history)  
**Testing**: Vitest (unit), React Testing Library (UI behavior), contract checks for sync/import/export payloads  
**Target Platform**: Modern desktop and mobile web browsers  
**Project Type**: Offline-first web application with future sync API  
**Performance Goals**: App start <2s on warm device; review action feedback <100ms p95 offline; dashboard due-count calculation <1s for 10k cards  
**Constraints**: Keep dependencies minimal, preserve one-primary-action study screens, support keyboard/screen-reader usage, deterministic review scheduling and streak logic, add sync without rewriting local data model  
**Scale/Scope**: Single-user daily study, 1-10k cards per learner profile, English/Chinese card content with Vietnamese meanings

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate Review

- **Simplicity Gate**: PASS. Dashboard and study flows are scoped to one primary action
  per screen (`Start Review`, `Submit Result`, `Next Card`).
- **Offline-First Gate**: PASS. Core review, scheduling, and progress are local-first in
  IndexedDB; future sync is additive and non-blocking.
- **Scheduling/Scoring Test Gate**: PASS. Plan includes dedicated unit test modules for
  review scheduling, score updates, and streak computation with deterministic clocks.
- **Accessibility Gate**: PASS. Keyboard navigation, semantic controls, visible focus,
  and screen-reader labels are mandatory acceptance criteria.
- **Portability Gate**: PASS. JSON/CSV import-export contract includes round-trip,
  validation feedback, and version metadata.
- **Dependency Gate**: PASS. Stack is limited to requested tech plus essential testing
  tools; no heavy state or offline frameworks added.

### Post-Design Gate Review

- **Simplicity Gate**: PASS. Data model and API contracts separate core review flow from
  advanced operations (import/export, sync) to avoid UI clutter.
- **Offline-First Gate**: PASS. Entity model uses local IDs and outbox-ready sync fields;
  contracts keep offline sessions independent of network status.
- **Scheduling/Scoring Test Gate**: PASS. `research.md` defines deterministic Leitner-lite
  rules and test cases for schedule, scoring, and streak boundaries.
- **Accessibility Gate**: PASS. `quickstart.md` includes keyboard and contrast validation
  steps for review flows.
- **Portability Gate**: PASS. Contract and quickstart include versioned import/export and
  round-trip validation procedure.
- **Dependency Gate**: PASS. Chosen architecture uses platform primitives and minimal libs;
  alternatives requiring heavier dependencies were rejected.

## Project Structure

### Documentation (this feature)

```text
specs/001-vocab-review-app/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
frontend/
|-- src/
|   |-- app/
|   |-- components/ui/
|   |-- features/
|   |   |-- cards/
|   |   |-- review/
|   |   |-- dashboard/
|   |   `-- import-export/
|   |-- lib/
|   |   |-- storage/
|   |   |-- scheduling/
|   |   |-- scoring/
|   |   |-- streak/
|   |   `-- sync/
|   `-- types/
`-- tests/
    |-- unit/
    |-- integration/
    `-- accessibility/

backend/
|-- src/
|   |-- api/
|   |-- db/
|   |-- services/
|   `-- sync/
`-- tests/
    |-- contract/
    `-- integration/
```

**Structure Decision**: Use web application structure with separate `frontend` and
`backend` boundaries. The frontend fully supports offline study via local persistence;
backend is introduced as a sync-ready surface for future PostgreSQL persistence without
blocking MVP delivery.

## Complexity Tracking

No constitutional violations require justification at plan time.
