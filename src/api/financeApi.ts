import type { Transaction } from "@/types/finance";
import { readTransactionsFromStorage } from "@/lib/financeStorage";

const SEED_TRANSACTIONS: Transaction[] = [
  { id: "1", date: "2025-03-28", description: "Monthly Salary", amount: 5200, category: "Salary", type: "income" },
  { id: "2", date: "2025-03-27", description: "Grocery Store", amount: 87.5, category: "Food & Dining", type: "expense" },
  { id: "3", date: "2025-03-26", description: "Freelance Project", amount: 1200, category: "Freelance", type: "income" },
  { id: "4", date: "2025-03-25", description: "Electric Bill", amount: 142.0, category: "Bills & Utilities", type: "expense" },
  { id: "5", date: "2025-03-24", description: "Online Shopping", amount: 299.99, category: "Shopping", type: "expense" },
  { id: "6", date: "2025-03-23", description: "Movie Tickets", amount: 32.0, category: "Entertainment", type: "expense" },
  { id: "7", date: "2025-03-22", description: "Gas Station", amount: 55.0, category: "Transportation", type: "expense" },
  { id: "8", date: "2025-03-21", description: "Dividend Payout", amount: 340, category: "Investments", type: "income" },
  { id: "9", date: "2025-03-20", description: "Restaurant Dinner", amount: 68.0, category: "Food & Dining", type: "expense" },
  { id: "10", date: "2025-03-19", description: "Internet Bill", amount: 79.99, category: "Bills & Utilities", type: "expense" },
  { id: "11", date: "2025-03-18", description: "Gym Membership", amount: 49.99, category: "Healthcare", type: "expense" },
  { id: "12", date: "2025-03-17", description: "Book Purchase", amount: 24.99, category: "Education", type: "expense" },
  { id: "13", date: "2025-03-15", description: "Uber Ride", amount: 18.5, category: "Transportation", type: "expense" },
  { id: "14", date: "2025-03-14", description: "Consulting Fee", amount: 800, category: "Freelance", type: "income" },
  { id: "15", date: "2025-03-12", description: "Coffee Shop", amount: 12.4, category: "Food & Dining", type: "expense" },
  { id: "16", date: "2025-03-10", description: "Phone Bill", amount: 65.0, category: "Bills & Utilities", type: "expense" },
  { id: "17", date: "2025-03-08", description: "Concert Tickets", amount: 120.0, category: "Entertainment", type: "expense" },
  { id: "18", date: "2025-03-05", description: "Stock Gains", amount: 450, category: "Investments", type: "income" },
  { id: "19", date: "2025-03-03", description: "Flight Booking", amount: 380.0, category: "Travel", type: "expense" },
  { id: "20", date: "2025-03-01", description: "Monthly Salary", amount: 5200, category: "Salary", type: "income" },
  { id: "21", date: "2025-02-28", description: "Grocery Store", amount: 95.3, category: "Food & Dining", type: "expense" },
  { id: "22", date: "2025-02-25", description: "Electric Bill", amount: 138.0, category: "Bills & Utilities", type: "expense" },
  { id: "23", date: "2025-02-22", description: "Freelance Work", amount: 650, category: "Freelance", type: "income" },
  { id: "24", date: "2025-02-20", description: "New Shoes", amount: 189.0, category: "Shopping", type: "expense" },
  { id: "25", date: "2025-02-18", description: "Doctor Visit", amount: 150.0, category: "Healthcare", type: "expense" },
  { id: "26", date: "2025-02-15", description: "Valentine Dinner", amount: 95.0, category: "Food & Dining", type: "expense" },
  { id: "27", date: "2025-02-10", description: "Dividend", amount: 280, category: "Investments", type: "income" },
  { id: "28", date: "2025-02-05", description: "Streaming Subs", amount: 45.97, category: "Entertainment", type: "expense" },
  { id: "29", date: "2025-02-01", description: "Monthly Salary", amount: 5200, category: "Salary", type: "income" },
  { id: "30", date: "2025-01-28", description: "Winter Jacket", amount: 250.0, category: "Shopping", type: "expense" },
];

export interface FinanceApi {
  listTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: Transaction): Promise<Transaction>;
  updateTransaction(transaction: Transaction): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type MockFinanceApiOptions = {
  /** Simulated network latency (ms). */
  delayMs?: number;
};

/**
 * Mock “backend”: reads/writes go through async methods; persistence is handled by the app after state updates
 * (see FinanceContext `useEffect`), except `listTransactions` which reads localStorage like a GET request.
 */
export function createMockFinanceApi(options: MockFinanceApiOptions = {}): FinanceApi {
  const { delayMs = 220 } = options;

  return {
    async listTransactions(): Promise<Transaction[]> {
      await delay(delayMs);
      const stored = readTransactionsFromStorage();
      if (stored && stored.length > 0) {
        return stored.map((t) => ({ ...t }));
      }
      return SEED_TRANSACTIONS.map((t) => ({ ...t }));
    },

    async createTransaction(transaction: Transaction): Promise<Transaction> {
      await delay(Math.min(delayMs, 180));
      return { ...transaction };
    },

    async updateTransaction(transaction: Transaction): Promise<Transaction> {
      await delay(Math.min(delayMs, 180));
      return { ...transaction };
    },

    async deleteTransaction(_id: string): Promise<void> {
      await delay(Math.min(delayMs, 150));
    },
  };
}

/** Default mock API instance used by the finance Context. */
export const financeApi: FinanceApi = createMockFinanceApi();
