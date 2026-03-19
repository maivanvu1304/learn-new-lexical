import { useMemo, useState } from "react";
import type { Difficulty, Language, VocabularyCard } from "../../types/domain";
import {
  createVocabularyCard,
  deleteVocabularyCard,
  filterVocabularyCards,
  listVocabularyCards,
  toggleFavoriteCard,
  type CardInput,
  updateVocabularyCard
} from "./cardService";
import { CardForm } from "./CardForm";

const BLANK_FILTERS: { language?: Language; tag?: string; difficulty?: Difficulty } = {};

function toFormValue(card: VocabularyCard): CardInput {
  return {
    word: card.word,
    pronunciation: card.pronunciation,
    meaningVi: card.meaningVi,
    exampleSentence: card.exampleSentence,
    language: card.language,
    tags: card.tags,
    difficulty: card.difficulty
  };
}

export function CardListPage() {
  const [filters, setFilters] = useState(BLANK_FILTERS);
  const [cards, setCards] = useState<VocabularyCard[]>(() => listVocabularyCards());
  const [editingCardId, setEditingCardId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const filteredCards = useMemo(() => {
    if (!filters.language && !filters.tag && !filters.difficulty) {
      return cards;
    }

    return filterVocabularyCards(filters);
  }, [cards, filters]);

  const editingCard = editingCardId ? cards.find((item) => item.id === editingCardId) : undefined;

  function refreshCards() {
    setCards(listVocabularyCards());
  }

  function handleSubmit(input: CardInput) {
    try {
      if (editingCardId) {
        updateVocabularyCard(editingCardId, input);
      } else {
        createVocabularyCard(input);
      }
      setEditingCardId(undefined);
      setError(undefined);
      refreshCards();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save card");
    }
  }

  return (
    <section aria-labelledby="cards-title" className="space-y-4">
      <h1 id="cards-title" className="text-2xl font-semibold">
        Vocabulary Cards
      </h1>

      <CardForm
        initialValue={editingCard ? toFormValue(editingCard) : undefined}
        submitLabel={editingCard ? "Update Card" : "Create Card"}
        onSubmit={handleSubmit}
        onCancel={editingCard ? () => setEditingCardId(undefined) : undefined}
      />

      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="filter-language">
          Language
          <select
            id="filter-language"
            value={filters.language ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                language: event.target.value ? (event.target.value as Language) : undefined
              }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">All</option>
            <option value="EN">English</option>
            <option value="ZH">Chinese</option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700" htmlFor="filter-tag">
          Tag
          <input
            id="filter-tag"
            value={filters.tag ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                tag: event.target.value.trim() ? event.target.value : undefined
              }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium text-slate-700" htmlFor="filter-difficulty">
          Difficulty
          <select
            id="filter-difficulty"
            value={filters.difficulty ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                difficulty: event.target.value ? (event.target.value as Difficulty) : undefined
              }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>

      <ul className="space-y-3" aria-label="card list">
        {filteredCards.map((card) => (
          <li key={card.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{card.word}</h2>
                <p className="text-sm text-slate-600">{card.pronunciation}</p>
                <p className="mt-1 text-sm text-slate-700">{card.meaningVi}</p>
                <p className="mt-1 text-xs text-slate-500">{card.exampleSentence}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                  {card.language} · {card.difficulty}
                </p>
                {card.tags.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">Tags: {card.tags.join(", ")}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-100"
                  onClick={() => setEditingCardId(card.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-100"
                  onClick={() => {
                    toggleFavoriteCard(card.id, !card.isFavorite);
                    refreshCards();
                  }}
                >
                  {card.isFavorite ? "Unfavorite" : "Favorite"}
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  onClick={() => {
                    deleteVocabularyCard(card.id);
                    if (editingCardId === card.id) setEditingCardId(undefined);
                    refreshCards();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
