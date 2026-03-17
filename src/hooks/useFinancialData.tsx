import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface FinancialSummary {
  companyId: string | null;
  companyName: string;
  industry: string;
  employeeCount: string;
  transactions: {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: string;
    clientOrSupplier: string | null;
    paymentStatus: string;
  }[];
  recurringTransactions: {
    id: string;
    description: string;
    amount: number;
    type: string;
    category: string;
    frequency: string;
    isActive: boolean;
    clientOrSupplier: string | null;
    nextExecutionDate: string;
  }[];
  // Computed
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  expensesByCategory: { name: string; value: number }[];
  revenueByMonth: { month: string; revenue: number; expenses: number }[];
  recentTransactions: { desc: string; amount: string; type: string; date: string }[];
  recurringIncome: number;
  recurringExpense: number;
}

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function useFinancialData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["financial-data", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<FinancialSummary> => {
      // Fetch company
      const { data: companies } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user!.id)
        .limit(1);

      const company = companies?.[0];
      if (!company) {
        return emptyData();
      }

      // Fetch transactions & recurring in parallel
      const [txRes, recRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .eq("company_id", company.id)
          .order("date", { ascending: false })
          .limit(500),
        supabase
          .from("recurring_transactions")
          .select("*")
          .eq("company_id", company.id),
      ]);

      const transactions = (txRes.data ?? []).map((t) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        category: t.category,
        amount: Number(t.amount),
        type: t.type,
        clientOrSupplier: t.client_or_supplier,
        paymentStatus: t.payment_status,
      }));

      const recurringTransactions = (recRes.data ?? []).map((r) => ({
        id: r.id,
        description: r.description,
        amount: Number(r.amount),
        type: r.type,
        category: r.category,
        frequency: r.frequency,
        isActive: r.is_active,
        clientOrSupplier: r.client_or_supplier,
        nextExecutionDate: r.next_execution_date,
      }));

      // Compute current month totals
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const thisMonthTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const totalRevenue = thisMonthTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const totalExpenses = thisMonthTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      const profit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      // Expenses by category (current month)
      const catMap = new Map<string, number>();
      thisMonthTx
        .filter((t) => t.type === "expense")
        .forEach((t) => catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount));
      const expensesByCategory = Array.from(catMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Revenue by month (last 6 months)
      const monthMap = new Map<string, { revenue: number; expenses: number }>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = capitalize(d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""));
        monthMap.set(key, { revenue: 0, expenses: 0 });
      }
      transactions.forEach((t) => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const entry = monthMap.get(key);
        if (entry) {
          if (t.type === "income") entry.revenue += t.amount;
          else entry.expenses += t.amount;
        }
      });
      const revenueByMonth = Array.from(monthMap.entries()).map(([key, val]) => {
        const [y, m] = key.split("-").map(Number);
        const d = new Date(y, m, 1);
        return {
          month: capitalize(d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")),
          ...val,
        };
      });

      // Recent transactions
      const recentTransactions = transactions.slice(0, 5).map((t) => ({
        desc: t.description,
        amount: `${t.type === "income" ? "+" : "-"}R$ ${t.amount.toLocaleString("pt-BR")}`,
        type: t.type,
        date: formatRelativeDate(t.date),
      }));

      // Recurring totals
      const activeRecurring = recurringTransactions.filter((r) => r.isActive);
      const recurringIncome = activeRecurring
        .filter((r) => r.type === "income")
        .reduce((s, r) => s + monthlyAmount(r.amount, r.frequency), 0);
      const recurringExpense = activeRecurring
        .filter((r) => r.type === "expense")
        .reduce((s, r) => s + monthlyAmount(r.amount, r.frequency), 0);

      return {
        companyId: company.id,
        companyName: company.name,
        industry: company.industry || "Não definido",
        employeeCount: company.employee_count || "0",
        transactions,
        recurringTransactions,
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin,
        expensesByCategory,
        revenueByMonth,
        recentTransactions,
        recurringIncome,
        recurringExpense,
      };
    },
  });
}

function monthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case "weekly": return amount * 4;
    case "yearly": return amount / 12;
    default: return amount;
  }
}

function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function emptyData(): FinancialSummary {
  return {
    companyId: null,
    companyName: "",
    industry: "",
    employeeCount: "0",
    transactions: [],
    recurringTransactions: [],
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    profitMargin: 0,
    expensesByCategory: [],
    revenueByMonth: [],
    recentTransactions: [],
    recurringIncome: 0,
    recurringExpense: 0,
  };
}
