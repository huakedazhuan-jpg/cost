import { shiftMonth, type MonthKey } from "../domain/month";

export function MonthSelector({ value, onChange }: { value: MonthKey; onChange: (month: MonthKey) => void }) {
  return (
    <div className="month-selector">
      <button type="button" onClick={() => onChange(shiftMonth(value, -1))}>
        上月
      </button>
      <strong>{value}</strong>
      <button type="button" onClick={() => onChange(shiftMonth(value, 1))}>
        下月
      </button>
    </div>
  );
}
