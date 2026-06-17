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
