import type { ReviewRating, StudyMode } from "../../types/domain";
import { queueMutation } from "../../lib/sync/outboxRepository";

interface ReviewMutationPayload {
  sessionId: string;
  cardId: string;
  mode: StudyMode;
  rating: ReviewRating;
  typedAnswer?: string;
  reviewedAt: string;
}

function mutationId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function queueReviewAnswerMutation(payload: ReviewMutationPayload): void {
  queueMutation({
    mutationId: mutationId("review-answer"),
    entityType: "reviewAttempt",
    entityId: payload.cardId,
    operation: "upsert",
    payload,
    clientTimestamp: payload.reviewedAt,
    syncStatus: "pending"
  });
}

export function queueSessionStartMutation(sessionId: string, startedAt: string): void {
  queueMutation({
    mutationId: mutationId("review-session"),
    entityType: "studySession",
    entityId: sessionId,
    operation: "upsert",
    payload: { sessionId, startedAt },
    clientTimestamp: startedAt,
    syncStatus: "pending"
  });
}
