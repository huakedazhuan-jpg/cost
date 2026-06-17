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
  .insert({ name: "共同账本", access_key_hash: accessKeyHash })
  .select()
  .single();

if (ledgerError) {
  throw ledgerError;
}

const { error: memberError } = await client.from("ledger_members").insert([
  { ledger_id: ledger.id, member_key: "me", display_name: "A" },
  { ledger_id: ledger.id, member_key: "partner", display_name: "B" },
]);

if (memberError) {
  throw memberError;
}

const categories = [
  { id: "cat-dining", key: "dining", name: "\u9910\u996e", sort_order: 10 },
  { id: "cat-groceries-daily", key: "groceries_daily", name: "\u8d85\u5e02\u65e5\u7528", sort_order: 20 },
  { id: "cat-rent-utilities", key: "rent_utilities", name: "\u623f\u79df\u6c34\u7535", sort_order: 30 },
  { id: "cat-transport", key: "transport", name: "\u4ea4\u901a", sort_order: 40 },
  { id: "cat-entertainment", key: "entertainment", name: "\u5a31\u4e50", sort_order: 50 },
  { id: "cat-medical", key: "medical", name: "\u533b\u7597", sort_order: 60 },
  { id: "cat-travel", key: "travel", name: "\u65c5\u884c", sort_order: 70 },
  { id: "cat-other", key: "other", name: "\u5176\u4ed6", sort_order: 80 },
].map((category) => ({ ledger_id: ledger.id, ...category }));

const { error: categoryError } = await client.from("categories").insert(categories);

if (categoryError) {
  throw categoryError;
}

console.log(`Created ledger ${ledger.id}`);
