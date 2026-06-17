import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the onboarding entry point", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Shared Expense" })).toBeInTheDocument();
  });

  it("creates a shared expense and shows the monthly settlement suggestion", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.type(screen.getByLabelText("Ledger key"), "demo-ledger-key");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(await screen.findByRole("button", { name: "A" }));

    await user.click(await screen.findByRole("button", { name: "Add expense" }));
    await user.type(screen.getByLabelText("Amount"), "128");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-06-16");
    await user.type(screen.getByLabelText("Note"), "dinner");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("dinner")).toBeInTheDocument();
    expect(screen.getAllByText("¥128.00")[0]).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Stats" }));

    expect(screen.getByText("Monthly settlement suggestion")).toBeInTheDocument();
    expect(screen.getByText("B -> A ¥64.00")).toBeInTheDocument();
  });
});
