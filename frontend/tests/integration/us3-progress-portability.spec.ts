import { beforeEach, describe, expect, it } from "vitest";
import { createVocabularyCard, toggleFavoriteCard } from "../../src/features/cards/cardService";
import { getDashboardProgress, getFavoriteCards } from "../../src/features/dashboard/progressService";
import { importVocabularyPackage } from "../../src/features/import-export/importService";
import { exportVocabularyPackage } from "../../src/features/import-export/exportService";
import { clearDbState } from "../../src/lib/storage/db";
import { addReviewAttempt } from "../../src/lib/storage/reviewRepository";

describe("US3 integration: progress and portability", () => {
  beforeEach(() => {
    clearDbState();
  });

  it("exports and re-imports cards and progress state", () => {
    const card = createVocabularyCard({
      word: "habit",
      pronunciation: "ha-bit",
      meaningVi: "thoi quen",
      exampleSentence: "Build a habit",
      language: "EN",
      tags: ["ielts"],
      difficulty: "medium"
    });

    toggleFavoriteCard(card.id, true);

    addReviewAttempt({
      id: "attempt-rt-1",
      cardId: card.id,
      sessionId: "session-rt",
      mode: "flip",
      rating: "good",
      isCorrect: true,
      reviewedAt: "2026-03-19T08:00:00.000Z"
    });

    const exported = exportVocabularyPackage("json");

    clearDbState();

    const report = importVocabularyPackage(exported);

    expect(report.failedRows).toBe(0);
    expect(getFavoriteCards().length).toBe(1);
    expect(getDashboardProgress("2026-03-19").reviewAccuracy).toBe(1);
  });
});
