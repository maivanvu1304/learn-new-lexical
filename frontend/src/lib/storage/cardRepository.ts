import type { VocabularyCard } from "../../types/domain";
import { loadDbState, saveDbState } from "./db";

export function upsertCard(card: VocabularyCard): VocabularyCard {
  const state = loadDbState();
  state.cards[card.id] = card;
  saveDbState(state);
  return card;
}

export function removeCard(cardId: string): void {
  const state = loadDbState();
  delete state.cards[cardId];
  delete state.schedules[cardId];
  saveDbState(state);
}

export function getCard(cardId: string): VocabularyCard | undefined {
  return loadDbState().cards[cardId];
}

export function listCards(): VocabularyCard[] {
  return Object.values(loadDbState().cards);
}

export interface CardFilters {
  language?: "EN" | "ZH";
  tag?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export function filterCards(filters: CardFilters): VocabularyCard[] {
  return listCards().filter((card) => {
    if (filters.language && card.language !== filters.language) return false;
    if (filters.difficulty && card.difficulty !== filters.difficulty) return false;
    if (filters.tag && !card.tags.includes(filters.tag)) return false;
    return true;
  });
}
