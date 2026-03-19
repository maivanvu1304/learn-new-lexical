import { useCallback, useMemo, useState } from "react";
import type { ReviewRating, StudyMode, VocabularyCard } from "../../types/domain";
import {
  type ActiveReviewSession,
  type ReviewFilters,
  startReviewSession,
  submitReviewAnswer
} from "./reviewService";
import { queueReviewAnswerMutation, queueSessionStartMutation } from "./offlineReviewSync";

export interface ReviewSessionState {
  status: "idle" | "in-progress" | "complete";
  mode: StudyMode;
  sessionId?: string;
  cards: VocabularyCard[];
  currentIndex: number;
  reviewedCount: number;
  correctCount: number;
}

const initialState: ReviewSessionState = {
  status: "idle",
  mode: "flip",
  cards: [],
  currentIndex: 0,
  reviewedCount: 0,
  correctCount: 0
};

function toState(session: ActiveReviewSession): ReviewSessionState {
  return {
    status: session.workloadAtStart === 0 ? "complete" : "in-progress",
    mode: session.mode,
    sessionId: session.sessionId,
    cards: session.cards,
    currentIndex: 0,
    reviewedCount: 0,
    correctCount: 0
  };
}

export function useReviewSession() {
  const [state, setState] = useState<ReviewSessionState>(initialState);

  const start = useCallback((mode: StudyMode, filters?: ReviewFilters) => {
    const session = startReviewSession({ mode, filters });
    queueSessionStartMutation(session.sessionId, session.startedAt);
    setState(toState(session));
  }, []);

  const submit = useCallback(
    (rating: ReviewRating, typedAnswer?: string) => {
      setState((current) => {
        if (current.status !== "in-progress") return current;
        const card = current.cards[current.currentIndex];
        if (!card || !current.sessionId) return current;

        submitReviewAnswer({
          sessionId: current.sessionId,
          cardId: card.id,
          mode: current.mode,
          rating,
          typedAnswer
        });

        const reviewedAt = new Date().toISOString();
        queueReviewAnswerMutation({
          sessionId: current.sessionId,
          cardId: card.id,
          mode: current.mode,
          rating,
          typedAnswer,
          reviewedAt
        });

        const nextIndex = current.currentIndex + 1;
        const isCorrect = rating === "good" || rating === "easy";
        const reviewedCount = current.reviewedCount + 1;
        const correctCount = current.correctCount + (isCorrect ? 1 : 0);

        return {
          ...current,
          reviewedCount,
          correctCount,
          currentIndex: nextIndex,
          status: nextIndex >= current.cards.length ? "complete" : "in-progress"
        };
      });
    },
    []
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const currentCard = useMemo(() => {
    if (state.status !== "in-progress") return undefined;
    return state.cards[state.currentIndex];
  }, [state.cards, state.currentIndex, state.status]);

  return {
    state,
    start,
    submit,
    reset,
    currentCard
  };
}

