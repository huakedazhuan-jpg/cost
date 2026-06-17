export type MonthKey = `${number}-${string}`;

export function getMonthKey(isoDate: string): MonthKey {
  return isoDate.slice(0, 7) as MonthKey;
}

export function getCurrentMonthKey(date = new Date()): MonthKey {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}` as MonthKey;
}

export function isDateInMonth(isoDate: string, monthKey: MonthKey): boolean {
  return getMonthKey(isoDate) === monthKey;
}

export function shiftMonth(monthKey: MonthKey, offset: number): MonthKey {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return getCurrentMonthKey(date);
}
