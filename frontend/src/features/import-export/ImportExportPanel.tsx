import { useState } from "react";
import { exportVocabularyPackage } from "./exportService";
import { importVocabularyPackage } from "./importService";

export function ImportExportPanel() {
  const [jsonInput, setJsonInput] = useState("");
  const [message, setMessage] = useState("Ready");
  const [lastExport, setLastExport] = useState("");

  return (
    <section aria-labelledby="import-export-title" className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
      <h2 id="import-export-title" className="text-lg font-semibold">
        Import / Export
      </h2>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          onClick={() => {
            const exported = exportVocabularyPackage("json");
            const json = JSON.stringify(exported, null, 2);
            setLastExport(json);
            setMessage("Exported JSON package");
          }}
        >
          Export JSON
        </button>

        <button
          type="button"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          onClick={() => {
            const exported = exportVocabularyPackage("csv");
            setLastExport(exported.csv ?? "");
            setMessage("Exported CSV data");
          }}
        >
          Export CSV
        </button>
      </div>

      <label className="block text-sm font-medium text-slate-700" htmlFor="import-json-input">
        Import JSON payload
      </label>
      <textarea
        id="import-json-input"
        value={jsonInput}
        onChange={(event) => setJsonInput(event.target.value)}
        className="h-36 w-full rounded-md border border-slate-300 p-3 font-mono text-xs"
        placeholder="Paste exported JSON package here"
      />

      <button
        type="button"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        onClick={() => {
          try {
            const parsed = JSON.parse(jsonInput);
            const report = importVocabularyPackage(parsed);
            setMessage(`Imported ${report.importedRows}/${report.totalRows} rows`);
          } catch {
            setMessage("Import failed: invalid JSON");
          }
        }}
      >
        Import
      </button>

      <p className="text-sm text-slate-600" aria-live="polite">
        {message}
      </p>

      {lastExport && (
        <pre className="max-h-52 overflow-auto rounded-md bg-slate-100 p-3 text-xs" aria-label="last export output">
          {lastExport}
        </pre>
      )}
    </section>
  );
}
