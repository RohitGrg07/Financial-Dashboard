import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useFinance } from "@/context/useFinance";
import { useMemo } from "react";

const COLORS = [
  "hsl(0, 72%, 56%)",
  "hsl(217, 91%, 60%)",
  "hsl(38, 92%, 55%)",
  "hsl(280, 65%, 60%)",
  "hsl(160, 60%, 45%)",
  "hsl(190, 70%, 50%)",
];

export function SpendingBreakdownChart() {
  const { state } = useFinance();

  const data = useMemo(() => {
    const expenses = state.transactions.filter((t) => t.type === "expense");
    const grouped: Record<string, number> = {};
    expenses.forEach((t) => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [state.transactions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="glass rounded-xl p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Spending Breakdown</h3>
      <div className="h-[240px] flex items-center">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                separator=""
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "hsl(var(--popover-foreground))",
                  boxShadow: "0 4px 12px hsl(var(--background) / 0.5)",
                }}
                itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 space-y-2">
          {data.slice(0, 5).map((item, i) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-muted-foreground truncate flex-1">{item.name}</span>
              <span className="font-mono font-medium">${item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
