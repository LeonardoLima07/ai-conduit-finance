import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, ArrowUpRight, ArrowDownRight, Brain, Loader2, DollarSign, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useFinancialData } from "@/hooks/useFinancialData";

interface PlanResult {
  requiredRevenue: number;
  idealExpenseLimit: number;
  revenueGap: number;
  expenseReduction: number;
  profitGap: number;
  targetMargin: number;
}

const roadmapSteps = [
  { icon: TrendingUp, label: "Aumentar receita", desc: "Novos clientes, upsell, revisão de preços" },
  { icon: ArrowDownRight, label: "Otimizar despesas", desc: "Renegociar contratos, cortar desperdícios" },
  { icon: DollarSign, label: "Ajustar pricing", desc: "Alinhar preços à margem-alvo" },
  { icon: Target, label: "Monitorar meta", desc: "Acompanhar progresso mensal no dashboard" },
];

export default function ProfitPlannerPage() {
  const { data, isLoading: dataLoading } = useFinancialData();
  const [targetInput, setTargetInput] = useState("");
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [targetProfit, setTargetProfit] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const currentRevenue = data?.totalRevenue ?? 0;
  const currentExpenses = data?.totalExpenses ?? 0;
  const currentProfit = currentRevenue - currentExpenses;
  const currentMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;

  const calculatePlan = (target: number): PlanResult => {
    const profitGap = target - currentProfit;
    const revenueGrowthNeeded = profitGap * 0.6;
    const expenseCutNeeded = profitGap * 0.4;
    const requiredRevenue = currentRevenue + Math.max(0, revenueGrowthNeeded);
    const idealExpenseLimit = currentExpenses - Math.max(0, expenseCutNeeded);
    const targetMargin = requiredRevenue > 0 ? (target / requiredRevenue) * 100 : 0;
    return {
      requiredRevenue,
      idealExpenseLimit: Math.max(idealExpenseLimit, currentExpenses * 0.7),
      revenueGap: Math.max(0, revenueGrowthNeeded),
      expenseReduction: Math.max(0, Math.min(expenseCutNeeded, currentExpenses * 0.3)),
      profitGap,
      targetMargin,
    };
  };

  const handleSetTarget = () => {
    const value = parseFloat(targetInput);
    if (!value || value <= 0) { toast.error("Insira um valor válido."); return; }
    setTargetProfit(value);
    setPlan(calculatePlan(value));
    setAiAnalysis("");
    toast.success("Meta de lucro definida!");
  };

  const fetchAiStrategy = useCallback(async () => {
    if (!plan || !data) return;
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
            content: `O usuário definiu uma meta de lucro mensal de R$ ${targetProfit.toLocaleString("pt-BR")}.

Dados reais:
- Receita atual: R$ ${currentRevenue.toLocaleString("pt-BR")}
- Despesas atuais: R$ ${currentExpenses.toLocaleString("pt-BR")}
- Lucro atual: R$ ${currentProfit.toLocaleString("pt-BR")}
- Margem atual: ${currentMargin.toFixed(1)}%
- Gap de lucro: R$ ${plan.profitGap.toLocaleString("pt-BR")}
- Receita necessária: R$ ${plan.requiredRevenue.toLocaleString("pt-BR")}
- Limite ideal de despesas: R$ ${plan.idealExpenseLimit.toLocaleString("pt-BR")}
- Categorias de despesa: ${data.expensesByCategory.map(c => `${c.name}: R$ ${c.value.toLocaleString("pt-BR")}`).join(", ")}
- Setor: ${data.industry}

Crie um plano estratégico com:
1. **Estratégias de crescimento de receita** (3 ações concretas com estimativa de impacto)
2. **Ajustes de pricing recomendados**
3. **Otimizações de despesas** (itens específicos)
4. **Timeline sugerido**
5. **Riscos e mitigações**

Seja específico, use números e percentuais.`
          }],
        }),
      });

      if (resp.status === 429) { toast.error("Limite excedido."); return; }
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
  }, [plan, targetProfit, data]);

  if (dataLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const progressPercent = plan ? Math.min(100, Math.max(0, (currentProfit / targetProfit) * 100)) : 0;
  const isTargetMet = plan && currentProfit >= targetProfit;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Planejador de Meta de Lucro</h1>
        <p className="text-sm text-muted-foreground">Defina sua meta e receba um plano estratégico baseado nos seus dados reais</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Defina sua Meta de Lucro Mensal</h3>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
            <Label>Quanto você quer lucrar por mês? (R$)</Label>
            <Input type="number" placeholder="Ex: 60000" value={targetInput} onChange={e => setTargetInput(e.target.value)} className="text-lg" />
          </div>
          <Button variant="hero" onClick={handleSetTarget} className="h-10">
            <Target className="mr-1.5 h-4 w-4" /> Calcular Plano
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Lucro atual: <span className="font-medium text-primary">R$ {currentProfit.toLocaleString("pt-BR")}</span> /mês
          {currentMargin > 0 && <> (margem de {currentMargin.toFixed(1)}%)</>}
        </p>
      </motion.div>

      {plan && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-medium text-muted-foreground">Lucro Atual</p>
              <p className="mt-1 text-2xl font-bold text-foreground">R$ {currentProfit.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-muted-foreground mt-1">Margem {currentMargin.toFixed(1)}%</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-medium text-muted-foreground">Meta de Lucro</p>
              <p className="mt-1 text-2xl font-bold text-primary">R$ {targetProfit.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-muted-foreground mt-1">Margem-alvo {plan.targetMargin.toFixed(1)}%</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-medium text-muted-foreground">Gap para Meta</p>
              <p className={`mt-1 text-2xl font-bold ${plan.profitGap > 0 ? "text-destructive" : "text-primary"}`}>
                {plan.profitGap > 0 ? "+" : ""}R$ {Math.abs(plan.profitGap).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{plan.profitGap > 0 ? "Faltam para atingir" : "Meta superada!"}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-medium text-muted-foreground">Progresso</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{progressPercent.toFixed(0)}%</p>
              <Progress value={progressPercent} className="mt-2 h-2" />
            </motion.div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-primary" /> Requisitos Calculados
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Receita Necessária</p>
                    <p className="text-xs text-muted-foreground">Crescimento de R$ {plan.revenueGap.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">R$ {plan.requiredRevenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Limite de Despesas</p>
                    <p className="text-xs text-muted-foreground">Redução de R$ {plan.expenseReduction.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">R$ {plan.idealExpenseLimit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Margem-Alvo</p>
                    <p className="text-xs text-muted-foreground">Atual: {currentMargin.toFixed(1)}%</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-sm font-bold">{plan.targetMargin.toFixed(1)}%</Badge>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Roadmap para a Meta
              </h3>
              <div className="space-y-3">
                {roadmapSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <step.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                    <div className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center">
                      {isTargetMet ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Plano Estratégico AI</h3>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAiStrategy} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Brain className="mr-1.5 h-3.5 w-3.5" />}
                {aiAnalysis ? "Reanalisar" : "Gerar Plano Estratégico"}
              </Button>
            </div>
            {aiAnalysis ? (
              <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Clique em "Gerar Plano Estratégico" para a AI criar um plano baseado nos seus dados reais.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
