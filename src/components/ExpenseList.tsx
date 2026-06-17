import { formatCents } from "../domain/money";
import type { Expense } from "../domain/types";

export function ExpenseList({
  expenses,
  onDelete,
}: {
  expenses: Expense[];
  onDelete?: (expenseId: string) => void;
}) {
  if (expenses.length === 0) {
    return <p className="empty">本月暂无支出。</p>;
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <article className="expense-row" key={expense.id}>
          <div>
            <strong>{expense.note || "共同支出"}</strong>
            <span>{expense.spentOn}</span>
          </div>
          <div className="expense-row-actions">
            <strong>{formatCents(expense.amountCents)}</strong>
            {onDelete ? (
              <button type="button" onClick={() => onDelete(expense.id)}>
                删除
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
