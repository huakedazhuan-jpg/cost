import { useEffect, useMemo } from "react";
import { createMockLedgerApi } from "../api/mockLedgerApi";
import { OnboardingScreen, type OnboardingCompletePayload } from "../screens/OnboardingScreen";
import { getLocalSettings, saveLedgerKey, saveSelectedMemberId } from "../storage/localSettings";
import { AppStateProvider, useAppDispatch, useAppState } from "./AppState";

function AppContent() {
  const api = useMemo(() => createMockLedgerApi(), []);
  const state = useAppState();
  const dispatch = useAppDispatch();

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
          dispatch({ type: "BOOTSTRAP_SUCCESS", ledgerKey: local.ledgerKey, selectedMemberId: local.selectedMemberId, ledger: result.ledger });
        }
      })
      .catch(() => {
        if (!isCancelled) {
          dispatch({ type: "ERROR", message: "ledger not found or key incorrect" });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [api, dispatch, state.ledger, state.ledgerKey, state.selectedMemberId, state.status]);

  function completeOnboarding(payload: OnboardingCompletePayload) {
    saveLedgerKey(payload.ledgerKey);
    saveSelectedMemberId(payload.selectedMemberId);
    dispatch({ type: "BOOTSTRAP_SUCCESS", ...payload });
  }

  if (state.status === "loading") {
    return (
      <main className="app-shell" aria-busy="true">
        Loading...
      </main>
    );
  }

  if (!state.ledgerKey || !state.selectedMemberId || !state.ledger) {
    return <OnboardingScreen api={api} onComplete={completeOnboarding} />;
  }

  return <main className="app-shell">Shared Expense PWA</main>;
}

export function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
