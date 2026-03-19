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
  difficulty: Difficulty;
  tags: string[];
  isFavorite: boolean;
  rowVersion: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ReviewSchedule {
  cardId: string;
  level: number;
  intervalDays: number;
  dueDate: string;
  lastReviewedAt?: string;
}

export interface ReviewAttempt {
  id: string;
  cardId: string;
  sessionId: string;
  mode: StudyMode;
  rating: ReviewRating;
  isCorrect: boolean;
  typedAnswer?: string;
  reviewedAt: string;
}

export interface StudySession {
  id: string;
  startedAt: string;
  endedAt?: string;
  reviewedCount: number;
  correctCount: number;
  workloadAtStart: number;
}

export interface DailyStudyRecord {
  studyDate: string;
  completedReviewCount: number;
}

export interface SyncMutation {
  mutationId: string;
  entityType: string;
  entityId: string;
  operation: "upsert" | "delete";
  baseVersion?: number;
  payload: unknown;
  clientTimestamp: string;
  syncStatus: "pending" | "acked" | "conflict";
}
