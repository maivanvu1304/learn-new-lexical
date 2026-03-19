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

test("/v1/cards supports create, update, list filters, and delete", async () => {
  await withServer(async (baseUrl) => {
    await fetch(`${baseUrl}/v1/test/reset`, { method: "POST" });

    const createResponse = await fetch(`${baseUrl}/v1/cards`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        word: "travel",
        pronunciation: "tra-vel",
        meaningVi: "du lich",
        exampleSentence: "Travel broadens the mind",
        language: "EN",
        tags: ["work", "IELTS"],
        difficulty: "hard"
      })
    });

    assert.equal(createResponse.status, 201);
    const created = (await createResponse.json()) as { id: string; word: string };
    assert.equal(created.word, "travel");

    const patchResponse = await fetch(`${baseUrl}/v1/cards/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ difficulty: "easy" })
    });

    assert.equal(patchResponse.status, 200);
    const patched = (await patchResponse.json()) as { difficulty: string };
    assert.equal(patched.difficulty, "easy");

    const filteredResponse = await fetch(`${baseUrl}/v1/cards?language=EN&tag=work&difficulty=easy`);
    assert.equal(filteredResponse.status, 200);
    const filtered = (await filteredResponse.json()) as { items: Array<{ id: string }> };
    assert.ok(filtered.items.some((item) => item.id === created.id));

    const deleteResponse = await fetch(`${baseUrl}/v1/cards/${created.id}`, { method: "DELETE" });
    assert.equal(deleteResponse.status, 204);
  });
});
