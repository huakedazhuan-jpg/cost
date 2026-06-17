import { describe, expect, it } from "vitest";
import { createMockLedgerApi } from "./mockLedgerApi";

describe("mockLedgerApi", () => {
  it("rejects an empty ledger key", async () => {
    const api = createMockLedgerApi();
    await expect(api.bootstrap({ ledgerKey: "" })).rejects.toThrow("ledger not found or key incorrect");
  });

  it("creates an equal split expense with creator as payer", async () => {
    const api = createMockLedgerApi();
    const bootstrap = await api.bootstrap({ ledgerKey: "demo-ledger-key" });
    const member = bootstrap.ledger.members[0];

    const created = await api.createExpense({
      ledgerKey: "demo-ledger-key",
      amountCents: 1000,
      categoryId: "cat-dining",
      spentOn: "2026-06-16",
      note: "dinner",
      createdByMemberId: member.id,
      paidByMemberId: member.id,
      splitMode: "equal",
    });

    expect(created.paidByMemberId).toBe(member.id);
    expect(created.splits).toEqual([
      { memberId: "member-me", shareCents: 500 },
      { memberId: "member-partner", shareCents: 500 },
    ]);
  });

  it("lists expenses by month", async () => {
    const api = createMockLedgerApi();
    const bootstrap = await api.bootstrap({ ledgerKey: "demo-ledger-key" });
    await api.createExpense({
      ledgerKey: "demo-ledger-key",
      amountCents: 1000,
      categoryId: "cat-dining",
      spentOn: "2026-06-16",
      note: "",
      createdByMemberId: bootstrap.ledger.members[0].id,
      paidByMemberId: bootstrap.ledger.members[0].id,
      splitMode: "equal",
    });

    const month = await api.listMonth({ ledgerKey: "demo-ledger-key", monthKey: "2026-06" });
    expect(month.expenses).toHaveLength(1);
    expect(month.summary.totalCents).toBe(1000);
  });
});
