<!--
Sync Impact Report
Version change: template placeholder -> 1.0.0 (initial ratification from template)
Modified principles:
- Principle 1 placeholder -> I. Simple and Clean Study Experience
- Principle 2 placeholder -> II. Offline-First Learning
- Principle 3 placeholder -> III. Verified Review Scheduling and Scoring (NON-NEGOTIABLE)
- Principle 4 placeholder -> IV. Accessible Daily Study
- Principle 5 placeholder -> V. Portable Learner Data
- Added: VI. Minimal Dependencies, Explicit Justification
Added sections:
- Product and Technical Constraints
- Development Workflow and Quality Gates
Removed sections:
- None
Templates requiring updates:
- [updated] .specify/templates/plan-template.md
- [updated] .specify/templates/spec-template.md
- [updated] .specify/templates/tasks-template.md
- [pending] .specify/templates/commands/*.md (directory not present in repository)
Follow-up TODOs:
- None
-->
# Vocabulary Learning App Constitution

## Core Principles

### I. Simple and Clean Study Experience
The study interface MUST keep focus on one primary action per screen and avoid
non-essential controls in the main review path. Any new UI element in study screens
MUST include a justification in the feature spec and updated screenshots in review.
Rationale: daily learning depends on low friction and fast task completion.

### II. Offline-First Learning
The core loop (open deck, review due cards, score answers, and reschedule cards)
MUST work without network access. Sync, backup, and collaborative features MUST
degrade gracefully and MUST NOT block local study sessions. Rationale: learners
study in unreliable network conditions and cannot lose momentum.

### III. Verified Review Scheduling and Scoring (NON-NEGOTIABLE)
Any change to review scheduling or scoring logic MUST include automated tests for
normal, boundary, and regression scenarios. Modules implementing scheduling or
scoring MUST maintain at least 90% line coverage, and PRs touching them MUST show
failing tests before implementation and passing tests after implementation.
Rationale: correctness defects in review timing or score handling directly harm
learning outcomes.

### IV. Accessible Daily Study
Core review flows MUST be operable with keyboard-only navigation and screen readers.
Study UI MUST meet WCAG 2.1 AA contrast requirements, and content MUST remain usable
at 200% zoom without losing essential functionality. Rationale: accessibility is
required for reliable daily use across diverse learners and environments.

### V. Portable Learner Data
The app MUST provide import and export for learner vocabulary data, progress, and
review history using documented open formats (JSON and CSV at minimum). Exported data
MUST be re-importable with validation and user-visible conflict handling. Rationale:
learners must retain ownership of progress and avoid vendor lock-in.

### VI. Minimal Dependencies, Explicit Justification
New runtime dependencies MUST include written justification covering purpose,
alternatives considered, maintenance risk, security/license impact, and bundle size
or binary footprint impact. Dependencies without clear net value MUST NOT be added,
and unused dependencies MUST be removed during maintenance. Rationale: lean stacks
improve reliability, performance, and long-term maintainability.

## Product and Technical Constraints

- Primary use case is quick daily sessions; core review interactions MUST remain fast
  and readable on small mobile screens.
- Local persistence MUST be treated as the source of truth during offline use.
- Synchronization logic MUST be idempotent and retry-safe to avoid duplicate updates.
- Import/export format versions MUST be documented and backward-compatible for at
  least one previous format version.

## Development Workflow and Quality Gates

- Each feature spec MUST describe interface simplicity impact, offline behavior,
  accessibility acceptance criteria, portability implications, and dependency changes.
- Implementation plans MUST include a constitution check before research/design and
  before final implementation approval.
- Task lists MUST contain explicit tasks for scheduling/scoring tests when related
  code changes, accessibility validation, and import/export validation.
- Pull requests MUST include evidence for all affected principles before merge.

## Governance

This constitution overrides conflicting local conventions for product and engineering
decisions in this repository.

Amendment procedure:
1. Propose changes in a pull request with rationale, impacted principles, and
   migration steps for active work.
2. Obtain approval from at least one product owner and one engineering maintainer.
3. Ratify by merging the amendment and updating dependent templates in the same change.

Versioning policy:
- MAJOR: backward-incompatible governance changes, principle removals, or principle
  redefinitions that change compliance expectations.
- MINOR: new principles/sections or materially expanded requirements.
- PATCH: wording clarifications, typo fixes, and non-semantic refinements.

Compliance review expectations:
- Planning and specification artifacts MUST pass constitution checks before execution.
- Code review MUST verify evidence for any affected principle.
- Violations MUST be corrected before merge or explicitly waived with documented risk,
  approver name, and expiration date.

**Version**: 1.0.0 | **Ratified**: 2026-03-18 | **Last Amended**: 2026-03-18
