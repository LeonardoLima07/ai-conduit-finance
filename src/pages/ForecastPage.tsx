import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Loader2, Brain, Calendar, DollarSign, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type Period = 30 | 60 | 90;

interface ForecastData {
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  confidence: number;
  cashFlowData: { day: string; balance: number; income: number; expenses: number }[];
  alerts: { type: "warning" | "danger" | "info"; title: string; text: string }[];
}

// Recurring commitments used for forecast modeling
const recurringItems = [
  { amount: 35000, type: "expense", frequency: "monthly" },
  { amount: 4500, type: "expense", frequency: "monthly" },
  { amount: 289, type: "expense", frequency: "monthly" },
  { amount: 450, type: "expense", frequency: "monthly" },
  { amount: 1200, type: "expense", frequency: "yearly" },
  { amount: 15000, type: "income", frequency: "monthly" },
  { amount: 8500, type: "income", frequency: "monthly" },
];

const recurringDailyIncome = recurringItems.filter(r => r.type === "income").reduce((s, r) => {
  if (r.frequency === "weekly") return s + (r.amount * 4) / 30;
  if (r.frequency === "yearly") return s + r.amount / 365;
  return s + r.amount / 30;
}, 0);

const recurringDailyExpense = recurringItems.filter(r => r.type === "expense").reduce((s, r) => {
  if (r.frequency === "weekly") return s + (r.amount * 4) / 30;
  if (r.frequency === "yearly") return s + r.amount / 365;
  return s + r.amount / 30;
}, 0);

const generateProjection = (days: number): ForecastData => {
  const baseIncome = 127450;
  const baseExpenses = 84230;
  // Blend historical trend with recurring commitments
  const dailyIncome = (baseIncome / 30 + recurringDailyIncome) / 2 + recurringDailyIncome / 2;
  const dailyExpenses = (baseExpenses / 30 + recurringDailyExpense) / 2 + recurringDailyExpense / 2;
  let balance = 185000;
  const data: ForecastData["cashFlowData"] = [];

  for (let d = 1; d <= days; d++) {
    const variance = 1 + (Math.random() - 0.5) * 0.15;
    const incomeToday = dailyIncome * variance;
    const expenseToday = dailyExpenses * (1 + (Math.random() - 0.5) * 0.1);
    balance += incomeToday - expenseToday;
    const date = new Date();
    date.setDate(date.getDate() + d);
    data.push({
      day: `${date.getDate()}/${date.getMonth() + 1}`,
      balance: Math.round(balance),
      income: Math.round(incomeToday),
      expenses: Math.round(expenseToday),
    });
  }

  const projectedIncome = Math.round(dailyIncome * days * (1 + Math.random() * 0.05));
  const projectedExpenses = Math.round(dailyExpenses * days * (1 + Math.random() * 0.03));

  return {
    projectedIncome,
    projectedExpenses,
    projectedBalance: Math.round(balance),
    confidence: days === 30 ? 87 : days === 60 ? 74 : 62,
    cashFlowData: data,
    alerts: [
      { type: "warning", title: "Sazonalidade detectada", text: `Baseado no histórico, a receita tende a cair 12% nos próximos ${days} dias. Prepare reservas.` },
      { type: "info", title: "Recorrências mapeadas", text: `${recurringItems.length} transações recorrentes foram incluídas na projeção (R$ ${Math.round(recurringDailyIncome * 30).toLocaleString("pt-BR")} receita / R$ ${Math.round(recurringDailyExpense * 30).toLocaleString("pt-BR")} despesa mensal).` },
      ...(days >= 60 ? [{ type: "danger" as const, title: "Alerta de caixa", text: `Com a tendência atual, sua empresa pode enfrentar aperto de caixa em ${Math.round(45 + Math.random() * 20)} dias.` }] : []),
    ],
  };
};

const alertStyles: Record<string, string> = {
  warning: "border-yellow-500/20 bg-yellow-500/5",
  danger: "border-destructive/20 bg-destructive/5",
  info: "border-primary/20 bg-primary/5",
};

const alertIcons: Record<string, typeof TrendingUp> = {
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Brain,
};

export default function ForecastPage() {
  const [period, setPeriod] = useState<Period>(30);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  const generate = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setForecast(generateProjection(period));
      setLoading(false);
    }, 600);
  }, [period]);

  useEffect(() => { generate(); }, [generate]);

  const fetchAiAnalysis = async () => {
    if (!forecast) return;
    setAiLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Analise esta previsão financeira para ${period} dias e dê recomendações estratégicas em 3-4 parágrafos curtos:
- Receita projetada: R$ ${forecast.projectedIncome.toLocaleString("pt-BR")}
- Despesas projetadas: R$ ${forecast.projectedExpenses.toLocaleString("pt-BR")}
- Saldo projetado: R$ ${forecast.projectedBalance.toLocaleString("pt-BR")}
- Confiança: ${forecast.confidence}%
- Tendência: receita mensal atual R$ 127.450, despesas R$ 84.230
Foque em riscos, oportunidades e ações concretas.`
          }],
        }),
      });

      if (resp.status === 429) { toast.error("Limite excedido. Tente depois."); return; }
      if (resp.status === 402) { toast.error("Créditos insuficientes."); return; }
      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let text = "", buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) { text += c; setAiAnalysis(text); }
          } catch {}
        }
      }
    } catch { toast.error("Erro na análise AI."); } finally { setAiLoading(false); }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Previsão Financeira</h1>
          <p className="text-sm text-muted-foreground">Projeções baseadas em tendências e recorrências</p>
        </div>
        <Button variant="outline" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1.5 h-4 w-4" />}
          Recalcular
        </Button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {([30, 60, 90] as Period[]).map(p => (
          <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}>
            <Calendar className="mr-1.5 h-3.5 w-3.5" /> {p} dias
          </Button>
        ))}
      </div>

      {forecast && !loading && (
        <>
          {/* Projection KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Receita Projetada</p>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-primary">R$ {forecast.projectedIncome.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-muted-foreground mt-1">Próximos {period} dias</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Despesas Projetadas</p>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">R$ {forecast.projectedExpenses.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-muted-foreground mt-1">Próximos {period} dias</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Saldo Projetado</p>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <p className={`mt-2 text-2xl font-bold ${forecast.projectedBalance >= 0 ? "text-primary" : "text-destructive"}`}>
                R$ {forecast.projectedBalance.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Após {period} dias</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Confiança</p>
                <Target className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{forecast.confidence}%</p>
              <Progress value={forecast.confidence} className="mt-2 h-2" />
            </motion.div>
          </div>

          {/* Cash Flow Chart */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Projeção de Fluxo de Caixa — {period} dias</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecast.cashFlowData}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.floor(period / 8)} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                  <ReferenceLine y={185000} stroke="hsl(220, 9%, 70%)" strokeDasharray="4 4" label={{ value: "Saldo Atual", fontSize: 11, fill: "hsl(220, 9%, 46%)" }} />
                  <Area type="monotone" dataKey="balance" stroke="hsl(217, 91%, 60%)" fill="url(#balGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* AI Alerts */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Alertas da AI</h3>
              </div>
              <div className="space-y-3">
                {forecast.alerts.map((alert, i) => {
                  const Icon = alertIcons[alert.type] || Brain;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className={`rounded-lg border p-3 ${alertStyles[alert.type]}`}>
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{alert.text}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Deep Analysis */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Análise Estratégica AI</h3>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAiAnalysis} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Brain className="mr-1.5 h-3.5 w-3.5" />}
                {aiAnalysis ? "Reanalisar" : "Gerar Análise"}
              </Button>
            </div>
            {aiAnalysis ? (
              <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{aiAnalysis}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Clique em "Gerar Análise" para a AI avaliar sua previsão financeira e recomendar ações estratégicas.</p>
            )}
          </div>
        </>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">Calculando projeções para {period} dias...</p>
        </div>
      )}
    </div>
  );
}
