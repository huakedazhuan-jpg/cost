import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import type { Ledger } from "../domain/types";

export type AppStatus = "setup" | "loading" | "ready" | "error";

export interface AppState {
  status: AppStatus;
  ledgerKey: string;
  selectedMemberId: string;
  ledger?: Ledger;
  error: string;
}

export type AppAction =
  | { type: "LOADING" }
  | { type: "BOOTSTRAP_SUCCESS"; ledgerKey: string; selectedMemberId: string; ledger: Ledger }
  | { type: "SELECT_MEMBER"; selectedMemberId: string }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

export const initialAppState: AppState = {
  status: "setup",
  ledgerKey: "",
  selectedMemberId: "",
  error: "",
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOADING":
      return { ...state, status: "loading", error: "" };
    case "BOOTSTRAP_SUCCESS":
      return {
        status: "ready",
        ledgerKey: action.ledgerKey,
        selectedMemberId: action.selectedMemberId,
        ledger: action.ledger,
        error: "",
      };
    case "SELECT_MEMBER":
      return { ...state, selectedMemberId: action.selectedMemberId };
    case "ERROR":
      return { ...state, status: "error", error: action.message };
    case "RESET":
      return initialAppState;
  }
}

const StateContext = createContext<AppState | undefined>(undefined);
const DispatchContext = createContext<Dispatch<AppAction> | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const value = useContext(StateContext);
  if (!value) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return value;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const value = useContext(DispatchContext);
  if (!value) {
    throw new Error("useAppDispatch must be used inside AppStateProvider");
  }
  return value;
}
