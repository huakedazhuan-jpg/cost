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
    saveLedgerKey("  secret-ledger-key  ");
    saveSelectedMemberId("member-me");

    expect(getLocalSettings()).toEqual({
      ledgerKey: "secret-ledger-key",
      selectedMemberId: "member-me",
    });
    expect(localStorage.getItem("shared-expense-pwa:ledger-key")).toBe(
      "secret-ledger-key",
    );
    expect(localStorage.getItem("shared-expense-pwa:selected-member-id")).toBe(
      "member-me",
    );
  });

  it("clears both values", () => {
    saveLedgerKey("secret-ledger-key");
    saveSelectedMemberId("member-me");
    clearLocalSettings();

    expect(getLocalSettings()).toEqual({ ledgerKey: "", selectedMemberId: "" });
  });
});
