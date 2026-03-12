import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, Brain, Loader2, RefreshCw, Shield, Zap, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const cashFlowHistory = [
  { month: "Out", inflow: 98000, outflow: 71000, balance: 212000 },
  { month: "Nov", inflow: 115000, outflow: 68000, balance: 259000 },
  { month: "Dez", inflow: 127450, outflow: 84230, balance: 302220 },
  { month: "Jan", inflow: 110000, outflow: 78000, balance: 334220 },
  { month: "Fev", inflow: 120000, outflow: 82000, balance: 372220 },
  { month: "Mar", inflow: 95000, outflow: 75000, balance: 392220 },
];

const weeklyFlow = [
  { week: "Sem 1", income: 28000, expenses: 22000 },
  { week: "Sem 2", income: 35000, expenses: 18000 },
  { week: "Sem 3", income: 22000, expenses: 25000 },
  { week: "Sem 4", income: 32000, expenses: 20000 },
];

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
  const currentBalance = 392220;
  const recurringMonthlyIncome = 23500; // from recurring transactions
  const recurringMonthlyExpense = 40539; // from recurring transactions
  const expectedIncome = 127450;
  const expectedExpenses = 84230;
  const projectedBalance = currentBalance + expectedIncome - expectedExpenses;
  const cashFlowHealth = Math.min(100, Math.round((currentBalance / (expectedExpenses * 3)) * 100));

  const [insights, setInsights] = useState<AIInsight[]>([
    { type: "success", title: "Reserva saudável", text: "Você tem 4.7 meses de despesas em reserva. Acima do recomendado (3 meses)." },
    { type: "warning", title: "Compromissos recorrentes", text: `R$ ${recurringMonthlyExpense.toLocaleString("pt-BR")}/mês em despesas fixas. Representa ${Math.round(recurringMonthlyExpense / expectedExpenses * 100)}% das despesas totais.` },
    { type: "info", title: "Receita recorrente", text: `R$ ${recurringMonthlyIncome.toLocaleString("pt-BR")}/mês em contratos fixos garante ${Math.round(recurringMonthlyIncome / expectedIncome * 100)}% da receita.` },
  ]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchInsights = useCallback(async () => {
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
            context: "cash_flow_analysis",
          },
        }),
      });
      if (resp.status === 429) { toast.error("Limite excedido."); return; }
      if (resp.status === 402) { toast.error("Créditos insuficientes."); return; }
      if (resp.ok) {
        const data = await resp.json();
        if (data.insights) setInsights(data.insights);
      }
    } catch {} finally { setLoadingInsights(false); }
  }, []);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const scoreColor = cashFlowHealth >= 80 ? "text-primary" : cashFlowHealth >= 50 ? "text-yellow-500" : "text-destructive";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Smart Cash Flow</h1>
        <p className="text-sm text-muted-foreground">Controle inteligente do fluxo de caixa</p>
      </div>

      {/* KPI Cards */}
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
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Evolução do Fluxo de Caixa</h3>
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
        </div>

        {/* Health Score */}
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
            <div className="flex justify-between"><span>Reserva de emergência</span><span className="font-medium text-primary">4.7 meses</span></div>
            <div className="flex justify-between"><span>Cobertura de despesas</span><span className="font-medium text-primary">156%</span></div>
            <div className="flex justify-between"><span>Tendência de caixa</span><span className="font-medium text-primary">↑ Crescente</span></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Fluxo Semanal — Março</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyFlow}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Bar dataKey="income" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="Receita" />
              <Bar dataKey="expenses" fill="hsl(220, 9%, 70%)" radius={[4, 4, 0, 0]} name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Analysis */}
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
            {insights.map((ins, i) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
