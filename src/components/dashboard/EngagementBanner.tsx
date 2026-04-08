import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinancialSummary } from "@/hooks/useFinancialData";
import { useMemo, useState } from "react";

export default function EngagementBanner({ data }: { data: FinancialSummary }) {
  const [dismissed, setDismissed] = useState(false);

  const message = useMemo(() => {
    if (!data) return null;

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

    if (data.transactions.length === 0) {
      return {
        title: `${greeting}! 👋`,
        text: "Adicione sua primeira transação para desbloquear insights financeiros personalizados.",
        cta: "Adicionar Transação",
        link: "/dashboard/transactions",
      };
    }

    if (data.profitMargin > 20) {
      return {
        title: `${greeting}! Sua empresa está saudável 💪`,
        text: `Margem de ${data.profitMargin.toFixed(0)}%. Novos insights e oportunidades te esperam.`,
        cta: "Ver Insights",
        link: "/dashboard/advisor",
      };
    }

    if (data.totalExpenses > data.totalRevenue * 0.9) {
      return {
        title: `${greeting}! Atenção ao caixa ⚠️`,
        text: "Despesas muito próximas da receita. Veja sugestões para melhorar.",
        cta: "Ver Sugestões",
        link: "/dashboard/cash-flow",
      };
    }

    return {
      title: `${greeting}! Novidades para você ✨`,
      text: "Novos insights foram gerados com base nos seus dados mais recentes.",
      cta: "Explorar",
      link: "/dashboard/advisor",
    };
  }, [data]);

  if (!message || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4 flex items-center gap-4"
    >
      <Sparkles className="h-6 w-6 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{message.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{message.text}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="hero" size="sm" asChild>
          <a href={message.link}>{message.cta} <ArrowRight className="ml-1 h-3.5 w-3.5" /></a>
        </Button>
        <button onClick={() => setDismissed(true)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>
    </motion.div>
  );
}
