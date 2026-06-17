export type AmountParseResult =
  | { ok: true; cents: number }
  | { ok: false; error: string };

export function parseAmountToCents(raw: string): AmountParseResult {
  const value = raw.trim();

  if (/^-/.test(value) || value === "0" || value === "0.0" || value === "0.00") {
    return { ok: false, error: "金额必须大于 0" };
  }

  if (!/^\d+(\.\d+)?$/.test(value)) {
    return { ok: false, error: "请输入有效金额" };
  }

  const [yuan, decimal = ""] = value.split(".");
  if (decimal.length > 2) {
    return { ok: false, error: "最多输入 2 位小数" };
  }

  const cents = Number(yuan) * 100 + Number(decimal.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    return { ok: false, error: "金额必须大于 0" };
  }

  return { ok: true, cents };
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const yuan = Math.floor(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, "0");
  return `${sign}\u00a5${yuan.toLocaleString("en-US")}.${fraction}`;
}
