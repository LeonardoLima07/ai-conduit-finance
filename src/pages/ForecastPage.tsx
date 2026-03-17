import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Loader2, Brain, Calendar, DollarSign, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useFinancialData } from "@/hooks/useFinancialData";

type Period = 30 | 60 | 90;

interface ForecastData {
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  confidence: number;
  cashFlowData: { day: string; balance: number; income: number; expenses: number }[];
  alerts: { type: "warning" | "danger" | "info"; title: string; text: string }[];
}

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
  const { data, isLoading: dataLoading } = useFinancialData();
  const [period, setPeriod] = useState<Period>(30);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");

  // Build forecast from REAL data: historical averages + recurring commitments
  const generateProjection = useCallback((days: number): ForecastData | null => {
    if (!data) return null;

    const txs = data.transactions;
    // Calculate average daily income/expense from last 3 months of transaction data
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const recentTxs = txs.filter(t => new Date(t.date) >= threeMonthsAgo);

    const daysCovered = Math.max(1, Math.ceil((now.getTime() - threeMonthsAgo.getTime()) / (1000 * 60 * 60 * 24)));
    const histIncome = recentTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const histExpense = recentTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    // Recurring monthly amounts
    const recurringDailyIncome = data.recurringIncome / 30;
    const recurringDailyExpense = data.recurringExpense / 30;

    // Blend: 60% historical trend, 40% recurring base
    const historicalDailyIncome = histIncome / daysCovered;
    const historicalDailyExpense = histExpense / daysCovered;
    const dailyIncome = historicalDailyIncome * 0.6 + recurringDailyIncome * 0.4 || recurringDailyIncome;
    const dailyExpense = historicalDailyExpense * 0.6 + recurringDailyExpense * 0.4 || recurringDailyExpense;

    // Start balance from current month's balance
    let balance = data.profit > 0 ? data.profit * 3 : 10000; // rough estimate
    const chartData: ForecastData["cashFlowData"] = [];

    for (let d = 1; d <= days; d++) {
      const variance = 1 + (Math.sin(d * 0.3) * 0.08); // smoother variance than random
      const incomeToday = dailyIncome * variance;
      const expenseToday = dailyExpense * (1 + Math.cos(d * 0.2) * 0.05);
      balance += incomeToday - expenseToday;
      const date = new Date();
      date.setDate(date.getDate() + d);
      chartData.push({
        day: `${date.getDate()}/${date.getMonth() + 1}`,
        balance: Math.round(balance),
        income: Math.round(incomeToday),
        expenses: Math.round(expenseToday),
      });
    }

    const projectedIncome = Math.round(dailyIncome * days);
    const projectedExpenses = Math.round(dailyExpense * days);
    const dataPoints = recentTxs.length;

    // Confidence based on data quality
    const baseConfidence = days === 30 ? 85 : days === 60 ? 70 : 58;
    const dataBonus = Math.min(15, dataPoints / 2);
    const confidence = Math.min(95, Math.round(baseConfidence + dataBonus));

    const alerts: ForecastData["alerts"] = [];
    if (dailyExpense > dailyIncome) {
      alerts.push({ type: "danger", title: "Despesas maiores que receita", text: `Tendência atual mostra despesas diárias (R$ ${Math.round(dailyExpense).toLocaleString("pt-BR")}) superiores à receita (R$ ${Math.round(dailyIncome).toLocaleString("pt-BR")}). Atenção ao fluxo de caixa.` });
    }
    if (data.recurringExpense > data.recurringIncome * 1.5) {
      alerts.push({ type: "warning", title: "Despesas recorrentes altas", text: `Despesas fixas (R$ ${data.recurringExpense.toLocaleString("pt-BR")}/mês) representam ${Math.round(data.recurringExpense / (data.totalRevenue || 1) * 100)}% da receita.` });
    }
    alerts.push({ type: "info", title: "Base de dados", text: `Projeção baseada em ${dataPoints} transações dos últimos 3 meses e ${data.recurringTransactions.filter(r => r.isActive).length} recorrências ativas.` });

    return {
      projectedIncome,
      projectedExpenses,
      projectedBalance: Math.round(balance),
      confidence,
      cashFlowData: chartData,
      alerts,
    };
  }, [data]);

  const generate = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setForecast(generateProjection(period));
      setLoading(false);
    }, 300);
  }, [period, generateProjection]);

  useEffect(() => { if (data) generate(); }, [data, generate]);

  const fetchAiAnalysis = async () => {
    if (!forecast || !data) return;
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
- Receita mensal atual: R$ ${data.totalRevenue.toLocaleString("pt-BR")}
- Despesas mensais atuais: R$ ${data.totalExpenses.toLocaleString("pt-BR")}
- Recorrência mensal: R$ ${data.recurringIncome.toLocaleString("pt-BR")} receita / R$ ${data.recurringExpense.toLocaleString("pt-BR")} despesa
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

  if (dataLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Previsão Financeira</h1>
          <p className="text-sm text-muted-foreground">Projeções baseadas em seus dados reais e recorrências</p>
        </div>
        <Button variant="outline" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1.5 h-4 w-4" />}
          Recalcular
        </Button>
      </div>

      <div className="flex gap-2">
        {([30, 60, 90] as Period[]).map(p => (
          <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}>
            <Calendar className="mr-1.5 h-3.5 w-3.5" /> {p} dias
          </Button>
        ))}
      </div>

      {forecast && !loading && (
        <>
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
                  <Area type="monotone" dataKey="balance" stroke="hsl(217, 91%, 60%)" fill="url(#balGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

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
              <p className="text-sm text-muted-foreground">Clique em "Gerar Análise" para a AI avaliar sua previsão financeira com base nos seus dados reais.</p>
            )}
          </div>
        </>
      )}

      {(loading || (!forecast && !dataLoading)) && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">Calculando projeções para {period} dias...</p>
        </div>
      )}
    </div>
  );
}
