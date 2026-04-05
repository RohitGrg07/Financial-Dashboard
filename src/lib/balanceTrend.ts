import type { Transaction } from "@/types/finance";

export type BalanceTrendPoint = { month: string; balance: number };

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

/**
 * End-of-month cumulative balance (income minus expenses) for each month present in the data.
 */
export function computeBalanceTrendFromTransactions(transactions: Transaction[]): BalanceTrendPoint[] {
  if (transactions.length === 0) {
    return [{ month: "No data", balance: 0 }];
  }

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const monthKeys = [...new Set(sorted.map((t) => t.date.slice(0, 7)))].sort();

  return monthKeys.map((ym) => {
    let balance = 0;
    for (const t of sorted) {
      if (t.date.slice(0, 7) <= ym) {
        balance += t.type === "income" ? t.amount : -t.amount;
      }
    }
    const [y, m] = ym.split("-").map(Number);
    const labelDate = new Date(y, m - 1, 1);
    return {
      month: monthFormatter.format(labelDate),
      balance: Math.round(balance * 100) / 100,
    };
  });
}
