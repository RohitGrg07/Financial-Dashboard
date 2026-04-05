import type { Transaction, TransactionFilters } from "@/types/finance";

/** Applies list + advanced filters, then sorts. Used for the transactions table and exports. */
export function selectFilteredTransactions(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
  const filtered = transactions.filter((t) => {
    if (filters.filterType !== "all" && t.type !== filters.filterType) return false;
    if (filters.filterCategory !== "all" && t.category !== filters.filterCategory) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      if (!t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
    }
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    if (filters.minAmount && t.amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && t.amount > parseFloat(filters.maxAmount)) return false;
    return true;
  });

  const dir = filters.sortDirection === "asc" ? 1 : -1;
  return [...filtered].sort((a, b) => {
    if (filters.sortField === "date") return dir * (new Date(a.date).getTime() - new Date(b.date).getTime());
    return dir * (a.amount - b.amount);
  });
}

export function selectTotals(transactions: Transaction[]) {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return {
    totalIncome,
    totalExpenses,
    totalBalance: totalIncome - totalExpenses,
  };
}
