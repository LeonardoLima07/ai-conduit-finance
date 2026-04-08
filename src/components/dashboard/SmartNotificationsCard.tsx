import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, TrendingDown, TrendingUp, DollarSign, X } from "lucide-react";
import { FinancialSummary } from "@/hooks/useFinancialData";

interface Notification {
  id: string;
  type: "warning" | "danger" | "opportunity";
  icon: typeof Bell;
  title: string;
  text: string;
}

const typeStyles = {
  warning: "border-yellow-500/20 bg-yellow-500/5",
  danger: "border-destructive/20 bg-destructive/5",
  opportunity: "border-primary/20 bg-primary/5",
};

export default function SmartNotificationsCard({ data }: { data: FinancialSummary }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!data || data.transactions.length === 0) return;

    const notifs: Notification[] = [];

    // Unusual expense detection — category spike vs average
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const prevMonthTx = data.transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && (d.getMonth() === thisMonth - 1 || (thisMonth === 0 && d.getMonth() === 11)) && (thisMonth === 0 ? d.getFullYear() === thisYear - 1 : d.getFullYear() === thisYear);
    });
    const prevCatMap = new Map<string, number>();
    prevMonthTx.forEach((t) => prevCatMap.set(t.category, (prevCatMap.get(t.category) || 0) + t.amount));

    data.expensesByCategory.forEach((cat) => {
      const prev = prevCatMap.get(cat.name) || 0;
      if (prev > 0 && cat.value > prev * 1.25) {
        const pct = Math.round(((cat.value - prev) / prev) * 100);
        notifs.push({
          id: `spike-${cat.name}`,
          type: "warning",
          icon: AlertTriangle,
          title: `${cat.name} subiu ${pct}%`,
          text: `Despesa com ${cat.name} aumentou de R$ ${prev.toLocaleString("pt-BR")} para R$ ${cat.value.toLocaleString("pt-BR")} este mês.`,
        });
      }
    });

    // Cash flow risk
    if (data.totalExpenses > data.totalRevenue * 0.95) {
      notifs.push({
        id: "cashflow-risk",
        type: "danger",
        icon: TrendingDown,
        title: "Risco de fluxo de caixa",
        text: "Suas despesas estão muito próximas da receita. Considere reduzir custos ou aumentar vendas.",
      });
    }

    // Growth opportunity
    if (data.profitMargin > 20 && data.recurringIncome > 0) {
      notifs.push({
        id: "growth-opp",
        type: "opportunity",
        icon: TrendingUp,
        title: "Oportunidade de crescimento",
        text: `Margem de ${data.profitMargin.toFixed(0)}% e receita recorrente sólida. Momento ideal para investir em crescimento.`,
      });
    }

    // Low recurring revenue
    if (data.totalRevenue > 0 && data.recurringIncome < data.totalRevenue * 0.2) {
      notifs.push({
        id: "low-recurring",
        type: "opportunity",
        icon: DollarSign,
        title: "Aumente receita recorrente",
        text: "Menos de 20% da receita é recorrente. Planos de assinatura ou contratos mensais podem estabilizar o caixa.",
      });
    }

    setNotifications(notifs);
  }, [data]);

  const visible = notifications.filter((n) => !dismissed.has(n.id));

  if (visible.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Alertas Inteligentes</h3>
        <span className="ml-auto text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{visible.length} novo{visible.length > 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-2.5">
        <AnimatePresence>
          {visible.slice(0, 4).map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg border p-3 ${typeStyles[n.type]}`}
            >
              <div className="flex items-start gap-2">
                <n.icon className="h-4 w-4 mt-0.5 shrink-0 text-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{n.text}</p>
                </div>
                <button onClick={() => setDismissed((s) => new Set(s).add(n.id))} className="shrink-0 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
