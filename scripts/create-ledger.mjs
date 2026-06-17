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

if (categoryError) {
  throw categoryError;
}

console.log(`Created ledger ${ledger.id}`);
