import { ExpenseList } from "../components/ExpenseList";
import { calculateMonthlySummary } from "../domain/balance";
import { formatCents } from "../domain/money";
import type { MonthKey } from "../domain/month";
import type { Expense, Member } from "../domain/types";

export function HomeScreen({
  members,
  expenses,
  monthKey,
  onAddExpense,
}: {
  members: Member[];
  expenses: Expense[];
  monthKey: MonthKey;
  onAddExpense: () => void;
}) {
  const summary = calculateMonthlySummary({ members, expenses, monthKey });
  const recent = expenses.filter((expense) => expense.spentOn.startsWith(monthKey)).slice(0, 5);

  return (
    <section className="screen">
      <header className="screen-header">
        <h1>Shared Ledger</h1>
        <span>{monthKey}</span>
      </header>
      <div className="metric-card">
        <span>This month</span>
        <strong>{formatCents(summary.totalCents)}</strong>
        <small>
          {summary.expenseCount} record{summary.expenseCount === 1 ? "" : "s"}
        </small>
      </div>
      <button className="primary-button" type="button" onClick={onAddExpense}>
        Add expense
      </button>
      <h2>Recent</h2>
      <ExpenseList expenses={recent} />
    </section>
  );
}
