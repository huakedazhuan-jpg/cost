import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_CATEGORIES } from "../domain/categories";

const migration = readFileSync("supabase/migrations/001_initial_schema.sql", "utf8");
const createLedgerScript = readFileSync("scripts/create-ledger.mjs", "utf8");

describe("Supabase category contract", () => {
  it("stores frontend category ids as ledger-scoped text foreign keys", () => {
    expect(migration).toMatch(/create table public\.categories \(\s*ledger_id uuid not null/s);
    expect(migration).toMatch(/id text not null/);
    expect(migration).toMatch(/primary key \(ledger_id, id\)/);
    expect(migration).toMatch(/category_id text not null/);
    expect(migration).toMatch(/foreign key \(ledger_id, category_id\) references public\.categories\(ledger_id, id\)/);
  });

  it("seeds Supabase with the same category ids used by the UI", () => {
    for (const category of DEFAULT_CATEGORIES) {
      expect(createLedgerScript).toContain(`id: "${category.id}"`);
    }
  });
});
