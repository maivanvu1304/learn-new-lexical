# Feature Specification: Daily Vocabulary Review App

**Feature Branch**: `001-vocab-review-app`  
**Created**: 2026-03-18  
**Status**: Draft  
**Input**: User description: "Build a language learning app for reviewing English
and Chinese vocabulary with daily review, spaced repetition, multiple study modes,
progress tracking, and import/export."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Daily Review Session (Priority: P1)

As an individual learner, I want to open the app and complete today's due reviews
quickly so I can build a consistent daily study habit.

**Why this priority**: The core product value is daily consistency through fast,
focused review.

**Independent Test**: Create due cards for one learner, start a review session from
today's workload, complete all prompts, and verify the workload is updated and each
card receives a new due schedule.

**Acceptance Scenarios**:

1. **Given** the learner has cards due today, **When** the learner starts review from
   the dashboard, **Then** the app presents cards in a review flow and records each
   result.
2. **Given** the learner completes today's due reviews, **When** the session ends,
   **Then** the app updates the card schedules and shows reduced or zero remaining
   workload for today.
3. **Given** the learner is offline, **When** the learner completes a review session,
   **Then** progress and updated schedules are saved locally without blocking study.

---

### User Story 2 - Manage and Organize Vocabulary (Priority: P2)

As an individual learner, I want to create and edit vocabulary cards and filter them
by language, tag, and difficulty so I can study relevant words for my goals.

**Why this priority**: Learners must control and organize their own content before
review can stay useful over time.

**Independent Test**: Add cards in both English and Chinese with tags, edit existing
cards, then apply filters and verify only matching cards appear in study and list
views.

**Acceptance Scenarios**:

1. **Given** the learner creates a card, **When** required fields are provided, **Then**
   the card is saved with language and optional tags.
2. **Given** a saved card, **When** the learner edits pronunciation, meaning, example,
   tags, or language, **Then** the updated card is available for future study.
3. **Given** a mixed vocabulary set, **When** the learner filters by language, tag, and
   difficulty, **Then** only cards matching all selected filters are shown.

---

### User Story 3 - Track Progress and Focus on Weak Words (Priority: P3)

As an individual learner, I want to see streak, learning progress, accuracy, weak
words, favorites, and mistakes so I can stay motivated and target what I forget.

**Why this priority**: Visible progress and targeted practice improve retention and
long-term consistency.

**Independent Test**: Run multiple review sessions with mixed correct/incorrect
results, mark favorites, generate mistakes, and confirm dashboard and lists reflect
the expected metrics and card groups.

**Acceptance Scenarios**:

1. **Given** the learner completes reviews over multiple days, **When** the learner
   opens the dashboard, **Then** the app shows current streak, words learned,
   review accuracy, weak words count, and today's due workload.
2. **Given** the learner marks favorites and makes mistakes during review, **When** the
   learner opens favorites or mistake lists, **Then** the corresponding cards are
   available for focused practice.
3. **Given** the learner exports vocabulary data and later imports it, **When** import
   completes, **Then** cards, tags, progress, and review history are restored without
   silent data loss.

### Edge Cases

- Duplicate word text exists in both English and Chinese; language value must prevent
  collisions and ambiguity.
- Learner imports a file containing invalid rows (missing required fields, invalid
  language value, malformed data); valid rows must still import and invalid rows must
  be reported.
- Learner changes a card immediately before it becomes due; scheduling and edits must
  remain consistent.
- Learner reviews around local day boundaries; streak calculations must use the
  learner's local date consistently.
- Learner has zero cards due today; dashboard and review entry must clearly show no
  pending workload.
- Typing practice for Chinese or accented text may include alternate valid input forms;
  scoring rules must handle accepted equivalents consistently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow learners to create, edit, and delete vocabulary
  cards manually.
- **FR-002**: Each vocabulary card MUST include word, pronunciation, Vietnamese meaning,
  example sentence, and language; tags MUST be optional.
- **FR-003**: The language field MUST support exactly two values: English and Chinese.
- **FR-004**: The system MUST support flashcard review for cards due today.
- **FR-005**: The system MUST support spaced repetition scheduling and update next
  review timing after each review result.
- **FR-006**: The system MUST provide three study modes: flip cards, multiple-choice
  quiz, and typing practice.
- **FR-007**: Learners MUST be able to filter study content by language, tag, and
  difficulty.
- **FR-008**: The system MUST provide a favorites list and allow learners to add or
  remove cards from it.
- **FR-009**: The system MUST maintain a mistake list based on incorrect review results
  and allow targeted review from that list.
- **FR-010**: The system MUST track and display daily streak based on days with at least
  one completed review action.
- **FR-011**: The system MUST track and display words learned, review accuracy, and weak
  words.
- **FR-012**: The system MUST provide a dashboard that shows today's review workload
  before a session starts.
- **FR-013**: The system MUST support vocabulary data import with validation feedback for
  invalid entries.
- **FR-014**: The system MUST support vocabulary data export including cards, tags,
  favorites, mistakes, and review progress.
- **FR-015**: Imported exported data MUST be round-trip compatible so exported learner
  data can be imported back with equivalent study state.
- **FR-016**: Core study functions (view due workload, run review, save outcomes) MUST
  work without network access.
- **FR-017**: The system MUST preserve learner data and progress between sessions.

### Constitution Alignment Requirements *(mandatory)*

- **CR-001 (Simplicity)**: Study and dashboard flows MUST present one primary action at
  a time so learners can start and complete daily review with minimal friction.
- **CR-002 (Offline-First)**: Daily review, scheduling updates, and progress tracking
  MUST remain available offline and persist locally.
- **CR-003 (Scheduling/Scoring Tests)**: Any scheduling or scoring rule change MUST
  include automated unit and regression tests with explicit coverage reporting.
- **CR-004 (Accessibility)**: Daily study flows MUST support keyboard-only navigation,
  screen-reader-friendly labels, readable contrast, and usable zoomed layouts.
- **CR-005 (Data Portability)**: Import/export workflows MUST support complete learner
  round-trip of vocabulary and progress with clear conflict handling.
- **CR-006 (Dependencies)**: No new runtime dependencies are required by this feature
  scope; any future additions MUST include documented justification and alternatives.

### Assumptions

- The app serves individual learners with a single personal dataset per device/profile.
- Day-based metrics (streak and daily workload) are calculated using the learner's
  local date.
- "Words learned" is measured as cards that have reached a stable remembered state as
  defined by the product's review policy.
- Tags such as HSK, IELTS, work, and travel are user-defined labels without fixed
  hierarchy.

### Dependencies

- Learners provide valid import files in supported formats when using import.
- Learners interact with the app regularly enough for streak and progress metrics to be
  meaningful.
- Product definitions for weak-word thresholds and learned-state thresholds are agreed
  before implementation finalization.

### Key Entities *(include if feature involves data)*

- **Vocabulary Card**: A learner-created study item with word, pronunciation,
  Vietnamese meaning, example sentence, language, tags, and current difficulty signal.
- **Review Schedule**: The next-due timing and historical spacing state attached to a
  vocabulary card.
- **Review Attempt**: A single learner interaction during study mode capturing result,
  timestamp, and mode used.
- **Study Session**: A grouped set of review attempts completed in one learning run.
- **Progress Snapshot**: Aggregated learner indicators including daily streak, words
  learned, review accuracy, weak words count, and today's due workload.
- **Card Collections**: Derived card groups including favorites and mistakes for focused
  revision.
- **Import/Export Package**: A portable data bundle containing vocabulary content,
  tags, schedules, progress, and review history records.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of users can start a daily review session within 15 seconds
  of opening the app.
- **SC-002**: At least 85% of users complete their planned daily review workload on days
  they begin a session.
- **SC-003**: At least 95% of users can successfully create and save a new vocabulary
  card on the first attempt.
- **SC-004**: Import/export round-trip restores at least 99% of card and progress
  records without manual correction.
- **SC-005**: At least 90% of users can find weak-word and mistake-focused study views
  within 20 seconds.
