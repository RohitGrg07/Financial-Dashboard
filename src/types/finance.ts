export type TransactionType = "income" | "expense";

export type Category =
  | "Salary"
  | "Freelance"
  | "Investments"
  | "Food & Dining"
  | "Transportation"
  | "Shopping"
  | "Entertainment"
  | "Bills & Utilities"
  | "Healthcare"
  | "Education"
  | "Travel"
  | "Other";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: Category;
  type: TransactionType;
}

export type UserRole = "viewer" | "admin";

export type GroupBy = "none" | "category" | "type" | "month";

export interface TransactionFilters {
  searchQuery: string;
  filterType: TransactionType | "all";
  filterCategory: Category | "all";
  sortField: "date" | "amount";
  sortDirection: "asc" | "desc";
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  groupBy: GroupBy;
}

export type FinanceDataStatus = "loading" | "ready" | "error";

export interface FinanceState {
  transactions: Transaction[];
  role: UserRole;
  filters: TransactionFilters;
  /** Async load / refetch from API layer. */
  dataStatus: FinanceDataStatus;
  dataError: string | null;
}
