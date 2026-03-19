import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { app } from "../../src/api/index";

async function withServer(run: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const { port } = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

test("dashboard and portability endpoints return contract-shaped responses", async () => {
  await withServer(async (baseUrl) => {
    await fetch(`${baseUrl}/v1/test/reset`, { method: "POST" });

    const cardResponse = await fetch(`${baseUrl}/v1/cards`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        word: "focus",
        pronunciation: "fo-kus",
        meaningVi: "tap trung",
        exampleSentence: "Focus today",
        language: "EN",
        tags: ["work"],
        difficulty: "medium"
      })
    });

    const card = (await cardResponse.json()) as { id: string };

    await fetch(`${baseUrl}/v1/cards/${card.id}/favorite`, { method: "POST" });

    const dashboardResponse = await fetch(`${baseUrl}/v1/dashboard/today`);
    assert.equal(dashboardResponse.status, 200);
    const dashboard = (await dashboardResponse.json()) as {
      todayDueCount: number;
      streakDays: number;
      wordsLearned: number;
      reviewAccuracy: number;
      weakWordsCount: number;
    };

    assert.equal(typeof dashboard.todayDueCount, "number");
    assert.equal(typeof dashboard.streakDays, "number");
    assert.equal(typeof dashboard.wordsLearned, "number");
    assert.equal(typeof dashboard.reviewAccuracy, "number");
    assert.equal(typeof dashboard.weakWordsCount, "number");

    const favoritesResponse = await fetch(`${baseUrl}/v1/lists/favorites`);
    assert.equal(favoritesResponse.status, 200);
    const favorites = (await favoritesResponse.json()) as { items: Array<{ id: string }> };
    assert.ok(favorites.items.some((item) => item.id === card.id));

    const mistakesResponse = await fetch(`${baseUrl}/v1/lists/mistakes`);
    assert.equal(mistakesResponse.status, 200);
    const mistakes = (await mistakesResponse.json()) as { items: unknown[] };
    assert.ok(Array.isArray(mistakes.items));

    const exportResponse = await fetch(`${baseUrl}/v1/export?format=json`);
    assert.equal(exportResponse.status, 200);
    const exported = (await exportResponse.json()) as { formatVersion: string; cards: unknown[] };
    assert.equal(typeof exported.formatVersion, "string");
    assert.ok(Array.isArray(exported.cards));

    const importResponse = await fetch(`${baseUrl}/v1/import`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ formatVersion: "1.0.0", payload: { cards: exported.cards } })
    });

    assert.equal(importResponse.status, 200);
    const imported = (await importResponse.json()) as { totalRows: number; importedRows: number; failedRows: number };
    assert.equal(typeof imported.totalRows, "number");
    assert.equal(typeof imported.importedRows, "number");
    assert.equal(typeof imported.failedRows, "number");
  });
});
