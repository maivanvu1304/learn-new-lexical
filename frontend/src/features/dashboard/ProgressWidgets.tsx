import { getDashboardProgress } from "./progressService";

interface ProgressWidgetsProps {
  localDate?: string;
}

export function ProgressWidgets({ localDate }: ProgressWidgetsProps) {
  const metrics = getDashboardProgress(localDate);

  return (
    <section aria-labelledby="progress-widgets-title" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <h2 id="progress-widgets-title" className="sr-only">
        Progress widgets
      </h2>

      <article className="rounded-xl border bg-white p-3 shadow-sm" aria-label="today due cards">
        <p className="text-xs uppercase text-slate-500">Due Today</p>
        <p className="text-xl font-semibold">{metrics.todayDueCount}</p>
      </article>

      <article className="rounded-xl border bg-white p-3 shadow-sm" aria-label="current streak">
        <p className="text-xs uppercase text-slate-500">Streak</p>
        <p className="text-xl font-semibold">{metrics.streakDays}</p>
      </article>

      <article className="rounded-xl border bg-white p-3 shadow-sm" aria-label="words learned">
        <p className="text-xs uppercase text-slate-500">Words Learned</p>
        <p className="text-xl font-semibold">{metrics.wordsLearned}</p>
      </article>

      <article className="rounded-xl border bg-white p-3 shadow-sm" aria-label="review accuracy">
        <p className="text-xs uppercase text-slate-500">Accuracy</p>
        <p className="text-xl font-semibold">{Math.round(metrics.reviewAccuracy * 100)}%</p>
      </article>

      <article className="rounded-xl border bg-white p-3 shadow-sm" aria-label="weak words">
        <p className="text-xs uppercase text-slate-500">Weak Words</p>
        <p className="text-xl font-semibold">{metrics.weakWordsCount}</p>
      </article>
    </section>
  );
}
