import type { VocabularyCard } from "../../types/domain";
import { calculateAccuracy } from "../../lib/scoring/scoreCalculator";
import { listCards } from "../../lib/storage/cardRepository";
import {
  listDueSchedules,
  listReviewAttempts,
  listSchedules
} from "../../lib/storage/reviewRepository";
import { updateStreak } from "../../lib/streak/streakCalculator";

export interface DashboardProgress {
  todayDueCount: number;
  streakDays: number;
  wordsLearned: number;
  reviewAccuracy: number;
  weakWordsCount: number;
}

function toLocalDate(dateTime: string): string {
  return dateTime.slice(0, 10);
}

function resolveDate(localDate?: string): string {
  return localDate ?? new Date().toISOString().slice(0, 10);
}

export function getFavoriteCards(): VocabularyCard[] {
  return listCards().filter((card) => card.isFavorite);
}

export function getMistakeCards(): VocabularyCard[] {
  const attempts = listReviewAttempts();
  const mistakes = new Set(
    attempts
      .filter((attempt) => !attempt.isCorrect || attempt.rating === "again" || attempt.rating === "hard")
      .map((attempt) => attempt.cardId)
  );

  return listCards().filter((card) => mistakes.has(card.id));
}

function calculateStreak(localDate: string): number {
  const uniqueDates = Array.from(new Set(listReviewAttempts().map((attempt) => toLocalDate(attempt.reviewedAt)))).sort();

  let state: { currentStreak: number; lastStudyDate: string } | undefined;

  for (const date of uniqueDates) {
    state = updateStreak(state, date);
  }

  if (!state || state.lastStudyDate !== localDate) return 0;
  return state.currentStreak;
}

function calculateWeakWordIds(): Set<string> {
  const attempts = listReviewAttempts();
  const byCard = new Map<string, { attempts: number; correct: number; hasIncorrect: boolean }>();

  for (const attempt of attempts) {
    const current = byCard.get(attempt.cardId) ?? { attempts: 0, correct: 0, hasIncorrect: false };
    current.attempts += 1;
    current.correct += attempt.isCorrect ? 1 : 0;
    current.hasIncorrect = current.hasIncorrect || !attempt.isCorrect;
    byCard.set(attempt.cardId, current);
  }

  const weak = new Set<string>();

  for (const [cardId, value] of byCard.entries()) {
    const accuracy = calculateAccuracy({
      attemptCount: value.attempts,
      correctCount: value.correct
    });

    if (value.hasIncorrect && (value.attempts >= 2 ? accuracy < 0.6 : true)) {
      weak.add(cardId);
    }
  }

  return weak;
}

export function getDashboardProgress(localDate?: string): DashboardProgress {
  const date = resolveDate(localDate);
  const attempts = listReviewAttempts();
  const schedules = listSchedules();

  const reviewAccuracy = calculateAccuracy({
    attemptCount: attempts.length,
    correctCount: attempts.filter((attempt) => attempt.isCorrect).length
  });

  const wordsLearned = schedules.filter((schedule) => schedule.level >= 4).length;
  const weakWordIds = calculateWeakWordIds();

  return {
    todayDueCount: listDueSchedules(date).length,
    streakDays: calculateStreak(date),
    wordsLearned,
    reviewAccuracy,
    weakWordsCount: weakWordIds.size
  };
}
