import type { Difficulty, Language, VocabularyCard } from "../../types/domain";
import {
  filterCards,
  getCard,
  listCards,
  removeCard,
  type CardFilters,
  upsertCard
} from "../../lib/storage/cardRepository";
import { upsertSchedule } from "../../lib/storage/reviewRepository";
import { normalizeTags } from "./tagService";

export interface CardInput {
  word: string;
  pronunciation: string;
  meaningVi: string;
  exampleSentence: string;
  language: Language;
  tags: string[];
  difficulty: Difficulty;
}

function nowIso(): string {
  return new Date().toISOString();
}

function today(): string {
  return nowIso().slice(0, 10);
}

function generateCardId(): string {
  return `card-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function validateCardInput(input: Partial<CardInput>): string[] {
  const errors: string[] = [];

  if (!input.word?.trim()) errors.push("word is required");
  if (!input.pronunciation?.trim()) errors.push("pronunciation is required");
  if (!input.meaningVi?.trim()) errors.push("meaningVi is required");
  if (!input.exampleSentence?.trim()) errors.push("exampleSentence is required");
  if (!input.language) errors.push("language is required");

  return errors;
}

function toStoredCard(input: CardInput, existing?: VocabularyCard): VocabularyCard {
  const timestamp = nowIso();

  return {
    id: existing?.id ?? generateCardId(),
    word: input.word.trim(),
    pronunciation: input.pronunciation.trim(),
    meaningVi: input.meaningVi.trim(),
    exampleSentence: input.exampleSentence.trim(),
    language: input.language,
    tags: normalizeTags(input.tags),
    difficulty: input.difficulty,
    isFavorite: existing?.isFavorite ?? false,
    rowVersion: (existing?.rowVersion ?? 0) + 1,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    deletedAt: existing?.deletedAt
  };
}

export function createVocabularyCard(input: CardInput): VocabularyCard {
  const errors = validateCardInput(input);
  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }

  const card = toStoredCard(input);
  upsertCard(card);

  upsertSchedule({
    cardId: card.id,
    level: 0,
    intervalDays: 1,
    dueDate: today()
  });

  return card;
}

export function updateVocabularyCard(cardId: string, patch: Partial<CardInput>): VocabularyCard {
  const existing = getCard(cardId);
  if (!existing) {
    throw new Error("card not found");
  }

  const merged: CardInput = {
    word: patch.word ?? existing.word,
    pronunciation: patch.pronunciation ?? existing.pronunciation,
    meaningVi: patch.meaningVi ?? existing.meaningVi,
    exampleSentence: patch.exampleSentence ?? existing.exampleSentence,
    language: patch.language ?? existing.language,
    tags: patch.tags ?? existing.tags,
    difficulty: patch.difficulty ?? existing.difficulty
  };

  const errors = validateCardInput(merged);
  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }

  const card = toStoredCard(merged, existing);
  upsertCard(card);
  return card;
}

export function deleteVocabularyCard(cardId: string): void {
  removeCard(cardId);
}

export function toggleFavoriteCard(cardId: string, isFavorite: boolean): VocabularyCard {
  const existing = getCard(cardId);
  if (!existing) {
    throw new Error("card not found");
  }

  const updated: VocabularyCard = {
    ...existing,
    isFavorite,
    rowVersion: existing.rowVersion + 1,
    updatedAt: nowIso()
  };

  upsertCard(updated);
  return updated;
}

export function getVocabularyCard(cardId: string): VocabularyCard | undefined {
  return getCard(cardId);
}

export function listVocabularyCards(): VocabularyCard[] {
  return listCards().sort((left, right) => left.word.localeCompare(right.word));
}

export function filterVocabularyCards(filters: CardFilters): VocabularyCard[] {
  return filterCards(filters).sort((left, right) => left.word.localeCompare(right.word));
}
