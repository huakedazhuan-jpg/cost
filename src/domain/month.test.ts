import { describe, expect, it } from "vitest";
import { getCurrentMonthKey, getMonthKey, isDateInMonth, shiftMonth } from "./month";

describe("month helpers", () => {
  it("extracts month keys from ISO dates", () => {
    expect(getMonthKey("2026-06-16")).toBe("2026-06");
  });

  it("checks whether an ISO date belongs to a month", () => {
    expect(isDateInMonth("2026-06-01", "2026-06")).toBe(true);
    expect(isDateInMonth("2026-07-01", "2026-06")).toBe(false);
  });

  it("shifts month keys", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
  });

  it("formats the current month key from a provided date", () => {
    expect(getCurrentMonthKey(new Date("2026-06-16T08:00:00+08:00"))).toBe("2026-06");
  });
});
