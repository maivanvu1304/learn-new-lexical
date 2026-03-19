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

test("POST /v1/reviews/sessions returns session payload", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/reviews/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "flip" })
    });

    assert.equal(response.status, 201);
    const payload = (await response.json()) as {
      sessionId: string;
      startedAt: string;
      workloadAtStart: number;
      cards: unknown[];
    };

    assert.equal(typeof payload.sessionId, "string");
    assert.equal(typeof payload.startedAt, "string");
    assert.equal(typeof payload.workloadAtStart, "number");
    assert.ok(Array.isArray(payload.cards));
  });
});

test("POST /v1/reviews/sessions/{sessionId}/answers returns schedule update", async () => {
  await withServer(async (baseUrl) => {
    const startResponse = await fetch(`${baseUrl}/v1/reviews/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "flip" })
    });

    const session = (await startResponse.json()) as { sessionId: string };

    const answerResponse = await fetch(
      `${baseUrl}/v1/reviews/sessions/${session.sessionId}/answers`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cardId: "card-seed-1",
          mode: "flip",
          rating: "good"
        })
      }
    );

    assert.equal(answerResponse.status, 200);

    const payload = (await answerResponse.json()) as {
      cardId: string;
      nextDueDate: string;
      level: number;
      intervalDays: number;
      sessionReviewedCount: number;
    };

    assert.equal(payload.cardId, "card-seed-1");
    assert.equal(typeof payload.nextDueDate, "string");
    assert.equal(typeof payload.level, "number");
    assert.equal(typeof payload.intervalDays, "number");
    assert.equal(typeof payload.sessionReviewedCount, "number");
  });
});
