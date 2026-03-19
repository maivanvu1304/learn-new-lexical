import { useEffect, useState } from "react";
import type { Difficulty, Language } from "../../types/domain";
import type { CardInput } from "./cardService";

interface CardFormProps {
  initialValue?: CardInput;
  submitLabel: string;
  onSubmit: (input: CardInput) => void;
  onCancel?: () => void;
}

const EMPTY_FORM: CardInput = {
  word: "",
  pronunciation: "",
  meaningVi: "",
  exampleSentence: "",
  language: "EN",
  tags: [],
  difficulty: "medium"
};

function tagsToInput(tags: string[]): string {
  return tags.join(", ");
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function CardForm({ initialValue, submitLabel, onSubmit, onCancel }: CardFormProps) {
  const [form, setForm] = useState<CardInput>(initialValue ?? EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState(tagsToInput(initialValue?.tags ?? []));

  useEffect(() => {
    setForm(initialValue ?? EMPTY_FORM);
    setTagsInput(tagsToInput(initialValue?.tags ?? []));
  }, [initialValue]);

  return (
    <form
      className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ ...form, tags: parseTags(tagsInput) });
        if (!initialValue) {
          setForm(EMPTY_FORM);
          setTagsInput("");
        }
      }}
    >
      <div>
        <label htmlFor="card-word" className="text-sm font-medium text-slate-700">
          Word
        </label>
        <input
          id="card-word"
          value={form.word}
          onChange={(event) => setForm((current) => ({ ...current, word: event.target.value }))}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="card-pronunciation" className="text-sm font-medium text-slate-700">
          Pronunciation
        </label>
        <input
          id="card-pronunciation"
          value={form.pronunciation}
          onChange={(event) => setForm((current) => ({ ...current, pronunciation: event.target.value }))}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="card-meaning" className="text-sm font-medium text-slate-700">
          Meaning (Vietnamese)
        </label>
        <input
          id="card-meaning"
          value={form.meaningVi}
          onChange={(event) => setForm((current) => ({ ...current, meaningVi: event.target.value }))}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="card-example" className="text-sm font-medium text-slate-700">
          Example sentence
        </label>
        <textarea
          id="card-example"
          value={form.exampleSentence}
          onChange={(event) => setForm((current) => ({ ...current, exampleSentence: event.target.value }))}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="card-language" className="text-sm font-medium text-slate-700">
            Language
          </label>
          <select
            id="card-language"
            value={form.language}
            onChange={(event) =>
              setForm((current) => ({ ...current, language: event.target.value as Language }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="EN">English</option>
            <option value="ZH">Chinese</option>
          </select>
        </div>

        <div>
          <label htmlFor="card-difficulty" className="text-sm font-medium text-slate-700">
            Difficulty
          </label>
          <select
            id="card-difficulty"
            value={form.difficulty}
            onChange={(event) =>
              setForm((current) => ({ ...current, difficulty: event.target.value as Difficulty }))
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="card-tags" className="text-sm font-medium text-slate-700">
          Tags (comma separated)
        </label>
        <input
          id="card-tags"
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
