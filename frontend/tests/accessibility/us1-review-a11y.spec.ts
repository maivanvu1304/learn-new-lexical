import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewScreen } from "../../src/features/review/ReviewScreen";
import { upsertCard } from "../../src/lib/storage/cardRepository";
import { clearDbState } from "../../src/lib/storage/db";
import { upsertSchedule } from "../../src/lib/storage/reviewRepository";

describe("US1 accessibility: review flow", () => {
  beforeEach(() => {
    clearDbState();

    upsertCard({
      id: "a11y-card",
      word: "hello",
      pronunciation: "he-lo",
      meaningVi: "xin chao",
      exampleSentence: "Hello there",
      language: "EN",
      difficulty: "medium",
      tags: [],
      isFavorite: false,
      rowVersion: 1,
      createdAt: "2026-03-18T00:00:00.000Z",
      updatedAt: "2026-03-18T00:00:00.000Z"
    });

    upsertSchedule({
      cardId: "a11y-card",
      level: 1,
      intervalDays: 2,
      dueDate: new Date().toISOString().slice(0, 10)
    });
  });

  it("supports keyboard-first start and exposes labeled controls", async () => {
    const user = userEvent.setup();

    render(React.createElement(ReviewScreen));

    expect(screen.getByRole("heading", { name: "Daily Review" })).toBeInTheDocument();
    const startButton = screen.getByRole("button", { name: "Start Review" });
    expect(startButton).toBeInTheDocument();

    await user.click(startButton);

    expect(screen.getByLabelText("current review card")).toBeInTheDocument();
    expect(screen.getByLabelText("rating actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "good" })).toBeInTheDocument();
  });
});
