import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FinancialSummary } from "@/hooks/useFinancialData";
import { useMemo } from "react";

export default function ProgressTrackingCard({ data }: { data: FinancialSummary }) {
  const metrics = useMemo(() => {
    if (!data || data.transactions.length === 0) return null;

    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();

    const thisMonthTx = data.transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === cm && d.getFullYear() === cy;
    });
    const prevMonthTx = data.transactions.filter((t) => {
      const d = new Date(t.date);
      const pm = cm === 0 ? 11 : cm - 1;
      const py = cm === 0 ? cy - 1 : cy;
      return d.getMonth() === pm && d.getFullYear() === py;
    });

    const curRev = thisMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const prevRev = prevMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const curExp = thisMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const prevExp = prevMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    const curProfit = curRev - curExp;
    const prevProfit = prevRev - prevExp;

    const profitChange = prevProfit !== 0 ? ((curProfit - prevProfit) / Math.abs(prevProfit)) * 100 : 0;
    const expenseChange = prevExp !== 0 ? ((curExp - prevExp) / prevExp) * 100 : 0;

    // Health score
    let score = 50;
    if (data.profitMargin > 30) score += 20;
    else if (data.profitMargin > 15) score += 10;
    if (curRev > curExp * 1.3) score += 15;
    if (data.recurringIncome > curRev * 0.3) score += 10;
    if (data.expensesByCategory.length > 0) score += 5;
    score = Math.min(100, Math.max(0, score));

    return [
      {
        label: "Lucro",
        value: `R$ ${curProfit.toLocaleString("pt-BR")}`,
        change: profitChange,
        progress: Math.min(100, Math.max(0, data.profitMargin)),
        color: profitChange >= 0 ? "text-primary" : "text-destructive",
      },
      {
        label: "Despesas",
        value: `R$ ${curExp.toLocaleString("pt-BR")}`,
        change: -expenseChange, // inverted: reduction is positive
        progress: prevExp > 0 ? Math.min(100, (curExp / prevExp) * 100) : 50,
        color: expenseChange <= 0 ? "text-primary" : "text-destructive",
      },
      {
        label: "Saúde Financeira",
        value: `${score}/100`,
        change: 0,
        progress: score,
        color: score >= 60 ? "text-primary" : "text-destructive",
      },
    ];
  }, [data]);

  if (!metrics) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Progresso Mensal</h3>
      </div>
      <div className="space-y-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground">{m.value}</span>
                {m.change !== 0 && (
                  <span className={`flex items-center text-[10px] font-medium ${m.color}`}>
                    {m.change > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {Math.abs(m.change).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <Progress value={m.progress} className="h-2" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
