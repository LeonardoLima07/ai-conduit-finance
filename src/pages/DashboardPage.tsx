import { Brain, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, Shield, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

const kpis = [
  { label: "Receita", value: "R$ 127.450", change: "+12,5%", positive: true, icon: TrendingUp },
  { label: "Despesas", value: "R$ 84.230", change: "-3,2%", positive: true, icon: ArrowDownRight },
  { label: "Lucro Líquido", value: "R$ 43.220", change: "+18,7%", positive: true, icon: ArrowUpRight },
];

const transactions = [
  { desc: "Pagamento — Empresa ABC", amount: "+R$ 15.000", category: "Receita", date: "Hoje" },
  { desc: "Adobe Creative Cloud", amount: "-R$ 289", category: "Software", date: "Hoje" },
  { desc: "Google Ads", amount: "-R$ 3.200", category: "Marketing", date: "Ontem" },
  { desc: "Pagamento — Loja XYZ", amount: "+R$ 8.500", category: "Receita", date: "Ontem" },
  { desc: "Aluguel Escritório", amount: "-R$ 4.500", category: "Aluguel", date: "1 Mar" },
];

type InsightType = "success" | "warning" | "danger" | "info";

interface AIInsight {
  type: InsightType;
  title: string;
  text: string;
}

const insightStyles: Record<InsightType, string> = {
  success: "border-primary/20 bg-primary/5",
  warning: "border-yellow-500/20 bg-yellow-500/5",
  danger: "border-destructive/20 bg-destructive/5",
  info: "border-accent/20 bg-accent/5",
};

const insightIcons: Record<InsightType, typeof TrendingUp> = {
  success: TrendingUp,
  warning: AlertTriangle,
  danger: Shield,
  info: Zap,
};

const fallbackInsights: AIInsight[] = [
  { type: "success", title: "Margem saudável", text: "Sua margem de lucro de 33,9% está acima da média do setor de tecnologia (28%). Continue monitorando." },
  { type: "warning", title: "Marketing com ROI baixo", text: "Gastos com marketing subiram 23% mas conversões cresceram apenas 8%. Considere otimizar campanhas." },
  { type: "info", title: "Oportunidade de pricing", text: "Concorrentes no seu segmento cobram 12% mais. Você pode ajustar preços em 7% sem impacto na conversão." },
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          financialData: {
            revenue: 127450,
            expenses: 84230,
            profit: 43220,
            profitMargin: 33.9,
            categories: categoryData,
            revenueHistory: revenueData,
            employees: 8,
            segment: "Tecnologia / Consultoria",
          },
        }),
      });

      if (resp.status === 429) {
        toast.error("Limite de requisições excedido. Tente novamente em instantes.");
        return;
      }
      if (resp.status === 402) {
        toast.error("Créditos insuficientes para análise AI.");
        return;
      }

      if (resp.ok) {
        const data = await resp.json();
        if (data.insights) setInsights(data.insights);
        if (data.healthScore) setHealthScore(data.healthScore);
        if (data.healthLabel) setHealthLabel(data.healthLabel);
      }
    } catch {
      // keep fallback insights
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const scoreColor = healthScore >= 80 ? "text-primary" : healthScore >= 60 ? "text-yellow-500" : "text-destructive";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral financeira — Março 2026</p>
      </div>

      {/* KPIs + Health Score */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <kpi.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="mt-1 text-xs font-medium text-primary">{kpi.change}</p>
          </motion.div>
        ))}

        {/* Health Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-5"
        >
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
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="hsl(220, 9%, 46%)" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Insights da AI</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={fetchInsights}
              disabled={loadingInsights}
            >
              {loadingInsights ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <div className="space-y-3">
            {loadingInsights && insights === fallbackInsights ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-xs">Analisando seus dados...</p>
              </div>
            ) : (
              insights.map((insight, i) => {
                const Icon = insightIcons[insight.type] || Zap;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`rounded-lg border p-3 ${insightStyles[insight.type] || insightStyles.info}`}
                  >
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
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Expenses by Category */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Transações Recentes</h3>
          <div className="space-y-3">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{tx.desc}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} · {tx.date}</p>
                </div>
                <p className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-primary" : "text-foreground"}`}>
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
