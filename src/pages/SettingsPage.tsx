import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Crown, Sparkles, Check } from "lucide-react";
import { useSubscription, PLANS, type PlanType } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

const planOrder: PlanType[] = ["free", "business", "pro", "master"];

export default function SettingsPage() {
  const { user } = useAuth();
  const { plan, planType, transactionsUsed, transactionsLimit, subscription } = useSubscription();

  const currentIndex = planOrder.indexOf(planType);

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie sua conta e assinatura</p>
      </div>

      {/* Profile */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Perfil</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input defaultValue={user?.user_metadata?.full_name ?? ""} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Notifications */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
        <div className="space-y-4">
          {[
            { label: "Lembretes de faturas", desc: "Notificações sobre faturas vencidas" },
            { label: "Insights de IA", desc: "Receber recomendações geradas por IA" },
            { label: "Alertas de fluxo de caixa", desc: "Alerta quando o saldo cair abaixo do limite" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Billing & Plan */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Plano & Faturamento</h2>
        </div>

        {/* Current Plan Card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{plan.label}</p>
                <Badge variant="secondary" className="text-xs">{plan.price}</Badge>
              </div>
              {subscription && (
                <p className="text-xs text-muted-foreground mt-1">
                  Próxima renovação: {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
            <Button variant="hero" size="sm" asChild>
              <Link to="/pricing" className="flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                {planType === "master" ? "Gerenciar" : "Upgrade"}
              </Link>
            </Button>
          </div>

          {/* Transaction Usage */}
          {transactionsLimit && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Transações este mês</span>
                <span>{transactionsUsed}/{transactionsLimit}</span>
              </div>
              <Progress value={(transactionsUsed / transactionsLimit) * 100} className="h-2" />
            </div>
          )}
        </div>

        {/* Feature Comparison */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Recursos do seu plano</p>
          <div className="grid gap-2">
            {Object.entries(plan.features).map(([key, enabled]) => {
              const labels: Record<string, string> = {
                advancedReports: "Relatórios avançados",
                forecast: "Previsão financeira",
                aiAdvisor: "AI Advisor",
                expenseAnalysis: "Análise de despesas",
                profitPlanner: "Meta de lucro",
                personalizedAI: "IA personalizada",
                strategicInsights: "Insights estratégicos",
              };
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full ${enabled ? "bg-primary/10" : "bg-muted"}`}>
                    <Check className={`h-3 w-3 ${enabled ? "text-primary" : "text-muted-foreground/40"}`} />
                  </div>
                  <span className={`text-sm ${enabled ? "text-foreground" : "text-muted-foreground line-through"}`}>
                    {labels[key] || key}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upgrade Nudge for non-master */}
        {currentIndex < 3 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">
              Desbloqueie mais recursos com o plano {PLANS[planOrder[currentIndex + 1]].label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Por apenas {PLANS[planOrder[currentIndex + 1]].price}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="hero">Salvar Alterações</Button>
      </div>
    </div>
  );
}
