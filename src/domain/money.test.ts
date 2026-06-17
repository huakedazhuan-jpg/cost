import { describe, expect, it } from "vitest";
import { formatCents, parseAmountToCents } from "./money";

describe("parseAmountToCents", () => {
  it("parses whole yuan and decimal yuan", () => {
    expect(parseAmountToCents("12")).toEqual({ ok: true, cents: 1200 });
    expect(parseAmountToCents("12.3")).toEqual({ ok: true, cents: 1230 });
    expect(parseAmountToCents("12.34")).toEqual({ ok: true, cents: 1234 });
  });

  it("rejects invalid or non-positive amounts", () => {
    expect(parseAmountToCents("0")).toEqual({ ok: false, error: "Amount must be greater than 0" });
    expect(parseAmountToCents("-1")).toEqual({ ok: false, error: "Amount must be greater than 0" });
    expect(parseAmountToCents("12.345")).toEqual({ ok: false, error: "Use at most 2 decimal places" });
    expect(parseAmountToCents("abc")).toEqual({ ok: false, error: "Enter a valid amount" });
  });
});

describe("formatCents", () => {
  it("formats cents as CNY", () => {
    expect(formatCents(0)).toBe("\u00a50.00");
    expect(formatCents(1234)).toBe("\u00a512.34");
    expect(formatCents(1234567)).toBe("\u00a512,345.67");
    expect(formatCents(-1234)).toBe("-\u00a512.34");
  });
});
