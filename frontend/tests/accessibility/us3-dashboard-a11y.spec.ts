import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../src/app/routes";
import { clearDbState } from "../../src/lib/storage/db";

describe("US3 accessibility: dashboard and import/export", () => {
  beforeEach(() => {
    clearDbState();
  });

  it("renders accessible dashboard widgets and import/export controls", async () => {
    const user = userEvent.setup();

    render(React.createElement(MemoryRouter, undefined, React.createElement(AppRoutes)));

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByLabelText("today due cards")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export JSON" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
    expect(screen.getByLabelText("Import JSON payload")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Export JSON" }));

    expect(screen.getByLabelText("last export output")).toBeInTheDocument();
    expect(screen.getByText("Exported JSON package")).toBeInTheDocument();

    const main = screen.getByRole("main");
    expect(main.className).toContain("max-w-4xl");
  });
});
