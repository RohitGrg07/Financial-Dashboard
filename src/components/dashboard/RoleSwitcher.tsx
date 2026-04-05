import { useFinance } from "@/context/useFinance";
import { Shield, Eye } from "lucide-react";

export function RoleSwitcher() {
  const { state, actions } = useFinance();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => actions.setRole(state.role === "admin" ? "viewer" : "admin")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          state.role === "admin"
            ? "bg-primary/15 text-primary border border-primary/30"
            : "bg-secondary text-secondary-foreground border border-border"
        }`}
      >
        {state.role === "admin" ? <Shield className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        {state.role === "admin" ? "Admin" : "Viewer"}
      </button>
    </div>
  );
}
