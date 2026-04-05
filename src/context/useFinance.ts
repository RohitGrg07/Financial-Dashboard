import { useContext } from "react";
import { FinanceContext } from "./finance-context";

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}

export function useFinanceActions() {
  const { actions } = useFinance();
  return actions;
}
