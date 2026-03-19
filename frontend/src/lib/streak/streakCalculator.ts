export interface StreakState {
  currentStreak: number;
  lastStudyDate: string;
}

function dayDiff(previous: string, current: string): number {
  const prev = new Date(`${previous}T00:00:00.000Z`).getTime();
  const now = new Date(`${current}T00:00:00.000Z`).getTime();
  return Math.round((now - prev) / (1000 * 60 * 60 * 24));
}

export function updateStreak(
  state: StreakState | undefined,
  localDate: string
): StreakState {
  if (!state) {
    return { currentStreak: 1, lastStudyDate: localDate };
  }

  const diff = dayDiff(state.lastStudyDate, localDate);

  if (diff <= 0) {
    return { ...state, lastStudyDate: localDate };
  }

  if (diff === 1) {
    return {
      currentStreak: state.currentStreak + 1,
      lastStudyDate: localDate
    };
  }

  return { currentStreak: 1, lastStudyDate: localDate };
}
