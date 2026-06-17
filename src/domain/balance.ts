import { isDateInMonth, type MonthKey } from "./month";
import type { Expense, Member } from "./types";

export interface MemberBalance {
  memberId: string;
  paidCents: number;
  owedCents: number;
  netCents: number;
}

export interface SettlementSuggestion {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
}

export interface MonthlySummary {
  monthKey: MonthKey;
  totalCents: number;
  expenseCount: number;
  categoryTotals: Record<string, number>;
  members: Record<string, MemberBalance>;
  settlement?: SettlementSuggestion;
}

export function calculateMonthlySummary(input: {
  members: Member[];
  expenses: Expense[];
  monthKey: MonthKey;
}): MonthlySummary {
  const monthlyExpenses = input.expenses.filter((expense) => isDateInMonth(expense.spentOn, input.monthKey));
  const balances: Record<string, MemberBalance> = {};
  const categoryTotals: Record<string, number> = {};

  for (const member of input.members) {
    balances[member.id] = {
      memberId: member.id,
      paidCents: 0,
      owedCents: 0,
      netCents: 0,
    };
  }

  for (const expense of monthlyExpenses) {
    categoryTotals[expense.categoryId] = (categoryTotals[expense.categoryId] ?? 0) + expense.amountCents;
    balances[expense.paidByMemberId].paidCents += expense.amountCents;

    for (const split of expense.splits) {
      balances[split.memberId].owedCents += split.shareCents;
    }
  }

  for (const balance of Object.values(balances)) {
    balance.netCents = balance.paidCents - balance.owedCents;
  }

  return {
    monthKey: input.monthKey,
    totalCents: monthlyExpenses.reduce((sum, expense) => sum + expense.amountCents, 0),
    expenseCount: monthlyExpenses.length,
    categoryTotals,
    members: balances,
    settlement: getSettlementSuggestion(Object.values(balances)),
  };
}

function getSettlementSuggestion(balances: MemberBalance[]): SettlementSuggestion | undefined {
  const creditor = balances.find((balance) => balance.netCents > 0);
  const debtor = balances.find((balance) => balance.netCents < 0);

  if (!creditor || !debtor) {
    return undefined;
  }

  return {
    fromMemberId: debtor.memberId,
    toMemberId: creditor.memberId,
    amountCents: Math.min(Math.abs(debtor.netCents), creditor.netCents),
  };
}
