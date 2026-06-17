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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLedgerKey() {
    const submittedLedgerKey = ledgerKey.trim();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await api.bootstrap({ ledgerKey: submittedLedgerKey });
      setLedgerKey(submittedLedgerKey);
      setLedger(result.ledger);
    } catch {
      setError("ledger not found or key incorrect");
    } finally {
      setIsSubmitting(false);
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
      <button className="primary-button" type="button" onClick={submitLedgerKey} disabled={isSubmitting}>
        Continue
      </button>
    </section>
  );
}
