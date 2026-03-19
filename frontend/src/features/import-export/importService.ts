import type { ReviewAttempt, ReviewSchedule, VocabularyCard } from "../../types/domain";
import { overwriteDbState, snapshotDbState } from "../../lib/storage/db";
import {
  isSupportedPortabilityVersion,
  validatePortabilityEnvelope
} from "../../lib/storage/portabilitySchema";

interface ImportPayload {
  cards?: VocabularyCard[];
  schedules?: ReviewSchedule[];
  reviewAttempts?: ReviewAttempt[];
}

export interface ImportReport {
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: Array<{ row: number; reason: string }>;
}

function isCardValid(card: Partial<VocabularyCard>): boolean {
  return Boolean(
    card.word?.trim() &&
      card.pronunciation?.trim() &&
      card.meaningVi?.trim() &&
      card.exampleSentence?.trim() &&
      (card.language === "EN" || card.language === "ZH")
  );
}

export function importVocabularyPackage(input: unknown): ImportReport {
  if (!validatePortabilityEnvelope(input)) {
    return {
      totalRows: 0,
      importedRows: 0,
      failedRows: 0,
      errors: [{ row: 0, reason: "Invalid import envelope" }]
    };
  }

  if (!isSupportedPortabilityVersion(input.formatVersion)) {
    return {
      totalRows: 0,
      importedRows: 0,
      failedRows: 0,
      errors: [{ row: 0, reason: "Unsupported format version" }]
    };
  }

  const payload = (input.payload ?? {}) as ImportPayload;
  const cards = payload.cards ?? [];
  const schedules = payload.schedules ?? [];
  const attempts = payload.reviewAttempts ?? [];

  const errors: Array<{ row: number; reason: string }> = [];
  const validCards: VocabularyCard[] = [];

  cards.forEach((card, index) => {
    if (!isCardValid(card)) {
      errors.push({ row: index + 1, reason: "Invalid card row" });
      return;
    }

    validCards.push({
      ...card,
      tags: card.tags ?? [],
      isFavorite: card.isFavorite ?? false,
      difficulty: card.difficulty ?? "medium",
      rowVersion: card.rowVersion ?? 1,
      id: card.id ?? `card-import-${Date.now()}-${index}`,
      createdAt: card.createdAt ?? new Date().toISOString(),
      updatedAt: card.updatedAt ?? new Date().toISOString()
    });
  });

  const current = snapshotDbState();

  for (const card of validCards) {
    current.cards[card.id] = card;
  }

  for (const schedule of schedules) {
    current.schedules[schedule.cardId] = schedule;
  }

  for (const attempt of attempts) {
    current.reviewAttempts[attempt.id] = attempt;
  }

  overwriteDbState(current);

  return {
    totalRows: cards.length,
    importedRows: validCards.length,
    failedRows: cards.length - validCards.length,
    errors
  };
}
