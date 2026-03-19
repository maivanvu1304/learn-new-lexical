import express from "express";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { syncRouter } from "./syncRoutes.ts";
import {
  answerSession,
  createCard,
  dashboardToday,
  deleteCard,
  exportPackage,
  importPackage,
  listCards,
  listFavorites,
  listMistakes,
  resetStore,
  setFavorite,
  startSession,
  updateCard
} from "./memoryStore.ts";

const app = express();
app.use(express.json());

app.use("/v1", syncRouter);

app.get("/v1/cards", (req, res) => {
  const items = listCards({
    language: typeof req.query.language === "string" ? (req.query.language as "EN" | "ZH") : undefined,
    tag: typeof req.query.tag === "string" ? req.query.tag : undefined,
    difficulty:
      typeof req.query.difficulty === "string"
        ? (req.query.difficulty as "easy" | "medium" | "hard")
        : undefined,
    dueOnly: req.query.dueOnly === "true"
  });

  res.status(200).json({ items });
});

app.post("/v1/cards", (req, res) => {
  const card = createCard(req.body ?? {});
  res.status(201).json(card);
});

app.patch("/v1/cards/:cardId", (req, res) => {
  const card = updateCard(req.params.cardId, req.body ?? {});
  if (!card) {
    res.status(404).json({ message: "Card not found" });
    return;
  }

  res.status(200).json(card);
});

app.delete("/v1/cards/:cardId", (req, res) => {
  const removed = deleteCard(req.params.cardId);
  if (!removed) {
    res.status(404).json({ message: "Card not found" });
    return;
  }

  res.status(204).send();
});

app.post("/v1/cards/:cardId/favorite", (req, res) => {
  const ok = setFavorite(req.params.cardId, true);
  if (!ok) {
    res.status(404).json({ message: "Card not found" });
    return;
  }

  res.status(204).send();
});

app.delete("/v1/cards/:cardId/favorite", (req, res) => {
  const ok = setFavorite(req.params.cardId, false);
  if (!ok) {
    res.status(404).json({ message: "Card not found" });
    return;
  }

  res.status(204).send();
});

app.post("/v1/reviews/sessions", (req, res) => {
  const session = startSession(req.body?.mode, req.body?.filters);
  res.status(201).json(session);
});

app.post("/v1/reviews/sessions/:sessionId/answers", (req, res) => {
  const result = answerSession(req.params.sessionId, req.body ?? {});
  res.status(200).json(result);
});

app.get("/v1/dashboard/today", (_req, res) => {
  res.status(200).json(dashboardToday());
});

app.get("/v1/lists/favorites", (_req, res) => {
  res.status(200).json({ items: listFavorites() });
});

app.get("/v1/lists/mistakes", (_req, res) => {
  res.status(200).json({ items: listMistakes() });
});

app.post("/v1/import", (req, res) => {
  res.status(200).json(importPackage(req.body ?? {}));
});

app.get("/v1/export", (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";
  res.status(200).json(exportPackage(format));
});

app.post("/v1/test/reset", (_req, res) => {
  resetStore();
  res.status(204).send();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const port = Number(process.env.PORT ?? 4000);
const runningDirectly =
  process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (runningDirectly && process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

export { app };

