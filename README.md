# Financial Dashboard

A React + TypeScript finance dashboard for tracking income, expenses, and spending patterns. Uses **Vite**, **Tailwind CSS**, **shadcn/ui**-style components, **Recharts**, and **Context + `useReducer`** for state. Data is **mock/seed** with optional **localStorage** persistence and a small **mock API** layer (async `list` / `create` / `update` / `delete`).

## How this meets the assignment

| Requirement | Implementation |
|-------------|------------------|
| **Dashboard overview** | `SummaryCards` (balance, income, expenses), `BalanceTrendChart` (time-based cumulative balance), `SpendingBreakdownChart` (category pie + legend). |
| **Transactions** | Table with date, description, category, **Type** (Income/Expense), amount; color and +/- on amount; **search**, **type/category filters**, **sort** (date/amount), **advanced** date range, min/max amount, **group by** (category / type / month). |
| **Role-based UI** | **Viewer**: read-only (no add/edit/delete). **Admin**: add/edit (`TransactionModal`), delete row. Toggle in header (`RoleSwitcher`). |
| **Insights** | Top spending category, savings rate, **latest two calendar months with expenses** compared (% change), average expense (`InsightsSection.tsx` + `expenseMonthInsights.ts`). |
| **State** | `FinanceProvider` + reducer: transactions, filters, role, load/error status; derived filtered list and totals; preferences persisted. |
| **UX** | Responsive layout, loading and error states, empty table message, dark/light theme. |
| **Optionals** | Dark mode (`next-themes`), **localStorage**, **mock API** (`src/api/financeApi.ts`), **Framer Motion** transitions, **CSV/JSON export**, advanced filters/grouping. |

## Setup

```bash
npm install
npm run dev
```

Open **http://localhost:8080** (see `vite.config.ts` if the port differs).

```bash
npm run build    # production build
npm run preview  # serve dist locally
npm run lint     # ESLint
```

## Project structure (high level)

- `src/pages/Index.tsx` — main dashboard layout
- `src/context/` — finance state (`FinanceProvider`, `useFinance`, `finance-context`)
- `src/api/financeApi.ts` — mock API + seed transactions
- `src/lib/` — storage adapter, selectors, balance trend helper
- `src/components/dashboard/` — charts, table, insights, role/theme controls

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query (provider present; finance data uses Context), Recharts, Framer Motion, next-themes.
