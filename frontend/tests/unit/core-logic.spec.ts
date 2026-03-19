import { describe, expect, it } from "vitest";
import { applyReviewRating } from "../../src/lib/scheduling/leitnerScheduler";
import { calculateAccuracy, updateScoreCounters } from "../../src/lib/scoring/scoreCalculator";
import { updateStreak } from "../../src/lib/streak/streakCalculator";

describe("core logic", () => {
  it("applies again rating by resetting level and interval", () => {
    const next = applyReviewRating(
      { level: 3, intervalDays: 7, dueDate: "2026-03-19" },
      "again",
      "2026-03-19"
    );

    expect(next.level).toBe(0);
    expect(next.intervalDays).toBe(1);
    expect(next.dueDate).toBe("2026-03-20");
  });

  it("applies hard rating with lower bounded level", () => {
    const next = applyReviewRating(
      { level: 0, intervalDays: 5, dueDate: "2026-03-19" },
      "hard",
      "2026-03-19"
    );

    expect(next.level).toBe(0);
    expect(next.intervalDays).toBe(6);
    expect(next.dueDate).toBe("2026-03-25");
  });

  it("applies good rating with ladder progression", () => {
    const next = applyReviewRating(
      { level: 1, intervalDays: 2, dueDate: "2026-03-19" },
      "good",
      "2026-03-19"
    );

    expect(next.level).toBe(2);
    expect(next.intervalDays).toBe(4);
    expect(next.dueDate).toBe("2026-03-23");
  });

  it("applies easy rating with upper bounded level", () => {
    const next = applyReviewRating(
      { level: 4, intervalDays: 14, dueDate: "2026-03-19" },
      "easy",
      "2026-03-19"
    );

    expect(next.level).toBe(5);
    expect(next.intervalDays).toBe(30);
    expect(next.dueDate).toBe("2026-04-18");
  });

  it("updates score counters for good and easy only", () => {
    const first = updateScoreCounters({ attemptCount: 0, correctCount: 0 }, "hard");
    const second = updateScoreCounters(first, "good");
    const third = updateScoreCounters(second, "easy");

    expect(first).toEqual({ attemptCount: 1, correctCount: 0 });
    expect(second).toEqual({ attemptCount: 2, correctCount: 1 });
    expect(third).toEqual({ attemptCount: 3, correctCount: 2 });
  });

  it("calculates rounded accuracy and handles zero-attempt case", () => {
    const zero = calculateAccuracy({ attemptCount: 0, correctCount: 0 });
    const rounded = calculateAccuracy({ attemptCount: 3, correctCount: 2 });

    expect(zero).toBe(0);
    expect(rounded).toBe(0.6667);
  });

  it("increments streak for consecutive local dates", () => {
    const first = updateStreak(undefined, "2026-03-18");
    const second = updateStreak(first, "2026-03-19");

    expect(first.currentStreak).toBe(1);
    expect(second.currentStreak).toBe(2);
  });

  it("does not increment streak for same-day or backdated entries", () => {
    const first = updateStreak(undefined, "2026-03-19");
    const second = updateStreak(first, "2026-03-19");
    const third = updateStreak(second, "2026-03-18");

    expect(second.currentStreak).toBe(1);
    expect(second.lastStudyDate).toBe("2026-03-19");
    expect(third.currentStreak).toBe(1);
    expect(third.lastStudyDate).toBe("2026-03-18");
  });

  it("resets streak after a gap of multiple days", () => {
    const first = updateStreak(undefined, "2026-03-19");
    const second = updateStreak(first, "2026-03-22");

    expect(second.currentStreak).toBe(1);
    expect(second.lastStudyDate).toBe("2026-03-22");
  });
});
