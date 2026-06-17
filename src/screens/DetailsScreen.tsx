import { ExpenseList } from "../components/ExpenseList";
import { MonthSelector } from "../components/MonthSelector";
import type { MonthKey } from "../domain/month";
import type { Expense } from "../domain/types";

export function DetailsScreen({
  expenses,
  monthKey,
  onMonthChange,
  onDeleteExpense,
}: {
  expenses: Expense[];
  monthKey: MonthKey;
  onMonthChange: (month: MonthKey) => void;
  onDeleteExpense: (expenseId: string) => void;
}) {
  return (
    <section className="screen">
      <h1>明细</h1>
      <MonthSelector value={monthKey} onChange={onMonthChange} />
      <ExpenseList expenses={expenses.filter((expense) => expense.spentOn.startsWith(monthKey))} onDelete={onDeleteExpense} />
    </section>
  );
}
