# Quickstart - Daily Vocabulary Review App

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16+ (only required when enabling backend sync work)

## 1. Install dependencies

```bash
npm install
```

## 2. Run frontend in development mode

```bash
npm run dev
```

Open the local app URL shown by Vite.

## 3. Validate core MVP flow (offline-first)

1. Create at least 6 cards: mixed English and Chinese, with tags.
2. Start today's review from dashboard.
3. Submit mixed ratings (`again`, `hard`, `good`, `easy`).
4. Confirm:
   - Today's due workload decreases.
   - Next due dates are recalculated.
   - Streak updates once for the local day.
5. Switch browser to offline mode and repeat a review session.
6. Reload app while still offline and verify data persists.

## 4. Validate filtering and focused lists

1. Filter cards by language, tag, and difficulty.
2. Mark cards as favorites and verify favorites list.
3. Intentionally answer some cards incorrectly and verify mistake list.

## 5. Validate import/export portability

1. Export data as JSON.
2. Clear local data (or use a fresh browser profile).
3. Import exported file.
4. Verify cards, schedules, and progress are restored.
5. Repeat with CSV where supported by the export pipeline.

## 6. Run verification suites

```bash
npm run test --workspace frontend -- tests/unit/core-logic.spec.ts
npm run test --workspace backend -- tests/contract/review.contract.spec.ts
npm run test --workspace backend -- tests/contract/cards.contract.spec.ts
npm run test --workspace backend -- tests/contract/progress-portability.contract.spec.ts
npm run test --workspace backend -- tests/contract/openapi-consistency.spec.ts
npm exec --workspace frontend vitest run tests/integration/performance-smoke.spec.ts
npm run lint
```

Required test focus:
- Scheduling transitions (`again`, `hard`, `good`, `easy`)
- Score counters and accuracy
- Streak calculation across local-day boundaries

## 7. Accessibility checks

1. Navigate review flow using keyboard only.
2. Verify focus visibility on interactive controls.
3. Run screen-reader smoke check on dashboard and review views.
4. Verify usability at 200% zoom.

## 8. Optional backend sync validation (future-ready)

When backend sync endpoints are implemented:

```bash
npm run dev:api
```

Then verify:
- Local mutations are queued while offline.
- Sync pushes queued mutations when online.
- Conflict responses are surfaced and handled deterministically.
