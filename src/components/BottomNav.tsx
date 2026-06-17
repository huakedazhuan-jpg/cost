import { BarChart3, Home, List, Settings } from "lucide-react";

export type TabKey = "home" | "details" | "statistics" | "settings";

const tabs = [
  { key: "home" as const, label: "Home", icon: Home },
  { key: "details" as const, label: "Details", icon: List },
  { key: "statistics" as const, label: "Stats", icon: BarChart3 },
  { key: "settings" as const, label: "Settings", icon: Settings },
];

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            className={active === tab.key ? "bottom-nav-item active" : "bottom-nav-item"}
            onClick={() => onChange(tab.key)}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
