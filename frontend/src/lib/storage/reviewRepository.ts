import type { ReviewAttempt, ReviewSchedule, StudySession } from "../../types/domain";
import { loadDbState, saveDbState } from "./db";

export function upsertSchedule(schedule: ReviewSchedule): ReviewSchedule {
  const state = loadDbState();
  state.schedules[schedule.cardId] = schedule;
  saveDbState(state);
  return schedule;
}

export function getSchedule(cardId: string): ReviewSchedule | undefined {
  return loadDbState().schedules[cardId];
}

export function listSchedules(): ReviewSchedule[] {
  return Object.values(loadDbState().schedules);
}

export function listDueSchedules(date: string): ReviewSchedule[] {
  return listSchedules().filter((schedule) => schedule.dueDate <= date);
}

export function addReviewAttempt(attempt: ReviewAttempt): ReviewAttempt {
  const state = loadDbState();
  state.reviewAttempts[attempt.id] = attempt;
  saveDbState(state);
  return attempt;
}

export function listReviewAttempts(): ReviewAttempt[] {
  return Object.values(loadDbState().reviewAttempts);
}

export function createStudySession(session: StudySession): StudySession {
  const state = loadDbState();
  state.studySessions[session.id] = session;
  saveDbState(state);
  return session;
}

export function getStudySession(sessionId: string): StudySession | undefined {
  return loadDbState().studySessions[sessionId];
}

export function updateStudySession(session: StudySession): StudySession {
  const state = loadDbState();
  state.studySessions[session.id] = session;
  saveDbState(state);
  return session;
}

export function listStudySessions(): StudySession[] {
  return Object.values(loadDbState().studySessions);
}

export function listAttemptsByCard(cardId: string): ReviewAttempt[] {
  return listReviewAttempts().filter((attempt) => attempt.cardId === cardId);
}
