import { beforeEach, describe, expect, it } from "vitest";
import { overwriteDbState } from "../../src/lib/storage/db";
import { todayDueCount } from "../../src/features/review/reviewService";

describe("performance smoke: due-count for 10k cards", () => {
  beforeEach(() => {
    const cards: Record<string, unknown> = {};
    const schedules: Record<string, unknown> = {};

    for (let index = 0; index < 10000; index += 1) {
      const id = `card-${index}`;
      cards[id] = {
        id,
        word: `word-${index}`,
        pronunciation: `pron-${index}`,
        meaningVi: `meaning-${index}`,
        exampleSentence: `example-${index}`,
        language: index % 2 === 0 ? "EN" : "ZH",
        difficulty: "medium",
        tags: [],
        isFavorite: false,
        rowVersion: 1,
        createdAt: "2026-03-19T00:00:00.000Z",
        updatedAt: "2026-03-19T00:00:00.000Z"
      };

      schedules[id] = {
        cardId: id,
        level: 1,
        intervalDays: 2,
        dueDate: "2026-03-19"
      };
    }

    overwriteDbState({
      cards: cards as Record<string, never>,
      schedules: schedules as Record<string, never>,
      reviewAttempts: {},
      studySessions: {},
      outbox: {}
    });
  });

  it("computes due count under 1 second", () => {
    const started = performance.now();
    const due = todayDueCount("2026-03-19");
    const duration = performance.now() - started;

    expect(due).toBe(10000);
    expect(duration).toBeLessThan(1000);
  });
});
