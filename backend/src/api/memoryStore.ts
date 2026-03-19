export type Language = "EN" | "ZH";
export type Difficulty = "easy" | "medium" | "hard";
export type StudyMode = "flip" | "quiz" | "typing";
export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface VocabularyCard {
  id: string;
  word: string;
  pronunciation: string;
  meaningVi: string;
  exampleSentence: string;
  language: Language;
  tags: string[];
  difficulty: Difficulty;
  isFavorite: boolean;
}

interface ReviewSchedule {
  cardId: string;
  level: number;
  intervalDays: number;
  dueDate: string;
  lastReviewedAt?: string;
}

interface ReviewAttempt {
  id: string;
  cardId: string;
  sessionId: string;
  mode: StudyMode;
  rating: ReviewRating;
  reviewedAt: string;
}

interface StudySession {
  sessionId: string;
  startedAt: string;
  workloadAtStart: number;
  cards: VocabularyCard[];
  reviewedCount: number;
}

const LADDER = [1, 2, 4, 7, 14, 30] as const;

const cards = new Map<string, VocabularyCard>();
const schedules = new Map<string, ReviewSchedule>();
const attempts: ReviewAttempt[] = [];
const sessions = new Map<string, StudySession>();

function toLocalDate(dateTime: string): string {
  return dateTime.slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

function addDays(localDate: string, days: number): string {
  const value = new Date(`${localDate}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function clampLevel(level: number): number {
  return Math.max(0, Math.min(5, level));
}

function nextSchedule(current: ReviewSchedule, rating: ReviewRating, localDate: string): ReviewSchedule {
  let level = current.level;
  let intervalDays = current.intervalDays;

  if (rating === "again") {
    level = 0;
    intervalDays = 1;
  } else if (rating === "hard") {
    level = clampLevel(level - 1);
    intervalDays = Math.max(1, Math.floor(intervalDays * 1.2));
  } else if (rating === "good") {
    level = clampLevel(level + 1);
    intervalDays = LADDER[level];
  } else {
    level = clampLevel(level + 2);
    intervalDays = LADDER[level];
  }

  return {
    cardId: current.cardId,
    level,
    intervalDays,
    dueDate: addDays(localDate, intervalDays),
    lastReviewedAt: nowIso()
  };
}

function normalizeTag(tag: string): string {
  return tag.trim();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function ensureSeedData(): void {
  if (cards.size > 0) return;

  const seedCard: VocabularyCard = {
    id: "card-seed-1",
    word: "hello",
    pronunciation: "he-lo",
    meaningVi: "xin chao",
    exampleSentence: "Hello, world",
    language: "EN",
    tags: ["seed"],
    difficulty: "medium",
    isFavorite: false
  };

  cards.set(seedCard.id, seedCard);

  schedules.set(seedCard.id, {
    cardId: seedCard.id,
    level: 1,
    intervalDays: 2,
    dueDate: toLocalDate(nowIso())
  });
}

export function resetStore(): void {
  cards.clear();
  schedules.clear();
  attempts.length = 0;
  sessions.clear();
  ensureSeedData();
}

export function listCards(filters: { language?: Language; tag?: string; difficulty?: Difficulty; dueOnly?: boolean; today?: string }): VocabularyCard[] {
  ensureSeedData();
  const today = filters.today ?? toLocalDate(nowIso());

  return Array.from(cards.values()).filter((card) => {
    if (filters.language && card.language !== filters.language) return false;
    if (filters.difficulty && card.difficulty !== filters.difficulty) return false;
    if (filters.tag) {
      const filterTag = filters.tag.toLowerCase();
      if (!card.tags.some((tag) => tag.toLowerCase() === filterTag)) return false;
    }
    if (filters.dueOnly) {
      const schedule = schedules.get(card.id);
      if (!schedule || schedule.dueDate > today) return false;
    }
    return true;
  });
}

export function createCard(payload: Partial<VocabularyCard>): VocabularyCard {
  const now = nowIso();
  const card: VocabularyCard = {
    id: generateId("card"),
    word: payload.word ?? "",
    pronunciation: payload.pronunciation ?? "",
    meaningVi: payload.meaningVi ?? "",
    exampleSentence: payload.exampleSentence ?? "",
    language: (payload.language as Language) ?? "EN",
    tags: (payload.tags ?? []).map(normalizeTag).filter(Boolean),
    difficulty: (payload.difficulty as Difficulty) ?? "medium",
    isFavorite: false
  };

  cards.set(card.id, card);
  schedules.set(card.id, {
    cardId: card.id,
    level: 0,
    intervalDays: 1,
    dueDate: toLocalDate(now)
  });

  return card;
}

export function updateCard(cardId: string, payload: Partial<VocabularyCard>): VocabularyCard | undefined {
  const current = cards.get(cardId);
  if (!current) return undefined;

  const updated: VocabularyCard = {
    ...current,
    ...payload,
    tags: payload.tags ? payload.tags.map(normalizeTag).filter(Boolean) : current.tags
  };

  cards.set(cardId, updated);
  return updated;
}

export function deleteCard(cardId: string): boolean {
  schedules.delete(cardId);
  return cards.delete(cardId);
}

export function setFavorite(cardId: string, isFavorite: boolean): boolean {
  const card = cards.get(cardId);
  if (!card) return false;
  cards.set(cardId, { ...card, isFavorite });
  return true;
}

export function startSession(mode: StudyMode = "flip", filters?: { language?: Language; tag?: string; difficulty?: Difficulty }, localDate?: string) {
  ensureSeedData();
  const today = localDate ?? toLocalDate(nowIso());

  const dueCards = listCards({ ...filters, dueOnly: true, today });
  const session: StudySession = {
    sessionId: generateId("session"),
    startedAt: nowIso(),
    workloadAtStart: dueCards.length,
    cards: dueCards,
    reviewedCount: 0
  };

  sessions.set(session.sessionId, session);

  return {
    sessionId: session.sessionId,
    startedAt: session.startedAt,
    workloadAtStart: session.workloadAtStart,
    cards: session.cards,
    mode
  };
}

export function answerSession(
  sessionId: string,
  payload: { cardId: string; mode: StudyMode; rating: ReviewRating; typedAnswer?: string },
  localDate?: string
) {
  ensureSeedData();
  const session = sessions.get(sessionId);
  const today = localDate ?? toLocalDate(nowIso());

  const current = schedules.get(payload.cardId) ?? {
    cardId: payload.cardId,
    level: 0,
    intervalDays: 1,
    dueDate: today
  };

  const next = nextSchedule(current, payload.rating, today);
  schedules.set(payload.cardId, next);

  attempts.push({
    id: generateId("attempt"),
    cardId: payload.cardId,
    sessionId,
    mode: payload.mode,
    rating: payload.rating,
    reviewedAt: nowIso()
  });

  const reviewedCount = (session?.reviewedCount ?? 0) + 1;
  if (session) {
    sessions.set(sessionId, { ...session, reviewedCount });
  }

  return {
    cardId: payload.cardId,
    nextDueDate: next.dueDate,
    level: next.level,
    intervalDays: next.intervalDays,
    sessionReviewedCount: reviewedCount
  };
}

export function dashboardToday(localDate?: string) {
  ensureSeedData();
  const today = localDate ?? toLocalDate(nowIso());
  const dueCards = Array.from(schedules.values()).filter((item) => item.dueDate <= today).length;

  const correct = attempts.filter((item) => item.rating === "good" || item.rating === "easy").length;
  const accuracy = attempts.length === 0 ? 0 : Number((correct / attempts.length).toFixed(4));
  const learned = Array.from(schedules.values()).filter((item) => item.level >= 4).length;

  const mistakeCardIds = new Set(
    attempts.filter((item) => item.rating === "again" || item.rating === "hard").map((item) => item.cardId)
  );

  const dates = Array.from(new Set(attempts.map((item) => toLocalDate(item.reviewedAt)))).sort();
  let streakDays = 0;
  for (let index = dates.length - 1; index >= 0; index -= 1) {
    const current = new Date(`${dates[index]}T00:00:00.000Z`);
    const previous = index > 0 ? new Date(`${dates[index - 1]}T00:00:00.000Z`) : undefined;

    if (streakDays === 0) {
      if (dates[index] === today) {
        streakDays = 1;
      }
      continue;
    }

    if (!previous) break;

    const dayDiff = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff === 1) {
      streakDays += 1;
    } else {
      break;
    }
  }

  return {
    todayDueCount: dueCards,
    streakDays,
    wordsLearned: learned,
    reviewAccuracy: accuracy,
    weakWordsCount: mistakeCardIds.size
  };
}

export function listFavorites(): VocabularyCard[] {
  ensureSeedData();
  return Array.from(cards.values()).filter((item) => item.isFavorite);
}

export function listMistakes(): VocabularyCard[] {
  ensureSeedData();
  const mistakes = new Set(
    attempts.filter((item) => item.rating === "again" || item.rating === "hard").map((item) => item.cardId)
  );

  return Array.from(cards.values()).filter((item) => mistakes.has(item.id));
}

export function importPackage(payload: { formatVersion?: string; payload?: { cards?: VocabularyCard[] } }) {
  ensureSeedData();

  const incoming = payload.payload?.cards ?? [];
  let importedRows = 0;
  const errors: { row: number; reason: string }[] = [];

  incoming.forEach((card, index) => {
    if (!card.word || !card.meaningVi || !card.pronunciation || !card.exampleSentence) {
      errors.push({ row: index + 1, reason: "Missing required fields" });
      return;
    }

    cards.set(card.id ?? generateId("card"), {
      ...card,
      id: card.id ?? generateId("card"),
      tags: (card.tags ?? []).map(normalizeTag).filter(Boolean),
      difficulty: card.difficulty ?? "medium",
      language: card.language ?? "EN",
      isFavorite: card.isFavorite ?? false
    });

    importedRows += 1;
  });

  return {
    totalRows: incoming.length,
    importedRows,
    failedRows: incoming.length - importedRows,
    errors
  };
}

export function exportPackage(format: "json" | "csv" = "json") {
  ensureSeedData();
  const cardList = Array.from(cards.values());
  const scheduleList = Array.from(schedules.values());

  return {
    format,
    formatVersion: "1.0.0",
    exportedAt: nowIso(),
    cards: cardList,
    schedules: scheduleList,
    reviewAttempts: attempts
  };
}

ensureSeedData();
