import { render, screen } from "@testing-library/react";
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
});
