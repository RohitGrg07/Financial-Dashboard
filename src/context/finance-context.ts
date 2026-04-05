import { createContext } from "react";
import type { Transaction, UserRole, FinanceState, TransactionFilters } from "@/types/finance";

export interface FinanceActions {
  setRole: (role: UserRole) => void;
  updateFilters: (patch: Partial<TransactionFilters>) => void;
  resetAdvancedFilters: () => void;
  setSort: (field: "date" | "amount", direction: "asc" | "desc") => void;
  addTransaction: (t: Transaction) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

export interface FinanceContextValue {
  state: FinanceState;
  actions: FinanceActions;
  filteredTransactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
}

export const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);
