import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";

interface UpgradePromptProps {
  feature: string;
  requiredPlan: string;
  description?: string;
}

export function UpgradePrompt({ feature, requiredPlan, description }: UpgradePromptProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {feature} não disponível no seu plano
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {description || `Este recurso está disponível a partir do plano ${requiredPlan}. Faça upgrade para desbloquear todas as funcionalidades.`}
      </p>
      <Button variant="hero" asChild>
        <Link to="/pricing" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Ver Planos
        </Link>
      </Button>
    </div>
  );
}

export function TransactionLimitBanner({ used, limit }: { used: number; limit: number }) {
  const percentage = Math.round((used / limit) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= limit;

  if (!isNearLimit) return null;

  return (
    <div className={`rounded-xl border p-4 mb-6 ${isAtLimit ? "border-destructive/40 bg-destructive/5" : "border-primary/20 bg-primary/5"}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isAtLimit ? "Limite de transações atingido" : "Você está quase no limite"}
          </p>
          <p className="text-xs text-muted-foreground">
            {used}/{limit} transações usadas este mês
          </p>
        </div>
        <Button variant="hero" size="sm" asChild>
          <Link to="/pricing" className="flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Upgrade
          </Link>
        </Button>
      </div>
      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isAtLimit ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
