import { beforeEach, describe, expect, it } from "vitest";
import { startReviewSession, submitReviewAnswer, todayDueCount } from "../../src/features/review/reviewService";
import { upsertCard } from "../../src/lib/storage/cardRepository";
import { clearDbState } from "../../src/lib/storage/db";
import { upsertSchedule } from "../../src/lib/storage/reviewRepository";

describe("US1 integration: offline daily review", () => {
  beforeEach(() => {
    clearDbState();
  });

  it("completes due reviews and reduces today's workload while offline", () => {
    upsertCard({
      id: "card-a",
      word: "apple",
      pronunciation: "a-pl",
      meaningVi: "tao",
      exampleSentence: "This is an apple",
      language: "EN",
      difficulty: "easy",
      tags: ["food"],
      isFavorite: false,
      rowVersion: 1,
      createdAt: "2026-03-18T00:00:00.000Z",
      updatedAt: "2026-03-18T00:00:00.000Z"
    });

    upsertCard({
      id: "card-b",
      word: "??",
      pronunciation: "xue xi",
      meaningVi: "hoc",
      exampleSentence: "?????",
      language: "ZH",
      difficulty: "medium",
      tags: ["hsk"],
      isFavorite: false,
      rowVersion: 1,
      createdAt: "2026-03-18T00:00:00.000Z",
      updatedAt: "2026-03-18T00:00:00.000Z"
    });

    upsertSchedule({ cardId: "card-a", level: 1, intervalDays: 2, dueDate: "2026-03-19" });
    upsertSchedule({ cardId: "card-b", level: 1, intervalDays: 2, dueDate: "2026-03-19" });

    const session = startReviewSession({ mode: "flip", localDate: "2026-03-19" });

    expect(todayDueCount("2026-03-19")).toBe(2);

    submitReviewAnswer({
      sessionId: session.sessionId,
      cardId: "card-a",
      mode: "flip",
      rating: "good",
      localDate: "2026-03-19"
    });

    submitReviewAnswer({
      sessionId: session.sessionId,
      cardId: "card-b",
      mode: "flip",
      rating: "easy",
      localDate: "2026-03-19"
    });

    expect(todayDueCount("2026-03-19")).toBe(0);
    expect(todayDueCount("2026-03-20")).toBe(0);
  });
});
