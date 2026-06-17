import { useEffect, useMemo, useState } from "react";
import { createMockLedgerApi } from "../api/mockLedgerApi";
import { createSupabaseLedgerApi } from "../api/supabaseLedgerApi";
import { BottomNav, type TabKey } from "../components/BottomNav";
import { ExpenseForm, type ExpenseFormSubmit } from "../components/ExpenseForm";
import { DEFAULT_CATEGORIES } from "../domain/categories";
import { getCurrentMonthKey, type MonthKey } from "../domain/month";
import type { Expense } from "../domain/types";
import { DetailsScreen } from "../screens/DetailsScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { OnboardingScreen, type OnboardingCompletePayload } from "../screens/OnboardingScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { StatisticsScreen } from "../screens/StatisticsScreen";
import { clearLocalSettings, getLocalSettings, saveLedgerKey, saveSelectedMemberId } from "../storage/localSettings";
import { AppStateProvider, useAppDispatch, useAppState } from "./AppState";

function createLedgerApi() {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

  if (env.VITE_USE_MOCK_API === "true") {
    return createMockLedgerApi();
  }

  const supabaseUrl = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return createMockLedgerApi();
  }

  return createSupabaseLedgerApi({
    functionUrl: `${supabaseUrl}/functions/v1/ledger-api`,
    anonKey,
  });
}

function AppContent() {
  const api = useMemo(() => createLedgerApi(), []);
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [monthKey, setMonthKey] = useState<MonthKey>(getCurrentMonthKey());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (state.status !== "setup" || state.ledgerKey || state.selectedMemberId || state.ledger) {
      return;
    }

    const local = getLocalSettings();
    if (!local.ledgerKey || !local.selectedMemberId) {
      return;
    }

    let isCancelled = false;
    dispatch({ type: "LOADING" });

    void api
      .bootstrap({ ledgerKey: local.ledgerKey })
      .then((result) => {
        if (!isCancelled) {
          dispatch({
            type: "BOOTSTRAP_SUCCESS",
            ledgerKey: local.ledgerKey,
            selectedMemberId: local.selectedMemberId,
            ledger: result.ledger,
          });
        }
      })
      .catch(() => {
        if (!isCancelled) {
          dispatch({ type: "ERROR", message: "账本不存在或密钥不正确" });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [api, dispatch, state.ledger, state.ledgerKey, state.selectedMemberId, state.status]);

  useEffect(() => {
    if (!state.ledgerKey || !state.ledger) {
      return;
    }

    let isCancelled = false;
    void api.listMonth({ ledgerKey: state.ledgerKey, monthKey }).then((result) => {
      if (!isCancelled) {
        setExpenses(result.expenses);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [api, monthKey, state.ledger, state.ledgerKey]);

  function completeOnboarding(payload: OnboardingCompletePayload) {
    saveLedgerKey(payload.ledgerKey);
    saveSelectedMemberId(payload.selectedMemberId);
    dispatch({ type: "BOOTSTRAP_SUCCESS", ...payload });
  }

  async function submitExpense(value: ExpenseFormSubmit) {
    if (!state.ledgerKey) {
      return;
    }

    const created = await api.createExpense({ ledgerKey: state.ledgerKey, ...value });
    setExpenses((current) => [created, ...current]);
    setShowForm(false);
  }

  async function deleteExpense(expenseId: string) {
    if (!state.ledgerKey) {
      return;
    }

    if (!window.confirm("确定删除这笔支出吗？")) {
      return;
    }

    await api.deleteExpense({ ledgerKey: state.ledgerKey, id: expenseId });
    setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
  }

  function resetLocalSetup() {
    clearLocalSettings();
    window.location.reload();
  }

  if (state.status === "loading") {
    return (
      <main className="app-shell" aria-busy="true">
        加载中...
      </main>
    );
  }

  if (!state.ledgerKey || !state.selectedMemberId || !state.ledger) {
    return <OnboardingScreen api={api} onComplete={completeOnboarding} />;
  }

  return (
    <main className="app-shell">
      {showForm ? (
        <section className="screen">
          <button type="button" onClick={() => setShowForm(false)}>
            返回
          </button>
          <h1>新增支出</h1>
          <ExpenseForm
            categories={DEFAULT_CATEGORIES}
            members={state.ledger.members}
            selectedMemberId={state.selectedMemberId}
            onSubmit={submitExpense}
          />
        </section>
      ) : activeTab === "home" ? (
        <HomeScreen members={state.ledger.members} expenses={expenses} monthKey={monthKey} onAddExpense={() => setShowForm(true)} />
      ) : activeTab === "details" ? (
        <DetailsScreen expenses={expenses} monthKey={monthKey} onMonthChange={setMonthKey} onDeleteExpense={deleteExpense} />
      ) : activeTab === "statistics" ? (
        <StatisticsScreen members={state.ledger.members} expenses={expenses} monthKey={monthKey} onMonthChange={setMonthKey} />
      ) : (
        <SettingsScreen ledger={state.ledger} selectedMemberId={state.selectedMemberId} onReset={resetLocalSetup} />
      )}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </main>
  );
}

export function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
