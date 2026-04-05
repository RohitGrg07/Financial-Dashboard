import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { BalanceTrendChart } from "@/components/dashboard/BalanceTrendChart";
import { SpendingBreakdownChart } from "@/components/dashboard/SpendingBreakdownChart";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { useFinance } from "@/context/useFinance";
import { LayoutDashboard, Loader2 } from "lucide-react";

function IndexMain() {
  const { state, actions } = useFinance();

  if (state.dataStatus === "loading" && state.transactions.length === 0) {
    return (
      <main className="container px-4 sm:px-6 py-16 flex flex-col items-center justify-center max-w-6xl min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading transactions…</p>
      </main>
    );
  }

  if (state.dataStatus === "error" && state.transactions.length === 0) {
    return (
      <main className="container px-4 sm:px-6 py-16 flex flex-col items-center justify-center gap-4 max-w-6xl min-h-[50vh]">
        <p className="text-sm text-center text-destructive max-w-md">{state.dataError}</p>
        <button
          type="button"
          onClick={() => void actions.refreshTransactions()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="container px-4 sm:px-6 py-6 space-y-6 max-w-6xl">
      {state.dataStatus === "error" && state.dataError && (
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
          role="alert"
        >
          <span className="text-destructive">{state.dataError}</span>
          <button
            type="button"
            onClick={() => void actions.refreshTransactions()}
            className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-md bg-background border border-border hover:bg-accent transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BalanceTrendChart />
        <SpendingBreakdownChart />
      </div>

      <TransactionsTable />

      <InsightsSection />
    </main>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/15">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-sm font-bold tracking-tight">Financial Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <RoleSwitcher />
          </div>
        </div>
      </header>

      <IndexMain />
    </div>
  );
};

export default Index;
