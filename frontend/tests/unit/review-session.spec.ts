import { beforeEach, describe, expect, it } from "vitest";
import { startReviewSession, submitReviewAnswer } from "../../src/features/review/reviewService";
import { upsertCard } from "../../src/lib/storage/cardRepository";
import { clearDbState } from "../../src/lib/storage/db";
import { getSchedule, upsertSchedule } from "../../src/lib/storage/reviewRepository";

describe("review session core behavior", () => {
  beforeEach(() => {
    clearDbState();
  });

  it("selects only due cards for today's review", () => {
    upsertCard({
      id: "card-due",
      word: "hello",
      pronunciation: "he-lo",
      meaningVi: "xin chao",
      exampleSentence: "hello world",
      language: "EN",
      difficulty: "medium",
      tags: ["ielts"],
      isFavorite: false,
      rowVersion: 1,
      createdAt: "2026-03-18T00:00:00.000Z",
      updatedAt: "2026-03-18T00:00:00.000Z"
    });

    upsertCard({
      id: "card-future",
      word: "??",
      pronunciation: "ni hao",
      meaningVi: "xin chao",
      exampleSentence: "??!",
      language: "ZH",
      difficulty: "medium",
      tags: ["hsk"],
      isFavorite: false,
      rowVersion: 1,
      createdAt: "2026-03-18T00:00:00.000Z",
      updatedAt: "2026-03-18T00:00:00.000Z"
    });

    upsertSchedule({ cardId: "card-due", level: 1, intervalDays: 2, dueDate: "2026-03-19" });
    upsertSchedule({ cardId: "card-future", level: 1, intervalDays: 2, dueDate: "2026-03-25" });

    const session = startReviewSession({ mode: "flip", localDate: "2026-03-19" });

    expect(session.workloadAtStart).toBe(1);
    expect(session.cards.map((item) => item.id)).toEqual(["card-due"]);
  });

  it("applies rating and persists next schedule", () => {
    upsertCard({
      id: "card-1",
      word: "book",
      pronunciation: "buk",
      meaningVi: "sach",
      exampleSentence: "I read a book",
      language: "EN",
      difficulty: "medium",
      tags: [],
      isFavorite: false,
      rowVersion: 1,
      createdAt: "2026-03-18T00:00:00.000Z",
      updatedAt: "2026-03-18T00:00:00.000Z"
    });

    upsertSchedule({ cardId: "card-1", level: 1, intervalDays: 2, dueDate: "2026-03-19" });

    const session = startReviewSession({ mode: "flip", localDate: "2026-03-19" });

    const result = submitReviewAnswer({
      sessionId: session.sessionId,
      cardId: "card-1",
      mode: "flip",
      rating: "good",
      localDate: "2026-03-19",
      reviewedAt: "2026-03-19T10:00:00.000Z"
    });

    expect(result.nextDueDate).toBe("2026-03-23");
    expect(result.level).toBe(2);
    expect(result.intervalDays).toBe(4);
    expect(result.sessionReviewedCount).toBe(1);

    const schedule = getSchedule("card-1");
    expect(schedule?.dueDate).toBe("2026-03-23");
    expect(schedule?.lastReviewedAt).toBe("2026-03-19T10:00:00.000Z");
  });
});
