# Shared Expense PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved two-person shared expense PWA with monthly totals, monthly settlement suggestions, local identity selection, and Supabase-backed data access.

**Architecture:** Build the app in layers: pure domain logic first, then local device settings, then React screens against a typed API interface, then Supabase schema and Edge Function access. The UI should work against a mock API before the Supabase API is wired in, so calculation and screen behavior can be tested without remote setup.

**Tech Stack:** React, Vite, TypeScript, Vitest, Testing Library, vite-plugin-pwa, Supabase Postgres, Supabase Edge Functions.

---

## Scope Check

This is one coherent MVP: a private two-person expense PWA. The plan does not include unrelated group accounting, native mobile builds, push notifications, receipt upload, or repayment tracking.

## File Structure

Create or modify these files:

- `package.json`: scripts and dependencies.
- `index.html`: Vite entry document.
- `vite.config.ts`: React, Vitest, and PWA configuration.
- `tsconfig.json`, `tsconfig.node.json`: TypeScript configuration.
- `public/icon.svg`: installable app icon source.
- `public/apple-touch-icon.svg`: iOS home-screen icon fallback.
- `src/main.tsx`: React bootstrap.
- `src/app/App.tsx`: route-level app shell and API selection.
- `src/app/App.test.tsx`: smoke test for the app shell.
- `src/app/AppState.tsx`: app state reducer and provider.
- `src/app/AppState.test.ts`: reducer and loading-state tests.
- `src/domain/types.ts`: shared domain types.
- `src/domain/categories.ts`: built-in category keys and labels.
- `src/domain/money.ts`: money parsing and formatting.
- `src/domain/money.test.ts`: money unit tests.
- `src/domain/month.ts`: month utilities.
- `src/domain/month.test.ts`: month unit tests.
- `src/domain/balance.ts`: monthly summary and settlement logic.
- `src/domain/balance.test.ts`: balance unit tests.
- `src/domain/splits.ts`: split generation helpers.
- `src/domain/splits.test.ts`: split helper tests.
- `src/storage/localSettings.ts`: local ledger key and identity storage.
- `src/storage/localSettings.test.ts`: local storage tests.
- `src/api/ledgerApi.ts`: API interface and request/response types.
- `src/api/mockLedgerApi.ts`: local mock implementation for UI development.
- `src/api/mockLedgerApi.test.ts`: mock API behavior tests.
- `src/api/supabaseLedgerApi.ts`: client wrapper for the Supabase Edge Function.
- `src/api/supabaseLedgerApi.test.ts`: fetch contract tests.
- `src/components/BottomNav.tsx`: bottom tab navigation.
- `src/components/ExpenseForm.tsx`: expense creation/edit form.
- `src/components/ExpenseForm.test.tsx`: form validation tests.
- `src/components/ExpenseList.tsx`: expense list and delete/edit affordances.
- `src/components/MonthSelector.tsx`: month selector.
- `src/screens/OnboardingScreen.tsx`: shared key and identity setup.
- `src/screens/OnboardingScreen.test.tsx`: onboarding flow tests.
- `src/screens/HomeScreen.tsx`: monthly total and recent expenses.
- `src/screens/HomeScreen.test.tsx`: home screen rendering tests.
- `src/screens/DetailsScreen.tsx`: selected month expense list.
- `src/screens/StatisticsScreen.tsx`: category totals and settlement suggestion.
- `src/screens/SettingsScreen.tsx`: identity/key/PWA guidance.
- `src/styles.css`: mobile-first global styles.
- `src/test/setup.ts`: test environment setup.
- `supabase/migrations/001_initial_schema.sql`: schema, RLS, and RPC grants.
- `supabase/functions/ledger-api/index.ts`: Edge Function API.
- `scripts/create-ledger.mjs`: one-time ledger seed helper.
- `.env.example`: required local environment variables.

## Task 1: Project Scaffold And Tooling

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/App.test.tsx`
- Create: `src/test/setup.ts`
- Create: `src/styles.css`
- Modify: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "shared-expense-pwa",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest --run",
    "lint": "tsc -b --pretty false"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0",
    "lucide-react": "^0.468.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.6.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.21.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```powershell
npm.cmd install
```

Expected: `package-lock.json` is created and install exits with code `0`. If the sandbox blocks registry access, rerun with approved network escalation.

- [ ] **Step 3: Create TypeScript and Vite config**

`tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "vite.config.ts"]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    globals: true,
  },
});
```

- [ ] **Step 4: Create initial app files and smoke test**

`index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shared Expense PWA</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

`src/app/App.tsx`:

```tsx
export function App() {
  return (
    <main>
      <h1>Shared Expense PWA</h1>
    </main>
  );
}
```

`src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`src/app/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the app shell", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Shared Expense PWA" })).toBeInTheDocument();
  });
});
```

`src/styles.css`:

```css
* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  background: #f7f8fb;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
  min-height: 100%;
}

button,
input,
select,
textarea {
  font: inherit;
}
```

- [ ] **Step 5: Run scaffold tests**

Run:

```powershell
npm.cmd run test:run
```

Expected: PASS for `src/app/App.test.tsx`.

- [ ] **Step 6: Commit scaffold**

```powershell
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.node.json src
git commit -m "chore: scaffold React PWA project"
```

## Task 2: Domain Types, Money, Month, And Category Helpers

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/categories.ts`
- Create: `src/domain/money.ts`
- Create: `src/domain/money.test.ts`
- Create: `src/domain/month.ts`
- Create: `src/domain/month.test.ts`

- [ ] **Step 1: Write money tests**

`src/domain/money.test.ts`:

```ts
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
```

- [ ] **Step 2: Implement money helpers**

`src/domain/money.ts`:

```ts
export type AmountParseResult =
  | { ok: true; cents: number }
  | { ok: false; error: string };

export function parseAmountToCents(raw: string): AmountParseResult {
  const value = raw.trim();

  if (/^-/.test(value) || value === "0" || value === "0.0" || value === "0.00") {
    return { ok: false, error: "Amount must be greater than 0" };
  }

  if (!/^\d+(\.\d+)?$/.test(value)) {
    return { ok: false, error: "Enter a valid amount" };
  }

  const [yuan, decimal = ""] = value.split(".");
  if (decimal.length > 2) {
    return { ok: false, error: "Use at most 2 decimal places" };
  }

  const cents = Number(yuan) * 100 + Number(decimal.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    return { ok: false, error: "Amount must be greater than 0" };
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
```

- [ ] **Step 3: Write month tests**

`src/domain/month.test.ts`:

```ts
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
```

- [ ] **Step 4: Implement month helpers, types, and categories**

`src/domain/month.ts`:

```ts
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
```

`src/domain/types.ts`:

```ts
import type { MonthKey } from "./month";

export type MemberKey = "me" | "partner";
export type SplitMode = "equal" | "single" | "custom";
export type CategoryKey =
  | "dining"
  | "groceries_daily"
  | "rent_utilities"
  | "transport"
  | "entertainment"
  | "medical"
  | "travel"
  | "other";

export interface Ledger {
  id: string;
  name: string;
  members: Member[];
}

export interface Member {
  id: string;
  memberKey: MemberKey;
  displayName: string;
}

export interface Category {
  id: string;
  key: CategoryKey;
  label: string;
  sortOrder: number;
}

export interface ExpenseSplit {
  memberId: string;
  shareCents: number;
}

export interface Expense {
  id: string;
  ledgerId: string;
  amountCents: number;
  categoryId: string;
  spentOn: string;
  note: string;
  createdByMemberId: string;
  paidByMemberId: string;
  splitMode: SplitMode;
  splits: ExpenseSplit[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthQuery {
  ledgerKey: string;
  monthKey: MonthKey;
}
```

`src/domain/categories.ts`:

```ts
import type { Category } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-dining", key: "dining", label: "\u9910\u996e", sortOrder: 10 },
  { id: "cat-groceries-daily", key: "groceries_daily", label: "\u8d85\u5e02\u65e5\u7528", sortOrder: 20 },
  { id: "cat-rent-utilities", key: "rent_utilities", label: "\u623f\u79df\u6c34\u7535", sortOrder: 30 },
  { id: "cat-transport", key: "transport", label: "\u4ea4\u901a", sortOrder: 40 },
  { id: "cat-entertainment", key: "entertainment", label: "\u5a31\u4e50", sortOrder: 50 },
  { id: "cat-medical", key: "medical", label: "\u533b\u7597", sortOrder: 60 },
  { id: "cat-travel", key: "travel", label: "\u65c5\u884c", sortOrder: 70 },
  { id: "cat-other", key: "other", label: "\u5176\u4ed6", sortOrder: 80 },
];

export function getCategoryLabel(categoryId: string, categories = DEFAULT_CATEGORIES): string {
  return categories.find((category) => category.id === categoryId)?.label ?? "\u5176\u4ed6";
}
```

- [ ] **Step 5: Run domain tests**

Run:

```powershell
npm.cmd run test:run -- src/domain/money.test.ts src/domain/month.test.ts
```

Expected: all money and month tests pass.

- [ ] **Step 6: Commit domain helpers**

```powershell
git add src/domain
git commit -m "feat: add expense domain helpers"
```

## Task 3: Split Generation And Monthly Balance Calculation

**Files:**
- Create: `src/domain/splits.ts`
- Create: `src/domain/splits.test.ts`
- Create: `src/domain/balance.ts`
- Create: `src/domain/balance.test.ts`

- [ ] **Step 1: Write split generation tests**

`src/domain/splits.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildCustomSplits, buildEqualSplits, buildSingleMemberSplit } from "./splits";

const members = [
  { id: "member-me", memberKey: "me" as const, displayName: "A" },
  { id: "member-partner", memberKey: "partner" as const, displayName: "B" },
];

describe("split helpers", () => {
  it("splits equally and assigns remainder to the second member", () => {
    expect(buildEqualSplits(101, members)).toEqual([
      { memberId: "member-me", shareCents: 50 },
      { memberId: "member-partner", shareCents: 51 },
    ]);
  });

  it("assigns full responsibility to one member", () => {
    expect(buildSingleMemberSplit(500, members, "member-me")).toEqual([
      { memberId: "member-me", shareCents: 500 },
      { memberId: "member-partner", shareCents: 0 },
    ]);
  });

  it("accepts custom split cents that equal the total", () => {
    expect(buildCustomSplits(1000, members, { "member-me": 300, "member-partner": 700 })).toEqual([
      { memberId: "member-me", shareCents: 300 },
      { memberId: "member-partner", shareCents: 700 },
    ]);
  });

  it("rejects custom split totals that do not match the expense", () => {
    expect(() => buildCustomSplits(1000, members, { "member-me": 300, "member-partner": 600 })).toThrow(
      "Custom split must equal expense total",
    );
  });
});
```

- [ ] **Step 2: Implement split helpers**

`src/domain/splits.ts`:

```ts
import type { ExpenseSplit, Member } from "./types";

export function buildEqualSplits(amountCents: number, members: Member[]): ExpenseSplit[] {
  if (members.length !== 2) {
    throw new Error("Equal split currently supports exactly two members");
  }

  const firstShare = Math.floor(amountCents / 2);
  return [
    { memberId: members[0].id, shareCents: firstShare },
    { memberId: members[1].id, shareCents: amountCents - firstShare },
  ];
}

export function buildSingleMemberSplit(amountCents: number, members: Member[], responsibleMemberId: string): ExpenseSplit[] {
  return members.map((member) => ({
    memberId: member.id,
    shareCents: member.id === responsibleMemberId ? amountCents : 0,
  }));
}

export function buildCustomSplits(amountCents: number, members: Member[], shares: Record<string, number>): ExpenseSplit[] {
  const splits = members.map((member) => ({
    memberId: member.id,
    shareCents: shares[member.id] ?? 0,
  }));

  const total = splits.reduce((sum, split) => sum + split.shareCents, 0);
  if (total !== amountCents) {
    throw new Error("Custom split must equal expense total");
  }

  return splits;
}
```

- [ ] **Step 3: Write monthly balance tests**

`src/domain/balance.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateMonthlySummary } from "./balance";
import type { Expense, Member } from "./types";

const members: Member[] = [
  { id: "member-me", memberKey: "me", displayName: "A" },
  { id: "member-partner", memberKey: "partner", displayName: "B" },
];

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: "expense-1",
    ledgerId: "ledger-1",
    amountCents: 1000,
    categoryId: "cat-dining",
    spentOn: "2026-06-16",
    note: "",
    createdByMemberId: "member-me",
    paidByMemberId: "member-me",
    splitMode: "equal",
    splits: [
      { memberId: "member-me", shareCents: 500 },
      { memberId: "member-partner", shareCents: 500 },
    ],
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
    ...overrides,
  };
}

describe("calculateMonthlySummary", () => {
  it("calculates equal split settlement for one month", () => {
    const summary = calculateMonthlySummary({
      members,
      expenses: [expense({ amountCents: 1000 })],
      monthKey: "2026-06",
    });

    expect(summary.totalCents).toBe(1000);
    expect(summary.expenseCount).toBe(1);
    expect(summary.members["member-me"]).toMatchObject({ paidCents: 1000, owedCents: 500, netCents: 500 });
    expect(summary.members["member-partner"]).toMatchObject({ paidCents: 0, owedCents: 500, netCents: -500 });
    expect(summary.settlement).toEqual({
      fromMemberId: "member-partner",
      toMemberId: "member-me",
      amountCents: 500,
    });
  });

  it("does not carry balances across months", () => {
    const summary = calculateMonthlySummary({
      members,
      expenses: [
        expense({ id: "june", spentOn: "2026-06-30", amountCents: 1000 }),
        expense({ id: "july", spentOn: "2026-07-01", amountCents: 2000 }),
      ],
      monthKey: "2026-07",
    });

    expect(summary.totalCents).toBe(2000);
    expect(summary.expenseCount).toBe(1);
  });

  it("supports one-person responsibility", () => {
    const summary = calculateMonthlySummary({
      members,
      expenses: [
        expense({
          splitMode: "single",
          splits: [
            { memberId: "member-me", shareCents: 1000 },
            { memberId: "member-partner", shareCents: 0 },
          ],
        }),
      ],
      monthKey: "2026-06",
    });

    expect(summary.settlement).toBeUndefined();
  });

  it("supports custom split rows", () => {
    const summary = calculateMonthlySummary({
      members,
      expenses: [
        expense({
          amountCents: 1000,
          paidByMemberId: "member-partner",
          splitMode: "custom",
          splits: [
            { memberId: "member-me", shareCents: 300 },
            { memberId: "member-partner", shareCents: 700 },
          ],
        }),
      ],
      monthKey: "2026-06",
    });

    expect(summary.settlement).toEqual({
      fromMemberId: "member-me",
      toMemberId: "member-partner",
      amountCents: 300,
    });
  });
});
```

- [ ] **Step 4: Implement monthly balance calculation**

`src/domain/balance.ts`:

```ts
import { isDateInMonth, type MonthKey } from "./month";
import type { Expense, Member } from "./types";

export interface MemberBalance {
  memberId: string;
  paidCents: number;
  owedCents: number;
  netCents: number;
}

export interface SettlementSuggestion {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
}

export interface MonthlySummary {
  monthKey: MonthKey;
  totalCents: number;
  expenseCount: number;
  categoryTotals: Record<string, number>;
  members: Record<string, MemberBalance>;
  settlement?: SettlementSuggestion;
}

export function calculateMonthlySummary(input: {
  members: Member[];
  expenses: Expense[];
  monthKey: MonthKey;
}): MonthlySummary {
  const monthlyExpenses = input.expenses.filter((expense) => isDateInMonth(expense.spentOn, input.monthKey));
  const balances: Record<string, MemberBalance> = {};
  const categoryTotals: Record<string, number> = {};

  for (const member of input.members) {
    balances[member.id] = {
      memberId: member.id,
      paidCents: 0,
      owedCents: 0,
      netCents: 0,
    };
  }

  for (const expense of monthlyExpenses) {
    categoryTotals[expense.categoryId] = (categoryTotals[expense.categoryId] ?? 0) + expense.amountCents;
    balances[expense.paidByMemberId].paidCents += expense.amountCents;

    for (const split of expense.splits) {
      balances[split.memberId].owedCents += split.shareCents;
    }
  }

  for (const balance of Object.values(balances)) {
    balance.netCents = balance.paidCents - balance.owedCents;
  }

  return {
    monthKey: input.monthKey,
    totalCents: monthlyExpenses.reduce((sum, expense) => sum + expense.amountCents, 0),
    expenseCount: monthlyExpenses.length,
    categoryTotals,
    members: balances,
    settlement: getSettlementSuggestion(Object.values(balances)),
  };
}

function getSettlementSuggestion(balances: MemberBalance[]): SettlementSuggestion | undefined {
  const creditor = balances.find((balance) => balance.netCents > 0);
  const debtor = balances.find((balance) => balance.netCents < 0);

  if (!creditor || !debtor) {
    return undefined;
  }

  return {
    fromMemberId: debtor.memberId,
    toMemberId: creditor.memberId,
    amountCents: Math.min(Math.abs(debtor.netCents), creditor.netCents),
  };
}
```

- [ ] **Step 5: Run balance tests**

Run:

```powershell
npm.cmd run test:run -- src/domain/splits.test.ts src/domain/balance.test.ts
```

Expected: all split and balance tests pass.

- [ ] **Step 6: Commit balance logic**

```powershell
git add src/domain
git commit -m "feat: add monthly balance calculation"
```

## Task 4: Local Device Settings

**Files:**
- Create: `src/storage/localSettings.ts`
- Create: `src/storage/localSettings.test.ts`

- [ ] **Step 1: Write local settings tests**

`src/storage/localSettings.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearLocalSettings,
  getLocalSettings,
  saveLedgerKey,
  saveSelectedMemberId,
} from "./localSettings";

describe("localSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    expect(getLocalSettings()).toEqual({ ledgerKey: "", selectedMemberId: "" });
  });

  it("saves ledger key and selected identity", () => {
    saveLedgerKey("secret-ledger-key");
    saveSelectedMemberId("member-me");

    expect(getLocalSettings()).toEqual({
      ledgerKey: "secret-ledger-key",
      selectedMemberId: "member-me",
    });
  });

  it("clears both values", () => {
    saveLedgerKey("secret-ledger-key");
    saveSelectedMemberId("member-me");
    clearLocalSettings();

    expect(getLocalSettings()).toEqual({ ledgerKey: "", selectedMemberId: "" });
  });
});
```

- [ ] **Step 2: Implement local settings**

`src/storage/localSettings.ts`:

```ts
const LEDGER_KEY_STORAGE = "shared-expense-pwa:ledger-key";
const SELECTED_MEMBER_STORAGE = "shared-expense-pwa:selected-member-id";

export interface LocalSettings {
  ledgerKey: string;
  selectedMemberId: string;
}

export function getLocalSettings(): LocalSettings {
  return {
    ledgerKey: localStorage.getItem(LEDGER_KEY_STORAGE) ?? "",
    selectedMemberId: localStorage.getItem(SELECTED_MEMBER_STORAGE) ?? "",
  };
}

export function saveLedgerKey(ledgerKey: string): void {
  localStorage.setItem(LEDGER_KEY_STORAGE, ledgerKey.trim());
}

export function saveSelectedMemberId(memberId: string): void {
  localStorage.setItem(SELECTED_MEMBER_STORAGE, memberId);
}

export function clearLocalSettings(): void {
  localStorage.removeItem(LEDGER_KEY_STORAGE);
  localStorage.removeItem(SELECTED_MEMBER_STORAGE);
}
```

- [ ] **Step 3: Run local settings tests**

Run:

```powershell
npm.cmd run test:run -- src/storage/localSettings.test.ts
```

Expected: all local settings tests pass.

- [ ] **Step 4: Commit local settings**

```powershell
git add src/storage
git commit -m "feat: persist local ledger identity"
```

## Task 5: Typed Ledger API And Mock Implementation

**Files:**
- Create: `src/api/ledgerApi.ts`
- Create: `src/api/mockLedgerApi.ts`
- Create: `src/api/mockLedgerApi.test.ts`

- [ ] **Step 1: Write mock API tests**

`src/api/mockLedgerApi.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createMockLedgerApi } from "./mockLedgerApi";

describe("mockLedgerApi", () => {
  it("rejects an empty ledger key", async () => {
    const api = createMockLedgerApi();
    await expect(api.bootstrap({ ledgerKey: "" })).rejects.toThrow("ledger not found or key incorrect");
  });

  it("creates an equal split expense with creator as payer", async () => {
    const api = createMockLedgerApi();
    const bootstrap = await api.bootstrap({ ledgerKey: "demo-ledger-key" });
    const member = bootstrap.ledger.members[0];

    const created = await api.createExpense({
      ledgerKey: "demo-ledger-key",
      amountCents: 1000,
      categoryId: "cat-dining",
      spentOn: "2026-06-16",
      note: "dinner",
      createdByMemberId: member.id,
      paidByMemberId: member.id,
      splitMode: "equal",
    });

    expect(created.paidByMemberId).toBe(member.id);
    expect(created.splits).toEqual([
      { memberId: "member-me", shareCents: 500 },
      { memberId: "member-partner", shareCents: 500 },
    ]);
  });

  it("lists expenses by month", async () => {
    const api = createMockLedgerApi();
    const bootstrap = await api.bootstrap({ ledgerKey: "demo-ledger-key" });
    await api.createExpense({
      ledgerKey: "demo-ledger-key",
      amountCents: 1000,
      categoryId: "cat-dining",
      spentOn: "2026-06-16",
      note: "",
      createdByMemberId: bootstrap.ledger.members[0].id,
      paidByMemberId: bootstrap.ledger.members[0].id,
      splitMode: "equal",
    });

    const month = await api.listMonth({ ledgerKey: "demo-ledger-key", monthKey: "2026-06" });
    expect(month.expenses).toHaveLength(1);
    expect(month.summary.totalCents).toBe(1000);
  });
});
```

- [ ] **Step 2: Define API interface**

`src/api/ledgerApi.ts`:

```ts
import type { MonthKey } from "../domain/month";
import type { Expense, Ledger, SplitMode } from "../domain/types";
import type { MonthlySummary } from "../domain/balance";

export interface BootstrapRequest {
  ledgerKey: string;
}

export interface BootstrapResponse {
  ledger: Ledger;
}

export interface ListMonthRequest {
  ledgerKey: string;
  monthKey: MonthKey;
}

export interface ListMonthResponse {
  expenses: Expense[];
  summary: MonthlySummary;
}

export interface CreateExpenseRequest {
  ledgerKey: string;
  amountCents: number;
  categoryId: string;
  spentOn: string;
  note: string;
  createdByMemberId: string;
  paidByMemberId: string;
  splitMode: SplitMode;
  customShares?: Record<string, number>;
  responsibleMemberId?: string;
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {
  id: string;
}

export interface DeleteExpenseRequest {
  ledgerKey: string;
  id: string;
}

export interface LedgerApi {
  bootstrap(request: BootstrapRequest): Promise<BootstrapResponse>;
  listMonth(request: ListMonthRequest): Promise<ListMonthResponse>;
  createExpense(request: CreateExpenseRequest): Promise<Expense>;
  updateExpense(request: UpdateExpenseRequest): Promise<Expense>;
  deleteExpense(request: DeleteExpenseRequest): Promise<void>;
}
```

- [ ] **Step 3: Implement mock API**

`src/api/mockLedgerApi.ts`:

```ts
import { calculateMonthlySummary } from "../domain/balance";
import { DEFAULT_CATEGORIES } from "../domain/categories";
import { buildCustomSplits, buildEqualSplits, buildSingleMemberSplit } from "../domain/splits";
import type { Expense, Ledger } from "../domain/types";
import type { CreateExpenseRequest, LedgerApi, UpdateExpenseRequest } from "./ledgerApi";

const MOCK_LEDGER_KEY = "demo-ledger-key";

const ledger: Ledger = {
  id: "ledger-demo",
  name: "Shared Ledger",
  members: [
    { id: "member-me", memberKey: "me", displayName: "A" },
    { id: "member-partner", memberKey: "partner", displayName: "B" },
  ],
};

export function createMockLedgerApi(initialExpenses: Expense[] = []): LedgerApi {
  let expenses = [...initialExpenses];

  function assertKey(ledgerKey: string): void {
    if (ledgerKey.trim() !== MOCK_LEDGER_KEY) {
      throw new Error("ledger not found or key incorrect");
    }
  }

  function buildExpense(request: CreateExpenseRequest | UpdateExpenseRequest, existingId?: string): Expense {
    const now = new Date().toISOString();
    return {
      id: existingId ?? `expense-${crypto.randomUUID()}`,
      ledgerId: ledger.id,
      amountCents: request.amountCents,
      categoryId: request.categoryId,
      spentOn: request.spentOn,
      note: request.note,
      createdByMemberId: request.createdByMemberId,
      paidByMemberId: request.paidByMemberId,
      splitMode: request.splitMode,
      splits:
        request.splitMode === "single"
          ? buildSingleMemberSplit(request.amountCents, ledger.members, request.responsibleMemberId ?? request.paidByMemberId)
          : request.splitMode === "custom"
            ? buildCustomSplits(request.amountCents, ledger.members, request.customShares ?? {})
            : buildEqualSplits(request.amountCents, ledger.members),
      createdAt: now,
      updatedAt: now,
    };
  }

  return {
    async bootstrap(request) {
      assertKey(request.ledgerKey);
      return { ledger };
    },
    async listMonth(request) {
      assertKey(request.ledgerKey);
      return {
        expenses: expenses.filter((expense) => expense.spentOn.startsWith(request.monthKey)),
        summary: calculateMonthlySummary({ members: ledger.members, expenses, monthKey: request.monthKey }),
      };
    },
    async createExpense(request) {
      assertKey(request.ledgerKey);
      const expense = buildExpense(request);
      expenses = [expense, ...expenses];
      return expense;
    },
    async updateExpense(request) {
      assertKey(request.ledgerKey);
      const previous = expenses.find((expense) => expense.id === request.id);
      if (!previous) {
        throw new Error("expense not found");
      }
      const updated = { ...buildExpense(request, request.id), createdAt: previous.createdAt };
      expenses = expenses.map((expense) => (expense.id === request.id ? updated : expense));
      return updated;
    },
    async deleteExpense(request) {
      assertKey(request.ledgerKey);
      expenses = expenses.filter((expense) => expense.id !== request.id);
    },
  };
}

export { DEFAULT_CATEGORIES };
```

- [ ] **Step 4: Run API tests**

Run:

```powershell
npm.cmd run test:run -- src/api/mockLedgerApi.test.ts
```

Expected: mock API tests pass.

- [ ] **Step 5: Commit API abstraction**

```powershell
git add src/api
git commit -m "feat: add ledger API abstraction"
```

## Task 6: App State Provider And Onboarding Flow

**Files:**
- Create: `src/app/AppState.tsx`
- Create: `src/app/AppState.test.ts`
- Create: `src/screens/OnboardingScreen.tsx`
- Create: `src/screens/OnboardingScreen.test.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Write reducer tests**

`src/app/AppState.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { appReducer, initialAppState } from "./AppState";

describe("appReducer", () => {
  it("stores bootstrap data and local selections", () => {
    const state = appReducer(initialAppState, {
      type: "BOOTSTRAP_SUCCESS",
      ledgerKey: "demo-ledger-key",
      selectedMemberId: "member-me",
      ledger: {
        id: "ledger-demo",
        name: "Shared Ledger",
        members: [{ id: "member-me", memberKey: "me", displayName: "A" }],
      },
    });

    expect(state.ledgerKey).toBe("demo-ledger-key");
    expect(state.selectedMemberId).toBe("member-me");
    expect(state.status).toBe("ready");
  });

  it("tracks errors", () => {
    const state = appReducer(initialAppState, { type: "ERROR", message: "network required" });
    expect(state.error).toBe("network required");
    expect(state.status).toBe("error");
  });
});
```

- [ ] **Step 2: Implement app state**

`src/app/AppState.tsx`:

```tsx
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import type { Ledger } from "../domain/types";

export type AppStatus = "setup" | "loading" | "ready" | "error";

export interface AppState {
  status: AppStatus;
  ledgerKey: string;
  selectedMemberId: string;
  ledger?: Ledger;
  error: string;
}

export type AppAction =
  | { type: "LOADING" }
  | { type: "BOOTSTRAP_SUCCESS"; ledgerKey: string; selectedMemberId: string; ledger: Ledger }
  | { type: "SELECT_MEMBER"; selectedMemberId: string }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

export const initialAppState: AppState = {
  status: "setup",
  ledgerKey: "",
  selectedMemberId: "",
  error: "",
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOADING":
      return { ...state, status: "loading", error: "" };
    case "BOOTSTRAP_SUCCESS":
      return {
        status: "ready",
        ledgerKey: action.ledgerKey,
        selectedMemberId: action.selectedMemberId,
        ledger: action.ledger,
        error: "",
      };
    case "SELECT_MEMBER":
      return { ...state, selectedMemberId: action.selectedMemberId };
    case "ERROR":
      return { ...state, status: "error", error: action.message };
    case "RESET":
      return initialAppState;
  }
}

const StateContext = createContext<AppState | undefined>(undefined);
const DispatchContext = createContext<Dispatch<AppAction> | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const value = useContext(StateContext);
  if (!value) throw new Error("useAppState must be used inside AppStateProvider");
  return value;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const value = useContext(DispatchContext);
  if (!value) throw new Error("useAppDispatch must be used inside AppStateProvider");
  return value;
}
```

- [ ] **Step 3: Write onboarding tests**

`src/screens/OnboardingScreen.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { LedgerApi } from "../api/ledgerApi";
import { OnboardingScreen } from "./OnboardingScreen";

describe("OnboardingScreen", () => {
  it("asks for a ledger key, then asks for identity", async () => {
    const user = userEvent.setup();
    const api: LedgerApi = {
      bootstrap: vi.fn(async () => ({
        ledger: {
          id: "ledger-demo",
          name: "Shared Ledger",
          members: [
            { id: "member-me", memberKey: "me", displayName: "A" },
            { id: "member-partner", memberKey: "partner", displayName: "B" },
          ],
        },
      })),
      listMonth: vi.fn(),
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
    };
    const onComplete = vi.fn();

    render(<OnboardingScreen api={api} onComplete={onComplete} />);
    await user.type(screen.getByLabelText("Ledger key"), "demo-ledger-key");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(await screen.findByRole("button", { name: "A" }));

    expect(onComplete).toHaveBeenCalledWith({
      ledgerKey: "demo-ledger-key",
      selectedMemberId: "member-me",
      ledger: expect.objectContaining({ id: "ledger-demo" }),
    });
  });
});
```

- [ ] **Step 4: Implement onboarding**

`src/screens/OnboardingScreen.tsx`:

```tsx
import { useState } from "react";
import type { LedgerApi } from "../api/ledgerApi";
import type { Ledger } from "../domain/types";

export interface OnboardingCompletePayload {
  ledgerKey: string;
  selectedMemberId: string;
  ledger: Ledger;
}

export function OnboardingScreen({
  api,
  onComplete,
}: {
  api: LedgerApi;
  onComplete: (payload: OnboardingCompletePayload) => void;
}) {
  const [ledgerKey, setLedgerKey] = useState("");
  const [ledger, setLedger] = useState<Ledger | undefined>();
  const [error, setError] = useState("");

  async function submitLedgerKey() {
    setError("");
    try {
      const result = await api.bootstrap({ ledgerKey });
      setLedger(result.ledger);
    } catch {
      setError("ledger not found or key incorrect");
    }
  }

  if (ledger) {
    return (
      <section className="screen">
        <h1>Choose identity</h1>
        <div className="stack">
          {ledger.members.map((member) => (
            <button
              className="primary-button"
              key={member.id}
              type="button"
              onClick={() => onComplete({ ledgerKey, selectedMemberId: member.id, ledger })}
            >
              {member.displayName}
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="screen">
      <h1>Shared Expense</h1>
      <label className="field">
        <span>Ledger key</span>
        <input value={ledgerKey} onChange={(event) => setLedgerKey(event.target.value)} />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="primary-button" type="button" onClick={submitLedgerKey}>
        Continue
      </button>
    </section>
  );
}
```

- [ ] **Step 5: Wire onboarding into `App.tsx`**

`src/app/App.tsx`:

```tsx
import { useMemo } from "react";
import { createMockLedgerApi } from "../api/mockLedgerApi";
import { getLocalSettings, saveLedgerKey, saveSelectedMemberId } from "../storage/localSettings";
import { AppStateProvider, useAppDispatch, useAppState } from "./AppState";
import { OnboardingScreen, type OnboardingCompletePayload } from "../screens/OnboardingScreen";

function AppContent() {
  const api = useMemo(() => createMockLedgerApi(), []);
  const state = useAppState();
  const dispatch = useAppDispatch();

  function completeOnboarding(payload: OnboardingCompletePayload) {
    saveLedgerKey(payload.ledgerKey);
    saveSelectedMemberId(payload.selectedMemberId);
    dispatch({ type: "BOOTSTRAP_SUCCESS", ...payload });
  }

  if (!state.ledgerKey || !state.selectedMemberId || !state.ledger) {
    const local = getLocalSettings();
    if (!local.ledgerKey || !local.selectedMemberId) {
      return <OnboardingScreen api={api} onComplete={completeOnboarding} />;
    }
  }

  return <main className="app-shell">Shared Expense PWA</main>;
}

export function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
```

- [ ] **Step 6: Run onboarding tests**

Run:

```powershell
npm.cmd run test:run -- src/app/AppState.test.ts src/screens/OnboardingScreen.test.tsx
```

Expected: tests pass.

- [ ] **Step 7: Commit onboarding**

```powershell
git add src/app src/screens src/storage
git commit -m "feat: add ledger onboarding flow"
```

## Task 7: Expense Form And Validation

**Files:**
- Create: `src/components/ExpenseForm.tsx`
- Create: `src/components/ExpenseForm.test.tsx`

- [ ] **Step 1: Write form tests**

`src/components/ExpenseForm.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CATEGORIES } from "../domain/categories";
import type { Member } from "../domain/types";
import { ExpenseForm } from "./ExpenseForm";

const members: Member[] = [
  { id: "member-me", memberKey: "me", displayName: "A" },
  { id: "member-partner", memberKey: "partner", displayName: "B" },
];

describe("ExpenseForm", () => {
  it("submits a default equal split expense", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ExpenseForm
        categories={DEFAULT_CATEGORIES}
        members={members}
        selectedMemberId="member-me"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Amount"), "128.50");
    await user.selectOptions(screen.getByLabelText("Category"), "cat-dining");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-06-16");
    await user.type(screen.getByLabelText("Note"), "dinner");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        amountCents: 12850,
        categoryId: "cat-dining",
        spentOn: "2026-06-16",
        note: "dinner",
        createdByMemberId: "member-me",
        paidByMemberId: "member-me",
        splitMode: "equal",
      }),
    );
  });

  it("shows validation errors for invalid amount", async () => {
    const user = userEvent.setup();
    render(
      <ExpenseForm
        categories={DEFAULT_CATEGORIES}
        members={members}
        selectedMemberId="member-me"
        onSubmit={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Amount"), "0");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Amount must be greater than 0")).toBeInTheDocument();
  });

  it("submits custom split shares", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ExpenseForm
        categories={DEFAULT_CATEGORIES}
        members={members}
        selectedMemberId="member-me"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Amount"), "100");
    await user.selectOptions(screen.getByLabelText("Split mode"), "custom");
    await user.type(screen.getByLabelText("A share"), "30");
    await user.type(screen.getByLabelText("B share"), "70");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        amountCents: 10000,
        splitMode: "custom",
        customShares: {
          "member-me": 3000,
          "member-partner": 7000,
        },
      }),
    );
  });
});
```

- [ ] **Step 2: Implement `ExpenseForm`**

`src/components/ExpenseForm.tsx`:

```tsx
import { useState } from "react";
import { parseAmountToCents } from "../domain/money";
import type { Category, Member, SplitMode } from "../domain/types";

export interface ExpenseFormSubmit {
  amountCents: number;
  categoryId: string;
  spentOn: string;
  note: string;
  createdByMemberId: string;
  paidByMemberId: string;
  splitMode: SplitMode;
  customShares?: Record<string, number>;
  responsibleMemberId?: string;
}

export function ExpenseForm({
  categories,
  members,
  selectedMemberId,
  onSubmit,
}: {
  categories: Category[];
  members: Member[];
  selectedMemberId: string;
  onSubmit: (value: ExpenseFormSubmit) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [spentOn, setSpentOn] = useState(today);
  const [note, setNote] = useState("");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [responsibleMemberId, setResponsibleMemberId] = useState(selectedMemberId);
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  function submit() {
    const parsed = parseAmountToCents(amount);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    if (!spentOn) {
      setError("Date is required");
      return;
    }

    let customShareCents: Record<string, number> | undefined;
    if (splitMode === "custom") {
      customShareCents = {};
      for (const member of members) {
        const share = parseAmountToCents(customShares[member.id] ?? "");
        if (!share.ok) {
          setError(`${member.displayName} share is invalid`);
          return;
        }
        customShareCents[member.id] = share.cents;
      }

      const total = Object.values(customShareCents).reduce((sum, cents) => sum + cents, 0);
      if (total !== parsed.cents) {
        setError("Custom shares must equal the total amount");
        return;
      }
    }

    setError("");
    onSubmit({
      amountCents: parsed.cents,
      categoryId,
      spentOn,
      note: note.trim(),
      createdByMemberId: selectedMemberId,
      paidByMemberId: selectedMemberId,
      splitMode,
      responsibleMemberId: splitMode === "single" ? responsibleMemberId : undefined,
      customShares: customShareCents,
    });
  }

  return (
    <form className="stack" onSubmit={(event) => event.preventDefault()}>
      <label className="field">
        <span>Amount</span>
        <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
      </label>
      <label className="field">
        <span>Category</span>
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Date</span>
        <input type="date" value={spentOn} onChange={(event) => setSpentOn(event.target.value)} />
      </label>
      <label className="field">
        <span>Note</span>
        <input value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      <details>
        <summary>Split settings</summary>
        <label className="field">
          <span>Split mode</span>
          <select value={splitMode} onChange={(event) => setSplitMode(event.target.value as SplitMode)}>
            <option value="equal">50/50</option>
            <option value="single">Paid by me only</option>
            <option value="custom">Custom amount</option>
          </select>
        </label>
        {splitMode === "single" ? (
          <label className="field">
            <span>Responsible member</span>
            <select value={responsibleMemberId} onChange={(event) => setResponsibleMemberId(event.target.value)}>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.displayName}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {splitMode === "custom"
          ? members.map((member) => (
              <label className="field" key={member.id}>
                <span>{member.displayName} share</span>
                <input
                  inputMode="decimal"
                  value={customShares[member.id] ?? ""}
                  onChange={(event) =>
                    setCustomShares((current) => ({
                      ...current,
                      [member.id]: event.target.value,
                    }))
                  }
                />
              </label>
            ))
          : null}
      </details>
      {error ? <p className="error">{error}</p> : null}
      <button className="primary-button" type="button" onClick={submit}>
        Save
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Run form tests**

Run:

```powershell
npm.cmd run test:run -- src/components/ExpenseForm.test.tsx
```

Expected: form tests pass.

- [ ] **Step 4: Commit form**

```powershell
git add src/components/ExpenseForm.tsx src/components/ExpenseForm.test.tsx
git commit -m "feat: add expense form"
```

## Task 8: Screens, Navigation, And App Wiring

**Files:**
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/ExpenseList.tsx`
- Create: `src/components/MonthSelector.tsx`
- Create: `src/screens/HomeScreen.tsx`
- Create: `src/screens/HomeScreen.test.tsx`
- Create: `src/screens/DetailsScreen.tsx`
- Create: `src/screens/StatisticsScreen.tsx`
- Create: `src/screens/SettingsScreen.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write home screen test**

`src/screens/HomeScreen.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Expense, Member } from "../domain/types";
import { HomeScreen } from "./HomeScreen";

const members: Member[] = [
  { id: "member-me", memberKey: "me", displayName: "A" },
  { id: "member-partner", memberKey: "partner", displayName: "B" },
];

const expenses: Expense[] = [
  {
    id: "expense-1",
    ledgerId: "ledger-demo",
    amountCents: 12800,
    categoryId: "cat-dining",
    spentOn: "2026-06-16",
    note: "dinner",
    createdByMemberId: "member-me",
    paidByMemberId: "member-me",
    splitMode: "equal",
    splits: [
      { memberId: "member-me", shareCents: 6400 },
      { memberId: "member-partner", shareCents: 6400 },
    ],
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
  },
];

describe("HomeScreen", () => {
  it("shows current month total and recent expenses", () => {
    render(<HomeScreen members={members} expenses={expenses} monthKey="2026-06" onAddExpense={() => undefined} />);
    expect(screen.getByText("\u00a5128.00")).toBeInTheDocument();
    expect(screen.getByText("1 record")).toBeInTheDocument();
    expect(screen.getByText("dinner")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement navigation and screens**

`src/components/BottomNav.tsx`:

```tsx
import { BarChart3, Home, List, Settings } from "lucide-react";

export type TabKey = "home" | "details" | "statistics" | "settings";

const tabs = [
  { key: "home" as const, label: "Home", icon: Home },
  { key: "details" as const, label: "Details", icon: List },
  { key: "statistics" as const, label: "Stats", icon: BarChart3 },
  { key: "settings" as const, label: "Settings", icon: Settings },
];

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            className={active === tab.key ? "bottom-nav-item active" : "bottom-nav-item"}
            onClick={() => onChange(tab.key)}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

`src/components/ExpenseList.tsx`:

```tsx
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
    return <p className="empty">No expenses for this month.</p>;
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <article className="expense-row" key={expense.id}>
          <div>
            <strong>{expense.note || "Shared expense"}</strong>
            <span>{expense.spentOn}</span>
          </div>
          <div className="expense-row-actions">
            <strong>{formatCents(expense.amountCents)}</strong>
            {onDelete ? (
              <button type="button" onClick={() => onDelete(expense.id)}>
                Delete
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
```

`src/components/MonthSelector.tsx`:

```tsx
import { shiftMonth, type MonthKey } from "../domain/month";

export function MonthSelector({ value, onChange }: { value: MonthKey; onChange: (month: MonthKey) => void }) {
  return (
    <div className="month-selector">
      <button type="button" onClick={() => onChange(shiftMonth(value, -1))}>
        Prev
      </button>
      <strong>{value}</strong>
      <button type="button" onClick={() => onChange(shiftMonth(value, 1))}>
        Next
      </button>
    </div>
  );
}
```

`src/screens/HomeScreen.tsx`:

```tsx
import { calculateMonthlySummary } from "../domain/balance";
import { formatCents } from "../domain/money";
import type { MonthKey } from "../domain/month";
import type { Expense, Member } from "../domain/types";
import { ExpenseList } from "../components/ExpenseList";

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
        <small>{summary.expenseCount} record{summary.expenseCount === 1 ? "" : "s"}</small>
      </div>
      <button className="primary-button" type="button" onClick={onAddExpense}>
        Add expense
      </button>
      <h2>Recent</h2>
      <ExpenseList expenses={recent} />
    </section>
  );
}
```

`src/screens/DetailsScreen.tsx`:

```tsx
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
      <h1>Details</h1>
      <MonthSelector value={monthKey} onChange={onMonthChange} />
      <ExpenseList expenses={expenses.filter((expense) => expense.spentOn.startsWith(monthKey))} onDelete={onDeleteExpense} />
    </section>
  );
}
```

`src/screens/StatisticsScreen.tsx`:

```tsx
import { calculateMonthlySummary } from "../domain/balance";
import { formatCents } from "../domain/money";
import type { MonthKey } from "../domain/month";
import type { Expense, Member } from "../domain/types";
import { MonthSelector } from "../components/MonthSelector";

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
      <h1>Statistics</h1>
      <MonthSelector value={monthKey} onChange={onMonthChange} />
      <div className="metric-card">
        <span>Total</span>
        <strong>{formatCents(summary.totalCents)}</strong>
      </div>
      <div className="metric-card">
        <span>Monthly settlement suggestion</span>
        <strong>{settlement && from && to ? `${from.displayName} -> ${to.displayName} ${formatCents(settlement.amountCents)}` : "Balanced"}</strong>
      </div>
    </section>
  );
}
```

`src/screens/SettingsScreen.tsx`:

```tsx
import type { Ledger } from "../domain/types";

export function SettingsScreen({
  ledger,
  selectedMemberId,
  onReset,
}: {
  ledger: Ledger;
  selectedMemberId: string;
  onReset: () => void;
}) {
  const selectedMember = ledger.members.find((member) => member.id === selectedMemberId);
  return (
    <section className="screen">
      <h1>Settings</h1>
      <div className="settings-row">
        <span>Ledger</span>
        <strong>{ledger.name}</strong>
      </div>
      <div className="settings-row">
        <span>Identity</span>
        <strong>{selectedMember?.displayName ?? "Unknown"}</strong>
      </div>
      <p className="hint">Use the browser share menu to add this app to your phone home screen.</p>
      <button type="button" onClick={onReset}>
        Reset local setup
      </button>
    </section>
  );
}
```

- [ ] **Step 3: Wire screens in `App.tsx`**

Replace the temporary ready-state rendering in `src/app/App.tsx` with stateful tabs, month loading, create, and delete functions using `api`.

```tsx
// Add imports:
import { useEffect, useMemo, useState } from "react";
import { BottomNav, type TabKey } from "../components/BottomNav";
import { ExpenseForm, type ExpenseFormSubmit } from "../components/ExpenseForm";
import { getCurrentMonthKey, type MonthKey } from "../domain/month";
import type { Expense } from "../domain/types";
import { HomeScreen } from "../screens/HomeScreen";
import { DetailsScreen } from "../screens/DetailsScreen";
import { StatisticsScreen } from "../screens/StatisticsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { clearLocalSettings } from "../storage/localSettings";
```

Use this ready-state rendering body:

```tsx
const [activeTab, setActiveTab] = useState<TabKey>("home");
const [monthKey, setMonthKey] = useState<MonthKey>(getCurrentMonthKey());
const [expenses, setExpenses] = useState<Expense[]>([]);
const [showForm, setShowForm] = useState(false);

useEffect(() => {
  if (!state.ledgerKey || !state.ledger) return;
  void api.listMonth({ ledgerKey: state.ledgerKey, monthKey }).then((result) => setExpenses(result.expenses));
}, [api, monthKey, state.ledger, state.ledgerKey]);

async function submitExpense(value: ExpenseFormSubmit) {
  if (!state.ledgerKey) return;
  const created = await api.createExpense({ ledgerKey: state.ledgerKey, ...value });
  setExpenses((current) => [created, ...current]);
  setShowForm(false);
}

async function deleteExpense(expenseId: string) {
  if (!state.ledgerKey) return;
  if (!window.confirm("Delete this expense?")) return;
  await api.deleteExpense({ ledgerKey: state.ledgerKey, id: expenseId });
  setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
}

if (!state.ledger) return null;

return (
  <main className="app-shell">
    {showForm ? (
      <section className="screen">
        <button type="button" onClick={() => setShowForm(false)}>Back</button>
        <h1>Add expense</h1>
        <ExpenseForm
          categories={DEFAULT_CATEGORIES}
          members={state.ledger.members}
          selectedMemberId={state.selectedMemberId}
          onSubmit={submitExpense}
        />
      </section>
    ) : activeTab === "home" ? (
      <HomeScreen members={state.ledger.members} expenses={expenses} monthKey={monthKey} onAddExpense={() => setShowForm(true)} />
    ) : activeTab === "details" ? (
      <DetailsScreen expenses={expenses} monthKey={monthKey} onMonthChange={setMonthKey} onDeleteExpense={deleteExpense} />
    ) : activeTab === "statistics" ? (
      <StatisticsScreen members={state.ledger.members} expenses={expenses} monthKey={monthKey} onMonthChange={setMonthKey} />
    ) : (
      <SettingsScreen ledger={state.ledger} selectedMemberId={state.selectedMemberId} onReset={() => { clearLocalSettings(); window.location.reload(); }} />
    )}
    <BottomNav active={activeTab} onChange={setActiveTab} />
  </main>
);
```

- [ ] **Step 4: Add mobile-first CSS**

Append to `src/styles.css`:

```css
.app-shell {
  min-height: 100vh;
  padding-bottom: 76px;
  background: #f7f8fb;
}

.screen {
  width: min(100%, 720px);
  margin: 0 auto;
  padding: 18px 16px 28px;
}

.screen-header,
.settings-row,
.expense-row,
.expense-row-actions,
.month-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.stack {
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

.field input,
.field select {
  min-height: 44px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fff;
}

.primary-button,
.month-selector button,
.bottom-nav-item,
.expense-row button,
.settings-row + button {
  border: 0;
  border-radius: 8px;
  min-height: 44px;
  padding: 10px 12px;
  font-weight: 600;
}

.primary-button {
  width: 100%;
  background: #2563eb;
  color: #fff;
}

.metric-card,
.expense-row,
.settings-row {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px;
  background: #fff;
}

.metric-card {
  display: grid;
  gap: 6px;
  margin: 14px 0;
}

.metric-card strong {
  font-size: 28px;
}

.expense-list {
  display: grid;
  gap: 10px;
}

.expense-row span,
.hint,
.empty {
  color: #667085;
  font-size: 14px;
}

.error {
  color: #b42318;
}

.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.96);
}

.bottom-nav-item {
  display: grid;
  justify-items: center;
  gap: 3px;
  border-radius: 0;
  background: transparent;
  color: #667085;
}

.bottom-nav-item.active {
  color: #2563eb;
}
```

- [ ] **Step 5: Run screen tests and full tests**

Run:

```powershell
npm.cmd run test:run -- src/screens/HomeScreen.test.tsx src/app/App.test.tsx
npm.cmd run test:run
```

Expected: all tests pass.

- [ ] **Step 6: Commit UI screens**

```powershell
git add src
git commit -m "feat: add mobile expense screens"
```

## Task 9: PWA Manifest And Install Assets

**Files:**
- Create: `public/icon.svg`
- Create: `public/apple-touch-icon.svg`
- Modify: `vite.config.ts`
- Modify: `index.html`

- [ ] **Step 1: Add icon assets**

`public/icon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#2563eb"/>
  <circle cx="160" cy="180" r="52" fill="#ffffff"/>
  <circle cx="352" cy="180" r="52" fill="#dbeafe"/>
  <path d="M112 320c38-46 87-69 144-69s106 23 144 69v72H112z" fill="#ffffff"/>
  <path d="M152 345h208" stroke="#2563eb" stroke-width="28" stroke-linecap="round"/>
</svg>
```

`public/apple-touch-icon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#2563eb"/>
  <circle cx="160" cy="180" r="52" fill="#ffffff"/>
  <circle cx="352" cy="180" r="52" fill="#dbeafe"/>
  <path d="M112 320c38-46 87-69 144-69s106 23 144 69v72H112z" fill="#ffffff"/>
  <path d="M152 345h208" stroke="#2563eb" stroke-width="28" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 2: Configure PWA plugin**

Update `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Shared Expense",
        short_name: "Expenses",
        description: "Private shared expense ledger for two people.",
        start_url: "/",
        display: "standalone",
        background_color: "#f7f8fb",
        theme_color: "#2563eb",
        icons: [
          {
            src: "/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    globals: true,
  },
});
```

- [ ] **Step 3: Add iOS meta tags**

Update `index.html` head:

```html
<meta name="theme-color" content="#2563eb" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="Expenses" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
```

- [ ] **Step 4: Build the PWA**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds and `dist/manifest.webmanifest` exists.

- [ ] **Step 5: Commit PWA assets**

```powershell
git add public vite.config.ts index.html
git commit -m "feat: add PWA install metadata"
```

## Task 10: Supabase Schema And Ledger Seed Script

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `scripts/create-ledger.mjs`
- Create: `.env.example`

- [ ] **Step 1: Create Supabase schema migration**

`supabase/migrations/001_initial_schema.sql`:

```sql
create extension if not exists pgcrypto;

create table public.ledgers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  access_key_hash text not null unique,
  created_at timestamptz not null default now()
);

create table public.ledger_members (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references public.ledgers(id) on delete cascade,
  member_key text not null check (member_key in ('me', 'partner')),
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (ledger_id, member_key)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid references public.ledgers(id) on delete cascade,
  key text not null,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  unique (ledger_id, key)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references public.ledgers(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  category_id uuid not null references public.categories(id),
  spent_on date not null,
  note text not null default '',
  created_by_member_id uuid not null references public.ledger_members(id),
  paid_by_member_id uuid not null references public.ledger_members(id),
  split_mode text not null check (split_mode in ('equal', 'single', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  member_id uuid not null references public.ledger_members(id),
  share_cents integer not null check (share_cents >= 0),
  unique (expense_id, member_id)
);

alter table public.ledgers enable row level security;
alter table public.ledger_members enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;

create index expenses_ledger_spent_on_idx on public.expenses (ledger_id, spent_on desc);
create index expense_splits_expense_id_idx on public.expense_splits (expense_id);
```

- [ ] **Step 2: Add seed script**

`scripts/create-ledger.mjs`:

```js
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ledgerKey = process.env.LEDGER_ACCESS_KEY;

if (!url || !serviceRoleKey || !ledgerKey) {
  throw new Error("Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and LEDGER_ACCESS_KEY");
}

const client = createClient(url, serviceRoleKey);
const accessKeyHash = createHash("sha256").update(ledgerKey).digest("hex");

const { data: ledger, error: ledgerError } = await client
  .from("ledgers")
  .insert({ name: "Shared Ledger", access_key_hash: accessKeyHash })
  .select()
  .single();

if (ledgerError) throw ledgerError;

const { error: memberError } = await client.from("ledger_members").insert([
  { ledger_id: ledger.id, member_key: "me", display_name: "A" },
  { ledger_id: ledger.id, member_key: "partner", display_name: "B" },
]);

if (memberError) throw memberError;

const categories = [
  ["dining", "\u9910\u996e", 10],
  ["groceries_daily", "\u8d85\u5e02\u65e5\u7528", 20],
  ["rent_utilities", "\u623f\u79df\u6c34\u7535", 30],
  ["transport", "\u4ea4\u901a", 40],
  ["entertainment", "\u5a31\u4e50", 50],
  ["medical", "\u533b\u7597", 60],
  ["travel", "\u65c5\u884c", 70],
  ["other", "\u5176\u4ed6", 80],
].map(([key, name, sort_order]) => ({ ledger_id: ledger.id, key, name, sort_order }));

const { error: categoryError } = await client.from("categories").insert(categories);
if (categoryError) throw categoryError;

console.log(`Created ledger ${ledger.id}`);
```

- [ ] **Step 3: Add `.env.example`**

`.env.example`:

```ini
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_USE_MOCK_API=true

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
LEDGER_ACCESS_KEY=
```

- [ ] **Step 4: Commit schema and seed script**

```powershell
git add supabase scripts .env.example
git commit -m "feat: add Supabase ledger schema"
```

## Task 11: Supabase Edge Function API

**Files:**
- Create: `supabase/functions/ledger-api/index.ts`

- [ ] **Step 1: Create Edge Function handler**

`supabase/functions/ledger-api/index.ts`:

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const body = await request.json();
    const ledger = await findLedger(supabase, body.ledgerKey);

    switch (body.action) {
      case "bootstrap":
        return json(await bootstrap(supabase, ledger.id));
      case "listMonth":
        return json(await listMonth(supabase, ledger.id, body.monthKey));
      case "createExpense":
        return json(await createExpense(supabase, ledger.id, body));
      case "updateExpense":
        return json(await updateExpense(supabase, ledger.id, body));
      case "deleteExpense":
        await deleteExpense(supabase, ledger.id, body.id);
        return json({ ok: true });
      default:
        return json({ error: "unknown action" }, 400);
    }
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "request failed" }, 400);
  }
});

async function findLedger(supabase: any, ledgerKey: string) {
  if (!ledgerKey || typeof ledgerKey !== "string") {
    throw new Error("ledger not found or key incorrect");
  }

  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ledgerKey));
  const access_key_hash = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const { data, error } = await supabase
    .from("ledgers")
    .select("id,name")
    .eq("access_key_hash", access_key_hash)
    .single();

  if (error || !data) {
    throw new Error("ledger not found or key incorrect");
  }

  return data;
}

async function bootstrap(supabase: any, ledgerId: string) {
  const [{ data: ledger }, { data: members }] = await Promise.all([
    supabase.from("ledgers").select("id,name").eq("id", ledgerId).single(),
    supabase.from("ledger_members").select("id,member_key,display_name").eq("ledger_id", ledgerId).order("member_key"),
  ]);

  return {
    ledger: {
      id: ledger.id,
      name: ledger.name,
      members: members.map((member: any) => ({
        id: member.id,
        memberKey: member.member_key,
        displayName: member.display_name,
      })),
    },
  };
}

async function listMonth(supabase: any, ledgerId: string, monthKey: string) {
  const from = `${monthKey}-01`;
  const to = nextMonthStart(monthKey);
  const { data, error } = await supabase
    .from("expenses")
    .select("*, expense_splits(member_id, share_cents)")
    .eq("ledger_id", ledgerId)
    .gte("spent_on", from)
    .lt("spent_on", to)
    .order("spent_on", { ascending: false });

  if (error) throw error;

  return {
    expenses: data.map(mapExpense),
  };
}

async function createExpense(supabase: any, ledgerId: string, body: any) {
  const splits = await buildSplits(supabase, ledgerId, body);
  validateSplits(body.amountCents, splits);
  const expense = await insertExpense(supabase, ledgerId, body, splits);
  return expense;
}

async function updateExpense(supabase: any, ledgerId: string, body: any) {
  const splits = await buildSplits(supabase, ledgerId, body);
  validateSplits(body.amountCents, splits);
  await supabase.from("expense_splits").delete().eq("expense_id", body.id);
  const { error } = await supabase
    .from("expenses")
    .update({
      amount_cents: body.amountCents,
      category_id: body.categoryId,
      spent_on: body.spentOn,
      note: body.note ?? "",
      paid_by_member_id: body.paidByMemberId,
      split_mode: body.splitMode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .eq("ledger_id", ledgerId);

  if (error) throw error;
  await insertSplits(supabase, body.id, splits);
  return { ...body, splits };
}

async function deleteExpense(supabase: any, ledgerId: string, id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("ledger_id", ledgerId);
  if (error) throw error;
}

async function insertExpense(supabase: any, ledgerId: string, body: any, splits: Array<{ memberId: string; shareCents: number }>) {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      ledger_id: ledgerId,
      amount_cents: body.amountCents,
      category_id: body.categoryId,
      spent_on: body.spentOn,
      note: body.note ?? "",
      created_by_member_id: body.createdByMemberId,
      paid_by_member_id: body.paidByMemberId,
      split_mode: body.splitMode,
    })
    .select()
    .single();

  if (error) throw error;
  await insertSplits(supabase, data.id, splits);
  return { ...body, id: data.id, ledgerId, splits, createdAt: data.created_at, updatedAt: data.updated_at };
}

async function buildSplits(supabase: any, ledgerId: string, body: any): Promise<Array<{ memberId: string; shareCents: number }>> {
  const { data: members, error } = await supabase
    .from("ledger_members")
    .select("id")
    .eq("ledger_id", ledgerId)
    .order("member_key");

  if (error) throw error;
  if (!members || members.length !== 2) {
    throw new Error("ledger must have exactly two members");
  }

  if (body.splitMode === "single") {
    const responsibleMemberId = body.responsibleMemberId ?? body.paidByMemberId;
    return members.map((member: any) => ({
      memberId: member.id,
      shareCents: member.id === responsibleMemberId ? body.amountCents : 0,
    }));
  }

  if (body.splitMode === "custom") {
    return members.map((member: any) => ({
      memberId: member.id,
      shareCents: Number(body.customShares?.[member.id] ?? 0),
    }));
  }

  const firstShare = Math.floor(body.amountCents / 2);
  return [
    { memberId: members[0].id, shareCents: firstShare },
    { memberId: members[1].id, shareCents: body.amountCents - firstShare },
  ];
}

function validateSplits(amountCents: number, splits: Array<{ shareCents: number }>) {
  const total = splits.reduce((sum, split) => sum + split.shareCents, 0);
  if (total !== amountCents) {
    throw new Error("split total must equal expense total");
  }
}

async function insertSplits(supabase: any, expenseId: string, splits: Array<{ memberId: string; shareCents: number }>) {
  const { error } = await supabase.from("expense_splits").insert(
    splits.map((split) => ({
      expense_id: expenseId,
      member_id: split.memberId,
      share_cents: split.shareCents,
    })),
  );
  if (error) throw error;
}

function mapExpense(row: any) {
  return {
    id: row.id,
    ledgerId: row.ledger_id,
    amountCents: row.amount_cents,
    categoryId: row.category_id,
    spentOn: row.spent_on,
    note: row.note,
    createdByMemberId: row.created_by_member_id,
    paidByMemberId: row.paid_by_member_id,
    splitMode: row.split_mode,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    splits: row.expense_splits.map((split: any) => ({
      memberId: split.member_id,
      shareCents: split.share_cents,
    })),
  };
}

function nextMonthStart(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
```

- [ ] **Step 2: Verify split generation is server-side**

Check `supabase/functions/ledger-api/index.ts` and confirm `createExpense` and `updateExpense` both call `buildSplits(...)` and `validateSplits(...)` before inserting split rows.

Run:

```powershell
rg -n "buildSplits|validateSplits" supabase/functions/ledger-api/index.ts
```

Expected: the command prints references from both mutation handlers and from the helper definitions.

- [ ] **Step 3: Commit Edge Function**

```powershell
git add supabase/functions
git commit -m "feat: add Supabase ledger edge function"
```

## Task 12: Supabase Client Wrapper And API Selection

**Files:**
- Create: `src/api/supabaseLedgerApi.ts`
- Create: `src/api/supabaseLedgerApi.test.ts`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Write Supabase API client tests**

`src/api/supabaseLedgerApi.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseLedgerApi } from "./supabaseLedgerApi";

describe("createSupabaseLedgerApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts bootstrap requests to the ledger function", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ ledger: { id: "ledger-1", name: "Shared Ledger", members: [] } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const api = createSupabaseLedgerApi({
      functionUrl: "https://example.supabase.co/functions/v1/ledger-api",
      anonKey: "anon-key",
      fetchImpl: fetchMock,
    });

    await api.bootstrap({ ledgerKey: "secret" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/functions/v1/ledger-api",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          apikey: "anon-key",
          authorization: "Bearer anon-key",
        }),
      }),
    );
  });
});
```

- [ ] **Step 2: Implement Supabase API client**

`src/api/supabaseLedgerApi.ts`:

```ts
import type {
  BootstrapRequest,
  CreateExpenseRequest,
  DeleteExpenseRequest,
  LedgerApi,
  ListMonthRequest,
  UpdateExpenseRequest,
} from "./ledgerApi";

export interface SupabaseLedgerApiConfig {
  functionUrl: string;
  anonKey: string;
  fetchImpl?: typeof fetch;
}

export function createSupabaseLedgerApi(config: SupabaseLedgerApiConfig): LedgerApi {
  const fetchImpl = config.fetchImpl ?? fetch;

  async function post<T>(action: string, payload: Record<string, unknown>): Promise<T> {
    const response = await fetchImpl(config.functionUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: config.anonKey,
        authorization: `Bearer ${config.anonKey}`,
      },
      body: JSON.stringify({ action, ...payload }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "request failed");
    }

    return data as T;
  }

  return {
    bootstrap: (request: BootstrapRequest) => post("bootstrap", request),
    listMonth: (request: ListMonthRequest) => post("listMonth", request),
    createExpense: (request: CreateExpenseRequest) => post("createExpense", request),
    updateExpense: (request: UpdateExpenseRequest) => post("updateExpense", request),
    deleteExpense: (request: DeleteExpenseRequest) => post("deleteExpense", request),
  };
}
```

- [ ] **Step 3: Add API selection in `App.tsx`**

Create this helper in `src/app/App.tsx`:

```tsx
function createLedgerApi() {
  if (import.meta.env.VITE_USE_MOCK_API === "true") {
    return createMockLedgerApi();
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return createMockLedgerApi();
  }

  return createSupabaseLedgerApi({
    functionUrl: `${supabaseUrl}/functions/v1/ledger-api`,
    anonKey,
  });
}
```

Then replace `useMemo(() => createMockLedgerApi(), [])` with:

```tsx
const api = useMemo(() => createLedgerApi(), []);
```

- [ ] **Step 4: Run API client tests and full build**

Run:

```powershell
npm.cmd run test:run -- src/api/supabaseLedgerApi.test.ts
npm.cmd run build
```

Expected: tests pass and build succeeds.

- [ ] **Step 5: Commit Supabase client wrapper**

```powershell
git add src/api src/app/App.tsx
git commit -m "feat: wire Supabase ledger API client"
```

## Task 13: Final Verification And Mobile Review

**Files:**
- Modify: `docs/superpowers/specs/2026-06-16-shared-expense-pwa-design.md` only if implementation reveals a necessary spec correction.

- [ ] **Step 1: Run full automated checks**

Run:

```powershell
npm.cmd run test:run
npm.cmd run build
```

Expected: all tests pass and production build succeeds.

- [ ] **Step 2: Start local dev server**

Run:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 3: Browser verification**

Use the in-app browser to open the Vite URL and verify:

- Ledger key screen appears.
- `demo-ledger-key` opens the mock ledger.
- Selecting either identity enters the app.
- Home shows current month total and recent expenses.
- Add expense creates a record.
- Statistics shows the monthly settlement suggestion.
- Details can delete an expense after confirmation.
- Settings can reset local setup.

- [ ] **Step 4: Mobile viewport verification**

Use browser viewport checks for:

- 390x844 iPhone-like viewport.
- 412x915 Android-like viewport.
- Bottom nav remains visible.
- Buttons have stable size and text does not overflow.
- Expense form inputs fit on screen.

- [ ] **Step 5: Commit verification fixes**

If verification required code changes:

```powershell
git add src public index.html vite.config.ts
git commit -m "fix: polish mobile expense app"
```

If no code changes were required, do not create an empty commit.
