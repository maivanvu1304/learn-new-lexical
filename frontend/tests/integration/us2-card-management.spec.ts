import { beforeEach, describe, expect, it } from "vitest";
import {
  createVocabularyCard,
  filterVocabularyCards,
  listVocabularyCards,
  updateVocabularyCard
} from "../../src/features/cards/cardService";
import { clearDbState } from "../../src/lib/storage/db";

describe("US2 integration: create/edit/filter cards", () => {
  beforeEach(() => {
    clearDbState();
  });

  it("creates and edits cards, then applies filters", () => {
    const english = createVocabularyCard({
      word: "office",
      pronunciation: "of-fis",
      meaningVi: "van phong",
      exampleSentence: "I work in an office",
      language: "EN",
      tags: ["work"],
      difficulty: "medium"
    });

    createVocabularyCard({
      word: "??",
      pronunciation: "xue xi",
      meaningVi: "hoc",
      exampleSentence: "?????",
      language: "ZH",
      tags: ["hsk"],
      difficulty: "hard"
    });

    updateVocabularyCard(english.id, { difficulty: "easy", tags: ["IELTS", "work"] });

    const filtered = filterVocabularyCards({ language: "EN", tag: "ielts", difficulty: "easy" });

    expect(listVocabularyCards()).toHaveLength(2);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe(english.id);
  });
});
