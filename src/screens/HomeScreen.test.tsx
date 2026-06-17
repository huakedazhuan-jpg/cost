import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Expense, Member } from "../domain/types";
import { HomeScreen } from "./HomeScreen";

const members: Member[] = [
  { id: "member-me", memberKey: "me", displayName: "A" },
  { id: "member-partner", memberKey: "partner", displayName: "B" },
];

const expenses: Expense[] = [
  {
    id: "expense-1",
    ledgerId: "ledger-demo",
    amountCents: 12800,
    categoryId: "cat-dining",
    spentOn: "2026-06-16",
    note: "dinner",
    createdByMemberId: "member-me",
    paidByMemberId: "member-me",
    splitMode: "equal",
    splits: [
      { memberId: "member-me", shareCents: 6400 },
      { memberId: "member-partner", shareCents: 6400 },
    ],
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
  },
];

describe("HomeScreen", () => {
  it("shows current month total and recent expenses", () => {
    render(<HomeScreen members={members} expenses={expenses} monthKey="2026-06" onAddExpense={() => undefined} />);
    expect(screen.getAllByText("¥128.00")[0]).toBeInTheDocument();
    expect(screen.getByText("1 record")).toBeInTheDocument();
    expect(screen.getByText("dinner")).toBeInTheDocument();
  });
});
