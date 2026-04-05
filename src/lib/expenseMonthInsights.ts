import type { Transaction } from "@/types/finance";

const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

/** Totals expense amount per YYYY-MM from transactions. */
export function expenseTotalsByMonth(transactions: Transaction[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const ym = t.date.slice(0, 7);
    map.set(ym, (map.get(ym) || 0) + t.amount);
  }
  return map;
}

export type MonthComparison = {
  /** e.g. "Mar 2025" */
  recentLabel: string;
  olderLabel: string;
  recentTotal: number;
  olderTotal: number;
  /** Percent change: recent vs older (older as baseline). */
  percentChange: number;
  /** Short subtitle e.g. "Mar 2025 vs Feb 2025 expenses" */
  detail: string;
} | null;

/**
 * Compares the two most recent calendar months that have at least one expense.
 * Returns null if fewer than two such months exist.
 */
export function computeLatestTwoMonthExpenseComparison(transactions: Transaction[]): MonthComparison {
  const map = expenseTotalsByMonth(transactions);
  const keys = [...map.keys()].sort((a, b) => b.localeCompare(a));
  if (keys.length < 2) return null;

  const [recentYm, olderYm] = keys;
  const recentTotal = map.get(recentYm)!;
  const olderTotal = map.get(olderYm)!;

  const recentLabel = monthFmt.format(new Date(`${recentYm}-01T12:00:00`));
  const olderLabel = monthFmt.format(new Date(`${olderYm}-01T12:00:00`));
  const percentChange = olderTotal > 0 ? ((recentTotal - olderTotal) / olderTotal) * 100 : 0;

  return {
    recentLabel,
    olderLabel,
    recentTotal,
    olderTotal,
    percentChange,
    detail: `${recentLabel} vs ${olderLabel} expenses`,
  };
}
