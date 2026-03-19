import type { ReviewRating, StudyMode, StudySession, VocabularyCard } from "../../types/domain";
import { listCards } from "../../lib/storage/cardRepository";
import { applyReviewRating } from "../../lib/scheduling/leitnerScheduler";
import { updateScoreCounters } from "../../lib/scoring/scoreCalculator";
import {
  addReviewAttempt,
  createStudySession,
  getSchedule,
  getStudySession,
  listDueSchedules,
  upsertSchedule,
  updateStudySession
} from "../../lib/storage/reviewRepository";

export interface ReviewFilters {
  language?: "EN" | "ZH";
  tag?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface StartReviewOptions {
  mode: StudyMode;
  filters?: ReviewFilters;
  localDate?: string;
  nowIso?: string;
}

export interface ActiveReviewSession {
  sessionId: string;
  startedAt: string;
  workloadAtStart: number;
  reviewedCount: number;
  correctCount: number;
  mode: StudyMode;
  cards: VocabularyCard[];
}

export interface SubmitReviewInput {
  sessionId: string;
  cardId: string;
  mode: StudyMode;
  rating: ReviewRating;
  typedAnswer?: string;
  localDate?: string;
  reviewedAt?: string;
}

export interface SubmitReviewResult {
  cardId: string;
  nextDueDate: string;
  level: number;
  intervalDays: number;
  sessionReviewedCount: number;
}

function resolveToday(localDate?: string): string {
  if (localDate) return localDate;
  return new Date().toISOString().slice(0, 10);
}

function newId(prefix: string): string {
  const random = Math.floor(Math.random() * 100000);
  return `${prefix}-${Date.now()}-${random}`;
}

function applyFilters(cards: VocabularyCard[], filters?: ReviewFilters): VocabularyCard[] {
  if (!filters) return cards;

  return cards.filter((card) => {
    if (filters.language && card.language !== filters.language) return false;
    if (filters.difficulty && card.difficulty !== filters.difficulty) return false;
    if (filters.tag && !card.tags.some((tag) => tag.toLowerCase() === filters.tag?.toLowerCase())) {
      return false;
    }
    return true;
  });
}

export function dueCardsForDate(localDate?: string, filters?: ReviewFilters): VocabularyCard[] {
  const today = resolveToday(localDate);
  const dueIds = new Set(listDueSchedules(today).map((schedule) => schedule.cardId));
  const cards = listCards().filter((card) => dueIds.has(card.id));
  return applyFilters(cards, filters);
}

export function todayDueCount(localDate?: string, filters?: ReviewFilters): number {
  return dueCardsForDate(localDate, filters).length;
}

export function startReviewSession(options: StartReviewOptions): ActiveReviewSession {
  const today = resolveToday(options.localDate);
  const startedAt = options.nowIso ?? new Date().toISOString();
  const cards = dueCardsForDate(today, options.filters);

  const session: StudySession = {
    id: newId("session"),
    startedAt,
    reviewedCount: 0,
    correctCount: 0,
    workloadAtStart: cards.length
  };

  createStudySession(session);

  return {
    sessionId: session.id,
    startedAt: session.startedAt,
    workloadAtStart: session.workloadAtStart,
    reviewedCount: 0,
    correctCount: 0,
    mode: options.mode,
    cards
  };
}

export function submitReviewAnswer(input: SubmitReviewInput): SubmitReviewResult {
  const today = resolveToday(input.localDate);
  const reviewedAt = input.reviewedAt ?? new Date().toISOString();
  const schedule =
    getSchedule(input.cardId) ??
    ({
      cardId: input.cardId,
      level: 0,
      intervalDays: 1,
      dueDate: today
    } as const);

  const next = applyReviewRating(schedule, input.rating, today, reviewedAt);

  upsertSchedule({
    cardId: input.cardId,
    level: next.level,
    intervalDays: next.intervalDays,
    dueDate: next.dueDate,
    lastReviewedAt: next.lastReviewedAt
  });

  addReviewAttempt({
    id: newId("attempt"),
    cardId: input.cardId,
    sessionId: input.sessionId,
    mode: input.mode,
    rating: input.rating,
    isCorrect: input.rating === "good" || input.rating === "easy",
    typedAnswer: input.typedAnswer,
    reviewedAt
  });

  const session = getStudySession(input.sessionId);
  let reviewedCount = 1;

  if (session) {
    const counters = updateScoreCounters(
      {
        attemptCount: session.reviewedCount,
        correctCount: session.correctCount
      },
      input.rating
    );

    updateStudySession({
      ...session,
      reviewedCount: counters.attemptCount,
      correctCount: counters.correctCount,
      endedAt: counters.attemptCount >= session.workloadAtStart ? reviewedAt : session.endedAt
    });

    reviewedCount = counters.attemptCount;
  }

  return {
    cardId: input.cardId,
    nextDueDate: next.dueDate,
    level: next.level,
    intervalDays: next.intervalDays,
    sessionReviewedCount: reviewedCount
  };
}
