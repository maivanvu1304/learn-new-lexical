import type {
  ReviewAttempt,
  ReviewSchedule,
  StudySession,
  SyncMutation,
  VocabularyCard
} from "../../types/domain";

export interface LocalDbState {
  cards: Record<string, VocabularyCard>;
  schedules: Record<string, ReviewSchedule>;
  reviewAttempts: Record<string, ReviewAttempt>;
  studySessions: Record<string, StudySession>;
  outbox: Record<string, SyncMutation>;
}

const DB_KEY = "vocab-review-db-v1";

const initialState: LocalDbState = {
  cards: {},
  schedules: {},
  reviewAttempts: {},
  studySessions: {},
  outbox: {}
};

function withDefaults(state: Partial<LocalDbState>): LocalDbState {
  return {
    ...structuredClone(initialState),
    ...state
  };
}

export function loadDbState(): LocalDbState {
  const raw = globalThis.localStorage?.getItem(DB_KEY);
  if (!raw) return structuredClone(initialState);
  try {
    const parsed = JSON.parse(raw) as Partial<LocalDbState>;
    return withDefaults(parsed);
  } catch {
    return structuredClone(initialState);
  }
}

export function saveDbState(state: LocalDbState): void {
  globalThis.localStorage?.setItem(DB_KEY, JSON.stringify(withDefaults(state)));
}

export function overwriteDbState(state: Partial<LocalDbState>): void {
  saveDbState(withDefaults(state));
}

export function snapshotDbState(): LocalDbState {
  return loadDbState();
}

export function clearDbState(): void {
  globalThis.localStorage?.removeItem(DB_KEY);
}
