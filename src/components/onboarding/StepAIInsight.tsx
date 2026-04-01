import { Sparkles, TrendingUp, ShieldAlert, Lightbulb } from "lucide-react";
import type { OnboardingTransaction } from "./StepFirstTransaction";

interface Props {
  transactions: OnboardingTransaction[];
  goals: string[];
  revenue: string;
  industry: string;
}

export default function StepAIInsight({ transactions, goals, revenue, industry }: Props) {
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expenses;
  const margin = income > 0 ? (balance / income) * 100 : 0;

  const insights: { icon: typeof Sparkles; title: string; text: string; color: string; bg: string }[] = [];

  // Profit analysis
  if (income > 0) {
    if (margin > 20) {
      insights.push({
        icon: TrendingUp,
        title: "Margem saudável",
        text: `Sua margem de ${margin.toFixed(0)}% está acima da média. Continue otimizando para manter esse desempenho.`,
        color: "text-emerald-600",
        bg: "bg-emerald-500/10",
      });
    } else if (margin > 0) {
      insights.push({
        icon: ShieldAlert,
        title: "Margem apertada",
        text: `Sua margem de ${margin.toFixed(0)}% está baixa. Identifique custos que podem ser reduzidos para aumentar sua lucratividade.`,
        color: "text-amber-600",
        bg: "bg-amber-500/10",
      });
    } else {
      insights.push({
        icon: ShieldAlert,
        title: "Atenção: prejuízo",
        text: `Suas despesas superam suas receitas. Revise seus custos operacionais com urgência.`,
        color: "text-red-500",
        bg: "bg-red-500/10",
      });
    }
  }

  // Expense categories
  const expenseCats = transactions.filter((t) => t.type === "expense");
  if (expenseCats.length > 0) {
    const topCat = expenseCats.sort((a, b) => Number(b.amount) - Number(a.amount))[0];
    insights.push({
      icon: Lightbulb,
      title: "Maior gasto identificado",
      text: `"${topCat.description}" é seu maior custo (R$ ${Number(topCat.amount).toLocaleString("pt-BR")}). Avalie se há como negociar ou otimizar.`,
      color: "text-primary",
      bg: "bg-primary/10",
    });
  }

  // Goal-based insight
  if (goals.includes("scale-business")) {
    insights.push({
      icon: Sparkles,
      title: "Dica para escalar",
      text: `Para escalar no setor de ${industry || "seu mercado"}, considere investir em automação e recorrência de receita.`,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    });
  } else if (goals.includes("reduce-costs")) {
    insights.push({
      icon: Sparkles,
      title: "Redução de custos",
      text: `Analise contratos recorrentes e negocie prazos e preços. Empresas do seu porte costumam economizar até 15%.`,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: Sparkles,
      title: "Pronto para começar!",
      text: "Adicione mais transações para que a IA gere insights cada vez mais precisos sobre seu negócio.",
      color: "text-primary",
      bg: "bg-primary/10",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Sua primeira análise AI</p>
          <p className="text-xs text-muted-foreground">Baseada nos dados que você informou</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${insight.bg}`}>
                  <Icon className={`h-4 w-4 ${insight.color}`} />
                </div>
                <p className={`text-sm font-semibold ${insight.color}`}>{insight.title}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
        <p className="text-xs text-primary text-center font-medium">
          ✨ Quanto mais dados você adicionar, mais inteligente a Contuit fica.
        </p>
      </div>
    </div>
  );
}
