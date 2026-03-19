import { beforeEach, describe, expect, it } from "vitest";
import {
  createVocabularyCard,
  filterVocabularyCards,
  updateVocabularyCard,
  validateCardInput
} from "../../src/features/cards/cardService";
import { clearDbState } from "../../src/lib/storage/db";

describe("card management service", () => {
  beforeEach(() => {
    clearDbState();
  });

  it("validates required card fields", () => {
    const errors = validateCardInput({
      word: "",
      pronunciation: "",
      meaningVi: "",
      exampleSentence: "",
      language: "EN"
    });

    expect(errors.length).toBeGreaterThanOrEqual(4);
  });

  it("creates, updates, and filters cards by language/tag/difficulty", () => {
    const card = createVocabularyCard({
      word: "run",
      pronunciation: "run",
      meaningVi: "chay",
      exampleSentence: "I run every day",
      language: "EN",
      tags: ["IELTS", "work"],
      difficulty: "hard"
    });

    updateVocabularyCard(card.id, { difficulty: "easy", tags: ["work"] });

    const filtered = filterVocabularyCards({
      language: "EN",
      tag: "work",
      difficulty: "easy"
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe(card.id);
  });
});
