import { MonthSelector } from "../components/MonthSelector";
import { calculateMonthlySummary } from "../domain/balance";
import { formatCents } from "../domain/money";
import type { MonthKey } from "../domain/month";
import type { Expense, Member } from "../domain/types";

export function StatisticsScreen({
  members,
  expenses,
  monthKey,
  onMonthChange,
}: {
  members: Member[];
  expenses: Expense[];
  monthKey: MonthKey;
  onMonthChange: (month: MonthKey) => void;
}) {
  const summary = calculateMonthlySummary({ members, expenses, monthKey });
  const settlement = summary.settlement;
  const from = settlement ? members.find((member) => member.id === settlement.fromMemberId) : undefined;
  const to = settlement ? members.find((member) => member.id === settlement.toMemberId) : undefined;

  return (
    <section className="screen">
      <h1>统计</h1>
      <MonthSelector value={monthKey} onChange={onMonthChange} />
      <div className="metric-card">
        <span>本月总消费</span>
        <strong>{formatCents(summary.totalCents)}</strong>
      </div>
      <div className="metric-card">
        <span>本月应补</span>
        <strong>
          {settlement && from && to
            ? `${from.displayName} 应补给 ${to.displayName} ${formatCents(settlement.amountCents)}`
            : "已平衡"}
        </strong>
      </div>
    </section>
  );
}
