import type { ReviewAttempt, ReviewSchedule, VocabularyCard } from "../../types/domain";
import { snapshotDbState } from "../../lib/storage/db";
import { PORTABILITY_FORMAT_VERSION } from "../../lib/storage/portabilitySchema";

export interface ExportPayload {
  format: "json" | "csv";
  formatVersion: string;
  exportedAt: string;
  payload: {
    cards: VocabularyCard[];
    schedules: ReviewSchedule[];
    reviewAttempts: ReviewAttempt[];
  };
  csv?: string;
}

function cardToCsv(cards: VocabularyCard[]): string {
  const header = "id,word,pronunciation,meaningVi,exampleSentence,language,difficulty,tags,isFavorite";
  const rows = cards.map((card) =>
    [
      card.id,
      card.word,
      card.pronunciation,
      card.meaningVi,
      card.exampleSentence,
      card.language,
      card.difficulty,
      card.tags.join("|"),
      card.isFavorite ? "1" : "0"
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",")
  );

  return [header, ...rows].join("\n");
}

export function exportVocabularyPackage(format: "json" | "csv" = "json"): ExportPayload {
  const state = snapshotDbState();
  const cards = Object.values(state.cards);
  const payload: ExportPayload = {
    format,
    formatVersion: PORTABILITY_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    payload: {
      cards,
      schedules: Object.values(state.schedules),
      reviewAttempts: Object.values(state.reviewAttempts)
    }
  };

  if (format === "csv") {
    payload.csv = cardToCsv(cards);
  }

  return payload;
}
