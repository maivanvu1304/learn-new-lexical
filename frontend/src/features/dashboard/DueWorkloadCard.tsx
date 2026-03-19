import { todayDueCount } from "../review/reviewService";

interface DueWorkloadCardProps {
  onStartReview: () => void;
  localDate?: string;
}

export function DueWorkloadCard({ onStartReview, localDate }: DueWorkloadCardProps) {
  const dueCount = todayDueCount(localDate);

  return (
    <section aria-labelledby="due-workload-title" className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 id="due-workload-title" className="text-lg font-semibold">
        Today&apos;s Review Workload
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {dueCount === 0 ? "No cards due today." : `${dueCount} card${dueCount === 1 ? "" : "s"} due`}
      </p>
      <button
        type="button"
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        onClick={onStartReview}
      >
        Start Review
      </button>
    </section>
  );
}
