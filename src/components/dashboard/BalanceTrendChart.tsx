import { useMemo } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFinance } from "@/context/useFinance";
import { computeBalanceTrendFromTransactions } from "@/lib/balanceTrend";

export function BalanceTrendChart() {
  const { state } = useFinance();

  const balanceTrendData = useMemo(
    () => computeBalanceTrendFromTransactions(state.transactions),
    [state.transactions],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="glass rounded-xl p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Balance Trend</h3>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={balanceTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 10%, 18%)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              separator=""
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "13px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Balance"]}
            />
            <Area type="monotone" dataKey="balance" stroke="hsl(160, 60%, 45%)" strokeWidth={2} fill="url(#balanceGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
