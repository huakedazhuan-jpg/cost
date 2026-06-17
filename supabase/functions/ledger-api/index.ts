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
