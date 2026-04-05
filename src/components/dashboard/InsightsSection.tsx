import { useMemo } from "react";
import { motion } from "framer-motion";
import { useFinance } from "@/context/useFinance";
import { computeLatestTwoMonthExpenseComparison } from "@/lib/expenseMonthInsights";
import { TrendingUp, AlertTriangle, BarChart3, Zap } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function InsightsSection() {
  const { state, totalIncome, totalExpenses } = useFinance();

  const insights = useMemo(() => {
    const expenses = state.transactions.filter((t) => t.type === "expense");

    const catSpend: Record<string, number> = {};
    expenses.forEach((t) => {
      catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const monthCompare = computeLatestTwoMonthExpenseComparison(state.transactions);

    const avgExpense = expenses.length > 0 ? expenses.reduce((s, t) => s + t.amount, 0) / expenses.length : 0;

    const monthlyInsight = monthCompare
      ? {
          icon: BarChart3,
          label: "Monthly change",
          value: `${monthCompare.percentChange > 0 ? "+" : ""}${monthCompare.percentChange.toFixed(1)}%`,
          detail: monthCompare.detail,
          color: monthCompare.percentChange > 0 ? "text-expense" : "text-income",
          bgColor: monthCompare.percentChange > 0 ? "bg-expense/10" : "bg-income/10",
        }
      : {
          icon: BarChart3,
          label: "Monthly change",
          value: "N/A",
          detail: "Add expenses in at least two different months to compare",
          color: "text-muted-foreground",
          bgColor: "bg-secondary",
        };

    return [
      {
        icon: AlertTriangle,
        label: "Top spending category",
        value: topCategory ? topCategory[0] : "N/A",
        detail: topCategory ? formatCurrency(topCategory[1]) : "No expenses yet",
        color: "text-warning",
        bgColor: "bg-warning/10",
      },
      {
        icon: TrendingUp,
        label: "Savings rate",
        value: `${savingsRate.toFixed(1)}%`,
        detail: "of total income saved",
        color: "text-income",
        bgColor: "bg-income/10",
      },
      monthlyInsight,
      {
        icon: Zap,
        label: "Avg. expense",
        value: formatCurrency(avgExpense),
        detail: `across ${expenses.length} transaction${expenses.length !== 1 ? "s" : ""}`,
        color: "text-info",
        bgColor: "bg-info/10",
      },
    ];
  }, [state.transactions, totalIncome, totalExpenses]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="glass rounded-xl p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Insights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <div className={`p-2 rounded-lg ${insight.bgColor} ${insight.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{insight.label}</p>
                <p className="text-sm font-bold font-mono mt-0.5">{insight.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{insight.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
