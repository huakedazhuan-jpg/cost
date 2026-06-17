import type { Ledger } from "../domain/types";

export function SettingsScreen({
  ledger,
  selectedMemberId,
  onReset,
}: {
  ledger: Ledger;
  selectedMemberId: string;
  onReset: () => void;
}) {
  const selectedMember = ledger.members.find((member) => member.id === selectedMemberId);

  return (
    <section className="screen">
      <h1>Settings</h1>
      <div className="settings-row">
        <span>Ledger</span>
        <strong>{ledger.name}</strong>
      </div>
      <div className="settings-row">
        <span>Identity</span>
        <strong>{selectedMember?.displayName ?? "Unknown"}</strong>
      </div>
      <p className="hint">Use the browser share menu to add this app to your phone home screen.</p>
      <button type="button" onClick={onReset}>
        Reset local setup
      </button>
    </section>
  );
}
