import type { ReviewRating } from "../../types/domain";

export interface ScoreCounters {
  attemptCount: number;
  correctCount: number;
}

export function updateScoreCounters(
  counters: ScoreCounters,
  rating: ReviewRating
): ScoreCounters {
  const isCorrect = rating === "good" || rating === "easy";

  return {
    attemptCount: counters.attemptCount + 1,
    correctCount: counters.correctCount + (isCorrect ? 1 : 0)
  };
}

export function calculateAccuracy(counters: ScoreCounters): number {
  if (counters.attemptCount === 0) return 0;
  return Number((counters.correctCount / counters.attemptCount).toFixed(4));
}
