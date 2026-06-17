import { describe, expect, it } from "vitest";
import { calculateMonthlySummary } from "./balance";
import type { Expense, Member } from "./types";

const members: Member[] = [
  { id: "member-me", memberKey: "me", displayName: "A" },
  { id: "member-partner", memberKey: "partner", displayName: "B" },
];

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: "expense-1",
    ledgerId: "ledger-1",
    amountCents: 1000,
    categoryId: "cat-dining",
    spentOn: "2026-06-16",
    note: "",
    createdByMemberId: "member-me",
    paidByMemberId: "member-me",
    splitMode: "equal",
    splits: [
      { memberId: "member-me", shareCents: 500 },
      { memberId: "member-partner", shareCents: 500 },
    ],
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
    ...overrides,
  };
}

describe("calculateMonthlySummary", () => {
  it("calculates equal split settlement for one month", () => {
    const summary = calculateMonthlySummary({
      members,
      expenses: [expense({ amountCents: 1000 })],
      monthKey: "2026-06",
    });

    expect(summary.totalCents).toBe(1000);
    expect(summary.expenseCount).toBe(1);
    expect(summary.members["member-me"]).toMatchObject({ paidCents: 1000, owedCents: 500, netCents: 500 });
    expect(summary.members["member-partner"]).toMatchObject({ paidCents: 0, owedCents: 500, netCents: -500 });
    expect(summary.settlement).toEqual({
      fromMemberId: "member-partner",
      toMemberId: "member-me",
      amountCents: 500,
    });
  });

  it("does not carry balances across months", () => {
    const summary = calculateMonthlySummary({
      members,
      expenses: [
        expense({ id: "june", spentOn: "2026-06-30", amountCents: 1000 }),
        expense({ id: "july", spentOn: "2026-07-01", amountCents: 2000 }),
      ],
      monthKey: "2026-07",
    });

    expect(summary.totalCents).toBe(2000);
    expect(summary.expenseCount).toBe(1);
  });

  it("supports one-person responsibility", () => {
    const summary = calculateMonthlySummary({
      members,
      expenses: [
        expense({
          splitMode: "single",
          splits: [
            { memberId: "member-me", shareCents: 1000 },
            { memberId: "member-partner", shareCents: 0 },
          ],
        }),
      ],
      monthKey: "2026-06",
    });

    expect(summary.settlement).toBeUndefined();
  });

  it("supports custom split rows", () => {
    const summary = calculateMonthlySummary({
      members,
      expenses: [
        expense({
          amountCents: 1000,
          paidByMemberId: "member-partner",
          splitMode: "custom",
          splits: [
            { memberId: "member-me", shareCents: 300 },
            { memberId: "member-partner", shareCents: 700 },
          ],
        }),
      ],
      monthKey: "2026-06",
    });

    expect(summary.settlement).toEqual({
      fromMemberId: "member-me",
      toMemberId: "member-partner",
      amountCents: 300,
    });
  });
});
