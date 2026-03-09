import { Brain, TrendingUp, AlertTriangle, Lightbulb, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const reportData = {
  month: "Fevereiro 2026",
  summary: {
    revenue: "R$ 135.200",
    expenses: "R$ 88.450",
    profit: "R$ 46.750",
    profitMargin: "34.6%",
    healthScore: 94,
  },
  insights: [
    {
      type: "success" as const,
      icon: TrendingUp,
      title: "Receita em crescimento",
      text: "Sua receita cresceu 6.1% em relação ao mês anterior. O segmento de consultoria foi responsável por 45% desse crescimento.",
    },
    {
      type: "warning" as const,
      icon: AlertTriangle,
      title: "Custos com marketing elevados",
      text: "Seus gastos com marketing aumentaram 40% mas a receita só cresceu 10%. Considere otimizar suas campanhas e testar novos canais com menor CAC.",
    },
    {
      type: "info" as const,
      icon: Lightbulb,
      title: "Oportunidade de precificação",
      text: "Seus concorrentes no segmento cobram em média 12% a mais. Você pode aumentar seus preços em 7% sem impacto significativo na taxa de conversão.",
    },
    {
      type: "success" as const,
      icon: Brain,
      title: "Previsão de fluxo de caixa",
      text: "Com base nos contratos atuais e na sazonalidade, sua empresa terá R$ 210.000 em caixa nos próximos 90 dias. Posição confortável para investir.",
    },
  ],
  recommendations: [
    "Renegociar contrato de aluguel — benchmark indica 15% acima do mercado",
    "Considerar contratação de um estagiário para suporte — margem permite expansão",
    "Implementar cobrança automática para reduzir inadimplência em 22%",
    "Migrar 3 assinaturas de software para planos anuais — economia de R$ 4.800/ano",
  ],
  risks: [
    { risk: "Concentração de receita: 65% vem de 3 clientes", severity: "high" },
    { risk: "Inadimplência de R$ 8.200 acumulada nos últimos 60 dias", severity: "medium" },
    { risk: "Custo com fornecedores subiu 8% no trimestre", severity: "low" },
  ],
};

const typeStyles = {
  success: "border-primary/20 bg-primary/5",
  warning: "border-yellow-500/20 bg-yellow-500/5",
  info: "border-accent/20 bg-accent/5",
};

const severityStyles = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-yellow-500/10 text-yellow-600",
  low: "bg-muted text-muted-foreground",
};

export default function MonthlyReportPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatório Mensal AI</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {reportData.month}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-1 h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Receita", value: reportData.summary.revenue },
          { label: "Despesas", value: reportData.summary.expenses },
          { label: "Lucro", value: reportData.summary.profit },
          { label: "Margem", value: reportData.summary.profitMargin },
          { label: "Saúde Financeira", value: `${reportData.summary.healthScore}/100` },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-xl font-bold text-foreground">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" /> Insights da AI
        </h2>
        {reportData.insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl border p-5 ${typeStyles[insight.type]}`}
          >
            <div className="flex items-start gap-3">
              <insight.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" /> Recomendações Estratégicas
        </h2>
        <ul className="space-y-3">
          {reportData.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Risks */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" /> Alertas de Risco
        </h2>
        <div className="space-y-3">
          {reportData.risks.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <p className="text-sm text-foreground">{r.risk}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${severityStyles[r.severity as keyof typeof severityStyles]}`}>
                {r.severity === "high" ? "Alto" : r.severity === "medium" ? "Médio" : "Baixo"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
