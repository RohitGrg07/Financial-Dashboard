import { useEffect, useState } from "react";
import { useFinance } from "@/context/useFinance";
import { X } from "lucide-react";
import type { Category, TransactionType, Transaction } from "@/types/finance";

const categories: Category[] = [
  "Salary", "Freelance", "Investments", "Food & Dining", "Transportation",
  "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Education", "Travel", "Other",
];

const emptyForm = {
  description: "",
  amount: "",
  category: "Other" as Category,
  type: "expense" as TransactionType,
  date: new Date().toISOString().split("T")[0],
};

export function TransactionModal({
  onClose,
  initial,
}: {
  onClose: () => void;
  /** `null` = add new transaction; otherwise edit this row (id preserved). */
  initial: Transaction | null;
}) {
  const { actions } = useFinance();
  const isEdit = initial !== null;
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        description: initial.description,
        amount: String(initial.amount),
        category: initial.category,
        type: initial.type,
        date: initial.date,
      });
    } else {
      setForm({ ...emptyForm, date: new Date().toISOString().split("T")[0] });
    }
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    const amount = parseFloat(form.amount);
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (isEdit && initial) {
        await actions.updateTransaction({
          id: initial.id,
          description: form.description,
          amount,
          category: form.category,
          type: form.type,
          date: form.date,
        });
      } else {
        await actions.addTransaction({
          id: `${Date.now()}`,
          description: form.description,
          amount,
          category: form.category,
          type: form.type,
          date: form.date,
        });
      }
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold">{isEdit ? "Edit transaction" : "Add transaction"}</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2" role="alert">
              {submitError}
            </p>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <input
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
