import { Brain, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, Shield, Zap, Target, Wallet, CreditCard, BarChart3, Repeat, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const revenueData = [
  { month: "Jul", revenue: 85000, expenses: 62000 },
  { month: "Aug", revenue: 92000, expenses: 65000 },
  { month: "Sep", revenue: 88000, expenses: 58000 },
  { month: "Oct", revenue: 105000, expenses: 72000 },
  { month: "Nov", revenue: 115000, expenses: 68000 },
  { month: "Dec", revenue: 127450, expenses: 84230 },
];

const categoryData = [
  { name: "Salários", value: 35000 },
  { name: "Aluguel", value: 12000 },
  { name: "Marketing", value: 15000 },
  { name: "Software", value: 8500 },
  { name: "Materiais", value: 5200 },
  { name: "Outros", value: 8530 },
];

const cashFlowPreview = [
  { day: "Hoje", balance: 392220 },
  { day: "+7d", balance: 405000 },
  { day: "+14d", balance: 418000 },
  { day: "+21d", balance: 410000 },
  { day: "+30d", balance: 435000 },
];

const upcomingCommitments = [
  { desc: "Salários da equipe", amount: "R$ 35.000", type: "expense", date: "01/04", freq: "Mensal" },
  { desc: "Aluguel do escritório", amount: "R$ 4.500", type: "expense", date: "01/04", freq: "Mensal" },
  { desc: "Contrato — Empresa ABC", amount: "R$ 15.000", type: "income", date: "10/04", freq: "Mensal" },
  { desc: "Internet e Telefone", amount: "R$ 450", type: "expense", date: "28/03", freq: "Mensal" },
  { desc: "Adobe Creative Cloud", amount: "R$ 289", type: "expense", date: "11/04", freq: "Mensal" },
];

const kpis = [
  { label: "Receita", value: "R$ 127.450", change: "+12,5%", positive: true, icon: TrendingUp, color: "text-primary" },
  { label: "Despesas", value: "R$ 84.230", change: "-3,2%", positive: true, icon: ArrowDownRight, color: "text-foreground" },
  { label: "Lucro Líquido", value: "R$ 43.220", change: "+18,7%", positive: true, icon: ArrowUpRight, color: "text-primary" },
  { label: "Fluxo de Caixa", value: "R$ 392.220", change: "+8,4%", positive: true, icon: Wallet, color: "text-primary" },
];

const recentTransactions = [
  { desc: "Pagamento — Empresa ABC", amount: "+R$ 15.000", type: "income", date: "Hoje" },
  { desc: "Adobe Creative Cloud", amount: "-R$ 289", type: "expense", date: "Hoje" },
  { desc: "Google Ads", amount: "-R$ 3.200", type: "expense", date: "Ontem" },
  { desc: "Pagamento — Loja XYZ", amount: "+R$ 8.500", type: "income", date: "Ontem" },
];

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

const fallbackInsights: AIInsight[] = [
  { type: "success", title: "Margem saudável", text: "Margem de 33,9% acima da média do setor (28%). Continue monitorando." },
  { type: "warning", title: "Marketing com ROI baixo", text: "Gastos +23% mas conversões +8%. Otimize campanhas." },
  { type: "info", title: "Oportunidade de pricing", text: "Concorrentes cobram 12% mais. Ajuste 7% sem impacto na conversão." },
];

export default function DashboardPage() {
  const [healthScore, setHealthScore] = useState(92);
  const [healthLabel, setHealthLabel] = useState("Excelente");
  const [insights, setInsights] = useState<AIInsight[]>(fallbackInsights);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ financialData: { revenue: 127450, expenses: 84230, profit: 43220, profitMargin: 33.9, categories: categoryData, revenueHistory: revenueData, employees: 8, segment: "Tecnologia / Consultoria" } }),
      });
      if (resp.status === 429) { toast.error("Limite excedido."); return; }
      if (resp.status === 402) { toast.error("Créditos insuficientes."); return; }
      if (resp.ok) {
        const data = await resp.json();
        if (data.insights) setInsights(data.insights);
        if (data.healthScore) setHealthScore(data.healthScore);
        if (data.healthLabel) setHealthLabel(data.healthLabel);
      }
    } catch {} finally { setLoadingInsights(false); }
  }, []);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const scoreColor = healthScore >= 80 ? "text-primary" : healthScore >= 60 ? "text-yellow-500" : "text-destructive";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Centro de controle financeiro — Março 2026</p>
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
            <p className="mt-1 text-xs font-medium text-primary">{kpi.change}</p>
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
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
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
            {loadingInsights && insights === fallbackInsights ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mb-2" /><p className="text-xs">Analisando...</p></div>
            ) : insights.map((insight, i) => {
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
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cash Flow Preview */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Previsão de Caixa</h3>
            <Link to="/dashboard/cash-flow"><Button variant="ghost" size="sm" className="text-xs">Ver tudo →</Button></Link>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={cashFlowPreview}>
              <defs>
                <linearGradient id="cfPreview" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Area type="monotone" dataKey="balance" stroke="hsl(217, 91%, 60%)" fill="url(#cfPreview)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Category */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
            {upcomingCommitments.map((c, i) => (
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
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Últimas Transações</h3>
            <Link to="/dashboard/transactions"><Button variant="ghost" size="sm" className="text-xs">Ver todas →</Button></Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx, i) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
