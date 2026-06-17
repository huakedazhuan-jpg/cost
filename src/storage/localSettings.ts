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
