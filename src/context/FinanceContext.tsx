import React, { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { Transaction, UserRole, FinanceState, TransactionFilters } from "@/types/finance";
import { financeApi, type FinanceApi } from "@/api/financeApi";
import { writeTransactionsToStorage } from "@/lib/financeStorage";
import { selectFilteredTransactions, selectTotals } from "@/lib/financeSelectors";
import type { FinanceActions } from "./finance-context";
import { FinanceContext } from "./finance-context";

const STORAGE_PREFERENCES = "finance_preferences";

const DEFAULT_FILTERS: TransactionFilters = {
  searchQuery: "",
  filterType: "all",
  filterCategory: "all",
  sortField: "date",
  sortDirection: "desc",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
  groupBy: "none",
};

function loadPreferences(): Pick<FinanceState, "role" | "filters"> {
  try {
    const raw = localStorage.getItem(STORAGE_PREFERENCES);
    if (!raw) return { role: "admin", filters: { ...DEFAULT_FILTERS } };
    const p = JSON.parse(raw) as { role?: unknown; filters?: Partial<TransactionFilters> };
    const role = p.role === "viewer" || p.role === "admin" ? p.role : "admin";
    const filters: TransactionFilters = {
      ...DEFAULT_FILTERS,
      ...p.filters,
      filterType:
        p.filters?.filterType === "all" || p.filters?.filterType === "income" || p.filters?.filterType === "expense"
          ? p.filters.filterType
          : DEFAULT_FILTERS.filterType,
      filterCategory: p.filters?.filterCategory ?? DEFAULT_FILTERS.filterCategory,
      sortField: p.filters?.sortField === "amount" ? "amount" : "date",
      sortDirection: p.filters?.sortDirection === "asc" ? "asc" : "desc",
      groupBy:
        p.filters?.groupBy === "category" || p.filters?.groupBy === "type" || p.filters?.groupBy === "month"
          ? p.filters.groupBy
          : "none",
    };
    return { role, filters };
  } catch {
    /* ignore */
  }
  return { role: "admin", filters: { ...DEFAULT_FILTERS } };
}

function getInitialState(): FinanceState {
  const { role, filters } = loadPreferences();
  return {
    transactions: [],
    role,
    filters,
    dataStatus: "loading",
    dataError: null,
  };
}

type Action =
  | { type: "SET_ROLE"; payload: UserRole }
  | { type: "UPDATE_FILTERS"; payload: Partial<TransactionFilters> }
  | { type: "RESET_ADVANCED_FILTERS" }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "DATA_LOAD_START" }
  | { type: "DATA_LOAD_SUCCESS"; payload: Transaction[] }
  | { type: "DATA_LOAD_FAILURE"; payload: string };

function reducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "UPDATE_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "RESET_ADVANCED_FILTERS":
      return {
        ...state,
        filters: {
          ...state.filters,
          dateFrom: "",
          dateTo: "",
          minAmount: "",
          maxAmount: "",
        },
      };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case "DELETE_TRANSACTION":
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };
    case "DATA_LOAD_START":
      return { ...state, dataStatus: "loading", dataError: null };
    case "DATA_LOAD_SUCCESS":
      return { ...state, transactions: action.payload, dataStatus: "ready", dataError: null };
    case "DATA_LOAD_FAILURE":
      return { ...state, dataStatus: "error", dataError: action.payload };
    default:
      return state;
  }
}

export function FinanceProvider({
  children,
  api = financeApi,
}: {
  children: ReactNode;
  /** Inject a real `FinanceApi` (e.g. REST) for production; defaults to mock. */
  api?: FinanceApi;
}) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  const refreshTransactions = useCallback(async () => {
    dispatch({ type: "DATA_LOAD_START" });
    try {
      const txs = await api.listTransactions();
      dispatch({ type: "DATA_LOAD_SUCCESS", payload: txs });
    } catch (e) {
      dispatch({
        type: "DATA_LOAD_FAILURE",
        payload: e instanceof Error ? e.message : "Failed to load transactions",
      });
    }
  }, [api]);

  useEffect(() => {
    void refreshTransactions();
  }, [refreshTransactions]);

  useEffect(() => {
    if (state.dataStatus !== "ready") return;
    writeTransactionsToStorage(state.transactions);
  }, [state.transactions, state.dataStatus]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_PREFERENCES,
      JSON.stringify({ role: state.role, filters: state.filters }),
    );
  }, [state.role, state.filters]);

  const actions = useMemo<FinanceActions>(
    () => ({
      setRole: (role) => dispatch({ type: "SET_ROLE", payload: role }),
      updateFilters: (patch) => dispatch({ type: "UPDATE_FILTERS", payload: patch }),
      resetAdvancedFilters: () => dispatch({ type: "RESET_ADVANCED_FILTERS" }),
      setSort: (field, direction) =>
        dispatch({ type: "UPDATE_FILTERS", payload: { sortField: field, sortDirection: direction } }),
      addTransaction: async (t) => {
        const saved = await api.createTransaction(t);
        dispatch({ type: "ADD_TRANSACTION", payload: saved });
      },
      updateTransaction: async (t) => {
        const saved = await api.updateTransaction(t);
        dispatch({ type: "UPDATE_TRANSACTION", payload: saved });
      },
      deleteTransaction: async (id) => {
        await api.deleteTransaction(id);
        dispatch({ type: "DELETE_TRANSACTION", payload: id });
      },
      refreshTransactions,
    }),
    [api, refreshTransactions],
  );

  const filteredTransactions = useMemo(
    () => selectFilteredTransactions(state.transactions, state.filters),
    [state.transactions, state.filters],
  );

  const { totalIncome, totalExpenses, totalBalance } = useMemo(
    () => selectTotals(state.transactions),
    [state.transactions],
  );

  const value = useMemo(
    () => ({
      state,
      actions,
      filteredTransactions,
      totalIncome,
      totalExpenses,
      totalBalance,
    }),
    [state, actions, filteredTransactions, totalIncome, totalExpenses, totalBalance],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
