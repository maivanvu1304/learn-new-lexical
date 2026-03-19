import { beforeEach, describe, expect, it } from "vitest";
import { createVocabularyCard, toggleFavoriteCard } from "../../src/features/cards/cardService";
import {
  getDashboardProgress,
  getFavoriteCards,
  getMistakeCards
} from "../../src/features/dashboard/progressService";
import { clearDbState } from "../../src/lib/storage/db";
import { addReviewAttempt, upsertSchedule } from "../../src/lib/storage/reviewRepository";

describe("progress metrics", () => {
  beforeEach(() => {
    clearDbState();
  });

  it("calculates accuracy and weak words from review attempts", () => {
    const card = createVocabularyCard({
      word: "steady",
      pronunciation: "ste-dy",
      meaningVi: "on dinh",
      exampleSentence: "Keep a steady pace",
      language: "EN",
      tags: ["work"],
      difficulty: "medium"
    });

    upsertSchedule({
      cardId: card.id,
      level: 4,
      intervalDays: 14,
      dueDate: "2026-03-20"
    });

    addReviewAttempt({
      id: "attempt-1",
      cardId: card.id,
      sessionId: "session-1",
      mode: "flip",
      rating: "again",
      isCorrect: false,
      reviewedAt: "2026-03-19T09:00:00.000Z"
    });

    addReviewAttempt({
      id: "attempt-2",
      cardId: card.id,
      sessionId: "session-1",
      mode: "flip",
      rating: "good",
      isCorrect: true,
      reviewedAt: "2026-03-19T10:00:00.000Z"
    });

    const metrics = getDashboardProgress("2026-03-19");

    expect(metrics.reviewAccuracy).toBe(0.5);
    expect(metrics.wordsLearned).toBe(1);
    expect(metrics.weakWordsCount).toBe(1);
  });

  it("returns favorite and mistake focus lists", () => {
    const favoriteCard = createVocabularyCard({
      word: "focus",
      pronunciation: "fo-kus",
      meaningVi: "tap trung",
      exampleSentence: "Focus matters",
      language: "EN",
      tags: ["work"],
      difficulty: "easy"
    });

    const mistakeCard = createVocabularyCard({
      word: "nai xin",
      pronunciation: "nai xin",
      meaningVi: "kien nhan",
      exampleSentence: "Can patience grow?",
      language: "ZH",
      tags: ["hsk"],
      difficulty: "hard"
    });

    toggleFavoriteCard(favoriteCard.id, true);

    addReviewAttempt({
      id: "attempt-mistake",
      cardId: mistakeCard.id,
      sessionId: "session-2",
      mode: "typing",
      rating: "again",
      isCorrect: false,
      reviewedAt: "2026-03-19T10:00:00.000Z"
    });

    expect(getFavoriteCards().some((card) => card.id === favoriteCard.id)).toBe(true);
    expect(getMistakeCards().some((card) => card.id === mistakeCard.id)).toBe(true);
  });
});
