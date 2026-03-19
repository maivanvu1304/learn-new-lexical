import { useMemo, useState } from "react";
import type { ReviewRating, StudyMode } from "../../types/domain";
import { useReviewSession } from "./useReviewSession";

const MODES: Array<{ id: StudyMode; label: string }> = [
  { id: "flip", label: "Flip Cards" },
  { id: "quiz", label: "Multiple Choice" },
  { id: "typing", label: "Typing Practice" }
];

function normalizeInput(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function RatingButtons({ onRate }: { onRate: (rating: ReviewRating) => void }) {
  const ratings: ReviewRating[] = ["again", "hard", "good", "easy"];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="rating actions">
      {ratings.map((rating) => (
        <button
          key={rating}
          type="button"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium capitalize hover:bg-slate-100"
          onClick={() => onRate(rating)}
        >
          {rating}
        </button>
      ))}
    </div>
  );
}

export function ReviewScreen() {
  const { state, start, submit, reset, currentCard } = useReviewSession();
  const [selectedMode, setSelectedMode] = useState<StudyMode>("flip");
  const [typedAnswer, setTypedAnswer] = useState("");

  const quizOptions = useMemo(() => {
    if (!currentCard) return [];

    const distractors = state.cards
      .filter((card) => card.id !== currentCard.id)
      .map((card) => card.meaningVi)
      .slice(0, 3);

    return [currentCard.meaningVi, ...distractors].slice(0, 4);
  }, [currentCard, state.cards]);

  return (
    <section aria-labelledby="review-title" className="space-y-4">
      <h1 id="review-title" className="text-2xl font-semibold">
        Daily Review
      </h1>

      {state.status === "idle" && (
        <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Choose study mode and begin today&apos;s review.</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="study mode">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                role="radio"
                aria-checked={selectedMode === mode.id}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  selectedMode === mode.id
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            onClick={() => start(selectedMode)}
          >
            Start Review
          </button>
        </div>
      )}

      {state.status === "in-progress" && currentCard && (
        <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">
            Card {state.currentIndex + 1} / {state.cards.length}
          </p>

          <article className="space-y-2 rounded-lg border border-slate-200 p-4" aria-label="current review card">
            <h2 className="text-xl font-semibold">{currentCard.word}</h2>
            <p className="text-sm text-slate-600">{currentCard.pronunciation}</p>
            {(state.mode === "flip" || state.mode === "quiz") && (
              <p className="text-base text-slate-800">{currentCard.meaningVi}</p>
            )}
            <p className="text-sm text-slate-500">{currentCard.exampleSentence}</p>
          </article>

          {state.mode === "flip" && <RatingButtons onRate={(rating) => submit(rating)} />}

          {state.mode === "quiz" && (
            <div className="grid gap-2">
              {quizOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-100"
                  onClick={() => submit(option === currentCard.meaningVi ? "good" : "again")}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {state.mode === "typing" && (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                const isCorrect = normalizeInput(typedAnswer) === normalizeInput(currentCard.word);
                submit(isCorrect ? "good" : "again", typedAnswer);
                setTypedAnswer("");
              }}
            >
              <label className="block text-sm font-medium text-slate-700" htmlFor="typing-answer">
                Type the word
              </label>
              <input
                id="typing-answer"
                value={typedAnswer}
                onChange={(event) => setTypedAnswer(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                autoComplete="off"
              />
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Check Answer
              </button>
            </form>
          )}
        </div>
      )}

      {state.status === "complete" && (
        <div className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
          <p className="font-medium">Session complete.</p>
          <p className="text-sm text-slate-600">
            Reviewed: {state.reviewedCount} / Correct: {state.correctCount}
          </p>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
            onClick={reset}
          >
            Start Another Session
          </button>
        </div>
      )}
    </section>
  );
}
