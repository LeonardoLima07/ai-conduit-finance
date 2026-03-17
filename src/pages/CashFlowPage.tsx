import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, Brain, Loader2, RefreshCw, Shield, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useFinancialData } from "@/hooks/useFinancialData";

interface AIInsight {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  text: string;
}

const insightStyles: Record<string, string> = {
  success: "border-primary/20 bg-primary/5",
  warning: "border-yellow-500/20 bg-yellow-500/5",
  danger: "border-destructive/20 bg-destructive/5",
  info: "border-accent/20 bg-accent/5",
};

export default function CashFlowPage() {
  const { data, isLoading: dataLoading } = useFinancialData();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Compute cash flow from real data
  const currentBalance = data ? data.totalRevenue - data.totalExpenses : 0;
  const expectedIncome = data?.totalRevenue ?? 0;
  const expectedExpenses = data?.totalExpenses ?? 0;
  const projectedBalance = currentBalance + expectedIncome - expectedExpenses;
  const cashFlowHealth = expectedExpenses > 0 ? Math.min(100, Math.round((currentBalance / (expectedExpenses * 3)) * 100)) : 50;

  // Build monthly history from real transaction data
  const cashFlowHistory = data?.revenueByMonth.map(m => ({
    month: m.month,
    inflow: m.revenue,
    outflow: m.expenses,
    balance: m.revenue - m.expenses,
  })) ?? [];

  // Weekly flow from current month transactions
  const weeklyFlow = (() => {
    if (!data) return [];
    const now = new Date();
    const weeks: { week: string; income: number; expenses: number }[] = [];
    for (let w = 0; w < 4; w++) {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), 1 + w * 7);
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), 8 + w * 7);
      const weekTxs = data.transactions.filter(t => {
        const d = new Date(t.date);
        return d >= weekStart && d < weekEnd && d.getMonth() === now.getMonth();
      });
      weeks.push({
        week: `Sem ${w + 1}`,
        income: weekTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expenses: weekTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }
    return weeks;
  })();

  const fetchInsights = useCallback(async () => {
    if (!data) return;
    setLoadingInsights(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          financialData: {
            currentBalance,
            expectedIncome,
            expectedExpenses,
            projectedBalance,
            cashFlowHealth,
            monthlyHistory: cashFlowHistory,
            recurringIncome: data.recurringIncome,
            recurringExpense: data.recurringExpense,
            context: "cash_flow_analysis",
          },
        }),
      });
      if (resp.status === 429) { toast.error("Limite excedido."); return; }
      if (resp.status === 402) { toast.error("Créditos insuficientes."); return; }
      if (resp.ok) {
        const d = await resp.json();
        if (d.insights) setInsights(d.insights);
      }
    } catch {} finally { setLoadingInsights(false); }
  }, [data]);

  useEffect(() => { if (data) fetchInsights(); }, [data, fetchInsights]);

  if (dataLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const scoreColor = cashFlowHealth >= 80 ? "text-primary" : cashFlowHealth >= 50 ? "text-yellow-500" : "text-destructive";
  const reserveMonths = expectedExpenses > 0 ? (currentBalance / expectedExpenses).toFixed(1) : "N/A";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Smart Cash Flow</h1>
        <p className="text-sm text-muted-foreground">Controle inteligente do fluxo de caixa</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Saldo Atual", value: currentBalance, icon: Wallet, color: "text-primary" },
          { label: "Receita Esperada", value: expectedIncome, icon: ArrowUpRight, color: "text-primary" },
          { label: "Despesas Esperadas", value: expectedExpenses, icon: ArrowDownRight, color: "text-destructive" },
          { label: "Saldo Projetado", value: projectedBalance, icon: TrendingUp, color: "text-primary" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>R$ {kpi.value.toLocaleString("pt-BR")}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Evolução do Fluxo de Caixa</h3>
          {cashFlowHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cashFlowHistory}>
                <defs>
                  <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Area type="monotone" dataKey="balance" stroke="hsl(217, 91%, 60%)" fill="url(#cfGrad)" strokeWidth={2} name="Saldo" />
                <Area type="monotone" dataKey="inflow" stroke="hsl(142, 76%, 36%)" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Entradas" />
                <Area type="monotone" dataKey="outflow" stroke="hsl(0, 84%, 60%)" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Saídas" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">Adicione transações para ver o fluxo de caixa.</div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Saúde do Fluxo de Caixa</h3>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-5xl font-bold ${scoreColor}`}>{cashFlowHealth}</span>
            <span className="text-sm text-muted-foreground">/100</span>
            <Progress value={cashFlowHealth} className="mt-3 h-3 w-full" />
            <p className={`mt-2 text-sm font-medium ${scoreColor}`}>
              {cashFlowHealth >= 80 ? "Excelente" : cashFlowHealth >= 50 ? "Regular" : "Crítico"}
            </p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Reserva de emergência</span><span className="font-medium text-primary">{reserveMonths} meses</span></div>
            <div className="flex justify-between"><span>Rec. recorrente mensal</span><span className="font-medium text-primary">R$ {(data?.recurringIncome ?? 0).toLocaleString("pt-BR")}</span></div>
            <div className="flex justify-between"><span>Desp. recorrente mensal</span><span className="font-medium text-foreground">R$ {(data?.recurringExpense ?? 0).toLocaleString("pt-BR")}</span></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Fluxo Semanal</h3>
          {weeklyFlow.some(w => w.income > 0 || w.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyFlow}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Bar dataKey="income" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="Receita" />
                <Bar dataKey="expenses" fill="hsl(220, 9%, 70%)" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-xs text-muted-foreground">Sem dados semanais</div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Análise AI do Fluxo de Caixa</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchInsights} disabled={loadingInsights}>
              {loadingInsights ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div className="space-y-3">
            {insights.length > 0 ? insights.map((ins, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className={`rounded-lg border p-3 ${insightStyles[ins.type]}`}>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{ins.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{ins.text}</p>
                  </div>
                </div>
              </motion.div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-4">{loadingInsights ? "Analisando..." : "Adicione transações para gerar insights."}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
