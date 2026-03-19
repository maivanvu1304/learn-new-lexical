import type { SyncMutation } from "../../types/domain";
import { loadDbState, saveDbState } from "../storage/db";

export function queueMutation(mutation: SyncMutation): SyncMutation {
  const state = loadDbState();
  state.outbox[mutation.mutationId] = mutation;
  saveDbState(state);
  return mutation;
}

export function listPendingMutations(): SyncMutation[] {
  return Object.values(loadDbState().outbox).filter((item) => item.syncStatus === "pending");
}

export function markMutationAcked(mutationId: string): void {
  const state = loadDbState();
  const mutation = state.outbox[mutationId];
  if (!mutation) return;
  mutation.syncStatus = "acked";
  state.outbox[mutationId] = mutation;
  saveDbState(state);
}

export function markMutationConflict(mutationId: string): void {
  const state = loadDbState();
  const mutation = state.outbox[mutationId];
  if (!mutation) return;
  mutation.syncStatus = "conflict";
  state.outbox[mutationId] = mutation;
  saveDbState(state);
}
