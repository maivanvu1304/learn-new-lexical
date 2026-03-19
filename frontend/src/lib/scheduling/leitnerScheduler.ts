import type { ReviewRating } from "../../types/domain";

const LADDER = [1, 2, 4, 7, 14, 30] as const;

export interface ScheduleState {
  level: number;
  intervalDays: number;
  dueDate: string;
  lastReviewedAt?: string;
}

function clampLevel(level: number): number {
  return Math.max(0, Math.min(5, level));
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function applyReviewRating(
  current: ScheduleState,
  rating: ReviewRating,
  localDate: string,
  reviewedAt = new Date().toISOString()
): ScheduleState {
  let nextLevel = current.level;
  let nextInterval = current.intervalDays;

  if (rating === "again") {
    nextLevel = 0;
    nextInterval = 1;
  } else if (rating === "hard") {
    nextLevel = clampLevel(current.level - 1);
    nextInterval = Math.max(1, Math.floor(current.intervalDays * 1.2));
  } else if (rating === "good") {
    nextLevel = clampLevel(current.level + 1);
    nextInterval = LADDER[nextLevel];
  } else {
    nextLevel = clampLevel(current.level + 2);
    nextInterval = LADDER[nextLevel];
  }

  return {
    level: nextLevel,
    intervalDays: nextInterval,
    dueDate: addDays(localDate, nextInterval),
    lastReviewedAt: reviewedAt
  };
}
