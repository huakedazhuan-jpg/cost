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
