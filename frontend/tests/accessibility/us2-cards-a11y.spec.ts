import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardListPage } from "../../src/features/cards/CardListPage";
import { clearDbState } from "../../src/lib/storage/db";

describe("US2 accessibility: card form and filters", () => {
  beforeEach(() => {
    clearDbState();
  });

  it("exposes labeled inputs and allows filter interaction", async () => {
    const user = userEvent.setup();

    render(React.createElement(CardListPage));

    expect(screen.getByRole("heading", { name: "Vocabulary Cards" })).toBeInTheDocument();
    expect(screen.getByLabelText("Word")).toBeInTheDocument();
    expect(screen.getByLabelText("Language", { selector: "#card-language" })).toBeInTheDocument();
    expect(screen.getByLabelText("Difficulty", { selector: "#card-difficulty" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Word"), "travel");
    await user.type(screen.getByLabelText("Pronunciation"), "tra-vel");
    await user.type(screen.getByLabelText("Meaning (Vietnamese)"), "du lich");
    await user.type(screen.getByLabelText("Example sentence"), "Travel now");
    await user.type(screen.getByLabelText("Tags (comma separated)"), "work");

    await user.click(screen.getByRole("button", { name: "Create Card" }));

    expect(screen.getByText("travel")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Language", { selector: "#filter-language" }), "EN");
    await user.type(screen.getByLabelText("Tag"), "work");

    expect(screen.getByLabelText("card list")).toBeInTheDocument();
  });
});
