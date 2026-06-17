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
      <h1>设置</h1>
      <div className="settings-row">
        <span>账本</span>
        <strong>{ledger.name}</strong>
      </div>
      <div className="settings-row">
        <span>当前身份</span>
        <strong>{selectedMember?.displayName ?? "未知"}</strong>
      </div>
      <p className="hint">可以通过浏览器分享菜单把这个应用添加到手机桌面。</p>
      <button type="button" onClick={onReset}>
        重置本机设置
      </button>
    </section>
  );
}
