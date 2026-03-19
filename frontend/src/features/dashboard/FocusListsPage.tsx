import { getFavoriteCards, getMistakeCards } from "./progressService";

export function FocusListsPage() {
  const favorites = getFavoriteCards();
  const mistakes = getMistakeCards();

  return (
    <section aria-labelledby="focus-lists-title" className="space-y-4">
      <h1 id="focus-lists-title" className="text-2xl font-semibold">
        Focus Lists
      </h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border bg-white p-4 shadow-sm" aria-labelledby="favorites-title">
          <h2 id="favorites-title" className="text-lg font-semibold">
            Favorites
          </h2>
          <ul className="mt-3 space-y-2">
            {favorites.length === 0 && <li className="text-sm text-slate-500">No favorite cards yet.</li>}
            {favorites.map((card) => (
              <li key={card.id} className="text-sm">
                {card.word} - {card.meaningVi}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border bg-white p-4 shadow-sm" aria-labelledby="mistakes-title">
          <h2 id="mistakes-title" className="text-lg font-semibold">
            Mistakes
          </h2>
          <ul className="mt-3 space-y-2">
            {mistakes.length === 0 && <li className="text-sm text-slate-500">No mistake cards yet.</li>}
            {mistakes.map((card) => (
              <li key={card.id} className="text-sm">
                {card.word} - {card.meaningVi}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
