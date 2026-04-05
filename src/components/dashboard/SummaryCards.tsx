import { useFinance } from "@/context/useFinance";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

const cards = [
  { key: "balance", label: "Total Balance", icon: Wallet, colorClass: "text-info" },
  { key: "income", label: "Total Income", icon: TrendingUp, colorClass: "text-income" },
  { key: "expenses", label: "Total Expenses", icon: TrendingDown, colorClass: "text-expense" },
] as const;

export function SummaryCards() {
  const { totalBalance, totalIncome, totalExpenses } = useFinance();

  const values = { balance: totalBalance, income: totalIncome, expenses: totalExpenses };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const value = values[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="glass rounded-xl p-5 group hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
              <div className={`p-2 rounded-lg bg-secondary ${card.colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight font-mono">{formatCurrency(value)}</p>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {card.key === "expenses" ? (
                <ArrowDownRight className="w-3 h-3 text-expense" />
              ) : (
                <ArrowUpRight className="w-3 h-3 text-income" />
              )}
              <span className={card.key === "expenses" ? "text-expense" : "text-income"}>
                {card.key === "expenses" ? "+2.4%" : "+5.2%"}
              </span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
