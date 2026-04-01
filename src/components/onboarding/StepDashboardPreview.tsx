import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from "lucide-react";
import type { OnboardingTransaction } from "./StepFirstTransaction";

interface Props {
  transactions: OnboardingTransaction[];
  companyName: string;
}

export default function StepDashboardPreview({ transactions, companyName }: Props) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expenses;
  const margin = income > 0 ? ((balance / income) * 100).toFixed(1) : "0";

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

  const cards = [
    { label: "Receita", value: fmt(income), icon: ArrowUpRight, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Despesas", value: fmt(expenses), icon: ArrowDownRight, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Saldo", value: fmt(balance), icon: Wallet, color: balance >= 0 ? "text-primary" : "text-red-500", bg: "bg-primary/10" },
    { label: "Margem", value: `${margin}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Prévia do seu dashboard com os dados que você acabou de informar.
      </p>

      {/* Company header */}
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">Empresa</p>
        <p className="text-base font-bold text-foreground">{companyName || "Sua Empresa"}</p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-border bg-card p-3 space-y-1">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${card.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Mini transaction list */}
      {transactions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Últimas transações</p>
          {transactions.slice(-4).map((tx, i) => (
            <div key={i} className="flex justify-between text-sm border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
              <div>
                <p className="text-foreground font-medium text-xs">{tx.description}</p>
                <p className="text-muted-foreground text-[10px]">{tx.category}</p>
              </div>
              <span className={`font-semibold text-xs ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                {tx.type === "income" ? "+" : "-"}{fmt(Number(tx.amount))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
