import { describe, expect, it } from "vitest";
import { formatCents, parseAmountToCents } from "./money";

describe("parseAmountToCents", () => {
  it("parses whole yuan and decimal yuan", () => {
    expect(parseAmountToCents("12")).toEqual({ ok: true, cents: 1200 });
    expect(parseAmountToCents("12.3")).toEqual({ ok: true, cents: 1230 });
    expect(parseAmountToCents("12.34")).toEqual({ ok: true, cents: 1234 });
  });

  it("rejects invalid or non-positive amounts", () => {
    expect(parseAmountToCents("0")).toEqual({ ok: false, error: "金额必须大于 0" });
    expect(parseAmountToCents("-1")).toEqual({ ok: false, error: "金额必须大于 0" });
    expect(parseAmountToCents("12.345")).toEqual({ ok: false, error: "最多输入 2 位小数" });
    expect(parseAmountToCents("abc")).toEqual({ ok: false, error: "请输入有效金额" });
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
