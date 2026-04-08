import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, Scissors, TrendingUp, Tag, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinancialSummary } from "@/hooks/useFinancialData";
import { useMemo } from "react";
import { Link } from "react-router-dom";

interface Action {
  icon: typeof Lightbulb;
  text: string;
  link: string;
  priority: "high" | "medium" | "low";
}

const priorityStyles = {
  high: "border-destructive/20 bg-destructive/5",
  medium: "border-yellow-500/20 bg-yellow-500/5",
  low: "border-primary/20 bg-primary/5",
};

export default function ActionSuggestionsCard({ data }: { data: FinancialSummary }) {
  const actions = useMemo(() => {
    if (!data || data.transactions.length === 0) return [];

    const list: Action[] = [];

    // Highest expense category
    if (data.expensesByCategory.length > 0) {
      const top = data.expensesByCategory[0];
      const pct = data.totalExpenses > 0 ? ((top.value / data.totalExpenses) * 100).toFixed(0) : "0";
      list.push({
        icon: Scissors,
        text: `Reduza "${top.name}" — representa ${pct}% das despesas`,
        link: "/dashboard/transactions",
        priority: Number(pct) > 40 ? "high" : "medium",
      });
    }

    // Low margin
    if (data.profitMargin < 15 && data.totalRevenue > 0) {
      list.push({
        icon: TrendingUp,
        text: "Aumente seus preços — margem de lucro abaixo de 15%",
        link: "/dashboard/profit-planner",
        priority: "high",
      });
    }

    // Review categories
    if (data.expensesByCategory.length > 4) {
      list.push({
        icon: Tag,
        text: "Revise categorias — muitas categorias podem esconder gastos",
        link: "/dashboard/reports",
        priority: "low",
      });
    }

    // No forecast yet
    list.push({
      icon: BarChart3,
      text: "Gere uma previsão financeira para os próximos 90 dias",
      link: "/dashboard/forecast",
      priority: "medium",
    });

    return list.slice(0, 4);
  }, [data]);

  if (actions.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Ações Sugeridas</h3>
      </div>
      <div className="space-y-2">
        {actions.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={a.link} className={`flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary/50 ${priorityStyles[a.priority]}`}>
              <a.icon className="h-4 w-4 shrink-0 text-foreground" />
              <p className="text-xs text-foreground flex-1">{a.text}</p>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
