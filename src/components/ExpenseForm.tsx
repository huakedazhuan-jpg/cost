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
      <details open>
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
