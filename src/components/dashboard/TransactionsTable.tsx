import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinance } from "@/context/useFinance";
import { Search, ArrowUpDown, Plus, Pencil, Trash2, ChevronDown, Download, Filter } from "lucide-react";
import type { Category, TransactionType, Transaction, GroupBy } from "@/types/finance";
import { TransactionModal } from "./TransactionModal";

function exportCSV(transactions: Transaction[]) {
  const header = "Date,Description,Category,Type,Amount";
  const rows = transactions.map(
    (t) => `${t.date},"${t.description}",${t.category},${t.type},${t.amount}`
  );
  const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(transactions: Transaction[]) {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.json";
  a.click();
  URL.revokeObjectURL(url);
}

const categories: Category[] = [
  "Salary", "Freelance", "Investments", "Food & Dining", "Transportation",
  "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Education", "Travel", "Other",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function groupTransactions(transactions: Transaction[], groupBy: GroupBy): Record<string, Transaction[]> {
  if (groupBy === "none") return { "": transactions };
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach((t) => {
    let key = "";
    if (groupBy === "category") key = t.category;
    else if (groupBy === "type") key = t.type === "income" ? "Income" : "Expense";
    else if (groupBy === "month") {
      const d = new Date(t.date);
      key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return groups;
}

function ExportDropdown({ transactions }: { transactions: Transaction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> Export <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[120px]">
          <button
            onClick={() => { exportCSV(transactions); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors text-foreground"
          >
            Export as CSV
          </button>
          <button
            onClick={() => { exportJSON(transactions); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors text-foreground border-t border-border"
          >
            Export as JSON
          </button>
        </div>
      )}
    </div>
  );
}

type TransactionSheet = null | { kind: "add" } | { kind: "edit"; tx: Transaction };

export function TransactionsTable() {
  const { state, actions, filteredTransactions } = useFinance();
  const [sheet, setSheet] = useState<TransactionSheet>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { filters } = state;

  const isAdmin = state.role === "admin";

  const toggleSort = (field: "date" | "amount") => {
    const newDir = filters.sortField === field && filters.sortDirection === "desc" ? "asc" : "desc";
    actions.setSort(field, newDir);
  };

  const grouped = groupTransactions(filteredTransactions, filters.groupBy);
  const hasAdvancedFilters =
    Boolean(filters.dateFrom || filters.dateTo || filters.minAmount || filters.maxAmount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="p-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">Transactions</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.searchQuery}
                onChange={(e) => actions.updateFilters({ searchQuery: e.target.value })}
                className="pl-8 pr-3 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-40"
              />
            </div>
            <div className="relative">
              <select
                value={filters.filterType}
                onChange={(e) => actions.updateFilters({ filterType: e.target.value as TransactionType | "all" })}
                className="appearance-none pl-3 pr-7 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filters.filterCategory}
                onChange={(e) => actions.updateFilters({ filterCategory: e.target.value as Category | "all" })}
                className="appearance-none pl-3 pr-7 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                showFilters || hasAdvancedFilters
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
              }`}
            >
              <Filter className="w-3.5 h-3.5" /> Advanced
            </button>
            <ExportDropdown transactions={filteredTransactions} />
            {isAdmin && (
              <button
                type="button"
                onClick={() => setSheet({ kind: "add" })}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-end gap-3 mt-4 pt-4 border-t border-border">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => actions.updateFilters({ dateFrom: e.target.value })}
                    className="px-2.5 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => actions.updateFilters({ dateTo: e.target.value })}
                    className="px-2.5 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Min $</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => actions.updateFilters({ minAmount: e.target.value })}
                    className="px-2.5 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-24"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Max $</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={filters.maxAmount}
                    onChange={(e) => actions.updateFilters({ maxAmount: e.target.value })}
                    className="px-2.5 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-24"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Group by</label>
                  <div className="relative">
                    <select
                      value={filters.groupBy}
                      onChange={(e) => actions.updateFilters({ groupBy: e.target.value as GroupBy })}
                      className="appearance-none pl-3 pr-7 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="none">None</option>
                      <option value="category">Category</option>
                      <option value="type">Type</option>
                      <option value="month">Month</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                {hasAdvancedFilters && (
                  <button
                    type="button"
                    onClick={() => actions.resetAdvancedFilters()}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="overflow-x-auto">
        {Object.entries(grouped).map(([group, txns]) => (
          <div key={group}>
            {group && (
              <div className="px-5 py-2 bg-secondary/50 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{group}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {txns.length} transaction{txns.length !== 1 ? "s" : ""} · {formatCurrency(txns.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0))}
                </span>
              </div>
            )}
            <table className="w-full text-xs">
              {!group && (
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left font-medium px-5 py-3">
                      <button type="button" onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Date <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left font-medium px-5 py-3">Description</th>
                    <th className="text-left font-medium px-5 py-3">Category</th>
                    <th className="text-left font-medium px-5 py-3">Type</th>
                    <th className="text-right font-medium px-5 py-3">
                      <button type="button" onClick={() => toggleSort("amount")} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                        Amount <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    {isAdmin && <th className="text-right font-medium px-5 py-3 w-24">Actions</th>}
                  </tr>
                </thead>
              )}
              <tbody>
                <AnimatePresence>
                  {txns.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-muted-foreground">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    txns.map((t) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                      >
                        <td className="px-5 py-3 text-muted-foreground font-mono">
                          {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-5 py-3 font-medium text-foreground">{t.description}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-medium">
                            {t.category}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              t.type === "income"
                                ? "bg-income/10 text-income"
                                : "bg-expense/10 text-expense"
                            }`}
                          >
                            {t.type === "income" ? "Income" : "Expense"}
                          </span>
                        </td>
                        <td className={`px-5 py-3 text-right font-mono font-medium ${t.type === "income" ? "text-income" : "text-expense"}`}>
                          {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setSheet({ kind: "edit", tx: t })}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                aria-label="Edit transaction"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void actions.deleteTransaction(t.id)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-expense hover:bg-accent transition-colors"
                                aria-label="Delete transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {sheet !== null && (
        <TransactionModal
          onClose={() => setSheet(null)}
          initial={sheet.kind === "edit" ? sheet.tx : null}
        />
      )}
    </motion.div>
  );
}
