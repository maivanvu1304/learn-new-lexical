# Tasks: Daily Vocabulary Review App

**Input**: Design documents from `/specs/001-vocab-review-app/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are required for this feature. The spec explicitly requests unit
tests for scheduling, score updates, and streak calculation, and each user story
includes integration-level validation.

**Organization**: Tasks are grouped by user story so each story can be delivered and
validated independently.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different files, no blocking dependency)
- **[Story]**: Required in user-story phases only (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize repository structure and baseline tooling.

- [X] T001 Create frontend Vite React TypeScript scaffold in `frontend/package.json` and `frontend/src/main.tsx`
- [X] T002 Create backend sync-ready service scaffold in `backend/package.json` and `backend/src/api/index.ts`
- [X] T003 [P] Configure Tailwind CSS baseline in `frontend/tailwind.config.ts` and `frontend/src/styles/index.css`
- [X] T004 [P] Configure frontend TypeScript project settings in `frontend/tsconfig.json`
- [X] T005 [P] Configure Vitest and test bootstrap in `frontend/vitest.config.ts` and `frontend/tests/setup.ts`
- [X] T006 [P] Add root workspace scripts for dev/test/lint in `package.json`
- [X] T007 [P] Create feature-first source skeleton entry files in `frontend/src/features/review/ReviewScreen.tsx` and `frontend/src/features/cards/CardListPage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain and persistence layers required by all stories.

**CRITICAL**: Complete this phase before starting user story phases.

- [X] T008 Define shared domain types in `frontend/src/types/domain.ts`
- [X] T009 Implement IndexedDB schema and migration bootstrap in `frontend/src/lib/storage/db.ts`
- [X] T010 [P] Implement card and tag repository layer in `frontend/src/lib/storage/cardRepository.ts`
- [X] T011 [P] Implement review session repository layer in `frontend/src/lib/storage/reviewRepository.ts`
- [X] T012 Implement outbox mutation queue for future sync in `frontend/src/lib/sync/outboxRepository.ts`
- [X] T013 Implement deterministic Leitner-lite scheduler in `frontend/src/lib/scheduling/leitnerScheduler.ts`
- [X] T014 Implement score update calculator in `frontend/src/lib/scoring/scoreCalculator.ts`
- [X] T015 Implement local-date streak calculator in `frontend/src/lib/streak/streakCalculator.ts`
- [X] T016 Define import/export format version validator in `frontend/src/lib/storage/portabilitySchema.ts`
- [X] T017 Create sync endpoint route stub for future backend integration in `backend/src/api/syncRoutes.ts`
- [X] T018 Implement accessibility utility primitives in `frontend/src/components/ui/a11y.ts`
- [X] T019 Add foundational logic unit tests for scheduler/scoring/streak in `frontend/tests/unit/core-logic.spec.ts`
- [X] T020 Enforce scheduling/scoring/streak coverage threshold in `frontend/package.json`

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Complete Daily Review Session (Priority: P1) MVP

**Goal**: Deliver end-to-end daily review flow with offline-safe schedule updates.

**Independent Test**: Create due cards, start review from workload card, complete review,
and verify due workload decreases and schedule updates persist offline.

### Tests for User Story 1

- [X] T021 [P] [US1] Add contract tests for `POST /reviews/sessions` and `POST /reviews/sessions/{sessionId}/answers` in `backend/tests/contract/review.contract.spec.ts`
- [X] T022 [P] [US1] Add unit tests for due-card selection and schedule transitions in `frontend/tests/unit/review-session.spec.ts`
- [X] T023 [US1] Add integration test for offline daily review completion in `frontend/tests/integration/us1-daily-review.spec.ts`

### Implementation for User Story 1

- [X] T024 [US1] Implement review orchestration service in `frontend/src/features/review/reviewService.ts`
- [X] T025 [P] [US1] Build review UI for flip/quiz/typing flow in `frontend/src/features/review/ReviewScreen.tsx`
- [X] T026 [US1] Implement review state hook with persistence writes in `frontend/src/features/review/useReviewSession.ts`
- [X] T027 [US1] Implement offline-safe review mutation queue bridge in `frontend/src/features/review/offlineReviewSync.ts`
- [X] T028 [US1] Build today's workload dashboard card and start-review action in `frontend/src/features/dashboard/DueWorkloadCard.tsx`
- [X] T029 [US1] Wire review route and navigation entry in `frontend/src/app/routes.tsx`
- [X] T030 [US1] Add keyboard and screen-reader accessibility test for review flow in `frontend/tests/accessibility/us1-review-a11y.spec.ts`

**Checkpoint**: US1 is independently usable and testable.

---

## Phase 4: User Story 2 - Manage and Organize Vocabulary (Priority: P2)

**Goal**: Deliver card CRUD and filtering by language/tag/difficulty.

**Independent Test**: Create and edit cards in both languages, then filter cards and
verify only matching cards appear.

### Tests for User Story 2

- [X] T031 [P] [US2] Add contract tests for `/cards` CRUD and filter queries in `backend/tests/contract/cards.contract.spec.ts`
- [X] T032 [P] [US2] Add unit tests for card validation and filter logic in `frontend/tests/unit/card-management.spec.ts`
- [X] T033 [US2] Add integration test for create/edit/filter workflow in `frontend/tests/integration/us2-card-management.spec.ts`

### Implementation for User Story 2

- [X] T034 [US2] Implement card service for create/update/delete/filter in `frontend/src/features/cards/cardService.ts`
- [X] T035 [P] [US2] Build card create/edit form UI in `frontend/src/features/cards/CardForm.tsx`
- [X] T036 [P] [US2] Build card listing and filter panel UI in `frontend/src/features/cards/CardListPage.tsx`
- [X] T037 [US2] Implement tag normalization and card-tag mapping in `frontend/src/features/cards/tagService.ts`
- [X] T038 [US2] Wire cards routes and menu navigation in `frontend/src/app/routes.tsx`
- [X] T039 [US2] Add accessibility test for card form and filters in `frontend/tests/accessibility/us2-cards-a11y.spec.ts`

**Checkpoint**: US2 is independently usable and testable.

---

## Phase 5: User Story 3 - Track Progress and Focus on Weak Words (Priority: P3)

**Goal**: Deliver dashboard metrics, favorites/mistakes focus lists, and import/export.

**Independent Test**: Complete mixed review sessions across multiple days, verify
dashboard metrics and focus lists, export data, re-import, and verify round-trip state.

### Tests for User Story 3

- [X] T040 [P] [US3] Add contract tests for `/dashboard/today`, `/lists/favorites`, `/lists/mistakes`, `/import`, and `/export` in `backend/tests/contract/progress-portability.contract.spec.ts`
- [X] T041 [P] [US3] Add unit tests for progress and weak-word aggregation in `frontend/tests/unit/progress-metrics.spec.ts`
- [X] T042 [US3] Add integration test for progress lists and import/export round-trip in `frontend/tests/integration/us3-progress-portability.spec.ts`

### Implementation for User Story 3

- [X] T043 [US3] Implement dashboard progress aggregation service in `frontend/src/features/dashboard/progressService.ts`
- [X] T044 [P] [US3] Build dashboard progress widgets in `frontend/src/features/dashboard/ProgressWidgets.tsx`
- [X] T045 [P] [US3] Implement favorites and mistakes focus list page in `frontend/src/features/dashboard/FocusListsPage.tsx`
- [X] T046 [US3] Implement import workflow with row-level validation reporting in `frontend/src/features/import-export/importService.ts`
- [X] T047 [US3] Implement JSON/CSV export workflow with format versioning in `frontend/src/features/import-export/exportService.ts`
- [X] T048 [US3] Build import/export control panel UI in `frontend/src/features/import-export/ImportExportPanel.tsx`
- [X] T049 [US3] Add accessibility and zoom validation test for dashboard/import-export in `frontend/tests/accessibility/us3-dashboard-a11y.spec.ts`

**Checkpoint**: US3 is independently usable and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks and cross-story refinements.

- [X] T050 [P] Update feature verification steps with final commands in `specs/001-vocab-review-app/quickstart.md`
- [X] T051 Run dependency audit and remove unused packages in `frontend/package.json` and `backend/package.json`
- [X] T052 [P] Add contract/schema consistency check for sync and import/export in `backend/tests/contract/openapi-consistency.spec.ts`
- [X] T053 Run full test suite and lint workflow commands in `package.json`
- [X] T054 [P] Add performance smoke test for due-count calculation at 10k cards in `frontend/tests/integration/performance-smoke.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion; blocks all stories.
- **Phase 3 (US1)**: Starts after Phase 2.
- **Phase 4 (US2)**: Starts after Phase 2; can run in parallel with US1 once shared files are coordinated.
- **Phase 5 (US3)**: Starts after Phase 2; depends on foundational metrics/persistence but not on full US2 completion.
- **Phase 6 (Polish)**: Runs after selected story phases are complete.

### User Story Dependency Graph

- `US1 (P1)` -> recommended MVP slice.
- `US2 (P2)` -> independent from US1 core review engine except shared routing file.
- `US3 (P3)` -> depends on foundational review-attempt persistence but can proceed without US2 completion.
- Recommended completion order: `US1 -> US2 -> US3`.

### Parallel Opportunities

- Setup: `T003`, `T004`, `T005`, `T006`, `T007` can run in parallel.
- Foundational: `T010` and `T011` can run in parallel after `T009`.
- US1: `T021` and `T022` can run in parallel; `T025` can run in parallel with `T024`.
- US2: `T031` and `T032` can run in parallel; `T035` and `T036` can run in parallel.
- US3: `T040` and `T041` can run in parallel; `T044` and `T045` can run in parallel.
- Polish: `T050`, `T052`, and `T054` can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Run in parallel:
Task T021 -> backend/tests/contract/review.contract.spec.ts
Task T022 -> frontend/tests/unit/review-session.spec.ts

# Then after service is started:
Task T025 -> frontend/src/features/review/ReviewScreen.tsx
Task T028 -> frontend/src/features/dashboard/DueWorkloadCard.tsx
```

## Parallel Example: User Story 2

```bash
# Run in parallel:
Task T031 -> backend/tests/contract/cards.contract.spec.ts
Task T032 -> frontend/tests/unit/card-management.spec.ts

# Then UI split in parallel:
Task T035 -> frontend/src/features/cards/CardForm.tsx
Task T036 -> frontend/src/features/cards/CardListPage.tsx
```

## Parallel Example: User Story 3

```bash
# Run in parallel:
Task T040 -> backend/tests/contract/progress-portability.contract.spec.ts
Task T041 -> frontend/tests/unit/progress-metrics.spec.ts

# Then UI/services split in parallel:
Task T044 -> frontend/src/features/dashboard/ProgressWidgets.tsx
Task T045 -> frontend/src/features/dashboard/FocusListsPage.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independent test criteria.
4. Demo/deploy MVP for daily review loop.

### Incremental Delivery

1. Deliver US1 for immediate learning value.
2. Add US2 for card management and filtering workflows.
3. Add US3 for progress visibility and portability.
4. Run Phase 6 polish before release.

### Format Validation

- All tasks use required checklist format: `- [ ] T### [P?] [US?] Description with file path`.
- Story labels are present on all user-story tasks and absent from setup/foundational/polish tasks.
- Every task includes at least one explicit file path.





