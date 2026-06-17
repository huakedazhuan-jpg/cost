import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CATEGORIES } from "../domain/categories";
import type { Member } from "../domain/types";
import { ExpenseForm } from "./ExpenseForm";

const members: Member[] = [
  { id: "member-me", memberKey: "me", displayName: "A" },
  { id: "member-partner", memberKey: "partner", displayName: "B" },
];

describe("ExpenseForm", () => {
  it("submits a default equal split expense", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ExpenseForm
        categories={DEFAULT_CATEGORIES}
        members={members}
        selectedMemberId="member-me"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Amount"), "128.50");
    await user.selectOptions(screen.getByLabelText("Category"), "cat-dining");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-06-16");
    await user.type(screen.getByLabelText("Note"), "dinner");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        amountCents: 12850,
        categoryId: "cat-dining",
        spentOn: "2026-06-16",
        note: "dinner",
        createdByMemberId: "member-me",
        paidByMemberId: "member-me",
        splitMode: "equal",
      }),
    );
  });

  it("shows validation errors for invalid amount", async () => {
    const user = userEvent.setup();
    render(
      <ExpenseForm
        categories={DEFAULT_CATEGORIES}
        members={members}
        selectedMemberId="member-me"
        onSubmit={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Amount"), "0");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Amount must be greater than 0")).toBeInTheDocument();
  });

  it("submits custom split shares", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ExpenseForm
        categories={DEFAULT_CATEGORIES}
        members={members}
        selectedMemberId="member-me"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Amount"), "100");
    await user.selectOptions(screen.getByLabelText("Split mode"), "custom");
    await user.type(screen.getByLabelText("A share"), "30");
    await user.type(screen.getByLabelText("B share"), "70");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        amountCents: 10000,
        splitMode: "custom",
        customShares: {
          "member-me": 3000,
          "member-partner": 7000,
        },
      }),
    );
  });
});
