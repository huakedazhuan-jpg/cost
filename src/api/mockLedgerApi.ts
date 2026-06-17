import { calculateMonthlySummary } from "../domain/balance";
import { DEFAULT_CATEGORIES } from "../domain/categories";
import { buildCustomSplits, buildEqualSplits, buildSingleMemberSplit } from "../domain/splits";
import type { Expense, Ledger } from "../domain/types";
import type { CreateExpenseRequest, LedgerApi, UpdateExpenseRequest } from "./ledgerApi";

const MOCK_LEDGER_KEY = "demo-ledger-key";

const ledger: Ledger = {
  id: "ledger-demo",
  name: "共同账本",
  members: [
    { id: "member-me", memberKey: "me", displayName: "A" },
    { id: "member-partner", memberKey: "partner", displayName: "B" },
  ],
};

export function createMockLedgerApi(initialExpenses: Expense[] = []): LedgerApi {
  let expenses = [...initialExpenses];

  function assertKey(ledgerKey: string): void {
    if (ledgerKey.trim() !== MOCK_LEDGER_KEY) {
      throw new Error("ledger not found or key incorrect");
    }
  }

  function buildExpense(request: CreateExpenseRequest | UpdateExpenseRequest, existingId?: string): Expense {
    const now = new Date().toISOString();
    return {
      id: existingId ?? `expense-${crypto.randomUUID()}`,
      ledgerId: ledger.id,
      amountCents: request.amountCents,
      categoryId: request.categoryId,
      spentOn: request.spentOn,
      note: request.note,
      createdByMemberId: request.createdByMemberId,
      paidByMemberId: request.paidByMemberId,
      splitMode: request.splitMode,
      splits:
        request.splitMode === "single"
          ? buildSingleMemberSplit(request.amountCents, ledger.members, request.responsibleMemberId ?? request.paidByMemberId)
          : request.splitMode === "custom"
            ? buildCustomSplits(request.amountCents, ledger.members, request.customShares ?? {})
            : buildEqualSplits(request.amountCents, ledger.members),
      createdAt: now,
      updatedAt: now,
    };
  }

  return {
    async bootstrap(request) {
      assertKey(request.ledgerKey);
      return { ledger };
    },
    async listMonth(request) {
      assertKey(request.ledgerKey);
      return {
        expenses: expenses.filter((expense) => expense.spentOn.startsWith(request.monthKey)),
        summary: calculateMonthlySummary({ members: ledger.members, expenses, monthKey: request.monthKey }),
      };
    },
    async createExpense(request) {
      assertKey(request.ledgerKey);
      const expense = buildExpense(request);
      expenses = [expense, ...expenses];
      return expense;
    },
    async updateExpense(request) {
      assertKey(request.ledgerKey);
      const previous = expenses.find((expense) => expense.id === request.id);
      if (!previous) {
        throw new Error("expense not found");
      }
      const updated = { ...buildExpense(request, request.id), createdAt: previous.createdAt };
      expenses = expenses.map((expense) => (expense.id === request.id ? updated : expense));
      return updated;
    },
    async deleteExpense(request) {
      assertKey(request.ledgerKey);
      expenses = expenses.filter((expense) => expense.id !== request.id);
    },
  };
}

export { DEFAULT_CATEGORIES };
