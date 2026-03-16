import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Scissors, Loader2, RefreshCw, TrendingDown, AlertTriangle, TrendingUp, Zap, DollarSign, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type InsightType = "success" | "warning" | "danger" | "info";

interface ExpenseInsight {
  type: InsightType;
  title: string;
  text: string;
  savingsEstimate?: string;
  category?: string;
}

interface AnalysisResult {
  totalSavingsPotential: string;
  riskLevel: "low" | "medium" | "high";
  insights: ExpenseInsight[];
}

const insightStyles: Record<InsightType, string> = {
  success: "border-primary/20 bg-primary/5",
  warning: "border-yellow-500/20 bg-yellow-500/5",
  danger: "border-destructive/20 bg-destructive/5",
  info: "border-accent/20 bg-accent/5",
};

const insightIcons: Record<InsightType, typeof TrendingUp> = {
  success: TrendingDown,
  warning: AlertTriangle,
  danger: ShieldAlert,
  info: Zap,
};

const riskColors: Record<string, string> = {
  low: "text-primary",
  medium: "text-yellow-500",
  high: "text-destructive",
};

const riskLabels: Record<string, string> = {
  low: "Baixo",
  medium: "Moderado",
  high: "Alto",
};

const fallbackResult: AnalysisResult = {
  totalSavingsPotential: "R$ 14.400/ano",
  riskLevel: "medium",
  insights: [
    { type: "warning", title: "Marketing +32%", text: "Suas despesas com marketing aumentaram 32% em relação ao mês anterior. Revise campanhas com baixo ROI.", savingsEstimate: "R$ 3.600/ano", category: "Marketing" },
    { type: "danger", title: "Assinaturas duplicadas", text: "Detectamos possíveis assinaturas de software redundantes. Consolidar ferramentas pode gerar economia.", savingsEstimate: "R$ 1.200/ano", category: "Software" },
    { type: "info", title: "Tendência de aluguel", text: "Custos com aluguel estão estáveis. Considere renegociar o contrato para travar o valor atual.", category: "Aluguel" },
    { type: "success", title: "Materiais otimizados", text: "Gastos com materiais reduziram 8% — boa gestão de compras. Mantenha o controle.", category: "Materiais" },
  ],
};

interface Props {
  expenseData?: { categories: { name: string; value: number }[]; total: number; previousTotal?: number };
}

export default function ExpenseOptimizationCard({ expenseData }: Props) {
  const [result, setResult] = useState<AnalysisResult>(fallbackResult);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/expense-analyzer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          expenses: expenseData || {
            categories: [
              { name: "Salários", value: 35000, previousValue: 34000 },
              { name: "Aluguel", value: 12000, previousValue: 12000 },
              { name: "Marketing", value: 15000, previousValue: 11400 },
              { name: "Software", value: 8500, previousValue: 7800 },
              { name: "Materiais", value: 5200, previousValue: 5650 },
              { name: "Outros", value: 8530, previousValue: 7200 },
            ],
            total: 84230,
            previousTotal: 78050,
            segment: "Tecnologia / Consultoria",
            employees: 8,
          },
        }),
      });
      if (resp.status === 429) { toast.error("Limite excedido. Tente novamente."); return; }
      if (resp.status === 402) { toast.error("Créditos insuficientes."); return; }
      if (resp.ok) {
        const data = await resp.json();
        if (data.insights) setResult(data);
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  }, [expenseData]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Otimização de Despesas</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={analyze} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-secondary/50">
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4 text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground">Economia Potencial</p>
            <p className="text-sm font-bold text-primary">{result.totalSavingsPotential}</p>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-[10px] text-muted-foreground">Risco</p>
          <p className={`text-sm font-bold ${riskColors[result.riskLevel] || "text-foreground"}`}>
            {riskLabels[result.riskLevel] || result.riskLevel}
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2.5">
        {loading && result === fallbackResult ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mb-2" />
            <p className="text-xs">Analisando despesas...</p>
          </div>
        ) : (
          result.insights.slice(0, 4).map((insight, i) => {
            const Icon = insightIcons[insight.type] || Zap;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-lg border p-3 ${insightStyles[insight.type] || insightStyles.info}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                      {insight.savingsEstimate && (
                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {insight.savingsEstimate}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{insight.text}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
