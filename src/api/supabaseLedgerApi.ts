import type {
  BootstrapRequest,
  CreateExpenseRequest,
  DeleteExpenseRequest,
  LedgerApi,
  ListMonthRequest,
  UpdateExpenseRequest,
} from "./ledgerApi";

export interface SupabaseLedgerApiConfig {
  functionUrl: string;
  anonKey: string;
  fetchImpl?: typeof fetch;
}

export function createSupabaseLedgerApi(config: SupabaseLedgerApiConfig): LedgerApi {
  const fetchImpl = config.fetchImpl ?? fetch;

  async function post<T>(action: string, payload: object): Promise<T> {
    const response = await fetchImpl(config.functionUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: config.anonKey,
        authorization: `Bearer ${config.anonKey}`,
      },
      body: JSON.stringify({ action, ...payload }),
    });

    const data: unknown = await response.json();
    if (!response.ok) {
      const message =
        typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
          ? data.error
          : "request failed";
      throw new Error(message);
    }

    return data as T;
  }

  return {
    bootstrap: (request: BootstrapRequest) => post("bootstrap", request),
    listMonth: (request: ListMonthRequest) => post("listMonth", request),
    createExpense: (request: CreateExpenseRequest) => post("createExpense", request),
    updateExpense: (request: UpdateExpenseRequest) => post("updateExpense", request),
    deleteExpense: (request: DeleteExpenseRequest) => post("deleteExpense", request),
  };
}
