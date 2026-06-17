import type { MonthlySummary } from "../domain/balance";
import type { MonthKey } from "../domain/month";
import type { Expense, Ledger, SplitMode } from "../domain/types";

export interface BootstrapRequest {
  ledgerKey: string;
}

export interface BootstrapResponse {
  ledger: Ledger;
}

export interface ListMonthRequest {
  ledgerKey: string;
  monthKey: MonthKey;
}

export interface ListMonthResponse {
  expenses: Expense[];
  summary: MonthlySummary;
}

export interface CreateExpenseRequest {
  ledgerKey: string;
  amountCents: number;
  categoryId: string;
  spentOn: string;
  note: string;
  createdByMemberId: string;
  paidByMemberId: string;
  splitMode: SplitMode;
  customShares?: Record<string, number>;
  responsibleMemberId?: string;
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {
  id: string;
}

export interface DeleteExpenseRequest {
  ledgerKey: string;
  id: string;
}

export interface LedgerApi {
  bootstrap(request: BootstrapRequest): Promise<BootstrapResponse>;
  listMonth(request: ListMonthRequest): Promise<ListMonthResponse>;
  createExpense(request: CreateExpenseRequest): Promise<Expense>;
  updateExpense(request: UpdateExpenseRequest): Promise<Expense>;
  deleteExpense(request: DeleteExpenseRequest): Promise<void>;
}
