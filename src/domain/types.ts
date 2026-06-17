import type { MonthKey } from "./month";

export type MemberKey = "me" | "partner";
export type SplitMode = "equal" | "single" | "custom";
export type CategoryKey =
  | "dining"
  | "groceries_daily"
  | "rent_utilities"
  | "transport"
  | "entertainment"
  | "medical"
  | "travel"
  | "other";

export interface Ledger {
  id: string;
  name: string;
  members: Member[];
}

export interface Member {
  id: string;
  memberKey: MemberKey;
  displayName: string;
}

export interface Category {
  id: string;
  key: CategoryKey;
  label: string;
  sortOrder: number;
}

export interface ExpenseSplit {
  memberId: string;
  shareCents: number;
}

export interface Expense {
  id: string;
  ledgerId: string;
  amountCents: number;
  categoryId: string;
  spentOn: string;
  note: string;
  createdByMemberId: string;
  paidByMemberId: string;
  splitMode: SplitMode;
  splits: ExpenseSplit[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthQuery {
  ledgerKey: string;
  monthKey: MonthKey;
}
