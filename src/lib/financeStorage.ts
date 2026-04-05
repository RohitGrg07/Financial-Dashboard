import type { Transaction } from "@/types/finance";

/** Same key as historically used by the app — mock API + Context persistence stay compatible. */
export const TRANSACTIONS_STORAGE_KEY = "finance_transactions";

export function readTransactionsFromStorage(): Transaction[] | null {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as Transaction[]) : null;
  } catch {
    return null;
  }
}

export function writeTransactionsToStorage(transactions: Transaction[]): void {
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
}
