# Data Model - Daily Vocabulary Review App

## Model Overview

The MVP model is local-first and offline-capable. Core study entities are stored in
the local database and are designed to map cleanly to future PostgreSQL tables for
sync.

## Entities

### 1. VocabularyCard

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | Yes | Client-generated stable ID |
| word | string | Yes | Main vocabulary term |
| pronunciation | string | Yes | Pronunciation text |
| meaningVi | string | Yes | Meaning in Vietnamese |
| exampleSentence | string | Yes | Example usage sentence |
| language | enum(`EN`,`ZH`) | Yes | English or Chinese |
| difficulty | enum(`easy`,`medium`,`hard`) | Yes | Learner-facing difficulty filter |
| isFavorite | boolean | Yes | Favorite list membership |
| createdAt | datetime | Yes | Creation timestamp |
| updatedAt | datetime | Yes | Last update timestamp |
| deletedAt | datetime nullable | No | Soft-delete marker for future sync |
| rowVersion | integer | Yes | Version for sync conflict handling |

Validation rules:
- `word`, `pronunciation`, `meaningVi`, `exampleSentence` must be non-empty.
- `language` must be one of `EN` or `ZH`.
- `difficulty` defaults to `medium` when omitted by user.

### 2. Tag

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | Yes | Stable ID |
| name | string | Yes | Display label (e.g., HSK, IELTS, work) |
| normalizedName | string | Yes | Lowercase canonical value |

Validation rules:
- `name` must be non-empty after trimming.
- `normalizedName` must be unique per learner dataset.

### 3. CardTag (Join)

| Field | Type | Required | Notes |
|---|---|---|---|
| cardId | string | Yes | FK -> VocabularyCard.id |
| tagId | string | Yes | FK -> Tag.id |

Validation rules:
- Composite `(cardId, tagId)` must be unique.

### 4. ReviewSchedule

| Field | Type | Required | Notes |
|---|---|---|---|
| cardId | string | Yes | FK -> VocabularyCard.id (1:1) |
| level | integer | Yes | Bounded `0..5` |
| intervalDays | integer | Yes | Positive interval for next review |
| dueDate | date | Yes | Local date when card is due |
| lastReviewedAt | datetime nullable | No | Last review timestamp |

Validation rules:
- `level` must be between `0` and `5`.
- `intervalDays` must be `>= 1`.

### 5. ReviewAttempt

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | Yes | Stable ID |
| cardId | string | Yes | FK -> VocabularyCard.id |
| sessionId | string | Yes | FK -> StudySession.id |
| mode | enum(`flip`,`quiz`,`typing`) | Yes | Study mode used |
| rating | enum(`again`,`hard`,`good`,`easy`) | Yes | Scheduling outcome |
| isCorrect | boolean | Yes | Derived from rating for accuracy metrics |
| typedAnswer | string nullable | No | Captured in typing mode |
| reviewedAt | datetime | Yes | Attempt timestamp |

Validation rules:
- `mode` and `rating` must be valid enum values.
- `typedAnswer` is allowed only when `mode = typing`.

### 6. StudySession

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | Yes | Stable ID |
| startedAt | datetime | Yes | Session start time |
| endedAt | datetime nullable | No | Session end time |
| reviewedCount | integer | Yes | Total answered cards |
| correctCount | integer | Yes | Correct answers in session |
| workloadAtStart | integer | Yes | Due-card count when session began |

Validation rules:
- `reviewedCount` and `correctCount` must be `>= 0`.
- `correctCount` cannot exceed `reviewedCount`.

### 7. DailyStudyRecord

| Field | Type | Required | Notes |
|---|---|---|---|
| studyDate | date | Yes | Local calendar date |
| completedReviewCount | integer | Yes | Count for streak eligibility |

Validation rules:
- One record per local date.
- `completedReviewCount >= 0`.

### 8. SyncOutbox (Future Sync)

| Field | Type | Required | Notes |
|---|---|---|---|
| mutationId | string | Yes | Unique mutation ID |
| entityType | string | Yes | `card`, `schedule`, `attempt`, etc. |
| entityId | string | Yes | Target entity ID |
| operation | enum(`upsert`,`delete`) | Yes | Mutation action |
| baseVersion | integer nullable | No | Client-known row version |
| payload | json | Yes | Mutation payload |
| clientTimestamp | datetime | Yes | Local mutation time |
| syncStatus | enum(`pending`,`acked`,`conflict`) | Yes | Sync lifecycle state |

## Relationships

- `VocabularyCard` 1:1 `ReviewSchedule`
- `VocabularyCard` 1:N `ReviewAttempt`
- `StudySession` 1:N `ReviewAttempt`
- `VocabularyCard` N:M `Tag` via `CardTag`
- `SyncOutbox` references mutable entities by (`entityType`, `entityId`)

## Derived Views

- **DashboardToday**: due cards today, streak, words learned, review accuracy,
  weak words count.
- **MistakeList**: cards with recent incorrect attempts or low accuracy trend.
- **FavoriteList**: cards where `isFavorite = true`.

## State Transitions

### ReviewSchedule Transition (Leitner-lite MVP)

Input rating -> transition:
- `again`: `level = 0`, `intervalDays = 1`
- `hard`: `level = max(0, level - 1)`, `intervalDays = max(1, floor(intervalDays * 1.2))`
- `good`: `level = min(5, level + 1)`, `intervalDays = [1,2,4,7,14,30][level]`
- `easy`: `level = min(5, level + 2)`, `intervalDays = [1,2,4,7,14,30][level]`

Then:
- `dueDate = localToday + intervalDays`
- `lastReviewedAt = now`

### Streak Transition

- If at least one review is completed on local date `D`, create/update
  `DailyStudyRecord(D)`.
- If previous study date is `D-1`, increment streak by 1.
- If no previous study date or gap is `>= 2` days, reset streak to 1.
- Multiple reviews on same date do not increase streak multiple times.
