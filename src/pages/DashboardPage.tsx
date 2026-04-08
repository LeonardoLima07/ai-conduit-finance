import { Brain, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, Shield, Zap, Target, Wallet, CreditCard, BarChart3, Repeat, Calendar } from "lucide-react";
import ExpenseOptimizationCard from "@/components/dashboard/ExpenseOptimizationCard";
import SmartNotificationsCard from "@/components/dashboard/SmartNotificationsCard";
import ProgressTrackingCard from "@/components/dashboard/ProgressTrackingCard";
import ActionSuggestionsCard from "@/components/dashboard/ActionSuggestionsCard";
import EngagementBanner from "@/components/dashboard/EngagementBanner";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useFinancialData } from "@/hooks/useFinancialData";

type InsightType = "success" | "warning" | "danger" | "info";
interface AIInsight { type: InsightType; title: string; text: string; }

const insightStyles: Record<InsightType, string> = {
  success: "border-primary/20 bg-primary/5",
  warning: "border-yellow-500/20 bg-yellow-500/5",
  danger: "border-destructive/20 bg-destructive/5",
  info: "border-accent/20 bg-accent/5",
};
const insightIcons: Record<InsightType, typeof TrendingUp> = {
  success: TrendingUp, warning: AlertTriangle, danger: Shield, info: Zap,
};

export default function DashboardPage() {
  const { data, isLoading: dataLoading } = useFinancialData();
  const [healthScore, setHealthScore] = useState(0);
  const [healthLabel, setHealthLabel] = useState("Calculando...");
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Compute health score from real data
  useEffect(() => {
    if (!data) return;
    let score = 50;
    if (data.profitMargin > 30) score += 20;
    else if (data.profitMargin > 15) score += 10;
    if (data.totalRevenue > data.totalExpenses * 1.3) score += 15;
    if (data.recurringIncome > data.totalRevenue * 0.3) score += 10;
    if (data.expensesByCategory.length > 0) score += 5;
    score = Math.min(100, Math.max(0, score));
    setHealthScore(score);
    setHealthLabel(score >= 80 ? "Excelente" : score >= 60 ? "Bom" : score >= 40 ? "Regular" : "Crítico");
  }, [data]);

  const fetchInsights = useCallback(async () => {
    if (!data) return;
    setLoadingInsights(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          financialData: {
            revenue: data.totalRevenue,
            expenses: data.totalExpenses,
            profit: data.profit,
            profitMargin: data.profitMargin,
            categories: data.expensesByCategory,
            revenueHistory: data.revenueByMonth,
            employees: parseInt(data.employeeCount) || 0,
            segment: data.industry,
          },
        }),
      });
      if (resp.status === 429) { toast.error("Limite excedido."); return; }
      if (resp.status === 402) { toast.error("Créditos insuficientes."); return; }
      if (resp.ok) {
        const d = await resp.json();
        if (d.insights) setInsights(d.insights);
        if (d.healthScore) setHealthScore(d.healthScore);
        if (d.healthLabel) setHealthLabel(d.healthLabel);
      }
    } catch {} finally { setLoadingInsights(false); }
  }, [data]);

  useEffect(() => { if (data) fetchInsights(); }, [data, fetchInsights]);

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.companyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Nenhuma empresa cadastrada</h2>
        <p className="text-sm text-muted-foreground mb-4">Complete o briefing da empresa para começar.</p>
        <Link to="/dashboard/briefing"><Button variant="hero">Cadastrar Empresa</Button></Link>
      </div>
    );
  }

  const hasData = data.transactions.length > 0;
  const scoreColor = healthScore >= 80 ? "text-primary" : healthScore >= 60 ? "text-yellow-500" : "text-destructive";

  const kpis = [
    { label: "Receita", value: `R$ ${data.totalRevenue.toLocaleString("pt-BR")}`, change: hasData ? "" : "Sem dados", positive: true, icon: TrendingUp, color: "text-primary" },
    { label: "Despesas", value: `R$ ${data.totalExpenses.toLocaleString("pt-BR")}`, change: "", positive: true, icon: ArrowDownRight, color: "text-foreground" },
    { label: "Lucro Líquido", value: `R$ ${data.profit.toLocaleString("pt-BR")}`, change: data.profitMargin > 0 ? `${data.profitMargin.toFixed(1)}%` : "", positive: data.profit >= 0, icon: ArrowUpRight, color: data.profit >= 0 ? "text-primary" : "text-destructive" },
    { label: "Rec. Recorrente", value: `R$ ${data.recurringIncome.toLocaleString("pt-BR")}`, change: "", positive: true, icon: Wallet, color: "text-primary" },
  ];

  // Upcoming commitments from recurring transactions
  const upcomingCommitments = data.recurringTransactions
    .filter((r) => r.isActive)
    .slice(0, 5)
    .map((r) => ({
      desc: r.description,
      amount: `R$ ${r.amount.toLocaleString("pt-BR")}`,
      type: r.type === "income" ? "income" : "expense",
      date: new Date(r.nextExecutionDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      freq: r.frequency === "monthly" ? "Mensal" : r.frequency === "weekly" ? "Semanal" : "Anual",
    }));

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Engagement Banner */}
      <EngagementBanner data={data} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Centro de controle financeiro — {data.companyName}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/transactions"><Button variant="outline" size="sm"><CreditCard className="mr-1.5 h-3.5 w-3.5" /> Transações</Button></Link>
          <Link to="/dashboard/forecast"><Button variant="outline" size="sm"><BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Previsão</Button></Link>
        </div>
      </div>

      {/* KPIs + Health Score */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</p>
            {kpi.change && <p className="mt-1 text-xs font-medium text-primary">{kpi.change}</p>}
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Saúde Financeira</p>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${scoreColor}`}>{healthScore}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <Progress value={healthScore} className="mt-2 h-2" />
          <p className={`mt-1 text-xs font-medium ${scoreColor}`}>{healthLabel}</p>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Receita vs Despesas</h3>
          {data.revenueByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.revenueByMonth}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" fill="url(#revGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" stroke="hsl(220, 9%, 46%)" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
              Adicione transações para visualizar o gráfico.
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /><h3 className="text-sm font-semibold text-foreground">Insights da AI</h3></div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchInsights} disabled={loadingInsights}>
              {loadingInsights ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div className="space-y-3">
            {loadingInsights && insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mb-2" /><p className="text-xs">Analisando...</p></div>
            ) : insights.length > 0 ? (
              insights.map((insight, i) => {
                const Icon = insightIcons[insight.type] || Zap;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className={`rounded-lg border p-3 ${insightStyles[insight.type] || insightStyles.info}`}>
                    <div className="flex items-start gap-2">
                      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{insight.text}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">Adicione transações para gerar insights.</p>
            )}
          </div>
        </div>
      </div>

      {/* Smart Notifications + Expense Optimization */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SmartNotificationsCard data={data} />
        <ExpenseOptimizationCard expenseData={data.expensesByCategory.length > 0 ? {
          categories: data.expensesByCategory,
          total: data.totalExpenses,
        } : undefined} />
      </div>

      {/* Progress Tracking + Action Suggestions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressTrackingCard data={data} />
        <ActionSuggestionsCard data={data} />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Expenses by Category */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Despesas por Categoria</h3>
          {data.expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data.expensesByCategory.slice(0, 6)} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[160px] text-xs text-muted-foreground">Sem dados</div>
          )}
        </div>

        {/* Cash Flow Preview - placeholder chart from recurring data */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Previsão de Caixa</h3>
            <Link to="/dashboard/cash-flow"><Button variant="ghost" size="sm" className="text-xs">Ver tudo →</Button></Link>
          </div>
          <div className="flex items-center justify-center h-[160px] text-xs text-muted-foreground">
            <Link to="/dashboard/forecast" className="text-primary hover:underline">Ver previsão completa →</Link>
          </div>
        </div>

        {/* Upcoming Financial Commitments */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Compromissos Financeiros</h3>
            </div>
            <Link to="/dashboard/recurring"><Button variant="ghost" size="sm" className="text-xs">Gerenciar →</Button></Link>
          </div>
          <div className="space-y-3">
            {upcomingCommitments.length > 0 ? upcomingCommitments.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${c.type === "income" ? "bg-primary/10" : "bg-secondary"}`}>
                    {c.type === "income" ? <ArrowUpRight className="h-3.5 w-3.5 text-primary" /> : <ArrowDownRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{c.desc}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{c.date} · {c.freq}</p>
                  </div>
                </div>
                <p className={`text-xs font-semibold ${c.type === "income" ? "text-primary" : "text-foreground"}`}>{c.type === "expense" ? "-" : "+"}{c.amount}</p>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma recorrência cadastrada.</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Últimas Transações</h3>
            <Link to="/dashboard/transactions"><Button variant="ghost" size="sm" className="text-xs">Ver todas →</Button></Link>
          </div>
          <div className="space-y-3">
            {data.recentTransactions.length > 0 ? data.recentTransactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tx.type === "income" ? "bg-primary/10" : "bg-secondary"}`}>
                    {tx.type === "income" ? <ArrowUpRight className="h-3.5 w-3.5 text-primary" /> : <ArrowDownRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{tx.desc}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <p className={`text-xs font-semibold ${tx.type === "income" ? "text-primary" : "text-foreground"}`}>{tx.amount}</p>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma transação registrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
